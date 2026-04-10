<template>
  <div ref="editorHost" class="code-mirror-host"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    readonly?: boolean;
  }>(),
  {
    placeholder: '# Escribe tu solución en Python\n',
    readonly: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const editorHost = ref<HTMLDivElement | null>(null);
let editorView: EditorView | null = null;

onMounted(() => {
  if (!editorHost.value) {
    return;
  }

  editorView = new EditorView({
    parent: editorHost.value,
    state: EditorState.create({
      doc: props.modelValue || props.placeholder,
      extensions: [
        lineNumbers(),
        keymap.of([...defaultKeymap, indentWithTab]),
        python(),
        oneDark,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit('update:modelValue', update.state.doc.toString());
          }
        }),
        EditorView.editable.of(!props.readonly),
        EditorView.theme({
          '&': {
            borderRadius: '18px',
            minHeight: '320px',
          },
          '.cm-scroller': {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
            fontSize: '14px',
          },
          '.cm-content': {
            padding: '18px',
          },
          '.cm-gutters': {
            background: 'rgba(8, 19, 31, 0.96)',
            color: '#7dd3fc',
            border: 'none',
          },
        }),
      ],
    }),
  });
});

watch(
  () => props.modelValue,
  (value = '') => {
    if (!editorView) {
      return;
    }

    const currentValue = editorView.state.doc.toString();
    if (value !== currentValue) {
      editorView.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value || props.placeholder },
      });
    }
  },
);

onBeforeUnmount(() => {
  editorView?.destroy();
  editorView = null;
});
</script>

<style scoped>
.code-mirror-host {
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  background: #0f172a;
}
</style>
