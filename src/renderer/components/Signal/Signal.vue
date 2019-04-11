<template>
    <div class="container">
        <div ref="graph" style="height: 200px;"></div>
        <div class="control-btn">
            <el-button type="primary" size="small" @click="toggleState" :disabled="!useBtn">{{state?'停止':'开始'}}</el-button>
        </div>
        <div class="set">
            <el-form :model="set" :rules="rules" ref="ruleForm" label-width="100px" class="ruleForm">
                <el-form-item label="输出通道：" prop="channel" style="width: 300px">
                    <el-radio-group v-model="set.channel">
                        <el-radio v-model="set.channel" label="1">通道1</el-radio>
                        <el-radio v-model="set.channel" label="2">通道2</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="输出波形：" prop="signal" style="width: 300px">
                    <el-select v-model="set.signal" placeholder="请选择输出波形">
                        <el-option label="正弦波" value="正弦波"></el-option>
                        <el-option label="方波" value="方波"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="频率：" prop="frequency" style="width: 300px">
                    <el-input v-model.number="set.frequency"
                              placeholder="请输入频率值"
                              clearable
                    >
                        <template slot="append">Hz</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="峰峰值：" prop="max" style="width: 300px">
                    <el-input v-model.number="set.max"
                              placeholder="请输入峰峰值"
                              clearable>
                    </el-input>
                </el-form-item>
                <el-form-item style="width: 300px">
                    <el-button type="primary" @click="save('ruleForm')" size="small">保存</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
  import highchart from 'highcharts'

  export default {
    name: 'Signal',
    data () {
      return {
        state: false,
        useBtn: false,
        set: {
          channel: '1',
          signal: '',
          frequency: null,
          max: null
        },
        rules: {
          signal: [
            {required: true, message: '请选择输出波形', trigger: 'change'}
          ],
          frequency: [
            {type: 'number', required: true, message: '请输入频率值', trigger: 'blur'}
          ],
          max: [
            {type: 'number', required: true, message: '请输入峰峰值', trigger: 'blur'}
          ]
        },
        chart: null,
        option: {
          chart: {
            type: 'spline',
            marginRight: 10
          },
          credits: {
            enabled: false // 禁用版权信息
          },
          plotOptions: {
            series: {
              marker: {
                enabled: false
              }
            }
          },
          title: {
            text: null
          },
          xAxis: {
            type: 'linear'
          },
          yAxis: {
            title: {
              text: null
            }
          },
          legend: {
            enabled: false
          },
          series: [{
            data: []
          }]
        }
      }
    },
    mounted () {
      this.socket.on('signalData', (data) => {
        console.log(data)
        this.draw(data)
      })
      this.socket.on('startSignal', (data) => {
        this.chart.update({
          series: [{
            data: data.data
          }]
        }, true)
      })
      this.chart = new highchart.Chart(this.$refs['graph'], this.option)
    },
    props: {
      functions: { // 设别所配置的功能
        type: Array
      },
      socket: {
        type: Object
      }
    },
    methods: {
      save (formName) { // 保存配置
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // this.$emit('save', this.set)
            this.useBtn = true
            return true
          } else {
            return false
          }
        })
      },
      toggleState () {
        this.state = !this.state
        console.log(this.state)
        if (this.state) {
          this.socket.emit('startPushSignalData', this.set)
        } else {
          this.socket.emit('stopPushSignalData')
        }
      },
      draw (point) {
        let frequency = this.set.frequency
        let l = frequency.toString().length
        let num = l * 100
        let series = this.chart.series[0]
        let shift = series.data.length > num
        this.chart.series[0].addPoint(point, true, shift)
      }
    }
  }
</script>

<style scoped>
    .set {
        margin: 12px 2%;
        min-height: 200px;
        padding: 10px;
        border: 1px solid #b4b4b4;
        display: flex;
        justify-content: center;
    }

    .ruleForm {
        padding-right: 10px
    }
</style>
