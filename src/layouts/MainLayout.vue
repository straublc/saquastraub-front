<template>
  <div class="app-layout d-flex">
    <Sidebar />
    <div class="main-content flex-grow-1">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}
.main-content {
  background: #f5f7fa;
  padding: 1rem;
  min-height: 100vh;
}
</style>
