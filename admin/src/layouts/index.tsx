import React from 'react';
import { Layout, Menu, Dropdown, Space, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  HeartOutlined,
  FileTextOutlined,
  SmileOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  BookOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const menuItems = [
  {
    key: 'pets',
    icon: <SmileOutlined />,
    label: '电子宠物',
  },
  {
    key: 'activities',
    icon: <CalendarOutlined />,
    label: '活动管理',
  },
  {
    key: 'health',
    icon: <HeartOutlined />,
    label: '健康管理',
    children: [
      {
        key: 'health/indicators',
        label: '健康指标',
      },
      {
        key: 'health/diseases',
        label: '疾病管理',
      },
    ],
  },
  {
    key: 'guides',
    icon: <BookOutlined />,
    label: '指南管理',
  },
];

const userMenuItems = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '个人资料',
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '退出登录',
  },
];

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/user/profile');
        break;
      case 'logout':
        navigate('/login');
        break;
    }
  };

  // 根据当前路径获取默认选中的菜单项
  const getSelectedKeys = () => {
    const pathname = location.pathname.split('/');
    return [pathname[1]];
  };

  const getOpenKeys = () => {
    const pathname = location.pathname.split('/');
    return pathname[1] === 'health' ? ['health'] : [];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        padding: '0 24px', 
        background: '#fff', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ 
          color: '#1890ff', 
          fontSize: '18px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
        }}>
          <HomeOutlined style={{ marginRight: 8 }} />
          银发伴侣管理系统
        </div>
        <Dropdown 
          menu={{ 
            items: userMenuItems,
            onClick: handleUserMenuClick,
          }} 
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>管理员</span>
          </Space>
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{
            padding: 24,
            margin: 0,
            background: '#fff',
            borderRadius: '4px',
            minHeight: 280,
          }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
