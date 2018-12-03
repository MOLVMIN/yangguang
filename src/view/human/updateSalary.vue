<template>
  <div>
    <Tabs value="name1">
      <TabPane label="我的申请列表" name="name1">
        <Card>
          <div class="search-con">
            <!--<Select v-model="searchKey" placeholder="请选择搜索字段" clearable class="search-col search-con" @on-clear="searchKeyChange" @on-change="searchKeyChange">-->
              <!--<Option v-for="item in [{ key: 'lb_type', title: '离职类型' }]" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>-->
            <!--</Select>-->
            <Button class="search-btn" type="primary"><Icon type="search"/>搜索</Button>
            <Button v-for="item in permissionBtns" v-if="item.p_id === 81" @click="handleAdd" class="add-btn" type="primary">{{ item.p_name }}</Button>
          </div>
          <Table
            ref="tablesAsk"
            :data="tableData"
            :columns="columns"
          ></Table>
          <Page class="page" :total="total" :page-size="pageSize" transfer show-sizer show-elevator prev-text="上一页" next-text="下一页" @on-change="pageOnChange" @on-page-size-change="onPageSizeChange" />
        </Card>
      </TabPane>
      <TabPane label="待我审批列表" name="name2">
        <Card>
          <div class="search-con">
            <!--<Select v-model="searchKey_wait" clearable class="search-con search-col">-->
              <!--<Option v-for="item in columns" v-if="item.key !== 'handle'" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>-->
            <!--</Select>-->
            <!--<Input @on-change="handleClear_wait" clearable placeholder="输入关键字搜索" class="search-input" v-model="searchValue_wait"/>-->
            <Button class="search-btn" type="primary"><Icon type="search"/>搜索</Button>
          </div>
          <Table
            ref="tablesWait"
            :data="tableData_wait"
            :columns="columns_wait"
            :stripe=true
          ></Table>
          <Page class="page" :total="total_wait" :page-size="pageSize_wait" transfer show-sizer show-elevator prev-text="上一页" next-text="下一页" @on-change="pageOnChange_wait" @on-page-size-change="onPageSizeChange_wait" />
        </Card>
      </TabPane>
    </Tabs>
    <!--添加、修改申请模态框-->
    <Modal width="800" v-model="showModal" :mask-closable="false">
      <p slot="header" style="color:#2d8cf0">
        <!--<Icon type="md-add-circle" />-->
        <span>{{ modalTitle }}</span>
      </p>
      <Row>
        <Col span="12" class="form-container-item">
          <label>当前薪资：</label>
          <InputNumber
            :readonly="isView"
            style="width: 100%"
            v-model="usNowSalary">
          </InputNumber>
        </Col>
        <Col span="12" class="form-container-item">
          <label>调整后薪资：</label>
          <InputNumber
            :readonly="isView"
            style="width: 100%"
            v-model="usNewSalary">
          </InputNumber>
        </Col>
      </Row>
      <Row>
        <Col span="24" class="form-container-item">
          <label style="width: 125px">申请说明：</label>
          <Input :readonly="isView" v-model="usReason" type="textarea" placeholder="请填写申请说明" style="width: 100%" />
        </Col>
      </Row>
      <div slot="footer">
        <Button v-if="!isView && !isEdit" type="info" size="large" @click="addEntity">保存</Button>
        <Button v-if="isEdit" type="info" size="large" @click="editEntity">修改</Button>
      </div>
    </Modal>
    <!--提交申请-->
    <Modal width="400" v-model="showSubmitModal" :mask-closable="false">
      <p slot="header" style="color:#2d8cf0">
        <!--<Icon type="md-add-circle" />-->
        <span>提交提薪申请</span>
      </p>
      <Row>
        <Col span="24" class="form-container-item">
          <label>主任审批：</label>
          <Select v-model="directorId" placeholder="请选择审批人">
            <Option v-for="item in directorList" :value="item.id" :key="`search-col-${item.id}`">{{ item.username }}</Option>
          </Select>
        </Col>
        <Col span="24" class="form-container-item">
          <label>干事审批：</label>
          <Select v-model="generalId" placeholder="请选择审批人">
            <Option v-for="item in generalList" :value="item.id" :key="`search-col-${item.id}`">{{ item.username }}</Option>
          </Select>
        </Col>
      </Row>
      <div slot="footer">
        <Button type="info" size="large" @click="submitEntity">提交</Button>
      </div>
    </Modal>
    <!--审批-->
    <Modal width="400" v-model="showApproveModal" :mask-closable="false">
      <p slot="header" style="color:#2d8cf0">
        <!--<Icon type="md-add-circle" />-->
        <span>审批</span>
      </p>
      <Input v-model="approveReason" style="margin-top: 10px" type="textarea" placeholder="填写通过或拒绝原因…" />
      <div slot="footer">
        <Button type="warning" @click="approveEvent(false)">驳回</Button>
        <Button type="info" @click="approveEvent(true)">通过</Button>
        <!--<Button type="success" size="large" @click="addSubmit">发布</Button>-->
      </div>
    </Modal>
    <!--申请详情-->
    <Modal width="400" v-model="showApproveModalDetail" footer-hide>
      <p slot="header" style="color:#2d8cf0">
        <!--<Icon type="md-add-circle" />-->
        <span>详情</span>
      </p>
      <div style="display: flex; justify-content: center; margin: 5px 0">
        <label>申请人：</label>
        <div>admin</div>
      </div>
      <div style="display: flex; justify-content: center">
        <label>申请原因：</label>
        <div>哈哈</div>
      </div>
    </Modal>
  </div>
