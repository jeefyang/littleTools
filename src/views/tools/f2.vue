<template>
  <!-- $title:简易重命名 -->
  <div>
    <DragFile @files-change="onFilesChangeFn"></DragFile>
  </div>
</template>
<script setup lang="ts">
import DragFile from '@/components/DragFile.vue'

const onFilesChangeFn = (op: {
  fileList: { fullPath: string; f: File }[]
  type: 'drag' | 'select'
  event: Event | DragEvent
}) => {
  console.log(op)
}
</script>
<style lang="scss" scoped></style>
