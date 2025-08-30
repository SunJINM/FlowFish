/**
 * Flow Fish SVG版本 - 包含小丑鱼样式的桌面小鱼
 * 集成 Anime.js 动画系统
 */

const { ipcRenderer } = require('electron');

class FlowFishSVG {
    constructor() {
        this.fishes = [];
        this.fishCount = 4;
        this.container = document.getElementById('fishContainer');
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.isDevMode = process.argv && process.argv.includes('--dev');
        
        // 初始化动画管理器
        this.animationManager = new FishAnimationManager();
        this.animationManager.init();
        
        // 初始化自然游动系统
        this.naturalSwimming = new NaturalSwimmingSystem(
            this.screenWidth, 
            this.screenHeight, 
            80 // boundaryMargin
        );
        
        // 小鱼颜色配置（包含小丑鱼）
        this.fishColors = [
            {
                name: 'clownfish',
                body: ['#ff6600', '#ff8533'],
                tail: '#ff4400',
                fins: '#ff7722',
                stripes: '#ffffff',
                hasStripes: true
            },
            {
                name: 'nemo',
                body: ['#ff5500', '#dd3300'],
                tail: '#cc2200',
                fins: '#ff6633',
                stripes: '#ffffff',
                hasStripes: true,
                blackEdge: true
            },
            {
                name: 'ocean',
                body: ['#4ecdc4', '#26a69a'],
                tail: '#26a69a',
                fins: '#6ed4d2'
            },
            {
                name: 'coral',
                body: ['#ff6b9d', '#c44569'],
                tail: '#c44569',
                fins: '#ff8fab'
            },
            {
                name: 'sunset',
                body: ['#ffa726', '#f57c00'],
                tail: '#f57c00',
                fins: '#ffb74d'
            }
        ];
        
        // 行为配置
        this.config = {
            minSpeed: 0.4,
            maxSpeed: 1.5,
            directionChangeMin: 2500,
            directionChangeMax: 7000,
            boundaryMargin: 100,
            clickEscapeSpeed: 3.0,
            clickEscapeDuration: 3500,
            schoolingDistance: 160,
            avoidanceDistance: 60
        };
        
        this.init();
    }

    init() {
        this.setupDevMode();
        this.createInitialFishes();
        this.startSwimming();
        this.setupEventListeners();
        this.setupIpcListeners();
        
        console.log('🐟 Flow Fish SVG版本初始化完成（包含小丑鱼）');
        this.notifyFishCount();
    }

