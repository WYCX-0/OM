<template>
    <div class="main-container">
        <!-- 地图容器 -->
        <div id="map-container" class="map-container"></div>

        <!-- 搜索面板 -->
        <div id="myPageTop" class="search-panel">
            <label>请输入关键字</label>
            <el-input 
                v-model="searchKey" 
                placeholder="请输入搜索关键字"
                @keyup.enter.native="onSearch"
                ref="searchInput">
                <template #append>
                    <el-button @click="onSearch">搜索</el-button>
                </template>
            </el-input>
        </div>

        <!-- 设备控制面板 -->
        <div class="control-panel">
            <el-tabs type="border-card">
                <el-tab-pane label="设备">
                    <el-form ref="deviceForm" :model="deviceForm" :rules="deviceRules" label-width="100px">
                        <!-- 设备类型 -->
                        <el-form-item label="设备类型" prop="type">
                            <el-select v-model="deviceForm.type" placeholder="请选择类型" style="width: 100%"
                                :disabled="isEditDevice">
                                <el-option label="客服" :value="1" />
                                <el-option label="机电" :value="2" />
                                <el-option label="电梯" :value="3" />
                                <el-option label="消防" :value="4" />
                            </el-select>
                        </el-form-item>

                        <!-- 设备名称 -->
                        <el-form-item label="设备名称" prop="name">
                            <el-input v-model="deviceForm.name" :disabled="isEditDevice" />
                        </el-form-item>

                        <!-- 设备地址 -->
                        <el-form-item label="设备地址" prop="address">
                            <el-input v-model="deviceForm.address" />
                        </el-form-item>

                        <!-- 围栏设置 -->
                        <el-form-item label="围栏半径" prop="radius">
                            <el-input-number v-model="deviceForm.radius" :min="1" :max="20000" controls-position="right" />
                            <span style="margin-left: 8px">米</span>
                        </el-form-item>

                        <!-- 坐标显示 -->
                        <el-form-item label="中心坐标">
                            <div class="coordinates">
                                <el-input :value="deviceForm.centerLng" placeholder="经度" disabled style="width: 48%" />
                                <el-input :value="deviceForm.centerLat" placeholder="纬度" disabled
                                    style="width: 48%; margin-left: 4%" />
                            </div>
                        </el-form-item>

                        <!-- 操作按钮 -->
                        <div class="form-actions">
                            <el-button @click="handleCancel">取消</el-button>
                            <el-button type="primary" @click="handleDeviceSubmit" :loading="isSubmitting">
                                保存
                            </el-button>
                        </div>
                    </el-form>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import request from '@/utils/request';

