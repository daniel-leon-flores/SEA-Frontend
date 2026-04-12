<template>
  <div class="table-container">
    <!-- Tabla con scroll vertical y sticky headers -->
    <div class="table-scroll-wrapper">
      <v-table density="comfortable" fixed-header class="sticky-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="font-semibold text-center sticky-header"
              :style="{ width: column.width || 'auto', minWidth: column.minWidth || 'auto' }"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="data.length === 0">
            <td :colspan="columns.length" class="text-center py-8">
              <v-icon size="48" color="grey-lighten-1">mdi-inbox-outline</v-icon>
              <p class="text-grey mt-2">No hay datos disponibles</p>
            </td>
          </tr>
          <tr v-else v-for="(row, index) in data" :key="index">
            <td
              v-for="column in columns"
              :key="column.key"
              class="text-center"
              :style="{ width: column.width || 'auto', minWidth: column.minWidth || 'auto' }"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
              >
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "PaginatedTable",
  props: {
    columns: {
      type: Array,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    totalRecords: {
      type: Number,
      default: 0
    },
    totalPages: {
      type: Number,
      default: 1
    },
    currentPageProp: {
      type: Number,
      default: 1
    },
    pageSizeProp: {
      type: Number,
      default: 10
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:page', 'update:pageSize']
}
</script>

<style scoped>
.table-container {
  width: 100%;
}

.table-scroll-wrapper {
  max-height: 380px;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
}

.sticky-table :deep(thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}

.sticky-header {
  background-color: rgb(var(--v-theme-surface)) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.v-table) {
  table-layout: fixed;
}

:deep(.v-table th),
:deep(.v-table td) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Scrollbar personalizado */
.table-scroll-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-scroll-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
