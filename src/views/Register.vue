<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLogo from '../components/AppLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (loading.value) return
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  try {
    loading.value = true
    error.value = ''
    
    const success = await authStore.register(email.value, password.value, name.value)
    if (success) {
      router.push('/dashboard')
    }
  } catch (e) {
    error.value = 'An error occurred during registration'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left Panel - Decorative -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600">
      <div class="w-full flex flex-col items-center justify-center px-12 text-white">
        <AppLogo size="large" class="text-white mb-8" />
        <h2 class="text-4xl font-bold mb-4">Welcome!</h2>
        <p class="text-lg text-blue-100 text-center">
          Join us to transform and map your files with ease.
        </p>
      </div>
    </div>

    <!-- Right Panel - Registration Form -->
    <div class="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden mb-8 flex justify-center">
          <AppLogo size="large" />
        </div>

        <div class="bg-white rounded-xl shadow-lg p-8">
          <h1 class="text-2xl font-bold mb-2 text-gray-800">Create Account</h1>
          <p class="text-gray-600 mb-8">Please fill in your information</p>

          <form @submit.prevent="handleRegister" class="space-y-6">
            <!-- Name -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Full Name</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-user text-gray-400"></i>
                </div>
                <input
                  v-model="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-envelope text-gray-400"></i>
                </div>
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-lock text-gray-400"></i>
                </div>
                <input
                  v-model="password"
                  type="password"
                  required
                  placeholder="Create a password"
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Confirm Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-lock text-gray-400"></i>
                </div>
                <input
                  v-model="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm your password"
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full p-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="loading" class="pi pi-spinner animate-spin mr-2"></i>
              <span>{{ loading ? 'Creating Account...' : 'Create Account' }}</span>
            </button>
          </form>
        </div>

        <p class="text-center mt-8 text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pi {
  font-size: 1rem;
}

input::placeholder {
  color: #9CA3AF;
}
</style>