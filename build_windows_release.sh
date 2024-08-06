export RUSTFLAGS="--remap-path-prefix $HOME=~"
cargo build --target x86_64-pc-windows-gnu --release