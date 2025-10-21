# Autobounds Companion
GitHub repository: https://github.com/autobounds/autobounds-vscode

A lightweight VS Code extension that keeps your Autobounds tooling ready to go. It detects whether the local `autobounds` binary is available and can fall back to Docker automatically.

## Documentation

See [docs/extension-guide.md](docs/extension-guide.md) for the full usage guide.

## Features

- Automatic startup check for a local Autobounds installation.
- Optional Docker fallback with a configurable image tag.
- Quick command to pull or refresh the Autobounds Docker image.
- Launch an Autobounds Python or Jupyter REPL inside a Docker container directly from VS Code.
- Gentle reminder workflow with install docs and dismiss support.

## Requirements

- Local mode expects `autobounds` to be resolvable on your `PATH` or via the `autobounds.path` setting.
- Docker mode requires a working Docker CLI installation.

## Extension Settings

- `autobounds.executionMode`: choose between `auto`, `local`, or `docker` execution.
- `autobounds.path`: provide a custom path to the Autobounds executable.
- `autobounds.dockerImage`: set the Docker image used in Docker mode.

## Commands

- `Autobounds: Run Availability Check`: rerun detection at any time.
- `Autobounds: Pull Docker Image`: pulls the configured Autobounds Docker image.
- `Autobounds: Open Python REPL`: starts an interactive Python session in the configured Docker image.
- `Autobounds: Open Jupyter REPL`: launches a Jupyter Lab server (default port 8888) using the configured Docker image.

## Known Issues

The extension currently focuses on availability checks. Diagnostics, code actions, and Autobounds task runners will be added as the CLI surface stabilizes.

## Release Notes

### 0.0.1

Initial release with availability checks and Docker helpers.
