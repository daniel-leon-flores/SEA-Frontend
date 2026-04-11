import { ref, computed } from 'vue';
import type { Subject } from '../entities/subject';
import type { CreateSubjectDto } from '../entities/create-subject.dto';
import type { UpdateSubjectDto } from '../entities/update-subject.dto';
import { SubjectController } from '../adapters/subject.controller';

export function useSubjects() {
  const loading = ref(false);
  const subjects = ref<Subject[]>([]);
  const filterLevel = ref<number | null>(null);
  const filterStatus = ref<string | null>(null);
  const searchQuery = ref<string>('');

  const pagination = ref({
    count: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 9,
  });

  const controller = new SubjectController();

  const isEmpty = computed(() => !loading.value && subjects.value.length === 0);

  function statusFilterToBool(): boolean | null {
    if (filterStatus.value === 'true') return true;
    if (filterStatus.value === 'false') return false;
    return null;
  }

  async function fetchSubjects() {
    loading.value = true;
    try {
      const res = await controller.getSubjects({
        pagination: {
          page: pagination.value.currentPage,
          limit: pagination.value.pageSize,
        },
        academic_level: filterLevel.value ?? undefined,
        status: statusFilterToBool(),
        name: searchQuery.value || undefined,
      });

      if (res.success && res.data?.results) {
        subjects.value = res.data.results;
        const p = res.data.pagination;
        pagination.value.count = p.count;
        pagination.value.totalPages = Math.max(1, p.total_pages);
        pagination.value.currentPage = p.page;
        pagination.value.pageSize = p.page_size;
        return;
      }

      subjects.value = [];
    } finally {
      loading.value = false;
    }
  }

  function handlePageChange(page: number) {
    pagination.value.currentPage = page;
    return fetchSubjects();
  }

  function handlePageSizeChange(size: number) {
    pagination.value.pageSize = size;
    pagination.value.currentPage = 1;
    return fetchSubjects();
  }

  async function createSubject(dto: CreateSubjectDto) {
    const res = await controller.createSubject(dto);
    if (res.success) {
      await fetchSubjects();
    }
    return res;
  }

  async function updateSubject(id: number, dto: UpdateSubjectDto) {
    const res = await controller.updateSubject(id, dto);
    if (res.success) {
      await fetchSubjects();
    }
    return res;
  }

  async function setSubjectStatus(id: number, status: boolean) {
    const res = await controller.updateSubjectStatus(id, status);
    if (res.success) {
      await fetchSubjects();
    }
    return res;
  }

  return {
    loading,
    subjects,
    pagination,
    filterLevel,
    filterStatus,
    searchQuery,
    isEmpty,
    fetchSubjects,
    handlePageChange,
    handlePageSizeChange,
    createSubject,
    updateSubject,
    setSubjectStatus,
  };
}
