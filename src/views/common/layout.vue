<template>
  <div id="layout" class="body">
    <div class="flex flex-col" style="width: 100%; height: 100%">
      <!-- 标签栏 -->
      <RouterPages></RouterPages>
      <!-- 主体 -->
      <div class="main">
        <RouterView v-slot="{ Component, route }">
          <keep-alive :initCacheKeyList="initCacheKeyList">
            <component :is="Component" :key="getRouterKey(route.path, route.query)"></component>
          </keep-alive>
        </RouterView>
      </div>
    </div>

    <!-- 悬浮按钮  -->
    <FloatBtn></FloatBtn>
    <!-- 登录框 -->
    <LoginModal></LoginModal>
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
import LoginModal from './components/LoginModal.vue'
import { useUserStore } from '@/stores/userStore'
import type { LocationQuery } from 'vue-router'

const initCacheKeyList = ref(<string[]>[])
const routerStore = useRouterStore()

watch(
  () => routerStore.changePageListCount,
  (_v) => {
    initCacheKeyList.value = routerStore.pageList.map((c) => c.cachedPath!)
  },
)

const getRouterKey = (path: string, query: LocationQuery) => {
  const data = routerStore.routerList.find((c) => '/' + c.router == path)
  return routerStore.getRouterKey(data || path, query)
}

onMounted(() => {})
</script>
<style lang="scss" scoped>
.body {
  width: calc(100vw - 20px);
  height: calc(100vh - 20px);
  margin: 10px;
  overflow: hidden;
}

.main {
  flex: 1;
  overflow: auto;
}
</style>
