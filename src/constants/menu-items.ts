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
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
      { title: 'Mis Exámenes', icon: 'mdi-clipboard-text', to: '/my-exams' },
    ],
    quickActions: [],
  },
  TEACHER: {
    navItems: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
      { title: 'Crear Examen', icon: 'mdi-file-document-edit', to: '/create-exam' },
      { title: 'Reportes', icon: 'mdi-chart-bar', to: '/reports' },
    ],
    quickActions: [
      { title: 'Banco de Preguntas', icon: 'mdi-book-open-page-variant', to: '/questions' },
    ],
  },
  ADMIN: {
    navItems: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
      { title: 'Crear Examen', icon: 'mdi-file-document-edit', to: '/create-exam' },
      { title: 'Reportes', icon: 'mdi-chart-bar', to: '/reports' },
      { title: 'Usuarios', icon: 'mdi-account-multiple', to: '/users' },
      { title: 'Ajustes', icon: 'mdi-cog', to: '/settings' },
    ],
    quickActions: [
      { title: 'Banco de Preguntas', icon: 'mdi-book-open-page-variant', to: '/questions' },
    ],
  },
};
