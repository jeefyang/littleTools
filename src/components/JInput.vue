<template>
  <div>
    <n-input v-bind="props" :status="status[0]"></n-input>
    <div v-if="valids && status[0] == 'error'" class="c-red">
      {{ status[1] }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { assign } from 'lodash'
import { NInput, type FormValidationStatus } from 'naive-ui'

import { computed, ref, useAttrs } from 'vue'
import { Component2Props } from '@/utils/vueTools'

const props = defineProps(
  assign(Component2Props(NInput), {
    valids: {
      type: Array as () => Array<{ fn: (str: string) => boolean; msg: string }>,
      default: () => null,
    },
  }),
)

const status = computed((): [FormValidationStatus, string] => {
  if (!props.valids) {
    return ['success', '']
  }

  const v = props.value
  if (typeof v != 'string') {
    return ['success', '']
  }

  let data = props.valids.find((item) => !item.fn(v))
  console.log(data)
  if (data) {
    return ['error', data.msg]
  }
  return ['success', '']
})
</script>
<style lang="scss" scoped></style>
