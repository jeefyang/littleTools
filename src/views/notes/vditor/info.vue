<template>
  <!-- $title:$name -->
  <!-- $isMulti:1 -->
  <!-- $isMenu:0 -->
  <!-- $secondName:uuid -->

  <!-- -->
  <!-- 主页面 -->
  <div ref="divRef" class="box"></div>
  <!-- 设置 -->
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="设置"
    size="huge"
    :bordered="false"
    style="width: 600px"
    @close="closeConfigModalFn"
  >
    <div class="mb-2">标题</div>
    <n-input v-model:value="formdata.name" type="text" placeholder="请输入文章标题" />
    <div class="mt-2 mb-2">描述</div>
    <n-input v-model:value="formdata.name" type="text" placeholder="请输入文章描述" />
    <div class="mt-2 mb-2">标签</div>
    <div>
      <n-tag
        class="m-1 tag"
        v-for="(item, index) in tagsList"
        :key="index"
        :type="formdata.tags.includes(item) ? 'default' : 'primary'"
        @click="selectTagFn(item)"
        >{{ item }}</n-tag
      >
    </div>
    <n-input
      style="width: 50%"
      v-model:value="newTag"
      type="text"
      placeholder="新增新的标签"
      class="mr-4"
    ></n-input>
    <n-button @click="addNewTagFn">新增</n-button>
    <template #footer>
      <n-button type="primary" @click="saveConfigFn">保存确认</n-button>
    </template>
  </n-modal>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouterStore } from '@/stores/routerStore'
import { useMessage } from 'naive-ui'
import { useRoute } from 'vue-router'
import Vditor from 'vditor'
// import 'vditor'
import '@/assets/vditor/less/index.less'
import { NotesApis, UserApis, UtilsApis } from '@/apis/ApisList'
import { jFetch, jFetchFile, jFetchFormdata, jFetchUpload } from '@/utils/jFetch'
import { useUserStore } from '@/stores/userStore'

const routerStore = useRouterStore()
const message = useMessage()
const route = useRoute()
const userStore = useUserStore()

let oldFormdata: {
  name: string
  tags: string[]
  desc: string
} = {
  name: '',
  tags: [],
  desc: '',
}
const formdata = reactive({ ...oldFormdata })
const tagsList = ref(<string[]>[])

const divRef = ref<HTMLDivElement>()
const showModal = ref(false)
const newTag = ref('')

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

/** 关闭设置弹窗 */
const closeConfigModalFn = () => {
  Object.keys(formdata).forEach((key) => {
    // @ts-expect-error
    formdata[key] = oldFormdata[key]
  })
}

/** 选择标签 */
const selectTagFn = (tag: string) => {
  const index = formdata.tags.indexOf(tag)
  if (index == -1) {
    formdata.tags.push(tag)
  } else {
    formdata.tags.splice(index, 1)
  }
}

/** 新增新标签 */
const addNewTagFn = () => {
  const index = tagsList.value.indexOf(newTag.value)
  if (index != -1) {
    message.warning('标签已存在')
    return
  }
  tagsList.value.push(newTag.value)
  newTag.value = ''
  selectTagFn(newTag.value)
}

/** 保存设置 */
const saveConfigFn = () => {}

/** 保存文章 */
const saveContentFn = async () => {}

/** 创建对象 */
const createVditor = (content?: string) => {
  const v = new Vditor(divRef.value!, {
    cache: { enable: true, id: uuid },
    height: '100%',
    after: () => {
      if (content != '' && content != undefined) {
        v.setValue(content, true)
      }
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
          renameType: 'md5',
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
          {
            hotkey: '⌘S',
            name: 'save',
            icon: '保存',
            click: async () => {
              await saveContentFn()
            },
          },
          {
            name: 'config',
            icon: '设置',
            click: async () => {
              oldFormdata = { ...formdata }
              showModal.value = true
            },
          },
        ],
      },
    ],
  })
  return v
}

const getTagsList = async () => {
  const { data, code } = await NotesApis.markdownTagList()
  if (data) {
    tagsList.value = data.list
  }
}

const init = async () => {
  const { data } = await UserApis.getPrivateResToken({ type: 'markdowns' }, { ignoreLogin: true })
  if (data) {
    privateToken = data.token
  }
  if (privateToken) {
    const res = await jFetchFile({
      isPrivate: true,
      token: privateToken,
      url: `${uuid}/index.md`,
    })
    console.log(res.status)
    if (res.status == 200) {
      mdStr = await res.text()
    }
  }
  console.log(mdStr)
  const v = createVditor(mdStr)
  await getTagsList()
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
.tag {
  user-select: none;
}
.tag:hover {
  cursor: pointer;
}
</style>
