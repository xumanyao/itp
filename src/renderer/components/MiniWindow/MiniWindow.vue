<template>
    <div class="container">
        <div class="message">
            <div class="container">
                <span class="title">{{machineData?machineData.name:'加载中...'}}</span>
                <span class="sub-title">{{machineData?`（${machineData.ip}）`:'（加载中...）'}}</span>
            </div>
        </div>
        <div v-if="type === 'chart'">
            <Chart :option="computedOption({})" v-if="type==='chart' && functions[0] !== '通断检测'" :data="data"
                   :range="range" @disableButton='handleStopButton'/>
            <div class="on-off-box" v-if="type==='chart' && functions[0] === '通断检测'">
                <el-progress type="circle" :percentage="on_off_percent" status="text" :color="on_off_color">
                    {{on_off_flag}}
                </el-progress>
            </div>
            <div class="operate">
                <el-button type="primary" size="small" @click="toggleState"
                           :disabled="(!range && functions[0] !== '通断检测') || stop">{{state?'停止':'开始'}}
                </el-button>
            </div>
            <div class="set" v-if="functions.includes('量程设置')">
                <div class="range" v-if="this.type === 'chart'">
                    <div class="set-title">量程设置：</div>
                    <div class="slider">
                        <el-slider
                                :disabled="state"
                                v-model="operation.range"
                                :max="getRange()"
                                :step="getStep()"
                                show-stops
                                show-input>
                        </el-slider>
                    </div>
                </div>
                <el-button type="primary" class="save" size="small" @click="saveOperation">保存</el-button>
            </div>
        </div>
        <div v-if="type === 'signal'">
            <Signal :functions="functions" :socket="socket"/>
        </div>
    </div>
</template>


<script>
  import {ipcRenderer} from 'electron'
  import io from 'socket.io-client'
  import Chart from '../Chart/Chart'
  import Signal from '../Signal/Signal'

  export default {
    name: 'miniWindow',
    data () {
      return {
        type: '',
        socket: null,
        machineData: null,
        operation: {
          range: 0 // 仅仅是当前的联动值，不一定是应用到的
        },
        range: 0, // 实际应用的量程
        data: 0,
        state: false,
        functions: [],
        on_off_percent: 0,
        on_off_color: null,
        on_off_flag: '未开始',
        stop: false
      }
    },
    components: {
      Chart,
      Signal
    },
    created () {
      ipcRenderer.send('miniWindowMounted', {data: true}) // vue实例创建完成之后，发送消息给主进程，以获取当前设备信息
      ipcRenderer.on('theMachine', (e, data) => {
        this.machineData = data// 设备信息
        if (data.name === '电流表' || data.name === '电压表' || data.name === '万用表') {
          this.type = 'chart'
        } else if (data.name === '信号发生器') {
          this.type = 'signal'
        }
      })
      this.socket = io.connect('ws://127.0.0.1:8888')
      this.socket.on('connect', () => {
        console.log('is connected')
        this.socket.emit('postType', {type: this.machineData})
        if (this.machineData.name !== '信号发生器') {
          this.socket.emit('getOperation', this.machineData)
        }
      })
      this.socket.on('getOperation', (data) => {
        console.log(data)
        if (!data.code) { // 查询成功
          if (data.msg === 'success') { // 有配置
            this.operation.range = data.data.range[1]
            this.range = data.data.range[1]
          } else {
            this.operation.range = 0
            this.range = 0
          }
        }
      })
      this.socket.on('startDataPush', (res) => {
        if (!res.code && res.msg === 'success') {
          this.data = res.data
        }
      })
      this.socket.on('getOnOff', (data) => {
        console.log(data)
        if (!data.code && data.msg === 'success') {
          let timer = setInterval(() => {
            this.on_off_flag = '检测中...'
            this.on_off_percent += 10
            if (this.on_off_percent === 100) {
              clearInterval(timer)
              timer = null
              if (data.data) {
                this.on_off_flag = '已接通'
                this.on_off_color = 'rgb(19, 206, 102)'
              } else {
                this.on_off_flag = '未接通'
                this.on_off_color = 'rgb(255, 73, 73)'
              }
            }
          }, 10)
        }
      })
      this.socket.on('saveOperation', (res) => {
        console.log(res)
        if (res.code || res.msg !== 'success') {
          console.log('报错！') // 这里要处理一下报错
        }
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
        if (this.type === 'chart' && this.functions[0] !== '通断检测') {
          this.operation.range = this.range // 配置中修改了量程但是没有保存就点击了测量，应该把量程复位为原来的值
          if (this.state) {
            this.socket.emit('startDataPush', this.operation)
          }
        } else if (this.type === 'chart' && this.functions[0] === '通断检测') {
          if (this.state) {
            this.socket.emit('getOnOff')
          } else {
            this.on_off_color = null
            this.on_off_percent = 0
            this.on_off_flag = '未开始'
          }
        }
      },
      saveOperation () {
        this.range = this.operation.range
        let data = {data: {range: [0, this.operation.range]}, ...this.machineData}
        this.socket.emit('saveOperation', data)
      },
      computedOption () {
        return {
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
              min: 0,
              max: this.range,
              minorTickPosition: 'outside',
              tickPosition: 'outside',
              labels: {
                rotation: 'auto',
                distance: 20
              },
              plotBands: [{
                from: this.range - this.range / 6,
                to: this.range,
                color: '#C02316',
                innerRadius: '100%',
                outerRadius: '105%'
              }],
              pane: 0,
              title: {
                text: this.getChartTitle(),
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
          series: [{
            data: [0],
            yAxis: 0
          }]
        }
      },
      getChartTitle () {
        let name = this.machineData.name
        if (name === '电压表') {
          return 'V<br/><span style="font-size:8px">⎓</span>'
        } else if (name === '电流表') {
          return 'A<br/><span style="font-size:8px">⎓</span>'
        } else if (name === '万用表') {
          switch (this.functions[0]) {
            case '直流电流测量':
              return 'A<br/><span style="font-size:8px">⎓</span>'
            case '交流电流测量':
              return 'A<br/><span style="font-size:8px">~</span>'
            case '直流电压测量':
              return 'V<br/><span style="font-size:8px">⎓</span>'
            case '交流电压测量':
              return 'V<br/><span style="font-size:8px">~</span>'
            case '电阻测量':
              return 'Ω'
            case '电容测量':
              return 'F'
          }
        }
      },
      getRange () {
        let name = this.machineData.name
        if (name === '电压表') {
          return 15
        } else if (name === '电流表') {
          return 3
        } else if (name === '万用表') {
          switch (this.functions[0]) {
            case '直流电流测量':
              return 300
            case '交流电流测量':
              return 300
            case '直流电压测量':
              return 1500
            case '交流电压测量':
              return 1500
            case '电阻测量':
              return 2000
            case '电容测量':
              return 2
          }
        }
      },
      getStep () {
        let name = this.machineData.name
        if (name === '电压表') {
          return 5
        } else if (name === '电流表') {
          return 0.6
        } else if (name === '万用表') {
          switch (this.functions[0]) {
            case '直流电流测量':
              return 50
            case '交流电流测量':
              return 50
            case '直流电压测量':
              return 300
            case '交流电压测量':
              return 300
            case '电阻测量':
              return 400
            case '电容测量':
              return 0.5
          }
        }
      },
      handleStopButton (flag) { // 在指针未稳定时禁止点击停止按钮
        console.log(flag)
        this.stop = flag
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

    .on-off-box {
        width: 98%;
        /*height: 175px;*/
        /*border: 1px solid #b4b4b4;*/
        margin: 10px 1%;
    }
</style>
