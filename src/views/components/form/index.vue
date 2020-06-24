<template>
  <div id="form-content">
    <p>form demo</p>
    <sz-form :model="formValidate" :rules="ruleValidate">
      <sz-form-item label="用户名" prop="name">
        <sz-input v-model="formValidate.name" />
      </sz-form-item>
      <sz-form-item label="邮箱" prop="mail">
        <sz-input v-model="formValidate.mail" />
      </sz-form-item>
    </sz-form>
  </div>
</template>

<script>
export default {
  name: 'ComponentForm',
  data() {
    return {
      formValidate: {
        name: '',
        mail: ''
      },
      ruleValidate: {
        name: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        mail: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    console.log(this.$el)
  }
}
</script>

<style lang="scss" scoped>

</style>
