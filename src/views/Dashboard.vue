<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChannelStore } from '../stores/channel'
import { useStatsStore } from '../stores/stats'
import AppLogo from '../components/AppLogo.vue'
import ChannelUploadDialog from '../components/ChannelUploadDialog.vue'
import TransformResultDialog from '../components/TransformResultDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const channelStore = useChannelStore()
const statsStore = useStatsStore()

const stats = ref([
  { label: 'Total Transformations', value: '0', icon: 'pi-sync' },
  { label: 'This Month', value: '0', icon: 'pi-calendar' },
  { label: 'Success Rate', value: '0%', icon: 'pi-check-circle' },
  { label: 'Processing', value: '0', icon: 'pi-spinner' }
])

const loading = ref(true)
const showUploadDialog = ref(false)
const showResultDialog = ref(false)
const selectedChannel = ref<any>(null)
const transformedData = ref<any>(null)
const transformError = ref('')

onMounted(async () => {
  try {
    await Promise.all([
      channelStore.fetchChannels(),
      statsStore.fetchStats()
    ])

    // Update stats with real data
    stats.value = [
      { label: 'Total Transformations', value: statsStore.stats.totalTransformations.toString(), icon: 'pi-sync' },
      { label: 'This Month', value: statsStore.stats.transformationsThisMonth.toString(), icon: 'pi-calendar' },
      { label: 'Success Rate', value: `${statsStore.stats.successRate}%`, icon: 'pi-check-circle' },
      { label: 'Processing', value: statsStore.stats.processing.toString(), icon: 'pi-spinner' }
    ]
  } finally {
    loading.value = false
  }
})

const navigateToTransform = () => {
  router.push('/transform')
}

const useChannel = (channel: any) => {
  selectedChannel.value = channel
  showUploadDialog.value = true
  transformError.value = ''
  transformedData.value = null
}

const handleFileUpload = async (file: File) => {
  try {
    const result = await channelStore.transformWithChannel(selectedChannel.value.id, file)
    transformedData.value = result.data
    showUploadDialog.value = false
    showResultDialog.value = true
    
    // Refresh stats after successful transformation
    await statsStore.fetchStats()
  } catch (error: any) {
    transformError.value = error.message || 'Error during transformation'
    showUploadDialog.value = false
    showResultDialog.value = true
  }
}

const downloadResult = () => {
  if (!transformedData.value) return

  const blob = new Blob([JSON.stringify(transformedData.value, null, 2)], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transformed_${selectedChannel.value.name}.json`
  a.click()
  window.URL.revokeObjectURL(url)
}

const closeResultDialog = () => {
  showResultDialog.value = false
  transformedData.value = null
  transformError.value = ''
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <AppLogo />
          </div>
          <div class="flex items-center divide-x divide-gray-200">
            <div class="px-6">
              <router-link to="/transform" class="nav-link">
                <i class="pi pi-file-export mr-1"></i>
                Transform
              </router-link>
            </div>
            <div class="px-6">
              <router-link to="/profile" class="nav-link">
                <i class="pi pi-user mr-1"></i>
                Profile
              </router-link>
            </div>
            <div class="pl-6">
              <button @click="logout" class="nav-link">
                <i class="pi pi-sign-out mr-1"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Welcome back, {{ authStore.user?.name }}!</h1>
          <p class="text-gray-500 mt-1">Here's what's happening with your transformations.</p>
        </div>
        <div class="space-x-3">
          <button @click="navigateToTransform" class="btn-primary">
            <i class="pi pi-plus mr-2"></i>
            New Channel
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.label" class="card p-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-gradient-to-br from-blue-500 to-pink-500 rounded-lg">
              <i :class="['pi', stat.icon, 'text-white']"></i>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
              <p class="text-2xl font-bold mt-1">{{ stat.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Channels List -->
      <div class="card">
        <div class="border-b border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Your Channels</h2>
          </div>
        </div>
        
        <div v-if="loading" class="p-6 text-center text-gray-500">
          <i class="pi pi-spinner animate-spin text-2xl"></i>
          <p class="mt-2">Loading channels...</p>
        </div>

        <div v-else-if="channelStore.channels.length === 0" class="p-6 text-center text-gray-500">
          <i class="pi pi-inbox text-4xl mb-2"></i>
          <p>No channels created yet</p>
          <button @click="navigateToTransform" class="btn-primary mt-4">
            Create Your First Channel
          </button>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div 
            v-for="channel in channelStore.channels" 
            :key="channel.id"
            class="p-6 hover:bg-gray-50 transition-colors duration-150"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="p-2 bg-gradient-to-br from-blue-500/10 to-pink-500/10 rounded-lg">
                  <i class="pi pi-sitemap text-blue-600"></i>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ channel.name }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ channel.description }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                      {{ channel.source_format }}
                    </span>
                    <i class="pi pi-arrow-right text-gray-400 text-xs"></i>
                    <span class="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                      {{ channel.target_format }}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                @click="useChannel(channel)"
                class="btn-secondary"
              >
                <i class="pi pi-play mr-2"></i>
                Use Channel
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Upload Dialog -->
    <ChannelUploadDialog
      v-if="showUploadDialog"
      :channel="selectedChannel"
      @close="showUploadDialog = false"
      @upload="handleFileUpload"
    />

    <!-- Result Dialog -->
    <TransformResultDialog
      v-if="showResultDialog"
      :data="transformedData"
      :error="transformError"
      @close="closeResultDialog"
      @download="downloadResult"
    />
  </div>
</template>