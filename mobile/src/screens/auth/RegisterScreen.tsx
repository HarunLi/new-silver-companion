import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Input, useTheme } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import PhoneInput from '../../components/auth/PhoneInput';
import VerificationCodeInput from '../../components/auth/VerificationCodeInput';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  const validatePhone = () => {
    if (!phone) {
      setPhoneError('请输入手机号');
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setPhoneError('请输入正确的手机号');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateCode = () => {
    if (!code) {
      setCodeError('请输入验证码');
      return false;
    }
    if (code.length !== 6) {
      setCodeError('验证码为6位数字');
      return false;
    }
    setCodeError('');
    return true;
  };

  const validateNickname = () => {
    if (!nickname) {
      setNicknameError('请输入昵称');
      return false;
    }
    if (nickname.length < 2 || nickname.length > 20) {
      setNicknameError('昵称长度为2-20个字符');
      return false;
    }
    setNicknameError('');
    return true;
  };

  const handleSendCode = async () => {
    if (!validatePhone()) {
      return;
    }
    
    try {
      // TODO: 调用发送验证码API
      Alert.alert('提示', '验证码已发送');
    } catch (error) {
      Alert.alert('错误', '发送验证码失败，请重试');
    }
  };

  const handleRegister = async () => {
    if (!validatePhone() || !validateCode() || !validateNickname()) {
      return;
    }

    try {
      // TODO: 调用注册API
      Alert.alert('提示', '注册成功', [
        {
          text: '确定',
          onPress: () => navigation.replace('Main'),
        },
      ]);
    } catch (error) {
      Alert.alert('错误', '注册失败，请重试');
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text h1 style={styles.title}>创建账号</Text>
            <Text style={styles.subtitle}>
              加入银发伴侣，开启健康生活
            </Text>
          </View>

          <View style={styles.form}>
            <PhoneInput
              value={phone}
              onChangeText={setPhone}
              errorMessage={phoneError}
            />

            <VerificationCodeInput
              value={code}
              onChangeText={setCode}
              onSendCode={handleSendCode}
              errorMessage={codeError}
            />

            <Input
              placeholder="请输入昵称"
              value={nickname}
              onChangeText={setNickname}
              errorMessage={nicknameError}
              maxLength={20}
              inputStyle={styles.nicknameInput}
            />

            <Button
              title="注 册"
              onPress={handleRegister}
              containerStyle={styles.registerButton}
              size="lg"
            />

            <Button
              title="已有账号？立即登录"
              type="clear"
              onPress={handleLogin}
              containerStyle={styles.loginButton}
              size="lg"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#86939E',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  nicknameInput: {
    fontSize: 18,
  },
  registerButton: {
    marginTop: 24,
  },
  loginButton: {
    marginTop: 16,
  },
});

export default RegisterScreen;
