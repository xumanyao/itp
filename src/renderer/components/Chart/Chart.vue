<template>
    <div class="chart-box">
        <div ref="chart" :option="option"></div>
    </div>
</template>

<script>
  import highchart from 'highcharts'
  import highchartsMore from 'highcharts/highcharts-more'

  highchartsMore(highchart)
  export default {
    name: 'Chart',
    props: {
      id: {
        type: String
      },
      option: {
        type: Object
      }
    },
    watch: {
      option () {
        highchart.chart(this.$refs.chart, this.option)
      }
    },
    mounted () {
      highchart.chart(this.$refs.chart, this.option)
    }
  }
</script>

<style scoped>

</style>
