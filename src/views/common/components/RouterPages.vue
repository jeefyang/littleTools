<template>
  <n-tabs
    v-model:value="curPage"
    :closable="true"
    type="card"
    @close="closePageFn"
    @update:value="changePageFn"
  >
    <n-tab-pane
      v-for="(item, index) in pageList"
      :key="item.path"
      :name="item.path"
      :closable="index != 0"
    >
      <template #tab>
        <div>{{ item.title }}</div>
      </template>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import { useRouterStore } from '@/stores/routerStore'
import { ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const routerStore = useRouterStore()
const curPage = ref(route.path)

const pageList: Ref<{ title: string; path: string }[]> = ref(
  JSON.parse(
    sessionStorage.getItem('pages') || JSON.stringify([{ title: '首页', path: '/home/index' }]),
  ),
)
const changePageFn = (e: string | number) => {
  const index = pageList.value.findIndex((c) => c.path == e)
  if (index == -1) {
    return
  }
  router.push({ path: pageList.value[index].path })
}

const closePageFn = (e: string | number) => {
  const index = pageList.value.findIndex((c) => c.path == e)
  if (index == -1) {
    return
  }
  const prev = pageList.value[index - 1]
  router.push({ path: prev.path })
  pageList.value.splice(index, 1)
  sessionStorage.setItem('pages', JSON.stringify(pageList.value))
}

watch(
  () => route.path,
  (v) => {
    curPage.value = v

    const index = pageList.value.findIndex((c) => c.path == v)
    // 已经存在
    if (index != -1) {
      return
    }
    const data = routerStore.routerList.find((c) => '/' + c.router == v)
    if (data) {
      pageList.value.push({ title: data.title, path: v })
      sessionStorage.setItem('pages', JSON.stringify(pageList.value))
    }
  },
  { immediate: true },
)
</script>
<style lang="scss" scoped></style>
