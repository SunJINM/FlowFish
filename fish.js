/**
 * Flow Fish - 桌面小鱼主逻辑
 * 智能桌面小鱼助手
 */

const { ipcRenderer } = require('electron');

class FlowFish {
    constructor() {
        this.fishes = [];
        this.fishCount = 4; // 默认小鱼数量
        this.container = document.getElementById('fishContainer');
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.colors = ['fish-blue', 'fish-orange', 'fish-green', 'fish-purple', 'fish-yellow'];
        this.isDevMode = process.argv && process.argv.includes('--dev');
        
        // 小鱼行为配置
        this.config = {
            minSpeed: 0.3,
            maxSpeed: 1.2,
            directionChangeMin: 2000,
            directionChangeMax: 6000,
            boundaryMargin: 80,
            clickEscapeSpeed: 2.5,
            clickEscapeDuration: 3000,
            schoolingDistance: 150,
            avoidanceDistance: 50
        };
        
        this.init();
    }

    init() {
        this.setupDevMode();
        this.createInitialFishes();
        this.startSwimming();
        this.setupEventListeners();
        this.setupIpcListeners();
        
        console.log('🐟 Flow Fish 初始化完成');
        console.log(`📊 屏幕分辨率: ${this.screenWidth}x${this.screenHeight}`);
        
        // 通知主进程小鱼数量
        this.notifyFishCount();
    }

    setupDevMode() {
        if (this.isDevMode) {
            const devIndicator = document.getElementById('devIndicator');
            if (devIndicator) {
                devIndicator.style.display = 'block';
                this.updateFishCountDisplay();
            }
            console.log('🔧 开发模式已启用');
        }
    }

    setupEventListeners() {
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 监听键盘事件（开发模式）
        document.addEventListener('keydown', (e) => {
            if (this.isDevMode) {
                this.handleKeyPress(e);
            }
        });
    }

    setupIpcListeners() {
        // 监听主进程消息
        ipcRenderer.on('add-fish', () => {
            this.addFish();
        });

        ipcRenderer.on('remove-fish', () => {
            this.removeFish();
        });
    }

    createInitialFishes() {
        for (let i = 0; i < this.fishCount; i++) {
            setTimeout(() => {
                this.createSingleFish(true);
            }, i * 300); // 错开创建时间
        }
    }

    createSingleFish(isInitial = false) {
        const fish = document.createElement('div');
        fish.className = 'fish swimming';
        
        // 随机颜色
        const colorClass = this.colors[Math.floor(Math.random() * this.colors.length)];
        fish.classList.add(colorClass);
        
        // 随机初始位置（避开屏幕边缘）
        const margin = this.config.boundaryMargin;
        const x = margin + Math.random() * (this.screenWidth - margin * 2);
        const y = margin + Math.random() * (this.screenHeight - margin * 2);
        
        fish.style.left = x + 'px';
        fish.style.top = y + 'px';
        
        // 鱼的状态数据
        fish.fishData = {
            id: 'fish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            x: x,
            y: y,
            targetX: x,
            targetY: y,
            speed: this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed),
            direction: Math.random() * Math.PI * 2,
            lastDirectionChange: Date.now(),
            directionChangeInterval: this.config.directionChangeMin + 
                Math.random() * (this.config.directionChangeMax - this.config.directionChangeMin),
            isEscaping: false,
            personality: Math.random(), // 0-1 之间，影响行为
            energy: 1.0 // 能量值，影响速度
        };
        
        // 新生小鱼动画
        if (!isInitial) {
            fish.classList.add('spawning');
            setTimeout(() => {
                fish.classList.remove('spawning');
            }, 1000);
        }
        
        this.container.appendChild(fish);
        this.fishes.push(fish);
        
