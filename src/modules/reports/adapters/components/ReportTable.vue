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
            v-for="col in columns"
            :key="col.key"
            class="font-weight-bold text-center"
            :style="{ minWidth: col.minWidth || '100px' }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="text-center text-grey pa-6">
            Sin datos para mostrar
          </td>
        </tr>
        <tr v-for="(row, idx) in rows" :key="idx">
          <td
            v-for="col in columns"
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
interface ReportColumn {
  key: string;
  label: string;
  minWidth?: string;
}

defineProps<{
  title: string;
  columns: ReportColumn[];
  rows: Record<string, any>[];
}>();

defineEmits(['export-excel', 'export-pdf']);
</script>
