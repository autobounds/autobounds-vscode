import { execFile } from 'child_process';
import { spawn } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';

const execFileAsync = promisify(execFile);

const SUPPRESS_PROMPT_KEY = 'autobounds:suppressInstallPrompt';

interface CheckOptions {
  suppressPrompt: boolean;
}

interface LocalCheckResult {
  available: boolean;
  version?: string;
  error?: Error;
}

export class AutoboundsDetector {
  private readonly context: vscode.ExtensionContext;
  private readonly output: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext, output: vscode.OutputChannel) {
    this.context = context;
    this.output = output;
  }

  public dispose(): void {
    // nothing to dispose yet
  }

  public async checkAvailability(options: CheckOptions): Promise<'local' | 'docker' | 'missing'> {
    const config = vscode.workspace.getConfiguration('autobounds');
    const executionMode = config.get<'auto' | 'local' | 'docker'>('executionMode', 'auto');
    const binaryPath = config.get<string>('path', '').trim();
    const dockerImage = config.get<string>('dockerImage', 'autobounds/autolab:latest').trim();

    const promptAllowed = !options.suppressPrompt && !this.isPromptSuppressed();

    const reportMissing = async (reason: string, detail?: Error) => {
      this.output.appendLine(`[Autobounds] ${reason}`);
      if (detail) {
        const postfix = detail.message ? detail.message : String(detail);
        this.output.appendLine(`[Autobounds] Details: ${postfix}`);
      }
      if (promptAllowed) {
        await this.promptForInstall();
      }
    };

    if (executionMode === 'local') {
      const localResult = await this.tryLocal(binaryPath || 'autobounds');
      if (localResult.available) {
        this.logLocalSuccess(localResult.version ?? 'unknown');
        return 'local';
      }

      await reportMissing('Autobounds binary not found in local mode.', localResult.error);
      return 'missing';
    }

    if (executionMode === 'docker') {
      const dockerAvailable = await this.validateDocker();
      if (dockerAvailable) {
        this.logDockerReady(dockerImage);
        return 'docker';
      }

      await reportMissing('Docker does not appear to be available.');
      return 'missing';
    }

    const localResult = await this.tryLocal(binaryPath || 'autobounds');
    if (localResult.available) {
      this.logLocalSuccess(localResult.version ?? 'unknown');
      return 'local';
    }

    const dockerAvailable = await this.validateDocker();
    if (dockerAvailable) {
      this.output.appendLine('[Autobounds] Falling back to Docker mode.');
      this.logDockerReady(dockerImage);
      return 'docker';
    }

    await reportMissing('Neither a local Autobounds binary nor Docker are available.', localResult.error);
    return 'missing';
  }

  public async pullDockerImage(): Promise<void> {
    const config = vscode.workspace.getConfiguration('autobounds');
    const dockerImage = config.get<string>('dockerImage', 'autobounds/autolab:latest').trim();

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Pulling ${dockerImage}`,
          cancellable: false,
        },
        () => this.runDockerPull(dockerImage)
      );
      this.output.appendLine(`[Autobounds] Docker image ${dockerImage} pulled successfully.`);
      void vscode.window.showInformationMessage(`Autobounds Docker image ${dockerImage} pulled successfully.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.output.appendLine(`[Autobounds] Failed to pull Docker image: ${message}`);
      void vscode.window.showErrorMessage(`Autobounds Docker pull failed: ${message}`);
    }
  }

  private async tryLocal(command: string): Promise<LocalCheckResult> {
    try {
      const { stdout, stderr } = await execFileAsync(command, ['--version'], { timeout: 5000 });
      const version = stdout.trim() || stderr.trim();
      return { available: true, version };
    } catch (error) {
      return { available: false, error: error as Error };
    }
  }

  private async validateDocker(): Promise<boolean> {
    try {
      await execFileAsync('docker', ['--version'], { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async runDockerPull(image: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn('docker', ['pull', image]);

      child.stdout.on('data', (data: Buffer) => {
        this.output.append(data.toString());
      });

      child.stderr.on('data', (data: Buffer) => {
        this.output.append(data.toString());
      });

      child.on('error', (error: Error) => {
        reject(error);
      });

      child.on('close', (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`docker pull exited with code ${code}`));
        }
      });
    });
  }

  private async promptForInstall(): Promise<void> {
    const selection = await vscode.window.showWarningMessage(
      'Autobounds is not available locally. You can install it or run via Docker.',
      'Install via Docker',
      'Open Install Docs',
      'Ignore'
    );

    if (selection === 'Install via Docker') {
      await this.pullDockerImage();
    } else if (selection === 'Open Install Docs') {
      const docsUrl = vscode.Uri.parse('https://github.com/autobounds/autobounds#installation');
      await vscode.env.openExternal(docsUrl);
    } else if (selection === 'Ignore') {
      await this.context.workspaceState.update(SUPPRESS_PROMPT_KEY, true);
    }
  }

  private logLocalSuccess(version: string): void {
    this.output.appendLine(`[Autobounds] Local binary detected (version: ${version}).`);
  }

  private logDockerReady(image: string): void {
    this.output.appendLine(`[Autobounds] Docker is available. Using image ${image}.`);
  }

  private isPromptSuppressed(): boolean {
    return this.context.workspaceState.get<boolean>(SUPPRESS_PROMPT_KEY, false);
  }
}
