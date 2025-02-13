import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Icon } from '@rneui/themed';

interface HealthData {
  steps: number;
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  sleep: number;
}

interface Props {
  data: HealthData;
  onPress?: () => void;
}

const HealthOverview: React.FC<Props> = ({ data, onPress }) => {
  return (
    <Card containerStyle={styles.container} onPress={onPress}>
      <Text h4 style={styles.title}>今日健康</Text>
      <View style={styles.grid}>
        <View style={styles.item}>
          <Icon
            name="directions-walk"
            type="material"
            color="#4A90E2"
            size={32}
          />
          <Text style={styles.value}>{data.steps}</Text>
          <Text style={styles.label}>步数</Text>
        </View>

        <View style={styles.item}>
          <Icon
            name="favorite"
            type="material"
            color="#E74C3C"
            size={32}
          />
          <Text style={styles.value}>{data.heartRate}</Text>
          <Text style={styles.label}>心率</Text>
        </View>

        <View style={styles.item}>
          <Icon
            name="speed"
            type="material"
            color="#2ECC71"
            size={32}
          />
          <Text style={styles.value}>
            {data.bloodPressure.systolic}/{data.bloodPressure.diastolic}
          </Text>
          <Text style={styles.label}>血压</Text>
        </View>

        <View style={styles.item}>
          <Icon
            name="nightlight"
            type="material"
            color="#9B59B6"
            size={32}
          />
          <Text style={styles.value}>{data.sleep}h</Text>
          <Text style={styles.label}>睡眠</Text>
        </View>
      </View>
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
  title: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  item: {
    alignItems: 'center',
    width: '25%',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#86939E',
  },
});

export default HealthOverview;
