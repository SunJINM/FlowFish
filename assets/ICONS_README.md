# 需要创建的图标文件说明

由于无法生成实际的图像文件，请按以下说明创建所需的图标：

## 1. 托盘图标 (assets/tray-icon.png)
- 尺寸: 16x16 px
- 格式: PNG, 支持透明度
- 内容: 简化的小鱼轮廓图标
- 颜色: 单色（黑色或白色），适配系统托盘风格

## 2. 应用图标 (assets/icon.ico) - Windows
- 尺寸: 包含多种尺寸 (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
- 格式: ICO
- 内容: 彩色的 Flow Fish Logo
- 建议: 蓝色背景，白色小鱼图案

## 3. 应用图标 (assets/icon.icns) - macOS  
- 尺寸: 包含多种尺寸 (16x16 到 1024x1024)
- 格式: ICNS
- 内容: 与 Windows 版本相同的设计
- 要求: 圆角矩形背景，符合 macOS 设计规范

## 4. 应用图标 (assets/icon.png) - Linux
- 尺寸: 512x512 px
- 格式: PNG, 支持透明度
- 内容: 与其他平台版本保持一致

## 5. 项目 Logo (assets/logo.png) - 用于文档
- 尺寸: 128x128 px
- 格式: PNG, 支持透明度  
- 内容: 完整的 Flow Fish Logo 设计
- 用途: README.md 和项目文档

## 临时解决方案

如果暂时没有图标文件，程序仍可正常运行，只是会：
1. 使用 Electron 默认图标
2. 托盘可能显示空白图标
3. 不影响程序核心功能

## 图标设计建议

### 设计元素
- 主要图案: 小鱼轮廓
- 颜色方案: 蓝色系（海洋主题）
- 风格: 简洁、现代
- 辨识度: 在小尺寸下清晰可见

### 制作工具推荐
- **在线工具**: Canva, Figma
- **专业软件**: Adobe Illustrator, Photoshop
- **免费软件**: GIMP, Inkscape
- **图标转换**: RealFaviconGenerator, CloudConvert

### 生成命令 (如果有源图)
```bash
# PNG 转 ICO (Windows)
convert source.png -resize 256x256 -colors 256 assets/icon.ico

# PNG 转 ICNS (macOS) 
png2icns assets/icon.icns source.png

# 批量生成不同尺寸
for size in 16 32 48 64 128 256; do
  convert source.png -resize ${size}x${size} icon-${size}.png
done
```

## 版权说明
请确保使用的图标素材符合开源许可证要求，或使用自己创作的原创设计。