import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, Icon } from '@rneui/themed';

interface VerificationCodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSendCode: () => Promise<void>;
  errorMessage?: string;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChangeText,
  onSendCode,
  errorMessage,
}) => {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    try {
      await onSendCode();
      setCountdown(60);
    } catch (error) {
      // 错误处理由父组件完成
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="请输入验证码"
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^\d]/g, ''))}
        keyboardType="number-pad"
        maxLength={6}
        leftIcon={
          <Icon
            name="lock"
            type="material"
            size={24}
            color="#86939E"
          />
        }
        rightIcon={
          <Button
            title={countdown > 0 ? `${countdown}秒` : "获取验证码"}
            type="clear"
            disabled={countdown > 0}
            onPress={handleSendCode}
            titleStyle={styles.buttonTitle}
          />
        }
        errorMessage={errorMessage}
        containerStyle={styles.inputContainer}
        inputMode="numeric"
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
  buttonTitle: {
    fontSize: 16,
  },
});

export default VerificationCodeInput;
