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
import { UserApis, UtilsApis } from '@/apis/ApisList'
import { jFetch, jFetchFile, jFetchFormdata, jFetchUpload } from '@/utils/jFetch'
import { useUserStore } from '@/stores/userStore'

const routerStore = useRouterStore()
const message = useMessage()
const route = useRoute()
const userStore = useUserStore()

const divRef = ref<HTMLDivElement>()

const uuid = (route.query.uuid || '') as string
const name = (route.query.name || '') as string
/** 私有token */
let privateToken = (route.query.privateToken as string) || ''
let mdStr = ''

/** 判断状态 */
const checkStatus = async () => {
  if (!userStore.checkIsLogin()) {
    userStore.isShowLogin = true
    return false
  }
  const { data } = await UserApis.getPrivateResToken({ type: 'markdowns' })

  privateToken = data.token
}

const createVditor = () => {
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
      markdown: {
        linkBase: `${import.meta.env.VITE_API_BASE_URL}privateRes/${privateToken}`,
      },
    },
    upload: {
      fieldName: 'file',
      validate(file) {
        return true
      },
      async handler(files) {
        if (!userStore.userInfo.token) console.log('handler')
        const formdata = new FormData()
        // console.log(file[0])
        formdata.append('file', files[0])
        const res = await jFetchUpload({
          formdata: formdata,
          privateType: 'markdown',
          dir: uuid,
          renameType: 'sha256',
        })
        if (res.code == 200) {
          v.insertValue(`![${res.data.filename}](${res.data.displayUrl})`)
          return '上传成功'
        } else if (res.code == 401) {
          return '请先登录'
        } else if (res.code == 404) {
          return '上传错误位置'
        }
        return ''
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
  return v
}

const init = async () => {
  const { data } = await UserApis.getPrivateResToken({ type: 'markdowns' }, { ignoreLogin: true })
  if (data) {
    privateToken = data.token
  }
  if (privateToken) {
    mdStr = await jFetchFile({
      isPrivate: true,
      token: privateToken,
      url: `${uuid}/index.md`,
    }).then((res) => res.text())
  }
  const v = createVditor()
  v.setValue(mdStr, true)
}

onMounted(() => {
  if (!uuid) {
    message.error('无法找到页面')
    return
  }
  console.time('vditor')
  init()
})
</script>
<style lang="scss" scoped>
.box {
  height: 100%;
}
</style>
