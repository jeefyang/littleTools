<template>
  <!-- 主体 -->
  <div class="main">
    123
    <RouterView v-slot="{ Component, route }">
      <KeepAlive>
        <component :is="Component" :key="$route.fullPath"></component>
      </KeepAlive>
    </RouterView>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
onMounted(() => {
  console.log('layout')
})
</script>
<style lang="scss" scoped></style>
