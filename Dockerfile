# Stage 1: Node.js environment for building the frontend
FROM node:20 AS node-build

WORKDIR /frontend

COPY ./frontend/package.json ./frontend/package-lock.json .
RUN npm install

# Then copy the rest of the frontend source and build it
COPY ./frontend/ .
RUN npm run build

# Stage 2: Rust environment for building the backend
FROM rust:latest AS rust-build

RUN apt-get update \
    && apt-get install -y mingw-w64 \
    && rustup target add x86_64-pc-windows-gnu

WORKDIR /project

# Build dependencies first so they can be cached
COPY dummy.rs .
COPY Cargo.toml .
RUN sed -i 's#src/main.rs#dummy.rs#' Cargo.toml
RUN cargo build --release --target x86_64-pc-windows-gnu
RUN sed -i 's#dummy.rs#src/main.rs#' Cargo.toml


COPY . .

COPY --from=node-build /frontend/dist /project/frontend/dist
RUN rm -rf public && mkdir public && cp -r ./frontend/dist/* public/

RUN cargo build --release --target x86_64-pc-windows-gnu

# Export final binary
FROM scratch AS winbinary
COPY --from=rust-build /project/target/x86_64-pc-windows-gnu/release/scoreboard-v2-rust.exe /bin/
ENTRYPOINT [ "/bin/scoreboard-v2-rust.exe" ]