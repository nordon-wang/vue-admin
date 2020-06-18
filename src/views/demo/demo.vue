<template>
  <div>
    <h1>parent</h1>
    <el-button @click="demoClick">aaa</el-button>
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
      msg: 'demo msg'
    }
  },
  created() {
    this.$on('on-demo', this.onDemo)
  },
  methods: {
    demoClick() {
      // console.log(this);
      this.msg = 'update msg...' + Date.now()
      this.broadcast('child', 'on-message', 'Hello Vue.js')
    },
    onDemo(data) {
      console.log('接受到了child传递的数据', data)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
