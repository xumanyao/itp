<template>
    <div class="container">
        <div class="table-wrapper">
            <el-table
                    :loading="listLoading"
                    :data="typeList"
                    border>
                <el-table-column
                        prop="name"
                        width="180px"
                        label="设备类型">
                </el-table-column>
                <el-table-column
                        prop="function"
                        label="支持功能">
                    <template slot-scope="scope">
                        <el-tag
                                v-for="(item, index) in scope.row.function"
                                color="white"
                                type="success"
                                :key="index"
                                disable-transitions>{{item}}
                        </el-tag>

                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
  import axios from 'axios'
  import {ipcRenderer} from 'electron'
  // ipcRenderer.on('goType', (e, msg) => {
  //   if (msg) {
  //     vueObj.methods.getType();
  //   }
  // });
  let vueObj = {
    name: 'TypePage',
    data () {
      return {
        typeList: [],
        listLoading: true
      }
    },
    mounted () {
      this.getType()
      ipcRenderer.on('goType', (e, msg) => {
        if (msg) {
          vueObj.methods.getType()
        }
      })
    },
    methods: {
      getType () {
        axios.get('http://127.0.0.1:8888/list/getType').then((res) => { // 此处无法使用package.json中的代理，所以写上完整的url
          if (res.status === 200) {
            if (!res.data.code && res.data.msg === 'success') {
              this.typeList = res.data.data
            } else {
              this.openMessage('error', res.data.msg)
            }
            this.listLoading = false
          }
        })
          .catch(err => {
            console.log(err)
          })
      },
      openMessage (type, message) {
        this.$message({
          showClose: true,
          duration: 1000,
          type,
          message
        })
      }
    }
  }
  export default vueObj
</script>

<style scoped>
    .el-tag {
        margin: 0 4px 2px 0;
    }

    .container {
        width: 100%;
        margin-top: 20px;
        display: flex;
        justify-content: center;
    }

    .table-wrapper {
        width: 80%;
    }

    .el-tag--success {
        color: rgb(140, 140, 140);
        /*border-color: rgba(178, 178, 178, 0.28);*/
    }
</style>
