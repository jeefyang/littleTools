<template>
  <div id="layout" class="body">
    <div class="flex flex-col" style="width: 100%; height: 100%">
      <!-- 标签栏 -->
      <RouterPages></RouterPages>
      <!-- 主体 -->
      <div class="main">
        <RouterView v-slot="{ Component, route }">
          <keep-alive :initCacheKeyList="initCacheKeyList">
            <component :is="Component" :key="`${route.path}?t=${route.query['t']}`"></component>
          </keep-alive>
        </RouterView>
      </div>
    </div>

    <!-- 悬浮按钮  -->
    <FloatBtn></FloatBtn>
    <!-- 登录框 -->
    <LoginModal v-model:show="userStore.isShowLogin"></LoginModal>
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

const initCacheKeyList = ref(<string[]>[])
const routerStore = useRouterStore()
const userStore = useUserStore()

watch(
  () => routerStore.changePageListCount,
  (_v) => {
    initCacheKeyList.value = routerStore.pageList.map((c) => c.cachedPath!)
  },
)
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
