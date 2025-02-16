import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { healthIndicatorService } from '@/services/healthIndicator';

const { TextArea } = Input;

interface HealthIndicatorFormData {
  name: string;
  type: string;
  unit: string;
  normalRange: string;
  description: string;
  status: 'active' | 'inactive';
}

const HealthIndicatorsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await healthIndicatorService.getHealthIndicators();
        setData(response.data);
      } catch (error) {
        message.error('获取健康指标列表失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    form.setFieldsValue(record);
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await healthIndicatorService.deleteHealthIndicator(id);
      message.success('删除成功');
      const response = await healthIndicatorService.getHealthIndicators();
      setData(response.data);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: HealthIndicatorFormData) => {
    try {
      if (editingId) {
        await healthIndicatorService.updateHealthIndicator(editingId, values);
        message.success('更新成功');
      } else {
        await healthIndicatorService.createHealthIndicator(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      const response = await healthIndicatorService.getHealthIndicators();
      setData(response.data);
    } catch (error) {
      message.error(editingId ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
    },
    {
      title: '正常范围',
      dataIndex: 'normalRange',
      key: 'normalRange',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Input
          value={status}
          style={{ width: 100 }}
          disabled
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (record: any) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Card title="健康指标管理">
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加指标
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingId ? '编辑指标' : '添加指标'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            status: 'active',
          }}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Input placeholder="请选择类型" />
          </Form.Item>

          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="请输入单位" />
          </Form.Item>

          <Form.Item
            name="normalRange"
            label="正常范围"
            rules={[{ required: true, message: '请输入正常范围' }]}
          >
            <Input placeholder="请输入正常范围，例如：60-100" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Input placeholder="请选择状态" />
          </Form.Item>

          <Form.Item>
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default HealthIndicatorsPage;
