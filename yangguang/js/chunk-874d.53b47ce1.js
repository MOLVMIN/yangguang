(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-874d"],{6638:function(t,e,a){},baf2:function(t,e,a){"use strict";a.r(e);var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("Tabs",{attrs:{value:"name1"}},[a("TabPane",{attrs:{label:"我的申请列表",name:"name1"}},[a("Card",[a("div",{staticClass:"search-con"},[a("Button",{staticClass:"search-btn",attrs:{type:"primary"}},[a("Icon",{attrs:{type:"search"}}),t._v("搜索")],1),t._l(t.permissionBtns,function(e){return 81===e.p_id?a("Button",{staticClass:"add-btn",attrs:{type:"primary"},on:{click:t.handleAdd}},[t._v(t._s(e.p_name))]):t._e()})],2),a("Table",{ref:"tablesAsk",attrs:{data:t.tableData,columns:t.columns}}),a("Page",{staticClass:"page",attrs:{total:t.total,"page-size":t.pageSize,transfer:"","show-sizer":"","show-elevator":"","prev-text":"上一页","next-text":"下一页"},on:{"on-change":t.pageOnChange,"on-page-size-change":t.onPageSizeChange}})],1)],1),a("TabPane",{attrs:{label:"待我审批列表",name:"name2"}},[a("Card",[a("div",{staticClass:"search-con"},[a("Button",{staticClass:"search-btn",attrs:{type:"primary"}},[a("Icon",{attrs:{type:"search"}}),t._v("搜索")],1)],1),a("Table",{ref:"tablesWait",attrs:{data:t.tableData_wait,columns:t.columns_wait,stripe:!0}}),a("Page",{staticClass:"page",attrs:{total:t.total_wait,"page-size":t.pageSize_wait,transfer:"","show-sizer":"","show-elevator":"","prev-text":"上一页","next-text":"下一页"},on:{"on-change":t.pageOnChange_wait,"on-page-size-change":t.onPageSizeChange_wait}})],1)],1)],1),a("Modal",{attrs:{width:"800","mask-closable":!1},model:{value:t.showModal,callback:function(e){t.showModal=e},expression:"showModal"}},[a("p",{staticStyle:{color:"#2d8cf0"},attrs:{slot:"header"},slot:"header"},[a("span",[t._v(t._s(t.modalTitle))])]),a("Row",[a("Col",{staticClass:"form-container-item",attrs:{span:"12"}},[a("label",[t._v("当前薪资：")]),a("InputNumber",{staticStyle:{width:"100%"},attrs:{readonly:t.isView},model:{value:t.usNowSalary,callback:function(e){t.usNowSalary=e},expression:"usNowSalary"}})],1),a("Col",{staticClass:"form-container-item",attrs:{span:"12"}},[a("label",[t._v("调整后薪资：")]),a("InputNumber",{staticStyle:{width:"100%"},attrs:{readonly:t.isView},model:{value:t.usNewSalary,callback:function(e){t.usNewSalary=e},expression:"usNewSalary"}})],1)],1),a("Row",[a("Col",{staticClass:"form-container-item",attrs:{span:"24"}},[a("label",{staticStyle:{width:"125px"}},[t._v("申请说明：")]),a("Input",{staticStyle:{width:"100%"},attrs:{readonly:t.isView,type:"textarea",placeholder:"请填写申请说明"},model:{value:t.usReason,callback:function(e){t.usReason=e},expression:"usReason"}})],1)],1),a("div",{attrs:{slot:"footer"},slot:"footer"},[t.isView||t.isEdit?t._e():a("Button",{attrs:{type:"info",size:"large"},on:{click:t.addEntity}},[t._v("保存")]),t.isEdit?a("Button",{attrs:{type:"info",size:"large"},on:{click:t.editEntity}},[t._v("修改")]):t._e()],1)],1),a("Modal",{attrs:{width:"400","mask-closable":!1},model:{value:t.showSubmitModal,callback:function(e){t.showSubmitModal=e},expression:"showSubmitModal"}},[a("p",{staticStyle:{color:"#2d8cf0"},attrs:{slot:"header"},slot:"header"},[a("span",[t._v("提交提薪申请")])]),a("Row",[a("Col",{staticClass:"form-container-item",attrs:{span:"24"}},[a("label",[t._v("主任审批：")]),a("Select",{attrs:{placeholder:"请选择审批人"},model:{value:t.directorId,callback:function(e){t.directorId=e},expression:"directorId"}},t._l(t.directorList,function(e){return a("Option",{key:"search-col-"+e.id,attrs:{value:e.id}},[t._v(t._s(e.username))])}))],1),a("Col",{staticClass:"form-container-item",attrs:{span:"24"}},[a("label",[t._v("干事审批：")]),a("Select",{attrs:{placeholder:"请选择审批人"},model:{value:t.generalId,callback:function(e){t.generalId=e},expression:"generalId"}},t._l(t.generalList,function(e){return a("Option",{key:"search-col-"+e.id,attrs:{value:e.id}},[t._v(t._s(e.username))])}))],1)],1),a("div",{attrs:{slot:"footer"},slot:"footer"},[a("Button",{attrs:{type:"info",size:"large"},on:{click:t.submitEntity}},[t._v("提交")])],1)],1),a("Modal",{attrs:{width:"400","mask-closable":!1},model:{value:t.showApproveModal,callback:function(e){t.showApproveModal=e},expression:"showApproveModal"}},[a("p",{staticStyle:{color:"#2d8cf0"},attrs:{slot:"header"},slot:"header"},[a("span",[t._v("审批")])]),a("Input",{staticStyle:{"margin-top":"10px"},attrs:{type:"textarea",placeholder:"填写通过或拒绝原因…"},model:{value:t.approveReason,callback:function(e){t.approveReason=e},expression:"approveReason"}}),a("div",{attrs:{slot:"footer"},slot:"footer"},[a("Button",{attrs:{type:"warning"},on:{click:function(e){t.approveEvent(!1)}}},[t._v("驳回")]),a("Button",{attrs:{type:"info"},on:{click:function(e){t.approveEvent(!0)}}},[t._v("通过")])],1)],1),a("Modal",{attrs:{width:"400","footer-hide":""},model:{value:t.showApproveModalDetail,callback:function(e){t.showApproveModalDetail=e},expression:"showApproveModalDetail"}},[a("p",{staticStyle:{color:"#2d8cf0"},attrs:{slot:"header"},slot:"header"},[a("span",[t._v("详情")])]),a("div",{staticStyle:{display:"flex","justify-content":"center",margin:"5px 0"}},[a("label",[t._v("申请人：")]),a("div",[t._v("admin")])]),a("div",{staticStyle:{display:"flex","justify-content":"center"}},[a("label",[t._v("申请原因：")]),a("div",[t._v("哈哈")])])])],1)},o=[],i=(a("ac4d"),a("8a81"),a("ac6a"),a("66df")),n=a("c276"),r=(a("90de"),a("88ec")),l={name:"updateSalary_page",data:function(){var t=this;return{columns:[{title:"序号",align:"center",key:"us_id",sortable:!0},{title:"申请人",align:"center",key:"username"},{title:"当前薪资",align:"center",key:"us_now_salary"},{title:"调整后薪资",align:"center",key:"us_new_salary"},{title:"操作",key:"handle",align:"center",minWidth:100,render:function(e,a){for(var s=[],o=0;o<t.handleBtns.length;o++){t.handleBtns[o];82===t.handleBtns[o].p_id?s.push(e("Button",{props:{type:"primary",size:"small",disabled:5===a.row.data_level},style:{margin:"2px"},on:{click:function(){t.showOneEntity(a.row.us_id),t.showModal=!0,t.modalTitle="提薪申请修改",t.isView=!1,t.isEdit=!0,t.editId=a.row.us_id}}},"修改")):83===t.handleBtns[o].p_id?s.push(e("Button",{props:{type:"info",size:"small"},style:{margin:"2px"},on:{click:function(){t.showOneEntity(a.row.us_id),t.showModal=!0,t.modalTitle="提薪申请查看",t.isView=!0,t.isEdit=!1}}},"查看")):84===t.handleBtns[o].p_id?s.push(e("Button",{props:{type:"error",size:"small",disabled:5===a.row.data_level},style:{margin:"2px"},on:{click:function(){t.deleteEntity(a.row.us_id)}}},"删除")):85===t.handleBtns[o].p_id?s.push(e("Button",{props:{type:"warning",size:"small",disabled:1===a.row.data_level},style:{margin:"2px"},on:{click:function(){t.restoreEntity(a.row.us_id)}}},"恢复")):86===t.handleBtns[o].p_id&&s.push(e("Button",{props:{type:"success",size:"small",disabled:5===a.row.data_level},style:{margin:"2px"},on:{click:function(){t.submitEvent(a.row.us_id)}}},"提交"))}return e("div",s)}}],columns_wait:[],tableData:[],tableData_wait:[],total:0,total_wait:0,pageNum:1,pageNum_wait:1,pageSize:10,pageSize_wait:10,searchKey:"",searchValue:"",modalTitle:"添加提薪申请",showModal:!1,showSubmitModal:!1,searchKey_wait:"",searchValue_wait:"",modalTitle_wait:"",showModal_wait:!1,appUser:"",appUserList:[],appUserPageNum:1,appUserPageSize:20,permissionBtns:[],handleBtns:[],addOnePath:"",editOnePath:"",deleteOnePath:"",restoreOnePath:"",getListPath:"",showOnePath:"",editId:"",submitId:"",submitPath:"",isView:!1,isEdit:!1,directorId:"",directorList:[],generalId:"",generalList:[],usReason:"",usNowSalary:0,usNewSalary:0,showApproveModal:!1,showApproveModalDetail:!1,processId:"",taskId:"",approveReason:""}},methods:{handleAdd:function(){this.showModal=!0,this.isView=!1,this.isEdit=!1,this.modalTitle="添加申请"},addEntity:function(){var t=this;i["a"].request({url:t.addOnePath,data:{appUser:Object(n["j"])(),usReason:t.usReason,usNowSalary:t.usNowSalary,usNewSalary:t.usNewSalary},method:"post"}).then(function(e){200===e.data.code?(t.getDataList(),t.showModal=!1,t.$Notice.success({title:"申请添加成功"})):t.$Notice.error({title:e.data.msg})})},editEntity:function(){var t=this;i["a"].request({url:t.editOnePath,data:{usId:t.editId,appUser:Object(n["j"])(),usReason:t.usReason,usNowSalary:t.usNowSalary,usNewSalary:t.usNewSalary},method:"post"}).then(function(e){200===e.data.code?(t.getDataList(),t.showModal=!1,t.$Notice.success({title:"申请修改成功"})):t.$Notice.error({title:e.data.msg})})},deleteEntity:function(t){var e=this;this.$Modal.confirm({title:"提示",content:"确认删除该申请？",onOk:function(){i["a"].request({url:e.deleteOnePath,data:{entityId:t},method:"post"}).then(function(t){200===t.data.code?(e.getDataList(),e.$Notice.success({title:"申请删除成功"})):e.$Notice.error({title:t.data.msg})})}})},restoreEntity:function(t){var e=this;e.$Modal.confirm({title:"提示",content:"确认恢复该申请？",onOk:function(){i["a"].request({url:e.restoreOnePath,data:{entityId:t},method:"post"}).then(function(t){200===t.data.code?(e.getDataList(),e.$Notice.success({title:"申请恢复成功"})):e.$Notice.error({title:t.data.msg})})}})},submitEvent:function(t){this.submitId=t,this.showSubmitModal=!0},submitEntity:function(){var t=this;t.$Modal.confirm({title:"提示",content:"确认提交申请？",onOk:function(){i["a"].request({url:t.submitPath,data:{entityId:t.submitId,directorId:t.directorId,generalId:t.generalId},method:"post"}).then(function(e){200===e.data.code?(t.getDataList(),t.$Notice.success({title:"申请提交成功"})):t.$Notice.error({title:e.data.msg})})}})},getDataList:function(t){var e=this;i["a"].request({url:e.getListPath,data:{pageNum:e.pageNum,pageSize:e.pageSize,type:e.lb_type},method:"post"}).then(function(a){200===a.status&&(e.tableData=a.data.content.list,e.total=a.data.content.total,"function"===typeof t&&t())})},getNeedApprovalList:function(){var t=this;i["a"].request({url:"m/approval/needApproval.do",data:{pageNum:t.pageNum_wait,pageSize:t.pageSize_wait,type:"US"},method:"post"}).then(function(e){200===e.status&&(t.tableData_wait=e.data.content.list,t.total_wait=e.data.content.total)})},showOneEntity:function(t){var e=this;i["a"].request({url:e.showOnePath,data:{entityId:t},method:"post"}).then(function(t){e.usReason=t.data.content.us_reason,e.usNowSalary=t.data.content.us_now_salary,e.usNewSalary=t.data.content.us_new_salary})},pageOnChange:function(t){this.pageNum=t,this.getDataList()},pageOnChange_wait:function(t){this.pageNum_wait=t,this.getNeedApprovalList()},onPageSizeChange:function(t){this.pageNum=1,this.pageSize=t,this.getDataList()},onPageSizeChange_wait:function(t){this.pageNum_wait=1,this.pageSize_wait=t,this.getNeedApprovalList()},getAppUserList:function(t){var e=this;i["a"].request({url:"",data:{pageNum:e.appUserPageNum,pageSize:e.appUserPageSize,apporType:t},method:"post"}).then(function(t){console.log(t)})},getPermissionBtns:function(){this.permissionBtns=[];var t=!0,e=!1,a=void 0;try{for(var s,o=r["a"].permission[Symbol.iterator]();!(t=(s=o.next()).done);t=!0){var i=s.value;i.p_fid===this.$route.meta.id&&(this.permissionBtns.push(i),80===i.p_id&&(this.getListPath=i.p_path),81===i.p_id&&(this.addOnePath=i.p_path),82===i.p_id&&(this.editOnePath=i.p_path),83===i.p_id&&(this.showOnePath=i.p_path),84===i.p_id&&(this.deleteOnePath=i.p_path),85===i.p_id&&(this.restoreOnePath=i.p_path),86===i.p_id&&(this.submitPath=i.p_path),82!==i.p_id&&83!==i.p_id&&84!==i.p_id&&85!==i.p_id&&86!==i.p_id||this.handleBtns.push(i))}}catch(t){e=!0,a=t}finally{try{t||null==o.return||o.return()}finally{if(e)throw a}}},searchKeyChange:function(){this.lb_type=""},getDirectorList:function(){var t=this;i["a"].request({url:"/m/approval/getApprovalor.do",data:{apporType:"DIRECTOR"},method:"post"}).then(function(e){t.directorList=e.data.content.list})},getGeneralList:function(){var t=this;i["a"].request({url:"/m/approval/getApprovalor.do",data:{apporType:"GENERALOR"},method:"post"}).then(function(e){t.generalList=e.data.content.list})},approveEvent:function(t){var e=this;i["a"].request({url:"/m/approval/commonApproval.do",data:{processId:e.processId,taskId:e.taskId,isPass:t,reason:e.approveReason},method:"post"}).then(function(t){200===t.status?(e.$Notice.success({title:"审批成功"}),e.showApproveModal=!1,e.processId="",e.taskId="",e.approveReason="",e.getNeedApprovalList()):e.$Notice.error({title:t.data.msg})})},getApproveDetail:function(t){i["a"].request({url:"/admin/human/updateSalary/showOneEntity.do",data:{entityId:t},method:"post"}).then(function(t){200===t.status&&console.log(t)})}},mounted:function(){this.getPermissionBtns(),this.getDataList(),this.getNeedApprovalList(),this.getDirectorList(),this.getGeneralList()},watch:{showModal:function(t){var e=this;t||(e.usReason="",e.usNowSalary=0,e.usNewSalary=0)},showApproveModal:function(t){t||(this.processId="",this.taskId="",this.approeReason="")}}},d=l,p=(a("cff8"),a("2877")),c=Object(p["a"])(d,s,o,!1,null,null,null);c.options.__file="updateSalary.vue";e["default"]=c.exports},cff8:function(t,e,a){"use strict";var s=a("6638"),o=a.n(s);o.a}}]);