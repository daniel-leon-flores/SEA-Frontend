import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import { en, es } from 'vuetify/locale';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

/** Mismo fondo que `v-navigation-drawer` en `SideBar.vue` (`color="#05323b"`). */
export const SEA_SIDEBAR_BG = '#05323b';

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'es',
    fallback: 'en',
    messages: { es, en },
  },
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'seaTheme',
    themes: {
      seaTheme: {
        dark: false,
        colors: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          primary: '#081e53',
          secondary: '#069574',
          accent: '#75b5a6',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
    },
  },
});
