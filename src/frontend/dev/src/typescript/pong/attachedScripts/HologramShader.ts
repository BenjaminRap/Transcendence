import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { buildHologramMaterial } from "../shaders/hologram";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Imported } from "@shared/ImportedDecorator";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { zodNumber } from "@shared/ImportedHelpers";

export class HologramShader extends CustomScriptComponent {
	@Imported(zodNumber) private _minAlpha! : number;
	@Imported(zodNumber) private _textureScale! : number;
	@Imported(Texture) private _hologramTexture! : Texture;
	@Imported(Color4) private _color! : Color4;
	@Imported(Vector2) private _textureDisplacement! : Vector2;
	@Imported(AbstractMesh, true) private _models! : AbstractMesh[];

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "HologramShader") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const [ material, inputs ] = buildHologramMaterial("hologram", this.scene);

		inputs.minAlpha.value = this._minAlpha;
		inputs.textureScale.value = this._textureScale;
		inputs.textureSource.texture = this._hologramTexture;
		inputs.color.value = this._color;
		inputs.textureDisplacement.value = this._textureDisplacement;

		this._models.forEach((model) => model.material = material);
	}
}

SceneManager.RegisterClass("HologramShader", HologramShader);
