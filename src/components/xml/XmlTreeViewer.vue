<script setup lang="ts">
import { ref } from 'vue'
import XmlTree from './XmlTree.vue'
import XmlFieldDetails from './XmlFieldDetails.vue'

const props = defineProps<{
  data?: any
}>()

const emit = defineEmits<{
  (e: 'save'): void
}>()

const selectedField = ref<XmlField | null>(null)
const searchQuery = ref('')
const xmlTreeRef = ref<InstanceType<typeof XmlTree> | null>(null)

interface XmlField {
  id: string
  label: string
  name: string
  description?: string
  type: 'element' | 'attribute'
  value?: string
  children?: XmlField[]
  mandatory?: boolean
}

const handleFieldSelect = (field: XmlField) => {
  selectedField.value = field
}

const handleExpand = () => {
  xmlTreeRef.value?.expandAll()
}

const handleCollapse = () => {
  xmlTreeRef.value?.collapseAll()
}

const handleSave = () => {
  emit('save')
}
</script>

<template>
  <div class="flex gap-6">
    <!-- Left Panel - Tree View -->
    <div class="w-1/2 card">
      <div class="p-4 border-b border-gray-100">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search fields..."
              class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <button 
            @click="handleExpand"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <i class="pi pi-plus mr-1"></i>
            Expand
          </button>
          <button 
            @click="handleCollapse"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <i class="pi pi-minus mr-1"></i>
            Collapse
          </button>
        </div>
      </div>
      <div class="p-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
        <XmlTree 
          ref="xmlTreeRef"
          :search-query="searchQuery"
          :data="data"
          @field-select="handleFieldSelect" 
        />
      </div>
    </div>

    <!-- Right Panel - Field Details -->
    <div class="w-1/2 card">
      <div class="p-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">Details of selected field</h2>
      </div>
      <div class="p-4">
        <XmlFieldDetails :field="selectedField" />
      </div>
    </div>
  </div>

  <!-- Bottom Actions -->
  <div class="flex justify-end gap-3 mt-6">
    <button class="btn-secondary">
      <i class="pi pi-times mr-2"></i>
      Reset
    </button>
    <button @click="handleSave" class="btn-primary">
      <i class="pi pi-check mr-2"></i>
      Save
    </button>
  </div>
</template>