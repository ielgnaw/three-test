/**
 * @file line 模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

/* global THREE */
/* global TweenLite */

/* eslint-disable no-console */
define(function (require) {

    var easing = require('./easing');

    /**
     * 数据对象
     *
     * @type {Object}
     */
    var ASSETS = {
        heart: require('heartData'),
        logo: require('logoData')
    };

    var line = {
        isInited: false,
        isActive: false,
        isPaused: false,
        isComplete: false,
        needDeactivate: false,
        logPrefix: 'VIS:LINE - ',
        sideOffset: 90,
        maxVertices: 0,
        geo: null,
        currentShape: '',
        // shapes: ['girl','guitarist','logo','hat'],
        // shapes: ['hat', 'logo'],
        shapes: ['heart', 'logo'],
        scale: 0.9,
        timer: 0,
        onComplete: null,
        onDeactivated: null,
        checkInited: function () {
            if (!line.isInited) {
                console.warn(line.logPrefix + 'must be isInited first!');
            }
            return line.isInited;
        }
    };

    line.init = function (motion) {
        if (line.isInited) {
            console.warn(line.logPrefix + 'isInited already!');
            return;
        }
        motion.addModule(line);
        line.motion = motion;

        var maxVertices = 0;
        var i = -1;
        var len = line.shapes.length;
        while (++i < len) {
            var nm = line.shapes[i];
            line.createGeometry(nm);

            var target = ASSETS[nm + '_line_geo'].vertices;
            var verexAmount = target.length;
            if (maxVertices < verexAmount) {
                maxVertices = verexAmount;
            }
        }

        line.maxVertices = maxVertices;

        var g = new THREE.Geometry();
        line.geo = g;

        var v;
        for (var j = 0; j < maxVertices; j++) {
            v = new THREE.Vector3(0, 0, 0);
            v.target = new THREE.Vector3(0, 0, 0);
            v.start = new THREE.Vector3(0, 0, 0);
            v.delta = new THREE.Vector3(0, 0, 0);
            g.vertices.push(v);
            g.colors.push(new THREE.Color(0xffffff));
        }

        var m = new THREE.LineBasicMaterial({
            // color: '#2d3be4',
            // color: '#2d7dff',
            color: '#5375fb', // rgba(83, 117, 251, 1.00)
            linewidth: 1,
            vertexColors: THREE.VertexColors,
            transparent: true,
            opacity: 0
        });

        var l = new THREE.Line(line.geo, m);
        line.mesh = l;
        l.position.z = line.motion.cameraZ - 15;

        line.motion.scene.add(l);
        line.isInited = true;

        // test
        // line.activate();
    };

    line.activate = function () {
        if (!line.checkInited()) {
            line.init();
        }

        var v;
        var i = -1;
        var len = line.geo.vertices.length;
        while (++i < len) {
            v = line.geo.vertices[i];
            line.setLinePosition(v, i);
            line.setLinePosition(v.target, i, 0);
            line.setDeltaPositionToTarget(v);
            v.offset = 0.5;
        }

        line.isComplete = false;
        line.isActive = true;
        line.isPaused = false;
        line.mesh.visible = true;
        line.needDeactivate = false;

        line.mesh.material.opacity = 0;

        TweenLite.to(line.mesh.material, 1, {
            opacity: 1,
            ease: easing.Quad.easeOut
        });
    };

    /**
     * 非激活
     */
    line.deactivate = function () {
        if (!line.checkInited()) {
            return;
        }

        if (!line.mesh.visible) {
            console.warn(line.logPrefix + 'is unactive already!');
            return;
        }
        // console.log('line.currentShape: ', line.currentShape);
        if (line.currentShape === '') {
            line._deactivate();
        }
        else {
            line.needDeactivate = true;
            line.setTarget('');
        }
        line.isActive = false;
    };

    /**
     * 非激活的动效
     */
    line._deactivate = function () {
        TweenLite.to(line.mesh.material, 0.15, {
            opacity: 0,
            ease: easing.Quad.easeIn,
            onComplete: function () {
                if (line.onDeactivated) {
                    line.onDeactivated();
                }
                line.mesh.visible = false;
                line.isPaused = true;
            }
        });
    };

    line.update = function (delta) {
        if (!line.isInited || line.isPaused) {
            return;
        }

        line.mesh.position.x = line.motion.viewCoefX * 0.8;
        line.mesh.position.y = -line.motion.viewCoefY * 0.4;

        if (line.isComplete) {
            return;
        }

        var readyCount = 0;
        var v;
        for (var i = 1; i < line.geo.vertices.length - 1; i++) {
            v = line.geo.vertices[i];
            // console.warn(v);
            var vs = v.start;
            var vd = v.delta;
            var d = 1;
            v.offset += 0.78 * delta; // 0.013

            if (v.offset < 1.05) {
                var o = Math.min(1, Math.max(0, v.offset));
                d = easing.Elastic.easeInOut(o, 0, 1, 1);
            }
            else {
                readyCount++;
            }

            v.x = vs.x + vd.x * d;
            v.y = vs.y + vd.y * d;
            // v.z = vs.z + vd.z * d;

            // var col = Math.min(Math.max(0, 1 + v.z * 1.5), 1);
            // line.geo.colors[i].setRGB(col, col, col, col);
        }

        if (readyCount >= line.geo.vertices.length - 2 && !line.isComplete) {
            line.isComplete = true;
            if (line.needDeactivate) {
                line._deactivate();
            }
            else {
                if (line.onComplete) {
                    line.onComplete();
                }
            }
        }

        line.geo.verticesNeedUpdate = true;
        line.geo.colorsNeedUpdate = true;
    };

    line.change = function () {
        if (!line.checkInited()) {
            return;
        }

        if (line.currentShape) {
            line.setTarget('');
        }
        else {
            line.setTarget(line.shapes[~~(Math.random() * line.shapes.length)]);
        }
    };

    line.setTarget = function (id) {
        if (!line.checkInited()) {
            return;
        }

        if (id === line.currentShape) {
            console.warn(line.logPrefix + 'image (#' + id + ') is shown already!');
            return;
        }

        line.currentShape = id;

        var curVertices = line.geo.vertices;
        var curVerticesLen = curVertices.length;

        var speed = 0.2;

        line.isComplete = false;

        var cv;

        // no image
        if (id === '') {
            speed /= 2;

            for (var i = 0; i < curVerticesLen; i++) {
                cv = curVertices[i];
                line.setLinePosition(cv.target, i, 0);
                line.setDeltaPositionToTarget(cv);
                cv.offset = 0;
            }

            return;
        }

        // image received
        var target = ASSETS[id + '_line_geo'].vertices;
        var targetAmount = target.length;
        var coef = targetAmount / line.maxVertices;

        var v;

        for (var j = 0; j < curVerticesLen; j++) {
            cv = curVertices[j];
            v = cv.target;

            var ti = Math.floor(j * coef);
            var tv = target[ti];

            v.x = tv.x;
            v.y = tv.y;
            v.z = tv.z;

            line.setDeltaPositionToTarget(cv);
            cv.offset = -Math.abs(j / curVerticesLen * 2 - 1) * speed / 10;
        }
    };

    line.createGeometry = function (name) {
        var g = new THREE.Geometry();
        var assetObj = ASSETS[name];
        var asset = assetObj.data;
        var offsetX = assetObj.offsetX;
        var offsetY = assetObj.offsetY;
        var step = 3;

        for (var i = step; i < asset.length; i += step) {
            if (name === 'logo') {
                // console.warn(asset[i], asset[i + 1], asset[i + 2]);
                // console.warn();
            }
            var v = new THREE.Vector3(asset[i], asset[i + 1], asset[i + 2]).multiplyScalar(line.scale);
            v.x += offsetX;
            v.y += offsetY;
            g.vertices.push(v);
        }

        ASSETS[name + '_line_geo'] = g;

        return g;
    };

    line.setLinePosition = function (v, indx, y) {
        var p = indx / this.maxVertices * 2 - 1;
        v.x = p * this.sideOffset;
        v.y = (y !== undefined ? y : Math.sin(v.x / 2) * (1 - Math.abs(p)) * 50);
        v.z = 0;
    };

    line.setDeltaPositionToTarget = function (v) {
        v.start.x = v.x;
        v.start.y = v.y;
        v.start.z = v.z;
        v.delta.x = v.target.x - v.x; // delta movement
        v.delta.y = v.target.y - v.y;
        v.delta.z = v.target.z - v.z;
    };

    return line;
});

/* eslint-enable no-console */
