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
                <div class="checkbox-wrapper">
                    <span class="title">设备功能配置：</span>
                    <div class="checkbox">
                        <el-checkbox-group v-model="usable">
                            <el-checkbox v-for="(item, index) in all" :label="item" :key="index"/>
                        </el-checkbox-group>
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
        all: [],
        usable: [],
        buttonLoading: false
      }
    },
    props: {
      row: Object,
      editDialogVisible: Boolean
    },
    methods: {
      open () {
        console.log(this.row)
        axios.post('http://127.0.0.1:8888/list/operating', {data: this.row})
          .then(res => {
            if (res.status === 200) {
              if (!res.data.code && res.data.msg === 'success') {
                this.all = res.data.data.allFunctions
                this.usable = res.data.data.usableFunctions
              }
            }
          })
      },
      close () {
        this.all = []
        this.usable = []
      },
      saveEdit () {
        this.buttonLoading = true
        let data = {name: this.row.name, ip: this.row.ip, function: this.usable}
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
        width: 98px;
        text-align: right;
    }

    .checkbox-wrapper {
        margin-top: 10px;
        /*min-height: 100px;*/
    }

    .checkbox {
        display: inline-block;
        width: 406px;
        padding: 10px;
        min-height: 100px;
        border: 1px solid #eee;
    }

    .el-checkbox {
        width: 100px;
    }
</style>
