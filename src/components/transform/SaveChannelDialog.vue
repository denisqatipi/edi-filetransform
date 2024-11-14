<script setup lang="ts">
import { ref } from 'vue';
import { useChannelStore } from '../../stores/channel';
import { useTransformStore } from '../../stores/transform';

const props = defineProps<{
  show: boolean;
  mappings: any[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', channelId: number): void;
}>();

const channelStore = useChannelStore();
const transformStore = useTransformStore();

const name = ref('');
const description = ref('');
const loading = ref(false);
const error = ref('');

const handleSave = async () => {
  if (!name.value) {
    error.value = 'Channel name is required';
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    const channel = await channelStore.createChannel({
      name: name.value,
      description: description.value,
      sourceFormat: transformStore.messageIn.type,
      targetFormat: transformStore.messageOut.type,
      sourceTemplate: transformStore.messageIn.data,
      targetTemplate: transformStore.messageOut.data,
      mappings: props.mappings.map(m => ({
        sourcePath: m.sourcePath,
        targetPath: m.targetPath
      }))
    });

    emit('saved', channel.id);
  } catch (e: any) {
    error.value = e.message || 'Error saving channel';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h2 class="text-xl font-semibold mb-4">Save as Channel</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Channel Name
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="Enter channel name"
            class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="Enter channel description"
            class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          ></textarea>
        </div>

        <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {{ error }}
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            @click="emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            :disabled="loading"
            class="btn-primary"
          >
            <i v-if="loading" class="pi pi-spinner animate-spin mr-2"></i>
            <span>{{ loading ? 'Saving...' : 'Save Channel' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>