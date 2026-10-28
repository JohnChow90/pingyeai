# AI 模型价格来源

最后核对：2026-10-28

币种：USD / 1M tokens。实际账单以厂商官网为准。

## 官方价格页

- Anthropic: https://www.anthropic.com/pricing
- DeepSeek: https://api-docs.deepseek.com/quick_start/pricing
- 小米 MiMo: https://mimo.mi.com/docs/price/pay-as-you-go
- 阿里云 Qwen 型号与能力: https://www.alibabacloud.com/help/en/model-studio/text-generation-model

## 交叉核对

- OpenAI、Google、Qwen、Mistral、xAI 的美元价格同时使用 OpenRouter 公共模型目录交叉核对：https://openrouter.ai/api/v1/models
- DeepSeek 表中展示高峰价，低峰价为高峰价的五折。
- Claude Haiku 5.5 表中展示不超过 100K tokens 的基础价，长上下文价格更高。
- 小米 MiMo 使用海外美元定价，国内人民币价格见官方页面。

## 维护规则

- 更新模型时同时修改 `data/models.json` 和 `build.js` 中的核对日期。
- 运行 `node build.js` 重新生成模型页、目录页、首页价格数据与 sitemap。
- 不删除旧模型页面，除非同时配置重定向或明确保留历史说明。
