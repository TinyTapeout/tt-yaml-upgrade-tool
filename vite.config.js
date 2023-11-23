import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  server: {
    open: true,
  },

  plugins: [monacoEditorPlugin.default({
    languageWorkers: ['editorWorkerService'],
  })],
});
