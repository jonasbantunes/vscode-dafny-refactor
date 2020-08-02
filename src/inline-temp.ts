import * as vscode from 'vscode';
import { spawn } from 'child_process';

export function inlineTemp() {
  const editor = vscode.window.activeTextEditor;
  const selection = editor?.selection.active;

  const refactorType = 'apply-inline-temp';
  const filePath: string = editor?.document.fileName ?? '';
  const line: number = (selection?.line ?? 0) + 1;
  const column: number = (selection?.character ?? 0) + 1;

  return new Promise<void>((resolve, reject) => {
    const args: string[] = [
      refactorType,
      filePath,
      line.toString(),
      column.toString(),
    ];

    const basePath: string =
      vscode.workspace
        .getConfiguration('vscode-dafny-refactor')
        .get<string>('executablePath') ?? '';
    const command = 'DafnyRefactor.exe';
    const fullCommand = `${basePath}/${command}`;

    const process = spawn(fullCommand, args);

    process.on('exit', () => {
      vscode.window.showInformationMessage('Inline Temp successfully applied ');
      resolve();
    });

    process.on('error', () => {
      vscode.window.showErrorMessage("Couldn't apply Inline Temp refactor");
      reject();
    });
  });
}
