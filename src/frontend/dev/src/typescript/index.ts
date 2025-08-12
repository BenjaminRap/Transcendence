import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";

import { SceneLoaderFlags } from "@babylonjs/core/Loading/sceneLoaderFlags";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

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
		SceneLoaderFlags.ForceFullSceneLoadingForIncremental = true;
		this._scene = new Scene(this._engine);

        // A camera is needed even though the imported scene contains one.
        new FreeCamera("camera1", Vector3.Zero(), this._scene);

		await SceneManager.InitializeRuntime(this._engine, { showDefaultLoadingScreen: true, hideLoadingUIWithEngine: false });
		const	assetsManager = new AssetsManager(this._scene);
		assetsManager.addMeshTask("scene", null, "/games/pong/scenes/", "SampleScene.gltf")
		await SceneManager.LoadRuntimeAssets(assetsManager, [ "SampleScene.gltf" ], () => {
			SceneManager.HideLoadingScreen(this._engine);
            SceneManager.FocusRenderCanvas(this._scene);
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
