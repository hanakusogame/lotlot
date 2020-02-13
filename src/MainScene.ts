import { MainGame } from "./MainGame";
import { Config } from "./Config";
import { Button } from "./Button";
declare function require(x: string): any;
/* tslint:disable: align */
export class MainScene extends g.Scene {
	public lastJoinedPlayerId: string; // 配信者のID
	public random: g.RandomGenerator;
	public addScore: (n: number) => void;
	public playSound: (name: string) => void;
	public showZen: () => void;
	public isStart: boolean;
	public numFont: g.Font;

	constructor(param: g.SceneParameterObject) {
		param.assetIds = [
			"img_numbers_n", "img_numbers_n_red", "title", "start", "finish", "score", "time",
			"waku", "ball", "waku", "combo", "add","area","dokuro","number",
			"config", "volume", "test", "glyph72", "number_w", "number_b", "number_p",
			"se_start", "se_timeup", "bgm", "se_clear", "se_move", "se_miss", "se_trush",
			"coin02","coin03","coin04","biri"];
		super(param);

		const tl = require("@akashic-extension/akashic-timeline");
		const timeline = new tl.Timeline(this);
		const timeline2 = new tl.Timeline(this);
		const isDebug = false;

		this.loaded.add(() => {
			g.game.vars.gameState = { score: 0 };

			// 何も送られてこない時は、標準の乱数生成器を使う
			this.random = g.game.random;
			this.message.add((msg) => {
				if (msg.data && msg.data.type === "start" && msg.data.parameters) { // セッションパラメータのイベント
					const sessionParameters = msg.data.parameters;
					if (sessionParameters.randomSeed != null) {
						// プレイヤー間で共通の乱数生成器を生成
						// `g.XorshiftRandomGenerator` は Akashic Engine の提供する乱数生成器実装で、 `g.game.random` と同じ型。
						this.random = new g.XorshiftRandomGenerator(sessionParameters.randomSeed);
					}
				}
			});

			// 配信者のIDを取得
			this.lastJoinedPlayerId = "";
			g.game.join.add((ev) => {
				this.lastJoinedPlayerId = ev.player.id;
			});

			// 背景
			const bg = new g.FilledRect({ scene: this, width: 640, height: 360, cssColor: "#303030", opacity: 0 });
			this.append(bg);
			if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
				bg.opacity = 1.0;
				bg.modified();
			}

			const base = new g.E({ scene: this });
			this.append(base);
			base.hide();

			const uiBase = new g.E({ scene: this });
			this.append(uiBase);
			uiBase.hide();

			//タイトル
			const sprTitle = new g.Sprite({ scene: this, src: this.assets["title"], x: 70 });
			this.append(sprTitle);
			timeline.create(
				sprTitle, {
				modified: sprTitle.modified, destroyd: sprTitle.destroyed
			}).wait((isDebug) ? 1000 : 5000).moveBy(-800, 0, 200).call(() => {
				bg.show();
				base.show();
				uiBase.show();
				this.isStart = true;
				reset();
			});

			let glyph = JSON.parse((this.assets["test"] as g.TextAsset).data);
			const numFont = new g.BitmapFont({
				src: this.assets["img_numbers_n"],
				map: glyph.map,
				defaultGlyphWidth: glyph.width,
				defaultGlyphHeight: glyph.height,
				missingGlyph: glyph.missingGlyph
			});
			this.numFont = numFont;

			const numFontRed = new g.BitmapFont({
				src: this.assets["img_numbers_n_red"],
				map: glyph.map,
				defaultGlyphWidth: glyph.width,
				defaultGlyphHeight: glyph.height,
				missingGlyph: glyph.missingGlyph
			});

			glyph = JSON.parse((this.assets["glyph72"] as g.TextAsset).data);
			const numFontW = new g.BitmapFont({
				src: this.assets["number_w"],
				map: glyph.map,
				defaultGlyphWidth: 65,
				defaultGlyphHeight: 80
			});

			glyph = JSON.parse((this.assets["glyph72"] as g.TextAsset).data);
			const numFontB = new g.BitmapFont({
				src: this.assets["number_b"],
				map: glyph.map,
				defaultGlyphWidth: 72,
				defaultGlyphHeight: 80
			});

			glyph = JSON.parse((this.assets["glyph72"] as g.TextAsset).data);
			const numFontP = new g.BitmapFont({
				src: this.assets["number_p"],
				map: glyph.map,
				defaultGlyphWidth: 72,
				defaultGlyphHeight: 80
			});

			//スコア
			uiBase.append(new g.Sprite({ scene: this, src: this.assets["score"], x: 485, y: 5, height: 32 }));
			let score = 0;
			const labelScore = new g.Label({
				scene: this,
				x: 320,
				y: 45,
				width: 32 * 10,
				fontSize: 32,
				font: numFont,
				text: "0",
				textAlign: g.TextAlign.Right, widthAutoAdjust: false
			});
			uiBase.append(labelScore);

			const labelScorePlus = new g.Label({
				scene: this,
				x: 312,
				y: 90,
				width: 32 * 10,
				fontSize: 32,
				font: numFontRed,
				text: "+0",
				textAlign: g.TextAlign.Right, widthAutoAdjust: false
			});
			uiBase.append(labelScorePlus);

			//タイム
			uiBase.append(new g.Sprite({ scene: this, src: this.assets["time"], x: 540, y: 320 }));
			const labelTime = new g.Label({ scene: this, font: numFont, fontSize: 32, text: "70", x: 580, y: 323 });
			uiBase.append(labelTime);

			//開始
			const sprStart = new g.Sprite({ scene: this, src: this.assets["start"], x: 50, y: 100 });
			uiBase.append(sprStart);
			sprStart.hide();

			//終了
			const finishBase = new g.E({ scene: this, x: 0, y: 0 });
			this.append(finishBase);
			finishBase.hide();

			const finishBg = new g.FilledRect({ scene: this, width: 640, height: 360, cssColor: "#000000", opacity: 0.3 });
			finishBase.append(finishBg);

			const sprFinish = new g.Sprite({ scene: this, src: this.assets["finish"], x: 120, y: 100 });
			finishBase.append(sprFinish);

			//最前面
			const fg = new g.FilledRect({ scene: this, width: 640, height: 360, cssColor: "#ff0000", opacity: 0.0 });
			this.append(fg);

			//リセットボタン
			const btnReset = new Button(this, ["リセット"], 500, 260, 130);
			if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
				finishBase.append(btnReset);
				btnReset.pushEvent = () => {
					reset();
				};
			}

			//ランキングボタン
			const btnRanking = new Button(this, ["ランキング"], 500, 200, 130);
			if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
				finishBase.append(btnRanking);
				btnRanking.pushEvent = () => {
					window.RPGAtsumaru.experimental.scoreboards.display(1);
				};
			}

