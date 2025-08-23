const { app, BrowserWindow, screen, Menu, Tray, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let fishWindow;
let tray;
let isHidden = false;

// 创建透明桌面窗口
function createFishWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  fishWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    transparent: true,        // 透明背景
    frame: false,            // 无边框
    alwaysOnTop: true,       // 置顶显示
    skipTaskbar: true,       // 不显示在任务栏
    resizable: false,        // 不可调整大小
    focusable: false,        // 不获取焦点
    hasShadow: false,        // 无阴影
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  fishWindow.loadFile('fish-svg.html');

  // 让窗口穿透鼠标事件（关键！）
  fishWindow.setIgnoreMouseEvents(true);

  // 隐藏菜单栏
  fishWindow.setMenuBarVisibility(false);

  // 开发模式下打开调试工具
  if (process.argv.includes('--dev')) {
    fishWindow.webContents.openDevTools();
    fishWindow.setIgnoreMouseEvents(false); // 开发时允许交互
  }

  // 监听窗口事件
  fishWindow.on('closed', () => {
    fishWindow = null;
  });

  console.log('🐟 Flow Fish 窗口创建成功');
}

// 创建系统托盘
function createTray() {
  try {
    // 创建托盘图标
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '🐟 Flow Fish v1.0',
        enabled: false
      },
      { type: 'separator' },
      {
        label: isHidden ? '显示小鱼' : '隐藏小鱼',
        click: () => toggleFishVisibility()
      },
      {
        label: '重新开始',
        click: () => {
          if (fishWindow) {
            fishWindow.reload();
          }
        }
      },
      { type: 'separator' },
      {
        label: '设置',
        submenu: [
          {
            label: '增加小鱼',
            click: () => {
              if (fishWindow) {
                fishWindow.webContents.send('add-fish');
              }
            }
          },
          {
            label: '减少小鱼',
            click: () => {
              if (fishWindow) {
                fishWindow.webContents.send('remove-fish');
              }
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: '关于 Flow Fish',
        click: () => {
          const { shell } = require('electron');
          shell.openExternal('https://github.com/flow-fish/desktop');
        }
      },
      {
        label: '退出',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('Flow Fish - 智能桌面小鱼助手');

    // 双击托盘图标切换显示/隐藏
    tray.on('double-click', toggleFishVisibility);
    
    console.log('✅ 系统托盘创建成功');
  } catch (error) {
    console.warn('⚠️ 托盘图标创建失败，将继续运行:', error.message);
  }
}

// 切换小鱼显示/隐藏
function toggleFishVisibility() {
  if (!fishWindow) return;
  
  if (isHidden) {
    fishWindow.show();
    isHidden = false;
  } else {
    fishWindow.hide();
    isHidden = true;
  }
  
  // 更新托盘菜单
  if (tray) {
    const contextMenu = tray.getContextMenu();
    contextMenu.items[2].label = isHidden ? '显示小鱼' : '隐藏小鱼';
    tray.setContextMenu(contextMenu);
  }
}

// 注册全局快捷键
function registerGlobalShortcuts() {
  try {
    // Ctrl+Alt+F 切换显示/隐藏
    globalShortcut.register('CommandOrControl+Alt+F', () => {
      toggleFishVisibility();
    });
    
    console.log('⌨️ 全局快捷键注册成功: Ctrl+Alt+F');
  } catch (error) {
    console.warn('⚠️ 快捷键注册失败:', error.message);
  }
}

// 应用程序准备就绪
app.whenReady().then(() => {
  createFishWindow();
  createTray();
  registerGlobalShortcuts();
  
  console.log('🚀 Flow Fish 启动成功！');
});

// 防止应用在所有窗口关闭时退出（macOS特性）
app.on('window-all-closed', (event) => {
  // 在 macOS 上，除非用户明确退出，否则应用程序保持活跃
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 macOS 上，当点击 dock 图标时重新创建窗口
  if (BrowserWindow.getAllWindows().length === 0) {
    createFishWindow();
  }
});

// 应用退出前清理
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// 监听渲染进程消息
ipcMain.on('fish-count-changed', (event, count) => {
  console.log(`🐟 当前小鱼数量: ${count}`);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('💥 未捕获的异常:', error);
});

console.log('🌊 Flow Fish 主进程启动中...');