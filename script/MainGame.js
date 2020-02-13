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
//メインのゲーム画面
var MainGame = /** @class */ (function (_super) {
    __extends(MainGame, _super);
    function MainGame(scene) {
        var _this = this;
        var tl = require("@akashic-extension/akashic-timeline");
        var timeline = new tl.Timeline(scene);
        var sizeW = 500;
        var sizeH = 360;
        _this = _super.call(this, { scene: scene, x: 0, y: 0, width: sizeW, height: sizeH }) || this;
        var bg = new g.FilledRect({
            scene: scene,
            width: 640,
            height: 360,
            cssColor: "black",
            opacity: 0.5
        });
        _this.append(bg);
        var base = new g.E({
            scene: scene,
            x: 50, y: -7,
            width: 640,
            height: 360,
            touchable: true
        });
        _this.append(base);
        var ballW = 29;
        var ballH = 24;
        var ballSize = sizeH / ballH;
        var balls = [];
        var walls = [];
        var wallsOut = [[], [], [], []];
        var srcX = -1;
        var srcY = -1;
        var srcArea;
        //ボールの作成
        var colors = ["black", "cyan", "orange"];
        for (var y = 0; y < ballH + 1; y++) {
            balls[y] = [];
            for (var x = 0; x < ballW; x++) {
                var num = (((x % 6) === 2 && !(x > 2 && x < 26 && y < 2) || ((y % 5) === 2 && x > 2 && x <= 26))) ? 2 : 0;
                var ball = new g.FrameSprite({
                    scene: scene,
                    src: scene.assets["ball"],
                    x: x * ballSize,
                    y: y * ballSize,
                    width: ballSize,
                    height: ballSize,
                    tag: num,
                    frames: [0, 1, 2, 3, 4],
                    frameNumber: num
                });
                base.append(ball);
                balls[y][x] = ball;
            }
        }
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 4; x++) {
                //上下の壁
                var p = x * 6 + 3;
                if (y === 0) {
                    wallsOut[0].push([]);
                    for (var j = 0; j < 5; j++) {
                        wallsOut[0][wallsOut[0].length - 1].push(balls[y * 5 + 2][p + j]);
                    }
                }
                else if (y === 4) {
                    wallsOut[1].push([]);
                    for (var j = 0; j < 5; j++) {
                        wallsOut[1][wallsOut[1].length - 1].push(balls[y * 5 + 2][p + j]);
                    }
                }
                else {
                    walls.push([]);
                    for (var j = 0; j < 5; j++) {
                        walls[walls.length - 1].push(balls[y * 5 + 2][p + j]);
                    }
                }
            }
        }
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 5; x++) {
                //横の壁
                var p = x * 6 + 3;
                if (x === 0) {
                    wallsOut[2].push([]);
                    for (var j = 0; j < 4; j++) {
                        wallsOut[2][wallsOut[2].length - 1].push(balls[y * 5 + 3 + j][p - 1]);
                    }
                }
                else if (x === 4) {
                    wallsOut[3].push([]);
                    for (var j = 0; j < 4; j++) {
                        wallsOut[3][wallsOut[3].length - 1].push(balls[y * 5 + 3 + j][p - 1]);
                    }
                }
                else {
                    walls.push([]);
                    for (var j = 0; j < 4; j++) {
                        walls[walls.length - 1].push(balls[y * 5 + 3 + j][p - 1]);
                    }
                }
            }
        }
        //選択領域の作成
        var selectAreas = [];
        var _loop_1 = function (y) {
            var _loop_2 = function (x) {
                var spr = new g.FrameSprite({
                    scene: scene,
                    src: scene.assets["area"],
                    width: ballSize * 6,
                    height: ballSize * 5,
                    x: (ballSize * 6) * x + (ballSize * 2) + (ballSize / 2),
                    y: (ballSize * 5) * y + (ballSize * 2) + (ballSize / 2),
                    frames: [0, 1, 2],
                    touchable: true,
                    frameNumber: 0
                });
                base.append(spr);
                selectAreas.push(spr);
                spr.pointDown.add(function () {
                    if (!scene.isStart || isStop)
                        return;
                    if (srcX === -1) {
                        spr.frameNumber = 1;
                        spr.modified();
                        srcX = x;
                        srcY = y;
                        srcArea = spr;
                    }
                    else {
                        var a_1 = srcArea;
                        changeBalls(x, y);
                        spr.frameNumber = 2;
                        spr.modified();
                        timeline.create().wait(200).call(function () {
                            spr.frameNumber = 0;
                            spr.modified();
                            a_1.frameNumber = 0;
                            a_1.modified();
                        });
                    }
                    scene.playSound("se_move");
                });
            };
            for (var x = 0; x < 4; x++) {
                _loop_2(x);
            }
        };
        for (var y = 0; y < 4; y++) {
            _loop_1(y);
        }
        //加算するスコアの表示
        var listScore = [20, 30, 0, 50, 30, 20];
        var labelScores = [];
        for (var i = 0; i < 6; i++) {
            var label = new g.FrameSprite({
                scene: scene,
                src: scene.assets["number"],
                x: i * ballSize * 6 + 16,
                y: 325,
                width: 48,
                height: 36,
                frames: [i, i + 6]
            });
            _this.append(label);
            labelScores.push(label);
        }
        var changeBalls = function (px, py) {
            for (var y = 0; y < 4; y++) {
                for (var x = 0; x < 5; x++) {
                    var dstBall = balls[py * 5 + y + 3][px * 6 + x + 3];
                    var srcBall = balls[srcY * 5 + y + 3][srcX * 6 + x + 3];
                    var bkTag = srcBall.tag;
                    setBall(srcBall, dstBall.tag);
                    setBall(dstBall, bkTag);
                }
            }
            srcX = -1;
        };
        var setBall = function (ball, num) {
            ball.tag = num;
            ball.frameNumber = num;
            ball.modified();
        };
        var frameCnt = 0;
        var openWallNums = [-1, -1];
        var openWallOutNum = [-1, -1, -1, -1];
        var isGameover = false;
        var missCnt = 0;
        _this.update.add(function () {
            if (!scene.isStart || isGameover)
                return;
            if ((frameCnt % 2) === 0) {
                if (balls[0][3].tag === 0) {
                    setBall(balls[0][3], 1);
                }
                if (balls[0][25].tag === 0) {
                    setBall(balls[0][25], 1);
                }
                for (var y = ballH; y >= 0; y--) {
                    for (var xx = 1; xx < ballW - 1; xx++) {
                        var x = (scene.random.get(0, 1) === 0) ? xx : ballW - xx - 1;
                        if (balls[y][x].tag !== 0)
                            continue;
                        if (y !== 0 && balls[y - 1][x].tag === 1) {
                            setBall(balls[y][x], 1);
                            setBall(balls[y - 1][x], 0);
                        }
                        else {
                            if (balls[y][x - 1].tag === 1 && balls[y][x + 1].tag === 1) {
                                if (scene.random.get(0, 1) === 0) {
                                    setBall(balls[y][x], 1);
                                    setBall(balls[y][x + 1], 0);
                                }
                                else {
                                    setBall(balls[y][x], 1);
                                    setBall(balls[y][x - 1], 0);
                                }
                            }
                            else if (balls[y][x + 1].tag === 1) {
                                setBall(balls[y][x], 1);
                                setBall(balls[y][x + 1], 0);
                            }
                            else if (balls[y][x - 1].tag === 1) {
                                setBall(balls[y][x], 1);
                                setBall(balls[y][x - 1], 0);
                            }
                        }
                    }
                }
                //落ちたボールの回収
                var score = 0;
                isGameover = false;
                var sounds = ["coin02", "coin03", "", "coin04", "coin03", "coin02"];
                for (var x = 0; x < 6; x++) {
                    var flg = false;
                    for (var i = 0; i < 5; i++) {
                        var num = x * 6 + i - 3;
                        if (num >= ballW - 1)
                            break;
                        if (num <= 0)
                            continue;
                        if (balls[ballH][num].tag === 1) {
                            score += listScore[x];
                            if (x === 2) {
                                isGameover = true;
                            }
                            flg = true;
                        }
                        setBall(balls[ballH][num], 0);
                    }
                    labelScores[x].frameNumber = flg ? 1 : 0;
                    labelScores[x].modified();
                    if (flg && x !== 2) {
                        scene.playSound(sounds[x]);
                    }
                }
                scene.addScore(score);
                //ゲームオーバー処理
                if (isGameover) {
                    for (var y = ballH; y >= 0; y--) {
                        for (var x = 1; x < ballW - 1; x++) {
                            if (balls[y][x].tag === 1) {
                                setBall(balls[y][x], 4);
                            }
                        }
                    }
                    timeline.create().wait(2000).call(function () {
                        _this.reset();
                    });
                    scene.playSound("biri");
                    isStop = true;
                }
            }
            //内壁の開閉
            if (frameCnt % 30 === 0) {
                //壁を戻す
                for (var i = 0; i < 2; i++) {
                    if (openWallNums[i] !== -1) {
                        walls[openWallNums[i]].forEach(function (e) { return setBall(e, 2); });
                    }
                    //壁を開ける
                    openWallNums[i] = scene.random.get(0, walls.length - 1);
                    walls[openWallNums[i]].forEach(function (e) { return setBall(e, 0); });
                }
            }
            //上下左右の壁の開閉
            if (frameCnt % 90 === 0) {
                var _loop_3 = function (i) {
                    //壁を開ける
                    var num = 0;
                    while (true) {
                        num = scene.random.get(0, 3);
                        var flg = i === 1 && num === 1; //ゲームオーバーの場所は開かない
                        if (openWallOutNum[i] !== num && !flg)
                            break;
                    }
                    openWallOutNum[i] = num;
                    wallsOut[i][num].forEach(function (e) { return setBall(e, 3); });
                    timeline.create().wait(2000).call(function () {
                        wallsOut[i][num].forEach(function (e) { return setBall(e, 0); });
                    }).wait(3000).call(function () {
                        wallsOut[i][num].forEach(function (e) { return setBall(e, 2); });
                    });
                };
                for (var i = 0; i < 4; i++) {
                    _loop_3(i);
                }
            }
            //ゲームオーバーの場所の開閉
            var isMiss = false;
            for (var x = 9; x < 14; x++) {
                if (balls[21][x].tag === 1) {
                    isMiss = true;
                }
            }
            if (isMiss) {
                missCnt++;
                bg.cssColor = "red";
            }
            else {
                missCnt = 0;
                bg.cssColor = "black";
            }
            bg.modified();
            if (missCnt > 90) {
                for (var x = 9; x < 14; x++) {
                    setBall(balls[22][x], 0);
                }
            }
            frameCnt++;
        });
        var isStop = false;
        //リセット
        _this.reset = function () {
            isStop = false;
            isGameover = false;
            for (var y = ballH; y >= 0; y--) {
                for (var x = 1; x < ballW - 1; x++) {
                    if (balls[y][x].tag === 4 || balls[y][x].tag === 1) {
                        setBall(balls[y][x], 0);
                    }
                }
            }
            for (var x = 9; x < 14; x++) {
                setBall(balls[22][x], 3);
            }
            selectAreas.forEach(function (e) {
                e.frameNumber = 0;
                e.modified();
            });
            srcX = -1;
            bg.cssColor = "black";
        };
        return _this;
    }
    return MainGame;
}(g.E));
exports.MainGame = MainGame;
