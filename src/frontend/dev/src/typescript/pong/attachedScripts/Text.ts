import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui/2D"
import { Imported } from "@shared/ImportedDecorator";
import { Color4 } from "@babylonjs/core";
import { zodInt, zodString } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import zod from "zod";

const	zodAlignment = zod.literal(["left", "middle", "right"]);
type	Alignment = zod.infer<typeof zodAlignment>;

export class Text extends CustomScriptComponent {
	@Imported(zodString) private _text! : string;
	@Imported(Color4) private _color! : Color4;
	@Imported(zodInt) private _fontSizeInPixels! : number;
	@Imported(zodInt) private _maxCharacterInRow! : number;
	@Imported(zodInt) private _maxRow! : number;
	@Imported(zodAlignment) private _alignment! : Alignment;

	private _texture! : AdvancedDynamicTexture;
	private _textBlock! : TextBlock;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Text") {
        super(transform, scene, properties, alias);
    }

	protected awake()
	{
		const	width = this._fontSizeInPixels * this._maxCharacterInRow;
		const	height = this._fontSizeInPixels * this._maxRow;

		this._texture = AdvancedDynamicTexture.CreateForMesh(this.getAbstractMesh(), width, height, false, false, false);
		this._textBlock = new TextBlock(undefined, this._text);
		this._textBlock.fontSizeInPixels = this._fontSizeInPixels;
		this._textBlock.color = this.colorToString(this._color);
		this._textBlock.resizeToFit = true;
		this._textBlock.horizontalAlignment = this.getAlignment();
		this._texture.addControl(this._textBlock);
	}

	private getAlignment() : number
	{
		switch (this._alignment) {
			case "left":
				return Control.HORIZONTAL_ALIGNMENT_LEFT;
			case "middle":
				return Control.HORIZONTAL_ALIGNMENT_CENTER;
			default:
				return Control.HORIZONTAL_ALIGNMENT_RIGHT;
		}
	}

	public setText(content : string)
	{
		this._textBlock.text = content;
	}

	private colorToString(color : Color4) : string
	{
		return  `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${color.a})`
	}
}

SceneManager.RegisterClass("Text", Text);
