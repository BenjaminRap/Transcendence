import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { CubeTexture, StandardMaterial, Texture } from "@babylonjs/core";

export class CreateSkybox extends ScriptComponent {
	private _skyboxPath! : string;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateSkybox") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	texture = new CubeTexture(this._skyboxPath, this.scene, undefined, undefined, undefined, undefined, (message, exception) => {
			console.log(`${message} : ${exception}`)
		});

		const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.disableLighting = true;
		skyboxMaterial.reflectionTexture = texture;
		skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

		const skybox = MeshBuilder.CreateBox("skyBox", { size: 100.0 }, this.scene);
		skybox.material = skyboxMaterial;
		skybox.infiniteDistance = true;
	}
}

SceneManager.RegisterClass("CreateSkybox", CreateSkybox);