    setupDevMode() {
        if (this.isDevMode) {
            const devIndicator = document.getElementById('devIndicator');
            if (devIndicator) {
                devIndicator.style.display = 'block';
                this.updateFishCountDisplay();
            }
            console.log('🔧 SVG开发模式已启用');
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('keydown', (e) => {
            if (this.isDevMode) this.handleKeyPress(e);
        });
    }

    setupIpcListeners() {
        ipcRenderer.on('add-fish', () => this.addFish());
        ipcRenderer.on('remove-fish', () => this.removeFish());
    }

    // 创建SVG小鱼元素（支持小丑鱼条纹）
    createSVGFish(colorScheme) {
        const svgNamespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNamespace, "svg");
        svg.setAttribute("viewBox", "0 0 100 60");
        svg.setAttribute("style", "overflow: visible;");
        
        const defs = document.createElementNS(svgNamespace, "defs");
        const bodyGradient = document.createElementNS(svgNamespace, "linearGradient");
        const gradientId = `fishGradient-${Date.now()}-${Math.random()}`;
        bodyGradient.setAttribute("id", gradientId);
        bodyGradient.setAttribute("x1", "0%");
        bodyGradient.setAttribute("y1", "0%");
        bodyGradient.setAttribute("x2", "100%");
        bodyGradient.setAttribute("y2", "100%");
        
        const stop1 = document.createElementNS(svgNamespace, "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", colorScheme.body[0]);
        
        const stop2 = document.createElementNS(svgNamespace, "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", colorScheme.body[1]);
        
        bodyGradient.appendChild(stop1);
        bodyGradient.appendChild(stop2);
        defs.appendChild(bodyGradient);
        svg.appendChild(defs);
        
        // 鱼身体
        const fishBody = document.createElementNS(svgNamespace, "ellipse");
        fishBody.setAttribute("class", "fish-body");
        fishBody.setAttribute("cx", "35");
        fishBody.setAttribute("cy", "30");
        fishBody.setAttribute("rx", "28");
        fishBody.setAttribute("ry", "18");
        fishBody.setAttribute("fill", `url(#${gradientId})`);
        svg.appendChild(fishBody);
        
        // 小丑鱼条纹
        if (colorScheme.hasStripes) {
            [
                { cx: 20, rx: 4, ry: 16, opacity: 0.9 },
                { cx: 35, rx: 3, ry: 15, opacity: 0.8 },
                { cx: 50, rx: 2.5, ry: 12, opacity: 0.7 }
            ].forEach(stripe => {
                const stripeElement = document.createElementNS(svgNamespace, "ellipse");
                stripeElement.setAttribute("cx", stripe.cx);
                stripeElement.setAttribute("cy", "30");
                stripeElement.setAttribute("rx", stripe.rx);
                stripeElement.setAttribute("ry", stripe.ry);
                stripeElement.setAttribute("fill", colorScheme.stripes);
                stripeElement.setAttribute("opacity", stripe.opacity);
                if (colorScheme.blackEdge) {
                    stripeElement.setAttribute("stroke", "#000");
                    stripeElement.setAttribute("stroke-width", "0.5");
                }
                svg.appendChild(stripeElement);
            });
        }
        
        // 鱼尾巴
        const fishTail = document.createElementNS(svgNamespace, "path");
        fishTail.setAttribute("class", "fish-tail");
        fishTail.setAttribute("d", "M63 30 L85 18 L80 30 L85 42 Z");
        fishTail.setAttribute("fill", colorScheme.tail);
        fishTail.setAttribute("opacity", "0.9");
        if (colorScheme.blackEdge) {
            fishTail.setAttribute("stroke", "#000");
            fishTail.setAttribute("stroke-width", "0.8");
        }
        svg.appendChild(fishTail);
        
        // 鱼鳍
        const topFin = document.createElementNS(svgNamespace, "ellipse");
        topFin.setAttribute("class", "fish-fin");
        topFin.setAttribute("cx", "25");
        topFin.setAttribute("cy", "18");
        topFin.setAttribute("rx", "12");
        topFin.setAttribute("ry", "6");
        topFin.setAttribute("fill", colorScheme.fins);
        topFin.setAttribute("opacity", "0.8");
        topFin.setAttribute("transform", "rotate(-25 25 18)");
        svg.appendChild(topFin);
        
        const bottomFin = document.createElementNS(svgNamespace, "ellipse");
        bottomFin.setAttribute("class", "fish-fin");
        bottomFin.setAttribute("cx", "30");
        bottomFin.setAttribute("cy", "42");
        bottomFin.setAttribute("rx", "10");
        bottomFin.setAttribute("ry", "5");
        bottomFin.setAttribute("fill", colorScheme.fins);
        bottomFin.setAttribute("opacity", "0.8");
        bottomFin.setAttribute("transform", "rotate(25 30 42)");
        svg.appendChild(bottomFin);
        
        // 眼睛
        const eyeBase = document.createElementNS(svgNamespace, "circle");
        eyeBase.setAttribute("cx", "22");
        eyeBase.setAttribute("cy", "25");
        eyeBase.setAttribute("r", "5");
        eyeBase.setAttribute("fill", "white");
        svg.appendChild(eyeBase);
        
        const eyePupil = document.createElementNS(svgNamespace, "circle");
        eyePupil.setAttribute("cx", "24");
        eyePupil.setAttribute("cy", "23");
        eyePupil.setAttribute("r", "2.5");
        eyePupil.setAttribute("fill", "#333");
        svg.appendChild(eyePupil);
        
        const eyeHighlight = document.createElementNS(svgNamespace, "circle");
        eyeHighlight.setAttribute("cx", "25");
        eyeHighlight.setAttribute("cy", "22");
        eyeHighlight.setAttribute("r", "1");
        eyeHighlight.setAttribute("fill", "white");
        svg.appendChild(eyeHighlight);
        
        // 如果是小丑鱼，添加嘴巴
        if (colorScheme.hasStripes) {
            const mouth = document.createElementNS(svgNamespace, "ellipse");
            mouth.setAttribute("cx", "12");
            mouth.setAttribute("cy", "28");
            mouth.setAttribute("rx", "2");
            mouth.setAttribute("ry", "1");
            mouth.setAttribute("fill", "#333");
            mouth.setAttribute("opacity", "0.6");
            svg.appendChild(mouth);
        }
        
        return svg;
    }

