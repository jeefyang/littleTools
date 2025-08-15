<template>
  <n-modal title="登录" v-model:show="userStore.isShowLogin" preset="dialog" :mask-closable="false">
    <n-form ref="formRef" :model="model" label-placement="left" class="mt-10">
      <n-form-item
        label="用户"
        path="username"
        :rule="[{ required: true, message: '请输入用户名' }]"
      >
        <n-input v-model:value="model.username" placeholder="请输入用户名" />
      </n-form-item>
      <n-form-item label="密码" path="password" :rule="[{ required: true, message: '请输入密码' }]">
        <n-input
          type="password"
          v-model:value="model.password"
          placeholder="请输入密码"
          show-password-on="click"
          :input-props="{ autocomplete: 'off' }"
        />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button type="primary" @click="submit">登录</n-button>
    </template>
  </n-modal>
</template>
<script lang="ts" setup>
import UserApi from '@/apis/UserApi'
import { useRouterStore } from '@/stores/routerStore'
import { useUserStore } from '@/stores/userStore'
import { saveKeyStorage } from '@/utils/storage'
import type { FormInst } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { computed, onActivated, onUpdated, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const formRef = ref<FormInst | null>(null)
const message = useMessage()
const userStore = useUserStore()
const routerStore = useRouterStore()
const router = useRouter()

const model = reactive<UserApiLogin['from']>({
  username: '',
  password: '',
})

const submit = async () => {
  await formRef.value!.validate()

  UserApi.login(model).then((res) => {
    if (res.code != 200) {
      return message.error(res.msg)
    }
    saveKeyStorage('user', res.data)
    userStore.updateUserInfo()
    routerStore.init(router)
    userStore.isShowLogin = false
    userStore.isUpdateLoginCount++
  })
}

onUpdated(() => {
  Object.keys(model).forEach((key) => {
    //@ts-ignore
    model[key] = ''
  })
})
</script>
<style lang="scss" scoped></style>
