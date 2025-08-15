import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

import.meta.glob("./attachedScripts/*.ts", { eager: true});

class PongGame extends HTMLElement {
	private _canvas : HTMLCanvasElement;
	private _engine! : Engine;
	private _scene! : Scene;

    constructor() {
		super();
		this._canvas = document.createElement("canvas");
		this._canvas.classList.add("size-full");
		this.appendChild(this._canvas);
	}

	async connectedCallback() : Promise<void> {
		this._engine = this.CreateEngine();
		this._scene = await this.LoadScene();
		this._engine.runRenderLoop(() => {
			this._scene.render();
		});
    }

	private CreateEngine() : Engine
	{
        return new Engine(this._canvas, true, {
			stencil: true,
			antialias: true,
			audioEngine: true,
			adaptToDeviceRatio: true,
			disableWebGL2Support: false,
			useHighPrecisionFloats: true,
			powerPreference: "high-performance",
			failIfMajorPerformanceCaveat: false,
		});
	}

	private async LoadScene() : Promise<Scene> {

		const	scene = new Scene(this._engine);
		const	cam = new FreeCamera("camera1", Vector3.Zero(), scene);
		const	assetsManager = new AssetsManager(scene);


		await SceneManager.InitializeRuntime(this._engine, { showDefaultLoadingScreen: true, hideLoadingUIWithEngine: false });

		assetsManager.addMeshTask("scene", null, "/games/pong/", "SampleScene.gltf")

		await SceneManager.LoadRuntimeAssets(assetsManager, [ "SampleScene.gltf" ], () => {
			cam.dispose(); // removing the unecessary camera
			this.OnSceneLoaded();
		});

		return scene;
	}

	private OnSceneLoaded() : void {
		SceneManager.HideLoadingScreen(this._engine);
		SceneManager.FocusRenderCanvas(this._scene);
		this._scene.activeCameras = this._scene.cameras;
	}

	disconnectedCallback() : void {
		this._engine.dispose();
		this._scene.dispose();
	}
}
customElements.define("pong-game", PongGame);
