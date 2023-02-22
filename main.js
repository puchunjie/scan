import App from './App'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false

Vue.prototype.initApp = function () {
  console.log('应用程序初始化...')
}

App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif