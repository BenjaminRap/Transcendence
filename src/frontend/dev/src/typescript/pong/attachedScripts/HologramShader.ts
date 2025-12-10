import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh, InstancedMesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { buildHologramMaterial } from "../shaders/hologram";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Imported } from "@shared/ImportedDecorator";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector2 } from "@babylonjs/core/Maths/math.vector";

export class HologramShader extends CustomScriptComponent {
	@Imported(Texture) private _hologramTexture! : Texture;
	@Imported(Color4) private _firstColor! : Color4;
	@Imported(Color4) private _secondColor! : Color4;
	@Imported(Vector2) private _textureDisplacement! : Vector2;
	@Imported(AbstractMesh, true) private _models! : AbstractMesh[];

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "HologramShader") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const [ material, inputs ] = buildHologramMaterial("hologram", this.scene);

		inputs.textureSource.texture = this._hologramTexture;
		inputs.firstColor.value = this._firstColor;
		inputs.secondColor.value = this._secondColor;
		inputs.textureDisplacement.value = this._textureDisplacement;

		this._models.forEach((model) => model.material = material);
	}
}

SceneManager.RegisterClass("HologramShader", HologramShader);
