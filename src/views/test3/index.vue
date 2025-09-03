<template>
  <!-- $title:$id -->
  <!-- $secondName:id -->

  <div>test3</div>
  <div>随机:{{ random }}</div>
  <div>id:{{ route.query['id'] }}</div>
  <input />
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const random = Math.random()

onUnmounted(() => {
  console.log('测试组件销毁')
})
</script>
