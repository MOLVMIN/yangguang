<template>
  <div style="height: 100%; width: 100%; overflow:hidden" id="myChart"></div>
</template>

<script>
import axios from '@/libs/api.request'
export default {
  data () {
    return {
      groupDepartData: []
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
          data: this.groupDepartData,
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
        _this.groupDepartData = _this.getGroupDepartArray(0, res.data.content)
        _this.createDepartTree(_this.groupDepartData)
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
      var newArray = new Array()
      for (var i in arr) {
        if (arr[i].depart_fid === id) {
          newArray.push({ name: arr[i].depart_name,
            value: [arr[i].username],
            depart_fid: arr[i].depart_fid,
            depart_id: arr[i].depart_id,
            tooltip: {
              padding: 10,
              backgroundColor: '#222',
              borderColor: '#777',
              borderWidth: 1,
              formatter: function (obj) {
                return '部门名称：' + obj.name + '<br>' +
                            '部门负责人：' + obj.value[0] + '<br>'
              }
            }
          })
        }
      }
      return newArray
    }
  },
  mounted () {
    this.getGroupDepartData()
  }
}
</script>

<style>
</style>
