<template>
  <n-tabs
    v-model:value="routerStore.curPage"
    :closable="true"
    type="card"
    @close="closePageFn"
    @update:value="changePageFn"
  >
    <n-tab-pane
      v-for="(item, index) in routerStore.pageList"
      :key="item.cachedPath"
      :name="item.cachedPath!"
      :closable="index != 0"
    >
      <template #tab>
        <div>{{ item.title }}</div>
      </template>
    </n-tab-pane>
    <template #suffix>
      <n-dropdown placement="bottom-end" trigger="click" :options="menuList" @select="menuSelectFn">
        <n-button>
          <n-icon><ThreePoints></ThreePoints></n-icon>
        </n-button>
      </n-dropdown>
    </template>
  </n-tabs>
</template>

<script setup lang="ts">
import { useRouterStore } from '@/stores/routerStore'
import { onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ThreePoints from '@/assets/threePoints.svg'

const route = useRoute()
const router = useRouter()
const routerStore = useRouterStore()

const menuList: { key: string; label: string }[] = [
  { key: 'close', label: '关闭' },
  { key: 'closeRight', label: '关闭右边' },
  { key: 'closeLeft', label: '关闭左边' },
  { key: 'closeAll', label: '关闭全部' },
  { key: 'closeOther', label: '关闭其他' },
]

const menuSelectFn = (e: string) => {
  switch (e) {
    case 'close':
      var index = routerStore.pageList.findIndex((c) => c.path == routerStore.curPage)
      if (index >= 1) {
        router.push({
          path: routerStore.pageList[index - 1].path,
          query: routerStore.pageList[index - 1].query,
        })
        routerStore.pageList.splice(index, 1)
      }
      break
    case 'closeRight':
      var index = routerStore.pageList.findIndex((c) => c.path == routerStore.curPage)
      if (index != -1) {
        routerStore.pageList.splice(index + 1, routerStore.pageList.length)
        routerStore.pageList = routerStore.pageList.slice(0, index + 1)
      }
      break
    case 'closeLeft':
      var index = routerStore.pageList.findIndex((c) => c.path == routerStore.curPage)
      if (index != -1) {
        routerStore.pageList = [routerStore.pageList[0], ...routerStore.pageList.slice(index)]
      }
      break
    case 'closeAll':
      router.push({ path: routerStore.pageList[0].path, query: routerStore.pageList[0].query })
      routerStore.pageList = [routerStore.pageList[0]]
      break
    case 'closeOther':
      var index = routerStore.pageList.findIndex((c) => c.path == routerStore.curPage)
      if (index != -1) {
        routerStore.pageList = [routerStore.pageList[0], routerStore.pageList[1]]
      }
      break
  }
  routerStore.changePageListCount++
  routerStore.savePages()
}

/** 改变选中的页面 */
const changePageFn = (e: string | number) => {
  console.log('change')
  const index = routerStore.pageList.findIndex((c) => c.cachedPath == e)
  if (index == -1) {
    return
  }
  router.push({
    path: routerStore.pageList[index].path,
    query: routerStore.pageList[index].query || {},
  })
}

/** 关闭页面 */
const closePageFn = (e: string | number) => {
  const index = routerStore.pageList.findIndex((c) => c.cachedPath == e)
  if (index == -1) {
    return
  }
  const prev = routerStore.pageList[index - 1]
  router.push({ path: prev.path, query: prev.query || {} })
  routerStore.pageList.splice(index, 1)
  routerStore.savePages()
  routerStore.changePageListCount++
}

watch(
  () => [route.path, route.fullPath, route.query],
  ([path, fullPath, query]) => {
    console.log('router change', path, fullPath, query)
    routerStore.changePageListCount++
    if (routerStore.pageList.length == 0) {
      routerStore.pageList = routerStore.loadPages()
    }
    const data = routerStore.routerList.find((c) => '/' + c.router == path)
    // 没有找到路由
    if (!data) {
      return
    }
    const cachedPath = `${path}?t=${(query as { t: string })['t']}`
    routerStore.curPage = cachedPath
    const index = routerStore.pageList.findIndex((c) => c.cachedPath == cachedPath)
    // 已经存在
    if (index != -1) {
      routerStore.pageList[index].fullPath = fullPath as string
      return
    }
    const newItem: (typeof routerStore.pageList)[number] = {
      title: data.title,
      path: path as string,
      query: <any>route.query || {},
      fullPath: fullPath as string,
      cachedPath: cachedPath,
    }
    if (data.isRenew && routerStore.pageList.findIndex((c) => c.path == path) >= 0) {
      routerStore.pageList[routerStore.pageList.findIndex((c) => c.path == path)] = newItem
    } else {
      routerStore.pageList.push(newItem)
    }
    routerStore.savePages()
  },
  { immediate: true },
)
</script>
<style lang="scss" scoped></style>
