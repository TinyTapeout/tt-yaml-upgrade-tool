// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2023 Uri Shaked <uri@tinytapeout.com>

import * as monaco from 'monaco-editor';
import { upgradeProject } from './upgrade.js';

const inputEditor = document.getElementById('input-editor');
console.log('inputEditor', inputEditor);

const editor = monaco.editor.create(inputEditor!, {
  value: '# Paste your info.yaml content here\n',
  language: 'yaml',
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
});

const outputYaml = document.getElementById('output-yaml')!;
const outputMarkdown = document.getElementById('output-markdown')!;

// print the current value of the editor whenever it changes
editor.onDidChangeModelContent(() => {
  const value = editor.getValue();
  try {
    const result = upgradeProject(value);
    if (result.error) {
      outputYaml.classList.add('error');
      outputYaml.textContent = result.error;
      outputMarkdown.textContent = '';
      return;
    } else {
      outputYaml.classList.remove('error');
      outputYaml.textContent = result.yaml ?? '';
      outputMarkdown.textContent = result.markdown ?? '';
    }
  } catch (e: any) {
    outputYaml.classList.add('error');
    outputYaml.textContent = e.stack ?? e.message ?? e;
    outputMarkdown.textContent = '';
  }
});

for (const textarea of document.querySelectorAll('textarea')) {
  textarea.addEventListener('focus', (event) => {
    (event.target as HTMLTextAreaElement).select();
  });
}
