<template>
  <v-card variant="outlined" class="pa-4 rounded-lg">
    <div class="d-flex align-center justify-space-between mb-3">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
        <v-icon start size="20">mdi-table</v-icon>
        {{ title }}
      </v-card-title>
      <div class="d-flex ga-2">
        <v-btn
          size="small"
          variant="outlined"
          color="success"
          prepend-icon="mdi-file-excel"
          @click="$emit('export-excel')"
        >
          Excel
        </v-btn>
        <v-btn
          size="small"
          variant="outlined"
          color="error"
          prepend-icon="mdi-file-pdf-box"
          @click="$emit('export-pdf')"
        >
          PDF
        </v-btn>
      </div>
    </div>
    <v-table density="comfortable" class="rounded-lg" fixed-header>
      <thead>
        <tr>
          <th
            v-for="col in safeColumns"
            :key="col.key"
            scope="col"
            class="font-weight-bold text-center"
            :style="{ minWidth: col.minWidth || '100px' }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="safeRows.length === 0">
          <td :colspan="safeColumns.length || 1" class="text-center text-grey pa-6">
            Sin datos para mostrar
          </td>
        </tr>
        <tr v-for="(row, idx) in safeRows" :key="idx">
          <td
            v-for="col in safeColumns"
            :key="col.key"
            class="text-center"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '—' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ReportColumn {
  key: string;
  label: string;
  minWidth?: string;
}

const props = withDefaults(defineProps<{
  title: string;
  columns: ReportColumn[];
  rows: Record<string, any>[];
}>(), {
  columns: () => [],
  rows: () => [],
});

const safeColumns = computed(() => Array.isArray(props.columns) ? props.columns : []);
const safeRows = computed(() => Array.isArray(props.rows) ? props.rows : []);

defineEmits(['export-excel', 'export-pdf']);
</script>
