<template>
  <div id="layout" class="body">
    <!-- 标签栏 -->
    <RouterPages></RouterPages>
    <!-- 主体 -->
    <div class="main">
      <RouterView v-slot="{ Component, route }">
        <keep-alive :initCacheKeyList="initCacheKeyList">
          <component :is="Component" :key="route.fullPath"></component>
        </keep-alive>
      </RouterView>
    </div>
    <!-- 悬浮按钮  -->
    <FloatBtn></FloatBtn>
  </div>
</template>
<script lang="ts" setup>
import {
  computed,
  onMounted,
  ref,
  watch,
  type Ref,
  markRaw,
  shallowRef,
  type Component,
  type Raw,
  type ShallowRef,
} from 'vue'
import RouterPages from './components/RouterPages.vue'
import FloatBtn from './components/FloatBtn.vue'
import { useRouterStore } from '@/stores/routerStore'

const initCacheKeyList = ref(<string[]>[])
const routerStore = useRouterStore()

watch(
  () => routerStore.changePageListCount,
  (_v) => {
    console.log(routerStore.pageList.map((c) => c.path))
    initCacheKeyList.value = routerStore.pageList.map((c) => c.path)
  },
)
onMounted(() => {})
</script>
<style lang="scss" scoped>
.body {
  width: calc(100vw - 20px);
  height: calc(100vh - 20px);
  margin: 10px;
}
</style>
