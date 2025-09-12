import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui/2D"

export class Text extends ScriptComponent {
	private _text : string = "";

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
		this._textBlock.resizeToFit = true;
		this._texture.addControl(this._textBlock);
	}

	public setText(content : string)
	{
		this._textBlock.text = content;
	}
}

SceneManager.RegisterClass("Text", Text);
