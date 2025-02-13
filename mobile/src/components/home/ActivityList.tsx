import React from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { Card, Text, Button, Icon } from '@rneui/themed';

export interface Activity {
  id: number;
  title: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  image: ImageSourcePropType;
}

interface Props {
  activities: Activity[];
  onJoin: (id: number) => void;
  onViewAll?: () => void;
}

const ActivityList: React.FC<Props> = ({ activities, onJoin, onViewAll }) => {
  return (
    <Card containerStyle={styles.container}>
      <View style={styles.header}>
        <Text h4>推荐活动</Text>
        <Text style={styles.more} onPress={onViewAll}>
          查看全部
        </Text>
      </View>

      {activities.map((activity) => (
        <View key={activity.id} style={styles.activityItem}>
          <Image source={activity.image} style={styles.image} />
          <View style={styles.content}>
            <Text style={styles.title}>{activity.title}</Text>
            <View style={styles.infoRow}>
              <Icon
                name="schedule"
                type="material"
                color="#95A5A6"
                size={16}
                style={styles.icon}
              />
              <Text style={styles.info}>{activity.time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon
                name="place"
                type="material"
                color="#95A5A6"
                size={16}
                style={styles.icon}
              />
              <Text style={styles.info}>{activity.location}</Text>
            </View>
            <View style={styles.footer}>
              <Text style={styles.participants}>
                {activity.participants}/{activity.maxParticipants}人参加
              </Text>
              <Button
                title="报名"
                onPress={() => onJoin(activity.id)}
                buttonStyle={styles.joinButton}
                titleStyle={styles.joinButtonText}
              />
            </View>
          </View>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 0,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  more: {
    color: '#4A90E2',
    fontSize: 16,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 4,
  },
  info: {
    fontSize: 14,
    color: '#95A5A6',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  participants: {
    fontSize: 14,
    color: '#95A5A6',
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
  },
  joinButtonText: {
    fontSize: 14,
  },
});

export default ActivityList;
