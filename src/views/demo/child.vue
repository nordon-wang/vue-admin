<template>
  <div>
    <p>child --- {{ parentProvide.msg }}</p>
    <hr>
    <el-button @click="clickHandler">aaa</el-button>
  </div>
</template>

<script>
import Emitter from './emitter.js'

export default {
  name: 'Child',
  mixins: [Emitter],
  inject: ['parentProvide'],
  created() {
    this.$on('on-message', this.showMessage)
  },
  methods: {
    clickHandler() {
      // console.log(this.$parent.$options.name);
      console.log('parentProvide')
      this.dispatch('Demo', 'on-demo', 'child emit, parent on')
    },
    showMessage(data) {
      console.log('showMessage', data)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
