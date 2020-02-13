"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button(scene, s, x, y, w, h) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (w === void 0) { w = 100; }
        if (h === void 0) { h = 50; }
        var _this = _super.call(this, {
            scene: scene,
            cssColor: "black",
            width: w,
            height: h,
            x: x,
            y: y,
            touchable: true
        }) || this;
        _this.num = 0;
        _this.chkEnable = function (ev) { return true; };
        _this.pushEvent = function () { };
        if (Button.font == null) {
            Button.font = new g.DynamicFont({
                game: g.game,
                fontFamily: g.FontFamily.Monospace,
                size: 32
            });
        }
        var base = new g.FilledRect({
            scene: scene,
            x: 2, y: 2,
            width: w - 4, height: h - 4,
            cssColor: "white"
        });
        _this.append(base);
        _this.label = new g.Label({
            scene: scene,
            font: Button.font,
            text: s[0],
            fontSize: 24,
            textColor: "black",
            widthAutoAdjust: false,
            textAlign: g.TextAlign.Center,
            width: w - 4
        });
        _this.label.y = (h - 4 - _this.label.height) / 2;
        _this.label.modified();
        base.append(_this.label);
        _this.pointDown.add(function (ev) {
            if (!_this.chkEnable(ev))
                return;
            base.cssColor = "gray";
            base.modified();
            if (s.length !== 1) {
                _this.num = (_this.num + 1) % s.length;
                _this.label.text = s[_this.num];
                _this.label.invalidate();
            }
        });
        _this.pointUp.add(function (ev) {
            base.cssColor = "white";
            base.modified();
            _this.pushEvent(ev);
        });
        return _this;
    }
    return Button;
}(g.FilledRect));
exports.Button = Button;