    createInitialFishes() {
        for (let i = 0; i < this.fishCount; i++) {
            setTimeout(() => {
                this.createSingleFish(true);
            }, i * 400);
        }
    }

    createSingleFish(isInitial = false) {
        const fish = document.createElement('div');
        fish.className = 'fish swimming';
        
        const colorScheme = this.fishColors[Math.floor(Math.random() * this.fishColors.length)];
        const svgElement = this.createSVGFish(colorScheme);
        fish.appendChild(svgElement);
        
        const margin = this.config.boundaryMargin;
        const x = margin + Math.random() * (this.screenWidth - margin * 2);
        const y = margin + Math.random() * (this.screenHeight - margin * 2);
        
        fish.style.left = x + 'px';
        fish.style.top = y + 'px';
        
        fish.fishData = {
            id: 'fish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            x, y, targetX: x, targetY: y,
            speed: this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed),
            direction: Math.random() * Math.PI * 2,
            lastDirectionChange: Date.now(),
            directionChangeInterval: this.config.directionChangeMin + 
                Math.random() * (this.config.directionChangeMax - this.config.directionChangeMin),
            isEscaping: false,
            personality: Math.random(),
            energy: 1.0,
            colorScheme: colorScheme
        };
        
        if (!isInitial) {
            fish.classList.add('spawning');
            setTimeout(() => fish.classList.remove('spawning'), 1500);
        }
        
        this.container.appendChild(fish);
        this.fishes.push(fish);
        
        // 设置初始随机朝向
        const initialAngle = Math.random() * Math.PI * 2;
        const initialDegrees = (initialAngle * 180 / Math.PI);
        fish.style.transform = `rotate(${initialDegrees}deg)`;
        
        // 启动 Anime.js 动画系统
        this.startFishAnimations(fish);
        
