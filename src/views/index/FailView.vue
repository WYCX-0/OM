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
                <el-select v-model="searchForm.deviceId" placeholder="请选择设备" style="width: 200px; margin-left: 10px;"
                    @change="handleSearch">
                    <el-option label="全部" :value="null"></el-option>
                    <el-option v-for="device in deviceOptions" :key="device.id" :label="device.name"
                        :value="device.id"></el-option>
                </el-select>
                <el-select v-model="searchForm.status" placeholder="全部" style="width: 200px; margin-left: 10px;"
                    @change="handleSearch">
                    <el-option label="全部" :value="null"></el-option>
                    <el-option label="只显示已取消的工单" :value="0"></el-option>
                    <el-option label="只显示待处理工单" :value="1"></el-option>
                    <el-option label="只显示处理中工单" :value="2"></el-option>
                    <el-option label="只显示已完成工单" :value="3"></el-option>
                </el-select>
            </div>
            <!-- <div class="operation">
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
                    添加工单
                </el-button>
            </div> -->
        </div>

        <!-- 工单列表 -->
        <div class="table-container">
            <el-table :data="tableData" border v-loading="loading" style="width: 100%">
                <el-table-column prop="id" label="ID" width="60"></el-table-column>
                <el-table-column prop="detail" label="报修细节" width="110"></el-table-column>
                <el-table-column prop="deviceName" label="报修设备" width="110"></el-table-column>
                <el-table-column prop="engineerName" label="工程师" width="110"></el-table-column>
                <el-table-column prop="status" label="状态" width="110">
                    <template slot-scope="scope">
                        <span v-if="scope.row.status === 1" style="color: #f56c6c;">待处理</span>
                        <span v-if="scope.row.status === 0" style="color: #c0c4cc;">已取消</span>
                        <span v-if="scope.row.status === 2" style="color: #409eff;">处理中</span>
                        <span v-if="scope.row.status === 3" style="color: #67c23a;">已完成</span>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" width="170">
                    <template #default="{ row }">
                        {{ formatDate(row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" @click="handleView(scope.row.id)">
                            查看
                        </el-button>
                        <el-button size="mini" type="danger" @click="handleResign(scope.row.id)"
                            :disabled="scope.row.status === 0 || scope.row.status === 2 || scope.row.status === 3">
                            取消
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

        <!-- 添加工单的对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" :close-on-click-modal="false">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <!-- 报修细节设置为只读 -->
                <el-form-item label="报修细节" prop="detail">
                    <el-input v-model="form.detail" placeholder="请输入报修细节"></el-input>
                </el-form-item>
                <!-- 报修设备设置为只读 -->
                <el-form-item label="报修设备" prop="deviceId">
                    <el-select v-model="form.deviceId" placeholder="请选择报修设备">
                        <el-option v-for="device in deviceOptions" :key="device.id" :label="device.name"
                            :value="device.id"></el-option>
                    </el-select>
                </el-form-item>
                <!-- 上传图片 -->
                <el-form-item label="请上传故障图片">
                    <div>
                        <el-upload class="avatar-uploader" action="`${config.baseUrl}`/upload" :show-file-list="false"
                            :on-success="handleAvatarSuccess" :on-error="handleUploadError">
                            <img v-if="form.beforeUrl" :src="getImageUrl(form.beforeUrl)" class="avatar">
                            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>
                    </div>
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
import moment from 'moment';
import config from "@/utils/config";

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
            deviceOptions: [],
            tableData: [],
            loading: false,
            pagination: {
                currentPage: 1,
                pageSize: 10,
                total: 0
            },
            // 对话框标题
            dialogTitle: "故障报修",
            dialogVisible: false,
            form: {
                id: null,
                detail: "",
                deviceId: "",
                beforeUrl: ""
            },
            rules: {
                detail: [
                    { required: true, message: "报修细节不能为空", trigger: "blur" }
                ],
                deviceId: [
                    { required: true, message: "请选择报修设备", trigger: "change" }
                ]
            }
        };
    },
    computed: {
        // 计算属性：获取图片URL
        getImageUrl() {
            return (path) => {
                if (!path) return '';
                // 确保路径以斜杠开头，避免拼接错误
                const normalizedPath = path.startsWith('/') ? path : `/${path}`;
                return `${config.baseUrl}${normalizedPath}`;
            }
        }
    },
    created() {
        this.getToken();
        if (this.token) {
            this.fetchData();
            this.getEngineerOptions();
            this.getDeviceOptions();
        }
    },
    methods: {
        handleView(id) {
            this.$router.push(`/index/failDetail/${id}`); // 跳转详情页
        },
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
        getDeviceOptions() {
            request.get('/admin/device/get', {
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
        // 获取工单列表
        fetchData() {
            this.loading = true;
            const failPageDTO = {
                page: this.pagination.currentPage,
                pageSize: this.pagination.pageSize,
                status: this.searchForm.status,
                engineerId: this.searchForm.engineerId,
                deviceId: this.searchForm.deviceId
            };
            request.post('/admin/fail/list', failPageDTO, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            }).then(response => {
                if (response.code === 200) {
                    this.tableData = response.data.records.map(item => ({
                        ...item,
                        deviceName: this.deviceOptions.find(device => device.id === item.deviceId)?.name || '未知设备',
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
        // 搜索栏结果
        handleSearch() {
            this.pagination.currentPage = 1;
            this.fetchData();
        },
        // 添加工单
        handleAdd() {
            this.dialogTitle = "添加工单";
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
            });
        },

        handleAvatarSuccess(response) {
            if (response.code === 200) {
                this.form.beforeUrl = response.data;
                this.$message.success("上传成功");
            } else {
                this.$message.error(response.msg || "上传失败");
            }
        },
        handleUploadError() {
            this.$message.error("上传失败");
        },

        handleSubmit() {
            this.$refs.form.validate(valid => {
                if (!valid) {
                    this.$message.warning("请完善表单信息");
                    return;
                }
                if (!this.form.beforeUrl) {
                    this.$message.error("请上传图片");
                    return;
                }

                request.post('/admin/fail/add', this.form, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                }).then(addRes => {
                    if (addRes.code === 200) {
                        this.$message.success("添加成功");
                        this.resetForm();
                        this.dialogVisible = false;
                        this.fetchData();
                    }
                });
            });
        },

        // 修改后的重置方法
        resetForm() {
            this.form = {
                id: null,
                detail: "",
                deviceId: "",
                beforeUrl: ""
            };
            this.currentFile = null;
            this.fileList = [];
            this.$refs.upload && this.$refs.upload.clearFiles();
        },
        // 工单取消
        handleResign(id) {
            this.$confirm("确定要取消该报修吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            })
                .then(() => {
                    request.post(`/admin/fail/delete/${id}`, {}, {
                        headers: {
                            'Authorization': `Bearer ${this.token}`
                        }
                    }).then(res => {
                        if (res.code === 200) {
                            this.$message.success("取消成功");
                            this.fetchData();
                        } else {
                            this.$message.error(res.msg);
                        }
                    });
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
        //格式化日期
        formatDate(date) {
            return moment(date).format('YYYY-MM-DD HH:mm:ss');
        }
    }
};
</script>

<style scoped>
.pagination {
    text-align: right;
    margin-top: 20px;
}

.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #409EFF;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
    background-color: rgb(231, 237, 237);
}

.avatar {
    width: 178px;
    height: 178px;
    display: block;
}

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
</style>