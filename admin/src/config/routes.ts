export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/pets',
    name: 'pets',
    icon: 'heart',
    routes: [
      {
        path: '/pets/list',
        name: 'list',
        component: './pets/list',
      },
      {
        path: '/pets/create',
        name: 'create',
        component: './pets/create',
      },
    ],
  },
  {
    path: '/activities',
    name: 'activities',
    icon: 'calendar',
    routes: [
      {
        path: '/activities/list',
        name: 'list',
        component: './activities/list',
      },
      {
        path: '/activities/create',
        name: 'create',
        component: './activities/create',
      },
    ],
  },
  {
    path: '/health',
    name: 'health',
    icon: 'heart',
    routes: [
      {
        path: '/health/records',
        name: 'records',
        component: './health/records',
      },
      {
        path: '/health/create',
        name: 'create',
        component: './health/create',
      },
    ],
  },
  {
    path: '/guides',
    name: 'guides',
    icon: 'book',
    routes: [
      {
        path: '/guides/list',
        name: 'list',
        component: './guides/list',
      },
      {
        path: '/guides/create',
        name: 'create',
        component: './guides/create',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
