/**
 * @file Description
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var svgData = require('./svgData');

    var svgRoot = Snap('#main');

    /**
     * 执行 svg 元素的动画
     *
     * @param {Object} aniNode svg 元素
     * @param {Array} frameArray 所有动画的集合
     * @param {number} frameIndex 当前执行动画的索引
     */
    function nextFrame(aniNode, frameArray, frameIndex) {
        if (frameIndex >= frameArray.length) {
            console.warn(svgRoot.node);
            // svgRoot.node.classList.add('swing');
            return;
        }

        var curFrame = frameArray[frameIndex];

        if (curFrame.delay === void 0) {
            curFrame.delay = 0;
        }

        var t = setTimeout(function () {
            clearTimeout(t);
            aniNode.animate(
                curFrame.animation,
                curFrame.dur,
                (curFrame.easing ? curFrame.easing : mina.linear),
                function () {
                    nextFrame(aniNode, frameArray, frameIndex + 1);
                }
            );
        }, curFrame.delay);
    }

    var exports = {};

    exports.init = function () {
        var style = svgRoot.node.style;
        style.visibility = '';
        style.width = window.innerWidth + 'px';

        var path = svgRoot.path(svgData.pathData.six).attr({
            'fill-rule': 'evenodd',
            'clip-rule': 'evenodd',
            'fill': 'none',
            'stroke-miterlimit': '10',
            'opacity': 0
        });

        // path.animate({opacity: 1}, 2000);

        nextFrame(path, svgData.aniFrames, 0);


        // var $ = require('jquery');

        // var Deferred = $.Deferred;
        // var loading = new Deferred();
        // function delayed(time, value) {
        //     var loading = new Deferred();
        //     setTimeout(
        //         function() {
        //             console.log('已获取值 ' + value);
        //             loading.resolve(value);
        //             // loading.reject(value);
        //         },
        //         time
        //     );
        //     return loading.promise;
        // }

        // for (var i = 1; i <= 3; i++) {
        //     delayed(i * 1000, i);
        // }
    };

    return exports;

});
