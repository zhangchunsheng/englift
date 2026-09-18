# EngLift · 英语学习实验室

参考 [e.newkit.site](https://e.newkit.site/)（English Visual Lab）开发的英语可视化学习网站。
用**时间线**理解时态、用**地图**理解介词、用**图谱**理解发音、用**拆解**理解句子，配双语例句和练习。

## 技术栈

Vue 3 + Vite + Tailwind CSS 4 + Vue Router（localStorage 持久化学习进度与错题本）

## 功能模块

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 学习目录 | `/` | 模块导航 + 学习统计 |
| 时态时间线 | `/tenses` | 12 个时态钉在同一条 SVG 时间轴上，点/区间可视化 |
| 词形变化 | `/verbs` | 70+ 不规则动词，按 AAA/ABB/ABA/ABC 分组，检索 + 翻卡记忆 |
| 介词街区地图 | `/prepositions` | 方位/移动介词标注在街区地图上，across vs through 辨析 |
| 音标图谱 | `/phonemes` | 48 个国际音标点读发音（SpeechSynthesis），清浊成对 + 易混音对比 |
| 句子拆解 | `/sentences` | 五大基本句型逐块拆解，点击词块查看成分 |
| 配套练习 | `/quiz/:topic` | 选择 / 填空 / 排序，自动判分 |
| 错题本 | `/mistakes` | 错题自动收录，掌握后移除 |

## 开发

```shell
npm install
npm run dev      # 开发服务器
npm run build    # 生产构建（输出 dist/）
npm run preview  # 预览构建产物
```
