import { MainScene } from "./MainScene";
declare function require(x: string): any;

//メインのゲーム画面
export class MainGame extends g.E {
	public reset: () => void;
	public setMode: (num: number) => void;

	constructor(scene: MainScene) {
		const tl = require("@akashic-extension/akashic-timeline");
		const timeline = new tl.Timeline(scene);
		const sizeW = 500;
		const sizeH = 360;
		super({ scene: scene, x: 0, y: 0, width: sizeW, height: sizeH });

		const bg = new g.FilledRect({
			scene: scene,
			width: 640,
			height: 360,
			cssColor: "black",
			opacity: 0.5
		});
		this.append(bg)

		const base = new g.E({
			scene: scene,
			x: 50, y: -7,
			width: 640,
			height: 360,
			touchable: true
		});
		this.append(base);

		const ballW = 29;
		const ballH = 24;
		const ballSize = sizeH / ballH;
		const balls: g.FrameSprite[][] = [];
		const walls: g.FrameSprite[][] = [];
		const wallsOut: g.FrameSprite[][][] = [[], [], [], []];
		let srcX = -1;
		let srcY = -1;
		let srcArea: g.FrameSprite;

		//ボールの作成
		const colors = ["black", "cyan", "orange"];
		for (let y = 0; y < ballH + 1; y++) {
			balls[y] = [];
			for (let x = 0; x < ballW; x++) {
				const num = (((x % 6) === 2 && !(x > 2 && x < 26 && y < 2) || ((y % 5) === 2 && x > 2 && x <= 26))) ? 2 : 0;
				const ball = new g.FrameSprite({
					scene: scene,
					src: scene.assets["ball"] as g.ImageAsset,
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

		for (let y = 0; y < 5; y++) {
			for (let x = 0; x < 4; x++) {
				//上下の壁
				const p = x * 6 + 3;
				if (y === 0) {
					wallsOut[0].push([]);
					for (let j = 0; j < 5; j++) {
						wallsOut[0][wallsOut[0].length - 1].push(balls[y * 5 + 2][p + j]);
					}
				} else if (y === 4) {
					wallsOut[1].push([]);
					for (let j = 0; j < 5; j++) {
						wallsOut[1][wallsOut[1].length - 1].push(balls[y * 5 + 2][p + j]);
					}
				} else {
					walls.push([]);
					for (let j = 0; j < 5; j++) {
						walls[walls.length - 1].push(balls[y * 5 + 2][p + j]);
					}
				}

			}
		}

		for (let y = 0; y < 4; y++) {
			for (let x = 0; x < 5; x++) {
				//横の壁
				const p = x * 6 + 3;
				if (x === 0) {
					wallsOut[2].push([]);
					for (let j = 0; j < 4; j++) {
						wallsOut[2][wallsOut[2].length - 1].push(balls[y * 5 + 3 + j][p - 1]);
					}
				} else if (x === 4) {
					wallsOut[3].push([]);
					for (let j = 0; j < 4; j++) {
						wallsOut[3][wallsOut[3].length - 1].push(balls[y * 5 + 3 + j][p - 1]);
					}
				} else {
					walls.push([]);
					for (let j = 0; j < 4; j++) {
						walls[walls.length - 1].push(balls[y * 5 + 3 + j][p - 1]);
					}
				}
			}
		}

		//選択領域の作成
		const selectAreas: g.FrameSprite[] = [];
		for (let y = 0; y < 4; y++) {
			for (let x = 0; x < 4; x++) {
				const spr = new g.FrameSprite({
					scene: scene,
					src: scene.assets["area"] as g.ImageAsset,
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
				spr.pointDown.add(() => {
					if (!scene.isStart || isStop) return;
					if (srcX === -1) {
						spr.frameNumber = 1;
						spr.modified();
						srcX = x;
						srcY = y;
						srcArea = spr;
					} else {
						const a = srcArea;
						changeBalls(x, y);
						spr.frameNumber = 2;
						spr.modified();
						timeline.create().wait(200).call(() => {
							spr.frameNumber = 0;
							spr.modified();
							a.frameNumber = 0;
							a.modified();
						});
					}
					scene.playSound("se_move");
				});
			}
		}

		//加算するスコアの表示
		const listScore = [20, 30, 0, 50, 30, 20];
		const labelScores:g.FrameSprite[] = [];
		for (let i = 0; i < 6; i++) {
			const label = new g.FrameSprite({
				scene: scene,
				src:scene.assets["number"] as g.ImageAsset,
				x: i * ballSize * 6 + 16,
				y: 325,
				width: 48,
				height: 36,
				frames:[i,i+6]
			});
			this.append(label);
			labelScores.push(label);
		}

		const changeBalls = (px: number, py: number) => {
			for (let y = 0; y < 4; y++) {
				for (let x = 0; x < 5; x++) {
					const dstBall = balls[py * 5 + y + 3][px * 6 + x + 3];
					const srcBall = balls[srcY * 5 + y + 3][srcX * 6 + x + 3];
					const bkTag = srcBall.tag;
					setBall(srcBall, dstBall.tag);
					setBall(dstBall, bkTag);
				}
			}
			srcX = -1;
		};

		const setBall = (ball: g.FrameSprite, num: number) => {
			ball.tag = num;
			ball.frameNumber = num;
			ball.modified();
		};

		let frameCnt = 0;
		const openWallNums = [-1, -1];
		const openWallOutNum = [-1, -1, -1, -1];
		let isGameover = false;
		let missCnt = 0;

		this.update.add(() => {
			if (!scene.isStart || isGameover) return;
			if ((frameCnt % 2) === 0) {

				if (balls[0][3].tag === 0) {
					setBall(balls[0][3], 1);
				}

				if (balls[0][25].tag === 0) {
					setBall(balls[0][25], 1);
				}

				for (let y = ballH; y >= 0; y--) {
					for (let xx = 1; xx < ballW - 1; xx++) {
						const x = (scene.random.get(0, 1) === 0) ? xx : ballW - xx - 1;
						if (balls[y][x].tag !== 0) continue;
						if (y !== 0 && balls[y - 1][x].tag === 1) {
							setBall(balls[y][x], 1);
							setBall(balls[y - 1][x], 0);
						} else {
							if (balls[y][x - 1].tag === 1 && balls[y][x + 1].tag === 1) {
								if (scene.random.get(0, 1) === 0) {
									setBall(balls[y][x], 1);
									setBall(balls[y][x + 1], 0);
								} else {
									setBall(balls[y][x], 1);
									setBall(balls[y][x - 1], 0);
								}
							} else if (balls[y][x + 1].tag === 1) {
								setBall(balls[y][x], 1);
								setBall(balls[y][x + 1], 0);
							} else if (balls[y][x - 1].tag === 1) {
								setBall(balls[y][x], 1);
								setBall(balls[y][x - 1], 0);
							}
						}
					}
				}

				//落ちたボールの回収
				let score = 0;
				isGameover = false;
				const sounds = ["coin02", "coin03", "", "coin04", "coin03", "coin02"];
				for (let x = 0; x < 6; x++) {
					let flg = false;
					for (let i = 0; i < 5; i++) {
						const num = x * 6 + i - 3;
						if (num >= ballW - 1) break;
						if (num <= 0) continue;
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
					for (let y = ballH; y >= 0; y--) {
						for (let x = 1; x < ballW - 1; x++) {
							if (balls[y][x].tag === 1) {
								setBall(balls[y][x], 4);
							}
						}
					}

					timeline.create().wait(2000).call(() => {
						this.reset();
					});

					scene.playSound("biri");
					isStop = true;
				}

			}

			//内壁の開閉
			if (frameCnt % 30 === 0) {
				//壁を戻す
				for (let i = 0; i < 2; i++) {
					if (openWallNums[i] !== -1) {
						walls[openWallNums[i]].forEach(e => setBall(e, 2));
					}
					//壁を開ける
					openWallNums[i] = scene.random.get(0, walls.length - 1);
					walls[openWallNums[i]].forEach(e => setBall(e, 0));
				}
			}

			//上下左右の壁の開閉
			if (frameCnt % 90 === 0) {
				for (let i = 0; i < 4; i++) {
					//壁を開ける
					let num = 0;
					while (true) {
						num = scene.random.get(0, 3);
						const flg = i === 1 && num === 1;//ゲームオーバーの場所は開かない
						if (openWallOutNum[i] !== num && !flg) break;
					}
					openWallOutNum[i] = num;
					wallsOut[i][num].forEach(e => setBall(e, 3));
					timeline.create().wait(2000).call(() => {
						wallsOut[i][num].forEach(e => setBall(e, 0));
					}).wait(3000).call(() => {
						wallsOut[i][num].forEach(e => setBall(e, 2));
					});
				}
			}

			//ゲームオーバーの場所の開閉
			let isMiss = false;
			for (let x = 9; x < 14; x++) {
				if (balls[21][x].tag === 1) {
					isMiss = true;
				}
			}
			if (isMiss) {
				missCnt++;
				bg.cssColor = "red";
			} else {
				missCnt = 0;
				bg.cssColor = "black";
			}
			bg.modified();
			if (missCnt > 90) {
				for (let x = 9; x < 14; x++) {
					setBall(balls[22][x], 0);
				}
			}

			frameCnt++;
		});

		let isStop = false;
		//リセット
		this.reset = () => {
			isStop = false;
			isGameover = false;
			for (let y = ballH; y >= 0; y--) {
				for (let x = 1; x < ballW - 1; x++) {
					if (balls[y][x].tag === 4 || balls[y][x].tag === 1) {
						setBall(balls[y][x], 0);
					}
				}
			}

			for (let x = 9; x < 14; x++) {
				setBall(balls[22][x], 3);
			}

			selectAreas.forEach(e => {
				e.frameNumber = 0;
				e.modified();
			});

			srcX = -1;
			bg.cssColor = "black";

		};

	}
}
