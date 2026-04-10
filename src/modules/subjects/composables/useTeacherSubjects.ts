import { ref } from 'vue';
import type { Subject } from '../entities/subject';
import { handleRequest } from '@/config/http-client.gateway';

type GroupEntry = { subject: { id_subject: number } };

export function useTeacherSubjects() {
  const loading = ref(false);
  const subjects = ref<Subject[]>([]);
  const subjectIdsWithGroups = ref<Set<number>>(new Set());

  const pagination = ref({
    count: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 50,
  });

  async function fetchSubjects() {
    loading.value = true;
    try {
      const [subjectsRes, groupsRes] = await Promise.all([
        handleRequest<{ results: Subject[] }>('get', '/api/academic/subjects/my-subjects/'),
        handleRequest<{ results: GroupEntry[] }>('get', '/api/academic/groups/my-groups/'),
      ]);

      if (subjectsRes.success && subjectsRes.data) {
        const data = subjectsRes.data as unknown as { results: Subject[] };
        subjects.value = data.results ?? [];
        pagination.value.count = subjects.value.length;
        pagination.value.totalPages = 1;
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

  return {
    loading,
    subjects,
    subjectIdsWithGroups,
    pagination,
    fetchSubjects,
  };
}
