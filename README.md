# Flow Fish - 智能桌面小鱼助手

<p align="center">
  <img src="assets/logo.png" alt="Flow Fish Logo" width="128" height="128">
</p>

<p align="center">
  <em>让工作更有趣的桌面小鱼伙伴 🐟</em>
</p>

## 🌟 特性

- **🎯 非干扰设计** - 透明窗口，不影响正常操作
- **🐠 智能行为** - 小鱼具有个性化的游泳模式
- **🏫 群体行为** - 真实的鱼群聚集和避让行为
- **🎨 多彩外观** - 5种不同颜色的可爱小鱼
- **⚡ 高性能** - 流畅的60FPS动画
- **🔧 开发友好** - 完整的调试模式
- **💻 跨平台** - 支持 Windows、macOS 和 Linux

## 📸 预览

![Flow Fish 桌面效果](assets/preview.gif)

## 🚀 快速开始

### 安装依赖

```bash
# 进入项目目录
cd flow-fish

# 安装依赖
npm install
```

### 开发模式运行

```bash
# 启动开发模式
npm run dev
```

开发模式特性：
- 显示调试面板
- 可以使用键盘快捷键控制小鱼
- 控制台输出详细日志
- 允许鼠标交互（正常模式下鼠标会穿透）

### 生产模式运行

```bash
# 启动正式版本
npm start
```

## 🎮 控制方式

### 系统托盘

右键点击系统托盘中的 Flow Fish 图标：
- **显示/隐藏小鱼** - 切换小鱼的显示状态
- **增加小鱼** - 添加更多小鱼到桌面
- **减少小鱼** - 移除一些小鱼
- **重新开始** - 重置所有小鱼
- **退出** - 关闭程序

### 全局快捷键

- `Ctrl + Alt + F` - 快速显示/隐藏小鱼

### 开发模式快捷键

- `A` - 添加一条小鱼
- `R` - 移除一条小鱼
- `C` - 重置所有小鱼
- `S` - 显示小鱼统计信息

## 🛠️ 打包发布

### Windows

```bash
npm run build-win
```

生成的文件位于 `dist/` 目录下：
- `Flow Fish Setup 1.0.0.exe` - 安装程序

### macOS

```bash
npm run build-mac
```

生成的文件：
- `Flow Fish-1.0.0.dmg` - macOS 安装包

### Linux

```bash
npm run build-linux
```

生成的文件：
- `Flow Fish-1.0.0.AppImage` - Linux 应用包

### 全平台打包

```bash
npm run build-all
```

## ⚙️ 配置

小鱼的行为可以通过修改 `fish.js` 中的配置对象来调整：

```javascript
this.config = {
    minSpeed: 0.3,          // 最小游泳速度
    maxSpeed: 1.2,          // 最大游泳速度
    directionChangeMin: 2000,   // 最小方向改变间隔(ms)
    directionChangeMax: 6000,   // 最大方向改变间隔(ms)
    boundaryMargin: 80,     // 屏幕边缘边距
    clickEscapeSpeed: 2.5,  // 点击逃跑速度
    clickEscapeDuration: 3000,  // 逃跑持续时间(ms)
    schoolingDistance: 150, // 群体行为触发距离
    avoidanceDistance: 50   // 避让行为触发距离
};
```

## 🎨 自定义

### 添加新的小鱼颜色

在 `fish.css` 中添加新的颜色类：

```css
.fish.fish-red {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    box-shadow: 0 2px 12px rgba(231, 76, 60, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.fish.fish-red::before {
    border-left-color: #c0392b;
}
```

然后在 `fish.js` 的颜色数组中添加：

```javascript
this.colors = ['fish-blue', 'fish-orange', 'fish-green', 'fish-purple', 'fish-yellow', 'fish-red'];
```

### 修改小鱼大小

调整 `fish.css` 中的 `.fish` 样式：

```css
.fish {
    width: 40px;  /* 调整宽度 */
    height: 28px; /* 调整高度 */
}
```

## 🐛 故障排除

### 小鱼不显示

1. 检查是否在开发模式下运行
2. 查看控制台是否有错误信息
3. 确认系统托盘中的 Flow Fish 图标是否显示

### 性能问题

1. 减少小鱼数量
2. 降低动画帧率
3. 关闭开发模式

### 透明度问题

某些 Windows 版本可能不完全支持透明窗口，可以尝试：
1. 更新显卡驱动
2. 启用 Windows 的透明效果
3. 以管理员身份运行

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 这个仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📄 许可证

[MIT License](LICENSE)

## 🙏 致谢

- 感谢 [Electron](https://electronjs.org/) 提供跨平台桌面应用开发框架
- 图标设计灵感来源于海洋生物
- 动画效果参考了自然界中鱼群的真实行为

## 🔮 未来计划

- [ ] 添加 AI 文本识别功能
- [ ] 实现文本搬运动画
- [ ] 支持更多海洋生物
- [ ] 添加声音效果
- [ ] 集成智能助手功能
- [ ] 支持自定义皮肤主题
- [ ] 添加小鱼互动游戏

---

<p align="center">
  用 ❤️ 制作 | Flow Fish Team
</p>