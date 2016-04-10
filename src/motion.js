/**
 * @file 动画模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

/* global THREE */

define(function (require) {

    var $ = require('jquery');
    var line = require('./line');

    /**
     * 动画主体对象
     *
     * @type {Object}
     */
    var motion = {
        mouseX: 5,
        mouseY: 5,
        mouseXT: 0,
        mouseYT: 0,
        viewCoefX: 0,
        viewCoefY: 0,
        stageW: 0,
        stageWH: 0,
        stageH: 0,
        stageHH: 0,
        cameraY: 4,
        cameraZ: 130,
        cameraFov: 90,
        minWidth: 1000,
        domContainer: '#main',
        lockCamera: false,
        mods: [],
        /* eslint-disable fecs-camelcase*/
        __mid_fps: 0,
        __mid_fps_count: 0,
        __cam_coef: 16,
        /* eslint-enable fecs-camelcase*/
        mousePositionDebug: true,

        addModule: function (module) {
            motion.mods.push(module);
        },

        initModules: function () {
            var i = -1;
            var len = motion.mods.length;
            while (++i < len) {
                var module = motion.mods[i];
                // console.log('autoinit: ',module.is_autoinited);
                if (module.is_autoinited) {
                    module.init();
                }
            }
        },

        updateModules: function (delta) {
            var i = -1;
            var len = motion.mods.length;
            while (++i < len) {
                // console.warn(delta);
                motion.mods[i].update(delta);
            }
        }
    };

    /**
     * resize 事件回调
     */
    function resizeHandler() {
        var w = window.innerWidth;
        if (w < motion.minWidth) {
            w = motion.minWidth;
        }
        motion.camera.aspect = w / window.innerHeight;
        motion.camera.updateProjectionMatrix();
        motion.renderer.setSize(w, window.innerHeight);

        motion.stageW = w;
        motion.stageWH = motion.stageW / 2;

        motion.stageH = window.innerHeight;
        motion.stageHH = motion.stageH / 2;

        motion.stageCoef = Math.max(0, motion.stageW / motion.stageH - 1.8);
        motion.camera.position.z = motion.cameraZ + motion.stageCoef * 10;
        motion.camera.fov = motion.cameraFov - motion.stageCoef * 18;
    }

    /**
     * 启动
     *
     * @param {Function} callback 启动的回调函数
     */
    motion.start = function (callback) {

        // 实例化场景
        this.scene = new THREE.Scene();

        // 实例化透视投影的摄像机
        // THREE.PerspectiveCamera(fov, aspect, near, far)
        // fov: 视景体竖直方向上的张角（是角度制而非弧度制）
        // aspect: 是照相机水平方向和竖直方向长度的比值，通常设为 Canvas 的横纵比例。
        // near: 照相机到视景体最近的距离，正值
        // far: 照相机到视景体最远的距离，正值，far 应大于 near。
        this.camera = new THREE.PerspectiveCamera(this.cameraFov, window.innerWidth / window.innerHeight, 0.1, 1000);

        // 设置摄像机的位置
        this.camera.position.set(0, this.cameraY, this.cameraZ);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor('#fff');

        this.clock = new THREE.Clock();

        $(this.domContainer).append(this.renderer.domElement).css({
            position: 'relative',
            width: '100%',
            height: '100%',
            zIndex: -1
        });

        this.renderScene();

        // document.addEventListener('mousemove', function (e) {
        //     e = e || window.e;
        //     if (e.pageX == null && e.clientX != null) {
        //         var eventDoc = (e.target && e.target.ownerDocument) || document;
        //         var doc = eventDoc.documentElement;
        //         var body = eventDoc.body;

        //         e.pageX = e.clientX
        //             + (doc && doc.scrollLeft || body && body.scrollLeft || 0)
        //             - (doc && doc.clientLeft || body && body.clientLeft || 0);
        //         e.pageY = e.clientY
        //             + (doc && doc.scrollTop  || body && body.scrollTop  || 0)
        //             - (doc && doc.clientTop  || body && body.clientTop  || 0 );
        //     }
        //     motion.mouseX = e.pageX;
        //     motion.mouseY = e.pageY;
        // });

        window.addEventListener('resize', resizeHandler);
        resizeHandler();

        this.mouseX = this.mouseXT = this.stageWH;
        this.mouseY = this.mouseYT = this.stageHH;

        this.initModules();

        if (this.mousePositionDebug) {
            var sphereG = new THREE.SphereGeometry(2, 8, 8);
            var material = new THREE.MeshBasicMaterial({color: '#f00'});
            var mousePosSphere = new THREE.Mesh(sphereG, material);
            this.mousePosSphere = mousePosSphere;
            this.scene.add(mousePosSphere);
        }

        line.init(motion);

        callback && typeof callback === 'function' && callback();
    };

    /**
     * 渲染场景
     */
    motion.renderScene = function () {
        window.requestAnimationFrame(this.renderScene.bind(this));

        var delta = this.clock.getDelta();
        /* eslint-disable fecs-camelcase*/
        var _fps = 1000 / delta / 1000;

        this.__mid_fps += _fps;
        this.__mid_fps_count++;

        if (this.__mid_fps_count > 60) {
            var _fps_mid = this.__mid_fps / this.__mid_fps_count;
            this.__cam_coef = (_fps_mid > 40) ? 16 : 8;
            this.__mid_fps_count = 0;
            this.__mid_fps = 0;
        }
        /* eslint-enable fecs-camelcase*/

        var mx = this.mouseX;
        var my = this.mouseY;
        if (this.lockCamera) {
            mx = this.stageWH;
            my = this.stageHH;
        }

        this.mouseXT += (mx - this.mouseXT) / this.__cam_coef;
        this.mouseYT += (my - this.mouseYT) / this.__cam_coef;
        this.viewCoefX = (this.mouseXT - this.stageWH) / this.stageWH;
        this.viewCoefY = (this.mouseYT - this.stageHH) / this.stageHH;

        this.camera.rotation.y = this.viewCoefX / this.__cam_coef;
        this.camera.rotation.x = this.viewCoefY / this.__cam_coef;

        this.updateModules(delta);

        this.renderer.render(this.scene, this.camera);
    };

    motion.showBlock = function (name) {
        var delay = 1000;

        if (!line.isActive) {
            line.activate();
            line.onComplete = function () {
                line.onComplete = undefined;
                line.setTarget(name);
            };
            delay += 500;
        }
        else {
            line.setTarget(name);
        }
    };

    motion.hideBlock = function () {
        line.deactivate();
    };

    return motion;
});
