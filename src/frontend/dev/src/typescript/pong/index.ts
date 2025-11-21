import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HavokPlugin } from "@babylonjs/core/Physics";

import HavokPhysics from "@babylonjs/havok";
import { ClientInput, FrontendSceneData } from "./FrontendSceneData";
import { Color4 } from "@babylonjs/core";
import { SceneData } from "@shared/SceneData";
import { MultiplayerHandler } from "./MultiplayerHandler";
import { Settings } from "./Settings";

import.meta.glob("./attachedScripts/*.ts", { eager: true});
import.meta.glob("@shared/attachedScripts/*", { eager: true});

export type GameType = "Local" | "Multiplayer" | "Bot" | "Menu";

export class PongGame extends HTMLElement {
	private _canvas : HTMLCanvasElement;
	private _engine! : Engine;
	private _scene : Scene | undefined;
	private _multiplayerHandler : MultiplayerHandler;
	private _settings : Settings;

    public constructor() {
		super();
		this.classList.add("relative", "block");
		this._canvas = document.createElement("canvas");
		this._canvas.className = "w-full aspect-video relative"
		this._settings = new Settings();
		this._multiplayerHandler = new MultiplayerHandler();
		this.appendChild(this._canvas);
	}

	public async connectedCallback() : Promise<void> {
		try {
			this._engine = this.createEngine();
			globalThis.HK = await HavokPhysics();
			await SceneManager.InitializeRuntime(this._engine, { showDefaultLoadingScreen: true, hideLoadingUIWithEngine: false });
			this._scene = await this.getNewScene("Menu.gltf", "Menu", []);
			this._engine.runRenderLoop(this.renderScene.bind(this));
			this.addEventListener("click", () => { this._canvas.focus() });
		} catch (error) {
			console.error(`Could not initialize the scene : ${error}`)
		}
    }

	private renderScene() : void
	{
		try {
			if (this._scene)
				this._scene.render();
		} catch (error) {
			console.error(`Could not render the scene : ${error}`)
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
			deterministicLockstep: true,
			lockstepMaxSteps: 4
		});
	}

	private async changeScene(newSceneName : string, gameType : GameType, clientInputs : readonly ClientInput[]) : Promise<void>
	{
		if (this._scene)
			this.disposeScene();
		this._scene = await this.getNewScene(newSceneName, gameType, clientInputs);
	}

	public quit() : void
	{
		this.remove();
	}

	public goToMenuScene()
	{
		this._multiplayerHandler.disconnect();
		this.changeScene("Menu.gltf", "Menu", []);
	}

	public startLocalGame(sceneName : "Basic.gltf" | "Magic.gltf")
	{
		this._multiplayerHandler.disconnect();
		this.changeScene(sceneName, "Local", this._settings._playerInputs);
	}

	public startOnlineGame(sceneName : "Basic.gltf" | "Magic.gltf")
	{
		this.startOnlineGameAsync(sceneName);
	}

	private async startOnlineGameAsync(sceneName : "Basic.gltf" | "Magic.gltf") : Promise<void>
	{
		try {
			await this._multiplayerHandler.connect();
			await this._multiplayerHandler.joinGame();
			this.changeScene(sceneName, "Multiplayer", this._settings._playerInputs);
			this._multiplayerHandler.onServerMessage()!.add((gameInfos : any | "room-closed") => {
				if (gameInfos === "room-closed")
				{
					console.log("The room has been closed !");
					this.goToMenuScene();
				}
				else
					console.log(gameInfos);
			});
		} catch (error) {
			if (error !== "io client disconnect") // meaning we disconnected ourselves
				console.error(error);
			this.goToMenuScene();
		}
	}

	public	cancelMatchmaking()
	{
		this._multiplayerHandler.disconnect();
	}

	private	async getNewScene(sceneName : string, gameType : GameType, clientInputs : readonly ClientInput[]) : Promise<Scene>
	{
		const	scene = new Scene(this._engine);

		if (!scene.metadata)
			scene.metadata = {};
		globalThis.HKP = new HavokPlugin(false);
		scene.metadata.sceneData = new FrontendSceneData(globalThis.HKP, this, gameType, clientInputs);
		const	cam = new FreeCamera("camera1", Vector3.Zero(), scene);
		const	assetsManager = new AssetsManager(scene);

		if (!scene.enablePhysics(Vector3.Zero(), globalThis.HKP))
			throw new Error("The physics engine hasn't been initialized !");

		assetsManager.addMeshTask("scene", null, "/scenes/", sceneName)

		await SceneManager.LoadRuntimeAssets(assetsManager, [ sceneName ], () => {
			cam.dispose(); // removing the unecessary camera
			this.onSceneLoaded(scene);
			globalThis.HKP = undefined;
			scene.clearColor = new Color4(0, 0, 0, 1);
		});

		return scene;
	}

	private onSceneLoaded(scene : Scene) : void {
		SceneManager.HideLoadingScreen(this._engine);
		SceneManager.FocusRenderCanvas(scene);
		scene.activeCameras = scene.cameras;
		scene.activeCameras[0].attachControl();
	}

	private	disposeScene()
	{
		if (!this._scene)
			return ;
		if (this._scene.metadata && this._scene.metadata.sceneData instanceof SceneData)
			this._scene.metadata.sceneData.dispose();
		this._scene.dispose();
	}

	public disconnectedCallback() : void {
		this._multiplayerHandler.disconnect();
		if (globalThis.HKP)
			delete globalThis.HKP;
		if (globalThis.HKP)
			delete globalThis.HKP;
		this.disposeScene();
		this._engine?.dispose();
	}
}

customElements.define("pong-game", PongGame);
