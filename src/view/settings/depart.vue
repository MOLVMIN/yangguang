<template>
  <div>
    <Card>
      <div class="search-con search-con-top">
        <Select v-model="searchKey" placeholder="请选择搜索字段" clearable class="search-col" @on-clear="searchKeyChange" @on-change="searchKeyChange">
          <Option v-for="item in [{ key: 'userName', title: '负责人' },{ key: 'fId', title: '所属部门' }]" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>
        </Select>
        <Input v-if="searchKey === 'userName'" clearable placeholder="请输入部门负责人名称" class="search-input" v-model="userName"/>
        <Select v-if="searchKey === 'fId'" v-model="fId" clearable class="search-col" placeholder="请选择所属部门" style="margin-left: 2px">
          <Option v-for="item in tableData" :value="item.depart_id" :key="`search-col-${item.depart_id}`">{{ item.depart_name }}</Option>
        </Select>
        <Button class="search-btn" @click="getDepartList" type="primary">搜索</Button>
        <Button v-for="item in permissionBtns" v-if="item.p_id === 17" @click="handleAdd" class="add-btn" type="primary">添加部门</Button>
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
      <Form>
        <FormItem>
          <label>部门名称：</label>
          <Input v-model="departName" :disabled="isView" placeholder="请输入部门名称" />
        </FormItem>
        <FormItem>
          <label>负责人：</label>
          <Select v-model="departContactor" :disabled="isView">
            <Option v-for="item in departContactorList" :value="item.key" :key="`search-col-${item.key}`">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem>
          <label>所属部门：</label>
          <Select v-model="departFid" :disabled="isView">
            <Option v-for="item in departFidList" :value="item.key" :key="`search-col-${item.key}`">{{ item.label }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button v-if="!isView && !isEdit" type="info" size="large" @click="addDepart">保存</Button>
        <Button v-if="isEdit" type="success" size="large" @click="editDepart">修改</Button>
      </div>
    </Modal>
  </div>

</template>

<script>
  import axios from '@/libs/api.request'
  import common from '@/libs/common'
  export default {
    name: 'departe',
    data () {
      return {
        columns: [
          {title: '序号', align: 'center', key: 'depart_id', sortable: true},
          {title: '部门名称', align: 'center', key: 'depart_name', editable: true},
          {title: '负责人', align: 'center', key: 'username', editable: true},
          {title: '所属部门', align: 'center', key: 'fdepart_name', editable: true},
          {
            title: '部门状态', align: 'center', key: 'data_level',
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
                if (btn.p_id === 18) {
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
                        this.editId = params.row.depart_id
                        this.showOneDepart(this.showOneDepartPath, params.row.depart_id)
                        this.showModal = true
                        this.isView = false
                        this.isEdit = true
                      }
                    }
                  }, '修改'))
                } else if (btn.p_id === 19) {
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
                        this.showOneDepart(btn.p_path, params.row.depart_id)
                        this.showModal = true
                        this.modalTitle = '部门信息查看'
                        this.isView = true
                        this.isEdit = false
                      }
                    }
                  }, '查看'))
                } else if (btn.p_id === 20) {
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
                        this.deleteDepart(btn.p_path, params.row.depart_id)
                      }
                    }
                  }, '删除'))
                } else if (btn.p_id === 21) {
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
                        this.restoreDepart(btn.p_path, params.row.depart_id)
                      }
                    }
                  }, '恢复'))
                }
              }
              return h('div', btns)
            }
          }
        ],
        departName: '',
        departContactor: '',
        departContactorList: [],
        departFid: 0,
        departFidList: [],
        tableData: [],
        searchKey: '',
        searchValue: '',
        showModal: false,
        modalTitle: '添加部门',
        isView: false,
        isEdit: false,
        editId: '',
        permissionBtns: [],
        handleBtns: [],
        total: 0,
        pageSize: 10,
        pageNum: 1,
        getListPath: '',
        showOneDepartPath: ''
      }
    },
    methods: {
      handleAdd () {
        this.showModal = true
      },
      addDepart () {
        let _this = this
        axios.request({
          url: 'admin/settings/depart/addEntity.do',
          data: {
            departName: _this.departName,
            departContactor: _this.departContactor,
            departFid: _this.departFid
          },
          method: 'post'
        }).then(res => {
          if (res.data.code == 200) {
            _this.getDepartList()
            _this.showModal = false
            _this.$Notice.success({
              title: '添加部门成功'
            })
          } else {
            _this.$Notice.success({
              title: res.data.msg
            })
          }
        })
      },
      editDepart: function () {
        let _this = this
        axios.request({
          url: 'admin/settings/depart/editEntity.do',
          data: {
            departId: _this.editId,
            departName: _this.departName,
            departContactor: _this.departContactor,
            departFid: _this.departFid
          },
          method: 'post'
        }).then(res => {
          if (res.data.code == 200) {
            _this.getDepartList()
            _this.$Notice.success({
              title: '部门信息修改成功'
            })
            _this.showModal = false
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      deleteDepart: function (path, entityId) {
        let _this = this
        _this.$Modal.confirm({
          title: '提示',
          content: '确认删除？',
          onOk: function () {
            axios.request({
              url: path,
              data: {
                entityId: entityId
              },
              method: 'post'
            }).then(res => {
              if (res.data.code == 200) {
                _this.getDepartList()
                _this.$Notice.success({
                  title: '部门信息删除成功'
                })
                _this.getDepartList()
              } else {
                _this.$Notice.error({
                  title: res.data.msg
                })
              }
            })
          }
        })
      },
      restoreDepart: function (path, entityId) {
        let _this = this
        this.$Modal.confirm({
          title: '提示',
          content: '确认恢复该部门？',
          onOk: function () {
            axios.request({
              url: path,
              data: {
                entityId: entityId
              },
              method: 'post'
            }).then(res => {
              if (res.data.code == 200) {
                _this.getDepartList()
                this.$Notice.success({
                  title: '部门信息恢复成功'
                })
              } else {
                this.$Notice.error({
                  title: res.data.msg
                })
              }
            })
          }
        })
      },
      showOneDepart: function (path, entityId) {
        let _this = this
        axios.request({
          url: path,
          data: {
            entityId: entityId
          },
          method: 'post'
        }).then(res => {
          if (res.status === 200) {
            _this.departName = res.data.content.depart_name,
            _this.departContactor = parseInt(res.data.content.depart_contactor),
            _this.departFid = parseInt(res.data.content.depart_fid)
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      getUserList: function () {
        let _that = this
        axios.request({
          url: 'admin/settings/worker/showEntity.do',
          data: {
            pageNum: 1,
            pageSize: 10
          },
          method: 'post'
        }).then(res => {
          if (res.status === 200) {
            for (var i = 0; i < res.data.content.list.length; i++) {
              if (res.data.content.list[i].data_level !== 5) {
                _that.departContactorList.push({ key: res.data.content.list[i].id, label: res.data.content.list[i].username })
              }
            }
          } else {
            _that.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      getDepartList: function () {
        let _that = this
        axios.request({
          url: _that.getListPath,
          data: {
            pageNum: _that.pageNum,
            pageSize: _that.pageSize,
            userName: _that.userName,
            fId: _that.fId
          },
          method: 'post'
        }).then(res => {
          if (res.status === 200) {
            _that.tableData = []
            _that.departFidList = []
            _that.total = res.data.content.total
            for (var i = 0; i < res.data.content.list.length; i++) {
//            if (res.data.content.list[i].data_level !== 5) {
              _that.tableData.push(res.data.content.list[i])
              _that.departFidList.push({ key: res.data.content.list[i].depart_id, label: res.data.content.list[i].depart_name })
//            }
            }
          } else {
            _that.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      getPermissionBtns: function () {
        this.permissionBtns = []
        for (var item of common.permission) {
          if (item.p_fid === this.$route.meta.id) {
            this.permissionBtns.push(item)
            if (item.p_id === 16) {
              this.getListPath = item.p_path
            }
            if (item.p_id === 19) {
                this.showOneDepartPath = item.p_path
            }
            if (item.p_id === 18 || item.p_id === 19 || item.p_id === 20 || item.p_id === 21) {
              this.handleBtns.push(item)
            }
          }
        }
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
      searchKeyChange: function () {
        this.userName = ''
        this.fId = ''
      }
    },
    mounted () {
      this.getPermissionBtns()
      this.getUserList()
      this.getDepartList()
    },
    watch: {
      'showModal': function (val) {
        if (!val) {
          this.departName = ''
          this.departContactor = ''
          this.departFid = ''
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
