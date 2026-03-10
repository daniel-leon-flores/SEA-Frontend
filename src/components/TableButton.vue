<template>
  <v-tooltip :text="tooltip" location="top">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        :icon="icon"
        :color="color"
        :size="size"
        @click="$emit('click')"
        class="table-fab"
        variant="flat"
        :disabled="disabled"
      />
    </template>
  </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: "TableButton",
  props: {
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'primary'
    },
    tooltip: {
      type: String,
      default: ''
    },
    size: {
      type: String as () => 'small' | 'large' | 'x-small',
      default: 'small'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
})
</script>

<style scoped>
.table-fab {
  margin: 0 2px;
}
</style>
