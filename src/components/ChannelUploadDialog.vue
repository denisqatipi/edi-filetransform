<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../services/api';

const props = defineProps<{
  channel: {
    id: number;
    name: string;
    source_format: string;
    target_format: string;
  };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'upload', file: File): void;
}>();

const file = ref<File | null>(null);
const loading = ref(false);
const error = ref('');

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
    error.value = ''; // Clear any previous errors
  }
};

const handleUpload = async () => {
  if (!file.value) {
    error.value = 'Please select a file';
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    
    // First validate file type
    const fileExtension = file.value.name.split('.').pop()?.toLowerCase();
    const expectedExtension = props.channel.source_format.toLowerCase();
    
    if (fileExtension !== expectedExtension) {
      throw new Error(`Invalid file type. Expected ${props.channel.source_format} file`);
    }

    emit('upload', file.value);
  } catch (e: any) {
    error.value = e.message || 'Error uploading file';
    loading.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold">Use Channel: {{ channel.name }}</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Channel Info -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center gap-2">
            <span class="text-sm px-2 py-1 rounded-full bg-blue-50 text-blue-600">
              {{ channel.source_format }}
            </span>
            <i class="pi pi-arrow-right text-gray-400 text-xs"></i>
            <span class="text-sm px-2 py-1 rounded-full bg-blue-50 text-blue-600">
              {{ channel.target_format }}
            </span>
          </div>
        </div>

        <!-- File Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Upload {{ channel.source_format }} File
          </label>
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <i class="pi pi-upload absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                readonly
                :value="file?.name || 'No file selected'"
                class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
              />
            </div>
            <label 
              class="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium inline-flex items-center"
              :class="{ 'opacity-50 cursor-not-allowed': loading }"
            >
              Browse
              <input
                type="file"
                class="hidden"
                @change="handleFileSelect"
                :accept="`.${channel.source_format.toLowerCase()}`"
                :disabled="loading"
              />
            </label>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Supported file type: .{{ channel.source_format.toLowerCase() }}
          </p>
        </div>

        <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {{ error }}
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            @click="emit('close')"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            @click="handleUpload"
            :disabled="loading || !file"
            class="btn-primary"
          >
            <i v-if="loading" class="pi pi-spinner animate-spin mr-2"></i>
            <span>{{ loading ? 'Processing...' : 'Transform' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>