</template>

<script>
import axios from '@/libs/api.request'
import { getToken, getUserId } from '@/libs/util'
import { dateToStr } from '@/libs/tools'
import common from '@/libs/common'
export default {
  name: 'updateSalary_page',
  data () {
    return {
      columns: [
        {title: '序号', align: 'center', key: 'us_id', sortable: true},
        {title: '申请人', align: 'center', key: 'username'},
        {title: '当前薪资', align: 'center', key: 'us_now_salary'},
        {title: '调整后薪资', align: 'center', key: 'us_new_salary'},
        {
          title: '操作',
          key: 'handle',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            const btns = []
            for (var i = 0; i < this.handleBtns.length; i++) {
              const btn = this.handleBtns[i]
              if (this.handleBtns[i].p_id === 82) {
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
                      this.showOneEntity(params.row.us_id)
                      this.showModal = true
                      this.modalTitle = '提薪申请修改'
                      this.isView = false
                      this.isEdit = true
                      this.editId = params.row.us_id
                    }
                  }
                }, '修改'))
              } else if (this.handleBtns[i].p_id === 83) {
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
                      this.showOneEntity(params.row.us_id)
                      this.showModal = true
                      this.modalTitle = '提薪申请查看'
                      this.isView = true
                      this.isEdit = false
                    }
                  }
                }, '查看'))
              } else if (this.handleBtns[i].p_id === 84) {
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
                      this.deleteEntity(params.row.us_id)
                    }
                  }
                }, '删除'))
              } else if (this.handleBtns[i].p_id === 85) {
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
                      this.restoreEntity(params.row.us_id)
                    }
                  }
                }, '恢复'))
              } else if (this.handleBtns[i].p_id === 86) {
                btns.push(h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                    disabled: params.row.data_level === 5
                  },
                  style: {
                    margin: '2px'
                  },
                  on: {
                    click: () => {
                      this.submitEvent(params.row.us_id)
                    }
                  }
                }, '提交'))
              }
            }
            return h('div', btns)
          }
        }
      ],
      columns_wait: [],
      tableData: [],
      tableData_wait: [],
      total: 0,
      total_wait: 0,
      pageNum: 1,
      pageNum_wait: 1,
      pageSize: 10,
      pageSize_wait: 10,
      searchKey: '',
      searchValue: '',
      modalTitle: '添加提薪申请',
      showModal: false,
      showSubmitModal: false,
      searchKey_wait: '',
      searchValue_wait: '',
      modalTitle_wait: '',
      showModal_wait: false,
      appUser: '',
      appUserList: [],
      appUserPageNum: 1,
      appUserPageSize: 20,
      permissionBtns: [],
      handleBtns: [],
      addOnePath: '',
      editOnePath: '',
      deleteOnePath: '',
      restoreOnePath: '',
      getListPath: '',
      showOnePath: '',
      editId: '',
      submitId: '',
      submitPath: '',
      isView: false,
      isEdit: false,
      directorId: '',
      directorList: [],
      generalId: '',
      generalList: [],
      usReason: '',
      usNowSalary: 0,
      usNewSalary: 0,
      showApproveModal: false,
      showApproveModalDetail: false,
      processId: '', // 审批流程ID
      taskId: '', // 任务ID
      approveReason: ''
    }
  },
  methods: {
    handleAdd () {
      this.showModal = true
      this.isView = false
      this.isEdit = false
      this.modalTitle = '添加申请'
    },
    addEntity: function () {
      let _this = this
      axios.request({
        url: _this.addOnePath,
        data: {
          appUser: getUserId(),
          usReason: _this.usReason,
          usNowSalary: _this.usNowSalary,
          usNewSalary: _this.usNewSalary
        },
        method: 'post'
      }).then(res => {
        if (res.data.code === 200) {
          _this.getDataList()
          _this.showModal = false
          _this.$Notice.success({
            title: '申请添加成功'
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
          usId: _this.editId,
          appUser: getUserId(),
          usReason: _this.usReason,
          usNowSalary: _this.usNowSalary,
          usNewSalary: _this.usNewSalary
        },
        method: 'post'
      }).then(res => {
        if (res.data.code === 200) {
          _this.getDataList()
          _this.showModal = false
          _this.$Notice.success({
            title: '申请修改成功'
          })
        } else {
          _this.$Notice.error({
            title: res.data.msg
          })
        }
      })
    },
    deleteEntity: function (entityId) {
      let _this = this
      this.$Modal.confirm({
        title: '提示',
        content: '确认删除该申请？',
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
                title: '申请删除成功'
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
    restoreEntity: function (entityId) {
      let _this = this
      _this.$Modal.confirm({
        title: '提示',
        content: '确认恢复该申请？',
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
                title: '申请恢复成功'
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
    // 显示提交模态框
    submitEvent: function (entityId) {
      this.submitId = entityId
      this.showSubmitModal = true
    },
    // 提交申请
    submitEntity: function () {
      let _this = this
      _this.$Modal.confirm({
        title: '提示',
        content: '确认提交申请？',
        onOk: function () {
          axios.request({
            url: _this.submitPath,
            data: {
              entityId: _this.submitId,
              directorId: _this.directorId,
              generalId: _this.generalId
            },
            method: 'post'
          }).then(res => {
            if (res.data.code === 200) {
              _this.getDataList()
              _this.$Notice.success({
                title: '申请提交成功'
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
    getDataList: function (callback) {
      let _this = this
      axios.request({
        url: _this.getListPath,
        data: {
          pageNum: _this.pageNum,
          pageSize: _this.pageSize,
          type: _this.lb_type
        },
        method: 'post'
      }).then(res => {
        if (res.status === 200) {
          _this.tableData = res.data.content.list
          _this.total = res.data.content.total
          if (typeof callback === 'function') {
            callback()
          }
        }
      })
    },
    getNeedApprovalList: function () {
      let _this = this
      axios.request({
        url: 'm/approval/needApproval.do',
        data: {
          pageNum: _this.pageNum_wait,
          pageSize: _this.pageSize_wait,
          type: 'US'
        },
        method: 'post'
      }).then(res => {
        if (res.status === 200) {
          _this.tableData_wait = res.data.content.list
          _this.total_wait = res.data.content.total
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
        _this.usReason = res.data.content.us_reason,
        _this.usNowSalary = res.data.content.us_now_salary,
        _this.usNewSalary = res.data.content.us_new_salary
      })
    },
    pageOnChange: function (pageNum) {
      this.pageNum = pageNum
      this.getDataList()
    },
    pageOnChange_wait: function (pageNum) {
      this.pageNum_wait = pageNum
      this.getNeedApprovalList()
    },
    onPageSizeChange: function (pageSize) {
      this.pageNum = 1
      this.pageSize = pageSize
      this.getDataList()
    },
    onPageSizeChange_wait: function (pageSize) {
      this.pageNum_wait = 1
      this.pageSize_wait = pageSize
      this.getNeedApprovalList()
    },
    getAppUserList: function (apporType) {
      let _this = this
      axios.request({
        url: '',
        data: {
          pageNum: _this.appUserPageNum,
          pageSize: _this.appUserPageSize,
          apporType: apporType
        },
        method: 'post'
      }).then(res => {
        console.log(res)
      })
    },
    getPermissionBtns: function () {
      this.permissionBtns = []
      for (var item of common.permission) {
        if (item.p_fid === this.$route.meta.id) {
          this.permissionBtns.push(item)
          if (item.p_id === 80) {
            this.getListPath = item.p_path
          }
          if (item.p_id === 81) {
            this.addOnePath = item.p_path
          }
          if (item.p_id === 82) {
            this.editOnePath = item.p_path
          }
          if (item.p_id === 83) {
            this.showOnePath = item.p_path
          }
          if (item.p_id === 84) {
            this.deleteOnePath = item.p_path
          }
          if (item.p_id === 85) {
            this.restoreOnePath = item.p_path
          }
          if (item.p_id === 86) {
            this.submitPath = item.p_path
          }
          if (item.p_id === 82 || item.p_id === 83 || item.p_id === 84 || item.p_id === 85 || item.p_id === 86) {
            this.handleBtns.push(item)
          }
        }
      }
    },
    searchKeyChange: function () {
      this.lb_type = ''
    },
    // 获取所有主任审批人
    getDirectorList: function () {
      var _this = this
      axios.request({
        url: '/m/approval/getApprovalor.do',
        data: {
          apporType: 'DIRECTOR'
        },
        method: 'post'
      }).then(res => {
        _this.directorList = res.data.content.list
      })
    },
    // 获取所有干事审批人
    getGeneralList: function () {
      var _this = this
      axios.request({
        url: '/m/approval/getApprovalor.do',
        data: {
          apporType: 'GENERALOR'
        },
        method: 'post'
      }).then(res => {
        _this.generalList = res.data.content.list
      })
    },
    approveEvent: function (isPass) {
      var _this = this
      axios.request({
        url: '/m/approval/commonApproval.do',
        data: {
          processId: _this.processId,
          taskId: _this.taskId,
          isPass: isPass,
          reason: _this.approveReason
        },
        method: 'post'
      }).then(res => {
        if (res.status === 200) {
          _this.$Notice.success({
            title: '审批成功'
          })
          _this.showApproveModal = false
          _this.processId = ''
          _this.taskId = ''
          _this.approveReason = ''
          _this.getNeedApprovalList()
        } else {
          _this.$Notice.error({
            title: res.data.msg
          })
        }
        //        _this.generalList = res.data.content.list
      })
    },
    // 获取待我审批项详情
    getApproveDetail: function (entityId) {
      var _this = this
      axios.request({
        url: '/admin/human/updateSalary/showOneEntity.do',
        data: {
          entityId: entityId
        },
        method: 'post'
      }).then(res => {
        if (res.status === 200) {
          console.log(res)
        }
      })
    }
  },
  mounted () {
    this.getPermissionBtns()
    this.getDataList()
    this.getNeedApprovalList()
    this.getDirectorList()
    this.getGeneralList()
  },
  watch: {
    'showModal': function (val) {
      var _this = this
      if (!val) {
        _this.usReason = '',
        _this.usNowSalary = 0,
        _this.usNewSalary = 0
      }
    },
    'showApproveModal': function (val) {
      if (!val) {
        this.processId = ''
        this.taskId = ''
        this.approeReason = ''
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
  .form-container-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  .form-container-item label {
    width: 150px;
    text-align: center;
  }
</style>
