use std::net::{Ipv4Addr, SocketAddrV4};
use std::collections::HashMap;
use std::sync::{
    atomic::{AtomicUsize, Ordering},
    Arc,
};

use futures_util::{SinkExt, StreamExt, TryFutureExt};
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{Message, WebSocket};
use warp::{Filter, Rejection, Reply};
use include_dir::{include_dir, Dir};

const INTERFACE: SocketAddrV4 = SocketAddrV4::new(Ipv4Addr::new(127, 0, 0, 1), 8000);
static PUBLIC_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/public");

static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
type Users = Arc<RwLock<HashMap<usize, mpsc::UnboundedSender<Message>>>>;

#[tokio::main]
async fn main() {
    let public = warp::path::tail().and_then(serve_embedded_file);

    let users = Users::default();
    let users = warp::any().map(move || users.clone());
    let wss = warp::path::end()
        .and(warp::ws())
        .and(users)
        .map(|ws: warp::ws::Ws, users| {
            ws.on_upgrade(move |socket| user_connected(socket, users))
        });

    let routes = warp::get().and(
        wss.or(public)
    );

    println!("Scoreboard started on http://{}", INTERFACE);
    println!("Add http://{}/view to OBS Browsercapture", INTERFACE);

    warp::serve(routes).run(INTERFACE).await;

}

async fn serve_embedded_file(path: warp::path::Tail) -> Result<impl Reply, Rejection> {
    let path = path.as_str();
    let path = if path.is_empty() { "index.html" } else { path };
    
    if let Some(file) = PUBLIC_DIR.get_file(path) {
        Ok(warp::reply::with_header(
            file.contents(),
            "Content-Type",
            mime_guess::from_path(path).first_or_else(|| mime_guess::mime::TEXT_HTML).to_string(),
        ))
    } else {
        let file = PUBLIC_DIR.get_file("index.html");

        match file {
            Some(file) => Ok(warp::reply::with_header(
                file.contents(),
                "Content-Type",
                mime_guess::mime::TEXT_HTML.to_string(),
            )),
            None => Err(warp::reject::not_found()),
        }
    }        
}

async fn user_connected(ws: WebSocket, users: Users) {
    let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);

    println!("New user: {}", my_id);

    let (mut user_ws_tx, mut user_ws_rx) = ws.split();

    let (tx, rx) = mpsc::unbounded_channel();
    let mut rx = UnboundedReceiverStream::new(rx);

    tokio::task::spawn(async move {
        while let Some(message) = rx.next().await {
            user_ws_tx
                .send(message)
                .unwrap_or_else(|e| {
                    eprintln!("websocket send error: {}", e);
                })
                .await;
        }
    });

    // Save connected user
    users.write().await.insert(my_id, tx);


    while let Some(result) = user_ws_rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("websocket error(uid={}): {}", my_id, e);
                break;
            }
        };
        user_message(my_id, msg, &users).await;
    }

    // user_ws_rx stream will keep processing as long as the user stays
    // connected. Once they disconnect, then...
    user_disconnected(my_id, &users).await;
}

async fn user_disconnected(my_id: usize, users: &Users) {
    eprintln!("Good bye user: {}", my_id);

    users.write().await.remove(&my_id);
}

async fn user_message(my_id: usize, msg: Message, users: &Users) {
    // Skip any non-Text messages...
    let msg = if let Ok(s) = msg.to_str() {
        s
    } else {
        return;
    };

    // New message from this user, send it to everyone else (except same uid)...
    for (&uid, tx) in users.read().await.iter() {
        if my_id != uid {
            let _ = tx.send(Message::text(msg));
        }
    }
}