import * as vscode from 'vscode';
import { spawn } from 'child_process';

interface MoveMethodParam {
  name: string;
  type: string;
  position: string;
}

export async function getMoveMethodParams() {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Retrieving method parameters...',
      cancellable: false,
    },
    () =>
      new Promise<void>((resolve, reject) => {
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
          vscode.window.showErrorMessage(
            "Couldn't access currelty active editor"
          );
          reject();
          return;
        }

        const selectionText = editor.document.getText(editor.selection);
        const inlineRe = /^\w+$/g;
        const validInline = inlineRe.test(selectionText);
        if (!validInline) {
          vscode.window.showErrorMessage('Error: must select a class name.');
          reject();
          return;
        }

        const commandType = 'get-move-method-params';
        const methodPos = `${editor.selection.start.line + 1}:${
          editor.selection.start.character + 1
        }`;

        const args: string[] = [
          commandType,
          '--stdin',
          '-p',
          methodPos,
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
          const d = `${data}`;
          let params: MoveMethodParam[] = JSON.parse(d);
          listParams(params);
          resolve();
        });

        child.on('exit', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject();
          }
        });

        child.on('error', () => {
          vscode.window.showErrorMessage('Unknown error');
          reject();
        });
      })
  );
}

export async function listParams(params: MoveMethodParam[]) {
  const paramsName = params.map((param) => param.name);
  const selectedParam = await vscode.window.showQuickPick(paramsName);
  const param = params.find((param) => param.name === selectedParam);
  if (param === undefined) {
    return;
  }

  moveMethod(param.position);
}

export async function moveMethod(paramPosition: string) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Applying Move Method',
      cancellable: false,
    },
    () => {
      return new Promise<void>((resolve, reject) => {
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
          vscode.window.showErrorMessage(
            "Couldn't access currently active editor."
          );
          reject();
          return;
        }

        const refactorType = 'apply-move-method';

        const args: string[] = [
          refactorType,
          '--stdin',
          '-i',
          paramPosition,
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
              'Move Method successfully applied '
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
