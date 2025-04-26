<template>
    <div class="app-container">
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="电子围栏" prop="electronicFence">
          <el-input type="textarea" rows="5" v-model="form.electronicFence" placeholder="请输入电子围栏" style="width:80%"/>
        </el-form-item>
         <el-form-item>
          <div class="input-card">
            <div class="search_box">
              <div class="label">关键字搜索</div>
              <el-input v-model="input" placeholder="请输入内容" id="tipinput" style="width:30%;padding-right: 10px;"></el-input>
              <el-button @click="createPolygon()">新建</el-button>
              <el-button @click="polygonClose()">保存</el-button>
              <el-button @click="polygonRemove()">清除</el-button>
            </div>
          </div>
          </el-form-item>
          <el-form-item>
            <div id="container"></div>
          </el-form-item>
        </el-form>
          <div slot="footer" class="dialog-footer" style="text-align: center;">
             <el-button type="primary" @click="submitForm">
               <span v-if="schoolId==0">保 存</span>
               <span v-if="schoolId!=0">修 改</span>
             </el-button>
             <el-button @click="cancel">取 消</el-button>
           </div>
    </div>
  </template>
   
  <script>
  import { getSchool, addSchool, updateSchool } from "@/api/school/info";
  import AMapLoader from "@amap/amap-jsapi-loader";
  window._AMapSecurityConfig = {
    securityJsCode: "*********************",//高德申请的key的秘钥
  };
  var polyEditor = "";
  export default {
    name: "AreaMap",
    data() {
      return {
        schoolId:'',
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          electronicFence: [
            { required: true, message: "电子围栏不能为空", trigger: "blur" }
          ],
        },
        //高德地图
        map: null,
        coordList: "",
        timer: "",
        pathList: [],
        //地图自动搜索
        input: "",
        auto: null,
        placeSearch: null,
      };
    },
    created() {
      this.reset();
    },
    mounted() {
      this.schoolId = this.$route.params && this.$route.params.schoolId;
      this.echart();
      if (this.schoolId!=0) {
         this.handleUpdate(this.schoolId);
      }
    },
    methods: {
       // 表单重置
       reset() {
          this.form = {
            id: null,
            electronicFence: null,
          };
          this.resetForm("form");
        },
      // 取消按钮
      cancel() {
        this.reset();
        const obj = { path: "/school/info" };
        this.$tab.closeOpenPage(obj);
      },
       /** 修改按钮操作 */
      handleUpdate(schoolId) {
          this.reset();
          const id = schoolId
          getSchool(id).then(response => {
            this.form = response.data;
            this.pathList=response.data.electronicFence;
            this.initPolygon();
            let path=JSON.parse(this.pathList);
            if(path.length>0){
               this.map.setCenter(path[0]);
               this.map.setZoom(13);
            }
          });
        },
      /** 提交按钮 */
      submitForm() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != null) {
              updateSchool(this.form).then(response => {
                this.$modal.msgSuccess("修改成功");
              });
            } else {
              addSchool(this.form).then(response => {
                this.$modal.msgSuccess("新增成功");
              });
            }
          }
        });
       },
      //加载高德地图
      async echart() {
        await AMapLoader.load({
          key: "*********************",
          version: "2.0",
          plugins: [
            "AMap.ToolBar",
            "AMap.Driving",
            "AMap.PolygonEditor",
            "AMap.PlaceSearch",
            "AMap.AutoComplete",
          ],
        }).then((AMap) => {
            this.map = new AMap.Map("container", {
              viewMode: "3D",
              zoom: 10,
              center:  [116.471354, 39.994257],//[113.666494,34.752186],
            });
            this.map.setFitView();
            // 关键字查询
            this.searchMap();
          }).catch((e) => {
            console.log("高德地图初始化错误：",e);
          });
          //添加时初始化，修改不需要
          if(this.schoolId==0){
              this.initPolygon()
          }
      },
      // 关键字查询
      searchMap () {
        // 搜索框自动完成类
        this.auto = new AMap.AutoComplete({
          input: "tipinput", // 使用联想输入的input的id
        });
        //构造地点查询类
        this.placeSearch = new AMap.PlaceSearch({
          map: this.map,
        });
        // 当选中某条搜索记录时触发
        this.auto.on("select", this.selectSite);
      },
      //选中查询出的记录
      selectSite (e) {
        if (e.poi.location) {
          this.placeSearch.setCity(e.poi.adcode);
          this.placeSearch.search(e.poi.name); //关键字查询
        } else {
          this.$message.error("查询地址失败，请重新输入地址");
        }
      },
      //高德地图编辑器初始化
      initPolygon() {
        var path=[];
        if (this.schoolId!=0) {
            path = JSON.parse(this.pathList);
            var polygon = new AMap.Polygon({
              path: path,
            });
            this.map.add([polygon]);
            polygon.on("dblclick", () => {
              polyEditor.setTarget(polygon);
              polyEditor.open();
            });
        }
        //创建覆盖物
        polyEditor = new AMap.PolygonEditor(this.map);
        polyEditor.on("add", (data) => {
          var polygon = data.target;
          polygon.on("dblclick", () => {
            polyEditor.setTarget(polygon);
            polyEditor.open();
          });
        });
      },
      //高德地图新建多边形
      createPolygon() {
        polyEditor.close();
        this.map.clearMap();
        polyEditor.setTarget();
        polyEditor.open();
        this.form.electronicFence='';
      },
      //高德地图多边形结束,获取经纬度集合
      polygonClose() {
        let that=this
        polyEditor.on("end", function (event) {
          let coordList = event.target.getPath();
          let mapList = [];
          coordList.forEach((v) => {
            mapList.push([v.lng, v.lat]);
          });
          that.form.electronicFence=JSON.stringify(mapList);
        });
        polyEditor.close();
      },
      //高德地图清除所有标记
      polygonRemove(){
         polyEditor.close();
         this.map.clearMap();
         this.form.electronicFence='';
      }
    },
  };
  </script>
   
  <style lang="scss" scoped>
  #container {
    width: 80%;
    height: 400px;
  }
   
  .input-card {
    bottom: 15px;
    right: 15px;
  }
  .search_box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 50px;
   
    .label {
      color: #000;
      width: 100px;
    }
  }
  </style>