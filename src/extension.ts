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
    vscode.commands.registerCommand('autobounds.sendSelectionToPythonRepl', async () => {
      if (!detector) {
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        void vscode.window.showInformationMessage('No active editor to send code from.');
        return;
      }

      const selection = editor.selection;
      const text = selection && !selection.isEmpty ? editor.document.getText(selection) : editor.document.lineAt(selection.active.line).text;

      if (!text.trim()) {
        void vscode.window.showInformationMessage('Nothing to send to the Autobounds Python REPL.');
        return;
      }

      const terminal = await detector.ensurePythonRepl();
      if (!terminal) {
        return;
      }

      terminal.show(false);
      terminal.sendText(text, true);
    }),
    vscode.commands.registerCommand('autobounds.pullDockerImage', async () => {
      if (!detector) {
        return;
      }

      await detector.pullDockerImage();
    }),
    vscode.commands.registerCommand('autobounds.openPythonRepl', async () => {
      if (!detector) {
        return;
      }

      await detector.launchRepl('python');
    }),
    vscode.commands.registerCommand('autobounds.openJupyterRepl', async () => {
      if (!detector) {
        return;
      }

      await detector.launchRepl('jupyter');
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
