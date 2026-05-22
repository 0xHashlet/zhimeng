# 考公助手最终计划

## 一、产品目标

构建一个以 Agent 能力为核心的考公助手产品，帮助用户完成刷题、错题复习、学习计划、题目讲解、申论批改、资料问答和个性化备考规划。

产品优先支持移动端 App，后续扩展后台管理端和 Web 端。早期采用单仓库、多应用、模块化后端架构，确保开发效率和后续扩展能力。

## 二、总体架构

项目采用 Monorepo 结构：

- `apps/mobile`：React Native / Expo App。
- `apps/admin`：后台管理端。
- `apps/web`：未来 Web 端。
- `backend`：Python FastAPI 后端。
- `packages/api-client`：前端 API Client。
- `packages/shared`：共享协议、常量和类型说明。
- `packages/config`：共享工程配置。
- `docs/plan`：计划与进度管理。

后端采用模块化单体：

- 业务模块负责用户、题库、练习、错题、模考、学习计划和会员。
- Agent 模块负责题目讲解、错题分析、学习计划生成、申论批改、资料问答和工具调用。
- Worker 模块负责题库导入、异步批改、学习报告、消息推送等后台任务。

## 三、技术方向

- App：React Native、Expo、TypeScript。
- 后端：Python、FastAPI、Pydantic、SQLAlchemy。
- 数据库：PostgreSQL。
- 向量检索：pgvector 起步，后续按规模评估 Qdrant 或 Milvus。
- 缓存：Redis。
- 异步任务：Celery、Dramatiq 或 RQ，具体在实现阶段确定。
- Agent 编排：LangGraph 起步。
- 接口契约：FastAPI OpenAPI，前端生成 API Client。

## 四、核心能力

第一优先级：

- 用户登录与基础资料。
- 题库管理与题目结构。
- 专项练习与答题记录。
- 错题本与收藏。
- AI 单题讲解。
- Agent 对话记录。
- 后台题库导入。

第二优先级：

- 模考与成绩分析。
- 学习计划与每日任务。
- 薄弱项分析。
- RAG 资料问答。
- 申论批改。
- 会员与用量限制。

第三优先级：

- 个性化推荐。
- 长期学习记忆。
- 多 Agent 工作流。
- AI 效果评测体系。
- 成本监控与多模型降级。
- Web 端能力完善。

## 五、架构原则

- 一个仓库，多应用，多模块。
- 业务系统保持稳定，Agent 系统保持灵活。
- Agent 不直接访问数据库，应通过业务 service 或工具层获取数据。
- Prompt、工具、工作流、模型适配、RAG 分层管理。
- 数据模型和 API 契约优先保持清晰稳定。
- 每个阶段都要有明确计划、进度记录、验证结果和阶段提交。

## 六、最终交付目标

最终产品应具备：

- 可正常使用的移动端 App。
- 可运营题库和内容的后台管理端。
- 稳定的 Python 后端 API。
- 可追踪、可评估、可扩展的 Agent 能力。
- 完整的刷题、错题、模考、学习计划、AI 辅导闭环。
- 清晰的阶段计划、文档和提交历史。
