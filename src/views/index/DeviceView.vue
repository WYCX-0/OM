<template>
    <div class="customer-service-container">
      <!-- 操作按钮和搜索框 -->
      <div class="header">
        <div class="search-box">
          <el-input v-model="searchForm.name" placeholder="请输入设备名称搜索" clearable @keyup.enter.native="handleSearch">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
          <el-select v-model="searchForm.type" placeholder="全部" style="width: 200px; margin-left: 10px;"
            @change="handleSearch">
            <el-option label="全部" :value="null"></el-option>
            <el-option label="只显示客服设备" :value="1"></el-option>
            <el-option label="只显示机电设备" :value="2"></el-option>
            <el-option label="只显示电梯设备" :value="3"></el-option>
            <el-option label="只显示消防设备" :value="4"></el-option>
          </el-select>
          <el-input v-model="searchForm.address" placeholder="请输入设备地址搜索" clearable @keyup.enter.native="handleSearch">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </div>
        <div class="operation">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
            添加设备
          </el-button>
        </div>
      </div>
  
      <!-- 设备列表 -->
      <div class="table-container">
        <el-table :data="tableData" border v-loading="loading" style="width: 100%">
          <el-table-column prop="id" label="ID" width="60"></el-table-column>
          <el-table-column prop="name" label="设备名称" width="110"></el-table-column>
          <el-table-column prop="type" label="设备类型" width="90">
            <template #default="{ row }">
              {{
                { 1: '客服', 2: '机电', 3: '电梯', 4: '消防' }[row.type]
              }}
            </template>
          </el-table-column>
          <el-table-column prop="address" label="设备地址" width="130"></el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleEdit(scope.row)"
              :disabled="scope.row.status === 0">
                修改
              </el-button>
              <el-button size="mini" type="danger" @click="handleResign(scope.row.id)"
              :disabled="scope.row.status === 0">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
  
      <!-- 分页控件 -->
      <div class="pagination">
        <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="pagination.currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="pagination.total"></el-pagination>
      </div>
    </div>
  </template>
  
  <script>
  import request from "@/utils/request.js";
  import cloneDeep from 'lodash/cloneDeep';
  
  export default {
    data() {
      return {
        token: "",
        // 搜索结果表单
        searchForm: {
          name: "",
          type: "",
          address: ""
        },
        // 表格数据
        tableData: [],
        // 加载状态
        loading: false,
        // 分页参数
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        }
      };
    },
    created() {
      this.getToken();
      if (this.token) {
        this.fetchData();
      }
    },
    methods: {
      getToken() {
        const user = JSON.parse(localStorage.getItem('user0'));
        if (user && user.token) {
          this.token = user.token;
        } else {
          this.$message.error('未获取到用户信息，请重新登录');
          this.$router.push('/login');
        }
      },
      // 获取设备列表
      fetchData() {
        console.log(this.token);
        this.loading = true;
        const devicePageDTO = {
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          name: this.searchForm.name,
          type: this.searchForm.type,
          address: this.searchForm.address
        };
        request.post('/admin/device/list', devicePageDTO, {
          headers: {  // 显式添加headers
            'Authorization': `Bearer ${this.token}`
          }
        }).then(response => {
          if (response.code === 200) {
            this.tableData = response.data.records;
            this.pagination.total = response.data.total;
          } else {
            this.$message.error(response.msg);
          }
          this.loading = false;
        }).catch(error => {
          console.error(error);
          this.loading = false;
        });
      },
      // 搜索框功能
      handleSearch() {
        this.pagination.currentPage = 1;
        this.fetchData();
      },
      // 添加设备
      handleAdd() {
        this.$router.push({
          name: 'DeviceForm',
          params: { dialogType: 'add' }
        });
      },
      // 修改设备
      handleEdit(row) {
        const formData=cloneDeep(row);
        this.$router.push({
          name: 'DeviceForm',
          params: { dialogType: 'edit', formData }
        });
      },
      // 设备删除
      handleResign(id) {
        this.$confirm("确定要将该设备删除吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          request.delete(`/admin/device/delete/${id}`,
            {
              headers: {
                'Authorization': `Bearer ${this.token}`
              }
            })
          .then(res => {
            if (res.code === 200) {
              this.$message.success("删除操作成功");
              this.fetchData();
            } else {
              this.$message.error(res.msg);
            }
          })
        })
        .catch(() => { });
      },
      // 分页大小改变
      handleSizeChange(size) {
        this.pagination.pageSize = size;
        this.pagination.currentPage = 1;
        this.fetchData();
      },
      // 分页页码改变
      handleCurrentChange(page) {
        this.pagination.currentPage = page;
        this.fetchData();
      },
      // 获取状态对应的标签类型
      getStatusType(status) {
        return status === 1 ? "success" : "danger";
      }
    }
  };
  </script>
  
  <style scoped>
  .customer-service-container {
    padding: 20px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .search-box {
    flex: 1;
    margin-right: 20px;
    display: flex;
    align-items: center;
  }
  
  .operation {
    text-align: right;
  }
  
  .table-container {
    margin-bottom: 20px;
  }
  
  .pagination {
    text-align: right;
  }
  </style>