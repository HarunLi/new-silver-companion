import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ButtonGroup, SearchBar } from '@rneui/themed';
import { activityService, Activity } from '../../services/activity';

const CATEGORIES = ['全部', '运动健身', '文化娱乐', '健康讲座', '其他'];
const PAGE_SIZE = 10;

const ActivitiesScreen = () => {
  const navigation = useNavigation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadActivities = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(1);
        setHasMore(true);
      }
      
      if (!hasMore && !refresh) return;

      setIsLoading(true);
      setError(null);

      const category = selectedIndex === 0 ? undefined : CATEGORIES[selectedIndex];
      const { activities: newActivities, total } = await activityService.getActivities({
        category,
        page: refresh ? 1 : page,
        limit: PAGE_SIZE,
      });

      setActivities(prev => refresh ? newActivities : [...prev, ...newActivities]);
      setHasMore(newActivities.length === PAGE_SIZE);
      setPage(prev => refresh ? 2 : prev + 1);
    } catch (err) {
      setError('加载失败，请重试');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivities(true);
  }, [selectedIndex]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadActivities(true);
  };

  const handleLoadMore = () => {
    if (!isLoading) {
      loadActivities();
    }
  };

  const handleSearch = () => {
    // TODO: 实现搜索功能
    loadActivities(true);
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <Button
      containerStyle={styles.activityContainer}
      buttonStyle={styles.activityButton}
      onPress={() => navigation.navigate('ActivityDetail', { id: item.id })}
    >
      <View style={styles.activityContent}>
        <Image source={{ uri: item.image }} style={styles.activityImage} />
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityTime}>{item.time}</Text>
          <Text style={styles.activityLocation}>{item.location}</Text>
          <View style={styles.participantsRow}>
            <Text style={styles.participantsText}>
              {item.participants}/{item.maxParticipants} 人报名
            </Text>
            {item.participants >= item.maxParticipants && (
              <Text style={styles.fullText}>已满</Text>
            )}
          </View>
        </View>
      </View>
    </Button>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          暂无活动
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        platform="ios"
        placeholder="搜索活动"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        containerStyle={styles.searchContainer}
      />

      <ButtonGroup
        buttons={CATEGORIES}
        selectedIndex={selectedIndex}
        onPress={setSelectedIndex}
        containerStyle={styles.categoryContainer}
        selectedButtonStyle={styles.selectedCategory}
      />

      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="重试"
            onPress={() => loadActivities(true)}
            buttonStyle={styles.retryButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  categoryContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    height: 40,
  },
  selectedCategory: {
    backgroundColor: '#4A90E2',
  },
  listContainer: {
    padding: 16,
  },
  activityContainer: {
    marginBottom: 16,
  },
  activityButton: {
    padding: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  activityContent: {
    flexDirection: 'row',
    padding: 12,
  },
  activityImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 4,
  },
  activityLocation: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 8,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  fullText: {
    fontSize: 12,
    color: '#E74C3C',
    backgroundColor: '#FADBD8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 32,
    borderRadius: 20,
  },
});

export default ActivitiesScreen;
