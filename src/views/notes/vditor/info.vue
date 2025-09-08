<template>
  <!-- $title:$name -->
  <!-- $isMulti:1 -->
  <!-- $isMenu:0 -->
  <!-- $secondName:name -->

  <!-- -->
  <n-button @click="toCreate">新建</n-button>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouterStore } from '@/stores/routerStore'
import UtilsApi from '@/apis/UtilsApi'
import { useMessage } from 'naive-ui'
import { useRoute } from 'vue-router'

const routerStore = useRouterStore()
const message = useMessage()
const route = useRoute()

const id = route.query.id || ''
const name = route.query.name || ''

onMounted(() => {
  if (!id) {
    message.error('无法找到页面')
  }
})
const toCreate = async () => {
  const res = await UtilsApi.nanoid()
  console.log(res)
  if (res.code != 200) {
    message.error(res.msg)
  }

  routerStore.toUrl({
    url: '/notes/vditor/info',
    query: { id: 'create' },
  })
}
</script>
