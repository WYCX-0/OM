import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component:()=>import('../views/LoginView.vue')
  },
  {
    path: '/index',
    name: 'Index',
    component:()=>import('../views/IndexView.vue'),
    redirect:'/index/home',
    children:[
      {path:'home',name:'Home',component:()=>import('../views/index/HomeView.vue')},
      {path:'engineer',name:'Engineer',component:()=>import('../views/index/EngineerView.vue')},
      {path:'device',name:'Device',component:()=>import('../views/index/DeviceView.vue')},
      {path:'fail',name:'Fail',component:()=>import('../views/index/FailView.vue')},
      {path:'test-plan',name:'Test-Plan',component:()=>import('../views/index/TestPlanView.vue')},
      {path:'test-order',name:'Test-Order',component:()=>import('../views/index/TestOrderView.vue')},
      { path: 'inspection-plan', name: 'RTestPlanView', component: () => import('../views/index/RTestPlanView.vue') },
      { path: 'inspection-order', name: 'RTestOrderView', component: () => import('../views/index/RTestOrderView.vue') },
      { path: 'maintenance-plan', name: 'Maintenance-Plan', component: () => import('../views/index/BaoyangPlanView.vue') },
      { path: 'maintenance-order', name: 'Maintenance-Order', component: () => import('../views/index/BaoyangOrderView.vue') },

      {path:'spare',name:'Spare',component:()=>import('../views/index/SpareView.vue')},
      { path: 'device-form/:dialogType', name: 'DeviceForm', component: () => import('../views/index/DeviceForm.vue'), props: true }
   
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
