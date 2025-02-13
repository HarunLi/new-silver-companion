import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Icon } from '@rneui/themed';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  errorMessage?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  errorMessage,
}) => {
  return (
    <View style={styles.container}>
      <Input
        placeholder="请输入手机号"
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^\d]/g, ''))}
        keyboardType="number-pad"
        maxLength={11}
        leftIcon={
          <Icon
            name="phone"
            type="material"
            size={24}
            color="#86939E"
          />
        }
        errorMessage={errorMessage}
        autoComplete="tel"
        inputMode="numeric"
        containerStyle={styles.inputContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
});

export default PhoneInput;
