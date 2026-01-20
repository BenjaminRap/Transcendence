import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { InputController, SceneManager } from "@babylonjs-toolkit/next";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { XMLHttpRequest } from 'w3c-xmlhttprequest';
import { NullEngine, NullEngineOptions } from "@babylonjs/core";
import { importGlob } from "./importUtils.js";
import { ServerSceneData } from "./ServerSceneData.js";
import { PongError } from "../../../shared/pongError/PongError.js";
importGlob("dev/backend/typescript/pong/attachedScripts/*.js");
importGlob("dev/shared/attachedScripts/*.js");
export class ServerPongGame {
    constructor(sceneData) {
        this.init(sceneData);
    }
    async init(sceneData) {
        try {
            this._engine = this.createEngine();
            this._scene = await this.loadScene(sceneData);
            this._engine.runRenderLoop(this.renderScene.bind(this));
        }
        catch (error) {
            console.error(`Could not initialize the scene : ${error}`);
        }
    }
    renderScene() {
        try {
            this._scene?.render();
        }
        catch (error) {
            console.error(`Could not render the scene : ${error}`);
        }
    }
    createEngine() {
        const options = new NullEngineOptions();
        options.deterministicLockstep = true,
            options.lockstepMaxSteps = 4;
        return new NullEngine(options);
    }
    async loadScene(sceneData) {
        const scene = new Scene(this._engine);
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
    async loadAssets(scene) {
        const assetsManager = new AssetsManager(scene);
        const sceneName = "Server.gltf";
        assetsManager.addMeshTask("scene", null, "http://localhost:8181/scenes/", sceneName);
        globalThis.window = { setTimeout: setTimeout, removeEventListener: () => { } };
        globalThis.XMLHttpRequest = XMLHttpRequest;
        SceneManager.ForceHideLoadingScreen = () => { };
        InputController.ConfigureUserInput = () => { };
        await assetsManager.loadAsync();
        globalThis.HKP = undefined;
    }
    disposeScene() {
        if (this._scene === undefined)
            return;
        const sceneData = getServerSceneData(this._scene);
        sceneData.dispose();
        this._scene.dispose();
    }
    dispose() {
        if (globalThis.HKP)
            delete globalThis.HKP;
        if (globalThis.HKP)
            delete globalThis.HKP;
        this.disposeScene();
        this._engine.dispose();
    }
}
export function getServerSceneData(scene) {
    if (!scene.metadata)
        throw new PongError("Scene metadata is undefined !", "quitPong");
    const sceneData = scene.metadata.sceneData;
    return sceneData;
}
