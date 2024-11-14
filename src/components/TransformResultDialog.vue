<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: any;
  error: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'download'): void;
}>();

const formattedData = computed(() => {
  if (!props.data) return '';
  return JSON.stringify(props.data, null, 2);
});
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold">Transformation Result</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="space-y-4">
        <div v-if="error" class="p-4 bg-red-50 text-red-600 rounded-lg">
          {{ error }}
        </div>

        <div v-else>
          <!-- Result Preview -->
          <div class="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
            <pre class="text-sm text-gray-700">{{ formattedData }}</pre>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Close
            </button>
            <button
              @click="emit('download')"
              class="btn-primary"
            >
              <i class="pi pi-download mr-2"></i>
              Download Result
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>