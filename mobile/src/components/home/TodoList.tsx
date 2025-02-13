import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, CheckBox, Icon } from '@rneui/themed';

export interface Todo {
  id: number;
  title: string;
  time?: string;
  completed: boolean;
  type: 'medicine' | 'exercise' | 'appointment' | 'other';
}

interface Props {
  todos: Todo[];
  onToggle: (id: number) => void;
  onPress?: () => void;
}

const TodoList: React.FC<Props> = ({ todos, onToggle, onPress }) => {
  const getIcon = (type: Todo['type']) => {
    switch (type) {
      case 'medicine':
        return { name: 'medical-services', color: '#E74C3C' };
      case 'exercise':
        return { name: 'fitness-center', color: '#2ECC71' };
      case 'appointment':
        return { name: 'event', color: '#4A90E2' };
      default:
        return { name: 'check-circle', color: '#95A5A6' };
    }
  };

  return (
    <Card containerStyle={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text h4>今日待办</Text>
        <Text style={styles.more}>查看全部</Text>
      </View>

      {todos.length === 0 ? (
        <View style={styles.empty}>
          <Icon
            name="check-circle"
            type="material"
            color="#BDC3C7"
            size={48}
          />
          <Text style={styles.emptyText}>今天没有待办事项</Text>
        </View>
      ) : (
        todos.map((todo) => {
          const icon = getIcon(todo.type);
          return (
            <View key={todo.id} style={styles.todoItem}>
              <CheckBox
                checked={todo.completed}
                onPress={() => onToggle(todo.id)}
                containerStyle={styles.checkbox}
                checkedColor={icon.color}
              />
              <View style={styles.todoContent}>
                <View style={styles.todoHeader}>
                  <Icon
                    name={icon.name}
                    type="material"
                    color={icon.color}
                    size={20}
                    style={styles.todoIcon}
                  />
                  <Text
                    style={[
                      styles.todoTitle,
                      todo.completed && styles.completedText,
                    ]}
                  >
                    {todo.title}
                  </Text>
                </View>
                {todo.time && (
                  <Text style={styles.todoTime}>{todo.time}</Text>
                )}
              </View>
            </View>
          );
        })
      )}
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
  empty: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#95A5A6',
    fontSize: 16,
    marginTop: 8,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    padding: 0,
    marginLeft: 0,
    marginRight: 8,
  },
  todoContent: {
    flex: 1,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoIcon: {
    marginRight: 8,
  },
  todoTitle: {
    fontSize: 16,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#95A5A6',
  },
  todoTime: {
    fontSize: 14,
    color: '#95A5A6',
    marginTop: 4,
    marginLeft: 28,
  },
});

export default TodoList;
