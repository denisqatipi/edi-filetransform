<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../services/api'

const emit = defineEmits<{
  (e: 'file-uploaded', file: File, data: any): void
}>()

const messageType = ref('XML')
const sampleFile = ref<File | null>(null)
const reuseAndSaveTime = ref(false)
const loading = ref(false)
const error = ref('')

const handleSampleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    try {
      loading.value = true
      error.value = ''
      const file = target.files[0]
      sampleFile.value = file

      // Upload and parse the file
      const response = await api.uploadFile(file)
      emit('file-uploaded', file, response.data)
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Error processing file'
      sampleFile.value = null
    } finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Message Type Selection -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        Message Type
      </label>
      <div class="flex gap-4 items-center">
        <div class="flex-1 relative">
          <i class="pi pi-file absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <select
            v-model="messageType"
            class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors appearance-none bg-white"
          >
            <option value="XML">XML</option>
            <option value="JSON">JSON</option>
            <option value="IDOC">IDOC</option>
          </select>
          <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
        </div>
        <div class="flex items-center">
          <input
            type="checkbox"
            id="reuse"
            v-model="reuseAndSaveTime"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="reuse" class="ml-2 text-sm text-gray-600">
            Reuse template
          </label>
        </div>
      </div>
    </div>

    <!-- File Upload -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        Sample {{ messageType }} File
      </label>
      <div class="flex gap-3">
        <div class="flex-1 relative">
          <i class="pi pi-upload absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            readonly
            :value="sampleFile?.name || 'No file selected'"
            class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
          />
        </div>
        <label 
          class="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium inline-flex items-center"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
        >
          <i v-if="loading" class="pi pi-spinner animate-spin mr-2"></i>
          <span>{{ loading ? 'Processing...' : 'Select File' }}</span>
          <input
            type="file"
            class="hidden"
            @change="handleSampleFileUpload"
            :accept="messageType.toLowerCase()"
            :disabled="loading"
          />
        </label>
      </div>
      <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
      <p class="text-xs text-gray-500">Supported file types: {{ messageType.toLowerCase() }}</p>
    </div>
  </div>
</template>

<style scoped>
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>