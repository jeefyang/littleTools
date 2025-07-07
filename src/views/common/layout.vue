<template>
  <div id="layout" class="body">
    <!-- 标签栏 -->
    <RouterPages></RouterPages>
    <n-button @click="look">测试</n-button>
    <!-- 主体 -->
    <div class="main">
      <RouterView v-slot="{ Component, route }">
        <KeepAlive ref="keepAliveRef">
          <component :is="Component" :key="route.fullPath"></component>
        </KeepAlive>
      </RouterView>
    </div>
    <!-- 悬浮按钮  -->
    <FloatBtn></FloatBtn>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import RouterPages from './components/RouterPages.vue'
import FloatBtn from './components/FloatBtn.vue'
import { useRouterStore } from '@/stores/routerStore'

const keepAliveRef = ref(<any>null)
const routerStore = useRouterStore()
const look = () => {
  console.log(keepAliveRef.value)
  console.log(keepAliveRef.value._.__v_cache)
}

watch(
  () => routerStore.changePageListCount,
  () => {
    const list = routerStore.pageList.filter((c) => c.fullPath).map((c) => c.fullPath)
    const cacheMap: Map<string, any> = keepAliveRef.value._.__v_cache
    cacheMap.forEach((v, k) => {
      if (!list.includes(k)) {
        console.log(`${k} 已经不存在,需要销毁`)
        console.log(cacheMap.get(k))
        cacheMap.get(k).ctx?.unmount?.()
        // cacheMap.delete(k)
      }
    })
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