			//設定ボタン
			const btnConfig = new g.Sprite({ scene: this, x: 600, y: 0, src: this.assets["config"], touchable: true });
			if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
				this.append(btnConfig);
			}

			//設定画面
			const config = new Config(this, 380, 40);
			if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
				this.append(config);
			}
			config.hide();

			btnConfig.pointDown.add(() => {
				if (config.state & 1) {
					config.show();
				} else {
					config.hide();
				}
			});

			config.bgmEvent = (num) => {
				bgm.changeVolume(0.5 * num);
			};

			config.colorEvent = (str) => {
				bg.cssColor = str;
				bg.modified();
			};

			const bgm = (this.assets["bgm"] as g.AudioAsset).play();
			bgm.changeVolume(isDebug ? 0.0 : 0.2);

			this.playSound = (name: string) => {
				(this.assets[name] as g.AudioAsset).play().changeVolume(config.volumes[1]);
			};

			//ゲームメイン
			const game = new MainGame(this);
			base.append(game);

			//メインループ
			let bkTime = 0;
			const timeLimit = 70;
			let startTime: number = 0;
			this.update.add(() => {
				//return;//デバッグ

				if (!this.isStart) return;
				const t = timeLimit - Math.floor((Date.now() - startTime) / 1000);

				//終了処理
				if (t <= -1) {
					fg.cssColor = "#000000";
					fg.opacity = 0.0;
					fg.modified();

					finishBase.show();

					this.isStart = false;

					this.playSound("se_timeup");

					timeline.create().wait(1500).call(() => {
						if (typeof window !== "undefined" && window.RPGAtsumaru) {
							window.RPGAtsumaru.experimental.scoreboards.setRecord(1, g.game.vars.gameState.score).then(() => {
								btnRanking.show();
								btnReset.show();
							});
						}

						if (isDebug) {
							btnRanking.show();
							btnReset.show();
						}
					});

					return;
				}

				labelTime.text = "" + t;
				labelTime.invalidate();

				if (bkTime !== t && t <= 5) {
					fg.opacity = 0.1;
					fg.modified();
					timeline.create().wait(500).call(() => {
						fg.opacity = 0.0;
						fg.modified();
					});
				}

				bkTime = t;
			});

			//スコア加算表示
			//let bkTweenScore: any;
			this.addScore = (num: number) => {

				if (score + num < 0) {
					num = -score;
				}
				score += num;

				labelScore.text = "" + score;
				labelScore.invalidate();

				/*
				timeline.create().every((e: number, p: number) => {
					labelScore.text = "" + (score - Math.floor(num * (1 - p)));
					labelScore.invalidate();
				}, 500);

				labelScorePlus.text = ((num >= 0) ? "+" : "") + num;
				labelScorePlus.invalidate();
				if (bkTweenScore) timeline2.remove(bkTweenScore);
				bkTweenScore = timeline2.create().every((e: number, p: number) => {
					labelScorePlus.opacity = p;
					labelScorePlus.modified();
				}, 100).wait(4000).call(() => {
					labelScorePlus.opacity = 0;
					labelScorePlus.modified();
				});
				*/

				g.game.vars.gameState.score = score;
			};

			//リセット
			const reset = () => {
				bkTime = 0;
				startTime = Date.now();
				this.isStart = true;

				score = 0;
				labelScore.text = "0";
				labelScore.invalidate();
				labelScorePlus.text = "";
				labelScorePlus.invalidate();

				sprStart.show();
				timeline.create().wait(750).call(() => {
					sprStart.hide();
				});

				btnReset.hide();
				btnRanking.hide();
				fg.opacity = 0;
				fg.modified();

				finishBase.hide();

				startTime = Date.now();

				game.reset();

				this.playSound("se_start");
			};

		});
	}
}
