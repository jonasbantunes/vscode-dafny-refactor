import * as vscode from 'vscode';
import { spawn } from 'child_process';

export function extractVariable() {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Applying Extract Variable',
      cancellable: false,
    },
    () => {
      return new Promise((resolve, reject) => {
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
          vscode.window.showErrorMessage(
            "Couldn't access currently active editor."
          );
          reject();
          return;
        }

        const refactorType = 'apply-extract-variable';
        const startPos: string = `${editor.selection.start.line + 1}:${editor.selection.start.character + 1}`;
        const endPos: string = `${editor.selection.end.line + 1}:${editor.selection.end.character + 1}`;
        const varName: string = 'vsExtractedVar';

        const args: string[] = [
          refactorType,
          '--stdin',
          '-s',
          startPos,
          '-e',
          endPos,
          '-v',
          varName,
          '--stdout',
        ];

        const basePath = vscode.workspace
          .getConfiguration('vscode-dafny-refactor')
          .get<string>('executablePath');

        if (
          basePath === undefined ||
          basePath === null ||
          basePath.trim() === ''
        ) {
          vscode.window.showErrorMessage(
            'DafnyRefactor.exe path not defined in settings.'
          );
          reject();
          return;
        }
        const command = 'DafnyRefactor.exe';
        const fullCommand = `${basePath}/${command}`;

        const child = spawn(fullCommand, args);

        child.stdin.write(editor.document.getText());
        child.stdin.end();

        child.stderr.on('data', (data) => {
          vscode.window.showErrorMessage(`${data}`);
          reject();
        });

        child.stdout.on('data', (data) => {
          vscode.window.activeTextEditor?.edit((editBuilder) => {
            const firstLine = editor.document.lineAt(0);
            const lastLine = editor.document.lineAt(
              editor.document.lineCount - 1
            );
            const textRange = new vscode.Range(
              firstLine.range.start,
              lastLine.range.end
            );

            var d = `${data}`;

            editBuilder.replace(textRange, `${data}`);
          });
        });

        child.on('exit', (code) => {
          if (code === 0) {
            vscode.window.showInformationMessage(
              'Extract Variable successfully applied '
            );
            resolve();
          } else {
            reject();
          }
        });

        child.on('error', () => {
          vscode.window.showErrorMessage('Unknown error');
          reject();
        });
      });
    }
  );
}
