export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user/login', component: './user/login' },
      { component: './404' },
    ],
  },
  {
    path: '/welcome',
    name: '欢迎',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin/users', name: '用户管理', component: './Admin/Users' },
      { component: './404' },
    ],
  },
  {
    path: '/activities',
    name: '活动管理',
    icon: 'calendar',
    component: './activities',
  },
  {
    path: '/health-records',
    name: '健康记录',
    icon: 'heart',
    component: './health-records',
  },
  {
    path: '/health-alerts',
    name: '健康警报',
    icon: 'alert',
    component: './health-alerts',
  },
  { path: '/', redirect: '/welcome' },
  { component: './404' },
];
