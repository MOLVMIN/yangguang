<template>
  <div style="height: 750px; width: 100%; overflow:hidden" id="myChart"></div>
</template>

<script>
import axios from '@/libs/api.request'
export default {
  name: 'groupWorker',
  data () {
    return {
      allDepartUsers: [],
      userTreeData: []
    }
  },
  methods: {
    createDepartTree (data) {
      var echarts = require('echarts')
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('myChart'))
      myChart.setOption({
        tooltip: {
          show: true,
          trigger: 'item',
          triggerOn: 'mousemove'
        },
        series: [{
          type: 'tree',
          roam: true,
          data: this.userTreeData,
          orient: 'TB',
          layout: 'orthogonal',
          lineStyle: {
            curveness: '1'
          },
          label: {
            position: 'bottom',
            color: '#1196EE'
          },
          symbolSize: 12,
          initialTreeDepth: 3
        }]
      })
    },
    getGroupDepartData () {
      let _this = this
      axios.request({
        url: '/m/getDeparts.do',
        data: {},
        method: 'post'
      }).then(res => {
        _this.userTreeData = _this.getGroupDepartArray(0, res.data.content)
        _this.createDepartTree(_this.userTreeData)
      })
    },
    getGroupDepartArray (id, arr) {
      var childArr = this.getGroupDepartParentArray(id, arr)
      if (childArr.length > 0) {
        for (var i in childArr) {
          childArr[i].children = this.getGroupDepartArray(childArr[i].depart_id, arr)
        }
      }
      return childArr
    },
    getGroupDepartParentArray (id, arr) {
      let _this = this
      var newArray = new Array()
      for (var i in arr) {
        if (arr[i].depart_fid === id) {
          newArray.push({
            name: arr[i].username,
            value: [arr[i].depart_name],
            id: arr[i].id,
            depart_fid: arr[i].depart_fid,
            depart_id: arr[i].depart_id,
            tooltip: {
              padding: 10,
              backgroundColor: '#222',
              borderColor: '#777',
              borderWidth: 1,
              formatter: function (obj) {
                return '人员名称：' + obj.name + '<br>' +
                    '所属部门：' + obj.value[0] + '<br>'
              }
            }
          })
        }
      }
      for (var j in _this.allDepartUsers) {
        if (_this.allDepartUsers[j].user_depart == id) {
          for (var h in newArray) {
              if (newArray[h].id == _this.allDepartUsers[j].id) {
                  console.log('yes')
                continue
              }
          }
          newArray.push({
            name: _this.allDepartUsers[j].username,
            value: [_this.allDepartUsers[j].depart_name],
            id: _this.allDepartUsers[j].id,
            tooltip: {
              padding: 10,
              backgroundColor: '#222',
              borderColor: '#777',
              borderWidth: 1,
              formatter: function (obj) {
                return '人员名称：' + obj.name + '<br>' +
                    '所属部门：' + obj.value[0] + '<br>'
              }
            }
          })
        }
      }
      return newArray
    },
    getAllUsers () {
      let _this = this
      axios.request({
        url: '/m/getAllUsers.do',
        data: {},
        method: 'post'
      }).then(res => {
        _this.allDepartUsers = res.data.content
        _this.getGroupDepartData()
      })
    }
  },
  mounted () {
    this.getAllUsers()
  }
}
</script>

<style>
</style>
