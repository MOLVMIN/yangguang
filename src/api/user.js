import axios from '@/libs/api.request'

export const login = ({ crednm, credco }) => {
  const data = {
    crednm,
    credco
  }
  return axios.request({
    url: 'auth',
    data,
    method: 'post'
  })
}

export const getUserInfo = (token) => {
  return axios.request({
    url: 'get_info',
    params: {
      token
    },
    method: 'get'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'logout',
    method: 'post'
  })
}
