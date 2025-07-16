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
            <n-input
              style="width: 300px"
              placeholder="请输入正则"
              v-model:value="regexp_search"
              clearable
            />
          </div>
          <div class="mb-5">
            替换:
            <n-input
              style="width: 300px"
              placeholder="请输入替换内容"
              v-model:value="regexp_replace"
              clearable
            />
          </div>
          <n-space item-style="display: flex;" align="center" class="mb-5">
            <n-checkbox label="全局" v-model:checked="regexp_isGlobal" />
            <n-checkbox label="忽略大小写" v-model:checked="regexp_isIgnoreCase" />
            <n-checkbox label="正则" v-model:checked="regexp_isRegexp" />
            <n-checkbox label="替换变量" v-model:checked="regexp_isReplaceVal" />
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
        <!-- 变量 -->
        <template v-else-if="curType == 'attr'">
          <div style="white-space: pre">{{ attr_example }}</div>
          <n-input
            style="width: 300px"
            placeholder="{{ baseName }}.{{ ext }}"
            v-model:value="attr_input"
            clearable
          />
        </template>
        <!-- 后缀名 -->
        <template v-else-if="curType == 'ext'">
          <div class="mb-5">
            选择:
            <n-input
              style="width: 300px"
              placeholder="多个用逗号隔开"
              v-model:value="ext_select"
              clearable
            />
          </div>
          <div>
            替换:
            <n-input
              style="width: 300px"
              placeholder="输入替换的后缀名"
              v-model:value="ext_replace"
              clearable
            />
          </div>
        </template>
        <!-- 字数补充 -->
        <template v-else-if="curType == 'cover'">
          <div class="mb-5" style="width: 300px" :style="{ color: themeVars.warningColor }">
            {{ cover_detail }}
          </div>
          <div class="mb-5">
            选择:
            <n-input
              style="width: 300px"
              placeholder="正则()触发"
              v-model:value="cover_select"
              clearable
            />
          </div>
          <div class="mb-5">
            补充:
            <n-input
              style="width: 300px"
              placeholder="输入不足补充字符"
              v-model:value="cover_addStr"
              clearable
            />
          </div>
          <div class="mb-5 flex">
            字数:
            <n-input-number
              class="ml-1"
              style="width: 300px"
              placeholder="字数数量"
              clearable
              v-model:value="cover_count"
            />
          </div>
          <div>
            <n-checkbox label="全局" v-model:checked="cover_isGlobal" />
            <n-checkbox label="忽略大小写" v-model:checked="cover_isIgnoreCase" />
            <n-radio :checked="cover_frontOrBack === -1" @change="cover_frontOrBack = -1">
              前缀
            </n-radio>
            <n-radio :checked="cover_frontOrBack === 1" @change="cover_frontOrBack = 1">
              后缀
            </n-radio>
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
import {
  useThemeVars,
  type DataTableColumns,
  NButton,
  NInput,
  NFlex,
  NTag,
  useMessage,
} from 'naive-ui'
import { ref, h, reactive, onMounted, watch } from 'vue'
import JCode from '@/components/JCode.vue'
import dayjs from 'dayjs'
import { at, type partial } from 'lodash'

type RenamePrefixed<T extends string> = `rename_${T}`
type JRenameType = 'origin' | 'input' | 'regexp' | 'fn' | 'ext' | 'attr' | 'cover' | 'noChange'
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
    type: 'cover',
    name: '字数补充修改',
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
// 正则
const regexp_search = ref('')
const regexp_replace = ref('')
const regexp_isGlobal = ref(true)
const regexp_isIgnoreCase = ref(true)
const regexp_isRegexp = ref(true)
const regexp_isReplaceVal = ref(true)
// 方法
const fn_base_val = [
  `(f,t,index,fullFile,fileList)=>{`,
  `
  // 开始你的表演
  const name = f.name


  // 结束你的表演
  // 返回值
  return name
`,
  '}',
]
const fn_value = ref(fn_base_val[1])
const fn_variables = ref<{ [x in string]: any }>({})
// 变量
const attr_example = `
  name: 名称
  baseName: 基础名称(不要后缀名)
  ext: 后缀(不包含点)
  YY:年
  MM:月
  DD:日
  hh:时
  mm:分
  ss:秒
  ms:毫秒
  index:索引
`
const attr_input = ref('')
// 后缀名
const ext_select = ref('')
const ext_replace = ref('')
// 字数补充
const cover_detail =
  '字数补充,数量0则不触发,需用正则()触发,最多只能存在一个有效捕获的(),请不要出现(()),不然可能会出现异常'
const cover_select = ref('')
const cover_count = ref(0)
const cover_addStr = ref('')
const cover_isGlobal = ref(true)
const cover_isIgnoreCase = ref(true)
const cover_frontOrBack = ref(-1)

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

