# 银色伴侣 (Silver Companion)

一个专注于服务老年人的综合性应用平台。

## 项目结构

```
silver_companion/
├── backend/             # 后端服务
│   ├── app/
│   │   ├── api/        # API 路由
│   │   ├── core/       # 核心配置
│   │   ├── db/         # 数据库
│   │   ├── models/     # 数据模型
│   │   ├── schemas/    # Pydantic 模型
│   │   ├── services/   # 业务逻辑
│   │   └── utils/      # 工具函数
│   ├── venv/           # Python 虚拟环境
│   └── requirements.txt # Python 依赖
├── mobile/             # 移动端应用
└── docs/              # 项目文档
```

## 主要功能

1. 电子宠物
   - 日常互动
   - 健康监测
   - 亲情连接

2. 生活指南
   - 高铁购票教程
   - 手机支付指南
   - 生活服务教程

3. 社交活动
   - 活动发布
   - 活动报名
   - 即时通讯

## 开发环境设置

1. 后端设置：
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows 使用 venv\Scripts\activate
pip install -r requirements.txt
```

2. 数据库设置：
```bash
# 确保 PostgreSQL 已安装并运行
createdb silver_companion
```

3. 环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件设置必要的环境变量
```

4. 运行开发服务器：
```bash
uvicorn app.main:app --reload
```

## API 文档

启动服务器后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request
