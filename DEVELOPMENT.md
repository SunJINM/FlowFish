# Flow Fish 开发笔记

## 项目结构

```
flow-fish/
├── main.js          # Electron 主进程
├── fish.html        # 小鱼界面
├── fish.css         # 样式文件
├── fish.js          # 小鱼逻辑
├── package.json     # 项目配置
├── assets/          # 资源文件
│   ├── icon.ico     # Windows 图标
│   ├── icon.icns    # macOS 图标
│   ├── tray-icon.png # 托盘图标
│   └── logo.png     # 应用Logo
├── dist/            # 打包输出目录
└── README.md        # 项目说明
```

## 技术架构

### 主要技术栈
- **Electron**: 跨平台桌面应用框架
- **Node.js**: 后端运行时
- **HTML5/CSS3**: 界面和样式
- **JavaScript ES6+**: 核心逻辑

### 核心特性实现

#### 1. 透明窗口
```javascript
// main.js
const fishWindow = new BrowserWindow({
    transparent: true,        // 背景透明
    frame: false,            // 无边框
    alwaysOnTop: true,       // 置顶
    focusable: false,        // 不获取焦点
});

// 鼠标事件穿透
fishWindow.setIgnoreMouseEvents(true);
```

#### 2. 小鱼AI行为系统
```javascript
// fish.js - 行为决策树
class FlowFish {
    updateFishBehavior(fish) {
        // 群体行为
        this.checkSchoolingBehavior(fish);
        
        // 避障行为  
        this.checkAvoidanceBehavior(fish);
        
        // 个性化行为
        this.applyPersonalityBehavior(fish);
    }
}
```

#### 3. 性能优化
- 使用 `requestAnimationFrame` 确保流畅动画
- 智能碰撞检测减少计算量
- 内存使用监控防止泄露

## 开发指南

### 环境搭建
```bash
# 1. 安装 Node.js (推荐 v16+)
# 2. 克隆项目
git clone <repo-url>
cd flow-fish

# 3. 安装依赖
npm install

# 4. 开发模式运行
npm run dev
```

### 调试模式
开发模式下可用功能：
- 开发者工具 (F12)
- 控制台日志输出
- 键盘快捷键控制
- 性能监控

### 代码规范
- 使用 ES6+ 语法
- 函数名使用 camelCase
- 类名使用 PascalCase
- 常量使用 UPPER_CASE
- 添加适当的注释

## 打包发布

### 预打包检查
```bash
# 测试开发版本
npm run dev

# 测试生产版本  
npm start

# 检查代码质量
# (可以集成 ESLint)
```

### Windows 打包
```bash
npm run build-win
```
输出: `dist/Flow Fish Setup 1.0.0.exe`

### macOS 打包
```bash
npm run build-mac  
```
输出: `dist/Flow Fish-1.0.0.dmg`

注意事项：
- 需要在对应系统上打包
- macOS 需要开发者证书签名
- Windows 可能触发杀毒软件警告

## 问题解决

### 常见问题

1. **透明窗口不工作**
   - 检查系统是否支持窗口透明
   - 更新显卡驱动
   - 启用系统透明效果

2. **小鱼不显示**
   ```javascript
   // 检查容器是否正确创建
   console.log(document.getElementById('fishContainer'));
   
   // 检查CSS是否正确加载
   console.log(getComputedStyle(fish));
   ```

3. **性能问题**
   - 减少小鱼数量上限
   - 优化动画计算
   - 使用 Chrome DevTools 分析

4. **打包失败**
   - 检查 electron-builder 配置
   - 确保所有依赖都已安装
   - 清理 node_modules 重新安装

### 调试技巧
```javascript
// 1. 在开发模式下启用详细日志
console.log('🐟 小鱼状态:', fish.fishData);

// 2. 性能监控
const startTime = performance.now();
// ... 执行代码 ...
const endTime = performance.now();
console.log('执行时间:', endTime - startTime, 'ms');

// 3. 内存使用监控  
setInterval(() => {
    const memInfo = process.memoryUsage();
    console.log('内存:', (memInfo.heapUsed/1024/1024).toFixed(2), 'MB');
}, 5000);
```

## 扩展功能

### 计划中的功能
1. **AI文本识别**
   - OCR 屏幕文字
   - 关键信息提取
   - 智能搬运动画

2. **语音交互**
   - 语音命令识别
   - 文字转语音反馈
   - 自然语言对话

3. **更多小鱼类型**
   - 不同种类的海洋生物
   - 特殊能力和行为
   - 成长和进化系统

4. **主题系统**
   - 多种视觉主题
   - 季节性变化
   - 用户自定义皮肤

### 开发建议
- 保持代码模块化
- 添加单元测试
- 使用 TypeScript 增强类型安全
- 集成 CI/CD 流程
- 添加错误上报系统

## 性能基准

### 目标指标
- CPU 使用率: < 5%
- 内存占用: < 100MB  
- 帧率: 60 FPS
- 启动时间: < 3s

### 优化策略
1. **渲染优化**
   - 使用 CSS transform 而非修改位置属性
   - 避免频繁的 DOM 操作
   - 合理使用 will-change 属性

2. **计算优化**
   - 缓存重复计算结果
   - 使用空间分割减少碰撞检测
   - 智能更新频率控制

3. **内存优化**
   - 及时清理事件监听器
   - 避免闭包内存泄露
   - 合理使用对象池

## 发布流程

### 版本管理
```bash
# 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0  
npm version major  # 1.0.0 -> 2.0.0
```

### 发布检查清单
- [ ] 更新 CHANGELOG.md
- [ ] 运行所有测试
- [ ] 更新文档
- [ ] 打包并测试所有平台
- [ ] 创建 GitHub Release
- [ ] 更新官网下载链接

## 贡献指南

### 代码提交
1. Fork 项目
2. 创建功能分支
3. 编写测试
4. 提交代码
5. 创建 Pull Request

### 提交信息格式
```
type(scope): description

feat(fish): 添加新的小鱼颜色
fix(ui): 修复透明窗口显示问题  
docs(readme): 更新安装说明
style(css): 优化小鱼动画效果
refactor(core): 重构小鱼行为系统
test(unit): 添加小鱼移动测试
chore(build): 更新打包配置
```

---

最后更新: 2024-12-19
维护者: Flow Fish Team