const setNewNameFn = (child: JRenameFile, obj: Partial<JRenameBase>, type: JRenameType) => {
  const prev = child[getCountKey(renameKeyCount.value)]
  const newName = obj.name || prev.name
  const n: JRenameBase = {
    baseName: newName.split('.').slice(0, -1).join('.'),
    ext: newName.split('.').pop() || '',
    name: newName,
    type: newName == prev.name ? 'noChange' : type,
    originName: newName,
    count: renameKeyCount.value + 1,
    ...obj,
  }
  child[getCountKey(renameKeyCount.value + 1)] = n
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
          message.warning('请输入搜索条件')
          return
        }
        const reg_regexp: RegExp | string = regexp_isRegexp.value
          ? new RegExp(
              regexp_search.value,
              `${regexp_isGlobal.value ? 'g' : ''}${regexp_isIgnoreCase.value ? 'i' : ''}`,
            )
          : regexp_search.value
        fileList.value.forEach((c) => {
          const prev = c[getCountKey(renameKeyCount.value)]
          let newName = prev.name
          if (regexp_isReplaceVal.value) {
            newName = newName.replace(reg_regexp, regexp_replace.value)
          } else {
            let match = newName.match(reg_regexp)
            if (match) {
              if (!regexp_isGlobal.value) {
                match = [match[0]]
              }
              match.forEach((cc) => {
                newName = newName.replace(cc, regexp_replace.value)
              })
            }
          }
          setNewNameFn(c, { name: newName }, 'regexp')
        })
        break
      // 方法
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
          setNewNameFn(c, { name: newName }, 'fn')
        })
        break
      // 变量
      case 'attr':
        fileList.value.forEach((c, i) => {
          const prev = c[getCountKey(renameKeyCount.value)]
          const mlist = attr_input.value.match(/\{\{[\w\s]+\}\}/g)
          const data = getFn_variables(c)
          let newName = attr_input.value
          if (mlist) {
            mlist.forEach((m) => {
              const k = m.slice(2, -2).trim()
              console.log(k)
              // @ts-ignore
              const v =
                // @ts-ignore
                data.f[k] != undefined
                  ? // @ts-ignore
                    data.f[k]
                  : // @ts-ignore
                    data.t[k] != undefined
                    ? // @ts-ignore
                      data.t[k]
                    : k == 'index'
                      ? i
                      : ''
              newName = newName.replace(m, v)
            })
          }
          setNewNameFn(c, { name: newName }, 'attr')
        })
        break
      // 后缀名
      case 'ext':
        const selectList = ext_select.value.split(',').map((c) => c.trim())
        fileList.value.forEach((c, i) => {
          const prev = c[getCountKey(renameKeyCount.value)]
          const data = getFn_variables(c)
          let extName = prev.name.split('.').pop() || ''
          const baseName = prev.name.split('.').slice(0, -1).join('.')
          if (selectList.includes(extName)) {
            extName = ext_replace.value
          }
          const newName = extName ? [baseName, extName].join('.') : baseName
          setNewNameFn(c, { name: newName }, 'ext')
        })
        break
      // 字数补充
      case 'cover':
        let newRegExpStr = ''
        let [l, r] = [0, 0]
        let isTarget = false
        let select_Count = 0
        if (cover_select.value[0] == '(') {
          newRegExpStr = cover_select.value
          select_Count = 1
        } else {
          for (let i = 0; i < cover_select.value.length; i++) {
            if (l == r) {
              l += 1
              if (!isTarget) {
                select_Count++
              }
              newRegExpStr += '('
            }
            // 转义符,跳一下
            if (cover_select.value[i] == '\\' && cover_select.value[i + 1] != undefined) {
              newRegExpStr += cover_select.value[i] + cover_select.value[i + 1]
              i++
              continue
            } else if (cover_select.value[i] == '(') {
              newRegExpStr += ')'
              r++
              l++
              select_Count++
              isTarget = true
            } else if (cover_select.value[i] == ')') {
              r++
            }
            newRegExpStr += cover_select.value[i]
          }
        }

        if (l > r) {
          newRegExpStr += ')'
        }
        const reg_cover = new RegExp(newRegExpStr, `g${cover_isIgnoreCase.value ? 'i' : ''}`)
        fileList.value.forEach((c, i) => {
          const prev = c[getCountKey(renameKeyCount.value)]
          let newName = prev.name

          const matchIter = newName.matchAll(reg_cover)
          var obj = matchIter.next()
          var add = 0
          while (obj.value) {
            const i = add + obj.value.index
            const a = [...obj.value]
            const len = a[select_Count].length
            for (let i = 0; i < cover_count.value - len; i++) {
              if (cover_frontOrBack.value == -1) {
                a[select_Count] = cover_addStr.value + a[select_Count]
              } else if (cover_frontOrBack.value == 1) {
                a[select_Count] += cover_addStr.value
              }
            }
            let newV = a.slice(1).join('')
            add += newV.length - obj.value[0].length
            newName = newName.slice(0, i) + newV + newName.slice(i + obj.value[0].length)
            // 非全局一次
            if (cover_isGlobal.value) {
              break
            }
            obj = matchIter.next()
          }

          setNewNameFn(c, { name: newName }, 'cover')

          setNewNameFn(c, { name: newName }, 'cover')
        })
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
                    NTag,
                    {
                      bordered: false,
                      type: 'warning',
                    },
                    () => typeButtonList.find((c) => c.type == data.type)?.name || '无',
                  ),
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

/** 获取变量集合(方法类型) */
const getFn_variables = (file: JRenameFile) => {
  const day = dayjs(new Date(file.time)).format('YYYY:MM:DD:HH:mm:ss')
  const [YY, MM, DD, hh, mm, ss] = day.split(':')
  const curF = file[getCountKey(renameKeyCount.value)]
  const f = { ...file, ...curF }
  return {
    fullFile: file,
    f: f,
    t: {
      YY,
      MM,
      DD,
      hh,
      mm,
      ss,
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
