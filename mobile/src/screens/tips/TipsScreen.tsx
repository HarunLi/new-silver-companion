import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ButtonGroup, SearchBar } from '@rneui/themed';
import { tipService, Tip } from '../../services/tip';

const CATEGORIES = ['全部', '养生保健', '运动健身', '饮食营养', '心理健康'];
const PAGE_SIZE = 10;

const TipsScreen = () => {
  const navigation = useNavigation();
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTips = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(1);
        setHasMore(true);
      }
      
      if (!hasMore && !refresh) return;

      setIsLoading(true);
      setError(null);

      const category = selectedIndex === 0 ? undefined : CATEGORIES[selectedIndex];
      const { tips: newTips, total } = await tipService.getTips({
        category,
        page: refresh ? 1 : page,
        limit: PAGE_SIZE,
      });

      setTips(prev => refresh ? newTips : [...prev, ...newTips]);
      setHasMore(newTips.length === PAGE_SIZE);
      setPage(prev => refresh ? 2 : prev + 1);
    } catch (err) {
      setError('加载失败，请重试');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTips(true);
  }, [selectedIndex]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTips(true);
  };

  const handleLoadMore = () => {
    if (!isLoading) {
      loadTips();
    }
  };

  const handleSearch = () => {
    // TODO: 实现搜索功能
    loadTips(true);
  };

  const renderTip = ({ item }: { item: Tip }) => (
    <Button
      containerStyle={styles.tipContainer}
      buttonStyle={styles.tipButton}
      onPress={() => navigation.navigate('TipDetail', { id: item.id })}
    >
      <View style={styles.tipContent}>
        <View style={styles.tipInfo}>
          <Text style={styles.tipCategory}>{item.category}</Text>
          <Text style={styles.tipTitle}>{item.title}</Text>
          <Text style={styles.tipDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.tipStats}>
            <Text style={styles.tipStat}>{item.views} 阅读</Text>
            <Text style={styles.tipStat}>•</Text>
            <Text style={styles.tipStat}>{item.likes} 喜欢</Text>
          </View>
        </View>
        <Image source={{ uri: item.image }} style={styles.tipImage} />
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
          暂无内容
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        platform="ios"
        placeholder="搜索健康小贴士"
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
        data={tips}
        renderItem={renderTip}
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
            onPress={() => loadTips(true)}
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
  tipContainer: {
    marginBottom: 16,
  },
  tipButton: {
    padding: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  tipContent: {
    flexDirection: 'row',
    padding: 12,
  },
  tipInfo: {
    flex: 1,
    marginRight: 12,
  },
  tipCategory: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 4,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#95A5A6',
    lineHeight: 20,
    marginBottom: 8,
  },
  tipStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipStat: {
    fontSize: 12,
    color: '#95A5A6',
    marginRight: 8,
  },
  tipImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
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

export default TipsScreen;
