import React from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { Card, Text } from '@rneui/themed';

export interface Tip {
  id: number;
  title: string;
  description: string;
  image: ImageSourcePropType;
  category: string;
}

interface Props {
  tips: Tip[];
  onPress?: (id: number) => void;
  onViewAll?: () => void;
}

const HealthTips: React.FC<Props> = ({ tips, onPress, onViewAll }) => {
  return (
    <Card containerStyle={styles.container}>
      <View style={styles.header}>
        <Text h4>健康小贴士</Text>
        <Text style={styles.more} onPress={onViewAll}>
          查看全部
        </Text>
      </View>

      {tips.map((tip) => (
        <View
          key={tip.id}
          style={styles.tipItem}
          onTouchEnd={() => onPress?.(tip.id)}
        >
          <View style={styles.content}>
            <Text style={styles.category}>{tip.category}</Text>
            <Text style={styles.title}>{tip.title}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {tip.description}
            </Text>
          </View>
          <Image source={tip.image} style={styles.image} />
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
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 12,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  category: {
    color: '#4A90E2',
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#95A5A6',
    lineHeight: 20,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});

export default HealthTips;