        // 设置小鱼点击事件
        fish.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onFishClick(fish);
        });
        
        console.log(`🐟 创建新小鱼: ${fish.fishData.id}`);
        this.updateFishCountDisplay();
        this.notifyFishCount();
        
        return fish;
    }

    onFishClick(fish) {
        console.log(`👆 小鱼被点击: ${fish.fishData.id}`);
        
        // 点击反应动画
        fish.classList.add('clicked');
        setTimeout(() => {
            fish.classList.remove('clicked');
        }, 800);
        
        // 小鱼逃跑行为
        this.makeFishEscape(fish);
        
        // 影响附近其他小鱼
        this.scareNearbyFish(fish);
    }

    makeFishEscape(fish) {
        const data = fish.fishData;
        
        // 设置逃跑状态
        data.isEscaping = true;
        data.speed = this.config.clickEscapeSpeed;
        fish.classList.add('escaping');
        
        // 随机逃跑方向
        const escapeAngle = Math.random() * Math.PI * 2;
        const escapeDistance = 200 + Math.random() * 300;
        
        data.targetX = data.x + Math.cos(escapeAngle) * escapeDistance;
        data.targetY = data.y + Math.sin(escapeAngle) * escapeDistance;
        
        // 确保不超出边界
        data.targetX = Math.max(this.config.boundaryMargin, 
            Math.min(data.targetX, this.screenWidth - this.config.boundaryMargin));
        data.targetY = Math.max(this.config.boundaryMargin, 
            Math.min(data.targetY, this.screenHeight - this.config.boundaryMargin));
        
        // 恢复正常状态
        setTimeout(() => {
            data.isEscaping = false;
            data.speed = this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed);
            fish.classList.remove('escaping');
            console.log(`🐟 小鱼 ${data.id} 恢复平静`);
        }, this.config.clickEscapeDuration);
    }

    scareNearbyFish(clickedFish) {
        const clickedData = clickedFish.fishData;
        
        this.fishes.forEach(fish => {
            if (fish === clickedFish) return;
            
            const data = fish.fishData;
            const distance = this.calculateDistance(clickedData.x, clickedData.y, data.x, data.y);
            
            if (distance < this.config.schoolingDistance) {
                // 附近小鱼也会受惊
                const scareIntensity = 1 - (distance / this.config.schoolingDistance);
                if (Math.random() < scareIntensity * 0.7) {
                    setTimeout(() => {
                        this.makeFishEscape(fish);
                    }, Math.random() * 500);
                }
            }
        });
    }

    startSwimming() {
        const animate = () => {
            this.fishes.forEach(fish => {
                this.updateFishPosition(fish);
                this.updateFishBehavior(fish);
            });
            requestAnimationFrame(animate);
        };
        animate();
        
        console.log('🌊 小鱼开始游泳');
    }

    updateFishPosition(fish) {
        const data = fish.fishData;
        const now = Date.now();
        
        // 定期改变方向
        if (now - data.lastDirectionChange > data.directionChangeInterval) {
            this.setNewTarget(fish);
            data.lastDirectionChange = now;
            data.directionChangeInterval = this.config.directionChangeMin + 
                Math.random() * (this.config.directionChangeMax - this.config.directionChangeMin);
        }
        
        // 计算移动向量
        const dx = data.targetX - data.x;
        const dy = data.targetY - data.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            // 归一化方向向量并应用速度
            const moveX = (dx / distance) * data.speed * data.energy;
            const moveY = (dy / distance) * data.speed * data.energy;
            
            data.x += moveX;
            data.y += moveY;
            
            // 边界检测和反弹
            const margin = this.config.boundaryMargin;
            if (data.x < margin || data.x > this.screenWidth - margin) {
                data.x = Math.max(margin, Math.min(data.x, this.screenWidth - margin));
                data.targetX = this.screenWidth / 2 + (Math.random() - 0.5) * 200;
            }
            if (data.y < margin || data.y > this.screenHeight - margin) {
                data.y = Math.max(margin, Math.min(data.y, this.screenHeight - margin));
                data.targetY = this.screenHeight / 2 + (Math.random() - 0.5) * 200;
            }
            
            // 更新小鱼朝向
            if (moveX > 0.1) {
                fish.classList.remove('turning-left');
                fish.classList.add('turning-right');
            } else if (moveX < -0.1) {
                fish.classList.remove('turning-right');
                fish.classList.add('turning-left');
            }
            
            // 应用位置
            fish.style.left = data.x + 'px';
            fish.style.top = data.y + 'px';
        } else {
            // 到达目标，设置新目标
            this.setNewTarget(fish);
        }
    }

    updateFishBehavior(fish) {
        const data = fish.fishData;
        
        // 能量恢复（影响游泳速度）
        if (data.energy < 1.0) {
            data.energy += 0.001;
        }
        
        // 群体行为：寻找附近的鱼
        if (!data.isEscaping && Math.random() < 0.01) { // 1% 概率检查群体行为
            this.checkSchoolingBehavior(fish);
        }
        
        // 避障行为
        this.checkAvoidanceBehavior(fish);
    }

    checkSchoolingBehavior(fish) {
        const data = fish.fishData;
        const nearbyFish = [];
        
        this.fishes.forEach(otherFish => {
            if (otherFish === fish) return;
            
            const otherData = otherFish.fishData;
            const distance = this.calculateDistance(data.x, data.y, otherData.x, otherData.y);
            
            if (distance < this.config.schoolingDistance) {
                nearbyFish.push(otherFish);
            }
        });
        
        if (nearbyFish.length >= 2) {
            // 计算群体中心
            let centerX = data.x;
            let centerY = data.y;
            
            nearbyFish.forEach(nearFish => {
                centerX += nearFish.fishData.x;
                centerY += nearFish.fishData.y;
            });
            
            centerX /= (nearbyFish.length + 1);
            centerY /= (nearbyFish.length + 1);
            
            // 向群体中心移动（弱引力）
            if (data.personality > 0.3) { // 性格影响群体行为
                const attraction = 0.3;
                data.targetX += (centerX - data.targetX) * attraction;
                data.targetY += (centerY - data.targetY) * attraction;
                
                fish.classList.add('schooling');
                setTimeout(() => fish.classList.remove('schooling'), 1000);
            }
        }
    }

    checkAvoidanceBehavior(fish) {
        const data = fish.fishData;
        
        this.fishes.forEach(otherFish => {
            if (otherFish === fish) return;
            
            const otherData = otherFish.fishData;
            const distance = this.calculateDistance(data.x, data.y, otherData.x, otherData.y);
            
            if (distance < this.config.avoidanceDistance) {
                // 计算避开方向
                const avoidX = data.x - otherData.x;
                const avoidY = data.y - otherData.y;
                const avoidDistance = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
                
                if (avoidDistance > 0) {
                    const avoidForce = (this.config.avoidanceDistance - distance) / this.config.avoidanceDistance;
                    data.targetX += (avoidX / avoidDistance) * avoidForce * 30;
                    data.targetY += (avoidY / avoidDistance) * avoidForce * 30;
                }
            }
        });
    }

    setNewTarget(fish) {
        const data = fish.fishData;
        const margin = this.config.boundaryMargin;
        
        // 基于性格设置不同的移动模式
        if (data.personality > 0.7) {
            // 活跃型：大范围移动
            data.targetX = margin + Math.random() * (this.screenWidth - margin * 2);
            data.targetY = margin + Math.random() * (this.screenHeight - margin * 2);
        } else if (data.personality > 0.4) {
            // 中等型：中等范围移动
            const moveRange = 200;
            data.targetX = Math.max(margin, Math.min(
                data.x + (Math.random() - 0.5) * moveRange,
                this.screenWidth - margin
            ));
            data.targetY = Math.max(margin, Math.min(
                data.y + (Math.random() - 0.5) * moveRange,
                this.screenHeight - margin
            ));
        } else {
            // 安静型：小范围移动
            const moveRange = 100;
            data.targetX = Math.max(margin, Math.min(
                data.x + (Math.random() - 0.5) * moveRange,
                this.screenWidth - margin
            ));
            data.targetY = Math.max(margin, Math.min(
                data.y + (Math.random() - 0.5) * moveRange,
                this.screenHeight - margin
            ));
        }
    }

    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    addFish() {
        if (this.fishes.length >= 20) {
            console.log('🚫 小鱼数量已达上限 (20)');
            return;
        }
        
        const newFish = this.createSingleFish();
        console.log('➕ 添加了一条新小鱼');
        return newFish;
    }

    removeFish() {
        if (this.fishes.length <= 1) {
            console.log('🚫 至少需要保留一条小鱼');
            return;
        }
        
        const fishToRemove = this.fishes.pop();
        fishToRemove.classList.add('disappearing');
        
        setTimeout(() => {
            if (fishToRemove.parentNode) {
                fishToRemove.parentNode.removeChild(fishToRemove);
            }
        }, 800);
        
        console.log('➖ 移除了一条小鱼');
        this.updateFishCountDisplay();
        this.notifyFishCount();
    }

    resetFishes() {
        console.log('🔄 重置所有小鱼');
        
        // 移除所有现有小鱼
        this.fishes.forEach(fish => {
            fish.classList.add('disappearing');
            setTimeout(() => {
                if (fish.parentNode) {
                    fish.parentNode.removeChild(fish);
                }
            }, 800);
        });
        
        this.fishes = [];
        
        // 重新创建默认数量的小鱼
        setTimeout(() => {
            this.createInitialFishes();
        }, 1000);
    }

    handleResize() {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        console.log(`📐 屏幕尺寸变化: ${this.screenWidth}x${this.screenHeight} → ${newWidth}x${newHeight}`);
        
        this.screenWidth = newWidth;
        this.screenHeight = newHeight;
        
        // 调整小鱼位置，防止超出新边界
        this.fishes.forEach(fish => {
            const data = fish.fishData;
            const margin = this.config.boundaryMargin;
            
            if (data.x > this.screenWidth - margin) {
                data.x = this.screenWidth - margin;
                data.targetX = data.x;
                fish.style.left = data.x + 'px';
            }
            
            if (data.y > this.screenHeight - margin) {
                data.y = this.screenHeight - margin;
                data.targetY = data.y;
                fish.style.top = data.y + 'px';
            }
            
            // 重新设置目标以适应新屏幕
            this.setNewTarget(fish);
        });
    }

    handleKeyPress(e) {
        if (!this.isDevMode) return;
        
        switch (e.key.toLowerCase()) {
            case 'a':
                e.preventDefault();
                this.addFish();
                break;
            case 'r':
                e.preventDefault();
                this.removeFish();
                break;
            case 'c':
                e.preventDefault();
                this.resetFishes();
                break;
            case 's':
                e.preventDefault();
                this.showFishStats();
                break;
        }
    }

    showFishStats() {
        console.log('📊 小鱼统计信息:');
        console.log(`总数: ${this.fishes.length}`);
        
        this.fishes.forEach((fish, index) => {
            const data = fish.fishData;
            console.log(`小鱼 ${index + 1}: ID=${data.id.slice(-6)}, 位置=(${Math.round(data.x)}, ${Math.round(data.y)}), 速度=${data.speed.toFixed(2)}, 性格=${data.personality.toFixed(2)}`);
        });
    }

    updateFishCountDisplay() {
        const countElement = document.getElementById('fishCount');
        if (countElement) {
            countElement.textContent = this.fishes.length;
        }
    }

    notifyFishCount() {
        if (typeof ipcRenderer !== 'undefined') {
            ipcRenderer.send('fish-count-changed', this.fishes.length);
        }
    }
}

// 全局辅助函数（供HTML按钮调用）
function addFish() {
    if (window.flowFish) {
        window.flowFish.addFish();
    }
}

function removeFish() {
    if (window.flowFish) {
        window.flowFish.removeFish();
    }
}

function resetFishes() {
    if (window.flowFish) {
        window.flowFish.resetFishes();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌊 Flow Fish 准备启动...');
    
    // 稍微延迟以确保窗口完全加载
    setTimeout(() => {
        window.flowFish = new FlowFish();
        console.log('🚀 Flow Fish 已成功启动！');
    }, 100);
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('💥 Flow Fish 发生错误:', e.error);
});

// 性能监控（开发模式）
if (process.argv && process.argv.includes('--dev')) {
    setInterval(() => {
        const memInfo = process.memoryUsage();
        console.log(`🔍 内存使用: ${(memInfo.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    }, 30000); // 每30秒输出一次
}