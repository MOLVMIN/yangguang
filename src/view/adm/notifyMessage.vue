<template>
  <div>
    <Card>
      <div class="search-con search-con-top">
        <Select v-model="searchKey" placeholder="请选择搜索字段" clearable class="search-col" @on-clear="searchKeyChange" @on-change="searchKeyChange">
          <Option v-for="item in [{ key: 'nm_title', title: '标题' },{ key: 'nm_isdraft', title: '状态' }]" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>
        </Select>
        <Input v-if="searchKey === 'nm_title'" clearable placeholder="输入标题关键字搜索" class="search-input" v-model="nm_title"/>
        <Select v-if="searchKey === 'nm_isdraft'" v-model="nm_isdraft" clearable class="search-col" placeholder="请选择公告状态" style="margin-left: 2px">
          <Option v-for="item in [{ key: true, title: '已保存' },{ key: false, title: '已发布' }]" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>
        </Select>
        <Button class="search-btn" type="primary" @click="getNotifyList"><Icon type="search"/>搜索</Button>
        <Button v-for="item in permissionBtns" v-if="item.p_id === 30" @click="handleAdd" class="add-btn" type="primary">{{ item.p_name }}</Button>
      </div>
      <Table
        ref="tablesMain"
        :data="tableData"
        :columns="columns"
      ></Table>
      <Page class="page" :total="total" :page-size="pageSize" show-sizer show-elevator prev-text="上一页" next-text="下一页" @on-change="pageOnChange" @on-page-size-change="onPageSizeChange" />
      <Upload v-show="false" action="http://47.106.109.254:8090/m/uploadImage.do"
              :headers="header"
              name="image"
              :on-success="handleSuccess"
              :before-upload="handleBeforeUpload"
              :on-format-error="handleFormatError">
        <Button id="upLoadImg" icon="ios-cloud-upload-outline">Upload files</Button>
      </Upload>
    </Card>
    <!--添加、修改机构公告模态框-->
    <Modal width="800" v-model="showModal" :mask-closable="false">
      <p slot="header" style="color:#2d8cf0">
        <!--<Icon type="md-add-circle" />-->
        <span>{{ modalTitle }}</span>
      </p>
      <Form>
        <FormItem>
          <label>标题：</label>
          <Input v-model="nmTitle" placeholder="请输入公告标题" />
        </FormItem>
        <FormItem>
          <label>关键字：</label>
          <Input v-model="nmKeys" placeholder="请输入公告关键字" />
        </FormItem>
        <FormItem>
          <label>内容：</label>
          <quill-editor ref="myQuillEditor" :options="editorOptions" v-model="nmContent" :content="nmContent"></quill-editor>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button v-if="!isView && !isEdit" type="info" size="large" @click="addNotify">保存</Button>
        <Button v-if="isEdit" type="info" size="large" @click="editNotify">修改</Button>
      </div>
    </Modal>
  </div>

</template>

