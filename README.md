# 数据中台后端骨架

这是一个面向数据接入与后续 RAG 能力建设的数据中台项目。当前阶段先完成后端骨架，旧前端已清空，后续会基于新的数据中台业务重新建设前端。现有后端提供账号体系、文件直传、文档解析和部署骨架；检索索引、切块、向量化和 OpenSearch 尚未实现。

## 已有能力

- FastAPI、SQLModel、PostgreSQL 和 Alembic。
- JWT 登录、公开注册、当前用户自助管理和超级用户管理。
- 腾讯云 COS 预签名直传、下载和删除。
- 文件大小、归属和 MIME 类型校验。
- 通过 Docling 提取 PDF、DOCX、XLSX 和 HTML 文本。
- Docker Compose 本地开发与部署骨架。

## 文件处理流程

1. 调用 `POST /api/v1/files` 创建文件记录并获取 COS 上传地址。
2. 客户端使用返回的地址和请求头直接上传到 COS。
3. 调用 `POST /api/v1/files/{file_id}/complete` 校验对象并提取文本。
4. 使用 `GET /api/v1/files/{file_id}` 获取临时下载地址，或使用 `DELETE` 删除文件。

未完成的上传记录会在 24 小时后清理。已完成文件不会被后台清理。

## 快速开始

复制环境变量示例并填写 PostgreSQL 与腾讯云 COS 配置：

```bash
cp .env.example .env
docker compose watch
```

本地地址：

- API：<http://localhost:8000>
- Scalar 文档：<http://localhost:8000/scalar>
- OpenAPI JSON：<http://localhost:8000/api/v1/openapi.json>

后端静态检查：

```bash
cd backend
uv sync
uv run ruff check .
uv run mypy app
uv run ty check app scripts
```

## 数据库说明

当前迁移是新项目基线，只创建 `user` 和 `stored_file`。它不兼容旧 Agent 项目的数据库；如需保留旧数据，请先备份并单独编写数据迁移。

## 后续领域

RAG 能力应使用真实领域模块继续建设，例如 `datasets`、`documents`、`ingestion` 和 `retrieval`。原始文件与解析产物放在对象存储，PostgreSQL 保存控制面元数据，OpenSearch 用于文本块、向量和过滤字段的检索。

新前端建立后，可运行 `scripts/generate-client.sh` 从 FastAPI OpenAPI 文档重新生成类型安全的 API 客户端。脚本在 `frontend/` 或其 `package.json` 尚不存在时会明确退出，不会创建半成品工程。

更多信息见[开发指南](docs/开发指南.md)、[部署指南](docs/部署.md)和[后端说明](backend/README.md)。
