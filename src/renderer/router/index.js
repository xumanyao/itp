import Vue from 'vue'
import Router from 'vue-router'

import ListPage from '../components/ListPage/ListPage'
import MainPage from '../components/MainPage/MainPage'
import TypePage from '../components/TpyePage/TypePage'
import MiniWindow from '../components/MiniWindow/MiniWindow'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: MainPage
    },
    {
      path: '/list',
      component: ListPage
    },
    {
      path: '/type',
      component: TypePage
    },
    {
      path: '/miniWindow',
      name: 'miniWindow',
      component: MiniWindow
    }
  ]
})
