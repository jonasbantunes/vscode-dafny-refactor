import * as vscode from 'vscode';
import { inlineTemp } from './inline-temp';
import { Commands } from './constants';

export class CodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(): vscode.ProviderResult<
    (vscode.Command | vscode.CodeAction)[]
  > {
    const codeActions: vscode.Command[] = [];
    codeActions.push({
      command: Commands.ApplyInlineTemp,
      title: 'Apply Inline Temp',
    });

    return codeActions;
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.ApplyInlineTemp, inlineTemp)
  );

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { pattern: '**/*.{dfy,dfyi}', scheme: 'file' },
      new CodeActionProvider()
    )
  );
}

export function deactivate() {}
