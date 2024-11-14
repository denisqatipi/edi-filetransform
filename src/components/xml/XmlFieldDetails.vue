<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  field: {
    id: string
    label: string
    name?: string
    description?: string
    type: 'element' | 'attribute'
    mandatory?: boolean
  } | null
}>()

const hasField = computed(() => props.field !== null)
</script>

<template>
  <div v-if="hasField" class="space-y-6">
    <!-- General Section -->
    <div>
      <h3 class="text-sm font-medium text-blue-600 mb-4">General</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            LABEL
          </label>
          <input
            type="text"
            :value="field?.label"
            class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            DESCRIPTION
          </label>
          <textarea
            :value="field?.description"
            rows="3"
            class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            NAME
          </label>
          <input
            type="text"
            :value="field?.name || field?.label"
            class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
      </div>
    </div>

    <!-- Validations Section -->
    <div>
      <h3 class="text-sm font-medium text-blue-600 mb-4">Validations</h3>
      
      <div class="space-y-4">
        <div class="flex items-center">
          <input
            type="checkbox"
            :checked="field?.mandatory"
            id="mandatory"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="mandatory" class="ml-2 text-sm text-gray-700">
            MANDATORY?
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            CUSTOM
          </label>
          <button class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            <i class="pi pi-plus mr-1"></i>
            ADD
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center text-gray-500 py-8">
    <i class="pi pi-file-edit text-4xl mb-2"></i>
    <p>Select a field to view and edit its details</p>
  </div>
</template>