import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  View,
  Share,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Icon, Card } from '@rneui/themed';
import { activityService, Activity } from '../../services/activity';

type RouteParams = {
  ActivityDetail: {
    id: number;
  };
};

const ActivityDetailScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'ActivityDetail'>>();
  const navigation = useNavigation();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  const loadActivity = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await activityService.getActivity(route.params.id);
      setActivity(data);
      // TODO: 检查是否已报名
    } catch (err) {
      setError('加载失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [route.params.id]);

  const handleJoin = async () => {
    if (!activity) return;
    try {
      if (isJoined) {
        await activityService.cancelActivity(activity.id);
        Alert.alert('提示', '已取消报名');
      } else {
        await activityService.joinActivity(activity.id);
        Alert.alert('提示', '报名成功');
      }
      setIsJoined(!isJoined);
      await loadActivity(); // 重新加载以更新参与人数
    } catch (err) {
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  const handleShare = async () => {
    if (!activity) return;
    try {
      await Share.share({
        title: activity.title,
        message: `${activity.title}\n时间：${activity.time}\n地点：${activity.location}\n\n一起来参加吧！[应用下载链接]`,
      });
    } catch (err) {
      Alert.alert('错误', '分享失败，请重试');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !activity) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || '活动不存在'}</Text>
        <Button
          title="重试"
          onPress={loadActivity}
          buttonStyle={styles.retryButton}
        />
      </SafeAreaView>
    );
  }

  const isFull = activity.participants >= activity.maxParticipants;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Image source={{ uri: activity.image }} style={styles.image} />
        
        <View style={styles.content}>
          <Text h3 style={styles.title}>{activity.title}</Text>
          
          <Card containerStyle={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="schedule" type="material" color="#95A5A6" />
              <Text style={styles.infoText}>{activity.time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="place" type="material" color="#95A5A6" />
              <Text style={styles.infoText}>{activity.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="group" type="material" color="#95A5A6" />
              <Text style={styles.infoText}>
                {activity.participants}/{activity.maxParticipants} 人报名
              </Text>
            </View>
          </Card>

          <View style={styles.organizerSection}>
            <Text style={styles.sectionTitle}>活动组织者</Text>
            <View style={styles.organizerRow}>
              <Image
                source={{ uri: activity.organizer.avatar }}
                style={styles.avatar}
                defaultSource={require('../../assets/images/default-avatar.png')}
              />
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{activity.organizer.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>活动详情</Text>
            <Text style={styles.description}>{activity.description}</Text>
          </View>

          <Card containerStyle={styles.noticeCard}>
            <Text style={styles.noticeTitle}>温馨提示</Text>
            <Text style={styles.noticeText}>
              • 请提前10分钟到达活动地点{'\n'}
              • 穿着舒适的衣物和鞋子{'\n'}
              • 如需取消报名，请提前24小时通知
            </Text>
          </Card>
        </View>
      </ScrollView>

      <Card containerStyle={styles.bottomBar}>
        <View style={styles.bottomActions}>
          <Button
            icon={{
              name: 'share',
              type: 'material',
              color: '#FFFFFF',
            }}
            buttonStyle={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
          />
          <Button
            title={isJoined ? '取消报名' : (isFull ? '人数已满' : '立即报名')}
            disabled={!isJoined && isFull}
            buttonStyle={[
              styles.actionButton,
              styles.joinButton,
              isJoined && styles.cancelButton,
            ]}
            onPress={handleJoin}
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
  title: {
    marginBottom: 16,
  },
  infoCard: {
    marginHorizontal: 0,
    marginBottom: 16,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  organizerSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C3E50',
  },
  noticeCard: {
    marginHorizontal: 0,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#FFF9C4',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#F39C12',
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2C3E50',
  },
  bottomBar: {
    margin: 0,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  shareButton: {
    backgroundColor: '#95A5A6',
    marginRight: 12,
    width: 48,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
  },
});

export default ActivityDetailScreen;
