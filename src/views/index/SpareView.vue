<template>
    <div class="customer-service-container">
        <!-- 操作按钮和搜索框 -->
        <div class="header">
            <div class="search-box">
                <el-select v-model="searchForm.engineerId" placeholder="请选择工程师" style="width: 200px; margin-left: 10px;"
                    @change="handleSearch">
                    <el-option label="全部" :value="null"></el-option>
                    <el-option v-for="engineer in engineerOptions" :key="engineer.id" :label="engineer.name"
                        :value="engineer.id"></el-option>
                </el-select>
            </div>
        </div>

        <!-- 设备列表 -->
        <div class="table-container">
            <el-table :data="tableData" border v-loading="loading" style="width: 100%">
                <el-table-column prop="id" label="ID" width="60"></el-table-column>
                <el-table-column prop="detail" label="申请细节" width="110"></el-table-column>
                <el-table-column prop="engineerName" label="工程师" width="110"></el-table-column>
                <el-table-column prop="createTime" label="申请时间" width="170">
                    <template #default="{ row }">
                        {{ formatDate(row.createTime) }}
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
import moment from 'moment';

export default {
    data() {
        return {
            token: "",
            // 搜索结果表单
            searchForm: {
                status: "",
                engineerId: "",
                deviceId: ""
            },
            engineerOptions: [],
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
            this.getEngineerOptions();
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
        getEngineerOptions() {
            request.get('/admin/engineer/get', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            }).then(res => {
                if (res.code === 200) {
                    this.engineerOptions = res.data.map(engineer => ({
                        id: engineer.id,
                        name: engineer.name
                    }));
                }
            });
        },
        // 获取设备列表
        fetchData() {
            console.log(this.token);
            this.loading = true;
            const sparePageDTO = {
                page: this.pagination.currentPage,
                pageSize: this.pagination.pageSize,
                engineerId: this.searchForm.engineerId
            };
            request.post('/admin/spare/list', sparePageDTO, {
                headers: {  // 显式添加headers
                    'Authorization': `Bearer ${this.token}`
                }
            }).then(response => {
                if (response.code === 200) {
                    this.tableData = response.data.records.map(item => ({
                        ...item,
                        engineerName: this.engineerOptions.find(engineer => engineer.id === item.engineerId)?.name || '未知工程师'
                    }));
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
        },
        //格式化日期
        formatDate(date){
            return moment(date).format('YYYY-MM-DD HH:mm:ss');
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