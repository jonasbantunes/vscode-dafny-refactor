import * as vscode from 'vscode';
import { spawn } from 'child_process';

interface MoveToAssociatedParam {
  name: string;
  type: string;
  position: string;
}

export async function getMoveToAssociatedParams() {
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
            "Couldn't access currently active editor"
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

        const commandType = 'get-move-to-associated-params';
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
          let params: MoveToAssociatedParam[] = JSON.parse(d);
          listParams(methodPos, params);
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

export async function listParams(
  methodPos: string,
  params: MoveToAssociatedParam[]
) {
  const paramsName = params.map((param) => param.name);
  const selectedParam = await vscode.window.showQuickPick(paramsName);
  const param = params.find((param) => param.name === selectedParam);
  if (param === undefined) {
    return;
  }

  moveMethodToAssociated(methodPos, param.position);
}

export async function moveMethodToAssociated(
  methodPos: string,
  paramPos: string
) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Applying Move Method to Associated Class',
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

        const refactorType = 'apply-move-method-to-associated';

        const args: string[] = [
          refactorType,
          '--stdin',
          '-s',
          methodPos,
          '-t',
          paramPos,
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
              'Move Method to Associated Class successfully applied'
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
