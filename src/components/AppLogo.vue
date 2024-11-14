<script setup lang="ts">
const props = defineProps<{
  size?: 'small' | 'medium' | 'large'
}>()

const sizes = {
  small: 'text-xl',
  medium: 'text-2xl',
  large: 'text-3xl'
}
</script>

<template>
  <div class="flex items-center gap-2">
    <i class="pi pi-file-export" :class="[sizes[size || 'medium']]"></i>
    <span class="font-semibold" :class="[sizes[size || 'medium']]">FileTransform</span>
  </div>
</template>