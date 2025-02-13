import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';
import { MainTabParamList } from './types';

// 导入页面组件
import HomeStack from '../screens/home/HomeStack';
import HealthStack from '../screens/health/HealthStack';
import ActivitiesStack from '../screens/activities/ActivitiesStack';
import ProfileStack from '../screens/profile/ProfileStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#86939E',
        tabBarLabelStyle: {
          fontSize: 14,                 // 较大的标签文字
          marginBottom: 8,             // 增加文字和图标的间距
        },
        tabBarStyle: {
          height: 64,                  // 增加标签栏高度
          paddingTop: 8,              // 增加上边距
          paddingBottom: 8,           // 增加下边距
        },
        tabBarIconStyle: {
          marginTop: 8,               // 增加图标上边距
        },
        headerShown: false,           // 隐藏顶部导航栏
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="home"
              type="material"
              color={color}
              size={size + 4}          // 稍微增大图标尺寸
            />
          ),
        }}
      />
      <Tab.Screen
        name="Health"
        component={HealthStack}
        options={{
          title: '健康',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="favorite"
              type="material"
              color={color}
              size={size + 4}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesStack}
        options={{
          title: '活动',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="group"
              type="material"
              color={color}
              size={size + 4}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="person"
              type="material"
              color={color}
              size={size + 4}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
