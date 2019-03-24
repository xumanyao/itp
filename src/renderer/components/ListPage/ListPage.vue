<template>
    <div class="container">
        <el-table
                :loading="listLoading"
                :data="list"
                border
                style="width: 800px">
            <el-table-column
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
                            @click="handleEdit(scope.$index, scope.row)">连接
                    </el-button>
                    <el-button
                            size="mini"
                            type="danger"
                            @click="handleDelete(scope.$index, scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'ListPage',
    data () {
      return {
        list: [],
        listLoading: true
      };
    },
    mounted () {
      this.getList();
    },
    methods: {
      getList () {
        axios.get('http://127.0.0.1:8888/list/getList').then((res) => { // 此处无法使用package.json中的代理，所以写上完整的url
          if (res.status === 200) {
            console.log(res.data);
            this.list = res.data;
            this.listLoading = false;
          }
        })
          .catch(err => {
            console.log(err);
          });
      },
      handleEdit (index, row) { // index为第几行 row为本行信息
        console.log(index);
      },
      handleDelete (index, row) {
        console.log(row);
      }
    }
  };
</script>

<style scoped>

</style>
