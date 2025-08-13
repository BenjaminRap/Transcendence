import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";

import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Node } from "@babylonjs/core/node";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import.meta.glob("./attachedScripts/*.ts", { eager: true});

class PongGame extends HTMLElement
{
	private _canvas : HTMLCanvasElement;
	private _engine! : Engine;
	private _scene! : Scene;

    constructor()
	{
		super();
		this._canvas = document.createElement("canvas");
		this._canvas.classList.add("size-full");
		this.appendChild(this._canvas);
	}

	async connectedCallback() : Promise<void>
	{
        this._engine = new Engine(this._canvas, true, {
			stencil: true,
			antialias: true,
			audioEngine: true,
			adaptToDeviceRatio: true,
			disableWebGL2Support: false,
			useHighPrecisionFloats: true,
			powerPreference: "high-performance",
			failIfMajorPerformanceCaveat: false,
		});
		this._scene = new Scene(this._engine);

        // A camera is needed even though the imported scene contains one.
        const cam = new FreeCamera("camera1", Vector3.Zero(), this._scene);

		await SceneManager.InitializeRuntime(this._engine, { showDefaultLoadingScreen: true, hideLoadingUIWithEngine: false });
		const	assetsManager = new AssetsManager(this._scene);
		assetsManager.addMeshTask("scene", null, "/games/pong/", "SampleScene.gltf")
		await SceneManager.LoadRuntimeAssets(assetsManager, [ "SampleScene.gltf" ], () => {
			SceneManager.HideLoadingScreen(this._engine);
            SceneManager.FocusRenderCanvas(this._scene);
			cam.dispose(); // removing the remporary camera
			this._scene.activeCameras = this._scene.cameras;
			this._scene.activeCameras.forEach((camera : Camera, _index : number, _cameras : Camera[]) => {
				if (camera.mode == Camera.ORTHOGRAPHIC_CAMERA)
				{
					const scale : number = this._engine.getScreenAspectRatio();
					camera.orthoLeft! *= scale;
					camera.orthoRight! *= scale;
					camera.layerMask = 1;
				}
				else
					camera.layerMask = 2;
			});
			this._scene.rootNodes[0].getChildren().find((value : Node, _index : number, _array : Node[]) => {
				if (value.name === "pong")
				{
					value.getChildren().forEach((value : Node, _index : number, _array : Node[]) => {
						if (value instanceof Mesh)
							value.layerMask = 1;
					});
				}
				else if (value.name === "background")
				{
					value.getChildren().forEach((value : Node, _index : number, _array : Node[]) => {
						if (value instanceof Mesh)
							value.layerMask = 2;
					});
				}
			});
		});
		// run the main render loop
		this._engine.runRenderLoop(() => {
			this._scene.render();
		});
    }

	disconnectedCallback() : void
	{
		this._engine.dispose();
		this._scene.dispose();
	}
}
customElements.define("pong-game", PongGame);
