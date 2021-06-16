// 注册全局的组件
import Vue from 'vue';
import Scroll from './scroll';
import Tree from './tree';

Vue.component("t-scroll", Scroll);
Vue.component("t-tree", Tree);