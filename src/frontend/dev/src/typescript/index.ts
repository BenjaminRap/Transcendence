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
		try {
			this._engine = this.createEngine();
			this._scene = await this.loadScene();
			this._engine.runRenderLoop(this.renderScene.bind(this));
		} catch (error) {
			console.log(`Could not initialize the game: ${error}`)
		}
    }

	private renderScene() : void
	{
		try {
			this._scene.render();
		} catch (error) {
			console.log(`Could not render the scene : ${error}`)
		}
	}

	private createEngine() : Engine
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

	private async loadScene() : Promise<Scene> {

		const	scene = new Scene(this._engine);
		const	cam = new FreeCamera("camera1", Vector3.Zero(), scene);
		const	assetsManager = new AssetsManager(scene);


		await SceneManager.InitializeRuntime(this._engine, { showDefaultLoadingScreen: true, hideLoadingUIWithEngine: false });

		assetsManager.addMeshTask("scene", null, "/games/pong/", "SampleScene.gltf")

		await SceneManager.LoadRuntimeAssets(assetsManager, [ "SampleScene.gltf" ], () => {
			cam.dispose(); // removing the unecessary camera
			this.onSceneLoaded();
		});

		return scene;
	}

	private onSceneLoaded() : void {
		SceneManager.HideLoadingScreen(this._engine);
		SceneManager.FocusRenderCanvas(this._scene);
		this._scene.activeCameras = this._scene.cameras;
	}

	disconnectedCallback() : void {
		this._engine?.dispose();
		this._scene?.dispose();
	}
}
customElements.define("pong-game", PongGame);
