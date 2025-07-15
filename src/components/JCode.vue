<template>
  <codemirror
    :key="updateKey"
    v-model="modelCode"
    placeholder="请开始你的表演..."
    :style="{ height: '400px' }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @ready="onReady"
    @change="onChange"
    @focus="onFocus"
    @blur="onblur"
  />
</template>
<script setup lang="ts">
import { computed, defineComponent, ref, shallowRef, watch } from 'vue'
import { Codemirror, type Events } from 'vue-codemirror'
import { dracula } from 'thememirror'

import {
  autocompletion,
  completeFromList,
  type CompletionSource,
  type Completion,
} from '@codemirror/autocomplete'

type PropertiesType = {
  children?: PropertiesType[]
  name: string
  detail?: string
  type?: string
}

const props = defineProps({
  code: {
    type: String,
    default: () => `console.log('Hello, world!')`,
  },
  lang: {
    type: String,
    default: () => 'js',
  },
  /** 变量属性 */
  properties: {
    type: Object as () => PropertiesType[],
    default: () => [],
  },
  /** 运行时变量,存在即替换properties */
  variables: {
    type: Object as () => { [x in string]: any },
    default: () => null,
  },
})

let javascriptModule: typeof import('@codemirror/lang-javascript')

watch(
  () => props.lang,
  async (l) => {
    if (l === 'js') {
      javascriptModule = await import('@codemirror/lang-javascript')

      extensions = [
        javascriptModule.javascript(),

        autocompletion({
          override: [myCompletion],
        }),
        dracula,
      ]
    }
    updateKey.value++
  },
  { immediate: true },
)

const onblur: Events['blur'] = (e) => {
  return false
}

const onChange: Events['change'] = (e) => {
  return false
}

const onReady: Events['ready'] = (p) => {
  view.value = p.view
  return false
}

const onFocus: Events['focus'] = (e) => {
  return false
}

const myCompletion: CompletionSource = (context) => {
  let word = context.matchBefore(/[\w\.\[\]\'\"\-]+?/)!
  if (!word || (word.from == word.to && !context.explicit)) return null
  const arr = word.text
    .trim()
    .split(/[\[\]"'.]/)
    .filter((c) => c)
  const path = ['.', ']', `'`, `"`].includes(word.text[word.text.length - 1])
    ? arr
    : arr.slice(0, -1)
  const name = ['.', ']', `'`, `"`].includes(word.text[word.text.length - 1])
    ? ''
    : arr[arr.length - 1]
  if (!path && !name) return null
  const options: Completion[] = []

  // 真变量模式
  if (props.variables) {
    let cur: any = props.variables
    for (let p of path!) {
      cur = cur[p]
      if (!cur) {
        return null
      }
    }
    options.push(
      ...Object.keys(cur).map<Completion>((c) => ({
        label: c,
        type: 'prototype',
        detail: `${typeof cur[c]} default: ${cur[c]}`,
        apply: c,
      })),
    )
  }
  // 手写变量模式
  else {
    let cur: PropertiesType[] = props.properties

    for (let p of path!) {
      const a = cur.find((c) => c.name == p)
      if (!a) {
        return null
      }
      cur = a.children!
    }

    if (cur) {
      options.push(
        ...cur.map<Completion>((c) => ({
          label: c.name,
          type: 'prototype',
          detail: `${c.type ? c.type : c.children ? 'object' : ''} ${c.detail || ''}`,
          apply: c.name,
        })),
      )
    }
  }

  return {
    from: context.pos - name!.length,
    to: context.pos,
    validFor: /^\w*$/,
    options: options,
  }
}

const emits = defineEmits(['update:code'])

const modelCode = computed({
  get: () => props.code,
  set: (val) => {
    emits('update:code', val)
  },
})

const updateKey = ref(0)
let extensions = [dracula]

const view = shallowRef()
</script>
<style lang="scss" scoped></style>