        fish.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onFishClick(fish);
        });
        
        console.log(`🐟 创建新SVG小鱼: ${fish.fishData.id} (${colorScheme.name})`);
        this.updateFishCountDisplay();
        this.notifyFishCount();
        
        return fish;
    }

    /**
     * 启动鱼的所有动画
     * @param {HTMLElement} fish - 鱼元素
     */
    startFishAnimations(fish) {
        // 移除 CSS 游泳动画类
        fish.classList.remove('swimming');
        
        const personality = {
            energy: fish.fishData.energy,
            speed: fish.fishData.speed,
            personality: fish.fishData.personality
        };
        
        // 启动基础游泳动画
        this.animationManager.createSwimAnimation(fish, personality);
        
        // 启动鱼尾和鱼鳍动画
        const tailElement = fish.querySelector('.fish-tail');
        const finElements = fish.querySelectorAll('.fish-fin');
        
        if (tailElement) {
            this.animationManager.createTailAnimation(tailElement, personality);
        }
        
        finElements.forEach(fin => {
            this.animationManager.createFinAnimation(fin, personality);
        });
    }

    onFishClick(fish) {
        console.log(`👆 小鱼被点击: ${fish.fishData.id}`);
        
        // 使用 Anime.js 点击反应动画
        this.animationManager.createClickReaction(fish);
        
        this.makeFishEscape(fish);
        this.scareNearbyFish(fish);
        
        if (Math.random() < 0.3) {
            this.changeFishColor(fish);
        }
    }

    changeFishColor(fish) {
        const newColorScheme = this.fishColors[Math.floor(Math.random() * this.fishColors.length)];
        fish.fishData.colorScheme = newColorScheme;
        
        const oldSvg = fish.querySelector('svg');
        const newSvg = this.createSVGFish(newColorScheme);
        fish.replaceChild(newSvg, oldSvg);
        
        console.log(`🎨 小鱼 ${fish.fishData.id} 变色为 ${newColorScheme.name}`);
    }

    makeFishEscape(fish) {
        const data = fish.fishData;
        
        data.isEscaping = true;
        data.speed = this.config.clickEscapeSpeed;
        
        const escapeAngle = Math.random() * Math.PI * 2;
        const escapeDistance = 250 + Math.random() * 350;
        
        const targetX = Math.max(this.config.boundaryMargin, 
            Math.min(data.x + Math.cos(escapeAngle) * escapeDistance, this.screenWidth - this.config.boundaryMargin));
        const targetY = Math.max(this.config.boundaryMargin, 
            Math.min(data.y + Math.sin(escapeAngle) * escapeDistance, this.screenHeight - this.config.boundaryMargin));
        
        // 使用 Anime.js 逃跑动画
        const direction = {
            x: Math.cos(escapeAngle),
            y: Math.sin(escapeAngle)
        };
        
        this.animationManager.createEscapeAnimation(fish, direction);
        
        // 同时更新目标位置用于后续移动
        data.targetX = targetX;
        data.targetY = targetY;
        
        setTimeout(() => {
            data.isEscaping = false;
            data.speed = this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed);
        }, this.config.clickEscapeDuration);
    }

    scareNearbyFish(clickedFish) {
        const clickedData = clickedFish.fishData;
        
        this.fishes.forEach(fish => {
            if (fish === clickedFish) return;
            
            const data = fish.fishData;
            const distance = this.calculateDistance(clickedData.x, clickedData.y, data.x, data.y);
            
            if (distance < this.config.schoolingDistance) {
                const scareIntensity = 1 - (distance / this.config.schoolingDistance);
                if (Math.random() < scareIntensity * 0.8) {
                    setTimeout(() => this.makeFishEscape(fish), Math.random() * 600);
                }
            }
        });
    }

    startSwimming() {
        // 启动定时器处理鱼的行为逻辑，不再处理位置动画
        this.behaviorInterval = setInterval(() => {
            this.fishes.forEach(fish => {
                this.updateFishBehavior(fish);
                // 定期检查是否需要设置新目标
                const data = fish.fishData;
                const now = Date.now();
                if (now - data.lastDirectionChange > data.directionChangeInterval) {
                    this.setNewTarget(fish);
                    data.lastDirectionChange = now;
                    data.directionChangeInterval = this.config.directionChangeMin + 
                        Math.random() * (this.config.directionChangeMax - this.config.directionChangeMin);
                }
            });
        }, 100); // 每100ms检查一次行为
        
        console.log('🌊 小鱼行为系统启动 (基于 Anime.js)');
    }

    // updateFishPosition 方法已删除，位置更新由 Anime.js 处理

    updateFishBehavior(fish) {
        const data = fish.fishData;
        
        if (data.energy < 1.0) {
            data.energy += 0.001;
        }
        
        if (!data.isEscaping && Math.random() < 0.01) {
            this.checkSchoolingBehavior(fish);
        }
        
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
            let centerX = data.x;
            let centerY = data.y;
            
            nearbyFish.forEach(nearFish => {
                centerX += nearFish.fishData.x;
                centerY += nearFish.fishData.y;
            });
            
            centerX /= (nearbyFish.length + 1);
            centerY /= (nearbyFish.length + 1);
            
            if (data.personality > 0.3) {
                const attraction = 0.3;
                data.targetX += (centerX - data.targetX) * attraction;
                data.targetY += (centerY - data.targetY) * attraction;
                
                // 使用 Anime.js 群体动画效果
                const schoolingGroup = [fish, ...nearbyFish];
                this.animationManager.createSchoolingAnimation(schoolingGroup);
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
        if (fish.fishData.isEscaping || fish.fishData.isMoving) return;
        
        const data = fish.fishData;
        data.isMoving = true;
        
        // 生成自然游动路径
        const swimmingPath = this.naturalSwimming.generateSwimmingPath(fish);
        
        console.log(`🐟 ${data.id.slice(-6)} 开始${swimmingPath.mode}模式游动，路径${swimmingPath.points.length}点，耗时${swimmingPath.duration.toFixed(1)}秒`);
        
        // 设置路径完成回调
        data.onPathComplete = () => {
            // 游动完成后，更新能量和状态
            data.energy = Math.min(1.0, data.energy + 0.05);
            data.isMoving = false;
            
            // 稍等片刻后开始下一段游动
            setTimeout(() => {
                if (!data.isEscaping) {
                    this.setNewTarget(fish);
                }
            }, 1000 + Math.random() * 3000); // 1-4秒的休息时间
        };
        
        // 开始沿路径游动
        this.animationManager.animateAlongPath(
            fish, 
            swimmingPath.points, 
            swimmingPath.duration
        );
    }

    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    addFish() {
        if (this.fishes.length >= 20) {
            console.log('🚫 小鱼数量已达上限 (20)');
            return;
        }
        
        this.createSingleFish();
        console.log('➕ 添加了一条新SVG小鱼');
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
        }, 1000);
        
        console.log('➖ 移除了一条SVG小鱼');
        this.updateFishCountDisplay();
        this.notifyFishCount();
    }

    resetFishes() {
        console.log('🔄 重置所有SVG小鱼');
        
        this.fishes.forEach(fish => {
            fish.classList.add('disappearing');
            setTimeout(() => {
                if (fish.parentNode) {
                    fish.parentNode.removeChild(fish);
                }
            }, 1000);
        });
        
        this.fishes = [];
        
        setTimeout(() => {
            this.createInitialFishes();
        }, 1200);
    }

    changeAllColors() {
        console.log('🎨 所有小鱼变色中...');
        
        this.fishes.forEach((fish, index) => {
            setTimeout(() => {
                this.changeFishColor(fish);
            }, index * 200);
        });
    }

    handleResize() {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        
        // 更新自然游动系统的屏幕尺寸
        this.naturalSwimming.updateScreenSize(this.screenWidth, this.screenHeight);
        
        console.log(`📐 屏幕尺寸变化: ${this.screenWidth}x${this.screenHeight}`);
        
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
            
            this.setNewTarget(fish);
        });
    }

    handleKeyPress(e) {
        switch (e.key.toLowerCase()) {
            case 'a': e.preventDefault(); this.addFish(); break;
            case 'r': e.preventDefault(); this.removeFish(); break;
            case 'c': e.preventDefault(); this.resetFishes(); break;
            case 'x': e.preventDefault(); this.changeAllColors(); break;
            case 's': e.preventDefault(); this.showFishStats(); break;
        }
    }

    showFishStats() {
        console.log('📊 SVG小鱼统计信息:');
        console.log(`总数: ${this.fishes.length}`);
        
        const colorStats = {};
        this.fishes.forEach((fish, index) => {
            const data = fish.fishData;
            const colorName = data.colorScheme.name;
            colorStats[colorName] = (colorStats[colorName] || 0) + 1;
            
            console.log(`小鱼 ${index + 1}: ${colorName} (位置: ${Math.round(data.x)}, ${Math.round(data.y)})`);
        });
        
        console.log('🎨 颜色分布:');
        Object.entries(colorStats).forEach(([color, count]) => {
            console.log(`  ${color}: ${count}条`);
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

// 全局辅助函数
function addFish() { window.flowFish?.addFish(); }
function removeFish() { window.flowFish?.removeFish(); }
function resetFishes() { window.flowFish?.resetFishes(); }
function changeAllColors() { window.flowFish?.changeAllColors(); }

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌊 Flow Fish SVG版本准备启动...');
    
    setTimeout(() => {
        window.flowFish = new FlowFishSVG();
        console.log('🚀 Flow Fish SVG版本已成功启动！包含小丑鱼样式');
    }, 100);
});

// 页面卸载时清理动画
window.addEventListener('beforeunload', () => {
    if (window.flowFish && window.flowFish.animationManager) {
        window.flowFish.animationManager.cleanup();
    }
    if (window.flowFish && window.flowFish.behaviorInterval) {
        clearInterval(window.flowFish.behaviorInterval);
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('💥 Flow Fish SVG版本发生错误:', e.error);
});