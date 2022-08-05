import Vue from 'vue'
import VueRouter from 'vue-router'
import SellerPage from '@/views/SellerPage'
import MapPage from '@/views/MapPage'
import TrendPage from '@/views/TrendPage'
import RankPage from '@/views/RankPage'
import HotPage from '@/views/HotPage'

Vue.use(VueRouter)

const routes = [
  {
    path: '/sellerpage',
    component: SellerPage
  },
  {
    path: '/mappage',
    component: MapPage
  },
  {
    path: '/trendpage',
    component: TrendPage
  },
  {
    path: '/rankpage',
    component: RankPage
  },
  {
    path: '/hotpage',
    component: HotPage
  }
]

const router = new VueRouter({
  routes
})

export default router
