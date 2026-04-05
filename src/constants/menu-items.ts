export interface MenuItem {
  title: string;
  icon: string;
  to: string;
}

export interface RoleMenu {
  navItems: MenuItem[];
  quickActions: MenuItem[];
}

export const roleMenus: Record<string, RoleMenu> = {
  STUDENT: {
    navItems: [
      { title: 'Mis Exámenes', icon: 'mdi-clipboard-text', to: '/my-exams' },
    ],
    quickActions: [],
  },
  TEACHER: {
    navItems: [
      { title: 'Reportes', icon: 'mdi-chart-bar', to: '/' },
      { title: 'Exámenes', icon: 'mdi-file-document-edit', to: '/exams' },
      { title: 'Periodos', icon: 'mdi-calendar-month', to: '/periods' },
      { title: 'Materias', icon: 'mdi-book-open-variant', to: '/subjects' },
    ],
    quickActions: [
      { title: 'Banco de Preguntas', icon: 'mdi-book-open-page-variant', to: '/questions' },
    ],
  },
  ADMIN: {
    navItems: [
      { title: 'Reportes', icon: 'mdi-chart-bar', to: '/' },
      { title: 'Generaciones', icon: 'mdi-view-list', to: '/generations' },
      { title: 'Periodos', icon: 'mdi-calendar-month', to: '/periods' },
      { title: 'Exámenes', icon: 'mdi-file-document-edit', to: '/exams' },
      { title: 'Materias', icon: 'mdi-book-open-variant', to: '/subjects' },
      { title: 'Usuarios', icon: 'mdi-account-multiple', to: '/users' },
      { title: 'Bitácora', icon: 'mdi-clipboard-text-clock-outline', to: '/settings' },
    ],
    quickActions: [
      { title: 'Banco de Preguntas', icon: 'mdi-book-open-page-variant', to: '/questions' },
    ],
  },
};
