<template>
  <!-- $title:简易重命名 -->
  <div>
    <DragFile @files-change="onFilesChangeFn">
      <template #content="{ triggerFileInput }">
        <n-card class="files"></n-card>
      </template>
    </DragFile>
  </div>
</template>
<script setup lang="ts">
import DragFile from '@/components/DragFile.vue'
import { type JFile } from '@/components/DragFile.vue'

type JRenameFile = {
  originName: string
  renameList: {
    type: string
    name: string
  }
}

const onFilesChangeFn = (op: {
  fileList: JFile[]
  type: 'drag' | 'select'
  event: Event | DragEvent
}) => {
  console.log(op)
}
</script>
<style lang="scss" scoped>
.files {
  width: 100%;
  overflow: auto;
  min-height: 200px;
}
</style>
