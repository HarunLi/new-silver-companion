import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Dropdown, message } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  HeartOutlined,
  BugOutlined,
  ThunderboltOutlined,
  SmileOutlined,
  BookOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from './BasicLayout.module.less';

const { Header, Sider, Content } = Layout;

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    message.success('退出成功');
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据监控',
    },
    {
      key: '/app-users',
      icon: <TeamOutlined />,
      label: 'APP用户管理',
    },
    {
      key: '/pets',
      icon: <SmileOutlined />,
      label: '宠物管理',
    },
    {
      key: '/activities',
      icon: <ThunderboltOutlined />,
      label: '活动管理',
    },
    {
      key: '/health',
      icon: <HeartOutlined />,
      label: '健康管理',
      children: [
        {
          key: '/health/indicators',
          icon: <HeartOutlined />,
          label: '健康指标',
        },
        {
          key: '/health/diseases',
          icon: <BugOutlined />,
          label: '疾病管理',
        },
      ],
    },
    {
      key: '/guidelines',
      icon: <BookOutlined />,
      label: '指南管理',
    },
  ];

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key);
  };

  const getSelectedKeys = () => {
    const pathname = location.pathname;
    const selectedKeys = [pathname];
    const openKeys = pathname.split('/').slice(0, -1).map((_, index, array) => 
      '/' + array.slice(1, index + 1).join('/')
    ).filter(Boolean);
    
    return { 
      selectedKeys,
      defaultOpenKeys: openKeys,
    };
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className={styles.logo}>
          <h1>银发伴侣</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          {...getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                管理员
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
