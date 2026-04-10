import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import MainLayout from '@/components/MainLayout.vue';

// ---------------------------------------------------------------------------
// Role constants — single source of truth for meta.roles values
// ---------------------------------------------------------------------------
const R_STUDENT       = ['STUDENT'];
const R_TEACHER_ADMIN = ['TEACHER', 'ADMIN'];
const R_ADMIN         = ['ADMIN'];

// Factory: collapses repeated 5-line route objects into a single call
function childRoute(
  path: string,
  name: string,
  component: () => Promise<unknown>,
  roles: string[],
): RouteRecordRaw {
  return { path, name, component, meta: { roles } } as RouteRecordRaw;
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/adapters/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/password-recovery',
    name: 'PasswordRecovery',
    component: () => import('@/modules/auth/adapters/views/PasswordRecoveryView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/UnauthorizedView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      childRoute('my-exams',    'MyExams',          () => import('@/modules/exams/adapters/views/StudentExamListView.vue'),                R_STUDENT),
      {
        path: 'my-exams/:assignmentId/answer',
        name: 'AnswerExam',
        component: () => import('@/modules/answers/adapters/views/StudentExamAnswerView.vue'),
        meta: { roles: R_STUDENT, hideSidebar: true },
      } as RouteRecordRaw,
      {
        path: 'my-exams/:assignmentId/review',
        name: 'ReviewExam',
        component: () => import('@/modules/answers/adapters/views/StudentExamReviewView.vue'),
        meta: { roles: R_STUDENT },
      } as RouteRecordRaw,
      childRoute('exams',       'ManageExams',       () => import('@/modules/exams/adapters/views/ExamListView.vue'),                        R_TEACHER_ADMIN),
      childRoute('exams/:id/grades', 'ExamGrades',  () => import('@/modules/exams/adapters/views/ExamGradesView.vue'),                     R_TEACHER_ADMIN),
      childRoute('exams/:examId/assignments/:assignmentId/grade', 'ManualGrade', () => import('@/modules/exams/adapters/views/ManualGradeView.vue'), R_TEACHER_ADMIN),
      childRoute('questions',   'Questions',         () => import('@/modules/questions/adapters/views/QuestionBankView.vue'),               R_TEACHER_ADMIN),
      childRoute('generations', 'Generations',       () => import('@/modules/generations/adapters/views/GenerationListView.vue'),           R_ADMIN),
      childRoute('generations/:id/groups', 'GenerationGroups', () => import('@/modules/groups/adapters/views/GenerationGroupsView.vue'),    R_ADMIN),
      childRoute('subjects',    'Subjects',          () => import('@/modules/subjects/adapters/views/SubjectListView.vue'),                 R_TEACHER_ADMIN),
      childRoute('subjects/:subjectId/groups', 'TeacherSubjectGroups', () => import('@/modules/subjects/adapters/views/TeacherSubjectGroupsView.vue'), R_TEACHER_ADMIN),
      childRoute('subjects/:subjectId/groups/:groupId/students', 'TeacherGroupStudents', () => import('@/modules/subjects/adapters/views/TeacherGroupStudentsView.vue'), R_TEACHER_ADMIN),
      childRoute('users',       'Users',             () => import('@/modules/users/adapters/views/UserListView.vue'),                       R_ADMIN),
      childRoute('users/:id',   'UserDetail',        () => import('@/modules/users/adapters/views/UserDetailView.vue'),                     R_ADMIN),
      childRoute('generations/:generationId/groups/:groupId/students', 'GroupStudents', () => import('@/modules/users/adapters/views/GroupStudentsView.vue'), R_ADMIN),
      childRoute('periods',     'Periods',           () => import('@/modules/periods/adapters/views/PeriodListView.vue'),                     R_TEACHER_ADMIN),
      childRoute('',            'Reports',           () => import('@/modules/reports/adapters/views/ReportsView.vue'),                      R_TEACHER_ADMIN),
      childRoute('settings',    'Settings',          () => import('@/modules/audit/adapters/views/auditLogView.vue'),                       R_ADMIN),
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('sea_token');
  const role = localStorage.getItem('sea_selectedRole');

  // Public routes
  if (to.meta.requiresAuth === false) {
    // Si ya está autenticado e intenta acceder a Login o PasswordRecovery, redirigir
    if (token && role && (to.name === 'Login' || to.name === 'PasswordRecovery')) {
      if (role === 'STUDENT') {
        return next({ name: 'MyExams' });
      } else {
        return next({ name: 'Reports' });
      }
    }
    return next();
  }

  // Requires auth
  if (!token) {
    return next({ name: 'Login' });
  }

  // Role-based check
  const allowedRoles = to.meta.roles; 
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return next({ name: 'Unauthorized' });
  }

  next();
});

export default router;
