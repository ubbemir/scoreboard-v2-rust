# Scoreboard widget for OBS Browsercapture
A simple single binary application that hosts a web based scoreboard application that OBS Browsercapture can render.


# Usage:
## Building
### Using cargo:
```shell
cargo build --release
```

### Building Windows binary with docker:
```shell
./docker-build-win.sh
```
The resulting binary (.EXE) will be placed in ``bin/``

## Using the application
### Controller setup
When running the application a main URL will be outputted (for example ``http://127.0.0.1``), navigate your browser to that URL since that is where you control the scoreboard.

### OBS Setup
Add the URL ending with ``/view`` to OBS Browsercapture.
To customize the amount of scoreboard entries to be shown in the view (default is 3) you can append for example ``/view?max=5`` to make the top 5 entries be shown in OBS.
