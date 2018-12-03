<template>
  <div>
    <Card>
      <div class="search-con search-con-top">
        <Select v-model="searchKey" placeholder="请选择搜索字段" clearable class="search-col" @on-clear="searchKeyChange" @on-change="searchKeyChange">
          <Option v-for="item in [{ key: 'is_type', title: '类型' },{ key: 'is_title', title: '标题' }]" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>
        </Select>
        <Select v-if="searchKey === 'is_type'" placeholder="请选择类型" clearable class="search-col" @on-clear="searchKeyChange" @on-change="searchKeyChange" v-model="is_type">
          <Option v-for="item in isTypeArr" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>
        </Select>
        <Input v-if="searchKey === 'is_title'" clearable placeholder="输入标题关键字搜索" class="search-input" v-model="is_title"/>
        <Button class="search-btn" type="primary" @click="getDataList"><Icon type="search"/>搜索</Button>
        <Button v-for="item in permissionBtns" v-if="item.p_id === 196"  @click="handleAdd" class="add-btn" type="primary">{{ item.p_name }}</Button>
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
          <label>项目名称：</label>
          <Input v-model="cpName" :readonly="isView" placeholder="请填写项目名称" />
        </FormItem>
        <FormItem>
          <label>所属部门：</label>
          <Select :disabled="isView" v-model="departId" placeholder="请填写现部门">
            <Option v-for="item in allDepart" :value="item.depart_id">{{ item.depart_name }}</Option>
          </Select>
        </FormItem>
        <FormItem>
          <label>负责人：</label>
          <Select :disabled="isView" v-model="userName" placeholder="请选择项目负责人">
            <Option v-for="item in allUsers" :value="item.username" :key="`search-col-${item.username}`">{{ item.username }}</Option>
          </Select>
        </FormItem>
      </Form>
      <label v-if="isView && !isEdit">附件：</label>
      <Upload action="http://47.106.109.254:8090/m/documentFile/uploadDocument.do"
              :headers="header"
              multiple
              name="document"
              :data="{dfNo: editId, dfType: 'coor_project'}"
              :on-success="handleSuccess"
              :on-remove="handleRemove"
              :on-preview="showPreview"
              :before-upload="handleBeforeUpload"
              :on-format-error="handleFormatError"
              :default-file-list="fileList">
        <Button v-if="!isView && isEdit" id="upLoadImg" icon="ios-cloud-upload-outline">附件上传</Button>
      </Upload>
      <div slot="footer">
        <Button v-if="!isView && !isEdit" type="info" size="large" @click="addEntity">保存</Button>
        <Button v-if="isEdit" type="info" size="large" @click="editEntity">修改</Button>
        <!--<Button type="success" size="large" @click="addSubmit">发布</Button>-->
      </div>
    </Modal>
  </div>
</template>

