<template>
  <n-float-button
    :width="floatW"
    :height="floatW"
    :left="floatLeft"
    :bottom="floatBottom"
    shape="circle"
    type="primary"
    @mousedown="(e: any) => onDownFn({ mouse: e })"
    @touchstart="(e: any) => onDownFn({ touch: e })"
    @click="clickBtn"
    @dblclick="dblclickBtn"
  >
    <n-icon style="user-select: none" :size="floatW / 1.5">
      <Navigation></Navigation>
    </n-icon>
    <div class="over"></div>
  </n-float-button>
  <MenuModal v-model:show="shwoMenu"></MenuModal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import MenuModal from './MenuModal.vue'
import Navigation from '@/assets/navigation.svg'

let bodyDiv: HTMLDivElement | undefined = undefined

const shwoMenu = ref(false)
/** 悬浮按钮左坐标 */
const floatLeft = ref(20)
/** 悬浮按钮下坐标 */
const floatBottom = ref(100)
/** 悬浮按钮宽度 */
const floatW = ref(40)

let pressTimer: number = -1
let dragE: { mouse?: MouseEvent; touch?: NonNullable<TouchEvent> } = {}
let moveE: typeof dragE = {}
let isMove = false

const onDownFn = (e: typeof dragE) => {
  isMove = false
  if (!bodyDiv) {
    bodyDiv = <any>document.getElementById('layout')
    bodyDiv?.addEventListener(
      'mousemove',
      (e) => {
        onMoveFn({ mouse: e })
      },
      false,
    )
    bodyDiv?.addEventListener(
      'touchmove',
      (e) => {
        onMoveFn({ touch: e })
      },
      false,
    )
    bodyDiv?.addEventListener(
      'mouseup',
      (e) => {
        onUpFn({ mouse: e })
      },
      false,
    )
    bodyDiv?.addEventListener(
      'touchend',
      (e) => {
        onUpFn({ touch: e })
      },
      false,
    )
  }
  // 启动定时器，200毫秒后允许拖动
  pressTimer = setTimeout(() => {
    const t: MouseEvent | Touch = <any>(e.mouse || e.touch?.touches[0])
    const moveT: MouseEvent | Touch = <any>(moveE.mouse || moveE.touch?.touches[0])
    if (moveT) {
      const x = t.screenX - moveT.screenX
      const y = moveT.screenY - t.screenY
      if (Math.abs(x) > 5 || Math.abs(y) > 5) {
        return
      }
    }
    dragE = e
    floatW.value = 60
    floatLeft.value -= 10
    floatBottom.value -= 10
    ;(e.mouse || e.touch)?.preventDefault?.() // 阻止默认行为
  }, 200)
}

const onMoveFn = (e: typeof dragE) => {
  if (!bodyDiv) {
    return
  }
  moveE = e
  if (!dragE.mouse && !dragE.touch) {
    return
  }
  isMove = true
  const t: MouseEvent | Touch = <any>(e.mouse || e.touch?.touches[0])
  const dragT: MouseEvent | Touch = <any>(dragE.mouse || dragE.touch?.touches[0])
  const x = t.screenX - dragT.screenX
  const y = dragT.screenY - t.screenY
  dragE = e
  floatLeft.value = Math.min(
    bodyDiv.clientWidth - floatW.value,
    Math.max(floatLeft.value + x, bodyDiv.offsetLeft),
  )
  floatBottom.value = Math.min(
    bodyDiv.clientHeight - floatW.value,
    Math.max(floatBottom.value + y, bodyDiv.offsetTop),
  )
}

const onUpFn = (e: typeof dragE) => {
  dragE = {}
  moveE = {}
  floatW.value = 40
  clearTimeout(pressTimer) // 清除定时器
}

let clickTimer = -1
const clickBtn = () => {
  clearTimeout(clickTimer)
  if (isMove) {
    return
  }
  clickTimer = setTimeout(() => {
    shwoMenu.value = true
  }, 300)
}

const dblclickBtn = () => {
  clearTimeout(clickTimer)
  console.log('dbl')
}
</script>
<style lang="scss" scoped>
.over {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
