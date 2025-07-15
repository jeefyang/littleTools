<template>
  <!-- $title:简易重命名 -->
  <!-- $isMenu:1 -->
  <div>
    <DragFile @files-change="onFilesChangeFn" :webkitdirectory="false" class="mb-5">
      <template #content="{ triggerFileInput, isDragActive }">
        <n-flex>
          <n-button type="primary" class="mb-5" @click="triggerFileInput()">打开文件</n-button>
          <n-button type="primary" class="mb-5" @click="rebackFn()">后退</n-button>
        </n-flex>
        <n-card v-if="!fileList || fileList.length == 0" class="files">
          <div
            class="flex flex-items-center flex-justify-center fs-32"
            style="height: 100%"
            :style="{ color: isDragActive ? themeVars.primaryColor : themeVars.textColorBase }"
          >
            拖拽文件或者文件夹
          </div>
        </n-card>
        <n-card v-else class="files full">
          <n-data-table
            :max-height="250"
            :columns="columns"
            :data="fileList"
            :pagination="paginationReactive"
            style="overflow: auto; width: 100%"
            :scroll-x="(renameKeyCount + 1) * previewWidth + 1500"
          >
          </n-data-table>
        </n-card>
      </template>
    </DragFile>
    <!-- 选项 -->
    <n-flex style="width: 100%; overflow: auto" :wrap="false" class="typeBtnList mb-5">
      <template v-for="item in typeButtonList" :key="item.type">
        <n-button
          v-if="!item.isHide"
          @click="curType = item.type"
          :type="item.type == curType ? 'primary' : 'default'"
          >{{ item.name }}</n-button
        >
      </template>
    </n-flex>
    <div class="mb-5">
      <div class="mb-5">
        <!-- 正则 -->
        <template v-if="curType == 'regexp'">
          <div class="mb-5">
            搜索:
            <n-input style="width: 300px" placeholder="请输入正则" v-model:value="regexp_search" />
          </div>
          <div class="mb-5">
            替换:
            <n-input
              style="width: 300px"
              placeholder="请输入替换内容"
              v-model:value="regexp_replace"
            />
          </div>
          <n-space item-style="display: flex;" align="center" class="mb-5">
            <n-checkbox label="全局" v-model:checked="regexp_isGlobal" />
            <n-checkbox label="忽略大小写" v-model:checked="regexp_isIgnoreCase" />
          </n-space>
        </template>
        <!-- 方法 -->
        <template v-else-if="curType == 'fn'">
          <div class="ml-2">{{ fn_base_val[0] }}</div>
          <JCode
            lang="js"
            v-model:code="fn_value"
            style="width: 80%; height: 200px"
            :variables="fn_variables"
          ></JCode>
          <div class="ml-2">{{ fn_base_val[2] }}</div>
        </template>
      </div>

      <n-button @click="applyFn()">应用</n-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import DragFile from '@/components/DragFile.vue'
import { type JFile } from '@/components/DragFile.vue'
import { useThemeVars, type DataTableColumns, NButton, NInput, NFlex, useMessage } from 'naive-ui'
import { ref, h, reactive, onMounted, watch } from 'vue'
import JCode from '@/components/JCode.vue'
import dayjs from 'dayjs'

type RenamePrefixed<T extends string> = `rename_${T}`
type JRenameType =
  | 'origin'
  | 'input'
  | 'regexp'
  | 'fn'
  | 'date'
  | 'ext'
  | 'attr'
  | 'sort'
  | 'cover'
  | 'noChange'
type JRenameBase = {
  name: string
  ext: string
  baseName: string
  count: number
  type: JRenameType
  originName: string
  isRenaming?: boolean
}
type JRenameFile = {
  name: string
  dir: string
  ext: string
  time: number
  size: number
  modifiedTime: string
  baseName: string
} & {
  [K in string as RenamePrefixed<K>]: JRenameBase
}

/** 缓存 */
const cacheMap = new Map<string, boolean>()
const previewWidth = 350

const themeVars = useThemeVars()

const message = useMessage()

