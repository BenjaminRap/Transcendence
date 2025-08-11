import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneLoaderFlags } from "@babylonjs/core/Loading/sceneLoaderFlags";

import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
import "@babylonjs/core/Cameras/universalCamera";
import "@babylonjs/core/Meshes/groundMesh";
import "@babylonjs/core/Lights/directionalLight";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Materials/PBR/pbrMaterial";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/XR/features/WebXRDepthSensing";
import "@babylonjs/core/Rendering/depthRendererSceneComponent";
import "@babylonjs/core/Rendering/prePassRendererSceneComponent";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/materials/sky";

import { loadScene } from "babylonjs-editor-tools";

import { scriptsMap } from "./importScripts";

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

		SceneLoaderFlags.ForceFullSceneLoadingForIncremental = true;
		await loadScene("/scenes/example/", "example.babylon", this._scene, scriptsMap, {
			quality: "high",
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
