import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui/2D"
import { Imported } from "@shared/ImportedDecorator";
import { Color4 } from "@babylonjs/core";
import { zodString } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class Text extends CustomScriptComponent {
	@Imported(zodString) private _text! : string;
	@Imported(Color4) private _color! : Color4;

	private _texture! : AdvancedDynamicTexture;
	private _textBlock! : TextBlock;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Text") {
        super(transform, scene, properties, alias);
    }

	protected awake()
	{
		this._texture = AdvancedDynamicTexture.CreateForMesh(this.getAbstractMesh(), 256, 64, false, false, false);
		this._textBlock = new TextBlock(undefined, this._text);
		this._textBlock.fontSizeInPixels = 64;
		this._textBlock.color = this.colorToString(this._color);
		this._textBlock.resizeToFit = true;
		this._texture.addControl(this._textBlock);
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
