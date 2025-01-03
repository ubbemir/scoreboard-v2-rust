# Stage 1: Node.js environment for building the frontend
FROM node:20 AS node-build

WORKDIR /frontend

COPY ./frontend/package.json ./frontend/package-lock.json .
RUN npm install

# Then copy the rest of the frontend source and build it
COPY ./frontend/ .
RUN npm run build

# Stage 2: Rust environment for building the backend
FROM rust:latest AS rust-build-dependencies

RUN apt-get update \
    && apt-get install -y mingw-w64

RUN rustup toolchain install nightly \
    && rustup target add --toolchain nightly x86_64-pc-windows-gnu \
    && rustup component add rust-src --toolchain nightly

WORKDIR /project

# Build dependencies first so they can be cached
COPY dummy.rs .
COPY Cargo.toml .
COPY Cargo.lock .
RUN sed -i 's#src/main.rs#dummy.rs#' Cargo.toml
RUN RUN_BUILD_RS=false cargo +nightly build -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort \
    --release --target x86_64-pc-windows-gnu
RUN sed -i 's#dummy.rs#src/main.rs#' Cargo.toml


FROM rust-build-dependencies AS rust-build
COPY . .

COPY --from=node-build /frontend/dist /project/frontend/dist
RUN rm -rf public && mkdir public && cp -r ./frontend/dist/* public/

RUN RUN_BUILD_RS=false cargo +nightly build -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort \
    --release --target x86_64-pc-windows-gnu

# Export final binary
FROM scratch AS winbinary
COPY --from=rust-build /project/target/x86_64-pc-windows-gnu/release/scoreboard-v2-rust.exe /bin/
ENTRYPOINT [ "/bin/scoreboard-v2-rust.exe" ]