<script>
  import axios from '@/libs/api.request'
  import { getToken } from '@/libs/util'
  import common from '@/libs/common'
  export default {
    name: 'coorProject_page',
    components: {},
    data () {
      return {
        cpName: '',
        fileList: [],
        allDepart: [],
        allUsers: [],
        departId: '',
        userName: '',
        columns: [
          {title: '序号', align: 'center', key: 'cp_id', sortable: true},
          {title: '项目名称', align: 'center', key: 'cp_name'},
          {title: '所属部门', align: 'center', key: 'depart_name'},
          {title: '项目负责人', align: 'center', key: 'username'},
          {
            title: '操作',
            key: 'handle',
            align: 'center',
            render: (h, params) => {
              const btns = []
              for (var i = 0; i < this.handleBtns.length; i++) {
                const btn = this.handleBtns[i]
                if (this.handleBtns[i].p_id === 197) {
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
                        this.showOneEntity(params.row.cp_id)
                        this.showModal = true
                        this.modalTitle = '编辑'
                        this.isView = false
                        this.isEdit = true
                        this.editId = params.row.cp_id
                      }
                    }
                  }, '编辑'))
                } else if (this.handleBtns[i].p_id === 198) {
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
                        this.showOneEntity(params.row.cp_id)
                        this.showModal = true
                        this.modalTitle = '查看'
                        this.isView = true
                        this.isEdit = false
                      }
                    }
                  }, '查看'))
                } else if (this.handleBtns[i].p_id === 199) {
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
                        this.deleteEntity(params.row.cp_id)
                      }
                    }
                  }, '删除'))
                } else if (this.handleBtns[i].p_id === 200) {
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
                        this.restoreEntity(params.row.cp_id)
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
        showModal: false,
        modalTitle: '添加',

        header: {},
        permissionBtns: [],
        handleBtns: [],
        isView: false,
        isEdit: false,
        total: 0,
        pageNum: 1,
        pageSize: 20,
        getListPath: '',
        showOnePath: '',
        editId: '',
        addOnePath: '',
        editOnePath: '',
        deleteOnePath: '',
        restoreOnePath: '',
        isTypeArr: []
      }
    },
    methods: {
      handleAdd () {
        this.showModal = true
        this.isView = false
        this.isEdit = false
        this.modalTitle = '添加'
      },
      getDataList: function () {
        let _this = this
        axios.request({
          url: _this.getListPath,
          data: {
            pageNum: _this.pageNum,
            pageSize: _this.pageSize
          },
          method: 'post'
        }).then(res => {
          if (res.status === 200) {
            _this.tableData = []
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
      addEntity: function () {
        let _this = this
        axios.request({
          url: _this.addOnePath,
          data: {
            cpName: _this.cpName
          },
          method: 'post'
        }).then((res) => {
          if (res.data.code === 200) {
            _this.getDataList()
            _this.showModal = false
            _this.$Notice.success({
              title: '添加成功'
            })
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      editEntity: function () {
        let _this = this
        axios.request({
          url: _this.editOnePath,
          data: {
            cpId: _this.editId,
            cpName: _this.cpName
          },
          method: 'post'
        }).then((res) => {
          if (res.data.code === 200) {
            _this.getDataList()
            _this.showModal = false
            _this.$Notice.success({
              title: '编辑成功'
            })
          } else {
            _this.$Notice.error({
              title: res.data.msg
            })
          }
        })
      },
      showOneEntity: function (entityId) {
        var _this = this
        axios.request({
          url: _this.showOnePath,
          data: {
            entityId: entityId
          },
          method: 'post'
        }).then(res => {
          console.log(res)
          _this.cpName = res.data.content.cp_name
          _this.departId = res.data.content.depart_id
          _this.userName = res.data.content.username
          _this.fileList = []
          for (var i in res.data.content.files) {
            _this.fileList.push({
              name: res.data.content.files[i].df_name,
              url: 'http://47.106.109.254:8090/' + res.data.content.files[i].df_url
            })
          }
        })
      },
      deleteEntity: function (entityId) {
        let _this = this
        if (!isView) {
          this.$Modal.confirm({
            title: '提示',
            content: '确认删除？',
            onOk: function () {
              axios.request({
                url: _this.deleteOnePath,
                data: {
                  entityId: entityId
                },
                method: 'post'
              }).then(res => {
                if (res.data.code === 200) {
                  _this.getDataList()
                  _this.$Notice.success({
                    title: '删除成功'
                  })
                } else {
                  _this.$Notice.error({
                    title: res.data.msg
                  })
                }
              })
            }
          })
        } else {
          _this.$Notice.warning({
            title: '查看中不允许删除'
          })
        }
      },
      restoreEntity: function (entityId) {
        let _this = this
        _this.$Modal.confirm({
          title: '提示',
          content: '确认恢复？',
          onOk: function () {
            axios.request({
              url: _this.restoreOnePath,
              data: {
                entityId: entityId
              },
              method: 'post'
            }).then(res => {
              if (res.data.code === 200) {
                _this.getDataList()
                _this.$Notice.success({
                  title: '恢复成功'
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
      handleSuccess (res, file) {
        this.$Spin.hide()
        this.$Notice.success({
          title: '附件上传成功'
        })
      },
      handleRemove (file, fileList) {
        let _this = this
        if (!_this.isView) {
          axios.request({
            url: 'm/documentFile/removeDocument.do',
            method: 'post',
            data: {
              documentId: file.uid
            }
          }).then((res) => {
            if (res.data.code === 200) {
              _this.$Notice.success({
                title: '删除成功'
              })
            } else {
              _this.$Notice.error({
                title: res.data.msg
              })
            }
          })
        } else {
          _this.$Notice.Warring({
            title: '查看中不允许删除'
          })
        }
      },
      showPreview (file) {
        window.open(file.url)
      },
      handleFormatError () {
        this.$Spin.hide()
      },
      handleBeforeUpload () {
        this.$Spin.show({
          render: (h) => {
            return h('div', [
              h('Icon', {
                'class': 'demo-spin-icon-load',
                props: {
                  type: 'ios-loading',
                  size: 18
                }
              }),
              h('div', 'upLoading')
            ])
          }
        });
      },
      pageOnChange: function (pageNum) {
        this.pageNum = pageNum
        this.getDataList()
      },
      onPageSizeChange: function (pageSize) {
        this.pageNum = 1
        this.pageSize = pageSize
        this.getDataList()
      },
      searchKeyChange: function () {
        this.me_title = ''
        this.me_name = ''
      },
      getPermissionBtns: function () {
        this.permissionBtns = []
        for (var item of common.permission) {
          if (item.p_fid === this.$route.meta.id) {
            this.permissionBtns.push(item)
            if (item.p_id === 195) {
              this.getListPath = item.p_path
            }
            if (item.p_id === 196) {
              this.addOnePath = item.p_path
            }
            if (item.p_id == 197) {
              this.editOnePath = item.p_path
            }
            if (item.p_id === 198) {
              this.showOnePath = item.p_path
            }
            if (item.p_id === 199) {
              this.deleteOnePath = item.p_path
            }
            if (item.p_id === 200) {
              this.restoreOnePath = item.p_path
            }
            if (item.p_id === 197 || item.p_id === 198 || item.p_id === 199 || item.p_id === 200) {
              this.handleBtns.push(item)
            }
          }
        }
      },
      attachmentUpload () {

      },
      getAllDepart: function () {
        axios.request({
          url: '/admin/settings/depart/showEntity.do',
          data: {
            dataLevel: 1
          },
          method: 'post'
        }).then(res => {
          for (var i in res.data.content.list) {
            this.allDepart.push(res.data.content.list[i])
          }
        })
      },
      getAllUsers () {
        let _this = this
        axios.request({
          url: '/m/getAllUsers.do',
          data: {},
          method: 'post'
        }).then(res => {
          _this.allUsers = res.data.content
        })
      }
    },
    mounted: function () {
      this.getPermissionBtns()
      this.getDataList()
      this.getAllDepart()
      this.getAllUsers()
      this.header = {
        'authorization': getToken()
      }
    },
    watch: {
      'showModal': function (val) {
        if (!val) {
          this.cpName = ''
          this.departId = ''
          this.userName = ''
          this.fileList = []
          this.isEdit = false
          this.isView = false
        }
      }
    }
  }
</script>

<style>
  .search-con {
    padding: 10px 0;
  }
  .search-col {
    display: inline-block;
    width: 200px;
  }
  .search-input {
    display: inline-block;
    width: 200px;
    margin-left: 2px;
  }
  .search-value, .search-btn {
    margin-left: 2px;
  }
  .add-btn{
    float: right;
  }
  .page {
    margin: 20px 0 10px 0;
  }
  .ql-align-center {
    text-align: center;
  }
  .ql-align-left {
    text-align: left;
  }
  .ql-align-right {
    text-align: right;
  }
</style>
