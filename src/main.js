/**
 * @file 入口
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var motion = require('./motion');

    function callback() {
        var arr = ['heart', 'logo'];
        var index = 0;
        setTimeout(function () {
            motion.showBlock(arr[index]);
            index++;
            document.body.addEventListener('click', function (e) {
                if (index === arr.length) {
                    index = 0;
                    motion.hideBlock();
                }
                else {
                    motion.showBlock(arr[index]);
                    index++;
                }
            });
        }, 500);
    }

    var exports = {};

    /**
     * 初始化
     */
    exports.init = function () {
        motion.start(callback);
    };

    return exports;

});
