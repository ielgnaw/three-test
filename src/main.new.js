/**
 * @file 入口
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    /**
     * 粒子类
     *
     * @param {Object} opts 配置对象
     *
     * @return {Object} Particle 实例
     */
    function Particle(opts) {
        opts = opts || {};
        this.canvasId = opts.canvasId || '';
        this.width = opts.width || window.innerWidth;
        this.height = opts.height || window.innerHeight;
        this.imageSrc = opts.imageSrc || '';
        this.points = [];

        this.remainder = 0;

        return this;
    }

    /**
     * 开始执行
     *
     * @return {Object} Particle 实例
     */
    Particle.prototype.start = function () {
        if (!this.canvasId) {
            this.createCanvas();
        }
        else {
            this.canvas = document.getElementById(this.canvasId);
        }

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        if (this.imageSrc) {
            var me = this;
            var image = new Image();
            image.src = this.imageSrc;
            image.onload = function () {
                me.ctx.drawImage(
                    image,
                    0, 0, image.width, image.height,
                    me.canvas.width / 2 - image.width / 2, me.canvas.height / 2 - image.height / 2, image.width , image.height
                );
                // me.ctx.drawImage(image, 0, 0);
                me.getImageData();
                me.loop();
            };
        }

        return this;
    };

    /**
     * 创建当前粒子实例所对应的 canvas 元素
     *
     * @return {HTML.Element} canvas 元素
     */
    Particle.prototype.createCanvas = function () {
        var canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        this.canvas = canvas;
        return canvas;
    };

    /**
     * 获取 canvas 的 imageData 数据
     */
    Particle.prototype.getImageData = function () {
        var imageData = this.ctx.getImageData(0, 0, this.width, this.height);

        // 循环列
        for (var x = 0; x < imageData.width; x++) {
            // 循环行
            for (var y = 0; y < imageData.height; y ++) {
                var i = (y * imageData.width + x) * 4;
                if (imageData.data[i + 3] > 128) {
                // if (imageData.data[i + 3]) {
                    this.remainder++;
                    (this.remainder % 1 === 0) && this.points.push(new Point({
                        x: x,
                        y: y,
                        canvas: this.canvas
                    }));
                }
            }
        }
        this.particleLen = this.points.length;
    };

    /**
     * 循环
     *
     * @return {Object} Particle 实例
     */
    Particle.prototype.loop = function () {
        var me = this;
        requestAnimationFrame(function () {
            me.loop();
        });

        this.ctx.clearRect(0, 0, this.width, this.height);

        var i = -1;
        while (++i < this.particleLen) {
            this.points[i].update();
            this.points[i].render();
        }

        return this;
    };

    /**
     * 点的类，每个粒子都是一个点
     *
     * @param {Object} opts Point 实例
     */
    function Point(opts) {
        this.endX = opts.x || 0;
        this.endY = opts.y || 0;
        this.canvas = opts.canvas;
        this.ctx = this.canvas.getContext('2d');

        // this.x = Math.random() * this.canvas.width;
        // this.y = Math.random() * this.canvas.height;
        // this.vx = Math.random()*10 - 5;
        // this.vy = Math.random()*10 - 5;

        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.vx = 1;
        this.vy = 1;
    }

    Point.prototype.update = function () {
        // 结束点与当前点的横坐标差值
        var disX = this.endX - this.x;

        // 结束点与当前点的纵坐标差值
        var disY = this.endY - this.y;

        // 结束点与当前点两点间的距离
        var dis = Math.sqrt(Math.pow(disX, 2) + Math.pow(disY, 2));

        var force = dis * .01;

        var angle = Math.atan2(disY, disX); // atan2(x, y) 返回点(x, y)到 x 轴的弧度

        // var mouseF = 0, mouseA = 0;
        // if (mouseX > 0 && mouseY > 0) {
        //     var dis = Math.pow((this.x - mouseX), 2) + Math.pow((this.y - mouseY), 2);
        //     mouseF = Math.min(5000/dis, 5000);
        //     mouseA = Math.atan2(this.y - mouseY, this.x - mouseX);
        // } else {
        //     mouseF = 0;
        //     mouseA = 0;
        // }

        // this.vx += force * Math.cos(angle) + mouseF * Math.cos(mouseA);
        // this.vy += force * Math.sin(angle) + mouseA * Math.sin(mouseA);

        this.vx += force * Math.cos(angle);
        this.vy += force * Math.sin(angle);

        this.vx *= 0.92;
        this.vy *= 0.92;

        //
        this.x += this.vx;
        this.y += this.vy;
    };

    Point.prototype.render = function () {
        this.ctx.fillStyle = '#2d3be4';
        this.ctx.fillRect(this.x, this.y, 1, 1);
    };

    var exports = {};

    /**
     * 初始化
     */
    exports.init = function () {
        var p = new Particle({
            imageSrc: require.toUrl('./img/like.png')
        });

        p.start();
    };

    return exports;

});
