<template>
    <div class="container">
        <div class=""></div>
        <div class="table-wrapper">
            <el-table
                    :loading="listLoading"
                    :data="list"
                    border>
                <el-table-column
                        width="180px"
                        prop="name"
                        label="设备类型">
                </el-table-column>
                <el-table-column
                        prop="ip"
                        label="设备ip">
                </el-table-column>
                <el-table-column
                        label="操作">
                    <template slot-scope="scope">
                        <el-button
                                size="mini"
                                type="success"
                                :disabled="installed.includes(scope.row.ip)"
                                @click="handleInstall(scope.$index, scope.row)">
                            {{installed.includes(scope.row.ip)?'已安装':' 安装'}}
                        </el-button>
                        <el-button
                                size="mini"
                                type="info"
                                :disabled="!installed.includes(scope.row.ip)"
                                @click="handleEdit(scope.$index, scope.row)">功能配置
                        </el-button>
                        <el-button
                                size="mini"
                                type="primary"
                                :disabled="!installed.includes(scope.row.ip)"
                                @click="handleUse(scope.$index, scope.row)">使用
                        </el-button>
                        <el-button
                                size="mini"
                                type="danger"
                                :disabled="!installed.includes(scope.row.ip)"
                                @click="handleDelete(scope.$index, scope.row)">
                            {{installed.includes(scope.row.ip)?'卸载':' 已卸载'}}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <EditDialog :row="row"
                    :editDialogVisible="editDialogVisible"
                    @hidden="handleHiddenDialog"
                    @saveEdit="handleEditSuccess"/>
    </div>
</template>

<script>
  import axios from 'axios'
  import {ipcRenderer} from 'electron'
  import EditDialog from '../EidtDialog/EditDialog'
  // import io from 'socket.io-client'

  export default {
    name: 'ListPage',
    data () {
      return {
        list: [], // 用于保存当前已添加的所有设备
        listLoading: true, // 列表Loading
        installed: [], // 已安装的设备
        editDialogVisible: false, // 是否显示编辑弹框
        row: {}
      }
    },
    components: {
      EditDialog
    },
    mounted () {
      this.getList()
      this.getInstalled()
      ipcRenderer.on('goList', (e, msg) => {
        if (msg) {
          this.getList()
          this.getInstalled()
        }
      })
    },
    methods: {
      getList () {
        axios.get('http://127.0.0.1:8888/list/getList')
          .then((res) => { // 此处无法使用package.json中的代理，所以写上完整的url
            if (res.status === 200) {
              if (!res.data.code && res.data.msg === 'success') {
                this.list = res.data.data
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
      getInstalled () {
        axios.get('http://127.0.0.1:8888/list/getInstalled')
          .then((res) => { // 此处无法使用package.json中的代理，所以写上完整的url
            if (res.status === 200) {
              if (!res.data.code && res.data.msg === 'success') {
                this.installed = res.data.data
              } else {
                this.openMessage('error', res.data.msg)
              }
            }
          })
          .catch(err => {
            console.log(err)
          })
      },
      handleInstall (index, row) {
        axios.post('http://127.0.0.1:8888/list/installed', {data: row})
          .then(res => {
            if (res.status === 200) {
              if (!res.data.code && res.data.msg === 'success') {
                this.installed.push(res.data.ip)
                this.openMessage('success', '安装成功！')
              } else {
                this.openMessage('error', res.data.msg)
              }
            }
          })
      },
      /* handleUse (index, row) {
        const socket = io.connect('ws://127.0.0.1:8888')
        socket.on('connect', () => {
          console.log('connected')
        })
        socket.emit('useMachine', {data: row})
        socket.on('findMachine', (data) => {
          if (!data.code && data.msg === 'success') {
            if (!data.data.function.length) {
              console.log('没有可用功能！')
              this.openMessage('error', '该设备无可用功能，请进行配置！')
            } else {
              ipcRenderer.send('openMiniWindow', {data: row})
            }
          }
        })
      }, */
      handleUse (index, row) {
        axios.post('http://127.0.0.1:8888/list/useMachine', {data: row})
          .then(res => {
            console.log(res)
            if (!res.data.code && res.data.msg === 'success') {
              if (!res.data.data.function.length) {
                this.openMessage('error', '该设备无可用功能，请进行配置！')
              } else {
                ipcRenderer.send('openMiniWindow', {data: row})
              }
            } else {
              this.openMessage('error', res.data.msg)
            }
          })
      },
      handleEdit (index, row) { // index为第几行 row为本行信息
        this.editDialogVisible = true
        this.row = row
      },
      handleDelete (index, row) {
        axios.post('http://127.0.0.1:8888/list/delete', {data: row})
          .then(res => {
            console.log(res)
            if (res.status === 200) {
              if (!res.data.code && res.data.msg === 'success') {
                let index = this.installed.indexOf(res.data.ip)
                console.log(index)
                if (index > -1) {
                  this.installed.splice(index, 1)
                }
                console.log(this.installed)
                this.openMessage('success', '卸载成功！')
              } else {
                this.openMessage('error', res.data.msg)
              }
            }
          })
      },
      handleHiddenDialog () {
        this.editDialogVisible = false
      },
      handleEditSuccess (type, msg) {
        this.openMessage(type, msg)
      },
      openMessage (type, message) {
        this.$message({
          showClose: true,
          duration: 2000,
          type,
          message
        })
      }
    }
  }
</script>

<style scoped>
    .container {
        width: 100%;
        display: flex;
        justify-content: center;
        font-weight: bold !important;
    }

    .table-wrapper {
        width: 85%;
    }
</style>
