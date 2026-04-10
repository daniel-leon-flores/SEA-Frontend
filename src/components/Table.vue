<template>
  <div class="w-full space-y-4">
    <v-table density="comfortable" class="rounded-xl" fixed-header>
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="font-semibold text-center"
            :style="{ width: column.width || 'auto', minWidth: column.minWidth || 'auto' }"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(row, index) in paginatedData" :key="index">
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

    <!-- PAGINATION BAR -->
    <v-row class="justify-space-between d-flex mt-2 align-center">
      <v-col cols="12" md="3">
        <v-select
          label="Límite por página"
          v-model="internalPageSize"
          :items="pageSizesWithAll"
          variant="outlined"
          density="compact"
          hide-details
          @update:modelValue="handlePageSizeChange"
        />
      </v-col>

      <v-col cols="12" md="6" class="d-flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="computedTotalPages"
          :total-visible="7"
          density="comfortable"
          class="custom-pagination"
        />
      </v-col>

      <v-col cols="12" md="3"></v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

type Column = {
  label: string
  key: string
  width?: string
  minWidth?: string
}

type Row = Record<string, any>

export default defineComponent({
  name: "Table",
  props: {
    columns: {
      type: Array as PropType<Column[]>,
      required: true,
    },
    data: {
      type: Array as PropType<Row[]>,
      required: true,
    },
    totalRecords: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      currentPage: 1,
      internalPageSize: 10,
      pageSizes: [5, 10, 20, 50] as number[],
    }
  },
  computed: {
    pageSizesWithAll(): Array<{ title: string, value: number }> {
      const sizes = this.pageSizes.map(size => ({
        title: size.toString(),
        value: size
      }))
      sizes.push({
        title: 'Todos',
        value: -1
      })
      return sizes
    },

    totalRecordsComputed(): number {
      return this.totalRecords === null ? this.data.length : this.totalRecords
    },

    computedTotalPages(): number {
      if (this.internalPageSize === -1) {
        return 1
      }
      return Math.ceil(this.totalRecordsComputed / this.internalPageSize) || 1
    },

    paginatedData(): Row[] {
      if (this.internalPageSize === -1) {
        return this.data
      }
      const start = (this.currentPage - 1) * this.internalPageSize
      const end = start + this.internalPageSize
      return this.data.slice(start, end)
    },
  },
  methods: {
    handlePageSizeChange() {
      this.currentPage = 1
    }
  }
})
</script>

<style scoped>
:deep(.v-table) {
  table-layout: fixed;
}

:deep(.v-table th),
:deep(.v-table td) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<style>
.custom-pagination .v-pagination__item {
  border-radius: 4px;
}

.custom-pagination .v-pagination__item:hover {
  background-color: #057a63 !important;
  color: white !important;
}

.custom-pagination .v-pagination__item--is-active {
  background-color: #057a63 !important;
  color: white !important;
}
</style>
