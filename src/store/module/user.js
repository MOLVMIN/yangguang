import { login, getUserInfo, getApprovalor } from '@/api/user'
import { setToken, getToken, setUserId } from '@/libs/util'
import common from '@/libs/common'

export default {
  state: {
    userName: '',
    userId: '',
    avatorImgPath: '',
    token: getToken(),
    access: ''
  },
  mutations: {
    // 动态添加主界面路由，需要缓存
    // updateAppRouter (state, routes) {
    //   router.options.routes.push(...routes)
    //   router.addRoutes(router.options.routes)
    // },
    // // 动态添加全局路由，不需要缓存
    // updateDefaultRouter (state, routes) {
    //   router.options.routes.push(...routes)
    //   router.addRoutes(router.options.routes)
    //   router.push({
    //     name: 'home'
    //   })
    // },
    setAvator (state, avatorPath) {
      state.avatorImgPath = avatorPath
    },
    setUserId (state, id) {
      state.userId = id
      setUserId(id)
    },
    setUserName (state, name) {
      state.userName = name
    },
    setAccess (state, access) {
      state.access = access
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    }
  },
  actions: {
    // 登录
    handleLogin ({ commit }, {crednm, credco}) {
      console.log(crednm)
      crednm = crednm.trim()
      return new Promise((resolve, reject) => {
        login({
          crednm,
          credco
        }).then((res) => {
          const header = res.headers
          commit('setToken', header.authorization)
          commit('setUserId', res.data.content.userid)
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        // logout(state.token).then(() => {
        //   commit('setToken', '')
        //   commit('setAccess', [])
        //   resolve()
        // }).catch(err => {
        //   reject(err)
        // })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        commit('setToken', '')
        commit('setAccess', [])
        common.setAllPermission([])
        resolve()
      })
    },
    // 获取用户相关信息
    getUserInfo ({ state, commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(res => {
          const data = res.data
          commit('setAvator', data.avator)
          commit('setUserName', data.user_name)
          commit('setUserId', data.user_id)
          commit('setAccess', data.access)
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      })
    }
  }
}
