export class Button extends g.FilledRect {

	static font: g.Font;
	public num: number = 0;
	public label: g.Label;
	public chkEnable: (ev: g.PointDownEvent) => boolean;
	public pushEvent: (ev: g.PointDownEvent) => void;

	constructor(scene: g.Scene, s: string[], x: number = 0, y: number = 0, w: number = 100, h: number = 50) {
		super({
			scene: scene,
			cssColor: "black",
			width: w,
			height: h,
			x: x,
			y: y,
			touchable: true
		});

		this.chkEnable = (ev) => true;
		this.pushEvent = () => {};

		if (Button.font == null) {
			Button.font = new g.DynamicFont({
				game: g.game,
				fontFamily: g.FontFamily.Monospace,
				size: 32
			});
		}

		const base = new g.FilledRect({
			scene: scene,
			x: 2, y: 2,
			width: w - 4, height: h - 4,
			cssColor:"white"
		});
		this.append(base);

		this.label = new g.Label({
			scene: scene,
			font: Button.font,
			text: s[0],
			fontSize: 24,
			textColor: "black",
			widthAutoAdjust: false,
			textAlign: g.TextAlign.Center,
			width: w - 4
		});

		this.label.y = (h - 4 - this.label.height) / 2;
		this.label.modified();

		base.append(this.label);

		this.pointDown.add((ev) => {
			if (!this.chkEnable(ev)) return;

			base.cssColor = "gray";
			base.modified();

			if (s.length !== 1) {
				this.num = (this.num + 1) % s.length;
				this.label.text = s[this.num];
				this.label.invalidate();
			}
		});

		this.pointUp.add((ev) => {
			base.cssColor = "white";
			base.modified();
			this.pushEvent(ev);
		});
	}
}
