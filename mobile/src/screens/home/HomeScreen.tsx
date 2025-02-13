import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useTheme } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import HealthOverview from '../../components/home/HealthOverview';
import TodoList from '../../components/home/TodoList';
import ActivityList from '../../components/home/ActivityList';
import HealthTips from '../../components/home/HealthTips';
import { useHomeStore } from '../../store/useHomeStore';

const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const {
    healthData,
    todos,
    activities,
    tips,
    isLoading,
    error,
    loadAll,
    toggleTodo,
    joinActivity,
  } = useHomeStore();

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('错误', error);
    }
  }, [error]);

  const handleRefresh = async () => {
    await loadAll();
  };

  const handleToggleTodo = async (id: number) => {
    await toggleTodo(id);
  };

  const handleJoinActivity = async (id: number) => {
    try {
      await joinActivity(id);
      Alert.alert('提示', '报名成功！');
    } catch (error) {
      Alert.alert('错误', '报名失败，请重试');
    }
  };

  const handleViewTip = (id: number) => {
    navigation.navigate('TipDetail', { id });
  };

  const handleViewAllActivities = () => {
    navigation.navigate('Activities');
  };

  const handleViewAllTips = () => {
    navigation.navigate('Tips');
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {healthData && <HealthOverview data={healthData} />}
        <TodoList
          todos={todos}
          onToggle={handleToggleTodo}
        />
        <ActivityList
          activities={activities}
          onJoin={handleJoinActivity}
          onViewAll={handleViewAllActivities}
        />
        <HealthTips
          tips={tips}
          onPress={handleViewTip}
          onViewAll={handleViewAllTips}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    padding: 16,
  },
});

export default HomeScreen;
