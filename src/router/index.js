import Vue from 'vue'
import VueRouter from 'vue-router'
import SellerPage from '@/views/SellerPage'
import MapPage from '@/views/MapPage'

Vue.use(VueRouter)

const routes = [
  {
    path: '/sellerpage',
    component: SellerPage
  },
  {
    path: '/mappage',
    component: MapPage
  }
]

const router = new VueRouter({
  routes
})

export default router
