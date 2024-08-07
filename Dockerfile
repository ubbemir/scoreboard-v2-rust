# Stage 1: Node.js environment for building the frontend
FROM node:20 AS node-build

WORKDIR /frontend

COPY ./frontend/ .

RUN npm install

RUN npm run build

# Stage 2: Rust environment for building the backend
FROM rust:latest AS rust-build

RUN apt-get update \
    && apt-get install -y mingw-w64 \
    && rustup target add x86_64-pc-windows-gnu

WORKDIR /project

COPY --from=node-build /frontend/dist /project/frontend/dist
COPY . .

RUN rm -rf public && mkdir public && cp -r ./frontend/dist/* public/

RUN cargo build --release --target x86_64-pc-windows-gnu

# Export final binary
FROM scratch AS winbinary
COPY --from=rust-build /project/target/x86_64-pc-windows-gnu/release/scoreboard-v2-rust.exe /bin/
ENTRYPOINT [ "/bin/scoreboard-v2-rust.exe" ]