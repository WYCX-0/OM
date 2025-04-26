<template>
    <div>
      <el-container>
        <!--侧边栏-->
        <el-aside :width="asideWidth" style="min-height:100vh; background-color:#001529">
          <div style="height:60px;color:white;display:flex;align-items:center;justify-content:center">
            运维
          </div>
          <el-menu :collapse="isCollapse" :collapse-transition="false" router background-color="#001529"
            text-color="rgba(255,255,255,0.65)" style="border:none" default-active="$route.path">
            <el-menu-item index="/index/home">
              <template>
                <i class="el-icon-s-custom"></i>
                <span v-if="!isCollapse">主页</span>
              </template>
            </el-menu-item>

            <!-- 员工管理 -->
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-user"></i>
                <span v-if="!isCollapse">员工管理</span>
              </template>
              <el-menu-item index="/index/engineer">
                <i class="el-icon-s-custom"></i>
                <span>工程师</span>
              </el-menu-item>
            </el-submenu>

            <!-- 设备管理 -->
            <el-submenu index="2">
              <template slot="title">
                <i class="el-icon-document"></i>
                <span v-if="!isCollapse">设备管理</span>
              </template>
              <el-menu-item index="/index/device">
                <i class="el-icon-info"></i>
                <span>设备管理</span>
              </el-menu-item>
              
            </el-submenu>

            <!-- 设备故障 -->
            <el-submenu index="3">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span v-if="!isCollapse">设备故障</span>
              </template>
              <el-menu-item index="/index/fail">
                <i class="el-icon-s-custom"></i>
                <span>设备故障</span>
              </el-menu-item>
              <el-menu-item index="/index/spare">
                <i class="el-icon-s-custom"></i>
                <span>备件管理</span>
              </el-menu-item>
            </el-submenu>

            <!-- 检测计划 -->
            <el-submenu index="4">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span v-if="!isCollapse">检测管理</span>
              </template>
              <el-menu-item index="/index/test-plan">
                <i class="el-icon-s-custom"></i>
                <span>检测计划</span>
              </el-menu-item>
              <el-menu-item index="/index/test-order">
                <i class="el-icon-s-custom"></i>
                <span>检测工单</span>
              </el-menu-item>
            </el-submenu>

          </el-menu>
        </el-aside>

        <el-container>
          <!--头部区域-->
          <el-header>
            <i :class="collapseIcon" style="font-size:26px" @click="handleCollapse"></i>

            <div style="flex:1; width:0; display:flex; align-items:center; justify-content:flex-end">
              <el-dropdown>
                <div style="display: flex; align-items:center; cursor:default">
                  <span>{{ user.username }}</span>
                </div>
                <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="$router.push('/index/password')">修改密码</el-dropdown-item>
                  <el-dropdown-item @click.native="$router.push('/login')">退出登录</el-dropdown-item>
                  
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-header>

          <!--主体-->
          <el-main>
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </template>
    
  <script>
  
  export default {
  
    data() {
      return {
        isCollapse: false,//不收缩
        asideWidth: '200px',
        collapseIcon: 'el-icon-s-fold',
        user: JSON.parse(localStorage.getItem('user0'))
      }
    },
  
    methods: {
      handleCollapse() {
        this.isCollapse = !this.isCollapse
        this.asideWidth = this.isCollapse ? '64px' : '200px',
          this.collapseIcon = this.isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'
      }
    }
  }
  </script>
    
  <style>
  .el-menu--inline .el-menu-item {
    background-color: #000c17 !important;
  }
  
  .el-menu-item:hover,
  .el-submenu__title:hover {
    color: #fff !important;
  }
  
  .el-submenu__title:hover i {
    color: #fff !important;
  }
  
  .el-menu-item:hover i {
    color: #fff !important;
  }
  
  .el-aside {
    transition: width .3s;
    box-shadow: 2px 0 6px rgba(0, 21, 41, .35);
  }
  
  .el-header {
    box-shadow: 2px 0 6px rgba(0, 21, 41, .35);
    display: flex;
    align-items: center;
  }
  </style>