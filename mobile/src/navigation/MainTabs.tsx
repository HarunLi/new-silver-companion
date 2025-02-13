import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/home/HomeScreen';
import ActivitiesScreen from '../screens/activities/ActivitiesScreen';
import TipsScreen from '../screens/tips/TipsScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outlined';
          } else if (route.name === 'Activities') {
            iconName = focused ? 'event' : 'event-outlined';
          } else if (route.name === 'Tips') {
            iconName = focused ? 'lightbulb' : 'lightbulb-outlined';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: '首页' }}
      />
      <Tab.Screen 
        name="Activities" 
        component={ActivitiesScreen} 
        options={{ title: '活动' }}
      />
      <Tab.Screen 
        name="Tips" 
        component={TipsScreen} 
        options={{ title: '指南' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
