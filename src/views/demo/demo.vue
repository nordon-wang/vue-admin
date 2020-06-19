<template>
  <div style="padding:20px 40px;">
    <div id="memory-leak">memory-leak</div>
    <hr>

    <div>
      <el-button @click="demoClick">aaa</el-button>
      <hr>

      <el-button @click="memoryLeak1">内存泄漏测试1</el-button>
      <el-button @click="memoryLeak2">内存泄漏测试2</el-button>
      <el-button @click="memoryLeak3">内存泄漏测试3</el-button>
    </div>

    <child />
  </div>
</template>

<script>
import Child from './child'
import Emitter from './emitter.js'

export default {
  name: 'Demo',
  components: {
    Child
  },
  mixins: [Emitter],
  provide() {
    return {
      parentProvide: this
    }
  },
  data() {
    return {
      msg: 'demo msg',
      arr: []
    }
  },
  created() {
    this.$on('on-demo', this.onDemo)
  },
  methods: {
    // 内存泄漏测试- 遗忘的定时器
    memoryLeak1() {
      const memoryLeak = document.querySelector('#memory-leak')
      setTimeout(() => {
        console.log(memoryLeak)

        memoryLeak.innerHtml = Date.now()
      }, 200)
    },
    memoryLeak2() {
      const a = new Array(100000).fill(1)

      this.arr.push(a)
    },
    memoryLeak3() {
      var t = null
      var replaceThing = function() {
        var o = t
        console.log(o)

        // var unused = function() {
        //   if (o) {
        //     console.log('hi')
        //   }
        // }

        t = {
          longStr: new Array(100000).fill('*'),
          someMethod: function() {
            console.log(1)
          }
        }
      }

      setInterval(replaceThing, 1000)
    },
    demoClick() {
      // console.log(this);
      this.msg = 'update msg...' + Date.now()
      this.broadcast('Child', 'on-message', 'Hello Vue.js')
    },
    onDemo(data) {
      console.log('接受到了child传递的数据', data)
    }
  }
}
</script>

<style lang="scss" scoped>
.controls {
  position: fixed;
  top: 2vw;
  left: 2vw;
  z-index: 1;
}

.controls button {
  display: block;
  font-size: 1em;
  padding: 1em;
  margin: 1em;
  background-color: beige;
  color: black;
}

.subtract:disabled {
  opacity: 0.2;
}

.mover {
  height: 3vw;
  position: absolute;
  z-index: 0;
}

.border {
  border: 1px solid black;
}

@media (max-width: 600px) {
  .controls button {
    min-width: 20vw;
  }
}
</style>
