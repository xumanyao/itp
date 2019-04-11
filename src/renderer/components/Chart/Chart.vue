<template>
    <div class="chart-box">
        <div ref="chart"></div>
    </div>
</template>

<script>
  import highchart from 'highcharts'
  import highchartsMore from 'highcharts/highcharts-more'

  highchartsMore(highchart)
  export default {
    name: 'Chart',
    data () {
      return {
        chart: null
      }
    },
    props: {
      id: {
        type: String
      },
      option: {
        type: Object
      },
      data: {
        type: Number
      },
      range: {
        type: Number
      }
    },
    watch: {
      /* option (newValue, oldValue) {
        console.log('son option changed')
        this.option = newValue
        this.initChart()
      }, */
      option: {
        handler: function (newV, oldV) {
          this.option = newV
          this.initChart()
        },
        deep: true
      },
      data: function (newVal, oldVal) {
        // this.$emit('disableButton', true)
        if (this.chart.series) { // the chart may be destroyed
          let data = this.chart.series[0].points[0]
          console.log(data)
          console.log(newVal)
          let part = true
          let num = 40
          let timer = setInterval(() => {
            let err = this.range / num
            if (part) {
              data.update(newVal + err, false)
            } else {
              data.update(newVal - err, false)
            }
            this.chart.redraw()
            num = num + 15
            if (num > 250) {
              clearInterval(timer)
              timer = null
              // this.$emit('disableButton', false)
            }
            part = !part
          }, 500)
        }
      }
    },
    mounted () {
      this.initChart()
    },
    methods: {
      initChart () {
        /* his.$nextTick(
          () => (this.chart = new highchart.Chart(this.$el, this.option))) */
        this.chart = new highchart.Chart(this.$el, this.option)
      }
    }
  }
</script>

<style scoped>

</style>
