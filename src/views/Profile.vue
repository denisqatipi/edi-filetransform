<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useStatsStore } from '../stores/stats'
import AppLogo from '../components/AppLogo.vue'

const authStore = useAuthStore()
const statsStore = useStatsStore()

const name = ref(authStore.user?.name || '')
const email = ref(authStore.user?.email || '')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const loading = ref(false)

onMounted(async () => {
  if (!statsStore.stats.totalTransformations) {
    await statsStore.fetchStats()
  }
})

const updateProfile = async () => {
  if (loading.value) return
  
  try {
    loading.value = true
    await authStore.updateProfile({
      name: name.value,
      email: email.value
    })
    message.value = 'Profile updated successfully'
  } catch (error: any) {
    message.value = error.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  if (loading.value) return
  
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Passwords do not match'
    return
  }

  try {
    loading.value = true
    await authStore.changePassword(currentPassword.value, newPassword.value)
    message.value = 'Password changed successfully'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error: any) {
    message.value = error.message || 'Failed to change password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/dashboard">
              <AppLogo />
            </router-link>
          </div>
          <div class="flex items-center divide-x divide-gray-200">
            <div class="px-6">
              <router-link to="/dashboard" class="nav-link">
                <i class="pi pi-home mr-1"></i>
                Dashboard
              </router-link>
            </div>
            <div class="px-6">
              <router-link to="/transform" class="nav-link">
                <i class="pi pi-file-export mr-1"></i>
                Transform
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Profile Header -->
      <div class="card mb-8">
        <div class="p-6 flex items-center justify-between border-b border-gray-100">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p class="text-gray-500 mt-1">Manage your account settings and preferences</p>
          </div>
          <div class="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center text-white">
            <i class="pi pi-user text-2xl"></i>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-3 divide-x divide-gray-100">
          <div class="p-6 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ statsStore.stats.totalTransformations }}</p>
            <p class="text-sm text-gray-500 mt-1">Transformations</p>
          </div>
          <div class="p-6 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ statsStore.stats.successRate }}%</p>
            <p class="text-sm text-gray-500 mt-1">Success Rate</p>
          </div>
          <div class="p-6 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ statsStore.stats.transformationsThisMonth }}</p>
            <p class="text-sm text-gray-500 mt-1">This Month</p>
          </div>
        </div>
      </div>

      <!-- Profile Information -->
      <div class="card mb-8">
        <div class="border-b border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
          <p class="text-sm text-gray-500 mt-1">Update your basic profile information</p>
        </div>
        <div class="p-6">
          <div class="space-y-6">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <div class="relative">
                  <i class="pi pi-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    v-model="name"
                    type="text"
                    class="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div class="relative">
                  <i class="pi pi-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    v-model="email"
                    type="email"
                    class="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-100">
              <button
                @click="updateProfile"
                :disabled="loading"
                class="btn-primary w-full sm:w-auto"
              >
                <i v-if="loading" class="pi pi-spinner animate-spin mr-2"></i>
                <span>{{ loading ? 'Updating...' : 'Update Profile' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Password Change -->
      <div class="card">
        <div class="border-b border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900">Security Settings</h3>
          <p class="text-sm text-gray-500 mt-1">Manage your password and security preferences</p>
        </div>
        <div class="p-6">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div class="relative">
                <i class="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  v-model="currentPassword"
                  type="password"
                  class="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div class="relative">
                  <i class="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    v-model="newPassword"
                    type="password"
                    class="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div class="relative">
                  <i class="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    v-model="confirmPassword"
                    type="password"
                    class="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-100">
              <button
                @click="changePassword"
                :disabled="loading"
                class="btn-primary w-full sm:w-auto"
              >
                <i v-if="loading" class="pi pi-spinner animate-spin mr-2"></i>
                <span>{{ loading ? 'Changing Password...' : 'Change Password' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Message -->
      <div
        v-if="message"
        class="mt-6 p-4 rounded-lg flex items-center"
        :class="{
          'bg-green-50 text-green-700': message.includes('successfully'),
          'bg-red-50 text-red-700': !message.includes('successfully')
        }"
      >
        <i
          class="pi mr-2 text-lg"
          :class="{
            'pi-check-circle': message.includes('successfully'),
            'pi-times-circle': !message.includes('successfully')
          }"
        ></i>
        {{ message }}
      </div>
    </main>
  </div>
</template>