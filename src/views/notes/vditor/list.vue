<template>
  <!-- $title:V笔记 -->
  <!-- $isMulti:0 -->
  <!-- $isMenu:1 -->
  <n-button @click="toCreate">新建</n-button>
</template>
<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useRouterStore } from '@/stores/routerStore'
import { useMessage } from 'naive-ui'
import { UtilsApis } from '../../../apis/ApisList'

const routerStore = useRouterStore()
const message = useMessage()
const toCreate = async () => {
  const res = await UtilsApis.nanoid({ len: 24 })
  console.log(res)
  if (res.code != 200) {
    message.error(res.msg)
  }

  routerStore.toUrl({
    url: '/notes/vditor/info',
    query: { uuid: res.data.id, name: '新建笔记1' },
  })
}

onUnmounted(() => {})
</script>
