use std::process::Command;
use std::fs;
use std::path::Path;
use std::env;

fn main() {
    if env::var("RUN_BUILD_RS").unwrap_or("true".to_string()) == "false" {
        std::process::exit(0); // dont build frontend
    }

    let frontend_path = Path::new("frontend");
    let dist_path = frontend_path.join("dist");
    let node_modules_path = frontend_path.join("node_modules");

    let public_path = Path::new("public");
    println!("cargo:rerun-if-changed=public/");

    if public_path.exists() {
        std::process::exit(0); // if public exists we want to use cached built frontend
    }

    if !node_modules_path.exists() {
        println!("`node_modules` not found. Running `npm install`...");
        let install_output = Command::new("npm")
            .args(&["install"])
            .current_dir(frontend_path)
            .output()
            .expect("Failed to run `npm install`");

        if !install_output.status.success() {
            eprintln!(
                "`npm install` failed:\n{}",
                String::from_utf8_lossy(&install_output.stderr)
            );
            std::process::exit(1);
        }
    }

    // Run `npm run build` in the `frontend` directory
    let output = Command::new("npm")
        .args(&["run", "build"])
        .current_dir(frontend_path)
        .output()
        .expect("Failed to run `npm run build`");

    if !output.status.success() {
        eprintln!(
            "`npm run build` failed:\n{}",
            String::from_utf8_lossy(&output.stderr)
        );
        std::process::exit(1);
    }

    println!("`npm run build` succeeded.");

    // Clear the destination public directory
    if public_path.exists() {
        fs::remove_dir_all(public_path).expect("Failed to clear `public` directory");
    }
    fs::create_dir_all(public_path).expect("Failed to create `public` directory");

    // Copy files from `dist` to `public`
    if dist_path.exists() {
        copy_dir_all(&dist_path, &public_path);
    } else {
        eprintln!("`dist` directory does not exist");
        std::process::exit(1);
    }
}

fn copy_dir_all(src: &Path, dst: &Path) {
    for entry in fs::read_dir(src).expect("Failed to read source directory") {
        let entry = entry.expect("Failed to read directory entry");
        let src_path = entry.path();
        let dst_path = dst.join(src_path.file_name().expect("Failed to get file name"));

        if src_path.is_dir() {
            fs::create_dir_all(&dst_path).expect("Failed to create directory in destination");
            copy_dir_all(&src_path, &dst_path);
        } else {
            fs::copy(&src_path, &dst_path).expect("Failed to copy file");
        }
    }
}
