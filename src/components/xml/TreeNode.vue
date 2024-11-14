<script setup lang="ts">
interface TreeNodeProps {
  id: string
  label: string
  type: string
  value?: string
  expanded?: boolean
  children?: TreeNodeProps[]
  visible?: boolean
}

const props = defineProps<{
  node: TreeNodeProps
}>()

const emit = defineEmits<{
  (e: 'node-toggle', node: TreeNodeProps): void
  (e: 'node-select', node: TreeNodeProps): void
}>()

const toggleNode = (node: TreeNodeProps) => {
  emit('node-toggle', node)
}

const selectNode = (node: TreeNodeProps) => {
  emit('node-select', node)
}
</script>

<template>
  <div v-if="node.visible !== false" class="tree-node">
    <div
      :data-node-id="node.id"
      class="flex items-center py-1 px-2 rounded hover:bg-gray-50 cursor-pointer"
      @click="selectNode(node)"
    >
      <i
        v-if="node.children"
        class="pi mr-2 text-gray-400 cursor-pointer"
        :class="node.expanded ? 'pi-chevron-down' : 'pi-chevron-right'"
        @click.stop="toggleNode(node)"
      ></i>
      <i
        v-else
        class="pi pi-circle-fill mr-2 text-[0.5rem] text-blue-400"
      ></i>
      <span class="text-sm">{{ node.label }}</span>
      <span v-if="node.value" class="text-xs text-gray-500 ml-2">({{ node.value }})</span>
    </div>
    
    <div
      v-if="node.children && node.expanded"
      class="pl-6"
    >
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @node-toggle="$emit('node-toggle', $event)"
        @node-select="$emit('node-select', $event)"
      />
    </div>
  </div>
</template>