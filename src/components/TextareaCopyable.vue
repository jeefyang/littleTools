<script setup lang="ts">
import { Copy } from '@vicons/tabler'
import { useElementSize } from '@vueuse/core'
import hljs from 'highlight.js/lib/core'
import yaml from 'highlight.js/lib/languages/yaml'
import { useCopy } from '@/composable/copy'
import { withDefaults, ref, computed, toRefs, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string
    followHeightOf?: HTMLElement | null
    language?: string
    copyPlacement?: 'top-right' | 'bottom-right' | 'outside' | 'none'
    copyMessage?: string
  }>(),
  {
    followHeightOf: null,
    language: 'txt',
    copyPlacement: 'top-right',
    copyMessage: '点击复制',
  },
)

const langMap = new Map<string, boolean>()

const updateKey = ref(<number>0)

watch(
  () => props.language,
  async (l) => {
    if (langMap.has(l)) {
      return
    }
    langMap.set(l, true)
    console.log(yaml, l)
    switch (l) {
      case 'js':
        var m = await import('highlight.js/lib/languages/javascript')
        hljs.registerLanguage(l, m.default)
        break
      case 'sql':
        var m = await import('highlight.js/lib/languages/markdown')
        hljs.registerLanguage(l, m.default)
        break
      case 'json':
        var m = await import('highlight.js/lib/languages/json')
        hljs.registerLanguage(l, m.default)
        break
      case 'html':
        var m = await import('highlight.js/lib/languages/xml')
        hljs.registerLanguage(l, m.default)
        break
      case 'xml':
        var m = await import('highlight.js/lib/languages/xml')
        hljs.registerLanguage(l, m.default)
        break
      case 'yaml':
        var m = await import('highlight.js/lib/languages/yaml')
        hljs.registerLanguage(l, m.default)
        break
      case 'toml':
        var m = await import('highlight.js/lib/languages/ini')
        hljs.registerLanguage(l, m.default)
        break
      case 'markdown':
        var m = await import('highlight.js/lib/languages/markdown')
        hljs.registerLanguage(l, m.default)
        break
      default:
        console.warn(`没有找到对应的语言:${l}，请自行注册`)
        break
    }
    updateKey.value++
  },
  { immediate: true },
)

const { value, language, followHeightOf, copyPlacement, copyMessage } = toRefs(props)
const { height } = followHeightOf.value ? useElementSize(followHeightOf) : { height: ref(null) }

const { copy, isJustCopied } = useCopy({ source: value, createToast: false })
const tooltipText = computed(() => (isJustCopied.value ? '已复制!' : copyMessage.value))
</script>

<template>
  <div style="overflow-x: hidden; width: 100%">
    <n-card class="relative" round>
      <n-scrollbar
        x-scrollable
        trigger="none"
        :style="
          height
            ? `min-height: ${height - 40 /* card padding */ + 10 /* negative margin compensation */}px`
            : ''
        "
      >
        <n-config-provider :hljs="hljs" :key="updateKey">
          <n-code :code="value" :language="language" :trim="false" data-test-id="area-content" />
        </n-config-provider>
      </n-scrollbar>
      <div class="absolute right-10px top-10px">
        <n-tooltip v-if="value" :tooltip="tooltipText" placement="right">
          <template #trigger>
            <n-button circle important:h-10 important:w-10 @click="copy()">
              <n-icon size="22" :component="Copy" />
            </n-button>
          </template>
          <div>{{ tooltipText || '复制代码' }}</div>
        </n-tooltip>
      </div>
    </n-card>
    <div v-if="copyPlacement === 'outside'" mt-4 flex justify-center>
      <n-button @click="copy()">
        {{ tooltipText }}
      </n-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
::v-deep(.n-scrollbar) {
  padding-bottom: 10px;
  margin-bottom: -10px;
}
</style>
