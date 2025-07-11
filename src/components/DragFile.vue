<template>
  <div
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <slot name="content" :triggerFileInput="triggerFileInput">
      <div
        class="drop-zone"
        :style="{ 'border-color': isDragActive ? themeVars.primaryColor : themeVars.textColorBase }"
      >
        <div class="text-align-center">
          <p class="mb-5">拖拽文件或文件夹到此处</p>
          <n-button type="primary" @click="triggerFileInput">选择文件</n-button>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useThemeVars } from 'naive-ui'

const themeVars = useThemeVars()
console.log(themeVars.value)

type JFile = {
  fullPath: string
  f: File
}

const isDragActive = ref(false)
const emits = defineEmits<{
  filesChange: [
    {
      fileList: { fullPath: string; f: File }[]
      type: 'drag' | 'select'
      event: Event | DragEvent
    },
  ]
}>()

const props = defineProps({
  /** 是否允许选择文件夹(只影响点击文件选择框时) */
  haveDirectory: {
    type: Boolean,
    default: true,
  },
  /** 是否允许多选(只影响点击文件选择框时) */
  multiple: {
    type: Boolean,
    default: false,
  },
})

// 处理拖拽进入
const handleDragEnter = (_e: any) => {
  isDragActive.value = true
}

// 处理拖拽悬停
const handleDragOver = (e: any) => {
  isDragActive.value = true
}

// 处理拖拽离开
const handleDragLeave = (e: any) => {
  isDragActive.value = false
}

// 处理文件放置
const handleDrop = async (e: DragEvent) => {
  isDragActive.value = false
  const droppedItems: DataTransferItemList = e.dataTransfer!.items
  const itemList = [...droppedItems]
  const list: JFile[] = []
  if (itemList.length) {
    // 由于文件读取系统等待异步的时候就会丢失,需要并发处理
    await Promise.all(
      itemList.map(async (item) => {
        const entry = item.webkitGetAsEntry()!
        await loopFile(entry, '', list)
        return
      }),
    )
  }

  emits('filesChange', {
    type: 'drag',
    fileList: list,
    event: e,
  })
}

const loopFile = async (entry: FileSystemEntry, dir: string, list: JFile[]) => {
  if (entry.isDirectory) {
    const directoryEntry: FileSystemDirectoryEntry = <any>entry
    const reader = directoryEntry.createReader()
    await new Promise((resolve, reject) => {
      reader.readEntries(async (entries) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i]
          await loopFile(entry, `${dir}${directoryEntry.name}/`, list)
        }
        resolve(entries)
      })
    })
  } else if (entry.isFile) {
    const fileEntry: FileSystemFileEntry = <any>entry
    const file: File = await new Promise((resolve, reject) => {
      fileEntry.file((file) => {
        resolve(file)
      })
    })
    list.push({ fullPath: `${dir}${file.name}`, f: file })
  }
  return list
}

// 触发文件选择对话框
const triggerFileInput = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = props.multiple
  input.webkitdirectory = props.haveDirectory
  input.onchange = (e) => {
    const files: FileList = (<any>e.target).files
    const list: JFile[] = []
    for (let i = 0; i < files.length; i++) {
      list.push({ fullPath: files[i].webkitRelativePath! || files[i].name, f: files[i] })
    }
    emits('filesChange', {
      type: 'select',
      fileList: list,
      event: e,
    })
  }
  input.click()
}

// 暴露方法，允许父组件获取文件列表
defineExpose({})
</script>

<style lang="scss" scoped>
.drop-zone {
  width: 100%;
  min-height: 200px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: all 0.3s ease;
}

.drop-active {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.05);
}
</style>
