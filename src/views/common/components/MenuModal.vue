<template>
  <n-modal title="菜单" v-model:show="modelShow" preset="dialog">
    <n-card class="menu">
      <div>目录</div>
      <NButton class="btn" v-for="item in routerList" :key="item.router" @click="toUrl(item)">{{
        item.title
      }}</NButton>
    </n-card>
    <template #action>
      <NButton type="primary" @click="((modelShow = false), (userStore.isShowLogin = true))"
        >登录</NButton
      >
      <NButton @click="userStore.logout()">退出</NButton>
    </template>
  </n-modal>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { useRouterStore } from '@/stores/routerStore'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const routerStore = useRouterStore()
const userStore = useUserStore()
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
  return routerStore.routerList.filter((c) => c.isMenu)
})

const toUrl = (item: (typeof routerStore.routerList)[number]) => {
  if (item.isMulti == '1' || item.isRenew == '1') {
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
