/**
 * Flow Fish Animation Manager - 基于 Anime.js 的动画管理系统
 */

// 在 Electron 环境中，anime 是通过 script 标签引入的全局变量
// const anime = require('animejs'); // 移除这行，使用全局的 anime

class FishAnimationManager {
    constructor() {
        this.activeAnimations = new Map(); // 存储活动动画
        this.animationQueue = []; // 动画队列
        this.globalSettings = {
            performanceMode: 'high', // high, medium, low
            maxConcurrentAnimations: 50,
            enableParticles: true,
            enableAdvancedEffects: true
        };
    }

    /**
     * 初始化动画管理器
     */
    init() {
        this.detectPerformance();
        console.log('🎬 FishAnimationManager 初始化完成');
    }

    /**
     * 检测设备性能并调整设置
     */
    detectPerformance() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            this.globalSettings.performanceMode = 'low';
        } else {
            // 基于可用内存和CPU估算性能
            const memoryInfo = performance.memory || {};
            const usedMemory = memoryInfo.usedJSHeapSize || 0;
            const totalMemory = memoryInfo.totalJSHeapSize || 0;
            
            if (totalMemory > 100 * 1024 * 1024) { // 100MB+
                this.globalSettings.performanceMode = 'high';
            } else if (totalMemory > 50 * 1024 * 1024) { // 50MB+
                this.globalSettings.performanceMode = 'medium';
                this.globalSettings.maxConcurrentAnimations = 30;
            } else {
                this.globalSettings.performanceMode = 'low';
                this.globalSettings.maxConcurrentAnimations = 20;
                this.globalSettings.enableParticles = false;
                this.globalSettings.enableAdvancedEffects = false;
            }
        }
        
        console.log(`🔍 性能模式: ${this.globalSettings.performanceMode}`);
    }

    /**
     * 创建基础游泳动画
     * @param {HTMLElement} fishElement - 鱼元素
     * @param {Object} personality - 鱼的性格参数
     */
    createSwimAnimation(fishElement, personality = {}) {
        const animationId = `swim_${fishElement.fishData.id}`;
        
        // 清理旧动画
        this.stopAnimation(animationId);
        
        // 基于性格调整动画参数
        const intensity = 0.5 + (personality.energy || 0.5) * 0.5;
        const speed = personality.speed || 1.0;
        const baseAmplitude = this.globalSettings.performanceMode === 'high' ? 8 : 5;
        
        const animation = anime({
            targets: fishElement,
            translateY: [
                { value: -baseAmplitude * intensity, duration: 1500 / speed, easing: 'easeInOutSine' },
                { value: 0, duration: 1500 / speed, easing: 'easeInOutSine' },
                { value: baseAmplitude * intensity, duration: 1500 / speed, easing: 'easeInOutSine' },
                { value: 0, duration: 1500 / speed, easing: 'easeInOutSine' }
            ],
            rotate: [
                { value: 3 * intensity, duration: 1500 / speed },
                { value: 0, duration: 1500 / speed },
                { value: -3 * intensity, duration: 1500 / speed },
                { value: 0, duration: 1500 / speed }
            ],
            loop: true,
            autoplay: true,
            delay: () => anime.random(0, 2000),
            complete: () => {
                // 动画完成后清理
                this.activeAnimations.delete(animationId);
            }
        });
        
        this.activeAnimations.set(animationId, animation);
        return animation;
    }

    /**
     * 创建鱼尾摆动动画
     * @param {HTMLElement} tailElement - 鱼尾元素
     * @param {Object} personality - 性格参数
     */
    createTailAnimation(tailElement, personality = {}) {
        const animationId = `tail_${Date.now()}_${Math.random()}`;
        
        const intensity = 0.5 + (personality.energy || 0.5) * 0.5;
        const speed = personality.speed || 1.0;
        const rotationRange = this.globalSettings.performanceMode === 'high' ? 12 : 8;
        
        const animation = anime({
            targets: tailElement,
            rotate: [
                { value: -rotationRange * intensity, duration: 800 / speed, easing: 'easeInOutQuart' },
                { value: rotationRange * intensity, duration: 800 / speed, easing: 'easeInOutQuart' }
            ],
            scaleX: [
                { value: 0.85, duration: 400 / speed },
                { value: 1, duration: 400 / speed }
            ],
            loop: true,
            direction: 'alternate',
            complete: () => {
                this.activeAnimations.delete(animationId);
            }
        });
        
        this.activeAnimations.set(animationId, animation);
        return animation;
    }

    /**
     * 创建鱼鳍摆动动画
     * @param {HTMLElement} finElement - 鱼鳍元素
     * @param {Object} personality - 性格参数
     */
    createFinAnimation(finElement, personality = {}) {
        const animationId = `fin_${Date.now()}_${Math.random()}`;
        
        const intensity = 0.3 + (personality.energy || 0.5) * 0.4;
        const speed = personality.speed || 1.0;
        const rotationRange = this.globalSettings.performanceMode === 'high' ? 15 : 10;
        
        const animation = anime({
            targets: finElement,
            rotate: [
                { value: 0, duration: 900 / speed },
                { value: rotationRange * intensity, duration: 900 / speed, easing: 'easeInOutSine' },
                { value: 0, duration: 900 / speed }
            ],
            loop: true,
            delay: anime.random(0, 1000),
            complete: () => {
                this.activeAnimations.delete(animationId);
            }
        });
        
        this.activeAnimations.set(animationId, animation);
        return animation;
    }

    /**
     * 创建点击反应动画
     * @param {HTMLElement} fishElement - 鱼元素
     */
    createClickReaction(fishElement) {
        const animationId = `click_${fishElement.fishData.id}`;
        
        // 停止当前游泳动画
        this.pauseSwimAnimation(fishElement);
        
        const timeline = anime.timeline({
            complete: () => {
                // 动画完成后恢复游泳
                setTimeout(() => {
                    this.resumeSwimAnimation(fishElement);
                }, 500);
                this.activeAnimations.delete(animationId);
            }
        });
        
        timeline
            .add({
                targets: fishElement,
                scale: [1, 2.2],
                rotate: '1turn',
                duration: 400,
                easing: 'easeOutElastic(1, .8)'
            })
            .add({
                targets: fishElement,
                scale: [2.2, 1],
                duration: 600,
                easing: 'easeOutBounce'
            });
        
        this.activeAnimations.set(animationId, timeline);
        return timeline;
    }

    /**
     * 创建逃跑动画
     * @param {HTMLElement} fishElement - 鱼元素
     * @param {Object} direction - 逃跑方向 {x, y}
     */
    createEscapeAnimation(fishElement, direction) {
        const animationId = `escape_${fishElement.fishData.id}`;
        
        // 暂停游泳动画
        this.pauseSwimAnimation(fishElement);
        
        const timeline = anime.timeline({
            complete: () => {
                // 逃跑完成后恢复游泳
                setTimeout(() => {
                    this.resumeSwimAnimation(fishElement);
                }, 1000);
                this.activeAnimations.delete(animationId);
            }
        });
        
        // 立即更新朝向到逃跑方向
        this.updateFishDirection(fishElement, direction.x, direction.y);
        
        timeline
            .add({
                targets: fishElement,
                translateX: direction.x * 100,
                translateY: direction.y * 100,
                scale: [1, 0.7, 1.2],
                duration: 300,
                easing: 'easeOutQuart'
            });
        
        // 添加尾巴急速摆动
        const tail = fishElement.querySelector('.fish-tail');
        if (tail) {
            timeline.add({
                targets: tail,
                rotate: [0, -30, 30, -20, 20, 0],
                duration: 300,
                easing: 'easeInOutSine'
            }, 0);
        }
        
        this.activeAnimations.set(animationId, timeline);
        return timeline;
    }

    /**
     * 创建群体聚集动画
     * @param {Array} fishElements - 鱼群元素数组
     */
    createSchoolingAnimation(fishElements) {
        if (!this.globalSettings.enableAdvancedEffects) return;
        
        const animationId = `schooling_${Date.now()}`;
        
        const animation = anime({
            targets: fishElements,
            scale: [1, 1.1, 1],
            filter: [
                'drop-shadow(0 0 10px rgba(116, 185, 255, 0.4))',
                'drop-shadow(0 0 20px rgba(116, 185, 255, 0.8))',
                'drop-shadow(0 0 10px rgba(116, 185, 255, 0.4))'
            ],
            duration: 2000,
            easing: 'easeInOutSine',
            delay: (el, i) => i * 100,
            complete: () => {
                this.activeAnimations.delete(animationId);
            }
        });
        
        this.activeAnimations.set(animationId, animation);
        return animation;
    }

    /**
     * 沿自然路径游动
     * @param {HTMLElement} fishElement - 鱼元素  
     * @param {Array} pathPoints - 路径点数组
     * @param {number} duration - 动画持续时间（秒）
     */
    animateAlongPath(fishElement, pathPoints, duration) {
        if (!pathPoints || pathPoints.length < 2) return;
        
        const animationId = `path_${fishElement.fishData.id}`;
        this.stopAnimation(animationId);
        
        // 创建路径动画
        const pathValues = pathPoints.map(point => [point.x, point.y]);
        
        const animation = anime({
            targets: fishElement,
            left: pathValues.map(p => p[0]),
            top: pathValues.map(p => p[1]),
            duration: duration * 1000, // 转换为毫秒
            easing: 'easeInOutSine', // 更自然的缓动
            direction: 'normal',
            loop: false,
            update: (anim) => {
                // 计算当前方向向量来更新鱼的朝向
                const progress = anim.progress / 100;
                const currentIndex = Math.floor(progress * (pathPoints.length - 1));
                const nextIndex = Math.min(currentIndex + 1, pathPoints.length - 1);
                
                if (currentIndex < nextIndex) {
                    // 使用完整的方向向量更新朝向
                    this.updateFishDirectionFromPoints(
                        fishElement,
                        pathPoints[currentIndex],
                        pathPoints[nextIndex]
                    );
                }
            },
            complete: () => {
                this.activeAnimations.delete(animationId);
                // 更新鱼的数据位置
                const lastPoint = pathPoints[pathPoints.length - 1];
                fishElement.fishData.x = lastPoint.x;
                fishElement.fishData.y = lastPoint.y;
                fishElement.fishData.isMoving = false;
                
                // 通知游动完成
                if (fishElement.fishData.onPathComplete) {
                    fishElement.fishData.onPathComplete();
                }
            }
        });
        
        this.activeAnimations.set(animationId, animation);
        return animation;
    }

    /**
     * 平滑移动到目标位置（保留原方法用于简单移动）
     * @param {HTMLElement} fishElement - 鱼元素
     * @param {number} targetX - 目标X坐标
     * @param {number} targetY - 目标Y坐标
     */
    animateToTarget(fishElement, targetX, targetY) {
        const animationId = `move_${fishElement.fishData.id}`;
        
        const currentX = parseFloat(fishElement.style.left) || 0;
        const currentY = parseFloat(fishElement.style.top) || 0;
        
        const animation = anime({
            targets: fishElement,
            left: [currentX, targetX],
            top: [currentY, targetY],
            duration: 2000,
            easing: 'easeInOutQuart',
            update: (anim) => {
                // 动态调整朝向 - 使用完整方向向量
                const deltaX = targetX - currentX;
                const deltaY = targetY - currentY;
                this.updateFishDirection(fishElement, deltaX, deltaY);
            },
            complete: () => {
                this.activeAnimations.delete(animationId);
                fishElement.fishData.x = targetX;
                fishElement.fishData.y = targetY;
                fishElement.fishData.isMoving = false;
            }
        });
        
        this.activeAnimations.set(animationId, animation);
        return animation;
    }

    /**
     * 更新鱼的朝向 - 基于移动向量的角度计算
     * @param {HTMLElement} fishElement - 鱼元素
     * @param {number} deltaX - X轴移动量
     * @param {number} deltaY - Y轴移动量（可选）
     */
    updateFishDirection(fishElement, deltaX, deltaY = 0) {
        // 避免在静止时更新朝向
        if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1) return;
        
        // 计算移动角度（弧度）
        const angle = Math.atan2(deltaY, deltaX);
        // 转换为度数
        let degrees = (angle * 180 / Math.PI);
        
        // 获取当前角度（如果有的话）
        const currentTransform = fishElement.style.transform || '';
        const rotateMatch = currentTransform.match(/rotate\(([^)]+)deg\)/);
        const currentDegrees = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
        
        // 计算角度差，处理360度循环
        let angleDiff = degrees - currentDegrees;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        
        // 如果角度变化很小，就不更新（避免抖动）
        if (Math.abs(angleDiff) < 5) return;
        
        // 平滑角度变化：大角度变化时限制转动速度
        if (Math.abs(angleDiff) > 45) {
            degrees = currentDegrees + Math.sign(angleDiff) * 45;
        }
        
        // 移除现有的旋转，保留其他transform
        const cleanTransform = currentTransform.replace(/rotate\([^)]*\)/g, '').trim();
        
        // 应用新的旋转角度
        const newTransform = cleanTransform + ` rotate(${degrees.toFixed(1)}deg)`;
        fishElement.style.transform = newTransform.trim();
        
        // 同时更新CSS类用于兼容
        if (deltaX > 0.1) {
            fishElement.classList.remove('turning-left');
            fishElement.classList.add('turning-right');
        } else if (deltaX < -0.1) {
            fishElement.classList.remove('turning-right');
            fishElement.classList.add('turning-left');
        }
    }
    
    /**
     * 基于两点计算并更新鱼的朝向
     * @param {HTMLElement} fishElement - 鱼元素
     * @param {Object} fromPoint - 起点 {x, y}
     * @param {Object} toPoint - 终点 {x, y}
     */
    updateFishDirectionFromPoints(fishElement, fromPoint, toPoint) {
        const deltaX = toPoint.x - fromPoint.x;
        const deltaY = toPoint.y - fromPoint.y;
        this.updateFishDirection(fishElement, deltaX, deltaY);
    }

    /**
     * 暂停游泳动画
     * @param {HTMLElement} fishElement - 鱼元素
     */
    pauseSwimAnimation(fishElement) {
        const animationId = `swim_${fishElement.fishData.id}`;
        const animation = this.activeAnimations.get(animationId);
        if (animation) {
            animation.pause();
        }
    }

    /**
     * 恢复游泳动画
     * @param {HTMLElement} fishElement - 鱼元素
     */
    resumeSwimAnimation(fishElement) {
        const animationId = `swim_${fishElement.fishData.id}`;
        const animation = this.activeAnimations.get(animationId);
        if (animation) {
            animation.play();
        } else {
            // 如果动画不存在，重新创建
            this.createSwimAnimation(fishElement, fishElement.fishData);
        }
    }

    /**
     * 停止指定动画
     * @param {string} animationId - 动画ID
     */
    stopAnimation(animationId) {
        const animation = this.activeAnimations.get(animationId);
        if (animation) {
            animation.pause();
            this.activeAnimations.delete(animationId);
        }
    }

    /**
     * 停止元素的所有动画
     * @param {HTMLElement} element - 目标元素
     */
    stopAllAnimations(element) {
        if (element && element.fishData) {
            const fishId = element.fishData.id;
            const animationsToStop = [];
            
            for (let [id, animation] of this.activeAnimations) {
                if (id.includes(fishId)) {
                    animationsToStop.push(id);
                }
            }
            
            animationsToStop.forEach(id => this.stopAnimation(id));
        }
    }

    /**
     * 清理所有动画
     */
    cleanup() {
        for (let [id, animation] of this.activeAnimations) {
            animation.pause();
        }
        this.activeAnimations.clear();
        console.log('🧹 动画管理器已清理');
    }

    /**
     * 获取性能统计
     */
    getStats() {
        return {
            activeAnimations: this.activeAnimations.size,
            performanceMode: this.globalSettings.performanceMode,
            maxConcurrentAnimations: this.globalSettings.maxConcurrentAnimations,
            enableParticles: this.globalSettings.enableParticles,
            enableAdvancedEffects: this.globalSettings.enableAdvancedEffects
        };
    }
}

// 导出类
module.exports = FishAnimationManager;