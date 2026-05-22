# Glacier Cyan UI 色系规范

## 设计定位

Glacier Cyan 是智梦考公助手移动端的默认视觉色系。整体风格应保持 iOS 感、高级简约、清爽理性，适合 AI 学习产品和资料分析提速诊断场景。

界面应以白底、浅青蓝背景、卡片化、轻阴影和中大圆角为主，避免大面积高饱和色、厚重阴影和装饰性渐变。

## 色彩 Token

| Token | 颜色 | 用途 |
| --- | --- | --- |
| `primary` | `#32B2CB` | 主按钮、选中态、进度、关键图标 |
| `primaryDark` | `#1F9DB7` | 主色按压态、强调文字 |
| `primaryLight` | `#8EDBE6` | 轻量数据图、弱强调背景元素 |
| `cyanSoft` | `#DDF5F8` | 选中项背景、弱提示标签 |
| `background` | `#F7FBFD` | 页面背景 |
| `card` | `#FFFFFF` | 普通卡片、底部导航、弹层 |
| `cardSoft` | `#F1FAFC` | AI 提示卡、浅提示区、分段控件背景 |
| `textPrimary` | `#0F172A` | 标题、重要数字、主要正文 |
| `textSecondary` | `#64748B` | 说明文案、时间、辅助信息 |
| `textMuted` | `#94A3B8` | 低优先级文字、未选中导航 |
| `border` | `#E6EEF3` | 卡片边框、分割线 |
| `success` | `#14B8A6` | 正确、已掌握、提升状态 |
| `warning` | `#F59E0B` | 高频弱项、需注意状态 |
| `error` | `#EF4444` | 错误、严重超时、危险提示 |

## 使用规范

- 页面背景统一使用 `colors.background`。
- 卡片背景使用 `colors.card`，浅提示区使用 `colors.cardSoft` 或 `colors.cyanSoft`。
- 卡片圆角建议使用 `20-28`，信息密度较高的选项和按钮可使用 `12-18`。
- 卡片边框统一使用 `colors.border`。
- 阴影应轻，优先使用低透明度、较大模糊半径，不使用厚重投影。
- 主按钮使用 `colors.primary`，文字使用 `colors.card`。
- 次按钮使用 `colors.card` 背景，并搭配 `colors.primary` 边框或文字。
- 选项选中态使用 `colors.cyanSoft` 背景和 `colors.primary` 边框。
- AI 提示卡使用 `colors.cardSoft` 或 `colors.cyanSoft`。
- 错误状态只在文字、小图标或局部标签上使用 `colors.error`，不要大面积铺红。

## 代码约束

- React Native 页面必须从 `src/theme/colors.ts` 引入 `colors`。
- 页面和组件中不要直接写死 hex 色值。
- 如果后续引入 NativeWind，需要把同一套色值同步到 `tailwind.config.js` 的 `theme.extend.colors.glacier`。
- 新增页面应优先复用现有 token，不创建第二套颜色系统。
