import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import MainLayout from '@/components/MainLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/adapters/views/LoginView.vue'),
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
      // Exams
      {
        path: 'my-exams',
        name: 'MyExams',
        component: () => import('@/modules/exams/adapters/views/ExamListView.vue'),
        meta: { roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
      },
      {
        path: 'create-exam',
        name: 'CreateExam',
        component: () => import('@/modules/exams/adapters/views/ExamCreateView.vue'),
        meta: { roles: ['TEACHER', 'ADMIN'] },
      },
      // Questions
      {
        path: 'questions',
        name: 'Questions',
        component: () => import('@/modules/questions/adapters/views/QuestionBankView.vue'),
        meta: { roles: ['TEACHER', 'ADMIN'] },
      },
      // Generations
      {
        path: 'generations',
        name: 'Generations',
        component: () => import('@/modules/generations/adapters/views/GenerationListView.vue'),
        meta: { roles: ['ADMIN'] },
      },
      {
        path: 'generations/:id/groups',
        name: 'GenerationGroups',
        component: () => import('@/modules/groups/adapters/views/GenerationGroupsView.vue'),
        meta: { roles: ['ADMIN'] },
      },
      // Subjects
      {
        path: 'subjects',
        name: 'Subjects',
        component: () => import('@/modules/subjects/adapters/views/SubjectListView.vue'),
        meta: { roles: ['TEACHER', 'ADMIN'] },
      },
      // Users
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/modules/users/adapters/views/UserListView.vue'),
        meta: { roles: ['ADMIN'] },
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: () => import('@/modules/users/adapters/views/UserDetailView.vue'),
        meta: { roles: ['ADMIN'] },
      },
      {
        path: 'generations/:generationId/groups/:groupId/students',
        name: 'GroupStudents',
        component: () => import('@/modules/users/adapters/views/GroupStudentsView.vue'),
        meta: { roles: ['ADMIN'] },
      },
      // Terms
      {
        path: 'terms',
        name: 'Terms',
        component: () => import('@/modules/terms/adapters/views/TermListView.vue'),
        meta: { roles: ['ADMIN'] },
      },
      // Reports
      {
        path: '',
        name: 'Reports',
        component: () => import('@/modules/reports/adapters/views/ReportsView.vue'),
        meta: { roles: ['TEACHER', 'ADMIN'] },
      },
      // Settings
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { roles: ['ADMIN'] },
      },
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
    if (token && (to.name === 'Login')) {
      return next({ name: 'Reports' });
    }
    return next();
  }

  // Requires auth
  if (!token) {
    return next({ name: 'Login' });
  }

  // Role-based check
  const allowedRoles = to.meta.roles as string[] | undefined;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return next({ name: 'Unauthorized' });
  }

  next();
});

export default router;
