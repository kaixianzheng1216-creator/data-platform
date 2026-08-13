# 数据中台后端

## 环境要求

- Python 3.14
- [uv](https://docs.astral.sh/uv/)
- PostgreSQL 18
- 腾讯云 COS
- Docling Serve

## 本地运行

推荐从仓库根目录使用 Docker Compose：

```bash
cp .env.example .env
docker compose watch
```

也可以在外部 PostgreSQL、COS 和 Docling 已配置的情况下直接启动：

```bash
uv sync
uv run alembic upgrade head
uv run python -m scripts.initial_data
uv run fastapi dev app/main.py
```

## 代码结构

- `app/api/`：总路由、共享 HTTP 依赖和异常处理。
- `app/core/`：配置和安全能力。
- `app/db/`：数据库 Engine 与模型注册。
- `app/modules/auth/`、`users/`：账号体系。
- `app/modules/files/`：对象存储、文件元数据、校验和解析。
- `app/bootstrap/`：首次启动初始化。

新增业务按领域放在 `app/modules/<domain>/`。RAG 建议拆分为数据集、文档、摄取和检索领域，不直接扩展 `StoredFile` 承担所有职责。

## 数据库迁移

```bash
uv run alembic revision --autogenerate -m "Describe change"
uv run alembic check
uv run alembic upgrade head
```

必须提交迁移文件，不使用 `SQLModel.metadata.create_all()` 替代迁移。

## 质量检查

```bash
uv run ruff check .
uv run mypy app
uv run ty check app scripts
```
