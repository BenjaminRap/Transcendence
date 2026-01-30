import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { InputController, SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { XMLHttpRequest } from 'w3c-xmlhttprequest';

import { NullEngine, NullEngineOptions } from "@babylonjs/core";
import { importGlob } from "./importUtils";
import { ServerSceneData } from "./ServerSceneData";
import { PongError } from "@shared/pongError/PongError";

importGlob("dev/backend/typescript/pong/attachedScripts/*.js");
importGlob("dev/shared/attachedScripts/*.js");

export class ServerPongGame {
	private _engine! : Engine;
	private _scene? : Scene;
	private _assetsManager : AssetsManager | null = null;

    constructor(sceneData : ServerSceneData) {
		this.init(sceneData);
	}

	private async init(sceneData : ServerSceneData) : Promise<void> {
		try {
			this._engine = this.createEngine();
			this._scene = await this.loadScene(sceneData);
			this._engine.runRenderLoop(this.renderScene.bind(this));
		} catch (error : any) {
			console.error(`Could not initialize the scene : ${error}`)
		}
    }

	private renderScene() : void
	{
		try {
			this._scene?.render();
		} catch (error : any) {
			console.error(`Could not render the scene : ${error}`)
		}
	}

	private createEngine() : Engine
	{
		const	options = new NullEngineOptions()

		options.deterministicLockstep = true,
		options.lockstepMaxSteps = 4;

		return new NullEngine(options);
	}

	private async loadScene(sceneData : ServerSceneData) : Promise<Scene> {
		const	scene = new Scene(this._engine);

		if (!scene.metadata)
			scene.metadata = {};
		scene.metadata.sceneData = sceneData;
		new FreeCamera("camera1", Vector3.Zero(), scene);
		await SceneManager.InitializeRuntime(this._engine, {
			hardwareScalingLevel: 0
		});
		if (!scene.enablePhysics(Vector3.Zero(), sceneData.havokPlugin))
			throw new PongError("The physics engine hasn't been initialized !", "quitPong");
		await this.loadAssets(scene);

		return scene;
	}

	private async loadAssets(scene : Scene) : Promise<void>
	{
		const	sceneName = "Server.gltf";

		this._assetsManager = new AssetsManager(scene);
		this._assetsManager.addMeshTask("scene", null, "http://localhost:8181/scenes/", sceneName);

		(globalThis as any).window = { setTimeout: setTimeout, removeEventListener: () => {} };
		(globalThis as any).XMLHttpRequest = XMLHttpRequest;
		SceneManager.ForceHideLoadingScreen = () => {};
		InputController.ConfigureUserInput = () => {};
		await this._assetsManager.loadAsync();
		this._assetsManager = null;
		globalThis.HKP = undefined;
	}


	private disposeScene()
	{
		this._assetsManager?.reset();
		this._assetsManager = null;
		if (this._scene === undefined)
			return ;
		const	sceneData = getServerSceneData(this._scene);

		sceneData.dispose();
		this._scene.dispose();
	}

	public dispose() : void {
		queueMicrotask(() => {
			try {
				if (globalThis.HKP)
					delete globalThis.HKP;
				if (globalThis.HKP)
					delete globalThis.HKP;
				this.disposeScene();
				this._engine.dispose();
			} catch (error) {
			}
		})
	}
}

export function	getServerSceneData(scene : Scene) : ServerSceneData
{
	if (!scene.metadata)
		throw new PongError("Scene metadata is undefined !", "quitPong");

	const	sceneData = scene.metadata.sceneData;
	return sceneData;
}
