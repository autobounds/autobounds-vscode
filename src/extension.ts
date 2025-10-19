import * as vscode from 'vscode';
import { AutoboundsDetector } from './services/autoboundsDetector';

let detector: AutoboundsDetector | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const outputChannel = vscode.window.createOutputChannel('Autobounds');
  context.subscriptions.push(outputChannel);

  detector = new AutoboundsDetector(context, outputChannel);

  context.subscriptions.push(
    vscode.commands.registerCommand('autobounds.runCheck', async () => {
      if (!detector) {
        return;
      }

      await detector.checkAvailability({ suppressPrompt: false });
    }),
    vscode.commands.registerCommand('autobounds.pullDockerImage', async () => {
      if (!detector) {
        return;
      }

      await detector.pullDockerImage();
    })
  );

  try {
    await detector.checkAvailability({ suppressPrompt: false });
  } catch (error) {
    outputChannel.appendLine(`[Autobounds] Failed to run startup check: ${String(error)}`);
  }
}

export function deactivate(): void {
  detector?.dispose();
  detector = undefined;
}
