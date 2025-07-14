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
            :scroll-x="(renameKeyCount + 1) * 400 + 1500"
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
          <div>
            替换:
            <n-input
              style="width: 300px"
              placeholder="请输入替换内容"
              v-model:value="regexp_replace"
            />
          </div>
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
import { ref, h, reactive, onMounted } from 'vue'
import dayjs from 'dayjs'

type RenamePrefixed<T extends string> = `rename-${T}`
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
} & {
  [K in string as RenamePrefixed<K>]: JRenameBase
}

/** 缓存 */
const cacheMap = new Map<string, boolean>()

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
      case 'regexp':
        if (!regexp_search.value) {
          message.warning('请输入正则表达式')
          return
        }
        const reg = new RegExp(regexp_search.value)
        fileList.value.forEach((c) => {
          const prev = c[getCountKey(renameKeyCount.value)]
          const newName = prev.name.replace(reg, regexp_replace.value)
          const n: JRenameBase = {
            name: newName,
            type: newName == prev.name ? 'noChange' : 'regexp',
            originName: newName,
            count: renameKeyCount.value + 1,
          }
          c[getCountKey(renameKeyCount.value + 1)] = n
        })
        break
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
  return `rename-${getCountStr(i)}`
}

/** 更新表格字段 */
const updateColumns = () => {
  const cacheColumns: DataTableColumns = [...JSON.parse(JSON.stringify(baseColumns))]
  for (let i = 0; i < renameKeyCount.value + 1; i++) {
    cacheColumns.push({
      title: `预览${getCountStr(i)}`,
      key: `rename-${getCountStr(i)}`,
      width: 300,
      fixed: i == renameKeyCount.value ? 'right' : undefined,
      // @ts-ignore
      render: (rowData: JRenameFile, rowIndex) => {
        const data: JRenameBase = rowData[`rename-${getCountStr(i)}`]
        return h(NFlex, null, {
          default: () => [
            data.isRenaming
              ? h(NInput, {
                  value: data.name,
                  'onUpdate:value'(val) {
                    data.type = 'input'
                    data.name = val
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
      modifiedTime: dayjs(new Date(file.f.lastModified)).format('YYYY-MM-DD HH:mm:ss'),
    }
    for (let i = 0; i < renameKeyCount.value + 1; i++) {
      c[getCountKey(i)] = {
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
