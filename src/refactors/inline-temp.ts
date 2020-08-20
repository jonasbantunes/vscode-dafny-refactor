import * as vscode from 'vscode';
import { spawn } from 'child_process';

export function inlineTemp() {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Applying Inline Temp',
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
        const selection = editor.selection.active;

        editor.document.save();

        const refactorType = 'apply-inline-temp';
        const filePath: string = editor.document.fileName;
        const line: number = selection.line + 1;
        const column: number = selection.character + 1;

        const args: string[] = [
          refactorType,
          filePath,
          line.toString(),
          column.toString(),
        ];

        const basePath = vscode.workspace
          .getConfiguration('vscode-dafny-refactor')
          .get<string>('executablePath');

        if (basePath === undefined || basePath.trim() === '') {
          vscode.window.showErrorMessage(
            'DafnyRefactor.exe path not defined in settings.'
          );
          reject();
          return;
        }
        const command = 'DafnyRefactor.exe';
        const fullCommand = `${basePath}/${command}`;

        const process = spawn(fullCommand, args);
        
        process.stderr.on('data', (data) => {
          vscode.window.showErrorMessage(`${data}`);
          reject();
        });

        process.on('exit', (code) => {
          if (code === 0) {
            vscode.window.showInformationMessage(
              'Inline Temp successfully applied '
            );
            resolve();
          } else {
            reject();
          }
        });

        process.on('error', () => {
          vscode.window.showErrorMessage('Unknown error');
          reject();
        });
      });
    }
  );
}
