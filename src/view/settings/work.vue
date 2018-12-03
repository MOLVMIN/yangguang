<template>
  <div>
    <Card>
      <div class="search-con search-con-top">
        <Select v-model="searchKey" placeholder="请选择搜索字段" clearable class="search-col" @on-clear="searchKeyChange" @on-change="searchKeyChange">
          <Option v-for="item in [{ key: 'user_name', title: '人员名称' },{ key: 'user_type', title: '人员类型' },{ key: 'role_name', title: '人员角色' }]" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>
        </Select>
        <Input v-if="searchKey === 'user_name'" v-model="user_name" clearable placeholder="请输入人员名称关键字搜索" class="search-input search-con"/>
        <Select v-if="searchKey === 'user_type'" v-model="user_type" clearable class="search-col search-con" placeholder="请选择人员类型" style="margin-left: 2px">
          <Option v-for="item in userTypeList" :value="item.key" :key="`search-col-${item.label}`">{{ item.label }}</Option>
        </Select>
        <Select v-if="searchKey === 'role_name'" v-model="role_name" clearable class="search-col" placeholder="请选择角色类型" style="margin-left: 2px">
          <Option v-for="item in roleList" :value="item.role_name" :key="`search-col-${item.role_name}`">{{ item.role_name }}</Option>
        </Select>
        <Button class="search-btn" type="primary" @click="getUserList">搜索</Button>
        <Button v-for="item in permissionBtns" v-if="item.p_id === 23" @click="handleAdd" class="add-btn" type="primary">{{ item.p_name }}</Button>
        <Button @click="allotEvent" class="add-btn" style="margin-right: 5px" type="primary">用户权限分配</Button>
      </div>
      <Table
        ref="tablesMain"
        :data="tableData"
        :columns="columns"
      ></Table>
      <Page class="page" :total="total" :page-size="pageSize" show-sizer show-elevator prev-text="上一页" next-text="下一页" @on-change="pageOnChange" @on-page-size-change="onPageSizeChange" />
    </Card>
    <Modal width="800" v-model="showModal" :mask-closable="false">
      <p slot="header" style="color:#2d8cf0">
        <!--<Icon type="md-add-circle" />-->
        <span>{{modalTitle}}</span>
      </p>
      <!--<Upload-->
        <!--ref="upload"-->
        <!--:show-upload-list="false"-->
        <!--:on-success="handleSuccess"-->
        <!--:format="['jpg','jpeg','png']"-->
        <!--:max-size="2048"-->
        <!--:on-format-error="handleFormatError"-->
        <!--:on-exceeded-size="handleMaxSize"-->
        <!--type="drag"-->
        <!--name="image"-->
        <!--action="http://47.106.109.254:8090/m/uploadImage.do"-->
        <!--:headers="header"-->
        <!--style="display: inline-block;width:58px;">-->
        <!--<div style="width: 58px;height:58px;line-height: 58px;">-->
          <!--&lt;!&ndash;<Icon type="ios-camera" size="20"></Icon>&ndash;&gt;-->
          <!--&lt;!&ndash;<img :src="avator" />&ndash;&gt;-->
        <!--</div>-->
      <!--</Upload>-->
      <Form>
        <FormItem>
          <label>人员名称：</label>
          <Input v-model="userName" :readonly="isView" placeholder="请输入人员名称" />
        </FormItem>
        <!--<FormItem>-->
          <!--<label>登录密码：</label>-->
          <!--<Input type="password" v-model="userPassword" :disabled="isView" placeholder="请输入登录密码" />-->
        <!--</FormItem>-->
        <FormItem>
          <label>人员类型：</label>
          <Select v-model="userType" :disabled="isView">
            <Option v-for="item in userTypeList" :value="item.key" :key="`search-col-${item.key}`">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem>
          <label>所属部门：</label>
          <Select v-model="userDepart" :disabled="isView">
            <Option v-for="item in userDepartList" :value="item.key">{{ item.label }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button v-if="!isView && !isEdit" type="info" size="large" @click="addUser">保存</Button>
        <Button v-if="isEdit" type="success" size="large" @click="editUser">修改</Button>
      </div>
    </Modal>
    <!--权限分配模态框-->
    <Modal width="400" v-model="showAllotModal" :mask-closable="false">
      <p slot="header" style="color:#2d8cf0">
        <!--<Icon type="md-add-circle" />-->
        <span>权限分配</span>
      </p>
      <Form>
        <FormItem>
          <label>用户名称：</label>
          <Select v-model="allotId" @on-change="getAllotEntity" clearable>
            <Option v-for="item in tableData" :value="item.id">{{ item.username }}</Option>
          </Select>
        </FormItem>
        <!--<Transfer-->
          <!--:data="roleList"-->
          <!--:target-keys="roleIds"-->
          <!--:render-format="render1"-->
          <!--:list-style="listStyle"-->
          <!--:titles="transferTitles"-->
          <!--@on-change="transferChange">-->
        <!--</Transfer>-->
        <Tree :data="roleIdArray" multiple @on-select-change="onCheckSelect"></Tree>
      </Form>
      <div slot="footer">
        <Button type="info" size="large" @click="allotPermission">保存</Button>
      </div>
    </Modal>
  </div>

</template>

<script>
  import axios from '@/libs/api.request'
  import common from '@/libs/common'
  import { getToken } from '@/libs/util'
  export default {
    name: 'work',
    data () {
      return {
        user_name: '',
        user_type: '',
        role_name: '',
        roleList: [],
        columns: [
          {
            title: '编号', align: 'center', key: 'id', sortable: true
          },
          {
            title: '人员名称', align: 'center', key: 'username'
          },
          {
            title: '所属部门', align: 'center', key: 'depart_name'
          },
          {
            title: '人员类型', align: 'center', key: 'user_type',
            render: (h, params) => {
              if (params.row.user_type === 0) {
                return h('div', '超级管理员')
              }
              else if (params.row.user_type === 1) {
                return h('div', '普通管理员')
              }
              else if (params.row.user_type === 2) {
                return h('div', '普通用户')
              }
            }
          },
          {
            title: '人员角色', align: 'center', key: 'roleNames'
          },
          {
            title: '操作',
            key: 'handle',
            align: 'center',
            render: (h, params) => {
              const btns = []
              for (var i = 0; i < this.handleBtns.length; i++) {
                const btn = this.handleBtns[i]
                if (btn.p_id === 24) {
                  btns.push(h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small',
                      disabled: params.row.data_level === 5
                    },
                    style: {
                      margin: '2px'
                    },
                    on: {
                      click: () => {
                        this.editId = params.row.id
                        this.showOneUser(this.showOneWorkPath, params.row.id)
                        this.showModal = true
                        this.modalTitle = '人员信息修改'
                        this.isView = false
                        this.isEdit = true
                      }
                    }
                  }, '修改'))
                } else if (btn.p_id === 25) {
                  btns.push(h('Button', {
                    props: {
                      type: 'info',
                      size: 'small'
                    },
                    style: {
                      margin: '2px'
                    },
                    on: {
                      click: () => {
                        this.showOneUser(btn.p_path, params.row.id)
                        this.showModal = true
                        this.modalTitle = '人员信息查看'
                        this.isView = true
                        this.isEdit = false
                      }
                    }
                  }, '查看'))
                } else if (btn.p_id === 26) {
                  btns.push(h('Button', {
                    props: {
                      type: 'error',
                      size: 'small',
                      disabled: params.row.data_level === 5
                    },
                    style: {
                      margin: '2px'
                    },
                    on: {
                      click: () => {
                        this.deleteUser(btn.p_path, params.row.id)
                      }
                    }
                  }, '删除'))
                } else if (btn.p_id === 27) {
                  btns.push(h('Button', {
                    props: {
                      type: 'warning',
                      size: 'small',
                      disabled: params.row.data_level === 1
                    },
                    style: {
                      margin: '2px'
                    },
                    on: {
                      click: () => {
                        this.restoreUser(btn.p_path, params.row.id)
                      }
                    }
                  }, '恢复'))
                }
              }
              return h('div', btns)
            }
          }
        ],
        tableData: [],
        searchValue: '',
        searchKey: '',
        userName: '',
        userPassword: '',
        userType: '',
        userTypeList: [{ key: 0, label: '超级管理员' }, { key: 1, label: '普通管理员' }, { key: 2, label: '普通用户' }],
        userDepart: 0,
        userDepartList: [],
        showModal: false,
        showAllotModal: false,
        departFid: '',
        departFidList: [],
        modalTitle: '添加人员信息',
        isView: false,
        isEdit: false,
        editId: '',
        permissionBtns: [],
        handleBtns: [],
        roleIds: [],
        listStyle: {
          width: '350px',
          height: '300px'
        },
        transferTitles: ['待分配权限', '已分配权限'],
        allotId: '',
        allotIdList: [],
        total: 0,
        pageSize: 10,
        pageNum: 1,
        getListPath: '',
        showOneWorkPath: '',
        header: {},
        avator: '',
        departPageSize: 10,
        departPageNum: 1,
        roleIdArray: []
      }
    },
    methods: {
      handleAdd () {
        this.showModal = true
        this.isView = false
      },
      handleClear (e) {
        if (e.target.value === '') this.insideTableData = this.value
      },
      getUserList: function () {
        let _this = this
        axios.request({
          url: _this.getListPath,
          data: {
            pageNum: _this.pageNum,
            pageSize: _this.pageSize,
            name: _this.user_name,
            roleName: _this.role_name,
            type: _this.user_type
          },
          method: 'post'
        }).then(res => {
          if (res.data.code === 200) {
            this.tableData = []
            for (var i = 0; i < res.data.content.list.length; i++) {
//            if (res.data.content.list[i].data_level !== 5) {
              _this.tableData.push(res.data.content.list[i])
//            }
            }
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      getDepartList: function () {
        let _this = this
        axios.request({
          url: 'admin/settings/depart/showEntity.do',
          data: {
            pageNum: _this.departPageNum,
            pageSize: _this.departPageSize
          },
          method: 'post'
        }).then(res => {
          if (res.data.code === 200) {
            _this.userDepartList = []
            for (var i = 0; i < res.data.content.list.length; i++) {
              if (res.data.content.list[i].data_level !== 5) {
                _this.userDepartList.push({ key: res.data.content.list[i].depart_id, label: res.data.content.list[i].depart_name })
              }
            }
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      getAllotEntity: function () {
        let _this = this
        axios.request({
          url: 'admin/settings/worker/allotEntity.do?userId=' + _this.allotId,
          data: {
//            userId: _this.allotId
          },
          method: 'get'
        }).then(res => {
//            if (res.data.code === 200) {
              this.roleIdArray = []
              for (var i in res.data.content.roles) {
                _this.roleIdArray.push({
                  roleId: res.data.content.roles[i].role_id,
                  title: res.data.content.roles[i].role_name,
                  selected: false
                })
                for (var j in res.data.content.userRoles) {
                  if ((res.data.content.userRoles[j].role_id === res.data.content.roles[i].role_id)) {
                    this.roleIdArray[i].selected = true
                  }
                }
              }
//            }
        })
      },
      addUser: function () {
        let _this = this
        axios.request({
          url: 'admin/settings/worker/addEntity.do',
          data: {
            username: _this.userName,
            userType: _this.userType,
            userDepart: _this.userDepart
//            password: _this.userPassword
          },
          method: 'post'
        }).then(res => {
          if (res.data.code === 200) {
            _this.getUserList()
            _this.showModal = false
            _this.$Notice.success({
              title: '人员添加成功'
            })
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      editUser: function () {
        let _this = this
        axios.request({
          url: 'admin/settings/worker/editEntity.do',
          data: {
            id: _this.editId,
            username: _this.userName,
            userType: _this.userType,
            userDepart: _this.userDepart
          },
          method: 'post'
        }).then(res => {
          if (res.data.code == 200) {
            _this.getUserList()
            _this.$Notice.success({
              title: '人员信息修改成功'
            })
            _this.showModal = false
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      deleteUser: function (path, entityId) {
        let _this = this
        this.$Modal.confirm({
          title: '提示',
          content: '确认删除人员信息？',
          onOk: function () {
            axios.request({
              url: path,
              data: {
                entityId: entityId
              },
              method: 'post'
            }).then(res => {
              if (res.data.code == 200) {
                this.$Notice.success({
                  title: '人员信息删除成功'
                })
                _this.getUserList()
              } else {
                this.$Notice.error({
                  title: res.data.msg
                })
              }
            })
          }
        })
      },
      showOneUser: function (path, entityId) {
        let _this = this
        axios.request({
          url: path,
          data: {
            entityId: entityId
          },
          method: 'post'
        }).then(res => {
          if (res.status === 200) {
            _this.userName = res.data.content.username,
            _this.userType = parseInt(res.data.content.user_type),
            _this.userDepart = parseInt(res.data.content.user_depart)
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      restoreUser: function (path, entityId) {
        let _this = this
        this.$Modal.confirm({
          title: '提示',
          content: '确认恢复人员信息？',
          onOk: function () {
            axios.request({
              url: path,
              data: {
                entityId: entityId
              },
              method: 'post'
            }).then(res => {
              if (res.data.code == 200) {
                this.$Notice.success({
                  title: '人员信息恢复成功'
                })
                _this.getUserList()
              } else {
                this.$Notice.error({
                  title: res.data.msg
                })
              }
            })
          }
        })
      },
      getPermissionBtns: function () {
        this.permissionBtns = []
        for (var item of common.permission) {
          if (item.p_fid === this.$route.meta.id) {
            this.permissionBtns.push(item)
            if (item.p_id === 22) {
              this.getListPath = item.p_path
            }
            if (item.p_id === 25) {
              this.showOneWorkPath = item.p_path
            }
            if (item.p_id === 24 || item.p_id === 25 || item.p_id === 26 || item.p_id === 27) {
              this.handleBtns.push(item)
            }
          }
        }
      },
      allotEvent: function () {
        this.showAllotModal = true
      },
      allotPermission: function () {
        let _this = this
        _this.$Modal.confirm({
          title: '提示',
          content: '确认分配权限？',
          onOk: function () {
            axios.request({
              url: 'admin/settings/worker/allotEntity.do',
              data: {
                userId: _this.allotId,
                roleIds: _this.allotIdList.join(',')
              },
              method: 'post'
            }).then(res => {
              if (res.status === 200) {
                _this.showAllotModal = false
                _this.getUserList()
                _this.allotId = ''
                _this.$Notice.success({
                  title: '用户权限分配成功'
                })
              } else {
                _this.$Notice.error({
                  title: res.data.msg
                })
              }
            })
          }
        })
      },
      render1 (item) {
        return item.label;
      },
      transferChange: function (newRoleIds, direction, moveKeys) {
        this.roleIds = newRoleIds;
        console.log(this.roleIds)
      },
      pageOnChange: function (pageNum) {
        this.pageNum = pageNum
        this.getDepartList()
      },
      onPageSizeChange: function (pageSize) {
        this.pageNum = 1
        this.pageSize = pageSize
        this.getDepartList()
      },

      handleView (name) {
        this.imgName = name;
        this.visible = true;
      },
      handleRemove (file) {
        const fileList = this.$refs.upload.fileList;
        this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
      },
      handleSuccess (res, file) {
          console.log('http://47.106.109.254:8090' + res.content)
        this.avator = 'http://47.106.109.254:8090' + res.content
      },
      handleFormatError (file) {
        this.$Notice.warning({
          title: 'The file format is incorrect',
          desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
        });
      },
      handleMaxSize (file) {
        this.$Notice.warning({
          title: 'Exceeding file size limit',
          desc: 'File  ' + file.name + ' is too large, no more than 2M.'
        });
      },
      onCheckSelect (selectedList) {
        this.allotIdList = []
          for (var i in selectedList)
              this.allotIdList.push(selectedList[i].roleId)
      },
      getRoleList () {
        axios.request({
          url: 'admin/settings/role/showEntity.do',
          data: {},
          method: 'post'
        }).then(res => {
            this.roleList = res.data.content.list
        })
      },
      searchKeyChange () {
          this.userName = ''
          this.userType = ''
          this.roleNames = ''
      }
    },
    mounted () {
      this.getPermissionBtns()
      this.getUserList()
      this.getDepartList()
      this.getRoleList()
      this.header = {
        'authorization': getToken()
      }
    },
    watch: {
      'showModal': function (val) {
        if (!val) {
          this.userName = ''
          this.userType = ''
          this.userDepart = ''
          this.isView = false
          this.isEdit = false
        }
      }
    }
  }
</script>

<style>
  .search-con{
    padding: 10px 0;
  }
  .search-col{
    display: inline-block;
    width: 200px;
  }
  .search-input{
    display: inline-block;
    width: 200px;
    margin-left: 2px;
  }
  .search-btn{
    margin-left: 2px;
  }
  .add-btn{
    float: right;
  }
  .page {
    margin: 20px 0 10px 0;
  }
</style>
