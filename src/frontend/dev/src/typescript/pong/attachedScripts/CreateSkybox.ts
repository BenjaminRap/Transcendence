import { Scene } from "@babylonjs/core/scene";
import { Mesh, MeshBuilder, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CubeTexture, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Imported } from "@shared/ImportedDecorator";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { zodString } from "@shared/ImportedHelpers";

export class CreateSkybox extends CustomScriptComponent {
	@Imported(zodString) private _skyboxPath! : string;
	@Imported(Vector3) private _rotationAngle! : Vector3;

	private _skybox : Mesh | undefined = undefined;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateSkybox") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	texture = new CubeTexture(this._skyboxPath, this.scene);

		const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.disableLighting = true;
		skyboxMaterial.reflectionTexture = texture;
		skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

		const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
		skybox.material = skyboxMaterial;
		skybox.infiniteDistance = true;
		skybox.layerMask = 2;
		skybox.rotation = this._rotationAngle.scale(Math.PI / 180);

		this._skybox = skybox;
	}

	public getSkybox() : Mesh | undefined
	{
		return this._skybox;
	}
}

SceneManager.RegisterClass("CreateSkybox", CreateSkybox);