/** 重命名类型按钮 */
const typeButtonList = reactive<{ type: JRenameType; name: string; isHide?: boolean }[]>([
  {
    type: 'regexp',
    name: '正则修改',
  },
  {
    type: 'fn',
    name: '方法修改',
  },
  {
    type: 'attr',
    name: '变量修改',
  },
  {
    type: 'ext',
    name: '后缀名修改',
  },
  {
    type: 'date',
    name: '日期变量修改',
  },
  {
    type: 'sort',
    name: '排序修改',
  },
  {
    type: 'cover',
    name: '数值补充修改',
  },
  {
    type: 'origin',
    name: '原始',
    isHide: true,
  },
  {
    type: 'input',
    name: '输入框修改',
    isHide: true,
  },
  {
    type: 'noChange',
    name: '不变',
    isHide: true,
  },
])

/** 当前重命名类型 */
const curType = ref(<JRenameType>typeButtonList[0]?.type || '')

/** 基础表格字段 */
const baseColumns: DataTableColumns = [
  {
    title: '文件名',
    key: 'name',
  },
  {
    title: '所在文件夹',
    key: 'dir',
  },
  {
    title: '后缀名',
    key: 'ext',
    width: 120,
  },
  {
    title: '修改时间',
    key: 'modifiedTime',
    width: 200,
  },
]

const regexp_search = ref('')
const regexp_replace = ref('')
const regexp_isGlobal = ref(true)
const regexp_isIgnoreCase = ref(true)
const fn_base_val = [
  `(f,t,index,fullFile,fileList)=>{`,
  `
 // 开始你的表演

  
  // 结束你的表演
  // 返回值
  return f.name
`,
  '}',
]
const fn_value = ref(fn_base_val[1])
const fn_variables = ref<{ [x in string]: any }>({})

/** 表格字段 */
const columns = ref<DataTableColumns>([])

/** 当前重名预览次数 */
const renameKeyCount = ref(0)

/** 文件列表 */
const fileList = ref<JRenameFile[]>([])

/** 页码 */
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 30],
  onChange: (page: number) => {
    paginationReactive.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
  },
})

/** 后退方法 */
const rebackFn = () => {
  if (renameKeyCount.value == 0) {
    message.error('退无可退了!!!')
    return
  }
  renameKeyCount.value--
  updateColumns()
}

/** 应用方法 */
const applyFn = () => {
  if (!fileList.value || fileList.value.length == 0) {
    message.warning('请选择文件')
    return
  }
  try {
    switch (curType.value) {
      // 正则
      case 'regexp':
        if (!regexp_search.value) {
          message.warning('请输入正则表达式')
          return
        }
        const reg = new RegExp(
          regexp_search.value,
          `${regexp_isGlobal.value ? 'g' : ''}${regexp_isIgnoreCase.value ? 'i' : ''}`,
        )
        fileList.value.forEach((c) => {
          const prev = c[getCountKey(renameKeyCount.value)]
          const newName = prev.name.replace(reg, regexp_replace.value)
          const n: JRenameBase = {
            baseName: newName.split('.').slice(0, -1).join('.'),
            ext: newName.split('.').pop() || '',
            name: newName,
            type: newName == prev.name ? 'noChange' : 'regexp',
            originName: newName,
            count: renameKeyCount.value + 1,
          }
          c[getCountKey(renameKeyCount.value + 1)] = n
        })
        break
      case 'fn':
        const fnStr = `
        ${fn_base_val[0]}
        ${fn_value.value}
        ${fn_base_val[2]}
        `
        fileList.value.forEach((c, i) => {
          const prev = c[getCountKey(renameKeyCount.value)]
          const data = getFn_variables(c)
          const newName = eval(`(${fnStr})`)(data.f, data.t, i, data.fullFile, fileList.value)
          console.log(newName)
          const n: JRenameBase = {
            baseName: newName.split('.').slice(0, -1).join('.'),
            ext: newName.split('.').pop() || '',
            name: newName,
            type: newName == prev.name ? 'noChange' : 'fn',
            originName: newName,
            count: renameKeyCount.value + 1,
          }
          c[getCountKey(renameKeyCount.value + 1)] = n
        })
        // return
        break
      default:
        message.warning('无修改')
        return
    }
  } catch (e) {
    message.error('修改失败')
    console.warn(e)
    return
  }
  renameKeyCount.value++
  updateColumns()
}

/** 获取数量字符(符合正常查看) */
const getCountStr = (i: number) => {
  return i < 9 ? '0' + (i + 1).toString() : (i + 1).toString()
}

