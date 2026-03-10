<template>
  <v-breadcrumbs :items="breadcrumbItems" class="pa-0 mb-4">
    <template v-slot:divider>
      <v-icon icon="mdi-chevron-right"></v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const breadcrumbItems = computed(() => {
  const paths = route.path.split('/').filter(p => p);
  return paths.map((path, index) => ({
    title: capitalizeStr(path),
    disabled: index === paths.length - 1,
    href: '/' + paths.slice(0, index + 1).join('/')
  }));
});

function capitalizeStr(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
</script>
