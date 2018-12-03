<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <Avatar src="https://i.loli.net/2017/08/21/599a521472424.jpg"/>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="changePassword">修改密码</DropdownItem>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal
      title="修改用户密码"
      v-model="change"
      :mask-closable="false">
      <Row style="display: flex; align-items: center; margin: 10px 0">
        <Col span="4"><label>旧密码</label></Col>
        <Col span="20"><Input span="20" v-model="oldPassword" type="password" /></Col>
      </Row>
      <Row style="display: flex; align-items: center; margin: 10px 0">
        <Col span="4"><label>新密码</label></Col>
        <Col span="20"><Input span="20" v-model="newPassword" type="password" /></Col>
      </Row>
      <div slot="footer">
        <Button type="primary" size="large" @click="submitPswChange">修改</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import './user.less'
import { mapActions } from 'vuex'
import axios from '@/libs/api.request'
export default {
  name: 'User',
  data () {
    return {
      change: false,
      oldPassword: '',
      newPassword: ''
    }
  },
  props: {
    userAvator: {
      type: String,
      default: ''
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    handleClick (name) {
      switch (name) {
        case 'logout':
          this.handleLogOut().then(() => {
            this.$router.push({
              name: 'login'
            })
          })
          break
        case 'changePassword':
            this.change = true
          break
      }
    },
    submitPswChange: function () {
      let _this = this
      axios.request({
        url: 'm/changePsw.do',
        data: {
          oldPassword: _this.oldPassword,
          newPassword: _this.newPassword
        },
        method: 'post'
      }).then(res => {
        if (res.data.code === 200) {
          _this.$Notice.success({
            title: '密码修改成功，请重新登录！'
          })
          _this.handleLogOut().then(() => {
            _this.$router.push({
              name: 'login'
            })
          })
        } else {
          _this.$Notice.error({
            title: res.data.msg
          })
        }
      })
    }
  }
}
</script>
