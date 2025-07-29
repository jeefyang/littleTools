<template>
  <n-modal title="登录" v-model:show="modelShow" preset="dialog" :mask-closable="false">
    <n-form ref="formRef" :model="model" label-placement="left" class="mt-10">
      <n-form-item
        label="用户"
        path="userName"
        :rule="[{ required: true, message: '请输入用户名' }]"
      >
        <n-input v-model:value="model.userName" placeholder="请输入用户名" />
      </n-form-item>
      <n-form-item label="密码" path="password" :rule="[{ required: true, message: '请输入密码' }]">
        <n-input
          type="password"
          v-model:value="model.password"
          placeholder="请输入密码"
          :minlength="6"
          show-password-on="click"
        />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button type="primary">登录</n-button>
    </template>
  </n-modal>
</template>
<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'

const formRef = ref()

const props = defineProps<{
  show: boolean
}>()

const emits = defineEmits<{
  (e: 'update:show', val: boolean): void
}>()

const modelShow = computed({
  get: () => props.show,
  set: (val) => {
    emits('update:show', val)
  },
})

const model = reactive<UserLoginApi['from']>({
  userName: '',
  password: '',
})
</script>
<style lang="scss" scoped></style>
