<template>
    <div class="container">
        <div class="message">
            <div class="container">
                <span class="title">{{machineData?machineData.name:'加载中...'}}</span>
                <span class="sub-title">{{machineData?`（${machineData.ip}）`:'（加载中...）'}}</span>
            </div>
        </div>
        <Chart :option="chartOption"/>
        <div class="operate">
            <el-button type="primary" size="small" @click="toggleState" :disabled="!operation.range">{{state?'停止':'开始'}}
            </el-button>
        </div>
        <div class="set">
            <div class="range" v-if="functions.includes('量程设置')">
                <div class="set-title">量程设置：</div>
                <div class="slider">
                    <el-slider
                            :disabled="state"
                            v-model="operation.range"
                            :max="3"
                            :step="0.6"
                            show-stops
                            show-input>
                    </el-slider>
                </div>
            </div>
            <el-button type="primary" class="save" size="small" @click="saveOperation">保存</el-button>
        </div>
    </div>
</template>


<script>
  import {ipcRenderer} from 'electron'
  import io from 'socket.io-client'
  import Chart from '../Chart/Chart'

  export default {
    name: 'miniWindow',
    data () {
      return {
        socket: null,
        machineData: null,
        quanta: 0,
        operation: {
          range: 0
        },
        state: false,
        functions: [],
        chartOption: {
          chart: {
            type: 'gauge',
            plotBorderWidth: 1, // 边框
            plotBackgroundColor: { // 背景
              linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                [0, '#FFF4C6'],
                [0.3, '#FFFFFF'],
                [1, '#FFF4C6']
              ]
            },
            plotBackgroundImage: null,
            height: 200
          },
          credits: {
            enabled: false // 去掉版权信息
          },
          title: {
            text: null
          },
          pane: [
            {
              startAngle: -45,
              endAngle: 45,
              background: null,
              center: ['50%', '145%'],
              size: 300
            }],
          yAxis: [
            {
              min: -20,
              max: 6,
              minorTickPosition: 'outside',
              tickPosition: 'outside',
              labels: {
                rotation: 'auto',
                distance: 20
              },
              plotBands: [{
                from: 0,
                to: 6,
                color: '#C02316',
                innerRadius: '100%',
                outerRadius: '105%'
              }],
              pane: 0,
              title: {
                text: 'VU',
                y: -40
              }
            }],
          plotOptions: {
            gauge: {
              dataLabels: {
                enabled: false
              },
              dial: {
                radius: '100%'
              }
            }
          },
          series: [
            {
              data: [-20],
              yAxis: 0
            }]
        }
      }
    },
    components: {
      Chart
    },
    created () {
      ipcRenderer.send('miniWindowMounted', {data: true}) // vue实例创建完成之后，发送消息给主进程，以获取当前设备信息
      ipcRenderer.on('theMachine', (e, data) => {
        console.log(data) // 设备信息
        this.machineData = data
      })
      this.socket = io.connect('ws://127.0.0.1:8888')
      this.socket.on('connect', () => {
        console.log('is connected')
        this.socket.emit('postType', {type: this.machineData})
      })
    },
    mounted () {
      this.socket.on('data', (res) => {
        if (!res.code && res.msg === 'success') {
          this.functions = res.data.function
        }
      })
    },
    destroyed () {
      this.socket.close()
    },
    methods: {
      toggleState () {
        this.state = !this.state
      },
      saveOperation () {
        let data = {range: [0, this.operation.range], ...this.machineData}
        console.log(data)
        this.socket.emit('saveOperation', data)
      }
    }
  }
</script>


<style scoped>
    .message {
        display: flex;
        justify-content: center;
    }

    .container {
        text-align: center;
    }

    .title, .sub-title {
        display: inline-block;
        width: 100%;
        font-family: "Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif;
    }

    .title {
        font-size: 22px;
        font-weight: bolder;
    }

    .sub-title {
        font-size: 14px;
        color: #323232;
    }

    .set {
        margin: 12px 2%;
        padding: 4px;
        border: 1px solid #b4b4b4;
        min-height: 120px;
        position: relative;
    }

    .range {
        /*width: 350px;*/
        font-size: 14px;
        display: flex;
        vertical-align: bottom;
    }

    .save {
        position: absolute;
        bottom: 4px;
        right: 4px;
    }

    .slider {
        width: 300px;
    }

    .set-title {
        margin-right: 10px;
        height: 38px;
        line-height: 38px;
    }
</style>
