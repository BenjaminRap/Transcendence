import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { InputController, SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HavokPlugin } from "@babylonjs/core/Physics";
import path from 'path';
import fs from 'fs';
import { XMLHttpRequest } from 'w3c-xmlhttprequest';

import HavokPhysics from "@babylonjs/havok";
import { NullEngine } from "@babylonjs/core";
import { importGlob } from "./importUtils";
import { SceneData } from "./SceneData";

importGlob("dev/backend/pong/attachedScripts/*.js");
importGlob("dev/shared/attachedScripts/*.js");

export class ServerPongGame {
	private _engine! : Engine;
	private _scene! : Scene;

    constructor(sceneData : SceneData) {
		this.init(sceneData);
	}

	private async init(sceneData : SceneData) : Promise<void> {
		try {
			this._engine = this.createEngine();
			this._scene = await this.loadScene(sceneData);
			this._engine.runRenderLoop(this.renderScene.bind(this));
		} catch (error : any) {
			console.error(`Could not initialize the scene : ${error}`)
			if (error.stack)
				console.error(error.stack);
		}
    }

	private renderScene() : void
	{
		try {
			this._scene.render();
		} catch (error : any) {
			console.error(`Could not render the scene : ${error}`)
			if (error.stack)
				console.error((error as any).stack);
		}
	}

	private createEngine() : Engine
	{
		return new NullEngine();
	}

	private async loadScene(sceneData : SceneData) : Promise<Scene> {
		const	scene = new Scene(this._engine);

		if (!scene.metadata)
			scene.metadata = {};
		scene.metadata.sceneData = sceneData;
		new FreeCamera("camera1", Vector3.Zero(), scene);
		await SceneManager.InitializeRuntime(this._engine, {
			hardwareScalingLevel: 0
		});
		await this.loadPhysics(scene);
		await this.loadAssets(scene);

		return scene;
	}

	private async loadPhysics(scene : Scene) : Promise<void>
	{

		const wasmPath = path.resolve('./node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm');
		const wasmBinary = fs.readFileSync(wasmPath).buffer; // ArrayBuffer
		globalThis.HK = await HavokPhysics({
			wasmBinary: wasmBinary
		});
		globalThis.HKP = new HavokPlugin(false);

		if (!scene.enablePhysics(Vector3.Zero(), globalThis.HKP))
			throw new Error("The physics engine hasn't been initialized !");
	}

	private async loadAssets(scene : Scene) : Promise<void>
	{
		const	assetsManager = new AssetsManager(scene);
		const	sceneName = "Server.gltf";

		assetsManager.addMeshTask("scene", null, "http://localhost:8181/scenes/", sceneName);

		(globalThis as any).window = { setTimeout: setTimeout, removeEventListener: () => {} };
		(globalThis as any).XMLHttpRequest = XMLHttpRequest;
		SceneManager.ForceHideLoadingScreen = () => {};
		InputController.ConfigureUserInput = () => {};
		await SceneManager.LoadRuntimeAssets(assetsManager, [ sceneName ], () => {
		});
	}

	public dispose() : void {
		if (globalThis.HKP)
			delete globalThis.HKP;
		if (globalThis.HKP)
			delete globalThis.HKP;
		this._engine?.dispose();
		this._scene?.dispose();
	}
}
