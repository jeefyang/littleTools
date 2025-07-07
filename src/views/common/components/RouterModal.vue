<template>
  <n-modal title="路由" v-model:show="modelShow" preset="dialog">
    <NButton class="btn" v-for="item in routerList" :key="item.router" @click="toUrl(item)">{{
      item.title
    }}</NButton>
  </n-modal>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { useRouterStore } from '@/stores/routerStore'
import { useRouter } from 'vue-router'

const routerStore = useRouterStore()
const router = useRouter()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:show'])

const modelShow = computed({
  get: () => props.show,
  set: (v) => emits('update:show', v),
})

const routerList = computed(() => {
  return routerStore.routerList
})

const toUrl = (item: (typeof routerStore.routerList)[number]) => {
  if (item.isMulti == '1') {
    router.push({ path: '/' + item.router, query: { t: new Date().getTime() } })
  } else {
    router.push({ path: '/' + item.router })
  }
  modelShow.value = false
}
</script>
<style lang="scss" scoped>
.btn {
  margin: 10px;
}
</style>
