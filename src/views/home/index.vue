<template>
  <!-- $title:home -->
  <!-- $isMulti:1 -->
  <div>222221322HelloWorld!!!!</div>
  <input />
  <button @click="tester.start()">性能</button>
</template>
<script setup lang="ts">
import { onUnmounted } from 'vue'

class ResourceTester {
  cpuInterval: number = -1
  memoryInterval: number = -1

  memoryCache: any[] = []
  MAX_CACHE_SIZE = 20
  constructor() {
    this.cpuInterval = -1
    this.memoryCache = []
    this.MAX_CACHE_SIZE = 20
  }

  start() {
    // CPU 占用
    this.cpuInterval = setInterval(() => {
      let sum = 0
      for (let i = 0; i < 500000; i++) {
        sum += Math.sin(i) * Math.cos(i)
      }
      console.log('CPU 计算结果:', sum)
    }, 800)

    // 内存占用
    this.memoryInterval = setInterval(() => {
      if (this.memoryCache.length >= this.MAX_CACHE_SIZE) {
        this.memoryCache.shift()
      }
      this.memoryCache.push(new Array(512 * 1024).fill(0)) // 0.5MB 数组
      console.log('内存占用:', this.memoryCache.length * 0.5, 'MB')
    }, 1500)
  }

  stop() {
    clearInterval(this.cpuInterval)
    clearInterval(this.memoryInterval)
    this.memoryCache = []
    console.log('所有资源已释放')
  }
}

onUnmounted(() => {
  tester.stop()
  console.log('组件销毁')
})

// 使用示例
const tester = new ResourceTester()
</script>
