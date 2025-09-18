import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HavokPlugin } from "@babylonjs/core/Physics";

import HavokPhysics from "@babylonjs/havok";
import { Color4 } from "@babylonjs/core/Maths/math.color";

import.meta.glob("./attachedScripts/*.ts", { eager: true});

class PongGame extends HTMLElement {
	private _canvas : HTMLCanvasElement;
	private _engine! : Engine;
	private _scene! : Scene;

    constructor() {
		super();
		this._canvas = document.createElement("canvas");
		this._canvas.style.width = "100%";
		this._canvas.style.aspectRatio = "16 / 9"
		this.appendChild(this._canvas);
	}

	async connectedCallback() : Promise<void> {
		try {
			this._engine = this.createEngine();
			this._scene = await this.loadScene();
			this._engine.runRenderLoop(this.renderScene.bind(this));
		} catch (error) {
			const	printableError = (typeof error === 'object' ? JSON.stringify(error) : error)

			console.log(`Could not initialize the scene : ${printableError}`)
		}
    }

	private renderScene() : void
	{
		try {
			this._scene.render();
		} catch (error) {
			const	printableError = (typeof error === 'object' ? JSON.stringify(error) : error)

			console.log(`Could not render the scene : ${printableError}`)
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

		globalThis.HK = await HavokPhysics();
		globalThis.HKP = new HavokPlugin(false);

		if (!scene.enablePhysics(Vector3.Zero(), globalThis.HKP))
			throw new Error("The physics engine hasn't been initialized !");

		const	sceneName = "Magic.gltf";

		assetsManager.addMeshTask("scene", null, "/games/pong/",sceneName)

		await SceneManager.LoadRuntimeAssets(assetsManager, [ sceneName ], () => {
			cam.dispose(); // removing the unecessary camera
			this.onSceneLoaded();
		});

		return scene;
	}

	private onSceneLoaded() : void {
		SceneManager.HideLoadingScreen(this._engine);
		SceneManager.FocusRenderCanvas(this._scene);
		this._scene.activeCameras = this._scene.cameras;
		this._scene.activeCameras[0].attachControl();
	}

	disconnectedCallback() : void {
		if (globalThis.HKP)
			delete globalThis.HKP;
		if (globalThis.HKP)
			delete globalThis.HKP;
		this._engine?.dispose();
		this._scene?.dispose();
	}
}

customElements.define("pong-game", PongGame);
