<template>
  <!-- $title:测试 -->
  <!-- $isMulti:0 -->
  <!-- $isRenew:1 -->
  <!-- $isMenu:1 -->

  <div>test1</div>
  <input />
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'

onUnmounted(() => {
  console.log('测试组件销毁')
})
</script>
