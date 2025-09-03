<template>
  <!-- $title:测试 -->
  <!-- $isMulti:0 -->
  <!-- $isRenew:1 -->
  <!-- $isMenu:1 -->

  <div>test</div>
  <div>随机数:{{ random }}</div>
  <n-button @click="toUrl('test3-' + Math.random().toString())">跳到测试3(随机)</n-button>
  <n-button @click="toUrl('test3')">跳到测试3(固定)</n-button>

  <input />
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useRouterStore } from '@/stores/routerStore'

const routerStore = useRouterStore()

const random = Math.random()

const toUrl = (id: string) => {
  routerStore.toUrl({ url: '/test3/index', query: { id } })
}

onUnmounted(() => {
  console.log('测试组件销毁')
})
</script>
