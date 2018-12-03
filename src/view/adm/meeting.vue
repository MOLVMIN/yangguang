<template>
  <div>
    <Card>
      <div class="search-con search-con-top">
        <Select v-model="searchKey" placeholder="请选择搜索字段" clearable class="search-col" @on-clear="searchKeyChange" @on-change="searchKeyChange">
          <Option v-for="item in [{ key: 'me_title', title: '主题' },{ key: 'me_name', title: '名称' }]" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>
        </Select>
        <Input v-if="searchKey === 'me_title'" clearable placeholder="输入主题关键字搜索" class="search-input" v-model="me_title"/>
        <Input v-if="searchKey === 'me_name'" clearable placeholder="输入名称关键字搜索" class="search-input" v-model="me_name"/>
        <Button class="search-btn" type="primary" @click="getMeetingList"><Icon type="search"/>搜索</Button>
        <Button v-for="item in permissionBtns" v-if="item.p_id === 39"  @click="handleAdd" class="add-btn" type="primary">{{ item.p_name }}</Button>
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
    <Modal width="800" v-model="showModal" :mask-closable="false">
      <p slot="header" style="color:#2d8cf0">
        <!--<Icon type="md-add-circle" />-->
        <span>{{ modalTitle }}</span>
      </p>
      <Form>
        <FormItem>
          <label>会议主题：</label>
          <Input v-model="meTitle" placeholder="请输入会议标题" />
        </FormItem>
        <FormItem>
          <label>会议名称：</label>
          <Input v-model="meName" placeholder="请输入会议标题" />
        </FormItem>
        <FormItem>
          <label>会议时间：</label>
          <DatePicker type="datetime" format="yyyy-MM-dd HH:mm" v-model="meDate" :editable=false placeholder="选择会议日期和时间" style="width: 100%"></DatePicker>
        </FormItem>
        <FormItem>
          <label>与会人员：</label>
          <Select v-model="meUsers" filterable multiple>
            <Option v-for="item in subDepartUsers" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem>
          <label>内容：</label>
          <quill-editor ref="myQuillEditor" :options="editorOptions" v-model="meContent"></quill-editor>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button v-if="!isView && !isEdit" type="info" size="large" @click="addMeeting">保存</Button>
        <Button v-if="isEdit" type="info" size="large" @click="editMeeting">修改</Button>
        <!--<Button type="success" size="large" @click="addSubmit">发布</Button>-->
      </div>
    </Modal>
  </div>
</template>

