<template>
  <!-- $title:$name -->
  <!-- $isMulti:1 -->
  <!-- $isMenu:0 -->
  <!-- $secondName:uuid -->

  <!-- -->
  <div ref="divRef" class="box"></div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouterStore } from '@/stores/routerStore'
import { useMessage } from 'naive-ui'
import { useRoute } from 'vue-router'
import Vditor from 'vditor'
// import 'vditor'
import '@/assets/vditor/less/index.less'
import { UtilsApis } from '../../../apis/ApisList'

const routerStore = useRouterStore()
const message = useMessage()
const route = useRoute()

const divRef = ref<HTMLDivElement>()

const uuid = (route.query.uuid || '') as string
const name = (route.query.name || '') as string

onMounted(() => {
  if (!uuid) {
    message.error('无法找到页面')
  }
  console.time('vditor')
  const v = new Vditor(divRef.value!, {
    cache: { enable: true, id: uuid },
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
    upload: {
      url: `api/upload?type=markdown&uuid=${uuid}`,
      validate(files) {
        return true
      },
      handler(file) {
        return new Promise((resolve, _reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file[0])
          reader.onload = () => {
            resolve(reader.result as string)
          }
        }) as Promise<string>
      },
    },
    toolbar: [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      'insert-before',
      'insert-after',
      '|',
      'upload',
      'record',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'fullscreen',
      'edit-mode',
      {
        name: 'more',
        toolbar: [
          'both',
          'code-theme',
          'content-theme',
          'export',
          'outline',
          'preview',
          'devtools',
          'info',
          'help',
        ],
      },
    ],
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
