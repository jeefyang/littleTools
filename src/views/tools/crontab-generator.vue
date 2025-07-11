<script setup lang="ts">
import cronstrue from 'cronstrue'
import { isValidCron } from 'cron-validator'
import { ref, reactive, computed } from 'vue'
import JInput from '@/components/JInput.vue'
import { useStyleStore } from '@/stores/styleStore'

function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true })
}

const cron = ref('40 * * * *')
const styleStore = useStyleStore()
const cronstrueConfig = reactive({
  verbose: true,
  dayOfWeekStartIndexZero: true,
  use24HourTimeFormat: true,
  throwExceptionOnParseError: true,
})

const columns = [
  { title: 'symbol', key: 'symbol' },
  { title: 'meaning', key: 'meaning' },
  { title: 'example', key: 'example' },
  { title: 'equivalent', key: 'equivalent' },
]

const helpers = [
  {
    symbol: '*',
    meaning: 'Any value',
    example: '* * * *',
    equivalent: 'Every minute',
  },
  {
    symbol: '-',
    meaning: 'Range of values',
    example: '1-10 * * *',
    equivalent: 'Minutes 1 through 10',
  },
  {
    symbol: ',',
    meaning: 'List of values',
    example: '1,10 * * *',
    equivalent: 'At minutes 1 and 10',
  },
  {
    symbol: '/',
    meaning: 'Step values',
    example: '*/10 * * *',
    equivalent: 'Every 10 minutes',
  },
  {
    symbol: '@yearly',
    meaning: 'Once every year at midnight of 1 January',
    example: '@yearly',
    equivalent: '0 0 1 1 *',
  },
  {
    symbol: '@annually',
    meaning: 'Same as @yearly',
    example: '@annually',
    equivalent: '0 0 1 1 *',
  },
  {
    symbol: '@monthly',
    meaning: 'Once a month at midnight on the first day',
    example: '@monthly',
    equivalent: '0 0 1 * *',
  },
  {
    symbol: '@weekly',
    meaning: 'Once a week at midnight on Sunday morning',
    example: '@weekly',
    equivalent: '0 0 * * 0',
  },
  {
    symbol: '@daily',
    meaning: 'Once a day at midnight',
    example: '@daily',
    equivalent: '0 0 * * *',
  },
  {
    symbol: '@midnight',
    meaning: 'Same as @daily',
    example: '@midnight',
    equivalent: '0 0 * * *',
  },
  {
    symbol: '@hourly',
    meaning: 'Once an hour at the beginning of the hour',
    example: '@hourly',
    equivalent: '0 * * * *',
  },
  {
    symbol: '@reboot',
    meaning: 'Run at startup',
    example: '',
    equivalent: '',
  },
]

const cronString = computed(() => {
  if (isCronValid(cron.value)) {
    return cronstrue.toString(cron.value, cronstrueConfig)
  }
  return ' '
})

const cronValidationRules = [
  {
    fn: (value: string) => isCronValid(value),
    msg: 'This cron is invalid',
  },
]
</script>

<template>
  <!-- $title:cron计数器解析 -->
  <!-- $isMenu:1 -->
  <div vertical class="pl-10 pr-10" style="overflow-x: hidden; width: 100%">
    <n-card class="mb-5">
      <div mx-auto max-w-sm>
        <j-input
          v-model:value="cron"
          placeholder="* * * * *"
          class="mb-3"
          :valids="cronValidationRules"
          size="large"
          style="text-align: center"
        ></j-input>
      </div>

      <div class="cron-string">
        {{ cronString }}
      </div>

      <n-divider />

      <div flex justify-center>
        <n-form :show-feedback="false" label-width="170" label-placement="left">
          <n-form-item label="Verbose">
            <n-switch v-model:value="cronstrueConfig.verbose" />
          </n-form-item>
          <n-form-item label="Use 24 hour time format">
            <n-switch v-model:value="cronstrueConfig.use24HourTimeFormat" />
          </n-form-item>
          <n-form-item label="Days start at 0">
            <n-switch v-model:value="cronstrueConfig.dayOfWeekStartIndexZero" />
          </n-form-item>
        </n-form>
      </div>
    </n-card>
    <n-card class="mb-5">
      <pre>
┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command</pre
      >
    </n-card>
    <n-card class="mb-5">
      <div v-if="styleStore.isSmallScreen">
        <n-card
          v-for="{ symbol, meaning, example, equivalent } in helpers"
          :key="symbol"
          mb-3
          important:border-none
        >
          <div>
            Symbol: <strong>{{ symbol }}</strong>
          </div>
          <div>
            Meaning: <strong>{{ meaning }}</strong>
          </div>
          <div>
            Example:
            <strong
              ><code>{{ example }}</code></strong
            >
          </div>
          <div>
            Equivalent: <strong>{{ equivalent }}</strong>
          </div>
        </n-card>
      </div>
      <!-- 表格 -->
      <n-data-table v-else :data="helpers" :columns="columns" />
    </n-card>
  </div>
</template>

<style lang="scss" scoped>
::v-deep(input) {
  font-size: 30px;
  font-family: monospace;
  padding: 5px;
  text-align: center;
}

.cron-string {
  text-align: center;
  font-size: 22px;
  opacity: 0.8;
  margin: 5px 0 15px;
}

pre {
  overflow: auto;
  padding: 10px 0;
}
</style>
