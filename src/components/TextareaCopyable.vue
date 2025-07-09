<script setup lang="ts">
import { Copy } from '@vicons/tabler'
import { useElementSize } from '@vueuse/core'
import hljs from 'highlight.js/lib/core'
import jsonHljs from 'highlight.js/lib/languages/json'
import sqlHljs from 'highlight.js/lib/languages/sql'
import xmlHljs from 'highlight.js/lib/languages/xml'
import yamlHljs from 'highlight.js/lib/languages/yaml'
import iniHljs from 'highlight.js/lib/languages/ini'
import markdownHljs from 'highlight.js/lib/languages/markdown'
import { useCopy } from '@/composable/copy'
import { withDefaults, ref, computed, toRefs } from 'vue'

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
    copyMessage: 'Copy to clipboard',
  },
)
hljs.registerLanguage('sql', sqlHljs)
hljs.registerLanguage('json', jsonHljs)
hljs.registerLanguage('html', xmlHljs)
hljs.registerLanguage('xml', xmlHljs)
hljs.registerLanguage('yaml', yamlHljs)
hljs.registerLanguage('toml', iniHljs)
hljs.registerLanguage('markdown', markdownHljs)

const { value, language, followHeightOf, copyPlacement, copyMessage } = toRefs(props)
const { height } = followHeightOf.value ? useElementSize(followHeightOf) : { height: ref(null) }

const { copy, isJustCopied } = useCopy({ source: value, createToast: false })
const tooltipText = computed(() => (isJustCopied.value ? '已复制!' : copyMessage.value))
</script>

<template>
  <div style="overflow-x: hidden; width: 100%">
    <n-card relative round>
      <n-scrollbar
        x-scrollable
        trigger="none"
        :style="
          height
            ? `min-height: ${height - 40 /* card padding */ + 10 /* negative margin compensation */}px`
            : ''
        "
      >
        <n-config-provider :hljs="hljs">
          <n-code :code="value" :language="language" :trim="false" data-test-id="area-content" />
        </n-config-provider>
      </n-scrollbar>
      <div absolute right-10px top-10px>
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