<script>
import QuillEditor from "../../../node_modules/vue-quill-editor/src/editor"
import axios from '@/libs/api.request'
import { getToken } from '@/libs/util'
import './common-css/search.less'
import common from '@/libs/common'
export default {
  name: 'meeting_page',
  components: {
    QuillEditor
  },
  data () {
    return {
      me_title: '',
      me_name: '',
      columns: [
        {title: '会议主题', align: 'center', key: 'me_title', sortable: true},
        {title: '会议名称', align: 'center', key: 'me_name'},
        {title: '创建时间', align: 'center', key: 'create_time'},
        {
          title: '操作',
          key: 'handle',
          align: 'center',
          render: (h, params) => {
            const btns = []
            for (var i = 0; i < this.handleBtns.length; i++) {
              const btn = this.handleBtns[i]
              if (this.handleBtns[i].p_id === 40) {
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
                      this.showOneMeeting(this.showOneMeetingPath, params.row.me_id)
                      this.showModal = true
                      this.modalTitle = '会议纪要修改'
                      this.isView = false
                      this.isEdit = true
                      this.editId = params.row.me_id
                    }
                  }
                }, '修改'))
              } else if (this.handleBtns[i].p_id === 41) {
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
                      this.showOneMeeting(this.showOneMeetingPath, params.row.me_id)
                      this.showModal = true
                      this.modalTitle = '会议纪要查看'
                      this.isView = true
                      this.isEdit = false
                    }
                  }
                }, '查看'))
              } else if (this.handleBtns[i].p_id === 42) {
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
                      this.deleteMeeting(btn.p_path, params.row.me_id)
                    }
                  }
                }, '删除'))
              } else if (this.handleBtns[i].p_id === 43) {
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
                      this.restoreMeeting(btn.p_path, params.row.me_id)
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
      modalTitle: '添加会议纪要',
      meTitle: '',
      meName: '',
      meDate: new Date(),
      meContent: '',
      header: {},
      quill: null,
      editorOptions: {
        placeholder: '请输入公告内容…',
        modules: {
          toolbar: {
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
      meUsers: [],
      subDepartUsers: [],
      permissionBtns: [],
      handleBtns: [],
      isView: false,
      isEdit: false,
      total: 0,
      pageNum: 1,
      pageSize: 20,
      getListPath: '',
      showOneMeetingPath: '',
      editId: ''
    }
  },
  methods: {
    handleAdd () {
      this.showModal = true
      this.isView = false
      this.isEdit = false
      this.modalTitle = '添加会议纪要'
    },
    getMeetingList: function () {
      let _this = this
      axios.request({
        url: 'admin/adm/meeting/showEntity.do',
        data: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          isSelf: true,
          title: this.me_title,
          name: this.me_name
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
    addMeeting: function () {
      let _this = this
      let date = _this.meDate.getFullYear() + '-' + (_this.meDate.getMonth() + 1) + '-' + _this.meDate.getDate() + ' ' + _this.meDate.getHours() + ':' + _this.meDate.getMinutes()
      axios.request({
        url: 'admin/adm/meeting/addEntity.do',
        data: {
          meTitle: _this.meTitle,
          meName: _this.meName,
          meDate: date,
          meUsers: _this.meUsers.join(','),
          meFollow: '无',
          meContent: _this.meContent
        },
        method: 'post'
      }).then((res) => {
        if (res.data.code === 200) {
          _this.getMeetingList()
          _this.showModal = false
          _this.$Notice.success({
            title: '会议纪要添加成功'
          })
        } else {
          _this.$Notice.error({
            title: res.data.msg
          })
        }
      })
    },
    editMeeting: function () {
      let _this = this
      let date = _this.meDate.getFullYear() + '-' + (_this.meDate.getMonth() + 1) + '-' + _this.meDate.getDate() + ' ' + _this.meDate.getHours() + ':' + _this.meDate.getMinutes()
      axios.request({
        url: 'admin/adm/meeting/editEntity.do',
        data: {
          meId: _this.editId,
          meTitle: _this.meTitle,
          meName: _this.meName,
          meDate: date,
          meUsers: _this.meUsers.join(','),
          meFollow: '无',
          meContent: _this.meContent
        },
        method: 'post'
      }).then((res) => {
        if (res.data.code === 200) {
          _this.getMeetingList()
          _this.showModal = false
          _this.$Notice.success({
            title: '会议纪要修改成功'
          })
        } else {
          _this.$Notice.error({
            title: res.data.msg
          })
        }
      })
    },
    showOneMeeting: function (path, entityId) {
      axios.request({
        url: path,
        data: {
          entityId: entityId
        },
        method: 'post'
      }).then(res => {
        this.meTitle = res.data.content.me_title
        this.meName = res.data.content.me_name
        this.meDate = res.data.content.me_date
        this.meContent = res.data.content.me_content
        this.meUsers = res.data.content.me_users.split(',').map(Number) // map(Number)将["3","2","1"]格式转换成[3,2,1]
      })
    },
    deleteMeeting: function (path, entityId) {
      let _this = this
      this.$Modal.confirm({
        title: '提示',
        content: '确认删除该会议纪要？',
        onOk: function () {
          axios.request({
            url: path,
            data: {
              entityId: entityId
            },
            method: 'post'
          }).then(res => {
            if (res.data.code === 200) {
              _this.getMeetingList()
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
    restoreMeeting: function (path, entityId) {
      let _this = this
      _this.$Modal.confirm({
        title: '提示',
        content: '确认恢复该会议纪要？',
        onOk: function () {
          axios.request({
            url: path,
            data: {
              entityId: entityId
            },
            method: 'post'
          }).then(res => {
            if (res.data.code === 200) {
              _this.getMeetingList()
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
    getSubDepartUsers () {
      let _this = this
      axios.request({
        url: 'm/getSubDepartUsers.do',
        method: 'post'
      }).then((res) => {
        for (var index in res.data.content) {
          _this.subDepartUsers.push({ label: res.data.content[index].username, value: res.data.content[index].id })
        }
      })
    },
    getPermissionBtns: function () {
      this.permissionBtns = []
      for (var item of common.permission) {
        if (item.p_fid === this.$route.meta.id) {
          this.permissionBtns.push(item)
          if (item.p_id === 38) {
              this.getListPath = item.p_path
          }
          if (item.p_id === 41) {
            this.showOneMeetingPath = item.p_path
          }
          if (item.p_id === 40 || item.p_id === 41 || item.p_id === 42 || item.p_id === 43) {
            this.handleBtns.push(item)
          }
        }
      }
    },
    pageOnChange: function (pageNum) {
      this.pageNum = pageNum
      this.getMeetingList()
    },
    onPageSizeChange: function (pageSize) {
      this.pageNum = 1
      this.pageSize = pageSize
      this.getMeetingList()
    },
    searchKeyChange: function () {
      this.me_title = ''
      this.me_name = ''
    }
  },
  mounted: function () {
    this.getPermissionBtns()
    this.getMeetingList()
    this.header = {
      'authorization': getToken()
    }
    this.quill = this.$refs.myQuillEditor.quill
    this.getSubDepartUsers()
  },
  watch: {
    'showModal': function (val) {
      if (!val) {
        this.meTitle = ''
        this.meName = ''
        this.meDate = new Date()
        this.meUsers = []
        this.meContent = ''
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