const getCountKey = (i: number): RenamePrefixed<string> => {
  return `rename_${getCountStr(i)}`
}

/** 更新表格字段 */
const updateColumns = () => {
  const cacheColumns: DataTableColumns = [...JSON.parse(JSON.stringify(baseColumns))]
  for (let i = 0; i < renameKeyCount.value + 1; i++) {
    cacheColumns.push({
      title: `预览${getCountStr(i)}`,
      key: getCountKey(i),
      width: previewWidth,
      fixed: i == renameKeyCount.value ? 'right' : undefined,
      // @ts-ignore
      render: (rowData: JRenameFile, rowIndex) => {
        const data: JRenameBase = rowData[getCountKey(i)]
        return h(NFlex, null, {
          default: () => [
            data.isRenaming
              ? h(NInput, {
                  value: data.name,
                  'onUpdate:value'(val) {
                    data.type = 'input'
                    data.name = val
                    data.baseName = val.split('.').slice(0, -1).join('.')
                    data.ext = val.split('.').pop() || ''
                  },
                  onBlur() {
                    data.isRenaming = false
                  },
                })
              : h('div', data.name),
            ...(data.count == renameKeyCount.value
              ? [
                  h(
                    NButton,
                    {
                      type: 'warning',
                      size: 'small',
                      onClick() {
                        data.isRenaming = true
                      },
                    },
                    () => '重命名',
                  ),
                  h(
                    NButton,
                    {
                      type: 'warning',
                      size: 'small',
                      onClick() {
                        data.name = data.originName
                      },
                    },
                    () => '重置',
                  ),
                ]
              : []),
          ],
        })
      },
    })
  }
  cacheColumns.push({
    title: '操作',
    key: 'operation',
    width: 100,
    fixed: 'right',
    render: (rowData, rowIndex) => {
      return h(
        NButton,
        {
          type: 'primary',
          onClick() {
            fileList.value.splice(rowIndex, 1)
          },
        },
        () => '删除',
      )
    },
  })
  columns.value = cacheColumns
}

/** 打开文件 */
const onFilesChangeFn = (op: {
  fileList: JFile[]
  type: 'drag' | 'select'
  event: Event | DragEvent
}) => {
  console.log(op)
  const list: JRenameFile[] = [...fileList.value]
  op.fileList.forEach((file) => {
    if (cacheMap.has(file.fullPath)) {
      return
    }
    const c: JRenameFile = {
      name: file.f.name,
      dir: file.dir || '/',
      ext: file.f.name.split('.').pop() || '',
      size: file.f.size,
      time: file.f.lastModified,
      baseName: file.f.name.split('.').slice(0, -1).join('.'),
      modifiedTime: dayjs(new Date(file.f.lastModified)).format('YYYY-MM-DD HH:mm:ss'),
    }
    for (let i = 0; i < renameKeyCount.value + 1; i++) {
      c[getCountKey(i)] = {
        baseName: file.f.name.split('.').slice(0, -1).join('.'),
        ext: file.f.name.split('.').pop() || '',
        name: file.f.name,
        count: i,
        type: 'origin',
        originName: file.f.name,
      }
    }
    list.push(c)
    cacheMap.set(file.fullPath, true)
  })
  fileList.value = list
}

const getFn_variables = (file: JRenameFile) => {
  const day = dayjs(new Date(file.time)).format('YYYY:MM:DD:HH:mm:ss')
  const [Y, M, D, h, m, s] = day.split(':')
  const curF = file[getCountKey(renameKeyCount.value)]
  const f = { ...file, ...curF }
  return {
    fullFile: file,
    f: f,
    t: {
      Y,
      M,
      D,
      h,
      m,
      s,
    },
    index: 0,
    fileList: fileList.value,
  }
}

watch(
  () => fileList.value,
  (files) => {
    if (!files || files.length == 0) {
      fn_variables.value = {}
      return
    }
    fn_variables.value = getFn_variables(files[0])
  },
  { immediate: true },
)

onMounted(() => {
  updateColumns()
})
</script>
<style lang="scss" scoped>
.files {
  width: 100%;
  overflow: auto;
  height: 200px;
  &.full {
    height: auto;
    min-height: 200px;
    width: 100%;
    overflow: auto;
  }
}
.typeBtnList::-webkit-scrollbar {
  display: none;
}
</style>
