import { Theme } from '@rneui/themed';

export const theme: Theme = {
  lightColors: {
    primary: '#4A90E2',    // 柔和的蓝色，易于识别
    secondary: '#2ECC71',  // 舒适的绿色
    background: '#F5F5F5', // 浅灰色背景，减少眩光
    white: '#FFFFFF',
    black: '#000000',
    grey0: '#393E42',
    grey1: '#43484D',
    grey2: '#5E6977',
    grey3: '#86939E',
    grey4: '#BDC6CF',
    grey5: '#E1E8EE',
    greyOutline: '#BBC0C4',
    success: '#2ECC71',    // 成功状态绿色
    error: '#E74C3C',      // 错误状态红色
    warning: '#F1C40F',    // 警告状态黄色
    disabled: '#BDC6CF',   // 禁用状态灰色
  },
  mode: 'light',           // 默认使用浅色主题
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
  },
  components: {
    Text: {
      style: {
        fontSize: 18,      // 较大的默认字体大小
        lineHeight: 24,    // 适当的行高
      },
      h1Style: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: 'bold',
      },
      h2Style: {
        fontSize: 28,
        lineHeight: 36,
        fontWeight: 'bold',
      },
      h3Style: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: 'bold',
      },
      h4Style: {
        fontSize: 20,
        lineHeight: 28,
        fontWeight: 'bold',
      },
    },
    Button: {
      raised: true,
      size: 'lg',
      containerStyle: {
        marginVertical: 8,
      },
      buttonStyle: {
        borderRadius: 8,
        paddingVertical: 12,  // 增加按钮高度
      },
      titleStyle: {
        fontSize: 20,         // 按钮文字大小
        fontWeight: 'bold',
      },
    },
    Input: {
      containerStyle: {
        paddingHorizontal: 0,
      },
      inputContainerStyle: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        height: 56,          // 增加输入框高度
      },
      inputStyle: {
        fontSize: 18,        // 输入文字大小
      },
      labelStyle: {
        fontSize: 16,
        marginBottom: 8,
      },
      errorStyle: {
        fontSize: 14,
        marginTop: 4,
      },
    },
    Card: {
      containerStyle: {
        borderRadius: 12,
        padding: 16,
        margin: 8,
      },
      wrapperStyle: {
        padding: 0,
      },
    },
    Icon: {
      size: 28,              // 较大的图标尺寸
    },
    ListItem: {
      containerStyle: {
        paddingVertical: 16, // 增加列表项高度
        borderRadius: 8,
        marginVertical: 4,
      },
      titleStyle: {
        fontSize: 18,
      },
      subtitleStyle: {
        fontSize: 16,
      },
    },
  },
};
