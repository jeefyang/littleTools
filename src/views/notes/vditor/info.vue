<template>
  <!-- $title:$name -->
  <!-- $isMulti:1 -->
  <!-- $isMenu:0 -->
  <!-- $secondName:name -->

  <!-- -->
  <div ref="divRef" class="box"></div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouterStore } from '@/stores/routerStore'
import { useMessage } from 'naive-ui'
import { useRoute } from 'vue-router'
import Vditor from 'vditor'
import 'vditor'
import '@/assets/vditor/less/index.less'
import { UtilsApis } from '../../../apis/ApisList'

const routerStore = useRouterStore()
const message = useMessage()
const route = useRoute()

const divRef = ref<HTMLDivElement>()

const id = (route.query.id || '') as string
const name = (route.query.name || '') as string

onMounted(() => {
  if (!id) {
    message.error('无法找到页面')
  }
  console.time('vditor')
  const v = new Vditor(divRef.value!, {
    cache: { enable: true, id: id },
    height: '100%',
    after: () => {
      console.timeEnd('vditor')
    },
    theme: 'dark',
    preview: {
      theme: {
        current: 'dark',
      },
    },
    upload: {},
  })
})
const toCreate = async () => {
  const res = await UtilsApis.nanoid()
  console.log(res)
  if (res.code != 200) {
    message.error(res.msg)
  }

  routerStore.toUrl({
    url: '/notes/vditor/info',
    query: { id: 'create' },
  })
}
</script>
<style lang="scss" scoped>
.box {
  height: 100%;
}
</style>
