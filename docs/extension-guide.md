# Autobounds Companion VS Code Extension

## Overview
Autobounds Companion streamlines how you interact with the Autobounds CLI from Visual Studio Code. The extension automatically checks whether a local Autobounds binary is available, falls back to Docker when necessary, and exposes helper commands so you can get to a Python or Jupyter REPL quickly. Everything is surfaced through friendly notifications and a dedicated Autobounds output channel so you always know what the extension is doing.

## Installation
### From a packaged release
1. Download the latest `.vsix` artifact from the releases page or build one locally (see Development).
2. In VS Code press `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS), run `Extensions: Install from VSIX...`, and pick the file you downloaded.
3. Reload VS Code when prompted.

### From source
1. Clone the repository.
2. Run `npm install` to pull dependencies.
3. Run `npm run compile` to produce the JavaScript bundle under `out`.
4. Press `F5` in VS Code to start an Extension Development Host or run `code --extensionDevelopmentPath=...` manually.

## Quick Start
1. Open a workspace that contains your Autobounds projects.
2. If you have a local Autobounds binary, ensure it is on your `PATH` or configure `autobounds.path`.
3. Otherwise, verify Docker Desktop (or an equivalent Docker environment) is running so the extension can fall back to containers.
4. Use `Autobounds: Run Availability Check` from the Command Palette to confirm everything is wired up.

## Feature Highlights
- Automatic availability detection on startup with optional prompts to install requirements.
- Configurable execution mode (`auto`, `local`, `docker`) that respects your preferred workflow.
- One-click Docker image pulls so your containerized environment stays current.
- Integrated Python and Jupyter REPL launchers powered by Docker, including optional workspace mounts.
- Rich notifications and an output channel for visibility into subprocess logs and errors.

## Commands
| Command | Description |
| --- | --- |
| `Autobounds: Run Availability Check` | Re-runs the detector to decide between local and Docker execution and logs the result. |
| `Autobounds: Pull Docker Image` | Executes `docker pull` for the configured image and streams progress to the output channel. |
| `Autobounds: Open Python REPL` | Starts an interactive Python session inside the configured Docker image. The terminal is named "Autobounds Python REPL". |
| `Autobounds: Open Jupyter REPL` | Launches Jupyter Lab inside the configured Docker image, maps it to the chosen port, and offers to open a browser window. |

## Extension Settings
All settings live under the `autobounds` scope.
- `autobounds.executionMode`: `auto` (default) prefers the local binary but falls back to Docker. Force `local` or `docker` to pin a mode.
- `autobounds.path`: Absolute path to the Autobounds binary when the executable is not on your `PATH`.
- `autobounds.dockerImage`: Docker image tag to run in container mode. Defaults to `autobounds/autolab:latest`.
- `autobounds.jupyterPort`: Host port that maps to the Jupyter server when you launch the REPL. Defaults to `8888`.
- `autobounds.mountWorkspace`: Mount the first workspace folder into the container at `/workspace`. Disable if you prefer an ephemeral container.

## Docker REPL Workflow
1. Run `Autobounds: Pull Docker Image` once to ensure your image is available locally.
2. Launch either REPL command. The extension validates Docker availability and warns if the CLI is missing.
3. The extension overrides the Docker entrypoint (`python` or `jupyter`) so the expected interpreter starts even if the image defines a different default command.
4. For Jupyter containers that run as root, the extension adds `--allow-root` to keep Jupyter Lab from exiting early.
5. When starting Jupyter Lab, the extension prompts with the mapped URL so you can open it in a browser.
6. Adjust `autobounds.jupyterPort` if the default port conflicts with another service.

## Output and Notifications
The extension writes diagnostic information to the `Autobounds` Output channel. Use it to review:
- Success messages when a local binary is detected or Docker mode is selected.
- Full logs from `docker pull` operations.
- Errors when subprocesses fail or Docker is unavailable.
Notifications appear for critical issues and include quick actions, such as pulling the Docker image or opening the installation docs.

## Troubleshooting
- **Local binary not found**: Confirm `autobounds` resolves on your `PATH` or set `autobounds.path` to the absolute executable.
- **Docker unavailable**: Run `docker --version` in your terminal to verify installation. Restart Docker Desktop if needed.
- **Jupyter REPL not reachable**: Ensure the configured port is open and not blocked by a firewall. Re-run the command after closing lingering containers.
- **Jupyter container exits immediately**: Make sure you are running the latest extension build which starts Jupyter with `--allow-root`. Older builds may stop the container if it runs as root.
- **Repeated install prompts**: Choose "Ignore" when prompted if you do not want further reminders. You can clear the suppression from the extension's global state via `Developer: Open Extensions Folder` and removing the stored state file.

## Developing the Extension
- Run `npm install` after cloning to obtain dependencies.
- Use `npm run compile` for a one-time TypeScript build or `npm run watch` for incremental builds.
- Execute `npm run lint` to check coding standards.
- Launch the extension in a development host with `F5` for iterative testing.
- Package a distributable VSIX with `vsce package` (requires the `vsce` CLI installed globally).

## Support and Feedback
File issues or feature requests at https://github.com/autobounds/autobounds-vscode/issues. Contributions and feedback are welcome.