export default {
    data() {
        return {
            // 地图相关
            map: null,
            circle: null,
            marker: null,
            AMap: null,
            autoComplete: null,
            placeSearch: null,
            searchKey: '',
            
            // 表单相关
            deviceForm: {
                id: null,
                type: '',
                name: '',
                address: '',
                centerLat: null,
                centerLng: null,
                radius: 100
            },
            // 验证规则
            deviceRules: {
                type: [{ required: true, message: '请选择设备类型' }],
                name: [
                    { required: true, message: '请输入设备名称' },
                    { max: 20, message: '长度不能超过20个字符' }
                ],
                address: [
                    { required: true, message: '请输入设备地址' },
                    { max: 50, message: '长度不能超过50个字符' }
                ]
            },

            // 状态控制
            isEditDevice: false,
            isSubmitting: false,
            deviceDialogVisible: true
        };
    },

    async mounted() {
        await this.initMap();
        this.setupAuthHeader();
    },

    created() {
        const { dialogType, formData } = this.$route.params;
        if (dialogType === 'edit') {
            this.deviceForm = formData;
            this.isEditDevice = true;
        }
    },

    methods: {
        // 初始化地图
        async initMap() {
            try {
                const AMap = await AMapLoader.load({
                    key: '90229722c579e3a198cfbc0382c10794',
                    version: '2.0',
                    plugins: ['AMap.ToolBar', 'AMap.Scale', 'AMap.PlaceSearch', 'AMap.AutoComplete']
                });

                this.AMap = AMap;
                this.map = new AMap.Map('map-container', {
                    zoom: 14,
                    center: [116.397428, 39.90923],
                    resizeEnable: true
                });

                // 添加地图控件
                this.map.addControl(new AMap.ToolBar());
                this.map.addControl(new AMap.Scale());

                // 初始化搜索插件
                this.initSearchPlugins();
                
                // 绑定点击事件
                this.map.on('click', this.handleMapClick);
            } catch (error) {
                console.error('地图初始化失败:', error);
                this.$message.error('地图加载失败，请检查网络连接');
            }
        },
        
        // 初始化搜索插件
        initSearchPlugins() {
            // 初始化自动完成
            this.autoComplete = new this.AMap.AutoComplete({
                input: this.$refs.searchInput.$el.querySelector('input')
            });
            
            // 初始化地点搜索
            this.placeSearch = new this.AMap.PlaceSearch({
                map: this.map,
                pageSize: 5,
                pageIndex: 1,
                city: '全国'
            });
            
            // 注册自动完成选择事件
            this.autoComplete.on('select', this.handleAutoCompleteSelect);
        },
        
        // 处理自动完成选择
        handleAutoCompleteSelect(e) {
            this.searchKey = e.poi.name;
            this.selectResult(e.poi);
        },
        
        // 处理搜索
        onSearch() {
            if (!this.searchKey.trim()) {
                this.$message.warning('请输入搜索关键字');
                return;
            }
            
            this.placeSearch.search(this.searchKey, (status, result) => {
                if (status === 'complete' && result.info === 'OK') {
                    if (result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                        this.selectResult(result.poiList.pois[0]);
                    } else {
                        this.$message.info('未找到相关结果');
                    }
                } else {
                    this.$message.error('搜索失败，请重试');
                    console.error('搜索错误:', status, result);
                }
            });
        },
        
        // 选择搜索结果
        selectResult(poi) {
            this.clearExistingMarkers();
            
            // 添加标记
            this.marker = new this.AMap.Marker({
                position: [poi.location.lng, poi.location.lat],
                title: poi.name,
                draggable: true,
                cursor: 'move',
                raiseOnDrag: true
            });
            
            // 添加信息窗口
            const infoWindow = new this.AMap.InfoWindow({
                content: `<div class="info-window">
                            <div class="info-title">${poi.name}</div>
                            <div class="info-address">地址: ${poi.district}${poi.address}</div>
                         </div>`,
                offset: new this.AMap.Pixel(0, -30)
            });
            
            // 绑定标记事件
            this.marker.on('click', () => {
                infoWindow.open(this.map, this.marker.getPosition());
            });
            
            this.marker.on('dragend', (e) => {
                this.updateCoordinatesFromMarker(e.target.getPosition());
            });
            
            this.map.add(this.marker);
            this.map.setFitView([this.marker]);
            
            // 更新表单数据
            this.deviceForm.centerLng = poi.location.lng.toFixed(6);
            this.deviceForm.centerLat = poi.location.lat.toFixed(6);
            this.deviceForm.address = `${poi.district}${poi.address}`;
            
            // 清除圆形区域
            this.clearExistingCircle();
        },
        
        // 清除现有标记
        clearExistingMarkers() {
            if (this.marker) {
                this.map.remove(this.marker);
                this.marker = null;
            }
        },
        
        // 从标记更新坐标
        updateCoordinatesFromMarker(position) {
            this.deviceForm.centerLng = position.lng.toFixed(6);
            this.deviceForm.centerLat = position.lat.toFixed(6);
        },

        // 地图点击处理
        handleMapClick(e) {
            this.clearExistingMarkers();
            this.clearExistingCircle();

            this.circle = new this.AMap.Circle({
                center: [e.lnglat.getLng(), e.lnglat.getLat()],
                radius: this.deviceForm.radius,
                strokeColor: '#FF33FF',
                strokeOpacity: 1,
                strokeWeight: 2,
                fillColor: '#1791fc',
                fillOpacity: 0.3,
                editable: true
            });

            this.updateCoordinates(e);
            this.setupCircleListeners();
            this.map.add(this.circle);
            this.map.setFitView([this.circle]);
        },

        // 更新坐标显示
        updateCoordinates(e) {
            this.deviceForm.centerLng = e.lnglat.getLng().toFixed(6);
            this.deviceForm.centerLat = e.lnglat.getLat().toFixed(6);
        },

        // 设置圆形监听
        setupCircleListeners() {
            this.circle.on('mouseup', () => {
                this.deviceForm.radius = Math.round(this.circle.getRadius());
                const center = this.circle.getCenter();
                this.deviceForm.centerLng = center.getLng().toFixed(6);
                this.deviceForm.centerLat = center.getLat().toFixed(6);
            });
        },

        // 提交表单
        async handleDeviceSubmit() {
            try {
                await this.validateForm();
                this.isSubmitting = true;

                const payload = {
                    ...this.deviceForm,
                    type: parseInt(this.deviceForm.type)
                };

                const endpoint = this.isEditDevice ? '/admin/device/update' : '/admin/device/add';
                const response = await request.post(endpoint, payload);

                if (response.code === 0) {
                    this.$message.error('设备名已存在');
                } else {
                    this.handleSuccess();
                }
            } catch (error) {
                this.handleError(error);
            } finally {
                this.isSubmitting = false;
            }
        },

        // 表单验证
        async validateForm() {
            try {
                await this.$refs.deviceForm.validate();
                if (!this.deviceForm.centerLng || !this.deviceForm.centerLat) {
                    throw new Error('请在地图上选择设备位置');
                }
            } catch (error) {
                error.message = error.message || '表单验证失败';
                throw error;
            }
        },

        // 成功处理
        handleSuccess() {
            this.$message.success(this.isEditDevice ? '修改成功' : '添加成功');
            this.resetForm();
            this.$router.push('/index/device')
        },

        // 取消操作
        handleCancel() {
            this.resetForm();
            this.$router.push('/index/device');
        },

        // 错误处理
        handleError(error) {
            console.error('操作失败:', error);
            const message = error.response?.data?.message ||
                error.message ||
                '未知错误';
            this.$message.error(`操作失败: ${message}`);
        },

        // 重置表单
        resetForm() {
            this.$refs.deviceForm.resetFields();
            this.deviceForm = {
                id: null,
                type: '',
                name: '',
                address: '',
                centerLat: null,
                centerLng: null,
                radius: 100
            };
            this.clearExistingCircle();
            this.clearExistingMarkers();
            this.searchKey = '';
        },

        // 清除地图元素
        clearExistingCircle() {
            if (this.circle) {
                this.map.remove(this.circle);
                this.circle = null;
            }
        },

        // 设置认证头
        setupAuthHeader() {
            const user = JSON.parse(localStorage.getItem('user0'));
            if (user?.token) {
                request.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            }
        }
    }
};
</script>

<style scoped>
.main-container {
    position: relative;
    height: 100vh;
    width: 100%;
}

.map-container {
    height: 100%;
    width: 100%;
}

.control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 400px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
}

.search-panel {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 300px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    padding: 10px;
}

.coordinates {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
}

/* 信息窗口样式 */
.info-window {
    padding: 10px;
    min-width: 200px;
}

.info-title {
    font-weight: bold;
    margin-bottom: 5px;
}

.info-address {
    color: #666;
    font-size: 12px;
}
</style>    