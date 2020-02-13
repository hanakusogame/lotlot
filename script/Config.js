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
var Button_1 = require("./Button");
var Config = /** @class */ (function (_super) {
    __extends(Config, _super);
    function Config(scene, x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        var _this = _super.call(this, {
            scene: scene,
            cssColor: "black",
            width: 250,
            height: 250,
            x: x,
            y: y,
            touchable: true
        }) || this;
        _this.num = 0;
        _this.volumes = [0.5, 0.8];
        _this.chkEnable = function (ev) { return true; };
        var events = [_this.bgmEvent, _this.seEvent];
        var font = new g.DynamicFont({
            game: g.game,
            fontFamily: g.FontFamily.Monospace,
            size: 32
        });
        var base = new g.FilledRect({
            scene: scene,
            x: 2, y: 2,
            width: _this.width - 4, height: _this.height - 4,
            cssColor: "white"
        });
        _this.append(base);
        base.append(new g.Label({
            scene: scene,
            font: font,
            text: "設定",
            fontSize: 24,
            textColor: "black",
            widthAutoAdjust: false,
            textAlign: g.TextAlign.Center,
            width: 250
        }));
        var line = new g.FilledRect({ scene: scene, x: 5, y: 30, width: 235, height: 2, cssColor: "#000000" });
        base.append(line);
        var strVol = ["ＢＧＭ", "効果音"];
        var _loop_1 = function (i) {
            base.append(new g.Label({
                scene: scene,
                font: font,
                text: strVol[i],
                fontSize: 24,
                textColor: "black",
                x: 10, y: 50 + 50 * i
            }));
            var sprVol = new g.FrameSprite({
                scene: scene,
                src: scene.assets["volume"],
                width: 32, height: 32,
                x: 90, y: 50 + 50 * i,
                frames: [0, 1]
            });
            base.append(sprVol);
            var baseVol = new g.E({ scene: scene, x: 130, y: 50 + 50 * i, width: 110, height: 32, touchable: true });
            base.append(baseVol);
            var lineVol = new g.FilledRect({ scene: scene, x: 0, y: 13, width: 110, height: 6, cssColor: "gray" });
            baseVol.append(lineVol);
            var cursorVol = new g.FilledRect({ scene: scene, x: 110 * this_1.volumes[i] - 7, y: 0, width: 15, height: 32, cssColor: "#000000" });
            baseVol.append(cursorVol);
            var flgMute = false;
            baseVol.pointMove.add(function (e) {
                var posX = e.point.x + e.startDelta.x;
                if (posX < 7)
                    posX = 7;
                if (posX > 103)
                    posX = 103;
                cursorVol.x = posX - 7;
                cursorVol.modified();
                flgMute = (posX - 7) === 0;
            });
            baseVol.pointUp.add(function (e) {
                if (flgMute) {
                    sprVol.frameNumber = 1;
                }
                else {
                    sprVol.frameNumber = 0;
                }
                sprVol.modified();
                _this.volumes[i] = cursorVol.x / 110;
                if (i === 0 && _this.bgmEvent !== undefined) {
                    _this.bgmEvent(_this.volumes[i]);
                }
            });
        };
        var this_1 = this;
        for (var i = 0; i < 2; i++) {
            _loop_1(i);
        }
        var colors = ["gray", "black", "white", "green", "navy"];
        var colorNum = 0;
        //背景色
        base.append(new g.Label({
            scene: scene,
            font: font,
            text: "背景色",
            fontSize: 24,
            textColor: "black",
            x: 10, y: 150
        }));
        base.append(new g.FilledRect({ scene: scene, x: 130, y: 150, width: 110, height: 40, cssColor: "#000000" }));
        var sprColor = new g.FilledRect({ scene: scene, x: 132, y: 152, width: 106, height: 36, cssColor: "gray", touchable: true });
        base.append(sprColor);
        sprColor.pointDown.add(function (e) {
            colorNum = (colorNum + 1) % colors.length;
            sprColor.cssColor = colors[colorNum];
            sprColor.modified();
            if (_this.colorEvent !== undefined) {
                _this.colorEvent(colors[colorNum]);
            }
        });
        //ランキング表示
        var btnRank = new Button_1.Button(scene, ["ランキング"], 2, 198, 130, 45);
        base.append(btnRank);
        btnRank.pushEvent = function () {
            if (typeof window !== "undefined" && window.RPGAtsumaru) {
                window.RPGAtsumaru.experimental.scoreboards.display(1);
            }
        };
        //閉じる
        var btnClose = new Button_1.Button(scene, ["閉じる"], 138, 198, 105, 45);
        base.append(btnClose);
        btnClose.pushEvent = function () {
            _this.hide();
        };
        return _this;
    }
    return Config;
}(g.FilledRect));
exports.Config = Config;
