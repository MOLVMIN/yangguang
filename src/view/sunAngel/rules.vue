<template>
  <div>
    <Card>
      <div style="height: 40px;">
        <Button v-for="item in permissionBtns" v-if="item.p_id === 15" @click="updateBtn" class="add-btn" type="primary">{{ item.p_name }}</Button>
      </div>
      <div v-if="arContent !== null" v-html="arContent">
        {{ arContent }}
      </div>
      <div style="width: 100%; height: calc(100% - 50px); text-align: center" v-else>
        暂无章程
      </div>
    </Card>
    <Modal width="800" v-model="showModal" :mask-closable="false">
      <p slot="header" style="color:#2d8cf0">
        <!--<Icon type="md-add-circle" />-->
        <span>{{ modalTitle }}</span>
      </p>
      <Form>
        <FormItem>
          <quill-editor ref="myQuillEditor" :options="editorOptions" v-model="arEditContent" :content="arEditContent"></quill-editor>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button v-for="item in permissionBtns" v-if="item.p_id === 15" type="info" size="large" @click="updateArticles(item.p_path)">保存</Button>
        <!--<Button type="success" size="large" @click="addSubmit">发布</Button>-->
      </div>
    </Modal>
  </div>
</template>

<script>
  import QuillEditor from "../../../node_modules/vue-quill-editor/src/editor"
  import axios from '@/libs/api.request'
  import common from '@/libs/common'
  export default {
    name: 'rules',
    components: {
      QuillEditor
    },
    data () {
      return {
        arContent: null,
        showModal: false,
        editorOptions: {
          placeholder: '请输入章程内容…',
          modules: {
            toolbar: {
              container:
                [['bold', 'italic', 'underline', 'strike', 'clean'],
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
        arContent: '',
        arEditContent: '',
        modalTitle: '',
        permissionBtns: [],
        handleBtns: []
      }
    },
    methods: {
      // 获取章程内容
      getArticles: function () {
          let _this = this
          axios.request({
            url: 'm/articles/get.do',
            data: {
              type: '2'
            },
            method: 'post'
          }).then((res) => {
            if (res.data.code === 200) {
              _this.arContent = res.data.content.arContent
            }
          })
      },
      // 更新章程弹窗事件
      updateBtn: function () {
        this.modalTitle = '更新章程'
        this.showModal = true
        this.arEditContent = this.arContent
      },
      // 更新章程
      updateArticles: function (path) {
        let _this = this
        axios.request({
          url: path,
          data: {
            arContent: _this.arEditContent,
          },
          method: 'post'
        }).then((res) => {
          if (res.data.code === 200) {
              _this.showModal = false
              _this.getArticles()
              _this.$Notice.success({
                title: '章程更新成功'
              })
          } else {
              _this.$Notice.error({
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
            if (item.p_id === 14) {
              this.handleBtns.push(item)
            }
          }
        }
      }
    },
    mounted () {
      this.getPermissionBtns()
      this.getArticles()
    },
    watch: {
      'showModal': function (val) {
        if (!val) {
          this.arEditContent = ''
        }
      }
    }
  }
</script>

<style>
  .add-btn {
    float: right;
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
