<script setup lang="ts">
import { ref, defineExpose, watch } from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps<{
  searchQuery: string,
  data?: any
}>()

const emit = defineEmits<{
  (e: 'field-select', field: any): void
}>()

interface TreeNode {
  id: string
  label: string
  type: string
  value?: string
  expanded?: boolean
  children?: TreeNode[]
  visible?: boolean
}

const treeData = ref<TreeNode[]>([])

// Convert XML data to tree structure
const buildTreeFromXml = (xmlData: any, parentId: string = ''): TreeNode[] => {
  if (!xmlData) return []

  return Object.entries(xmlData).map(([key, value], index) => {
    const currentId = parentId ? `${parentId}-${index}` : `${index}`
    const node: TreeNode = {
      id: currentId,
      label: key,
      type: 'element',
      expanded: false
    }

    if (typeof value === 'object' && value !== null) {
      node.children = buildTreeFromXml(value, currentId)
    } else if (value !== undefined && value !== null) {
      node.value = String(value)
    }

    return node
  })
}

// Watch for data changes
watch(() => props.data, (newData) => {
  if (newData) {
    treeData.value = buildTreeFromXml(newData)
  }
}, { immediate: true })

const filterTree = (query: string) => {
  const searchRecursive = (nodes: TreeNode[]): boolean => {
    let hasVisibleChild = false
    
    nodes.forEach(node => {
      if (node.children) {
        const childrenVisible = searchRecursive(node.children)
        node.visible = childrenVisible || node.label.toLowerCase().includes(query.toLowerCase())
        if (node.visible) {
          node.expanded = true
          hasVisibleChild = true
        }
      } else {
        node.visible = node.label.toLowerCase().includes(query.toLowerCase())
        if (node.visible) {
          hasVisibleChild = true
        }
      }
    })
    
    return hasVisibleChild
  }
  
  searchRecursive(treeData.value)
}

watch(() => props.searchQuery, (newQuery) => {
  if (newQuery) {
    filterTree(newQuery)
  } else {
    // Reset visibility when search is cleared
    const resetVisibility = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        node.visible = true
        if (node.children) {
          resetVisibility(node.children)
        }
      })
    }
    resetVisibility(treeData.value)
  }
})

const handleNodeToggle = (node: TreeNode) => {
  node.expanded = !node.expanded
}

const handleNodeSelect = (node: TreeNode) => {
  emit('field-select', node)
}

const expandAll = () => {
  const expandNode = (node: TreeNode) => {
    if (node.children) {
      node.expanded = true
      node.children.forEach(expandNode)
    }
  }
  treeData.value.forEach(expandNode)
}

const collapseAll = () => {
  const collapseNode = (node: TreeNode) => {
    if (node.children) {
      node.expanded = false
      node.children.forEach(collapseNode)
    }
  }
  treeData.value.forEach(collapseNode)
}

defineExpose({
  expandAll,
  collapseAll
})
</script>

<template>
  <div class="xml-tree">
    <TreeNode
      v-for="node in treeData"
      :key="node.id"
      :node="node"
      @node-toggle="handleNodeToggle"
      @node-select="handleNodeSelect"
    />
  </div>
</template>