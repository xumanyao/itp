import Vue from 'vue';
import Router from 'vue-router';

import ListPage from '../components/ListPage/ListPage';
import MainPage from '../components/MainPage/MainPage';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      component: MainPage
    },
    {
      path: '/list',
      component: ListPage
    }
  ]
});
