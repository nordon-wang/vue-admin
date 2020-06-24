/**
 * 批量注册全局组件
 *  globalComponents 文件夹下存放全部组件
 *  命名规则： 文件夹小驼峰命名规范，文件大驼峰命名规范，文件内的 Vue 选项 name和文件名相同
 */
// 引入Vue
import Vue from 'vue'
// 引入全局组件
// require.context(directory, useSubdirectories = false, regExp = /^\.\//);
const globalComponents = require.context('../globalComponents', true, /\.vue$/)

globalComponents.keys().forEach(key => {
  // 获取单个组件内容
  const _component = globalComponents(key)
  // 获取组件名称
  const _componentName = 'Sz' + _component.default.name

  // 注册在vue上
  Vue.component(_componentName, _component.default || _component)
})
