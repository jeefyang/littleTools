<template>
  <div id="layout" class="body">
    <!-- 标签栏 -->
    <RouterPages></RouterPages>
    <!-- 主体 -->
    <div class="main">
      <RouterView v-slot="{ Component, route }">
        <KeepAlive>
          <component :is="Component" :key="$route.fullPath"></component>
        </KeepAlive>
      </RouterView>
    </div>
    <!-- 悬浮按钮  -->
    <FloatBtn></FloatBtn>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch, type Ref } from 'vue'
import RouterModal from './components/RouterModal.vue'
import RouterPages from './components/RouterPages.vue'
import FloatBtn from './components/FloatBtn.vue'

onMounted(() => {
  console.log('layout')
})
</script>
<style lang="scss" scoped>
.body {
  width: calc(100vw - 20px);
  height: calc(100vh - 20px);
  margin: 10px;
}
</style>
