import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { diseaseService } from '@/services/disease';

const { TextArea } = Input;
const { Option } = Select;

interface DiseaseFormData {
  name: string;
  type: string;
  description: string;
  symptoms: string;
  treatment: string;
  prevention: string;
  status: 'active' | 'inactive';
}

const DiseasesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await diseaseService.getDiseases();
      setData(response);
    } catch (error) {
      message.error('获取疾病列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      await diseaseService.deleteDisease(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: DiseaseFormData) => {
    try {
      if (editingId) {
        await diseaseService.updateDisease(editingId, values);
        message.success('更新成功');
      } else {
        await diseaseService.createDisease(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
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
      title: '症状',
      dataIndex: 'symptoms',
      key: 'symptoms',
      width: 200,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Select
          value={status}
          style={{ width: 100 }}
          disabled
        >
          <Option value="active">启用</Option>
          <Option value="inactive">停用</Option>
        </Select>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="疾病管理">
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加疾病
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
        title={editingId ? '编辑疾病' : '添加疾病'}
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
            <Select placeholder="请选择类型">
              <Option value="chronic">慢性病</Option>
              <Option value="infectious">传染病</Option>
              <Option value="cardiovascular">心血管疾病</Option>
              <Option value="respiratory">呼吸系统疾病</Option>
              <Option value="digestive">消化系统疾病</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="symptoms"
            label="症状"
            rules={[{ required: true, message: '请输入症状' }]}
          >
            <TextArea rows={4} placeholder="请输入症状" />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="治疗方法"
            rules={[{ required: true, message: '请输入治疗方法' }]}
          >
            <TextArea rows={4} placeholder="请输入治疗方法" />
          </Form.Item>

          <Form.Item
            name="prevention"
            label="预防措施"
            rules={[{ required: true, message: '请输入预防措施' }]}
          >
            <TextArea rows={4} placeholder="请输入预防措施" />
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
            <Select placeholder="请选择状态">
              <Option value="active">启用</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DiseasesPage;
