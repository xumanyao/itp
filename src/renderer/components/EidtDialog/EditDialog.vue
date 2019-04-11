<template>
    <div>
        <el-dialog
                title="设备功能配置"
                width="600px"
                @open="open"
                @close="close"
                :close-on-click-modal="false"
                :show-close="false"
                :visible.sync="editDialogVisible">
            <div class="container">
                <div class="input-wrapper">
                    <div class="type-box">
                        <span class="title">设备类型：</span>
                        <el-input
                                :placeholder="row.name"
                                :disabled="true">
                        </el-input>
                    </div>
                    <div class="ip-box">
                        <span class="title">设备ip：</span>
                        <el-input
                                :placeholder="row.ip"
                                :disabled="true">
                        </el-input>
                    </div>
                </div>
                <div class="setbox-wrapper">
                    <span class="title">设备功能配置：</span>
                    <div class="setbox">
                        <el-checkbox-group v-model="simple_usable" v-if="type === 1">
                            <el-checkbox v-for="(item, index) in simple_all" :label="item" :key="index"/>
                        </el-checkbox-group>
                        <div class="multimeter" v-else="type === 2">
                            <el-select v-model="multimeter_usable" placeholder="请选择">
                                <el-option
                                        v-for="(item, index) in multimeter_all"
                                        :key="index"
                                        :label="item"
                                        :value="item">
                                </el-option>
                            </el-select>
                            <el-checkbox v-model="multimeter_range"
                                         :disabled="multimeter_usable === '通断检测'"
                                         class="multimeter_checkbox">
                                量程设置
                            </el-checkbox>
                        </div>
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
    <el-button @click="hidden">取 消</el-button>
    <el-button type="primary" @click="saveEdit" :loading="buttonLoading">保 存</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'EditDialog',
    data () {
      return {
        buttonLoading: false,
        /* simple: { // 电流压表时使用的配置
          all: [],
          usable: []
        }, */
        simple_all: [],
        simple_usable: [],
        /* multimeter: { // 万用表使用的配置
          all: [],
          usable: ''
        }, */
        multimeter_all: [],
        multimeter_usable: '',
        multimeter_range: false,
        type: 0 // 用于标识设备类型，电压流表 1
      }
    },
    props: {
      row: Object,
      editDialogVisible: Boolean
    },
    methods: {
      open () {
        console.log(this.row)
        if (this.row.name === '电流表' || this.row.name === '电压表' || this.row.name === '信号发生器') {
          this.type = 1
        } else if (this.row.name === '万用表') {
          this.type = 2
        }
        axios.post('http://127.0.0.1:8888/list/operating', {data: this.row})
          .then(res => {
            console.log(res)
            if (res.status === 200) {
              if (!res.data.code && res.data.msg === 'success') {
                if (this.type === 1) {
                  this.simple_all = res.data.data.allFunctions
                  this.simple_usable = res.data.data.usableFunctions
                } else if (this.type === 2) {
                  this.multimeter_all = res.data.data.allFunctions
                  this.multimeter_all.splice(this.multimeter_all.length - 1, 1)
                  this.multimeter_usable = res.data.data.usableFunctions[0]
                  this.multimeter_range = !!res.data.data.usableFunctions[1]
                }
              }
            }
          })
      },
      close () {
        this.simple = {}
      },
      saveEdit () {
        this.buttonLoading = true
        let data = {}
        if (this.type === 1) {
          data = {name: this.row.name, ip: this.row.ip, function: this.simple_usable}
        } else if (this.type === 2) {
          let fun = [this.multimeter_usable]
          if (this.multimeter_range) {
            fun.push('量程设置')
          }
          if (this.multimeter_usable === '通断检测') {
            fun = ['通断检测']
          }
          data = {name: this.row.name, ip: this.row.ip, function: fun}
        }
        axios.post('http://127.0.0.1:8888/list/saveOperating', {data})
          .then(res => {
            console.log(res)
            if (res.status === 200) {
              if (!res.data.code && res.data.msg === 'success') {
                this.buttonLoading = false
                this.hidden()
                this.$emit('saveEdit', 'success', '配置已生效！')
              } else {
                this.$emit('saveEdit', 'error', '配置保存失败，请重试！')
                this.hidden()
              }
            }
          })
      },
      hidden () {
        this.$emit('hidden')
      }
    }
  }
</script>

<style scoped>
    /*.input-wrapper {*/
    /*display: flex;*/
    /*}*/

    .el-input {
        display: inline-block;
        width: 200px;
    }

    .ip-box {
        margin-top: 10px;
    }

    .title {
        display: inline-block;
        width: 100px;
        text-align: right;
    }

    .setbox-wrapper {
        margin-top: 10px;
        /*min-height: 100px;*/
    }

    .setbox {
        display: inline-block;
        width: 406px;
        padding: 10px;
        min-height: 100px;
        border: 1px solid #eee;
    }
    .multimeter_checkbox{
        /*display: block;*/
        margin-left: 8px;
    }
    .el-checkbox {
        width: 100px;
    }
</style>
