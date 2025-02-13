import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Icon, Card } from '@rneui/themed';
import { tipService, Tip } from '../../services/tip';

type RouteParams = {
  TipDetail: {
    id: number;
  };
};

const TipDetailScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'TipDetail'>>();
  const navigation = useNavigation();
  const [tip, setTip] = useState<Tip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const loadTip = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tipService.getTip(route.params.id);
      setTip(data);
      // TODO: 加载收藏和点赞状态
    } catch (err) {
      setError('加载失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTip();
  }, [route.params.id]);

  const handleFavorite = async () => {
    if (!tip) return;
    try {
      if (isFavorite) {
        await tipService.unfavoriteTip(tip.id);
      } else {
        await tipService.favoriteTip(tip.id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      setError('操作失败，请重试');
    }
  };

  const handleLike = async () => {
    if (!tip) return;
    try {
      if (isLiked) {
        await tipService.unlikeTip(tip.id);
      } else {
        await tipService.likeTip(tip.id);
      }
      setIsLiked(!isLiked);
      setTip(prev => prev ? { ...prev, likes: prev.likes + (isLiked ? -1 : 1) } : null);
    } catch (err) {
      setError('操作失败，请重试');
    }
  };

  const handleShare = async () => {
    if (!tip) return;
    try {
      await Share.share({
        title: tip.title,
        message: `${tip.title}\n\n${tip.description}\n\n阅读更多：[应用下载链接]`,
      });
    } catch (err) {
      setError('分享失败，请重试');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !tip) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || '内容不存在'}</Text>
        <Button
          title="重试"
          onPress={loadTip}
          buttonStyle={styles.retryButton}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Image source={{ uri: tip.image }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={styles.category}>{tip.category}</Text>
          <Text h3 style={styles.title}>{tip.title}</Text>
          
          <View style={styles.authorRow}>
            <Image
              source={{ uri: tip.author.avatar }}
              style={styles.avatar}
              defaultSource={require('../../assets/images/default-avatar.png')}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{tip.author.name}</Text>
              <Text style={styles.authorTitle}>{tip.author.title}</Text>
            </View>
            <Text style={styles.date}>
              {new Date(tip.publishedAt).toLocaleDateString()}
            </Text>
          </View>

          <Card containerStyle={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="visibility" type="material" color="#95A5A6" />
                <Text style={styles.statText}>{tip.views} 阅读</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="favorite" type="material" color="#95A5A6" />
                <Text style={styles.statText}>{tip.likes} 喜欢</Text>
              </View>
            </View>
          </Card>

          <Text style={styles.description}>{tip.description}</Text>
          <Text style={styles.content}>{tip.content}</Text>

          <View style={styles.tagContainer}>
            {tip.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>#{tag}</Text>
            ))}
          </View>
        </View>
      </ScrollView>

      <Card containerStyle={styles.bottomBar}>
        <View style={styles.bottomActions}>
          <Button
            icon={{
              name: isLiked ? 'favorite' : 'favorite-border',
              type: 'material',
              color: isLiked ? '#E74C3C' : '#95A5A6',
            }}
            type="clear"
            onPress={handleLike}
          />
          <Button
            icon={{
              name: isFavorite ? 'bookmark' : 'bookmark-border',
              type: 'material',
              color: isFavorite ? '#F1C40F' : '#95A5A6',
            }}
            type="clear"
            onPress={handleFavorite}
          />
          <Button
            icon={{
              name: 'share',
              type: 'material',
              color: '#95A5A6',
            }}
            type="clear"
            onPress={handleShare}
          />
        </View>
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  scrollView: {
    flexGrow: 1,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  category: {
    color: '#4A90E2',
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorTitle: {
    fontSize: 14,
    color: '#95A5A6',
  },
  date: {
    fontSize: 14,
    color: '#95A5A6',
  },
  statsCard: {
    marginHorizontal: 0,
    marginBottom: 16,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 8,
    color: '#95A5A6',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  tag: {
    fontSize: 14,
    color: '#4A90E2',
    marginRight: 8,
    marginBottom: 8,
  },
  bottomBar: {
    margin: 0,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default TipDetailScreen;
