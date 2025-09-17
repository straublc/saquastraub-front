<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <LoginForm />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LoginForm from '../components/LoginForm.vue'

export default defineComponent({
  name: 'LoginView',
  components: { LoginForm }
})
</script>
