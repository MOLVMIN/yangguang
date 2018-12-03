import axios from 'axios'
import { getToken } from '@/libs/util'
import qs from 'qs'
// import { Spin } from 'iview'
class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        'authorization': getToken()
      }
    }
    return config
  }
  distroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      if (config.method === 'post') {
        // qs.stringify区别于JOSN.stringify，如var a = {name:'hehe',age:10}，qs.stringify系列化结果是name=hehe&age=10
        config.data = qs.stringify(config.data)
      }
      if (config.url === 'auth') {
        delete config.headers.authorization
      }
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.distroy(url)
      const { data, status, headers } = res
      return { data, status, headers }
    }, error => {
      this.distroy(url)
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    // Object.assign是深度复制,使用后面参数字段的内容替换前面参数的相同字段内容
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
