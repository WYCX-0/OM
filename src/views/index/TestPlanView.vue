<template>
    <div class="customer-service-container">
        <div class="header">
            <div class="search-box">
                <el-select v-model="searchForm.deviceId" placeholder="请选择设备" style="width: 200px; margin-left: 10px;"
                    @change="handleSearch">
                    <el-option label="全部" :value="null"></el-option>
                    <el-option v-for="device in deviceOptions" :key="device.id" :label="device.name"
                        :value="device.id"></el-option>
                </el-select>
                <el-select v-model="searchForm.status" placeholder="全部" style="width: 200px; margin-left: 10px;"
                    @change="handleSearch">
                    <el-option label="全部" :value="null"></el-option>
                    <el-option label="只显示停用的工单" :value="0"></el-option>
                    <el-option label="只显示启用的工单" :value="1"></el-option>
                </el-select>
            </div>
            <div class="operation">
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
                    添加检测计划
                </el-button>
            </div>
        </div>

        <!-- 设备列表 -->
        <div class="table-container">
            <el-table :data="tableData" border v-loading="loading" style="width: 100%">
                <el-table-column prop="id" label="ID" width="90"></el-table-column>
                <el-table-column prop="deviceName" label="检测设备" width="150"></el-table-column>
                <el-table-column prop="frequency" label="检测频次" width="150">
                    <template #default="{ row }">
                        {{
                            { 1: '日', 2: '月', 3: '季度', 4: '半年',5: '年' }[row.frequency]
                        }}
                    </template>
                </el-table-column>
                <el-table-column prop="time" label="停留时间" width="150"></el-table-column>
                <el-table-column label="操作" width="240">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" @click="handleEdit(scope.row)">
                            修改
                        </el-button>
                        <el-button 
                            size="mini" 
                            :type="scope.row.status === 1 ? 'danger' : 'success'"
                            @click="handleStatusChange(scope.row)"
                        >
                            {{ scope.row.status === 1 ? '停用' : '启用' }}
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

        <!-- 添加或修改设备的对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" :close-on-click-modal="false">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <!-- 只读 -->
                <el-form-item label="设备" prop="deviceId">
                    <el-select v-model="form.deviceId" placeholder="请选择设备" :disabled="dialogType === 'edit'">
                        <el-option v-for="device in deviceOptions" :key="device.id" :label="device.name" :value="device.id"></el-option>
                    </el-select>
                </el-form-item>

                <!-- 可编辑 -->
                <el-form-item label="检测频次" prop="frequency">
                    <el-select v-model="form.frequency" placeholder="请选择检测频次">
                        <el-option label="日" value="1"></el-option>
                        <el-option label="月" value="2"></el-option>
                        <el-option label="季度" value="3"></el-option>
                        <el-option label="半年" value="4"></el-option>
                        <el-option label="年" value="5"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="停留时间" prop="time">
                    <el-input v-model="form.time" placeholder="请输入停留时间"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleSubmit">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import request from "@/utils/request.js";

export default {
    data() {
        return {
            token: "",
            // 搜索结果表单
            searchForm: {
                status: "",
                deviceId: ""
            },
            deviceOptions: [],
            // 表格数据
            tableData: [],
            // 加载状态
            loading: false,
            // 分页参数
            pagination: {
                currentPage: 1,
                pageSize: 10,
                total: 0
            },
            // 对话框标题
            dialogTitle: "",
            // 对话框是否可见
            dialogVisible: false,
            // 对话框类型（add 或 edit）
            dialogType: "",
            // 表单数据
            form: {
                deviceId: "",
                frequency: "",
                time: ""
            },
            // 表单验证规则
            rules: {
                deviceId: [
                    { required: true, message: "请选择报修设备", trigger: "change" }
                ],
                frequency: [
                    { required: true, message: "检测频次不能为空", trigger: "blur" }
                ],
                time: [
                    { required: true, message: "停留时间不能为空", trigger: "blur" }
                ]
            }
        };
    },
    created() {
        this.getToken();
        if (this.token) {
            this.fetchData();
            this.getDeviceOptions();
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
        getDeviceOptions() {
            request.get('/admin/device/get4', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            }).then(res => {
                if (res.code === 200) {
                    this.deviceOptions = res.data.map(device => ({
                        id: device.id,
                        name: device.name
                    }));
                }
            });
        },
        fetchData() {
            this.loading = true;
            const testPlanPageDTO = {
                page: this.pagination.currentPage,
                pageSize: this.pagination.pageSize,
                status: this.searchForm.status,
                deviceId: this.searchForm.deviceId
            };
            request.post('/admin/testPlan/list', testPlanPageDTO, {
                headers: {  
                    'Authorization': `Bearer ${this.token}`
                }
            }).then(response => {
                if (response.code === 200) {
                    this.tableData = response.data.records.map(item => ({
                        ...item,
                        deviceName: this.deviceOptions.find(device => device.id === item.deviceId)?.name || '未知设备',
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
        // 处理状态切换
        handleStatusChange(row) {
            const newStatus = row.status === 1 ? 0 : 1;
            this.loading = true;
            request.post(`/admin/testPlan/${newStatus}?id=${row.id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            }).then(res => {
                if (res.code === 200) {
                    this.$message.success('状态更新成功');
                    this.fetchData(); // 刷新数据
                } else {
                    this.$message.error(res.msg);
                }
                this.loading = false;
            }).catch(error => {
                console.error(error);
                this.$message.error('状态更新失败');
                this.loading = false;
            });
        },
        handleSearch() {
            this.pagination.currentPage = 1;
            this.fetchData();
        },
        handleAdd() {
            this.dialogTitle = "添加检测计划";
            this.dialogType = "add";
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
            });
        },
        handleEdit(row) {
            this.dialogTitle = "修改检测计划";
            this.dialogType = "edit";
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
                this.form = { 
                    ...row,
                    frequency: String(row.frequency)
                };
            });
        },
        handleSubmit() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    const url = this.dialogType === "add" 
                        ? '/admin/testPlan/add' 
                        : '/admin/testPlan/update';
                        
                    request.post(url, this.form, {
                        headers: {
                            'Authorization': `Bearer ${this.token}`
                        }
                    }).then(res => {
                        if (res.code === 200) {
                            this.$message.success(this.dialogType === "add" ? "添加成功" : "修改成功");
                            this.dialogVisible = false;
                            this.fetchData();
                        } else {
                            this.$message.error(res.msg);
                        }
                    });
                }
            });
        },
        handleSizeChange(size) {
            this.pagination.pageSize = size;
            this.pagination.currentPage = 1;
            this.fetchData();
        },
        handleCurrentChange(page) {
            this.pagination.currentPage = page;
            this.fetchData();
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