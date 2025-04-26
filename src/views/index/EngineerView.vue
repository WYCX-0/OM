<template>
    <div class="customer-service-container">
        <!-- 操作按钮和搜索框 -->
        <div class="header">
            <div class="search-box">
                <el-input v-model="searchForm.name" placeholder="请输入姓名搜索" clearable @keyup.enter.native="handleSearch">
                    <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
                </el-input>
                <el-input v-model="searchForm.engineerNo" placeholder="请输入工号搜索" clearable
                    @keyup.enter.native="handleSearch">
                    <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
                </el-input>
            </div>
            <div class="operation">
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
                    添加工程师
                </el-button>
            </div>
        </div>

        <!-- 工程师列表 -->
        <div class="table-container">
            <el-table :data="tableData" border v-loading="loading" style="width: 100%">
                <el-table-column prop="id" label="ID" width="60"></el-table-column>
                <el-table-column prop="engineerNo" label="工号" width="110"></el-table-column>
                <el-table-column prop="name" label="姓名" width="110"></el-table-column>
                <el-table-column prop="phone" label="联系电话" width="130"></el-table-column>
                <el-table-column prop="status" label="状态" width="110">
                    <template slot-scope="scope">
                        <el-tag :type="getStatusType(scope.row.status)">
                            {{ scope.row.status === 1 ? '在职' : '已离职' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" @click="handleEdit(scope.row)"
                            :disabled="scope.row.status === 0">
                            修改
                        </el-button>
                        <el-button size="mini" type="danger" @click="handleResign(scope.row.id)"
                            :disabled="scope.row.status === 0">
                            离职
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

        <!-- 添加或修改工程师的对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" :close-on-click-modal="false">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="工号" prop="engineerNo">
                    <el-input v-model="form.engineerNo" placeholder="请输入工号" :disabled="dialogType === 'edit'"></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="form.name" placeholder="请输入姓名"></el-input>
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入联系电话"></el-input>
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
                name: "",
                engineerNo: ""
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
            },
            // 对话框标题
            dialogTitle: "",
            // 对话框是否可见
            dialogVisible: false,
            // 对话框类型（add 或 edit）
            dialogType: "",
            // 表单数据
            form: {
                id: null,
                engineerNo: "",
                name: "",
                phone: "",
                password: "123456",
            },
            // 表单验证规则
            rules: {
                engineerNo: [
                    { required: true, message: "工号不能为空", trigger: "blur" }
                ],
                name: [
                    { required: true, message: "姓名不能为空", trigger: "blur" }
                ],
                phone: [
                    { required: true, message: "联系电话不能为空", trigger: "blur" },
                    { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号码", trigger: "blur" }
                ]
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
        getStatusType(status) {
            return status === 1 ? "success" : "info";
        },
        // 获取工程师列表
        fetchData() {
            console.log(this.token);
            this.loading = true;
            const engineerPageDTO = {
                page: this.pagination.currentPage,
                pageSize: this.pagination.pageSize,
                name: this.searchForm.name,
                engineerNo: this.searchForm.engineerNo
            };
            request.post('/admin/engineer/list', engineerPageDTO, {
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
        // 添加工程师
        handleAdd() {
            this.dialogTitle = "添加工程师";
            this.dialogType = "add";
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
            });
        },
        // 修改工程师
        handleEdit(row) {
            this.dialogTitle = "修改工程师";
            this.dialogType = "edit";
            this.dialogVisible = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
                this.form = { ...row };
            });
        },
        // 离职工程师
        handleResign(id) {
            this.$confirm("确定要将该工程师删除吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            })
                .then(() => {
                    request.delete(`/admin/engineer/delete/${id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${this.token}`
                            }
                        })
                        .then(res => {
                            if (res.code === 200) {
                                this.$message.success("离职操作成功");
                                this.fetchData();
                            } else {
                                this.$message.error(res.msg);
                            }
                        })

                })
                .catch(() => { });
        },
        // 提交表单
        handleSubmit() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    if (this.dialogType === "add") {
                        // 添加
                        request.post('/admin/engineer/add', this.form,
                            {
                                headers: {
                                    'Authorization': `Bearer ${this.token}`
                                }
                            })
                            .then(res => {
                                if (res.code === 200) {
                                    this.$message.success("添加成功");
                                    this.dialogVisible = false;
                                    this.fetchData();
                                } else {
                                    this.$message.error(res.msg);
                                }
                            })
                    } else {
                        // 修改
                        request.post('/admin/engineer/update', this.form,
                            {
                                headers: {
                                    'Authorization': `Bearer ${this.token}`
                                }
                            })
                            .then(res => {
                                if (res.code === 200) {
                                    this.$message.success("修改成功");
                                    this.dialogVisible = false;
                                    this.fetchData();
                                } else {
                                    this.$message.error(res.msg);
                                }
                            })
                    }
                }
            });
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
        }
    }
};
</script>

<style scoped>
.el-tag.info {
    background-color: #e4e7ed;
    color: #606266;
    border-color: #dcdfe6;
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