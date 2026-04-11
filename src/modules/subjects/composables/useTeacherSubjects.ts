import { ref } from 'vue';
import type { Subject } from '../entities/subject';
import { handleRequest } from '@/config/http-client.gateway';

type GroupEntry = { subject: { id_subject: number } };

export function useTeacherSubjects() {
  const loading = ref(false);
  const subjects = ref<Subject[]>([]);
  const subjectIdsWithGroups = ref<Set<number>>(new Set());
  const searchQuery = ref<string>('');

  const pagination = ref({
    count: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 9,
  });

  async function fetchSubjects() {
    loading.value = true;
    try {
      const params = new URLSearchParams();
      params.set('page', String(pagination.value.currentPage));
      params.set('page_size', String(pagination.value.pageSize));
      if (searchQuery.value) {
        params.set('name', searchQuery.value);
      }
      const query = params.toString();
      const endpoint = `/api/academic/subjects/my-subjects/?${query}`;

      const [subjectsRes, groupsRes] = await Promise.all([
        handleRequest<{ results: Subject[]; pagination: { count: number; total_pages: number; page: number; page_size: number } }>('get', endpoint),
        handleRequest<{ results: GroupEntry[] }>('get', '/api/academic/groups/my-groups/'),
      ]);

      if (subjectsRes.success && subjectsRes.data) {
        subjects.value = subjectsRes.data.results ?? [];
        const p = subjectsRes.data.pagination;
        if (p) {
          pagination.value.count = p.count;
          pagination.value.totalPages = Math.max(1, p.total_pages);
          pagination.value.currentPage = p.page;
          pagination.value.pageSize = p.page_size;
        } else {
          pagination.value.count = subjects.value.length;
          pagination.value.totalPages = 1;
        }
      } else {
        subjects.value = [];
      }

      if (groupsRes.success && groupsRes.data) {
        const raw = groupsRes.data as unknown as { results: GroupEntry[] };
        subjectIdsWithGroups.value = new Set(
          (raw.results ?? []).map((g) => g.subject?.id_subject).filter(Boolean)
        );
      } else {
        subjectIdsWithGroups.value = new Set();
      }
    } finally {
      loading.value = false;
    }
  }

  function handlePageChange(page: number) {
    pagination.value.currentPage = page;
    return fetchSubjects();
  }

  return {
    loading,
    subjects,
    subjectIdsWithGroups,
    pagination,
    searchQuery,
    fetchSubjects,
    handlePageChange,
  };
}
