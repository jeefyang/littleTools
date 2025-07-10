<script setup lang="ts">
import { MessageType, composerize } from 'composerize-ts'
import { withDefaultOnError } from '@/utils/defaults'
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64'
import { textToBase64 } from '@/utils/base64'
import TextareaCopyable from '@/components/TextareaCopyable.vue'
import { ref, computed } from 'vue'

const dockerRun = ref(
  'docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx',
)

const conversionResult = computed(() =>
  withDefaultOnError(() => composerize(dockerRun.value.trim()), { yaml: '', messages: [] }),
)
const dockerCompose = computed(() => conversionResult.value.yaml)
const notImplemented = computed(() =>
  conversionResult.value.messages
    .filter((msg) => msg.type === MessageType.notImplemented)
    .map((msg) => msg.value),
)
const notComposable = computed(() =>
  conversionResult.value.messages
    .filter((msg) => msg.type === MessageType.notTranslatable)
    .map((msg) => msg.value),
)
const errors = computed(() =>
  conversionResult.value.messages
    .filter((msg) => msg.type === MessageType.errorDuringConversion)
    .map((msg) => msg.value),
)
const dockerComposeBase64 = computed(
  () => `data:application/yaml;base64,${textToBase64(dockerCompose.value)}`,
)
const { download } = useDownloadFileFromBase64({
  source: dockerComposeBase64,
  filename: 'docker-compose.yml',
})
</script>

<template>
  <!-- $title:doceker compose转换器 -->
  <!-- $isMenu:1 -->
  <n-flex vertical justify="center" align="center">
    <div class="header">Docker Run 到 docker-compose 转换器</div>
    <n-input
      v-model:value="dockerRun"
      type="textarea"
      placeholder="请输入Docker Run命令"
      round
      style="width: 90%"
    />
    <n-divider />
    <TextareaCopyable :value="dockerCompose" language="yaml" style="width: 90%" />
    <n-button :disabled="dockerCompose === ''" secondary @click="download">
      Download docker-compose.yml
    </n-button>
  </n-flex>

  <div>
    <div v-if="notComposable.length > 0">
      <n-alert title="This options are not translatable to docker-compose" type="info" mt-5>
        <ul>
          <li v-for="(message, index) of notComposable" :key="index">
            {{ message }}
          </li>
        </ul>
      </n-alert>
    </div>

    <div v-if="notImplemented.length > 0">
      <n-alert
        title="This options are not yet implemented and therefore haven't been translated to docker-compose"
        type="warning"
        mt-5
      >
        <ul>
          <li v-for="(message, index) of notImplemented" :key="index">
            {{ message }}
          </li>
        </ul>
      </n-alert>
    </div>

    <div v-if="errors.length > 0">
      <n-alert title="The following errors occured" type="error" mt-5>
        <ul>
          <li v-for="(message, index) of errors" :key="index">
            {{ message }}
          </li>
        </ul>
      </n-alert>
    </div>
  </div>
</template>
