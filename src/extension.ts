import * as vscode from 'vscode';
import { inlineTemp } from './refactors/inline-temp';

export class CodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(): vscode.ProviderResult<
    (vscode.Command | vscode.CodeAction)[]
  > {
    const codeActions: vscode.Command[] = [];
    codeActions.push({
      command: 'vscode-dafny-refactor.applyInlineTemp',
      title: 'Apply Inline Temp',
    });

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
    vscode.languages.registerCodeActionsProvider(
      { pattern: '**/*.{dfy,dfyi}', scheme: 'file' },
      new CodeActionProvider()
    )
  );
}

export function deactivate() {}
