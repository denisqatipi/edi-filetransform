<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  mapping: {
    id: string
    sourceId: string
    targetId: string
    sourcePath: string
    targetPath: string
  }
}>()

const emit = defineEmits<{
  (e: 'remove', id: string): void
}>()

const line = ref<SVGPathElement | null>(null)
const sourcePoint = ref({ x: 0, y: 0 })
const targetPoint = ref({ x: 0, y: 0 })

const updateLine = () => {
  const sourceEl = document.querySelector(`[data-node-id="${props.mapping.sourceId}"]`)
  const targetEl = document.querySelector(`[data-node-id="${props.mapping.targetId}"]`)

  if (sourceEl && targetEl) {
    const sourceRect = sourceEl.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()
    const containerRect = document.querySelector('.source-tree')?.getBoundingClientRect()

    if (containerRect) {
      sourcePoint.value = {
        x: sourceRect.right - containerRect.left,
        y: sourceRect.top - containerRect.top + sourceRect.height / 2
      }
      targetPoint.value = {
        x: targetRect.left - containerRect.left,
        y: targetRect.top - containerRect.top + targetRect.height / 2
      }
    }
  }
}

// Update lines when window is resized
const resizeObserver = new ResizeObserver(() => {
  updateLine()
})

onMounted(() => {
  const container = document.querySelector('.source-tree')
  if (container) {
    resizeObserver.observe(container)
  }
  updateLine()
})

onUnmounted(() => {
  resizeObserver.disconnect()
})

const removeLine = () => {
  emit('remove', props.mapping.id)
}
</script>

<template>
  <svg class="absolute top-0 left-0 w-full h-full pointer-events-none">
    <!-- Curved connection line -->
    <path
      :d="`M ${sourcePoint.x} ${sourcePoint.y} 
           C ${sourcePoint.x + 100} ${sourcePoint.y},
             ${targetPoint.x - 100} ${targetPoint.y},
             ${targetPoint.x} ${targetPoint.y}`"
      class="stroke-blue-400"
      fill="none"
      stroke-width="2"
    />
    
    <!-- Connection points -->
    <circle
      :cx="sourcePoint.x"
      :cy="sourcePoint.y"
      r="4"
      class="fill-blue-500 cursor-pointer"
      @click="removeLine"
    />
    <circle
      :cx="targetPoint.x"
      :cy="targetPoint.y"
      r="4"
      class="fill-blue-500 cursor-pointer"
      @click="removeLine"
    />
  </svg>
</template>