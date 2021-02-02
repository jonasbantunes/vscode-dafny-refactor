import * as vscode from 'vscode';
import { extractVariable } from './refactors/extract-variable';
import { inlineTemp } from './refactors/inline-temp';
import { getMoveMethodParams, moveMethod } from './refactors/move-method';
import { getMoveToAssociatedParams } from './refactors/move-to-associated';

export class CodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(): vscode.ProviderResult<
    (vscode.Command | vscode.CodeAction)[]
  > {
    const codeActions: vscode.Command[] = [];
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
      return codeActions;
    }

    const selection = editor.selection;
    if (selection.start.isEqual(selection.end)) {
      return codeActions;
    }

    codeActions.push({
      command: 'vscode-dafny-refactor.applyInlineTemp',
      title: 'Apply Inline Temp',
    });

    codeActions.push({
      command: 'vscode-dafny-refactor.applyExtractVariable',
      title: 'Apply Extract Variable',
    });
    codeActions.push({
      command: 'vscode-dafny-refactor.applyMoveMethod',
      title: 'Apply Move Method',
    });
    codeActions.push({
      command: 'vscode-dafny-refactor.applyMoveMethodToAssociated',
      title: 'Apply Move Method to Associated Class',
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
    vscode.commands.registerCommand(
      'vscode-dafny-refactor.applyExtractVariable',
      extractVariable
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscode-dafny-refactor.applyMoveMethod',
      getMoveMethodParams
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscode-dafny-refactor.applyMoveMethodToAssociated',
      getMoveToAssociatedParams
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
