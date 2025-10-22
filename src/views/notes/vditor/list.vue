<template>
  <!-- $title:V笔记 -->
  <!-- $isMulti:0 -->
  <!-- $isMenu:1 -->
  <n-button @click="modalCreate">新建</n-button>
  <n-modal v-model:show="showModal">
    <n-card
      title="新建笔记"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      style="max-width: 350px"
    >
      <div class="flex flex-items-center flex-justify-between mb-10">
        <div style="width: 100px">笔记名称:</div>
        <n-input
          style="width: 270px"
          :placeholder="defaultNoteName"
          v-model:value="noteName"
        ></n-input>
      </div>
      <n-button class="mt-1" style="float: right" type="primary" @click="toCreate()">新建</n-button>
    </n-card>
  </n-modal>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouterStore } from '@/stores/routerStore'
import { useMessage } from 'naive-ui'
import { UserApis, UtilsApis } from '@/apis/ApisList'

const routerStore = useRouterStore()
const message = useMessage()
const showModal = ref(false)
const defaultNoteName = '新建笔记'
const noteName = ref(defaultNoteName)
let privateToken = ''

const modalCreate = () => {
  noteName.value = ''
  showModal.value = true
}
const toCreate = async () => {
  const res = await UtilsApis.nanoid({ len: 24 })
  if (res.code != 200) {
    message.error(res.msg)
  }
  showModal.value = false
  routerStore.toUrl({
    url: '/notes/vditor/info',
    query: {
      uuid: res.data.id,
      name: noteName.value || defaultNoteName,
      privateToken: privateToken,
      tpye: 'markdown',
    },
  })
}

onMounted(async () => {
  const { data } = await UserApis.getPrivateResToken({ type: 'markdowns' }, { ignoreLogin: true })
  privateToken = data?.token
})

onUnmounted(() => {})
</script>
