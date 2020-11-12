import * as vscode from 'vscode';
import { extractVariable } from './refactors/extract-variable';
import { inlineTemp } from './refactors/inline-temp';
import { moveMethod } from './refactors/move-method';

export class CodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(): vscode.ProviderResult<
    (vscode.Command | vscode.CodeAction)[]
  > {
    const codeActions: vscode.Command[] = [];
    codeActions.push(
      {
        command: 'vscode-dafny-refactor.applyInlineTemp',
        title: 'Apply Inline Temp',
      },
      {
        command: 'vscode-dafny-refactor.applyExtractVariable',
        title: 'Apply Extract Variable',
      },
      {
        command: 'vscode-dafny-refactor.applyMoveMethod',
        title: 'Apply Move Method',
      }
    );

    return codeActions;
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscode-dafny-refactor.applyInlineTemp',
      inlineTemp
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscode-dafny-refactor.applyExtractVariable',
      extractVariable
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscode-dafny-refactor.applyMoveMethod',
      moveMethod
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { pattern: '**/*.{dfy,dfyi}', scheme: 'file' },
      new CodeActionProvider()
    )
  );
}

export function deactivate() {}
