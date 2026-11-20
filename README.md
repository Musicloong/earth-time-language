# 地球时语

点击三维地球任意地点，查看当地时间、时区、常用语言和经纬度。海洋地点显示按经度估算的太阳时。支持拖动旋转、缩放、自动旋转和城市快捷入口。

## 本地运行

需要 Node.js 20.19+。

```bash
npm install
npm run dev
```

生产构建：`npm run build`。静态文件输出到 `dist/`。

## 项目结构

- `components/ui/globe.tsx`：可点击的三维地球组件。
- `src/App.tsx`：地点、时间和语言逻辑。
- `src/index.css`：页面样式与响应式布局。
- `public/`：本地地球纹理素材。

使用 React、TypeScript、Tailwind CSS 4 和 shadcn 兼容的组件目录结构。国家边界来自 Natural Earth（通过 `world-atlas`），国家语言来自 `world-countries`，时区来自 `tz-lookup`。小岛及边境区域受地图精度限制，显示结果可能存在偏差。
