/**
 * 自然游动系统 - 基于贝塞尔曲线和物理模拟
 */

class NaturalSwimmingSystem {
    constructor(screenWidth, screenHeight, boundaryMargin) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.boundaryMargin = boundaryMargin;
        
        // 游动模式配置
        this.swimmingPatterns = {
            // 巡游模式：大范围S形游动
            patrol: {
                curveIntensity: 0.8,
                turnRadius: 100,
                speed: 1.0,
                pattern: 'figure8' // 8字形
            },
            // 觅食模式：小范围随机游动
            foraging: {
                curveIntensity: 1.2,
                turnRadius: 50,
                speed: 0.6,
                pattern: 'random_curves' // 随机曲线
            },
            // 休息模式：缓慢漂浮
            resting: {
                curveIntensity: 0.3,
                turnRadius: 30,
                speed: 0.3,
                pattern: 'gentle_drift' // 轻柔漂移
            },
            // 探索模式：中等范围螺旋游动
            exploring: {
                curveIntensity: 0.9,
                turnRadius: 80,
                speed: 0.8,
                pattern: 'spiral' // 螺旋形
            }
        };
    }

    /**
     * 为鱼生成自然的游动路径
     * @param {Object} fish - 鱼对象
     * @returns {Array} 贝塞尔曲线控制点数组
     */
    generateSwimmingPath(fish) {
        const data = fish.fishData;
        const currentX = data.x;
        const currentY = data.y;
        
        // 根据鱼的性格选择游动模式
        const mode = this.selectSwimmingMode(data.personality, data.energy);
        const pattern = this.swimmingPatterns[mode];
        
        // 生成路径点
        let pathPoints;
        switch (pattern.pattern) {
            case 'figure8':
                pathPoints = this.generateFigure8Path(currentX, currentY, pattern);
                break;
            case 'spiral':
                pathPoints = this.generateSpiralPath(currentX, currentY, pattern);
                break;
            case 'random_curves':
                pathPoints = this.generateRandomCurvePath(currentX, currentY, pattern);
                break;
            case 'gentle_drift':
                pathPoints = this.generateDriftPath(currentX, currentY, pattern);
                break;
            default:
                pathPoints = this.generateRandomCurvePath(currentX, currentY, pattern);
        }
        
        // 确保路径在边界内
        pathPoints = this.clampPathToBounds(pathPoints);
        
        return {
            points: pathPoints,
            mode: mode,
            duration: this.calculatePathDuration(pathPoints, pattern.speed)
        };
    }

    /**
     * 根据性格选择游动模式
     */
    selectSwimmingMode(personality, energy) {
        if (energy < 0.3) return 'resting';
        if (personality > 0.8) return 'exploring';
        if (personality > 0.5) return 'patrol';
        return 'foraging';
    }

    /**
     * 生成8字形路径
     */
    generateFigure8Path(startX, startY, pattern) {
        const radius = pattern.turnRadius;
        const points = [];
        
        // 8字形需要两个圆的组合
        const centerY1 = startY - radius * 0.6;
        const centerY2 = startY + radius * 0.6;
        const centerX = startX;
        
        // 第一个圆（上半部分）
        for (let i = 0; i <= 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY1 + Math.sin(angle) * radius * 0.6;
            points.push({ x, y });
        }
        
        // 连接到第二个圆
        for (let i = 0; i <= 8; i++) {
            const angle = Math.PI + (i / 8) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY2 + Math.sin(angle) * radius * 0.6;
            points.push({ x, y });
        }
        
        return points;
    }

    /**
     * 生成螺旋形路径
     */
    generateSpiralPath(startX, startY, pattern) {
        const points = [];
        const maxRadius = pattern.turnRadius;
        const turns = 2.5; // 2.5圈
        const totalSteps = 16;
        
        for (let i = 0; i <= totalSteps; i++) {
            const progress = i / totalSteps;
            const angle = progress * Math.PI * 2 * turns;
            const radius = maxRadius * (0.3 + 0.7 * progress); // 逐渐扩大的半径
            
            const x = startX + Math.cos(angle) * radius;
            const y = startY + Math.sin(angle) * radius * 0.7; // 椭圆形
            points.push({ x, y });
        }
        
        return points;
    }

    /**
     * 生成随机曲线路径
     */
    generateRandomCurvePath(startX, startY, pattern) {
        const points = [{ x: startX, y: startY }];
        const numPoints = 6 + Math.floor(Math.random() * 4); // 6-9个点
        const radius = pattern.turnRadius;
        
        let currentX = startX;
        let currentY = startY;
        let currentAngle = Math.random() * Math.PI * 2;
        
        for (let i = 1; i < numPoints; i++) {
            // 角度有一定的随机变化，但保持连续性
            const angleChange = (Math.random() - 0.5) * Math.PI * 0.8;
            currentAngle += angleChange;
            
            // 距离也有随机性
            const distance = radius * (0.5 + Math.random() * 1.5);
            
            currentX += Math.cos(currentAngle) * distance;
            currentY += Math.sin(currentAngle) * distance;
            
            points.push({ x: currentX, y: currentY });
        }
        
        return points;
    }

    /**
     * 生成轻柔漂移路径
     */
    generateDriftPath(startX, startY, pattern) {
        const points = [];
        const radius = pattern.turnRadius;
        const numWaves = 2 + Math.random(); // 2-3个波浪
        
        for (let i = 0; i <= 12; i++) {
            const progress = i / 12;
            const x = startX + progress * radius * 2 - radius;
            const y = startY + Math.sin(progress * Math.PI * numWaves) * radius * 0.3;
            points.push({ x, y });
        }
        
        return points;
    }

    /**
     * 限制路径在边界内
     */
    clampPathToBounds(points) {
        return points.map(point => ({
            x: Math.max(this.boundaryMargin, 
                Math.min(point.x, this.screenWidth - this.boundaryMargin)),
            y: Math.max(this.boundaryMargin, 
                Math.min(point.y, this.screenHeight - this.boundaryMargin))
        }));
    }

    /**
     * 计算路径持续时间
     */
    calculatePathDuration(points, speedMultiplier) {
        let totalDistance = 0;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i-1].x;
            const dy = points[i].y - points[i-1].y;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
        }
        
        // 基于距离和速度计算持续时间（秒）
        const baseSpeed = 50; // 像素/秒
        return Math.max(3, totalDistance / (baseSpeed * speedMultiplier));
    }

    /**
     * 生成贝塞尔曲线控制点
     */
    generateBezierControlPoints(points) {
        if (points.length < 3) return points;
        
        const bezierPoints = [];
        
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            
            // 添加起点
            bezierPoints.push(current);
            
            // 计算控制点
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 控制点偏移量（创造曲线效果）
            const offset = distance * 0.3;
            const perpX = -dy / distance * offset;
            const perpY = dx / distance * offset;
            
            // 添加控制点
            bezierPoints.push({
                x: current.x + dx * 0.3 + perpX * (Math.random() - 0.5),
                y: current.y + dy * 0.3 + perpY * (Math.random() - 0.5)
            });
            
            bezierPoints.push({
                x: current.x + dx * 0.7 - perpX * (Math.random() - 0.5),
                y: current.y + dy * 0.7 - perpY * (Math.random() - 0.5)
            });
        }
        
        // 添加终点
        bezierPoints.push(points[points.length - 1]);
        
        return bezierPoints;
    }

    /**
     * 更新屏幕尺寸
     */
    updateScreenSize(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NaturalSwimmingSystem;
}