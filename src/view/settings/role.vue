<template>
  <div>
    <Card>
      <div class="search-con search-con-top">
        <Select v-model="searchKey" placeholder="请选择搜索字段" clearable class="search-col" @on-clear="searchKeyChange" @on-change="searchKeyChange">
          <Option v-for="item in [{ key: 'role_name', title: '角色名称' }]" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>
        </Select>
        <Input v-if="searchKey === 'role_name'" v-model="role_name" clearable placeholder="请输入角色名称关键字搜索" class="search-input"/>
        <Button class="search-btn" type="primary" @click="getRoleList">搜索</Button>
        <Button v-for="item in permissionBtns" v-if="item.p_id === 92" @click="handleAdd" class="add-btn" type="primary">添加角色</Button>
        <Button @click="allotEvent" class="add-btn" style="margin-right: 5px" type="primary">角色权限分配</Button>
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
        <span>{{ modalTitle }}</span>
      </p>
      <Form>
        <FormItem>
          <label>角色名称：</label>
          <Input v-model="roleName" :disabled="isView" placeholder="请输入角色名称" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button v-if="!isView && !isEdit" type="info" size="large" @click="addRole">保存</Button>
        <Button v-if="isEdit" type="success" size="large" @click="editRole">修改</Button>
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
          <label>角色名称：</label>
          <Select v-model="allotId" @on-change="getAllotEntity">
            <Option v-for="item in tableData" :value="item.role_id">{{ item.role_name }}</Option>
          </Select>
        </FormItem>
        <Tree :data="permissionArray" multiple @on-select-change="onCheckSelect"></Tree>
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
  export default {
    name: 'role',
    data () {
      return {
        columns: [
          {title: '编号', align: 'center', key: 'role_id', sortable: true},
          {title: '角色名称', align: 'center', key: 'role_name'},
          {
            title: '角色状态', align: 'center', key: 'data_level',
            render: (h, params) => {
              if (params.row.data_level == 1) {
                return h('div', '正常')
              } else if (params.row.data_level == 5) {
                return h('div', '已删除')
              }
            }
          },
          {
            title: '操作',
            key: 'handle',
            align: 'center',
            render: (h, params) => {
              const btns = []
              for (var i = 0; i < this.handleBtns.length; i++) {
                const btn = this.handleBtns[i]
                if (btn.p_id === 93) {
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
                        this.editId = params.row.role_id
                        this.showOneRole(this.showOneRolePath, params.row.role_id)
                        this.showModal = true
                        this.modalTitle = '角色信息修改'
                        this.isView = false
                        this.isEdit = true
                      }
                    }
                  }, '修改'))
                } else if (btn.p_id === 94) {
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
                        this.showOneRole(btn.p_path, params.row.role_id)
                        this.modalTitle = '角色信息查看'
                        this.showModal = true
                        this.isView = true
                        this.isEdit = false
                      }
                    }
                  }, '查看'))
                } else if (btn.p_id === 95) {
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
                        this.deleteRole(btn.p_path, params.row.role_id)
                      }
                    }
                  }, '删除'))
                } else if (btn.p_id === 96) {
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
                        this.restoreRole(btn.p_path, params.row.role_id)
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
        roleName: '',
        showModal: false,
        showAllotModal: false,
        roleId: '',
        isView: false,
        isEdit: false,
        permissionBtns: [],
        handleBtns: [],
        permissionIds: [],
        permissionArray: [],
        allotId: '',
        total: 0,
        pageSize: 10,
        pageNum: 1,
        getListPath: '',
        showOneRolePath: '',
        modalTitle: '',
        editId: ''
      }
    },
    methods: {
      handleAdd () {
        this.showModal = true
      },
      handleClear (e) {
        if (e.target.value === '') this.insideTableData = this.value
      },
      addRole: function () {
        let _this = this
        axios.request({
          url: 'admin/settings/role/addEntity.do',
          data: {
            role_name: this.roleName
          },
          method: 'post'
        }).then((res) => {
          if (res.data.code === 200) {
            _this.getRoleList()
            _this.showModal = false
            _this.$Notice.success({
              title: '新增成功'
            })
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      editRole: function () {
        let _this = this
        axios.request({
          url: 'admin/settings/role/editEntity.do',
          data: {
            role_id: _this.editId,
            role_name: _this.roleName
          },
          method: 'post'
        }).then((res) => {
          if (res.data.code === 200) {
            _this.getRoleList()
            _this.showModal = false
            _this.$Notice.success({
              title: '修改角色信息成功'
            })
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      deleteRole: function (path, entityId) {
        let _this = this
        _this.$Modal.confirm({
          title: '提示',
          content: '确认删除角色信息？',
          onOk: function () {
            axios.request({
              url: path,
              data: {
                entityId: entityId
              },
              method: 'post'
            }).then(res => {
              if (res.data.code == 200) {
                _this.$Notice.success({
                  title: '角色信息删除成功'
                })
                _this.getRoleList()
              } else {
                _this.$Notice.error({
                  title: res.data.msg
                })
              }
            })
          }
        })
      },
      restoreRole: function(path, entityId) {
        let _this = this
        this.$Modal.confirm({
          title: '提示',
          content: '确认恢复角色信息？',
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
                  title: '角色信息恢复成功'
                })
                _this.getRoleList()
              } else {
                this.$Notice.error({
                  title: res.data.msg
                })
              }
            })
          }
        })
      },
      showOneRole: function (path, entityId) {
        let _this = this
        axios.request({
          url: path,
          data: {
            entityId: entityId
          },
          method: 'post'
        }).then(res => {
            console.log(res)
          if (res.status === 200) {
            this.roleName = res.data.content.role_name
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      getRoleList: function () {
        let _this = this
        axios.request({
          url: _this.getListPath,
          data: {
            pageNum: _this.pageNum,
            pageSize: _this.pageSize,
            name: _this.role_name
          },
          method: 'post'
        }).then(res => {
          if (res.status === 200) {
            _this.tableData = []
            _this.total = res.data.content.total
            for (var i = 0; i < res.data.content.list.length; i++) {
//            if (res.data.content.list[i].data_level !== 5) {
              _this.tableData.push(res.data.content.list[i])
//            }
            }
          }
        })
      },
      getPermissionBtns: function () {
        this.permissionBtns = []
        for (var item of common.permission) {
          if (item.p_fid === this.$route.meta.id) {
            this.permissionBtns.push(item)
            if (item.p_id === 91) {
              this.getListPath = item.p_path
            }
            if (item.p_id === 94) {
                this.showOneRolePath = item.p_path
            }
            if (item.p_id === 93 || item.p_id === 94 || item.p_id === 95 || item.p_id === 96) {
              this.handleBtns.push(item)
            }
          }
        }
      },
      getAllotEntity: function (roleId) {
          var _this = this
          axios.request({
            url: 'admin/settings/role/allotEntity.do?roleId=' + roleId,
            method: 'get'
          }).then(res => {
            _this.permissionArray = res.data.content.permissions
            for (var i in res.data.content.rolePermissions) {
                _this.permissionIds.push(res.data.content.rolePermissions[i].p_id)
                for (var j in _this.permissionArray) {
                    if ((res.data.content.rolePermissions[i].p_id === _this.permissionArray[j].p_id)) {
                      _this.permissionArray[j].selected = true
                    }
                }
            }
            _this.permissionArray = _this.getPermissionArray(0, _this.permissionArray)
//            for (var i in _this.permissionArray) {
//                if (_this.permissionArray[i].children.length > 0) {
//                    for ()
//                } else {
//                    _this.permissionArray[i].checked = false
//                    _this.permissionArray[i].selected = true
//                }
//            }
          })
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
                url: 'admin/settings/role/allotEntity.do',
                data: {
                  roleId: _this.allotId,
                  permissionIds: _this.permissionIds.join(',')
                },
                method: 'post'
              }).then(res => {
                if (res.status === 200) {
                  _this.$Notice.success({
                    title: '角色权限分配成功'
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
//      this.permissionArray.push({id: childArr[i].p_id, title: childArr[i].p_name})
      getPermissionArray (id, arr) {
          var childArr = this.getPermissionParentArray(id, arr)
          if (childArr.length > 0) {
              for (var i in childArr) {
                childArr[i].children = this.getPermissionArray(childArr[i].p_id, arr)
              }
          }
          return childArr
      },
      getPermissionParentArray (id, arr) {
        var newArray = new Array()
        for (var i in arr) {
           if (arr[i].p_fid === id)
               newArray.push({ p_id: arr[i].p_id, p_fid: arr[i].p_fid, title: arr[i].p_name, selected: arr[i].selected })
        }
        return newArray
      },
      getPermissionIds () {
//        return this.getMockData()
//          .filter(() => Math.random() * 2 > 1)
//          .map(item => item.key);
      },
      pageOnChange: function (pageNum) {
        this.pageNum = pageNum
        this.getRoleList()
      },
      onPageSizeChange: function (pageSize) {
        this.pageNum = 1
        this.pageSize = pageSize
        this.getRoleList()
      },
      onCheckSelect: function (data) {
        console.log(data)
        this.permissionIds = []
        for (var i in data)
          this.permissionIds.push(data[i].p_id)
        console.log(this.permissionIds)
      }
    },
    mounted () {
      this.getPermissionBtns()
      this.getRoleList()
    },
    watch: {
      'showModal': function (val) {
        if (!val) {
          this.roleName = ''
          this.isEdit = false
          this.isView = false
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
