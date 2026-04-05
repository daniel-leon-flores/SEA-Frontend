import { ref, computed } from 'vue';
import type { Period } from '../entities/period';
import { periodService } from '../services/period.service';

export function usePeriods() {
  const periods = ref<Period[]>([]);
  const loading = ref(false);
  const filterYear = ref<number | undefined>(undefined);
  const filterStatus = ref<boolean | undefined>(undefined);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalPages = ref(1);
  const totalItems = ref(0);

  const paginationInfo = computed(() => {
    if (totalItems.value === 0) return '';
    const from = (currentPage.value - 1) * pageSize.value + 1;
    const to = Math.min(currentPage.value * pageSize.value, totalItems.value);
    return `${from}–${to} de ${totalItems.value} periodos`;
  });

  const loadPeriods = async () => {
    loading.value = true;
    try {
      const response = await periodService.getPeriods(
        filterYear.value ?? undefined,
        filterStatus.value ?? undefined,
        currentPage.value,
        pageSize.value,
      );
      if (!response.success || !response.data) {
        periods.value = [];
        return { ok: false as const, message: response.message };
      }
      periods.value = response.data.results ?? [];
      totalPages.value = response.data.pagination?.total_pages ?? 1;
      totalItems.value = response.data.pagination?.count ?? periods.value.length;
      return { ok: true as const };
    } finally {
      loading.value = false;
    }
  };

  const resetPageAndLoad = async () => {
    currentPage.value = 1;
    return loadPeriods();
  };

  return {
    periods,
    loading,
    filterYear,
    filterStatus,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginationInfo,
    loadPeriods,
    resetPageAndLoad,
  };
}
