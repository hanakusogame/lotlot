import { Button } from "./Button";
export class Config extends g.FilledRect {

	static font: g.Font;
	public num: number = 0;
	public label: g.Label;
	public chkEnable: (ev: g.PointDownEvent) => boolean;
	public bgmEvent: (num: number) => void;
	public seEvent: (num: number) => void;
	public colorEvent: (color: string) => void;
	public volumes: number[] = [0.5, 0.8];

	constructor(scene: g.Scene, x: number = 0, y: number = 0) {
		super({
			scene: scene,
			cssColor: "black",
			width: 250,
			height: 250,
			x: x,
			y: y,
			touchable: true
		});

		this.chkEnable = (ev) => true;
		const events = [this.bgmEvent, this.seEvent];

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: g.FontFamily.Monospace,
			size: 32
		});

		const base = new g.FilledRect({
			scene: scene,
			x: 2, y: 2,
			width: this.width - 4, height: this.height - 4,
			cssColor: "white"
		});
		this.append(base);

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

		const line = new g.FilledRect({ scene: scene, x: 5, y: 30, width: 235, height: 2, cssColor: "#000000" });
		base.append(line);

		const strVol = ["ＢＧＭ", "効果音"];
		for (let i = 0; i < 2; i++) {
			base.append(new g.Label({
				scene: scene,
				font: font,
				text: strVol[i],
				fontSize: 24,
				textColor: "black",
				x: 10, y: 50 + 50 * i
			}));

			const sprVol = new g.FrameSprite({
				scene: scene,
				src: scene.assets["volume"] as g.ImageAsset,
				width: 32, height: 32,
				x: 90, y: 50 + 50 * i,
				frames: [0, 1]
			});
			base.append(sprVol);

			const baseVol = new g.E({ scene: scene, x: 130, y: 50 + 50 * i, width: 110, height: 32, touchable: true });
			base.append(baseVol);

			const lineVol = new g.FilledRect({ scene: scene, x: 0, y: 13, width: 110, height: 6, cssColor: "gray" });
			baseVol.append(lineVol);

			const cursorVol = new g.FilledRect({ scene: scene, x: 110 * this.volumes[i] - 7, y: 0, width: 15, height: 32, cssColor: "#000000" });
			baseVol.append(cursorVol);

			let flgMute = false;
			baseVol.pointMove.add((e) => {
				let posX = e.point.x + e.startDelta.x;
				if (posX < 7) posX = 7;
				if (posX > 103) posX = 103;
				cursorVol.x = posX - 7;
				cursorVol.modified();
				flgMute = (posX-7) === 0;
			});

			baseVol.pointUp.add((e) => {
				if (flgMute) {
					sprVol.frameNumber = 1;
				} else {
					sprVol.frameNumber = 0;
				}
				sprVol.modified();
				this.volumes[i] = cursorVol.x / 110;

				if (i === 0 && this.bgmEvent !== undefined) {
					this.bgmEvent(this.volumes[i]);
				}
			});
		}

		const colors = ["gray", "black", "white", "green", "navy"];
		let colorNum = 0;
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

		const sprColor = new g.FilledRect({ scene: scene, x: 132, y: 152, width: 106, height: 36, cssColor: "gray", touchable:true });
		base.append(sprColor);

		sprColor.pointDown.add((e) => {
			colorNum = (colorNum + 1) % colors.length;
			sprColor.cssColor = colors[colorNum];
			sprColor.modified();
			if (this.colorEvent !== undefined) {
				this.colorEvent(colors[colorNum]);
			}
		});

		//ランキング表示
		const btnRank = new Button(scene, ["ランキング"], 2, 198, 130, 45);
		base.append(btnRank);
		btnRank.pushEvent = () => {
			if (typeof window !== "undefined" && window.RPGAtsumaru) {
				window.RPGAtsumaru.experimental.scoreboards.display(1);
			}
		};

		//閉じる
		const btnClose = new Button(scene, ["閉じる"], 138, 198, 105, 45);
		base.append(btnClose);
		btnClose.pushEvent = () => {
			this.hide();
		};

	}
}
