import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui/2D"
import { Imported } from "@shared/ImportedDecorator";
import { zodInt, zodString } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import zod from "zod";
import { getFrontendSceneData } from "../PongGame";

const	zodVerticalAlignment = zod.literal(["top", "center", "bottom"]);
type	VerticalAlignment = zod.infer<typeof zodVerticalAlignment>;

const	zodHorizontalAlignment = zod.literal(["left", "center", "right"]);
type	HorizontalAlignment = zod.infer<typeof zodHorizontalAlignment>;

export class Text extends CustomScriptComponent {
	@Imported(zodString) private _text! : string;
	@Imported(zodInt) private _fontSizeInPixels! : number;
	@Imported(zodInt) private _maxCharacterInRow! : number;
	@Imported(zodInt) private _maxRow! : number;
	@Imported(zodVerticalAlignment) private _verticalAlignment! : VerticalAlignment;
	@Imported(zodHorizontalAlignment) private _horizontalAlignment! : HorizontalAlignment;

	private _texture! : AdvancedDynamicTexture;
	private _textBlock! : TextBlock;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Text") {
        super(transform, scene, properties, alias);
    }

	protected start()
	{
		const	sceneData = getFrontendSceneData(this.scene);
		const	style = getComputedStyle(sceneData.pongHTMLElement);
		const	color = style.getPropertyValue("--text-color").trim();
		const	font = style.getPropertyValue("--font").trim();
		const	width = this._fontSizeInPixels * this._maxCharacterInRow;
		const	height = this._fontSizeInPixels * this._maxRow;

		this._texture = AdvancedDynamicTexture.CreateForMesh(this.getAbstractMesh(), width, height, false, false, false);
		this._textBlock = new TextBlock(undefined, this._text);
		this._textBlock.fontSizeInPixels = this._fontSizeInPixels;
		this._textBlock.color = color;
		this._textBlock.resizeToFit = true;
		this._textBlock.textHorizontalAlignment = this.getHorizontalAlignment();
		this._textBlock.verticalAlignment = this.getVerticalAlignment();
		this._textBlock.textWrapping = true;
		this._textBlock.fontFamily = font === "VT323" ? "pixel" : font;
		this._texture.addControl(this._textBlock);
	}

	private getHorizontalAlignment() : number
	{
		switch (this._horizontalAlignment) {
			case "left":
				return Control.HORIZONTAL_ALIGNMENT_LEFT;
			case "center":
				return Control.HORIZONTAL_ALIGNMENT_CENTER;
			default:
				return Control.HORIZONTAL_ALIGNMENT_RIGHT;
		}
	}

	private getVerticalAlignment() : number
	{
		switch (this._verticalAlignment) {
			case "top":
				return Control.VERTICAL_ALIGNMENT_TOP;
			case "center":
				return Control.VERTICAL_ALIGNMENT_CENTER;
			default:
				return Control.VERTICAL_ALIGNMENT_BOTTOM;
		}
	}

	public setText(content : string)
	{
		const	lines = content.split('\n');
		const	lineOverflow = lines.length - this._maxRow;
		if (lineOverflow > 0)
			lines.splice(0, lineOverflow);

		for (let index = 0; index < lines.length; index++) {
			const line = lines[index];
			
			if (line.length > this._maxCharacterInRow)
				lines[index] = line.slice(0, this._maxCharacterInRow);
		}
		this._textBlock.text = lines.join('\n');
	}

	public getText()
	{
		return this._textBlock.text;
	}
}

SceneManager.RegisterClass("Text", Text);
