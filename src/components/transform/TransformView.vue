<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import XmlTree from '../xml/XmlTree.vue'
import JsonTree from '../json/JsonTree.vue'
import MappingLine from './MappingLine.vue'
import SaveChannelDialog from './SaveChannelDialog.vue'

const props = defineProps<{
  sourceData: any
  targetData: any
}>()

const router = useRouter()
const searchSourceQuery = ref('')
const searchTargetQuery = ref('')
const mappings = ref<Mapping[]>([])
const selectedSourceNode = ref<any>(null)
const selectedTargetNode = ref<any>(null)
const showSaveDialog = ref(false)

interface Mapping {
  id: string
  sourceId: string
  targetId: string
  sourcePath: string
  targetPath: string
}

const handleSourceSelect = (node: any) => {
  if (selectedTargetNode.value) {
    createMapping(node, selectedTargetNode.value)
    selectedSourceNode.value = null
    selectedTargetNode.value = null
  } else {
    selectedSourceNode.value = node
  }
}

const handleTargetSelect = (node: any) => {
  if (selectedSourceNode.value) {
    createMapping(selectedSourceNode.value, node)
    selectedSourceNode.value = null
    selectedTargetNode.value = null
  } else {
    selectedTargetNode.value = node
  }
}

const createMapping = (source: any, target: any) => {
  // Check if mapping already exists
  const exists = mappings.value.some(
    m => (m.sourceId === source.id && m.targetId === target.id) ||
         (m.sourceId === target.id && m.targetId === source.id)
  )

  if (!exists) {
    const newMapping: Mapping = {
      id: `${source.id}-${target.id}`,
      sourceId: source.id,
      targetId: target.id,
      sourcePath: getNodePath(source),
      targetPath: getNodePath(target)
    }
    mappings.value.push(newMapping)
  }
}

const getNodePath = (node: any): string => {
  const path = []
  let current = node
  
  while (current) {
    path.unshift(current.label)
    const parentId = current.id.split('-').slice(0, -1).join('-')
    const parentElement = document.querySelector(`[data-node-id="${parentId}"]`)
    if (parentElement) {
      const parentLabel = parentElement.querySelector('span')?.textContent
      if (parentLabel) {
        current = { id: parentId, label: parentLabel }
      } else {
        current = null
      }
    } else {
      current = null
    }
  }
  
  return path.join('.')
}

const removeMapping = (mappingId: string) => {
  mappings.value = mappings.value.filter(m => m.id !== mappingId)
}

const exportToCsv = () => {
  const csvContent = mappings.value.map(m => 
    `${m.sourcePath},${m.targetPath}`
  ).join('\n')
  
  const blob = new Blob([`Source,Target\n${csvContent}`], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mappings.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}

const reset = () => {
  mappings.value = []
  selectedSourceNode.value = null
  selectedTargetNode.value = null
}

const suggest = () => {
  const findMatchingNodes = (sourceNode: any, targetNode: any) => {
    if (!sourceNode || !targetNode) return

    // Check if names match
    if (sourceNode.label.toLowerCase() === targetNode.label.toLowerCase()) {
      createMapping(sourceNode, targetNode)
    }

    // Recursively check children
    if (sourceNode.children && targetNode.children) {
      sourceNode.children.forEach((sChild: any) => {
        targetNode.children.forEach((tChild: any) => {
          findMatchingNodes(sChild, tChild)
        })
      })
    }
  }

  // Start matching from root nodes
  if (props.sourceData && props.targetData) {
    findMatchingNodes({ 
      children: props.sourceData, 
      label: 'root' 
    }, { 
      children: props.targetData, 
      label: 'root' 
    })
  }
}

const handleSave = () => {
  showSaveDialog.value = true
}

const handleChannelSaved = (channelId: number) => {
  showSaveDialog.value = false
  router.push('/dashboard')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Instructions -->
    <div class="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
      <p>Click on a field in each tree to create a mapping between them.</p>
      <div v-if="selectedSourceNode || selectedTargetNode" class="mt-2">
        <span class="font-medium">Selected: </span>
        <span v-if="selectedSourceNode" class="text-blue-600">{{ selectedSourceNode.label }}</span>
        <span v-if="selectedSourceNode && selectedTargetNode"> → </span>
        <span v-if="selectedTargetNode" class="text-blue-600">{{ selectedTargetNode.label }}</span>
      </div>
    </div>

    <div class="flex gap-6">
      <!-- Source Tree -->
      <div class="w-1/2 card source-tree">
        <div class="p-4 border-b border-gray-100">
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="searchSourceQuery"
              type="text"
              placeholder="Search source fields..."
              class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        </div>
        <div class="p-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
          <XmlTree
            :data="sourceData"
            :search-query="searchSourceQuery"
            @field-select="handleSourceSelect"
          />
        </div>
      </div>

      <!-- Target Tree -->
      <div class="w-1/2 card target-tree">
        <div class="p-4 border-b border-gray-100">
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="searchTargetQuery"
              type="text"
              placeholder="Search target fields..."
              class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        </div>
        <div class="p-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
          <JsonTree
            :data="targetData"
            :search-query="searchTargetQuery"
            @field-select="handleTargetSelect"
          />
        </div>
      </div>
    </div>

    <!-- Mapping Lines Container -->
    <div class="relative" style="height: 2px">
      <MappingLine
        v-for="mapping in mappings"
        :key="mapping.id"
        :mapping="mapping"
        @remove="removeMapping"
      />
    </div>

    <!-- Mappings List -->
    <div v-if="mappings.length > 0" class="card p-4">
      <h3 class="text-sm font-medium text-gray-700 mb-3">Current Mappings</h3>
      <div class="space-y-2">
        <div 
          v-for="mapping in mappings" 
          :key="mapping.id"
          class="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
        >
          <div class="flex items-center">
            <span class="text-gray-600">{{ mapping.sourcePath }}</span>
            <i class="pi pi-arrow-right mx-2 text-gray-400"></i>
            <span class="text-gray-600">{{ mapping.targetPath }}</span>
          </div>
          <button 
            @click="removeMapping(mapping.id)"
            class="text-gray-400 hover:text-red-500"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between">
      <div class="space-x-3">
        <button @click="exportToCsv" class="btn-secondary">
          <i class="pi pi-file-export mr-2"></i>
          Export to CSV
        </button>
        <button @click="reset" class="btn-secondary">
          <i class="pi pi-refresh mr-2"></i>
          Reset
        </button>
        <button @click="suggest" class="btn-secondary">
          <i class="pi pi-bolt mr-2"></i>
          Suggest
        </button>
      </div>
      <button @click="handleSave" class="btn-primary">
        <i class="pi pi-save mr-2"></i>
        Save as Channel
      </button>
    </div>

    <!-- Save Channel Dialog -->
    <SaveChannelDialog
      v-if="showSaveDialog"
      :show="showSaveDialog"
      :mappings="mappings"
      @close="showSaveDialog = false"
      @saved="handleChannelSaved"
    />
  </div>
</template>