<script>
import QuillEditor from "../../../node_modules/vue-quill-editor/src/editor"
import axios from '@/libs/api.request'
import { getToken } from '@/libs/util'
import common from '@/libs/common'
export default {
  name: 'notify_message_page',
  components: {
    QuillEditor
  },
  data () {
    return {
      nm_title: '',
      nm_isdraft: null,
      columns: [
        {title: '标题', align: 'center', key: 'nm_title', sortable: true},
        {title: '创建人', align: 'center', key: 'username'},
        {title: '状态', align: 'center', key: 'nm_isdraft', editable: true,
          render: (h, params) => {
            if (params.row.nm_isdraft) {
              return h('div', '已保存')
            }
            else {
              return h('div', '已发布')
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
              if (btn.p_id === 31) {
                btns.push(h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: !params.row.nm_isdraft || params.row.data_level === 5
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    click: () => {
                      this.showOneNotify(this.showOneNotifyPath, params.row.nm_id)
                      this.showModal = true
                      this.modalTitle = '机构公告修改'
                      this.isView = false
                      this.isEdit = true
                      this.editId = params.row.nm_id
                    }
                  }
                }, '修改'))
              } else if (btn.p_id === 32) {
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
                      this.showOneNotify(btn.p_path, params.row.nm_id)
                      this.showModal = true
                      this.modalTitle = '机构公告查看'
                      this.isView = true
                      this.isEdit = false
                    }
                  }
                }, '查看'))
              } else if (btn.p_id === 33) {
                btns.push(h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: params.row.data_level === 5 || !params.row.nm_isdraft
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    click: () => {
                      this.deleteNotify(btn.p_path, params.row.nm_id)
                    }
                  }
                }, '删除'))
              } else if (btn.p_id === 34) {
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
                      this.restoreRole(btn.p_path, params.row.nm_id)
                    }
                  }
                }, '恢复'))
              } else if (btn.p_id === 35) {
                btns.push(h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                    disabled: !params.row.nm_isdraft || params.row.data_level === 5
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    click: () => {
                      this.publicNotify(btn.p_path, params.row.nm_id)
                    }
                  }
                }, '发布'))
              } else if (btn.p_id === 36) {
                btns.push(h('Button', {
                  props: {
                    type: 'default',
                    size: 'small',
                    disabled: params.row.nm_isdraft
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    click: () => {
                      this.retracementNotify(btn.p_path, params.row.nm_id)
                    }
                  }
                }, '回撤'))
              }
            }
            return h('div', btns)
          }
        }
      ],
      tableData: [],
      searchValue: '',
      searchKey: '',
      modalTitle: '添加公告',
      nmTitle: '',
      nmKeys: '',
      nmContent: '',
      showModal: false,
      header: {},
      quill: null,
      editorOptions: {
        placeholder: '请输入公告内容…',
        modules: {
          toolbar: {
            placeholder: '请输入会议纪要内容…',
            container:
              [['bold', 'italic', 'underline', 'strike', 'image', 'clean'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }]],
            handlers: {
              'image': function (value) {
                if (value) {
                  console.log(value)
                  document.querySelector('#upLoadImg').click()
                } else {
                  this.quill.format('image', false)
                }
              }
            }
          }
        }
      },
      permissionBtns: [],
      handleBtns: [],
      isView: false,
      isEdit: false,
      total: 0,
      pageNum: 1,
      pageSize: 20,
      getListPath: '',
      showOneNotifyPath: '',
      editId: ''
    }
  },
  methods: {
    handleAdd () {
      this.showModal = true
      this.isView = false
      this.isEdit = false
      this.modalTitle = '添加机构公告'
    },
    // 添加公告
    addNotify: function () {
      let _this = this
      axios.request({
        url: 'admin/adm/notifyMessage/addEntity.do',
        data: {
          nmTitle: _this.nmTitle,
          nmKeys: _this.nmKeys,
          nmContent: _this.nmContent
        },
        method: 'post'
      }).then((res) => {
        if (res.data.code === 200) {
          _this.getNotifyList()
          _this.showModal = false
          _this.$Notice.success({
            title: '公告添加成功'
          })
        } else {
          _this.$Notice.error({
            title: res.data.msg
          })
        }
      })
    },
    // 修改公告
    editNotify: function () {
      let _this = this
      axios.request({
        url: 'admin/adm/notifyMessage/editEntity.do',
        data: {
          nmId: _this.editId,
          nmTitle: _this.nmTitle,
          nmKeys: _this.nmKeys,
          nmContent: _this.nmContent,
          nmIsdraft: false
        },
        method: 'post'
      }).then((res) => {
        if (res.data.code === 200) {
          _this.getNotifyList()
          _this.showModal = false
          _this.$Notice.success({
            title: '公告修改成功'
          })
        } else {
          _this.$Notice.error({
            title: res.data.msg
          })
        }
      })
    },
    // 显示单条记录
    showOneNotify: function (path, entityId) {
      axios.request({
        url: path,
        data: {
          entityId: entityId
        },
        method: 'post'
      }).then(res => {
        this.nmTitle = res.data.content.nm_title
        this.nmKeys = res.data.content.nm_keys
        this.nmContent = res.data.content.nm_content
      })
    },
    // 获取机构公告列表
    getNotifyList: function () {
      let _this = this
      axios.request({
        url: this.getListPath,
        data: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          isSelf: true,
          isDraft: this.nm_isdraft,
          name: this.nm_title
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
        } else {
          _this.$Notice.error({
            title: res.data.msg
          })
        }
      })

    },
    // 删除公告
    deleteNotify: function (path, entityId) {
      let _this = this
      this.$Modal.confirm({
        title: '提示',
        content: '确认删除该公告？',
        onOk: function () {
          axios.request({
            url: path,
            data: {
              entityId: entityId
            },
            method: 'post'
          }).then(res => {
            if (res.data.code === 200) {
              _this.getNotifyList()
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
    },
    // 恢复已删除公告
    restoreRole: function(path, entityId) {
      let _this = this
      _this.$Modal.confirm({
        title: '提示',
        content: '确认恢复该公告？',
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
                title: '公告信息恢复成功'
              })
              _this.getNotifyList()
            } else {
              _this.$Notice.error({
                title: res.data.msg
              })
            }
          })
        }
      })
    },
    // 发布公告
    publicNotify: function (path, entityId) {
      let _this = this
      _this.$Modal.confirm({
        title: '提示',
        content: '确认发布该公告？',
        onOk: function () {
          axios.request({
            url: path,
            data: {
              entityId: entityId
            },
            method: 'post'
          }).then(res => {
            if (res.data.code === 200) {
              _this.getNotifyList()
              _this.$Notice.success({
                title: '公告发布成功'
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
    // 回撤已发布的公告
    retracementNotify: function (path, entityId) {
      let _this = this
      _this.$Modal.confirm({
        title: '提示',
        content: '确认回撤该公告？',
        onOk: function () {
          axios.request({
            url: path,
            data: {
              entityId: entityId
            },
            method: 'post'
          }).then(res => {
            if (res.data.code === 200) {
              _this.getNotifyList()
              _this.$Notice.success({
                title: '公告回撤成功'
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
      let _this = this
      _this.$Spin.hide()
      if (res.code === 200 && res.content !== null) {
        let length = _this.quill.getSelection().index;
        _this.quill.insertEmbed(length, 'image', 'http://47.106.109.254:8090/' + res.content)
        // 调整光标到最后
        _this.quill.setSelection(length + 1)
      } else {
        _this.$Notice.error({
          title: res.msg
        })
      }
    },
    handleFormatError () {
      let _this = this
      _this.$Spin.hide()
      _this.$Notice.error({
        title: '图片上传失败'
      })
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
    // 获取页面按钮权限菜单
    getPermissionBtns: function () {
      this.permissionBtns = []
      for (var item of common.permission) {
        if (item.p_fid === this.$route.meta.id) {
          this.permissionBtns.push(item)
          if (item.p_id === 29) {
              this.getListPath = item.p_path
          }
          if (item.p_id === 32) {
            this.showOneNotifyPath = item.p_path
          }
          if (item.p_id === 31 || item.p_id === 32 || item.p_id === 33 || item.p_id === 34 || item.p_id === 35 || item.p_id === 36) {
            this.handleBtns.push(item)
          }
        }
      }
    },
    pageOnChange: function (pageNum) {
      this.pageNum = pageNum
      this.getNotifyList()
    },
    onPageSizeChange: function (pageSize) {
      this.pageNum = 1
      this.pageSize = pageSize
      this.getNotifyList()
    },
    searchKeyChange: function () {
      this.nm_title = ''
      this.nm_isdraft = null
    }
  },
  mounted () {
    this.getPermissionBtns()
    this.getNotifyList()
    this.header = {
      'authorization': getToken()
    }
    this.quill = this.$refs.myQuillEditor.quill
  },
  watch: {
    'showModal': function (val) {
      if (!val) {
        this.nmTitle = ''
        this.nmKeys = ''
        this.nmContent = ''
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
</style>
