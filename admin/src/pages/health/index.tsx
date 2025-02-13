import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Card,
  Row,
  Col,
  DatePicker,
  Tag,
  Popconfirm,
  Tabs,
  Alert,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { HealthRecord, HealthAlert, healthService } from '../../services/health';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';

const { Option } = Select;
const { TabPane } = Tabs;

const recordTypes = [
  { value: 'blood_pressure', label: '血压', unit: 'mmHg' },
  { value: 'heart_rate', label: '心率', unit: 'bpm' },
  { value: 'blood_sugar', label: '血糖', unit: 'mmol/L' },
  { value: 'temperature', label: '体温', unit: '°C' },
  { value: 'weight', label: '体重', unit: 'kg' },
  { value: 'sleep', label: '睡眠', unit: 'hours' },
  { value: 'medication', label: '用药', unit: '' },
];

const HealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [form] = Form.useForm();
  const [statsData, setStatsData] = useState<any[]>([]);

  // 获取健康记录列表
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await healthService.getHealthRecords();
      setRecords(data);
    } catch (error) {
      message.error('获取健康记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取健康警报列表
  const fetchAlerts = async () => {
    try {
      const data = await healthService.getHealthAlerts();
      setAlerts(data);
    } catch (error) {
      message.error('获取健康警报失败');
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchAlerts();
  }, []);

  // 处理创建/更新健康记录
  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        measured_at: values.measured_at.toISOString(),
      };

      if (editingRecord) {
        await healthService.updateHealthRecord(editingRecord.id, data);
        message.success('更新健康记录成功');
      } else {
        await healthService.createHealthRecord(data);
        message.success('创建健康记录成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchRecords();
    } catch (error) {
      message.error(editingRecord ? '更新健康记录失败' : '创建健康记录失败');
    }
  };

  // 处理删除健康记录
  const handleDelete = async (id: number) => {
    try {
      await healthService.deleteHealthRecord(id);
      message.success('删除健康记录成功');
      fetchRecords();
    } catch (error) {
      message.error('删除健康记录失败');
    }
  };

  // 处理健康警报状态更新
  const handleAlertStatusUpdate = async (alertId: number, status: string) => {
    try {
      await healthService.updateHealthAlertStatus(alertId, status);
      message.success('更新警报状态成功');
      fetchAlerts();
    } catch (error) {
      message.error('更新警报状态失败');
    }
  };

  const recordColumns = [
    {
      title: '用户',
      dataIndex: ['user', 'name'],
      key: 'user',
    },
    {
      title: '记录类型',
      dataIndex: 'record_type',
      key: 'record_type',
      render: (type: string) => {
        const recordType = recordTypes.find(t => t.value === type);
        return recordType ? recordType.label : type;
      },
    },
    {
      title: '数值',
      key: 'value',
      render: (record: HealthRecord) => `${record.value} ${record.unit}`,
    },
    {
      title: '测量时间',
      dataIndex: 'measured_at',
      key: 'measured_at',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: HealthRecord) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              form.setFieldsValue({
                ...record,
                measured_at: dayjs(record.measured_at),
              });
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这条健康记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const alertColumns = [
    {
      title: '用户',
      dataIndex: ['user', 'name'],
      key: 'user',
    },
    {
      title: '警报类型',
      dataIndex: 'alert_type',
      key: 'alert_type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          abnormal_vital_signs: '异常生命体征',
          medication_reminder: '用药提醒',
          appointment_reminder: '预约提醒',
          emergency: '紧急情况',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const colorMap: Record<string, string> = {
          low: 'blue',
          medium: 'orange',
          high: 'red',
        };
        const textMap: Record<string, string> = {
          low: '低',
          medium: '中',
          high: '高',
        };
        return <Tag color={colorMap[severity]}>{textMap[severity]}</Tag>;
      },
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: HealthAlert) => {
        const colorMap: Record<string, string> = {
          active: 'red',
          resolved: 'green',
          dismissed: 'gray',
        };
        const textMap: Record<string, string> = {
          active: '活跃',
          resolved: '已解决',
          dismissed: '已忽略',
        };
        return (
          <Space>
            <Tag color={colorMap[status]}>{textMap[status]}</Tag>
            {status === 'active' && (
              <>
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleAlertStatusUpdate(record.id, 'resolved')}
                >
                  标记为已解决
                </Button>
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleAlertStatusUpdate(record.id, 'dismissed')}
                >
                  忽略
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="健康记录" key="records">
          <Card>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRecord(null);
                form.resetFields();
                setModalVisible(true);
              }}
              style={{ marginBottom: 16 }}
            >
              添加记录
            </Button>

            <Table
              columns={recordColumns}
              dataSource={records}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </TabPane>

        <TabPane tab="健康警报" key="alerts">
          <Card>
            <Alert
              message={`当前有 ${alerts.filter(a => a.status === 'active').length} 个活跃警报`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={alertColumns}
              dataSource={alerts}
              rowKey="id"
            />
          </Card>
        </TabPane>

        <TabPane tab="健康统计" key="stats">
          <Card>
            {/* 这里可以添加健康数据的统计图表 */}
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingRecord ? '编辑健康记录' : '添加健康记录'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="user_id"
            label="用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select
              showSearch
              placeholder="选择用户"
              optionFilterProp="children"
            >
              {/* 这里需要添加用户列表 */}
            </Select>
          </Form.Item>

          <Form.Item
            name="record_type"
            label="记录类型"
            rules={[{ required: true, message: '请选择记录类型' }]}
          >
            <Select>
              {recordTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="value"
            label="数值"
            rules={[{ required: true, message: '请输入数值' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="measured_at"
            label="测量时间"
            rules={[{ required: true, message: '请选择测量时间' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthPage;
