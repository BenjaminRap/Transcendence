import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HavokPlugin } from "@babylonjs/core/Physics";
import { io } from 'socket.io-client'

import HavokPhysics from "@babylonjs/havok";
import { FrontendSceneData } from "./FrontendSceneData";
import { Color4 } from "@babylonjs/core";

import.meta.glob("./attachedScripts/*.ts", { eager: true});
import.meta.glob("@shared/attachedScripts/*", { eager: true});

export class PongGame extends HTMLElement {
	private _canvas : HTMLCanvasElement;
	private _engine! : Engine;
	private _scene : Scene | undefined;

    public constructor() {
		super();
		this.classList.add("relative", "block");
		this._canvas = document.createElement("canvas");
		this._canvas.className = "w-full aspect-video relative"
		this.appendChild(this._canvas);
	}

	public async connectedCallback() : Promise<void> {
		try {
			this._engine = this.createEngine();
			globalThis.HK = await HavokPhysics();
			await SceneManager.InitializeRuntime(this._engine, { showDefaultLoadingScreen: true, hideLoadingUIWithEngine: false });
			this._scene = await this.getNewScene("Menu.gltf");
			this._engine.runRenderLoop(this.renderScene.bind(this));
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
		});
	}

	public async changeScene(newSceneName : string) : Promise<void>
	{
		if (this._scene)
			this._scene.dispose();
		this._scene = await this.getNewScene(newSceneName);
	}

	private	async getNewScene(sceneName : string) : Promise<Scene>
	{
		const	scene = new Scene(this._engine);

		if (!scene.metadata)
			scene.metadata = {};
		scene.metadata.sceneData = new FrontendSceneData(this);
		const	cam = new FreeCamera("camera1", Vector3.Zero(), scene);
		const	assetsManager = new AssetsManager(scene);

		globalThis.HKP = new HavokPlugin(false);
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

	private	joinMultiplayer()
	{
		const	socket = io("/", {
			path: "/api/socket.io/"
		});

		socket.on("connect_error", (error : Error) => {
			console.log(`Socket error : ${error}`);
			socket.disconnect();
		});
		socket.emit("join-matchmaking");

		socket.on("room-closed", () => {
			console.log("room-closed !");
			socket.off("game-infos");
			socket.emit("join-matchmaking");
		});

		socket.on("joined-game", () => {
			console.log("joined a room !");
			socket.on("game-infos", (gameInfos : any) => {
			})
		});
	}

	private onSceneLoaded(scene : Scene) : void {
		SceneManager.HideLoadingScreen(this._engine);
		SceneManager.FocusRenderCanvas(scene);
		scene.activeCameras = scene.cameras;
		scene.activeCameras[0].attachControl();
	}

	public disconnectedCallback() : void {
		if (globalThis.HKP)
			delete globalThis.HKP;
		if (globalThis.HKP)
			delete globalThis.HKP;
		this._engine?.dispose();
		this._scene?.dispose();
	}
}

customElements.define("pong-game", PongGame);
