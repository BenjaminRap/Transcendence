import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { AssetsManager, BinaryFileAssetTask, ContainerAssetTask, ImageAssetTask, MeshAssetTask, TextFileAssetTask } from '@babylonjs/core/Misc/assetsManager';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Light } from '@babylonjs/core/Lights/light';
import { Matrix, Quaternion, TmpVectors, Vector2, Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Material } from '@babylonjs/core/Materials/material';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import { Animation } from '@babylonjs/core/Animations/animation';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { AnimationGroup } from '@babylonjs/core/Animations/animationGroup';
import { Axis, Space } from '@babylonjs/core/Maths/math.axis';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Tools } from '@babylonjs/core/Misc/tools';
import { Tags } from '@babylonjs/core/Misc/tags';
import { EngineStore } from '@babylonjs/core/Engines/engineStore';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { Observable } from '@babylonjs/core/Misc/observable';
import { PhysicsViewer } from '@babylonjs/core/Debug/physicsViewer';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';
import { BoundingInfo } from '@babylonjs/core/Culling/boundingInfo';
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine';
import { GLTFFileLoader } from '@babylonjs/loaders/glTF/glTFFileLoader';
import { DefaultLoadingScreen } from '@babylonjs/core/Loading/loadingScreen';
import { GetClass, RegisterClass } from '@babylonjs/core/Misc/typeStore';
import { Skeleton } from '@babylonjs/core/Bones/skeleton';
import { PhysicsBody, PhysicsMaterialCombineMode, PhysicsMotionType, PhysicsRaycastResult, PhysicsShape, PhysicsShapeBox, PhysicsShapeCapsule, PhysicsShapeContainer, PhysicsShapeConvexHull, PhysicsShapeCylinder, PhysicsShapeMesh, PhysicsShapeSphere, PhysicsShapeType, ShapeCastResult } from '@babylonjs/core/Physics';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import { Epsilon } from '@babylonjs/core/Maths/math.constants';
import { ArrayItem, GLTFLoader } from '@babylonjs/loaders/glTF/2.0/glTFLoader';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import { Bone } from '@babylonjs/core/Bones/bone';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
import { SubMesh } from '@babylonjs/core/Meshes/subMesh';
import { RenderingManager } from '@babylonjs/core/Rendering/renderingManager';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Scalar } from '@babylonjs/core/Maths/math.scalar';
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { NodeMaterial } from '@babylonjs/core/Materials/Node/nodeMaterial';
import { CascadedShadowGenerator } from '@babylonjs/core/Lights/Shadows/cascadedShadowGenerator';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { SpotLight } from '@babylonjs/core/Lights/spotLight';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { Logger } from '@babylonjs/core/Misc/logger';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { CreateAudioEngineAsync, StaticSound } from '@babylonjs/core/AudioV2';
import { EnvironmentTextureTools } from '@babylonjs/core/Misc/environmentTextureTools';
import { DeepCopier } from '@babylonjs/core/Misc/deepCopier';
import { Sound } from '@babylonjs/core/Audio/sound';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';
import { Xbox360Pad } from '@babylonjs/core/Gamepads/xboxGamepad';
import { DualShockPad } from '@babylonjs/core/Gamepads/dualShockGamepad';
import { GamepadManager } from '@babylonjs/core/Gamepads/gamepadManager';
import { MorphTarget } from '@babylonjs/core/Morph/morphTarget';
import { Ray } from '@babylonjs/core/Culling/ray';
import { RayHelper } from '@babylonjs/core/Debug/rayHelper';
import { VideoTexture } from '@babylonjs/core/Materials/Textures/videoTexture';
import { CustomShaderMaterial } from './customshadermaterial';
import { CustomShaderMaterialPlugin } from './customshadermaterialplugin';
import { UniversalTerrainMaterial } from './universalterrainmaterial';
export class SceneManager {
    static get Version() { return "8.15.10 - R1"; }
    static get Copyright() { return "All rights reserved (c) 2024 Mackey Kinard"; }
    static GetEngine(scene) {
        let result = null;
        let engine = scene.getEngine();
        if (engine != null) {
            if (engine instanceof Engine) {
                result = engine;
            }
            else if (engine instanceof WebGPUEngine) {
                result = engine;
            }
        }
        return result;
    }
    ;
    static GetClass(name) {
        let result = GetClass(name);
        return result;
    }
    static RegisterClass(name, klass) {
        RegisterClass(name, klass);
    }
    static get EventBus() {
        if (SceneManager._EventBus == null)
            SceneManager._EventBus = new GlobalMessageBus();
        return SceneManager._EventBus;
    }
    static get PlaygroundCdn() { return "https://cdn.jsdelivr.net/gh/BabylonJS/BabylonToolkit@master/Runtime/"; }
    static get PlaygroundRepo() { return "https://www.babylontoolkit.com/playground/"; }
    static async InitializePlayground(engine, options = null) {
        console.warn("SceneManager.InitializePlayground() is deprecated. Use SceneManager.InitializeRuntime() instead.");
        return SceneManager.InitializeRuntime(engine, options);
    }
    static async InitializeRuntime(engine, options = null) {
        Tools.Log("Babylon.js Toolkit v" + SceneManager.Version);
        const hardwareScalingLevel = (options != null && options.hardwareScalingLevel != null) ? options.hardwareScalingLevel : WindowManager.GetHardwareScalingLevel();
        const initSceneFileLoaders = (options != null && options.initSceneFileLoaders != null) ? options.initSceneFileLoaders : true;
        const loadAsyncRuntimeLibs = (options != null && options.loadAsyncRuntimeLibs != null) ? options.loadAsyncRuntimeLibs : true;
        const defaultProjectScriptBundle = (SceneManager.PlaygroundCdn + "default.playground.js");
        const loadProjectScriptBundle = (options != null && options.loadProjectScriptBundle != null) ? options.loadProjectScriptBundle : false;
        const projectScriptBundleUrl = (options != null && options.projectScriptBundleUrl != null) ? options.projectScriptBundleUrl : defaultProjectScriptBundle;
        const showDefaultLoadingScreen = (options != null && options.showDefaultLoadingScreen != null) ? options.showDefaultLoadingScreen : false;
        const hideLoadingUIWithEngine = (options != null && options.hideLoadingUIWithEngine != null) ? options.hideLoadingUIWithEngine : true;
        const defaultLoadingUIMarginTop = (options != null && options.defaultLoadingUIMarginTop != null) ? options.defaultLoadingUIMarginTop : "150px";
        if (showDefaultLoadingScreen === true)
            SceneManager.ShowLoadingScreen(engine, hideLoadingUIWithEngine, defaultLoadingUIMarginTop);
        if (hardwareScalingLevel != null && hardwareScalingLevel > 0)
            engine.setHardwareScalingLevel(hardwareScalingLevel);
        SceneManager.UniversalModuleDefinition = false;
        try {
            SceneManager.InitializeSceneLoaderPlugin();
        }
        catch (error) {
            console.warn("Babylon Toolkit: Failed to initialize loader plugin:", error);
        }
        try {
            if (loadAsyncRuntimeLibs === true) {
                await import('@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent');
                await import('@babylonjs/core/Rendering/depthRendererSceneComponent');
            }
        }
        catch (error) {
            console.warn("Babylon Toolkit: Failed to initialize runtime libraries:", error);
        }
        try {
            if (initSceneFileLoaders === true) {
                await import('@babylonjs/loaders/glTF');
                const { registerGLTFExtension } = await import('@babylonjs/loaders/glTF/2.0/glTFLoaderExtensionRegistry');
                if (registerGLTFExtension) {
                    if (!SceneManager.CVTOOLS_NAME_REGISTERED) {
                        registerGLTFExtension(SceneManager.CVTOOLS_NAME, true, (loader) => new CVTOOLS_unity_metadata(loader));
                        SceneManager.CVTOOLS_NAME_REGISTERED = true;
                    }
                    if (!SceneManager.CVTOOLS_MESH_REGISTERED) {
                        registerGLTFExtension(SceneManager.CVTOOLS_MESH, true, (loader) => new CVTOOLS_babylon_mesh(loader));
                        SceneManager.CVTOOLS_MESH_REGISTERED = true;
                    }
                    if (!SceneManager.CVTOOLS_HAND_REGISTERED) {
                        registerGLTFExtension(SceneManager.CVTOOLS_HAND, true, (loader) => new CVTOOLS_left_handed(loader));
                        SceneManager.CVTOOLS_HAND_REGISTERED = true;
                    }
                }
                else {
                    console.warn("Babylon Toolkit: ES6 GLTF Parser not registered because RegisterGLTFExtension is not available.");
                }
            }
        }
        catch (error) {
            console.warn("Babylon Toolkit: Failed to initialize GLTF extensions:", error);
        }
        if (loadProjectScriptBundle === true && projectScriptBundleUrl != null && projectScriptBundleUrl !== "") {
            const projectScriptBundleId = projectScriptBundleUrl.substring(projectScriptBundleUrl.lastIndexOf('/') + 1).toLowerCase();
            await Tools.LoadScriptAsync(projectScriptBundleUrl, projectScriptBundleId);
        }
    }
    static InitializeSceneLoaderPlugin() {
        SceneLoader.OnPluginActivatedObservable.add((loader) => {
            if (loader != null && loader.name === "gltf" && loader instanceof GLTFFileLoader) {
                const extensions = loader.extensions;
                loader.animationStartMode = SceneManager.AnimationStartMode;
                loader.targetFps = SceneManager.AnimationTargetFps;
                if (loader.onSkinLoadedObservable) {
                    loader.onSkinLoadedObservable.add((data) => {
                        if (data != null) {
                            try {
                                if (data.skinnedNode != null) {
                                    data.skinnedNode.id += ".Skin";
                                }
                            }
                            catch (e1) {
                                console.warn(e1);
                            }
                            try {
                                if (data.skinnedNode != null) {
                                    data.skinnedNode.name += ".Skin";
                                }
                            }
                            catch (e2) {
                                console.warn(e2);
                            }
                            try {
                                if (data.node != null && data.skinnedNode != null) {
                                    const tags = Tags.GetTags(data.node);
                                    if (tags != null)
                                        Tags.AddTagsTo(data.skinnedNode, tags);
                                    data.node._skinnedMesh = data.skinnedNode;
                                }
                                else {
                                    console.warn("Babylon Toolkit: Skinned node not found in scene loader plugin: ", data);
                                }
                            }
                            catch (e3) {
                                console.warn(e3);
                            }
                        }
                    });
                }
            }
        });
    }
    static async LoadRuntimeAssets(assetsManager, requiredFilenames, readyHandler, maxTimeout = 60, debugMode = false) {
        SceneManager.SetOnSceneReadyHandler(requiredFilenames, readyHandler, maxTimeout, debugMode);
        if (assetsManager != null)
            await assetsManager.loadAsync();
    }
    static ShowLoadingScreen(engine, hideLoadingUIWithEngine = true, defaultLoadingUIMarginTop = "150px") {
        if (engine.loadingScreen != null) {
            SceneManager._HideLoadingScreen = engine.loadingScreen.hideLoadingUI.bind(engine.loadingScreen);
            if (hideLoadingUIWithEngine === false)
                engine.loadingScreen.hideLoadingUI = () => { };
            const anyLoadingScreen = engine.loadingScreen;
            anyLoadingScreen._loadingDivBackgroundColor = "#2A2342";
            engine.displayLoadingUI();
            if (anyLoadingScreen._loadingTextDiv != null && anyLoadingScreen._loadingTextDiv.style != null) {
                anyLoadingScreen._loadingTextDiv.style.marginTop = defaultLoadingUIMarginTop;
            }
        }
    }
    static HideLoadingScreen(engine) {
        if (engine.loadingScreen instanceof DefaultLoadingScreen) {
            if (SceneManager._HideLoadingScreen != null) {
                SceneManager._HideLoadingScreen();
            }
            else {
                engine.hideLoadingUI();
            }
        }
        else {
            SceneManager.ForceHideLoadingScreen();
        }
    }
    static ForceHideLoadingScreen() {
        try {
            SceneManager.DoForceHideLoadingScreen();
        }
        catch (error1) {
            console.warn(error1);
        }
        finally {
            try {
                SceneManager.DoForceHideLoadingScreen();
            }
            catch (error2) {
                console.warn(error2);
            }
            finally {
                try {
                    SceneManager.DoForceHideLoadingScreen();
                }
                catch (error3) {
                    console.warn(error3);
                }
            }
        }
    }
    static DoForceHideLoadingScreen() {
        var bjsLoadingDiv = document.getElementById("babylonjsLoadingDiv");
        var bjsLoadingText = document.getElementById("babylonjsLoadingText");
        var bjsLoadingDivStyle = document.getElementById("babylonjsLoadingDivStyle");
        try {
            if (bjsLoadingText != null) {
                bjsLoadingText.remove();
                bjsLoadingText = null;
            }
        }
        catch (error1) {
            console.warn(error1);
        }
        try {
            if (bjsLoadingDiv != null) {
                bjsLoadingDiv.remove();
                bjsLoadingDiv = null;
            }
        }
        catch (error2) {
            console.warn(error2);
        }
        try {
            if (bjsLoadingDivStyle != null) {
                bjsLoadingDivStyle.remove();
            }
        }
        catch (error3) {
            console.warn(error3);
        }
    }
    static FocusRenderCanvas(scene) {
        scene.getEngine().getRenderingCanvas().focus();
    }
    static SetOnSceneReadyHandler(filenames, handler, timeout = 60, debug = false) {
        SceneManager.SceneLoaderPropertyBag = {};
        SceneManager.SceneLoaderHandledFlag = false;
        SceneManager.SceneLoaderFileNames = filenames;
        SceneManager.SceneLoaderFileNames.forEach((filename) => { SceneManager.SceneLoaderPropertyBag[filename.toLowerCase()] = false; });
        SceneManager.OnSceneReadyObservable.clear();
        SceneManager.OnSceneReadyObservable.add((filename) => {
            if (debug === true)
                console.log("OnSceneReady(): " + filename);
            SceneManager.SceneLoaderPropertyBag[filename.toLowerCase()] = true;
            const allSceneFilesReady = Object.values(SceneManager.SceneLoaderPropertyBag).every(value => value === true);
            if (allSceneFilesReady === true) {
                try {
                    if (handler)
                        handler();
                }
                catch (e) {
                    console.warn(e);
                }
                finally {
                    SceneManager.SceneLoaderHandledFlag = true;
                }
            }
        });
        WindowManager.SetTimeout((timeout * 1000), () => {
            if (SceneManager.SceneLoaderHandledFlag === false) {
                try {
                    if (handler)
                        handler();
                }
                catch (e) {
                    console.warn(e);
                }
                finally {
                    SceneManager.SceneLoaderHandledFlag = true;
                    SceneManager.ForceHideLoadingScreen();
                }
            }
        });
    }
    static EnableSceneParsing(enabled) {
        SceneManager.SceneParsingEnabled = enabled;
    }
    static IsSceneParsingEnabled() {
        return SceneManager.SceneParsingEnabled;
    }
    static HasSceneBeenPreLoaded(scene) {
        const ascene = scene;
        return (ascene._preloaded != null && ascene._preloaded === true);
    }
    static GetDefaultSkybox(scene) {
        return scene.getMeshById("Default Skybox");
    }
    static GetIntensityFactor() {
        return (SceneManager.GlobalOptions["intensityFactor"] != null) ? SceneManager.GlobalOptions["intensityFactor"] : 2.0;
    }
    static GetRenderQuality() {
        let result = RenderQuality.High;
        let quality = SceneManager.GlobalOptions["renderQuality"];
        if (quality != null)
            result = quality;
        return result;
    }
    static SetRenderQuality(quality) {
        SceneManager.GlobalOptions["renderQuality"] = quality;
    }
    static GetEngineVersionString(scene) {
        let result = "Unknown";
        const lastScene = scene || SceneManager.GetLastCreatedScene();
        if (lastScene != null) {
            const engine = SceneManager.GetEngine(lastScene);
            if (engine != null) {
                let glinfo = engine.getInfo();
                if (glinfo != null) {
                    result = (glinfo.version + " - " + glinfo.renderer);
                }
            }
        }
        return result;
    }
    static SetWindowState(name, data) {
        SceneManager.WindowState[name] = data;
    }
    static GetWindowState(name) {
        let result = SceneManager.WindowState[name];
        return (result != null) ? result : null;
    }
    static IsDebugMode() {
        return (SceneManager.GlobalOptions["debugModeEnabled"] != null && SceneManager.GlobalOptions["debugModeEnabled"] === true);
    }
    static ConsoleLog(...data) {
        if (SceneManager.IsDebugMode()) {
            console.log(...data);
        }
    }
    static ConsoleInfo(...data) {
        if (SceneManager.IsDebugMode()) {
            console.info(...data);
        }
    }
    static ConsoleWarn(...data) {
        if (SceneManager.IsDebugMode()) {
            console.warn(...data);
        }
    }
    static ConsoleError(...data) {
        console.error(...data);
    }
    static LogMessage(message) {
        if (SceneManager.IsDebugMode()) {
            Tools.Log(message);
        }
    }
    static LogWarning(warning) {
        if (SceneManager.IsDebugMode()) {
            Tools.Warn(warning);
        }
    }
    static LogError(error) {
        Tools.Error(error);
    }
    static GetTime() {
        return SceneManager.GetTimeMilliseconds() * 0.001;
    }
    static GetTimeMs() {
        return SceneManager.GetTimeMilliseconds();
    }
    static GetGameTime() {
        return (SceneManager.GetTimeMilliseconds() - SceneManager.GameTimeMilliseconds) * 0.001;
    }
    static GetGameTimeMs() {
        return (SceneManager.GetTimeMilliseconds() - SceneManager.GameTimeMilliseconds);
    }
    static GetDeltaTime(scene, applyAnimationRatio = false) {
        return SceneManager.GetDeltaSeconds(scene, applyAnimationRatio);
    }
    static GetDeltaSeconds(scene, applyAnimationRatio = false) {
        let lastScene = scene || SceneManager.GetLastCreatedScene();
        let deltaTime = Math.max(Scene.MinDeltaTime, Math.min(lastScene.getEngine().getDeltaTime(), Scene.MaxDeltaTime)) * 0.001;
        if (applyAnimationRatio === true)
            deltaTime *= lastScene.getAnimationRatio();
        return deltaTime;
    }
    static GetDeltaMilliseconds(scene, applyAnimationRatio = false) {
        let lastScene = scene || SceneManager.GetLastCreatedScene();
        let deltaTime = Math.max(Scene.MinDeltaTime, Math.min(lastScene.getEngine().getDeltaTime(), Scene.MaxDeltaTime));
        if (applyAnimationRatio === true)
            deltaTime *= lastScene.getAnimationRatio();
        return deltaTime;
    }
    static GetTimeMilliseconds() {
        let result = 0;
        if (typeof window !== 'undefined' && window.performance) {
            result = window.performance.now();
        }
        else if (typeof window !== 'undefined' && window.Date) {
            result = window.Date.now();
        }
        else if (Date != null) {
            result = Date.now();
        }
        return result;
    }
    static GetAnimationRatio(scene) {
        const lastScene = scene || SceneManager.GetLastCreatedScene();
        return lastScene.getAnimationRatio();
    }
    static RunOnce(scene, func, timeout) {
        scene.executeOnceBeforeRender(func, timeout);
    }
    static DisposeScene(scene, clearColor = new Color4(0, 0, 0, 1)) {
        const engine = scene.getEngine();
        scene.dispose();
        engine.clear(clearColor, true, true, true);
    }
    static SafeDestroy(transform, delay = 5, disable = false) {
        if (delay > 0) {
            if (disable === true)
                transform.setEnabled(false);
            WindowManager.SetTimeout(delay, () => { transform.dispose(false, false); });
        }
        else {
            transform.dispose(false, false);
        }
    }
    static GetRootUrl(scene) {
        return (scene._rootUrl != null && scene._rootUrl !== "") ? scene._rootUrl : "/";
    }
    static SetRootUrl(scene, url) {
        scene._rootUrl = url;
    }
    static GetSceneFile(scene) {
        return (scene._fileName != null && scene._fileName !== "") ? scene._fileName : null;
    }
    static SetSceneFile(scene, fileName) {
        scene._fileName = fileName;
    }
    static GetEngineInstances() {
        return EngineStore.Instances;
    }
    static GetLastCreatedEngine() {
        return EngineStore.LastCreatedEngine;
    }
    static GetLastCreatedScene() {
        return EngineStore.LastCreatedScene;
    }
    static AddShadowCaster(light, transform, children = false) {
        const shadowGenerator = light?.getShadowGenerator();
        const shadowmap = shadowGenerator.getShadowMap();
        if (shadowmap.renderList == null)
            shadowmap.renderList = [];
        if (transform instanceof AbstractMesh) {
            if (shadowmap.renderList.indexOf(transform) < 0) {
                shadowmap.renderList.push(transform);
            }
        }
        if (children === true) {
            const childlist = transform.getChildMeshes(false);
            if (childlist != null) {
                childlist.forEach((child) => {
                    if (shadowmap.renderList.indexOf(child) < 0) {
                        shadowmap.renderList.push(child);
                    }
                });
            }
        }
    }
    static IsPhysicsViewerEnabled() { return SceneManager.PhysicsViewersEnabled; }
    static TogglePhysicsViewer(scene) {
        SceneManager.PhysicsViewersEnabled = !SceneManager.PhysicsViewersEnabled;
        if (SceneManager.PhysicsViewersEnabled) {
            const physicsViewer = new PhysicsViewer(scene);
            if (scene.reservedDataStore == null)
                scene.reservedDataStore = {};
            scene.reservedDataStore.physicsViewer = physicsViewer;
            for (const mesh of scene.meshes) {
                if (mesh.physicsImpostor) {
                    const debugMesh = physicsViewer.showImpostor(mesh.physicsImpostor, mesh);
                    if (debugMesh) {
                        debugMesh.reservedDataStore = { hidden: true };
                        if (debugMesh.material)
                            debugMesh.material.reservedDataStore = { hidden: true };
                    }
                }
                else if (mesh.physicsBody) {
                    const debugMesh = physicsViewer.showBody(mesh.physicsBody);
                    if (debugMesh) {
                        debugMesh.reservedDataStore = { hidden: true };
                        if (debugMesh.material)
                            debugMesh.material.reservedDataStore = { hidden: true };
                    }
                }
            }
            for (const transformNode of scene.transformNodes) {
                if (transformNode.physicsBody) {
                    const debugMesh = physicsViewer.showBody(transformNode.physicsBody);
                    if (debugMesh) {
                        debugMesh.reservedDataStore = { hidden: true };
                        if (debugMesh.material)
                            debugMesh.material.reservedDataStore = { hidden: true };
                    }
                }
            }
        }
        else {
            if (scene.reservedDataStore && scene.reservedDataStore.physicsViewer) {
                scene.reservedDataStore.physicsViewer.dispose();
                scene.reservedDataStore.physicsViewer = null;
            }
        }
    }
    static GetImportMeshes(scene, name) {
        if (scene == null || name == null || name === "")
            return null;
        return (scene.importMeshes != null) ? scene.importMeshes.get(name.toLowerCase()) : null;
    }
    static GetImportMeshesMap(scene) {
        if (scene == null)
            return null;
        return (scene.importMeshes != null) ? scene.importMeshes : null;
    }
    static ClearImportMeshes(scene) {
        if (scene == null)
            return null;
        if (scene.importMeshes != null) {
        }
        scene.importMeshes = new Map();
    }
    static RegisterImportMeshes(scene, name, meshes) {
        if (scene == null || name == null || name === "" || meshes == null)
            return;
        if (scene.importMeshes == null)
            scene.importMeshes = new Map();
        scene.importMeshes.set(name.toLowerCase(), meshes);
    }
    static LoadImportMeshes(meshNames, rootUrl, sceneFilename, scene, onSuccess, onProgress, onError, pluginExtension, name) {
        let result = null;
        const nameKey = rootUrl + sceneFilename;
        const cachedMeshes = SceneManager.GetImportMeshes(scene, nameKey);
        if (cachedMeshes != null) {
            if (onSuccess)
                onSuccess(cachedMeshes);
        }
        else {
            result = SceneLoader.ImportMesh(meshNames, rootUrl, sceneFilename, scene, (meshes) => {
                SceneManager.RegisterImportMeshes(scene, nameKey, meshes);
                if (onSuccess)
                    onSuccess(meshes);
            }, onProgress, onError, pluginExtension, name);
        }
        return result;
    }
    static async LoadImportMeshesAsync(meshNames, rootUrl, sceneFilename, scene, onProgress, pluginExtension, name) {
        const nameKey = rootUrl + sceneFilename;
        const cachedMeshes = SceneManager.GetImportMeshes(scene, nameKey);
        if (cachedMeshes != null) {
            return cachedMeshes;
        }
        else {
            let meshes = null;
            let result = await SceneLoader.ImportMeshAsync(meshNames, rootUrl, sceneFilename, scene, onProgress, pluginExtension, name);
            if (result != null && result.meshes != null)
                meshes = result.meshes;
            SceneManager.RegisterImportMeshes(scene, nameKey, meshes);
            return meshes;
        }
    }
    static GetAssetContainer(scene, name) {
        if (scene == null || name == null || name === "")
            return null;
        return (scene.assetContainers != null) ? scene.assetContainers.get(name.toLowerCase()) : null;
    }
    static GetAssetContainerMap(scene) {
        if (scene == null)
            return null;
        return (scene.assetContainers != null) ? scene.assetContainers : null;
    }
    static ClearAssetContainers(scene) {
        if (scene == null)
            return null;
        if (scene.assetContainers != null) {
        }
        scene.assetContainers = new Map();
    }
    static RegisterAssetContainer(scene, name, container) {
        if (scene == null || name == null || name === "" || container == null)
            return;
        if (scene.assetContainers == null)
            scene.assetContainers = new Map();
        scene.assetContainers.set(name.toLowerCase(), container);
    }
    static LoadAssetContainer(rootUrl, sceneFilename, scene, onSuccess, onProgress, onError, pluginExtension, name) {
        const nameKey = rootUrl + sceneFilename;
        const cachedContainer = SceneManager.GetAssetContainer(scene, nameKey);
        if (cachedContainer != null) {
            if (onSuccess)
                onSuccess(cachedContainer);
        }
        else {
            SceneLoader.LoadAssetContainer(rootUrl, sceneFilename, scene, (container) => {
                SceneManager.RegisterAssetContainer(scene, nameKey, container);
                if (onSuccess)
                    onSuccess(container);
            }, onProgress, onError, pluginExtension, name);
        }
    }
    static async LoadAssetContainerAsync(rootUrl, sceneFilename, scene, onProgress, pluginExtension, name) {
        const nameKey = rootUrl + sceneFilename;
        const cachedContainer = SceneManager.GetAssetContainer(scene, nameKey);
        if (cachedContainer != null) {
            return cachedContainer;
        }
        else {
            const container = await SceneLoader.LoadAssetContainerAsync(rootUrl, sceneFilename, scene, onProgress, pluginExtension, name);
            SceneManager.RegisterAssetContainer(scene, nameKey, container);
            return container;
        }
    }
    static GetMesh(scene, name) {
        if (scene == null)
            return null;
        return scene.getNodeByName(name);
    }
    static GetMeshByID(scene, id) {
        if (scene == null)
            return null;
        return scene.getNodeById(id);
    }
    static GetAbstractMesh(scene, name) {
        if (scene == null)
            return null;
        return scene.getNodeByName(name);
    }
    static GetAbstractMeshByID(scene, id) {
        if (scene == null)
            return null;
        return scene.getNodeById(id);
    }
    static GetTransformNode(scene, name) {
        if (scene == null)
            return null;
        return scene.getNodeByName(name);
    }
    static GetTransformNodeByID(scene, id) {
        if (scene == null)
            return null;
        return scene.getNodeById(id);
    }
    static GetTransformDetailMesh(transform) {
        let result = null;
        const detailName = transform.name + ".Detail";
        const detailChildren = transform.getChildren((node) => { return (node.name === detailName && node instanceof AbstractMesh); }, true);
        if (detailChildren != null && detailChildren.length > 0) {
            result = detailChildren[0];
        }
        return result;
    }
    static GetSkinnedMesh(transform) {
        return (transform._skinnedMesh != null) ? transform._skinnedMesh : null;
    }
    static GetPrimitiveMeshes(transform) {
        return transform.getChildMeshes(true, (node) => { return (node.name.indexOf("_primitive") >= 0); });
    }
    static GetTransformLayer(transform) {
        return (transform.metadata != null && transform.metadata.toolkit != null && transform.metadata.toolkit.layer != null) ? transform.metadata.toolkit.layer : 0;
    }
    static GetTransformLayerMask(transform) {
        return (transform.metadata != null && transform.metadata.toolkit != null && transform.metadata.toolkit.layermask != null) ? transform.metadata.toolkit.layermask : 1;
    }
    static GetTransformLayerName(transform) {
        return (transform.metadata != null && transform.metadata.toolkit != null && transform.metadata.toolkit.layername != null && transform.metadata.toolkit.layername !== "") ? transform.metadata.toolkit.layername : "Default";
    }
    static GetTransformTag(transform) {
        return (transform.metadata != null && transform.metadata.toolkit != null && transform.metadata.toolkit.group != null && transform.metadata.toolkit.group !== "") ? transform.metadata.toolkit.group : "Untagged";
    }
    static HasTransformTags(transform, query) {
        return Tags.MatchesQuery(transform, query);
    }
    static TextureFloatSupported(scene) {
        let supportsHalfFloats = false;
        let supportsFullFloats = false;
        const engine = scene.getEngine();
        const caps = engine.getCaps();
        if (caps.textureHalfFloatRender && caps.textureHalfFloatLinearFiltering) {
            supportsHalfFloats = true;
        }
        else if (caps.textureFloatRender && caps.textureFloatLinearFiltering) {
            supportsFullFloats = true;
        }
        return (supportsHalfFloats || supportsFullFloats);
    }
    static RegisterClickAction(scene, mesh, func) {
        let result = null;
        if (mesh != null) {
            mesh.isPickable = true;
            if (mesh.actionManager == null)
                mesh.actionManager = new ActionManager(scene);
            result = mesh.actionManager.registerAction(new ExecuteCodeAction({ trigger: ActionManager.OnPickTrigger }, func));
        }
        return result;
    }
    static UnregisterClickAction(mesh, action) {
        let result = false;
        if (mesh != null && action != null) {
            result = mesh.actionManager.unregisterAction(action);
        }
        return result;
    }
    static StartTweenAnimation(scene, name, targetObject, targetProperty, startValue, endValue, defaultSpeedRatio = 1.0, defaultFrameRate = null, defaultLoopMode = null, defaultEasingFunction = null, onAnimationComplete = null) {
        const speedRatio = defaultSpeedRatio || 1.0;
        const frameRate = defaultFrameRate || 30;
        const loopMode = defaultLoopMode || Animation.ANIMATIONLOOPMODE_CONSTANT;
        const tweenAnim = Utilities.CreateTweenAnimation(name, targetProperty, startValue, endValue, frameRate, loopMode);
        if (defaultEasingFunction != null)
            tweenAnim.setEasingFunction(defaultEasingFunction);
        const lastValue = Utilities.GetLastKeyFrameIndex(tweenAnim);
        const loopAnim = (loopMode != Animation.ANIMATIONLOOPMODE_CONSTANT);
        return scene.beginDirectAnimation(targetObject, [tweenAnim], 0, lastValue, loopAnim, speedRatio, onAnimationComplete);
    }
    static GetMaterialWithName(scene, name) {
        let result = null;
        if (scene.materials != null && scene.materials.length > 0) {
            const mcount = scene.materials.length;
            for (let index = 0; index < scene.materials.length; index++) {
                const mat = scene.materials[index];
                if (mat.name.startsWith(name)) {
                    result = mat;
                    break;
                }
            }
        }
        return result;
    }
    static GetAllMaterialsWithName(scene, name) {
        let result = null;
        if (scene.materials != null && scene.materials.length > 0) {
            const mcount = scene.materials.length;
            for (let index = 0; index < scene.materials.length; index++) {
                const mat = scene.materials[index];
                if (mat.name.startsWith(name)) {
                    if (result == null)
                        result = [];
                    result.push(mat);
                }
            }
        }
        return result;
    }
    static InstantiatePrefabFromScene(scene, prefabName, newName, newParent = null, newPosition = null, newRotation = null, newScaling = null, cloneAnimations = true) {
        let result = null;
        if (scene != null && prefabName != null && prefabName !== "") {
            let prefab = scene.getNodeByName(prefabName);
            if (prefab != null) {
                result = prefab.clone(newName, newParent, false);
                if (result != null) {
                    if (newPosition != null)
                        result.position = newPosition.clone();
                    if (newRotation != null)
                        result.rotationQuaternion = newRotation.clone();
                    if (newScaling != null)
                        result.scaling = newScaling.clone();
                    let clones = null;
                    let childs = result.getChildren(null, false);
                    if (childs != null)
                        clones = childs;
                    if (clones == null)
                        clones = [result];
                    else
                        clones.unshift(result);
                    clones.forEach((clone) => {
                        clone.setEnabled(true);
                        if (clone instanceof AbstractMesh && clone.metadata != null && clone.metadata.shadowCastingMode != null && clone.metadata.shadowCastingMode !== 0) {
                            scene.lights.forEach((light) => {
                                let shadowGenerator = light.getShadowGenerator();
                                if (shadowGenerator != null) {
                                    const culling = (light.includedOnlyMeshes != null && light.includedOnlyMeshes.length > 0);
                                    if (culling === false) {
                                        const shadowmap = shadowGenerator.getShadowMap();
                                        if (shadowmap.renderList == null)
                                            shadowmap.renderList = [];
                                        if (shadowmap.renderList.indexOf(clone) < 0) {
                                            shadowmap.renderList.push(clone);
                                        }
                                    }
                                }
                            });
                        }
                        if (clone instanceof Mesh) {
                            if (clone.source != null) {
                                let aclone = clone;
                                if (clone.skeleton == null && clone.source.skeleton != null) {
                                    let skeletonName = clone.source.skeleton.name + ".Skeleton";
                                    let skeletonIdentity = skeletonName + "." + clone.source.skeleton.id;
                                    clone.skeleton = clone.source.skeleton.clone(skeletonName, skeletonIdentity);
                                    if (clone.skeleton != null && clone.skeleton.bones != null && clone.source.skeleton.bones != null) {
                                        if (clone.skeleton.bones.length === clone.source.skeleton.bones.length) {
                                            let boneCount = clone.skeleton.bones.length;
                                            for (let boneIndex = 0; boneIndex < boneCount; boneIndex++) {
                                                if (clone.skeleton.bones[boneIndex].metadata == null && clone.source.skeleton.bones[boneIndex].metadata != null) {
                                                    clone.skeleton.bones[boneIndex].metadata = clone.source.skeleton.bones[boneIndex].metadata;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                Tools.Warn("Babylon.js encountered a null clone source for: " + clone.name);
                            }
                        }
                    });
                    let checked = [];
                    clones.forEach((check) => {
                        checked.push(check);
                    });
                    if (checked != null && checked.length > 0) {
                        const readyList = [];
                        Utilities.PostParseSceneComponents(scene, checked, null, readyList);
                        scene.onAfterRenderObservable.addOnce(() => {
                            if (readyList != null && readyList.length > 0) {
                                for (let index = 0; index < readyList.length; index++) {
                                    const instance = readyList[index];
                                    if (instance != null && instance.delayComponentInstance) {
                                        instance.delayComponentInstance(instance);
                                    }
                                }
                            }
                        });
                    }
                }
                else {
                    Tools.Warn("Failed to create prefab of: " + prefabName);
                }
            }
            else {
                Tools.Warn("Failed to lookup prefab map: " + prefabName);
            }
        }
        else {
            Tools.Warn("Unable to locate prefab master: " + prefabName);
        }
        return result;
    }
    static InstantiatePrefabFromContainer(container, prefabName, newName, newParent = null, newPosition = null, newRotation = null, newScaling = null, cloneAnimations = true, makeNewMaterials = false) {
        const root = Utilities.CloneAssetContainerItem(container, prefabName, (sourceName) => { return sourceName; }, newParent, makeNewMaterials, cloneAnimations);
        if (root != null) {
            if (newName != null && newName !== "")
                root.name = newName;
            if (newPosition != null)
                root.position = newPosition.clone();
            if (newRotation != null)
                root.rotationQuaternion = newRotation.clone();
            if (newScaling != null)
                root.scaling = newScaling.clone();
            const transforms = [];
            transforms.push(root);
            const children = root.getChildren(null, false);
            if (children != null && children.length > 0) {
                children.forEach((child) => { transforms.push(child); });
            }
            transforms.forEach((transform) => {
                transform.id = Utilities.CreateGuid();
                transform.setEnabled(true);
            });
            const readyList = [];
            Utilities.PostParseSceneComponents(container.scene, transforms, null, readyList);
            container.scene.onAfterRenderObservable.addOnce(() => {
                if (readyList != null && readyList.length > 0) {
                    for (let index = 0; index < readyList.length; index++) {
                        const instance = readyList[index];
                        if (instance != null && instance.delayComponentInstance) {
                            instance.delayComponentInstance(instance);
                        }
                    }
                }
            });
        }
        return root;
    }
    static InstantiateModelsFromContainer(container, nameFunction = null, createInstances = false, cloneMaterials = false, rebuildBoundingInfo = false, filterPredicate = null) {
        let transforms = null;
        const result = container.instantiateModelsToScene(nameFunction, cloneMaterials, { doNotInstantiate: !createInstances, predicate: filterPredicate });
        if (result != null && result.rootNodes != null && result.rootNodes.length > 0) {
            const rootmesh = result.rootNodes[0];
            const children = rootmesh.getChildren(null, false);
            if (rebuildBoundingInfo === true)
                SceneManager.RebuildBoundingBoxInfo(children);
            transforms = [rootmesh, ...children];
        }
        return transforms;
    }
    static CreateInstancedModelsFromContainer(container, newName = null, newParent = null, newPosition = null, newRotation = null, newScaling = null, cloneAnimations = true, makeNewMaterials = false, rebuildBoundingInfo = false) {
        let root = null;
        let transforms = null;
        let animations = null;
        const result = container.instantiateModelsToScene(sourceName => sourceName, makeNewMaterials, { doNotInstantiate: false });
        if (result != null) {
            if (result.rootNodes != null && result.rootNodes.length > 0) {
                const top = result.rootNodes[0];
                transforms = top.getChildren(null, false);
                if (rebuildBoundingInfo === true)
                    SceneManager.RebuildBoundingBoxInfo(transforms);
            }
            if (result.animationGroups != null) {
                animations = result.animationGroups;
            }
        }
        if (transforms != null) {
            root = transforms[0];
            if (newParent != null)
                root.parent = newParent;
            if (newName != null && newName !== "")
                root.name = newName;
            if (newPosition != null)
                root.position = newPosition.clone();
            if (newRotation != null)
                root.rotationQuaternion = newRotation.clone();
            if (newScaling != null)
                root.scaling = newScaling.clone();
            transforms.forEach((transform) => {
                transform.id = Utilities.CreateGuid();
                transform.setEnabled(true);
            });
            if (cloneAnimations === true) {
                let clonedAnimationGroups = null;
                animations.forEach((o) => {
                    const oo = o;
                    const osid = (oo.metadata != null && oo.metadata.toolkit != null && oo.metadata.toolkit.source != null && oo.metadata.toolkit.source !== "") ? oo.metadata.toolkit.source : null;
                    if (osid != null && osid !== "") {
                        const aclone = o.clone(o.name);
                        const newid = osid;
                        if (oo.metadata != null) {
                            aclone.metadata = {};
                            aclone.metadata.toolkit = {};
                            aclone.metadata.toolkit.id = oo.metadata.toolkit.id;
                            aclone.metadata.toolkit.clip = oo.metadata.toolkit.clip;
                            aclone.metadata.toolkit.source = newid;
                            aclone.metadata.toolkit.legacy = oo.metadata.toolkit.legacy;
                            aclone.metadata.toolkit.length = oo.metadata.toolkit.length;
                            aclone.metadata.toolkit.looping = oo.metadata.toolkit.looping;
                            aclone.metadata.toolkit.settings = oo.metadata.toolkit.settings;
                            aclone.metadata.toolkit.behavior = oo.metadata.toolkit.behavior;
                            aclone.metadata.toolkit.wrapmode = oo.metadata.toolkit.wrapmode;
                            aclone.metadata.toolkit.framerate = oo.metadata.toolkit.framerate;
                            aclone.metadata.toolkit.humanmotion = oo.metadata.toolkit.humanmotion;
                            aclone.metadata.toolkit.averagespeed = oo.metadata.toolkit.averagespeed;
                            aclone.metadata.toolkit.averageduration = oo.metadata.toolkit.averageduration;
                            aclone.metadata.toolkit.averageangularspeed = oo.metadata.toolkit.averageangularspeed;
                        }
                        if (clonedAnimationGroups == null)
                            clonedAnimationGroups = [];
                        clonedAnimationGroups.push(aclone);
                    }
                });
                if (root != null && clonedAnimationGroups != null)
                    Utilities.AssignAnimationGroupsToInstance(root, clonedAnimationGroups);
            }
            const readyList = [];
            Utilities.PostParseSceneComponents(container.scene, transforms, null, readyList);
            container.scene.onAfterRenderObservable.addOnce(() => {
                if (readyList != null && readyList.length > 0) {
                    for (let index = 0; index < readyList.length; index++) {
                        const instance = readyList[index];
                        if (instance != null && instance.delayComponentInstance) {
                            instance.delayComponentInstance(instance);
                        }
                    }
                }
            });
        }
        return result;
    }
    static CloneTransformNode(container, nodeName, newName, newParent = null, newPosition = null, newRotation = null, newScaling = null) {
        const sourceNode = Utilities.GetAssetContainerNode(container, nodeName);
        const clonedCopy = sourceNode.clone(newName, newParent, true);
        if (clonedCopy != null) {
            if (newPosition != null)
                clonedCopy.position = newPosition.clone();
            if (newRotation != null)
                clonedCopy.rotationQuaternion = newRotation.clone();
            if (newScaling != null)
                clonedCopy.scaling = newScaling.clone();
            clonedCopy.setEnabled(true);
        }
        return clonedCopy;
    }
    static CloneAbstractMesh(container, nodeName, newName, newParent = null, newPosition = null, newRotation = null, newScaling = null) {
        const sourceMesh = Utilities.GetAssetContainerMesh(container, nodeName);
        const clonedCopy = sourceMesh.clone(newName, newParent, true);
        if (clonedCopy != null) {
            if (newPosition != null)
                clonedCopy.position = newPosition.clone();
            if (newRotation != null)
                clonedCopy.rotationQuaternion = newRotation.clone();
            if (newScaling != null)
                clonedCopy.scaling = newScaling.clone();
            clonedCopy.setEnabled(true);
        }
        return clonedCopy;
    }
    static CreateInstancedMesh(container, meshName, newName, newParent = null, newPosition = null, newRotation = null, newScaling = null) {
        const sourceMesh = Utilities.GetAssetContainerMesh(container, meshName);
        const instanceCopy = sourceMesh.createInstance(newName);
        if (instanceCopy != null) {
            if (newParent != null)
                instanceCopy.parent = newParent;
            if (newPosition != null)
                instanceCopy.position = newPosition.clone();
            if (newRotation != null)
                instanceCopy.rotationQuaternion = newRotation.clone();
            if (newScaling != null)
                instanceCopy.scaling = newScaling.clone();
            instanceCopy.setEnabled(true);
        }
        return instanceCopy;
    }
    static RebuildBoundingBoxInfo(transforms) {
        if (transforms != null && transforms.length > 0) {
            transforms.forEach(mesh => {
                if (mesh instanceof InstancedMesh) {
                    const sourceBoundingBox = mesh.sourceMesh.getBoundingInfo()?.boundingBox;
                    if (sourceBoundingBox != null && sourceBoundingBox.minimum != null && sourceBoundingBox.maximum != null) {
                        mesh.setBoundingInfo(new BoundingInfo(sourceBoundingBox.minimum, sourceBoundingBox.maximum));
                    }
                }
                else if (mesh instanceof AbstractMesh) {
                    const originalBoundingBox = mesh.getBoundingInfo()?.boundingBox;
                    if (originalBoundingBox != null && originalBoundingBox.minimum != null && originalBoundingBox.maximum != null) {
                        mesh.setBoundingInfo(new BoundingInfo(originalBoundingBox.minimum, originalBoundingBox.maximum));
                    }
                }
            });
        }
    }
    static AttachScriptComponent(instance, alias, validate = true) {
        if (instance != null && instance.registerComponentInstance) {
            instance.registerComponentInstance(instance, alias, validate);
        }
    }
    static DestroyScriptComponent(instance) {
        if (instance != null && instance.destroyComponentInstance) {
            instance.destroyComponentInstance(instance);
        }
    }
    static DestroyGameObject(transform) {
        if (transform != null) {
            const components = SceneManager.FindScriptComponents(transform, true);
            if (components != null && components.length > 0) {
                for (let index = 0; index < components.length; index++) {
                    const component = components[index];
                    SceneManager.DestroyScriptComponent(component);
                }
            }
            SceneManager.SafeDestroy(transform);
        }
    }
    static GetComponent(transform, klass, recursive = false) {
        return SceneManager.FindScriptComponent(transform, klass, recursive);
    }
    static GetComponents(transform, recursive = false) {
        return SceneManager.FindScriptComponents(transform, recursive);
    }
    static FindGameObject(scene, path) {
        const nodeNames = path.split('/');
        let currentNode = null;
        const rootNodes = scene.rootNodes;
        for (let i = 0; i < nodeNames.length; i++) {
            const nodeName = nodeNames[i];
            if (i === 0) {
                currentNode = rootNodes.find(node => node.name === nodeName) || null;
            }
            else {
                if (currentNode && currentNode instanceof TransformNode) {
                    currentNode = currentNode.getChildren(node => node.name === nodeName, false)[0] || null;
                }
                else {
                    return null;
                }
            }
            if (!currentNode) {
                return null;
            }
        }
        return currentNode;
    }
    static FindGameObjectWithTag(scene, tag) {
        const findWithTag = (node) => {
            if (SceneManager.GetTransformTag(node) === tag) {
                return node;
            }
            if (node instanceof TransformNode) {
                const children = node.getChildren();
                for (let child of children) {
                    if (child instanceof TransformNode) {
                        const found = findWithTag(child);
                        if (found) {
                            return found;
                        }
                    }
                }
            }
            return null;
        };
        for (let rootNode of scene.rootNodes) {
            if (rootNode instanceof TransformNode) {
                const foundNode = findWithTag(rootNode);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    }
    static FindGameObjectsWithTag(scene, tag) {
        const foundNodes = [];
        const collectWithTag = (node) => {
            if (SceneManager.GetTransformTag(node) === tag) {
                foundNodes.push(node);
            }
            if (node instanceof TransformNode) {
                const children = node.getChildren();
                for (let child of children) {
                    if (child instanceof TransformNode) {
                        collectWithTag(child);
                    }
                }
            }
        };
        for (let rootNode of scene.rootNodes) {
            if (rootNode instanceof TransformNode) {
                collectWithTag(rootNode);
            }
        }
        return foundNodes;
    }
    static FindScriptComponents(transform, recursive = false) {
        if (transform == null)
            return null;
        let result = null;
        if (transform.metadata != null && transform.metadata.toolkit) {
            const metadata = transform.metadata.toolkit;
            if (metadata.components != null && metadata.components.length > 0) {
                for (let ii = 0; ii < metadata.components.length; ii++) {
                    const transformscript = metadata.components[ii];
                    if (result == null)
                        result = [];
                    result.push(transformscript.instance);
                }
            }
        }
        if (recursive === true) {
            const children = transform.getChildren(null, false);
            if (children != null) {
                for (let index = 0; index < children.length; index++) {
                    const child = children[index];
                    const items = SceneManager.FindScriptComponents(child, false);
                    if (items != null) {
                        if (result == null)
                            result = [];
                        result.push(...items);
                    }
                }
            }
        }
        return (result != null) ? result : null;
    }
    static FindScriptComponent(transform, klass, recursive = false) {
        if (transform == null)
            return null;
        let result = null;
        if (transform.metadata != null && transform.metadata.toolkit) {
            const metadata = transform.metadata.toolkit;
            if (metadata.components != null && metadata.components.length > 0) {
                for (let ii = 0; ii < metadata.components.length; ii++) {
                    const transformscript = metadata.components[ii];
                    if (transformscript.instance != null && transformscript.klass === klass) {
                        result = transformscript.instance;
                        break;
                    }
                }
            }
        }
        if (result == null && recursive === true) {
            const children = transform.getChildren(null, false);
            if (children != null) {
                for (let index = 0; index < children.length; index++) {
                    const child = children[index];
                    result = SceneManager.FindScriptComponent(child, klass, false);
                    if (result != null)
                        break;
                }
            }
        }
        return (result != null) ? result : null;
    }
    static FindAllScriptComponents(transform, klass, recursive = false) {
        if (transform == null)
            return null;
        let result = null;
        if (transform.metadata != null && transform.metadata.toolkit) {
            const metadata = transform.metadata.toolkit;
            if (metadata.components != null && metadata.components.length > 0) {
                for (let ii = 0; ii < metadata.components.length; ii++) {
                    const transformscript = metadata.components[ii];
                    if (transformscript.instance != null && transformscript.klass === klass) {
                        if (result == null)
                            result = [];
                        result.push(transformscript.instance);
                    }
                }
            }
        }
        if (recursive === true) {
            const children = transform.getChildren(null, false);
            if (children != null) {
                for (let index = 0; index < children.length; index++) {
                    const child = children[index];
                    const items = SceneManager.FindAllScriptComponents(child, klass, false);
                    if (items != null) {
                        if (result == null)
                            result = [];
                        result.push(...items);
                    }
                }
            }
        }
        return (result != null) ? result : null;
    }
    static FindSceneMetadata(transform) {
        if (transform == null)
            return null;
        return (transform.metadata != null && transform.metadata.toolkit) ? transform.metadata.toolkit : null;
    }
    static FindSceneCameraRig(transform) {
        if (transform == null)
            return null;
        return (transform.cameraRig != null) ? transform.cameraRig : null;
    }
    static FindSceneLightRig(transform) {
        if (transform == null)
            return null;
        return (transform.lightRig != null) ? transform.lightRig : null;
    }
    static FindTransformWithScript(scene, klass) {
        const children = scene.getNodes();
        return Utilities.SearchTransformNodeForScript(klass, children);
    }
    static FindAllTransformsWithScript(scene, klass) {
        const children = scene.getNodes();
        return Utilities.SearchAllTransformNodesForScript(klass, children);
    }
    static FindChildTransformNode(parent, name, searchType = SearchType.ExactMatch, directDecendantsOnly = true, predicate = null) {
        if (parent == null)
            return null;
        const search = (searchType != null) ? searchType : SearchType.ExactMatch;
        const children = parent.getChildren(predicate, directDecendantsOnly);
        return Utilities.SearchTransformNodes(name, children, search);
    }
    static FindChildTransformWithTags(parent, query, directDecendantsOnly = true, predicate = null) {
        if (parent == null)
            return null;
        const children = parent.getChildren(predicate, directDecendantsOnly);
        return Utilities.SearchTransformNodeForTags(query, children);
    }
    static FindAllChildTransformsWithTags(parent, query, directDecendantsOnly = true, predicate = null) {
        if (parent == null)
            return null;
        const children = parent.getChildren(predicate, directDecendantsOnly);
        return Utilities.SearchAllTransformNodesForTags(query, children);
    }
    static FindChildTransformWithScript(parent, klass, directDecendantsOnly = true, predicate = null) {
        if (parent == null)
            return null;
        const children = parent.getChildren(predicate, directDecendantsOnly);
        return Utilities.SearchTransformNodeForScript(klass, children);
    }
    static FindAllChildTransformsWithScript(parent, klass, directDecendantsOnly = true, predicate = null) {
        if (parent == null)
            return null;
        const children = parent.getChildren(predicate, directDecendantsOnly);
        return Utilities.SearchAllTransformNodesForScript(klass, children);
    }
    static FindComponentInParent(scene, transform, klass) {
        const searchables = (transform.parent != null) ? [transform, transform.parent] : [transform];
        const result = Utilities.SearchTransformNodeForScript(klass, searchables);
        return SceneManager.FindScriptComponent(result, klass);
    }
    static FindComponentsInParent(scene, transform, klass) {
        let result = null;
        const children = transform.getChildren(null, false);
        const searchables = (children != null) ? [transform, ...children] : [transform];
        const transforms = Utilities.SearchAllTransformNodesForScript(klass, searchables);
        if (transforms != null && transforms.length > 0) {
            transforms.forEach((transform) => {
                const tnode = SceneManager.FindScriptComponent(transform, klass);
                if (tnode != null) {
                    if (result == null)
                        result = [];
                    result.push(tnode);
                }
            });
        }
        return (result != null) ? result : null;
    }
    static FindComponentInChildren(scene, transform, klass) {
        const children = transform.getChildren(null, false);
        const searchables = (children != null) ? [transform, ...children] : [transform];
        const result = Utilities.SearchTransformNodeForScript(klass, searchables);
        return SceneManager.FindScriptComponent(result, klass);
    }
    static FindComponentsInChildren(scene, transform, klass) {
        let result = null;
        const children = transform.getChildren(null, false);
        const searchables = (children != null) ? [transform, ...children] : [transform];
        const transforms = Utilities.SearchAllTransformNodesForScript(klass, searchables);
        if (transforms != null && transforms.length > 0) {
            transforms.forEach((transform) => {
                const tnode = SceneManager.FindScriptComponent(transform, klass);
                if (tnode != null) {
                    if (result == null)
                        result = [];
                    result.push(tnode);
                }
            });
        }
        return (result != null) ? result : null;
    }
    static SearchForScriptComponentByName(scene, klass) {
        const children = scene.getNodes();
        const result = Utilities.SearchTransformNodeForScript(klass, children);
        return SceneManager.FindScriptComponent(result, klass);
    }
    static SearchForAllScriptComponentsByName(scene, klass) {
        let result = null;
        const children = scene.getNodes();
        const transforms = Utilities.SearchAllTransformNodesForScript(klass, children);
        if (transforms != null && transforms.length > 0) {
            transforms.forEach((transform) => {
                const tnode = SceneManager.FindScriptComponent(transform, klass);
                if (tnode != null) {
                    if (result == null)
                        result = [];
                    result.push(tnode);
                }
            });
        }
        return (result != null) ? result : null;
    }
    static MoveWithCollisions(entity, velocity) {
        if (entity == null)
            return null;
        if (velocity != null)
            entity.moveWithCollisions(velocity);
    }
    static MoveWithTranslation(entity, velocity) {
        if (entity == null)
            return null;
        if (velocity != null)
            entity.position.addInPlace(velocity);
    }
    static TurnWithRotation(entity, radians, space = Space.LOCAL) {
        if (entity == null)
            return null;
        if (radians != 0)
            entity.rotate(Axis.Y, radians, space);
    }
    static GetRecastHeapSize() {
        if (typeof Recast === "undefined") {
            return 0;
        }
        let result = 0;
        if (Recast && Recast.HEAP8 && Recast.HEAP8.length) {
            result = Recast.HEAP8.length / (1024 * 1024);
        }
        return result;
    }
    static GetNavigationTools() {
        if (typeof Recast === "undefined") {
            return;
        }
        if (SceneManager.PluginInstance == null)
            SceneManager.PluginInstance = new RecastJSPluginExtension();
        return SceneManager.PluginInstance;
    }
    static GetCrowdInterface(scene) {
        if (typeof Recast === "undefined") {
            return null;
        }
        if (SceneManager.HasNavigationData()) {
            const plugin = SceneManager.GetNavigationTools();
            if (plugin != null && SceneManager.CrowdInterface == null)
                SceneManager.CrowdInterface = plugin.createCrowd(SceneManager.MAX_AGENT_COUNT, SceneManager.MAX_AGENT_RADIUS, scene);
            return SceneManager.CrowdInterface;
        }
        else {
            return null;
        }
    }
    static HasNavigationData() {
        if (typeof Recast === "undefined") {
            return false;
        }
        const plugin = SceneManager.GetNavigationTools();
        return (plugin != null && plugin.navMesh != null);
    }
    static GetNavigationMesh() {
        if (typeof Recast === "undefined") {
            return null;
        }
        return SceneManager.NavigationMesh;
    }
    static BakeNavigationMesh(scene, meshes, properties, debug = false, color = null, collisionMesh = false, debugMeshOffset = 0) {
        let result = -1;
        if (typeof Recast === "undefined") {
            return result;
        }
        Tools.Log("Recast.js baking navigation mesh data");
        const plugin = SceneManager.GetNavigationTools();
        if (plugin != null) {
            result = plugin.createNavMesh(meshes, properties);
            if (plugin.navMesh != null) {
                const matname = "NavigationMesh";
                let navmeshmat = scene.getMaterialByName(matname);
                if (navmeshmat == null) {
                    navmeshmat = new PBRMaterial(matname, scene);
                    navmeshmat.albedoColor = color || new Color3(0.2627451, 0.5960785, 0.7372549);
                    navmeshmat.unlit = true;
                    navmeshmat.alpha = 0.5;
                }
                SceneManager.NavigationMesh = plugin.createDebugNavMesh(scene);
                if (SceneManager.NavigationMesh != null) {
                    SceneManager.NavigationMesh.position = new Vector3(0, debugMeshOffset, 0);
                    SceneManager.NavigationMesh.material = navmeshmat;
                    SceneManager.NavigationMesh.isPickable = false;
                    SceneManager.NavigationMesh.isVisible = true;
                    SceneManager.NavigationMesh.visibility = (debug === true) ? 1 : 0;
                    SceneManager.NavigationMesh.renderingGroupId = Utilities.ColliderRenderGroup();
                    Tags.AddTagsTo(SceneManager.NavigationMesh, "Navigation");
                    Utilities.ValidateTransformMetadata(SceneManager.NavigationMesh);
                    if (collisionMesh === true) {
                        SceneManager.NavigationMesh.checkCollisions = true;
                        SceneManager.NavigationMesh.metadata.toolkit.physics = RigidbodyPhysics.CreatePhysicsMetadata(0, 0.0, 0.05, new Vector3(0, 0, 0));
                        SceneManager.NavigationMesh.metadata.toolkit.collision = RigidbodyPhysics.CreateCollisionMetadata("MeshCollider", false, false, 0, 0.6, 0.6);
                        RigidbodyPhysics.SetupPhysicsComponent(scene, SceneManager.NavigationMesh);
                    }
                }
                if (SceneManager.NavigationMesh != null) {
                    if (SceneManager.OnNavMeshReadyObservable.hasObservers() === true) {
                        SceneManager.OnNavMeshReadyObservable.notifyObservers(SceneManager.NavigationMesh);
                    }
                }
                else {
                    Tools.Warn("Failed to generate navigation mesh geometry");
                }
            }
            else {
                Tools.Warn("Failed to create navigation mesh data");
            }
        }
        return result;
    }
    static LoadNavigationMesh(scene, data, debug = false, color = null, timeSteps = 0, collisionMesh = false, debugMeshOffset = 0) {
        let result = -1;
        if (typeof Recast === "undefined") {
            return result;
        }
        Tools.Log("Recast.js loading prebaked navigation mesh");
        const plugin = SceneManager.GetNavigationTools();
        if (plugin != null) {
            if (plugin.setTimeStep)
                plugin.setTimeStep(timeSteps);
            result = plugin.buildFromNavmeshData(data);
            if (plugin.navMesh != null) {
                const matname = "NavigationMesh";
                let navmeshmat = scene.getMaterialByName(matname);
                if (navmeshmat == null) {
                    navmeshmat = new PBRMaterial(matname, scene);
                    navmeshmat.albedoColor = color || new Color3(0.2627451, 0.5960785, 0.7372549);
                    navmeshmat.unlit = true;
                    navmeshmat.alpha = 0.5;
                }
                SceneManager.NavigationMesh = plugin.createDebugNavMesh(scene);
                if (SceneManager.NavigationMesh != null) {
                    SceneManager.NavigationMesh.position = new Vector3(0, debugMeshOffset, 0);
                    SceneManager.NavigationMesh.material = navmeshmat;
                    SceneManager.NavigationMesh.isPickable = false;
                    SceneManager.NavigationMesh.isVisible = true;
                    SceneManager.NavigationMesh.visibility = (debug === true) ? 1 : 0;
                    SceneManager.NavigationMesh.renderingGroupId = Utilities.ColliderRenderGroup();
                    Tags.AddTagsTo(SceneManager.NavigationMesh, "Navigation");
                    Utilities.ValidateTransformMetadata(SceneManager.NavigationMesh);
                    if (collisionMesh === true) {
                        SceneManager.NavigationMesh.checkCollisions = true;
                        SceneManager.NavigationMesh.metadata.toolkit.physics = RigidbodyPhysics.CreatePhysicsMetadata(0, 0.0, 0.05, new Vector3(0, 0, 0));
                        SceneManager.NavigationMesh.metadata.toolkit.collision = RigidbodyPhysics.CreateCollisionMetadata("MeshCollider", false, false, 0, 0.6, 0.6);
                        RigidbodyPhysics.SetupPhysicsComponent(scene, SceneManager.NavigationMesh);
                    }
                }
                if (SceneManager.NavigationMesh != null) {
                    if (SceneManager.OnNavMeshReadyObservable.hasObservers() === true) {
                        SceneManager.OnNavMeshReadyObservable.notifyObservers(SceneManager.NavigationMesh);
                    }
                }
                else {
                    Tools.Warn("Failed to generate navigation mesh geometry");
                }
            }
            else {
                Tools.Warn("Failed to build navigation mesh data");
            }
        }
        return result;
    }
    static SaveNavigationMesh() {
        if (typeof Recast === "undefined") {
            return null;
        }
        const plugin = SceneManager.GetNavigationTools();
        return (plugin != null && plugin.navMesh != null) ? plugin.getNavmeshData() : null;
    }
    static ComputeNavigationPath(start, end, closetPoint = true) {
        if (typeof Recast === "undefined") {
            return null;
        }
        const plugin = SceneManager.GetNavigationTools();
        const spoint = (closetPoint === true) ? plugin.getClosestPoint(start) : start;
        const epoint = (closetPoint === true) ? plugin.getClosestPoint(end) : end;
        return (plugin != null && plugin.navMesh != null) ? plugin.computePath(spoint, epoint) : null;
    }
    static MoveAlongNavigationPath(scene, agent, path, speed, easing = null, callback) {
        let result = null;
        if (path && path.length > 0) {
            let length = 0;
            let direction = [{
                    frame: 0,
                    value: agent.position
                }];
            for (let i = 0; i < path.length; i++) {
                length += Vector3.Distance(direction[i].value, path[i]);
                direction.push({
                    frame: length,
                    value: path[i]
                });
            }
            result = new Animation("Navigation", "position", 3, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
            if (easing != null)
                result.setEasingFunction(easing);
            result.setKeys(direction);
            agent.animations = [result];
            scene.beginAnimation(agent, 0, length, false, speed, callback);
        }
        return result;
    }
    static AddNavigationCylinderObstacle(position, radius, height) {
        if (typeof Recast === "undefined") {
            return null;
        }
        const plugin = SceneManager.GetNavigationTools();
        return (plugin != null && plugin.navMesh != null) ? plugin.addCylinderObstacle(position, radius, height) : null;
    }
    static AddNavigationBoxObstacle(position, extent, angle) {
        if (typeof Recast === "undefined") {
            return null;
        }
        const plugin = SceneManager.GetNavigationTools();
        return (plugin != null && plugin.navMesh != null) ? plugin.addBoxObstacle(position, extent, angle) : null;
    }
    static RemoveNavigationObstacle(obstacle) {
        if (typeof Recast === "undefined") {
            return null;
        }
        const plugin = SceneManager.GetNavigationTools();
        if (plugin != null && plugin.navMesh != null)
            plugin.removeObstacle(obstacle);
    }
    static ToggleFullscreenMode(scene, requestPointerLock = true) {
        scene.getEngine().switchFullscreen(requestPointerLock);
    }
    static EnterFullscreenMode(scene, requestPointerLock = true) {
        SceneManager.GotoFullscreenBrowser(scene, requestPointerLock);
    }
    static ExitFullscreenMode(scene) {
        SceneManager.ExitFromFullscreenBrowser(scene);
    }
    static GotoFullscreenBrowser(scene, pointerLock = true) {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen().then(() => {
                if (pointerLock === true) {
                    SceneManager.RequestBrowserPointerLock(element);
                }
            }).catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
            if (pointerLock === true)
                SceneManager.RequestBrowserPointerLock(element);
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
            if (pointerLock === true)
                SceneManager.RequestBrowserPointerLock(element);
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
            if (pointerLock === true)
                SceneManager.RequestBrowserPointerLock(element);
        }
        else {
            scene.getEngine().enterFullscreen(pointerLock);
        }
    }
    static RequestBrowserPointerLock(element) {
        if (element.requestPointerLock) {
            element.requestPointerLock();
        }
        else if (element.mozRequestPointerLock) {
            element.mozRequestPointerLock();
        }
        else if (element.webkitRequestPointerLock) {
            element.webkitRequestPointerLock();
        }
    }
    static ExitFromFullscreenBrowser(scene) {
        const adocument = document;
        if (adocument.exitFullscreen) {
            adocument.exitFullscreen();
        }
        else if (adocument.mozCancelFullScreen) {
            adocument.mozCancelFullScreen();
        }
        else if (adocument.webkitExitFullscreen) {
            adocument.webkitExitFullscreen();
        }
        else if (adocument.msExitFullscreen) {
            adocument.msExitFullscreen();
        }
        else {
            scene.getEngine().exitFullscreen();
        }
    }
}
SceneManager.GlobalOptions = {};
SceneManager.WindowState = {};
SceneManager.ServerEndPoint = "http://127.0.0.1:2567";
SceneManager.EnableDebugMode = false;
SceneManager.EnableUserInput = true;
SceneManager.RenderLoopReady = true;
SceneManager.PauseRenderLoop = false;
SceneManager.LostRenderContext = false;
SceneManager.AutoUpdateProgress = true;
SceneManager.PhysicsCapsuleShape = 0;
SceneManager.SupportSRGBBuffers = false;
SceneManager.AnimationStartMode = 0;
SceneManager.AnimationTargetFps = 60;
SceneManager.DefaultConvexHullMargin = 0.001;
SceneManager.DefaultHeightFieldMargin = 0.001;
SceneManager.AmbientLightIntensity = 1.0;
SceneManager.PointLightIntensity = 1.0;
SceneManager.SpotLightIntensity = 1.0;
SceneManager.DirectionalLightIntensity = 1.0;
SceneManager.TerrainColorCorrection = 2.2;
SceneManager.AllowCameraMovement = true;
SceneManager.AllowCameraRotation = true;
SceneManager.VirtualJoystickEnabled = false;
SceneManager.GameTimeMilliseconds = 0;
SceneManager.ParseScriptComponents = true;
SceneManager.AutoLoadScriptBundles = true;
SceneManager.AutoStripNamespacePrefix = true;
SceneManager.UniversalModuleDefinition = true;
SceneManager.WaitForSeconds = (seconds) => new Promise((res) => WindowManager.SetTimeout((seconds * 1000), res));
SceneManager.OnPreRenderLoopObservable = new Observable();
SceneManager.OnPostRenderLoopObservable = new Observable();
SceneManager.OnSceneReadyObservable = new Observable();
SceneManager.OnEngineResizeObservable = new Observable();
SceneManager.OnLoadCompleteObservable = new Observable();
SceneManager.OnRebuildContextObservable = new Observable();
SceneManager.OnAssetManagerProgress = null;
SceneManager._HideLoadingScreen = null;
SceneManager.CVTOOLS_NAME = "CVTOOLS_unity_metadata";
SceneManager.CVTOOLS_MESH = "CVTOOLS_babylon_mesh";
SceneManager.CVTOOLS_HAND = "CVTOOLS_left_handed";
SceneManager.CVTOOLS_NAME_REGISTERED = false;
SceneManager.CVTOOLS_MESH_REGISTERED = false;
SceneManager.CVTOOLS_HAND_REGISTERED = false;
SceneManager._EventBus = null;
SceneManager.SceneLoaderFileNames = [];
SceneManager.SceneLoaderPropertyBag = {};
SceneManager.SceneLoaderHandledFlag = false;
SceneManager.SceneParsingEnabled = true;
SceneManager.PhysicsViewersEnabled = false;
SceneManager.MAX_AGENT_COUNT = 200;
SceneManager.MAX_AGENT_RADIUS = 2.0;
SceneManager.NavigationMesh = null;
SceneManager.CrowdInterface = null;
SceneManager.PluginInstance = null;
SceneManager.OnNavMeshReadyObservable = new Observable();
export class ScriptComponent {
    isReady() { return this._scriptReady; }
    ;
    get scene() { return this._scene; }
    get transform() { return this._transform; }
    ;
    constructor(transform, scene, properties = {}, alias = null) {
        this._update = null;
        this._late = null;
        this._step = null;
        this._fixed = null;
        this._after = null;
        this._ready = null;
        this._lateUpdate = false;
        this._properties = null;
        this._awoken = false;
        this._started = false;
        this._scene = null;
        this._delyed = false;
        this._transform = null;
        this._scriptReady = false;
        this._registeredClassname = null;
        this._registerComponentAlias = true;
        this._lateUpdateObserver = null;
        this.resetScriptComponent = null;
        this._bodyCollisionObserver = null;
        this._bodyCollisionEndedObserver = null;
        this._worldTriggerEventObserver = null;
        this.onCollisionEnterObservable = new Observable();
        this.onCollisionStayObservable = new Observable();
        this.onCollisionExitObservable = new Observable();
        this.onTriggerEnterObservable = new Observable();
        this.onTriggerExitObservable = new Observable();
        if (transform == null)
            throw new Error("Null transform object specified.");
        if (scene == null)
            throw new Error("Null host scene object specified.");
        this._scene = scene;
        this._transform = transform;
        this._properties = properties || {};
        if (this._properties["_scriptComponentAlias"] != null && this._properties["_scriptComponentAlias"] !== "") {
            this._registeredClassname = this._properties["_scriptComponentAlias"];
        }
        else {
            this._registeredClassname = alias || this.constructor.name || "Unknown";
        }
        if (this._properties["_registerComponentAlias"] != null) {
            this._registerComponentAlias = this._properties["_registerComponentAlias"];
        }
        else {
            this._registerComponentAlias = true;
        }
        const instance = this;
        instance._update = () => { ScriptComponent.UpdateInstance(instance); };
        instance._late = () => { ScriptComponent.LateInstance(instance); };
        instance._step = () => { ScriptComponent.StepInstance(instance); };
        instance._fixed = () => { ScriptComponent.FixedInstance(instance); };
        instance._after = () => { ScriptComponent.AfterInstance(instance); };
        instance._ready = () => { ScriptComponent.ReadyInstance(instance); };
        instance.resetScriptComponent = () => { ScriptComponent.ResetInstance(instance); };
        if (!instance.registerComponentInstance || !instance.destroyComponentInstance) {
            Tools.Warn("Invalid component registration handlers for: " + this._transform.name);
        }
        if (this._registerComponentAlias === true && instance.registerComponentInstance != null) {
            instance.registerComponentInstance(instance, this._registeredClassname, true);
        }
    }
    dispose() {
    }
    getClassName() {
        return this._registeredClassname;
    }
    setProperty(name, propertyValue) {
        if (this._properties == null)
            this._properties = {};
        this._properties[name] = propertyValue;
    }
    getProperty(name, defaultValue = null) {
        let result = null;
        if (this._properties != null) {
            result = this._properties[name];
            if (result == null) {
                result = this._properties[("auto__" + name)];
            }
        }
        if (result == null)
            result = defaultValue;
        return (result != null) ? result : null;
    }
    getTime() {
        return SceneManager.GetTime();
    }
    getTimeMs() {
        return SceneManager.GetTimeMs();
    }
    getGameTime() {
        return SceneManager.GetGameTime();
    }
    getGameTimeMs() {
        return SceneManager.GetGameTimeMs();
    }
    getDeltaTime() {
        return SceneManager.GetDeltaTime(this.scene);
    }
    getDeltaSeconds() {
        return SceneManager.GetDeltaSeconds(this.scene);
    }
    getDeltaMilliseconds() {
        return SceneManager.GetDeltaMilliseconds(this.scene);
    }
    getAnimationRatio() {
        return SceneManager.GetAnimationRatio(this.scene);
    }
    hasSkinnedMesh() {
        return (this.getSkinnedMesh() != null);
    }
    getSkinnedMesh() {
        return SceneManager.GetSkinnedMesh(this.transform);
    }
    getTransformMesh() {
        return (this._transform instanceof Mesh) ? this._transform : null;
    }
    getAbstractMesh() {
        return (this._transform instanceof AbstractMesh) ? this._transform : null;
    }
    getInstancedMesh() {
        return (this._transform instanceof InstancedMesh) ? this._transform : null;
    }
    getPrimitiveMeshes() {
        return SceneManager.GetPrimitiveMeshes(this.transform);
    }
    getMetadata() {
        return SceneManager.FindSceneMetadata(this._transform);
    }
    getComponent(klass, recursive = false) {
        const result = SceneManager.FindScriptComponent(this._transform, klass, recursive);
        return (result != null) ? result : null;
    }
    getComponents(klass, recursive = false) {
        const result = SceneManager.FindAllScriptComponents(this._transform, klass, recursive);
        return (result != null) ? result : null;
    }
    getLightRig() {
        return SceneManager.FindSceneLightRig(this._transform);
    }
    getCameraRig() {
        return SceneManager.FindSceneCameraRig(this._transform);
    }
    getTransformTag() {
        return SceneManager.GetTransformTag(this.transform);
    }
    hasTransformTags(query) {
        return SceneManager.HasTransformTags(this._transform, query);
    }
    getChildNode(name, searchType = SearchType.ExactMatch, directDecendantsOnly = true, predicate = null) {
        return SceneManager.FindChildTransformNode(this._transform, name, searchType, directDecendantsOnly, predicate);
    }
    getChildWithTags(query, directDecendantsOnly = true, predicate = null) {
        return SceneManager.FindChildTransformWithTags(this._transform, query, directDecendantsOnly, predicate);
    }
    getChildrenWithTags(query, directDecendantsOnly = true, predicate = null) {
        return SceneManager.FindAllChildTransformsWithTags(this._transform, query, directDecendantsOnly, predicate);
    }
    getChildWithScript(klass, directDecendantsOnly = true, predicate = null) {
        return SceneManager.FindChildTransformWithScript(this._transform, klass, directDecendantsOnly, predicate);
    }
    getChildrenWithScript(klass, directDecendantsOnly = true, predicate = null) {
        return SceneManager.FindAllChildTransformsWithScript(this._transform, klass, directDecendantsOnly, predicate);
    }
    enableCollisionEvents() {
        const havokPlugin = Utilities.GetHavokPlugin();
        if (havokPlugin != null && this.transform.physicsBody != null) {
            this.transform.physicsBody.setCollisionCallbackEnabled(true);
            this.transform.physicsBody.setCollisionEndedCallbackEnabled(true);
            if (this._bodyCollisionObserver == null) {
                const collisionObservable = this.transform.physicsBody.getCollisionObservable();
                if (collisionObservable != null) {
                    this._bodyCollisionObserver = collisionObservable.add((collisionEvent) => {
                        if (collisionEvent.collidedAgainst != null && collisionEvent.collidedAgainst.transformNode != null) {
                            if (collisionEvent.type === "COLLISION_STARTED") {
                                this.onCollisionEnterObservable.notifyObservers(collisionEvent.collidedAgainst.transformNode);
                            }
                            else if (collisionEvent.type === "COLLISION_CONTINUED") {
                                this.onCollisionStayObservable.notifyObservers(collisionEvent.collidedAgainst.transformNode);
                            }
                        }
                    });
                }
            }
            if (this._bodyCollisionEndedObserver == null) {
                const collisionEndedObservable = this.transform.physicsBody.getCollisionEndedObservable();
                if (collisionEndedObservable != null) {
                    this._bodyCollisionEndedObserver = collisionEndedObservable.add((collisionEvent) => {
                        if (collisionEvent.collidedAgainst != null && collisionEvent.collidedAgainst.transformNode != null) {
                            if (collisionEvent.type === "COLLISION_FINISHED") {
                                this.onCollisionExitObservable.notifyObservers(collisionEvent.collidedAgainst.transformNode);
                            }
                        }
                    });
                }
            }
            if (this._worldTriggerEventObserver == null) {
                this._worldTriggerEventObserver = havokPlugin.onTriggerCollisionObservable.add((triggerEvent) => {
                    if (triggerEvent.collider === this.transform.physicsBody || triggerEvent.collidedAgainst === this.transform.physicsBody) {
                        const otherBody = (triggerEvent.collider === this.transform.physicsBody) ? triggerEvent.collidedAgainst : triggerEvent.collider;
                        if (triggerEvent.type === "TRIGGER_ENTERED") {
                            this.onTriggerEnterObservable.notifyObservers(otherBody.transformNode);
                        }
                        else if (triggerEvent.type === "TRIGGER_EXITED") {
                            this.onTriggerExitObservable.notifyObservers(otherBody.transformNode);
                        }
                    }
                });
            }
        }
    }
    disableCollisionEvents() {
        const havokPlugin = Utilities.GetHavokPlugin();
        if (havokPlugin != null && this.transform.physicsBody != null) {
            this.transform.physicsBody.setCollisionCallbackEnabled(false);
            this.transform.physicsBody.setCollisionEndedCallbackEnabled(false);
        }
    }
    setTransformPosition(position) {
        if (this.transform.physicsBody) {
            this.transform.physicsBody.disablePreStep = false;
        }
        if (this.transform.position != null) {
            this.transform.position.copyFrom(position);
        }
    }
    setTransformRotation(rotation) {
        if (this.transform.physicsBody) {
            this.transform.physicsBody.disablePreStep = false;
        }
        if (this.transform.rotationQuaternion != null) {
            this.transform.rotationQuaternion.copyFrom(rotation);
        }
    }
    registerOnClickAction(func) {
        let result = null;
        if (this.transform instanceof AbstractMesh) {
            result = SceneManager.RegisterClickAction(this.scene, this.transform, func);
        }
        return result;
    }
    unregisterOnClickAction(action) {
        let result = false;
        if (this.transform instanceof AbstractMesh) {
            result = SceneManager.UnregisterClickAction(this.transform, action);
        }
        return result;
    }
    registerComponentInstance(instance, alias, validate = true) {
        if (alias != null && alias !== "" && alias !== "Unknown") {
            if (validate === true) {
                Utilities.ValidateTransformMetadata(this._transform);
                const script = { alias: "script", order: 0, klass: alias, properties: null, instance: instance };
                if (this._transform.metadata.toolkit.components == null)
                    this._transform.metadata.toolkit.components = [];
                this._transform.metadata.toolkit.components.push(script);
            }
            ScriptComponent.RegisterInstance(instance);
            if (validate === true) {
                instance.scene.onAfterRenderObservable.addOnce(() => { instance.delayComponentInstance(instance); });
            }
        }
        else {
            console.warn("Failed to register unknown component instance: ", instance);
        }
    }
    delayComponentInstance(instance) {
        WindowManager.SetTimeout(100, () => { instance._delyed = true; });
    }
    destroyComponentInstance(instance) {
        ScriptComponent.DestroyInstance(instance);
    }
    setupStepComponentInstance(instance) {
        if (instance.scene.onBeforePhysicsObservable) {
            instance.scene.onBeforePhysicsObservable.add(instance._step);
        }
    }
    removeStepComponentInstance(instance) {
        if (instance.scene.onBeforePhysicsObservable) {
            instance.scene.onBeforePhysicsObservable.removeCallback(instance._step);
        }
    }
    setupFixedComponentInstance(instance) {
        if (instance.scene.onAfterPhysicsObservable) {
            instance.scene.onAfterPhysicsObservable.add(instance._fixed);
        }
    }
    removeFixedComponentInstance(instance) {
        if (instance.scene.onAfterPhysicsObservable) {
            instance.scene.onAfterPhysicsObservable.removeCallback(instance._fixed);
        }
    }
    static RegisterInstance(instance) {
        if (instance != null) {
            if (instance._update != null) {
                instance.scene.registerBeforeRender(instance._update);
            }
            if (instance["late"] && instance._late != null && instance.scene.onBeforeRenderTargetsRenderObservable != null) {
                instance._lateUpdateObserver = instance.scene.onBeforeRenderTargetsRenderObservable.add(instance._late);
            }
            if (instance["after"] && instance._after != null) {
                instance.scene.registerAfterRender(instance._after);
            }
            if (instance["step"] && instance._step != null) {
                instance.setupStepComponentInstance(instance);
            }
            if (instance["fixed"] && instance._fixed != null) {
                instance.setupFixedComponentInstance(instance);
            }
        }
    }
    static UpdateInstance(instance) {
        if (instance != null && instance.transform != null && instance.transform.isEnabled(false)) {
            if (instance._awoken === false) {
                instance._awoken = true;
                ScriptComponent.ParseAutoProperties(instance);
                if (instance["awake"])
                    instance["awake"]();
            }
            else if (instance._started === false) {
                instance._started = true;
                if (instance["start"])
                    instance["start"]();
            }
            else if (instance._awoken === true && instance._started === true) {
                if (instance._delyed === true) {
                    instance._delyed = false;
                    ScriptComponent.ReadyInstance(instance);
                }
                if (instance["update"])
                    instance["update"]();
                instance._lateUpdate = true;
            }
        }
    }
    static LateInstance(instance) {
        if (instance != null && instance.transform != null && instance.transform.isEnabled(false)) {
            if (instance._lateUpdate === true) {
                instance._lateUpdate = false;
                if (instance._started === true) {
                    if (instance["late"])
                        instance["late"]();
                }
            }
        }
    }
    static AfterInstance(instance) {
        if (instance != null && instance.transform != null && instance.transform.isEnabled(false)) {
            if (instance._started === true) {
                if (instance["after"])
                    instance["after"]();
            }
        }
    }
    static StepInstance(instance) {
        if (instance != null && instance.transform != null) {
            if (instance._started === true) {
                if (instance["step"])
                    instance["step"]();
            }
        }
    }
    static FixedInstance(instance) {
        if (instance != null && instance.transform != null) {
            if (instance._started === true) {
                if (instance["fixed"])
                    instance["fixed"]();
            }
        }
    }
    static ReadyInstance(instance) {
        if (instance != null && instance.transform != null) {
            if (instance._scriptReady === false) {
                instance._scriptReady = true;
                if (instance["ready"])
                    instance["ready"]();
            }
        }
    }
    static ResetInstance(instance) {
        if (instance != null && instance.transform != null) {
            if (instance._started === true) {
                if (instance["reset"])
                    instance["reset"]();
            }
        }
    }
    static DestroyInstance(instance) {
        if (instance != null) {
            instance.scene.unregisterBeforeRender(instance._update);
            if (instance._lateUpdateObserver != null && instance.scene.onBeforeRenderTargetsRenderObservable != null) {
                instance.scene.onBeforeRenderTargetsRenderObservable.remove(instance._lateUpdateObserver);
            }
            if (instance["after"] && instance._after != null) {
                instance.scene.unregisterAfterRender(instance._after);
            }
            if (instance["step"] && instance._step != null) {
                instance.removeStepComponentInstance(instance);
            }
            if (instance["fixed"] && instance._fixed != null) {
                instance.removeFixedComponentInstance(instance);
            }
            const havokPlugin = Utilities.GetHavokPlugin();
            if (havokPlugin != null) {
                if (instance._bodyCollisionObserver != null) {
                    try {
                        instance._bodyCollisionObserver.remove();
                    }
                    catch (e) { }
                    ;
                }
                if (instance._bodyCollisionEndedObserver != null) {
                    try {
                        instance._bodyCollisionEndedObserver.remove();
                    }
                    catch (e) { }
                    ;
                }
                if (instance._worldTriggerEventObserver != null) {
                    try {
                        havokPlugin.onTriggerCollisionObservable.remove(instance._worldTriggerEventObserver);
                    }
                    catch (e) { }
                    ;
                }
            }
            try {
                instance.onCollisionEnterObservable.clear();
            }
            catch (e) { }
            ;
            try {
                instance.onCollisionStayObservable.clear();
            }
            catch (e) { }
            ;
            try {
                instance.onCollisionExitObservable.clear();
            }
            catch (e) { }
            ;
            try {
                instance.onTriggerEnterObservable.clear();
            }
            catch (e) { }
            ;
            try {
                instance.onTriggerExitObservable.clear();
            }
            catch (e) { }
            ;
            try {
                if (instance["destroy"])
                    instance["destroy"]();
            }
            catch (e) { }
            ;
            instance._scriptReady = false;
            instance._transform = null;
            instance._properties = null;
            instance._started = false;
            instance._delyed = false;
            instance._update = null;
            instance._late = null;
            instance._step = null;
            instance._fixed = null;
            instance._after = null;
            instance._ready = null;
            instance._scene = null;
        }
    }
    static ParseAutoProperties(instance) {
        const keys = Object.keys(instance._properties);
        if (keys != null && keys.length > 0) {
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index];
                if (Utilities.StartsWith(key, "auto__")) {
                    const name = key.replace("auto__", "");
                    if (Utilities.HasOwnProperty(instance, name)) {
                        const prop = instance.getProperty(key);
                        if (prop != null) {
                            const otype = typeof prop;
                            if (otype != null && otype !== "") {
                                if (otype === "object") {
                                    if (Array.isArray(prop)) {
                                        const newArray = [];
                                        const oldArray = prop;
                                        oldArray.forEach((item) => {
                                            if (item != null) {
                                                const itype = typeof item;
                                                if (itype === "object") {
                                                    newArray.push(ScriptComponent.UnpackObjectProperty(item, instance.scene));
                                                }
                                                else {
                                                    newArray.push(item);
                                                }
                                            }
                                        });
                                        instance[name] = newArray;
                                    }
                                    else {
                                        const xinst = instance[name];
                                        const xpack = ScriptComponent.UnpackObjectProperty(prop, instance.scene);
                                        if (xinst instanceof Color3 && xpack instanceof Color4) {
                                            instance[name] = new Color3(xpack.r, xpack.g, xpack.b);
                                        }
                                        else {
                                            instance[name] = xpack;
                                        }
                                    }
                                }
                                else {
                                    instance[name] = prop;
                                }
                            }
                            else {
                                instance[name] = prop;
                            }
                        }
                        else {
                            instance[name] = prop;
                        }
                    }
                    else {
                        Tools.Warn(instance.getClassName() || "Unregistered Class" + ": Auto property '" + name + "' not found for transform '" + instance.transform.name + "'");
                    }
                }
            }
        }
    }
    static UnpackObjectProperty(prop, scene) {
        let result = null;
        if (prop != null) {
            if (prop.x !== undefined && prop.y !== undefined) {
                if (prop.z !== undefined) {
                    if (prop.w !== undefined) {
                        result = new Vector4(prop.x, prop.y, prop.z, prop.w);
                    }
                    else {
                        result = new Vector3(prop.x, prop.y, prop.z);
                    }
                }
                else {
                    result = new Vector2(prop.x, prop.y);
                }
            }
            else if (prop.r !== undefined && prop.g !== undefined && prop.b !== undefined) {
                let alpha = 1.0;
                if (prop.a !== undefined) {
                    alpha = prop.a;
                }
                result = new Color4(prop.r, prop.g, prop.b, alpha);
            }
            else if (prop.type !== undefined) {
                switch (prop.type) {
                    case "UnityEngine.AnimationCurve":
                        const icurve = prop;
                        result = Animation.Parse(icurve.animation);
                        break;
                    case "UnityEngine.Transform":
                        const itrans = prop;
                        result = Utilities.ParseTransformByID(itrans, scene);
                        break;
                    case "UnityEngine.Material":
                        const imaterial = prop;
                        result = scene.getMaterialByName(imaterial.name);
                        break;
                    case "UnityEngine.Texture2D":
                        const itexture = prop;
                        result = Utilities.ParseTexture(itexture, scene);
                        break;
                    case "UnityEngine.Cubemap":
                        const icubemap = prop;
                        result = Utilities.ParseCubemap(icubemap, scene);
                        break;
                    case "UnityEngine.AudioClip":
                        const iaudioclip = prop;
                        result = iaudioclip;
                        break;
                    case "UnityEngine.Video.VideoClip":
                        const ivideoclip = prop;
                        result = ivideoclip;
                        break;
                    case "UnityEngine.Font":
                        const ifontasset = prop;
                        result = ifontasset;
                        break;
                    case "UnityEngine.TextAsset":
                        const itextasset = prop;
                        if (itextasset.base64 != null) {
                            if (itextasset.json === true) {
                                result = JSON.parse(WindowManager.Atob(itextasset.base64));
                            }
                            else {
                                result = WindowManager.Atob(itextasset.base64);
                            }
                        }
                        else {
                            result = itextasset;
                        }
                        break;
                    case "UnityEditor.DefaultAsset":
                        const idefaultasset = prop;
                        if (idefaultasset.base64 != null) {
                            if (idefaultasset.json === true) {
                                result = JSON.parse(WindowManager.Atob(idefaultasset.base64));
                            }
                            else {
                                result = WindowManager.Atob(idefaultasset.base64);
                            }
                        }
                        else {
                            result = idefaultasset;
                        }
                        break;
                    default:
                        result = prop;
                        break;
                }
            }
            else {
                result = prop;
            }
        }
        return result;
    }
}
export var System;
(function (System) {
    System[System["Deg2Rad"] = (Math.PI * 2 / 360)] = "Deg2Rad";
    System[System["Rad2Deg"] = (1 / System.Deg2Rad)] = "Rad2Deg";
    System[System["Epsilon"] = 0.000001] = "Epsilon";
    System[System["SingleEpsilon"] = 1.401298e-45] = "SingleEpsilon";
    System[System["EpsilonNormalSqrt"] = 1e-15] = "EpsilonNormalSqrt";
    System[System["Kph2Mph"] = 0.621371] = "Kph2Mph";
    System[System["Mph2Kph"] = 1.60934] = "Mph2Kph";
    System[System["Mps2Kph"] = 3.6] = "Mps2Kph";
    System[System["Mps2Mph"] = 2.23694] = "Mps2Mph";
    System[System["Meter2Inch"] = 39.3701] = "Meter2Inch";
    System[System["Inch2Meter"] = 0.0254] = "Inch2Meter";
    System[System["Gravity"] = 9.81] = "Gravity";
    System[System["Gravity3G"] = 29.400000000000002] = "Gravity3G";
    System[System["SkidFactor"] = 0.25] = "SkidFactor";
    System[System["MaxInteger"] = 2147483647] = "MaxInteger";
    System[System["WalkingVelocity"] = 4.4] = "WalkingVelocity";
    System[System["TerminalVelocity"] = 55] = "TerminalVelocity";
    System[System["SmoothDeltaFactor"] = 0.2] = "SmoothDeltaFactor";
    System[System["ToLinearSpace"] = 2.2] = "ToLinearSpace";
    System[System["ToGammaSpace"] = 0.45454545454545453] = "ToGammaSpace";
})(System || (System = {}));
export var SearchType;
(function (SearchType) {
    SearchType[SearchType["ExactMatch"] = 0] = "ExactMatch";
    SearchType[SearchType["StartsWith"] = 1] = "StartsWith";
    SearchType[SearchType["EndsWith"] = 2] = "EndsWith";
    SearchType[SearchType["IndexOf"] = 3] = "IndexOf";
})(SearchType || (SearchType = {}));
export var PlayerNumber;
(function (PlayerNumber) {
    PlayerNumber[PlayerNumber["Auto"] = 0] = "Auto";
    PlayerNumber[PlayerNumber["One"] = 1] = "One";
    PlayerNumber[PlayerNumber["Two"] = 2] = "Two";
    PlayerNumber[PlayerNumber["Three"] = 3] = "Three";
    PlayerNumber[PlayerNumber["Four"] = 4] = "Four";
})(PlayerNumber || (PlayerNumber = {}));
export var RenderQuality;
(function (RenderQuality) {
    RenderQuality[RenderQuality["High"] = 0] = "High";
    RenderQuality[RenderQuality["Medium"] = 1] = "Medium";
    RenderQuality[RenderQuality["Low"] = 2] = "Low";
})(RenderQuality || (RenderQuality = {}));
export var GamepadType;
(function (GamepadType) {
    GamepadType[GamepadType["None"] = -1] = "None";
    GamepadType[GamepadType["Generic"] = 0] = "Generic";
    GamepadType[GamepadType["Xbox360"] = 1] = "Xbox360";
    GamepadType[GamepadType["DualShock"] = 2] = "DualShock";
    GamepadType[GamepadType["PoseController"] = 3] = "PoseController";
})(GamepadType || (GamepadType = {}));
export var UserInputAxis;
(function (UserInputAxis) {
    UserInputAxis[UserInputAxis["Horizontal"] = 0] = "Horizontal";
    UserInputAxis[UserInputAxis["Vertical"] = 1] = "Vertical";
    UserInputAxis[UserInputAxis["ClientX"] = 2] = "ClientX";
    UserInputAxis[UserInputAxis["ClientY"] = 3] = "ClientY";
    UserInputAxis[UserInputAxis["MouseX"] = 4] = "MouseX";
    UserInputAxis[UserInputAxis["MouseY"] = 5] = "MouseY";
    UserInputAxis[UserInputAxis["Wheel"] = 6] = "Wheel";
})(UserInputAxis || (UserInputAxis = {}));
export var UserInputKey;
(function (UserInputKey) {
    UserInputKey[UserInputKey["BackSpace"] = 8] = "BackSpace";
    UserInputKey[UserInputKey["Tab"] = 9] = "Tab";
    UserInputKey[UserInputKey["Enter"] = 13] = "Enter";
    UserInputKey[UserInputKey["Shift"] = 16] = "Shift";
    UserInputKey[UserInputKey["Ctrl"] = 17] = "Ctrl";
    UserInputKey[UserInputKey["Alt"] = 18] = "Alt";
    UserInputKey[UserInputKey["Pause"] = 19] = "Pause";
    UserInputKey[UserInputKey["Break"] = 19] = "Break";
    UserInputKey[UserInputKey["CapsLock"] = 20] = "CapsLock";
    UserInputKey[UserInputKey["Escape"] = 27] = "Escape";
    UserInputKey[UserInputKey["SpaceBar"] = 32] = "SpaceBar";
    UserInputKey[UserInputKey["PageUp"] = 33] = "PageUp";
    UserInputKey[UserInputKey["PageDown"] = 34] = "PageDown";
    UserInputKey[UserInputKey["End"] = 35] = "End";
    UserInputKey[UserInputKey["Home"] = 36] = "Home";
    UserInputKey[UserInputKey["LeftArrow"] = 37] = "LeftArrow";
    UserInputKey[UserInputKey["UpArrow"] = 38] = "UpArrow";
    UserInputKey[UserInputKey["RightArrow"] = 39] = "RightArrow";
    UserInputKey[UserInputKey["DownArrow"] = 40] = "DownArrow";
    UserInputKey[UserInputKey["Insert"] = 45] = "Insert";
    UserInputKey[UserInputKey["Delete"] = 46] = "Delete";
    UserInputKey[UserInputKey["Num0"] = 48] = "Num0";
    UserInputKey[UserInputKey["Num1"] = 49] = "Num1";
    UserInputKey[UserInputKey["Num2"] = 50] = "Num2";
    UserInputKey[UserInputKey["Num3"] = 51] = "Num3";
    UserInputKey[UserInputKey["Num4"] = 52] = "Num4";
    UserInputKey[UserInputKey["Num5"] = 53] = "Num5";
    UserInputKey[UserInputKey["Num6"] = 54] = "Num6";
    UserInputKey[UserInputKey["Num7"] = 55] = "Num7";
    UserInputKey[UserInputKey["Num8"] = 56] = "Num8";
    UserInputKey[UserInputKey["Num9"] = 57] = "Num9";
    UserInputKey[UserInputKey["A"] = 65] = "A";
    UserInputKey[UserInputKey["B"] = 66] = "B";
    UserInputKey[UserInputKey["C"] = 67] = "C";
    UserInputKey[UserInputKey["D"] = 68] = "D";
    UserInputKey[UserInputKey["E"] = 69] = "E";
    UserInputKey[UserInputKey["F"] = 70] = "F";
    UserInputKey[UserInputKey["G"] = 71] = "G";
    UserInputKey[UserInputKey["H"] = 72] = "H";
    UserInputKey[UserInputKey["I"] = 73] = "I";
    UserInputKey[UserInputKey["J"] = 74] = "J";
    UserInputKey[UserInputKey["K"] = 75] = "K";
    UserInputKey[UserInputKey["L"] = 76] = "L";
    UserInputKey[UserInputKey["M"] = 77] = "M";
    UserInputKey[UserInputKey["N"] = 78] = "N";
    UserInputKey[UserInputKey["O"] = 79] = "O";
    UserInputKey[UserInputKey["P"] = 80] = "P";
    UserInputKey[UserInputKey["Q"] = 81] = "Q";
    UserInputKey[UserInputKey["R"] = 82] = "R";
    UserInputKey[UserInputKey["S"] = 83] = "S";
    UserInputKey[UserInputKey["T"] = 84] = "T";
    UserInputKey[UserInputKey["U"] = 85] = "U";
    UserInputKey[UserInputKey["V"] = 86] = "V";
    UserInputKey[UserInputKey["W"] = 87] = "W";
    UserInputKey[UserInputKey["X"] = 88] = "X";
    UserInputKey[UserInputKey["Y"] = 89] = "Y";
    UserInputKey[UserInputKey["Z"] = 90] = "Z";
    UserInputKey[UserInputKey["LeftWindowKey"] = 91] = "LeftWindowKey";
    UserInputKey[UserInputKey["RightWindowKey"] = 92] = "RightWindowKey";
    UserInputKey[UserInputKey["SelectKey"] = 93] = "SelectKey";
    UserInputKey[UserInputKey["Numpad0"] = 96] = "Numpad0";
    UserInputKey[UserInputKey["Numpad1"] = 97] = "Numpad1";
    UserInputKey[UserInputKey["Numpad2"] = 98] = "Numpad2";
    UserInputKey[UserInputKey["Numpad3"] = 99] = "Numpad3";
    UserInputKey[UserInputKey["Numpad4"] = 100] = "Numpad4";
    UserInputKey[UserInputKey["Numpad5"] = 101] = "Numpad5";
    UserInputKey[UserInputKey["Numpad6"] = 102] = "Numpad6";
    UserInputKey[UserInputKey["Numpad7"] = 103] = "Numpad7";
    UserInputKey[UserInputKey["Numpad8"] = 104] = "Numpad8";
    UserInputKey[UserInputKey["Numpad9"] = 105] = "Numpad9";
    UserInputKey[UserInputKey["Multiply"] = 106] = "Multiply";
    UserInputKey[UserInputKey["Add"] = 107] = "Add";
    UserInputKey[UserInputKey["Subtract"] = 109] = "Subtract";
    UserInputKey[UserInputKey["DecimalPoint"] = 110] = "DecimalPoint";
    UserInputKey[UserInputKey["Divide"] = 111] = "Divide";
    UserInputKey[UserInputKey["F1"] = 112] = "F1";
    UserInputKey[UserInputKey["F2"] = 113] = "F2";
    UserInputKey[UserInputKey["F3"] = 114] = "F3";
    UserInputKey[UserInputKey["F4"] = 115] = "F4";
    UserInputKey[UserInputKey["F5"] = 116] = "F5";
    UserInputKey[UserInputKey["F6"] = 117] = "F6";
    UserInputKey[UserInputKey["F7"] = 118] = "F7";
    UserInputKey[UserInputKey["F8"] = 119] = "F8";
    UserInputKey[UserInputKey["F9"] = 120] = "F9";
    UserInputKey[UserInputKey["F10"] = 121] = "F10";
    UserInputKey[UserInputKey["F11"] = 122] = "F11";
    UserInputKey[UserInputKey["F12"] = 123] = "F12";
    UserInputKey[UserInputKey["NumLock"] = 144] = "NumLock";
    UserInputKey[UserInputKey["ScrollLock"] = 145] = "ScrollLock";
    UserInputKey[UserInputKey["SemiColon"] = 186] = "SemiColon";
    UserInputKey[UserInputKey["EqualSign"] = 187] = "EqualSign";
    UserInputKey[UserInputKey["Comma"] = 188] = "Comma";
    UserInputKey[UserInputKey["Dash"] = 189] = "Dash";
    UserInputKey[UserInputKey["Period"] = 190] = "Period";
    UserInputKey[UserInputKey["ForwardSlash"] = 191] = "ForwardSlash";
    UserInputKey[UserInputKey["GraveAccent"] = 192] = "GraveAccent";
    UserInputKey[UserInputKey["OpenBracket"] = 219] = "OpenBracket";
    UserInputKey[UserInputKey["BackSlash"] = 220] = "BackSlash";
    UserInputKey[UserInputKey["CloseBraket"] = 221] = "CloseBraket";
    UserInputKey[UserInputKey["SingleQuote"] = 222] = "SingleQuote";
})(UserInputKey || (UserInputKey = {}));
export class UserInputOptions {
}
UserInputOptions.KeyboardSmoothing = false;
UserInputOptions.KeyboardMoveSensibility = 3.0;
UserInputOptions.KeyboardArrowSensibility = 1.0;
UserInputOptions.KeyboardMoveDeadZone = 0.001;
UserInputOptions.GamepadDeadStickValue = 0.15;
UserInputOptions.GamepadLStickXInverted = false;
UserInputOptions.GamepadLStickYInverted = false;
UserInputOptions.GamepadRStickXInverted = false;
UserInputOptions.GamepadRStickYInverted = true;
UserInputOptions.GamepadLStickSensibility = 1;
UserInputOptions.GamepadRStickSensibility = 1;
UserInputOptions.SupportedInputDevices = null;
UserInputOptions.BabylonAngularSensibility = 2000;
UserInputOptions.DefaultAngularSensibility = 0.5;
UserInputOptions.PointerWheelDeadZone = 0.1;
UserInputOptions.PointerMouseDeadZone = 0.1;
UserInputOptions.PointerMouseInverted = true;
UserInputOptions.UseCanvasElement = true;
UserInputOptions.UseArrowKeyRotation = false;
UserInputOptions.EnableBabylonRotation = false;
export class RequestHeader {
}
export class GlobalMessageBus {
    constructor() {
        this.ListenerDictionary = {};
        if (window && window.top) {
            this.HandleWindowMessage = this.HandleWindowMessage.bind(this);
            window.top.addEventListener("message", this.HandleWindowMessage);
        }
        else {
            console.warn("GlobalMessageBus: No Top Window Available");
        }
    }
    OnMessage(message, handler) {
        let listeners;
        if (this.ListenerDictionary[message] == null) {
            listeners = [];
            this.ListenerDictionary[message] = listeners;
        }
        else {
            listeners = this.ListenerDictionary[message];
        }
        const index = listeners.findIndex((e) => { return handler == e; });
        if (index < 0)
            listeners.push(handler);
    }
    PostMessage(message, data = null, target = "*", transfer) {
        if (window && window.top)
            window.top.postMessage({ source: "eventbus", message: message, data: data }, target, transfer);
        else
            console.warn("GlobalMessageBus: No Top Window Available");
    }
    RemoveHandler(message, handler) {
        const listeners = this.ListenerDictionary[message];
        if (listeners == null)
            return;
        const index = listeners.findIndex((e) => { return handler == e; });
        if (index >= 0)
            listeners.splice(index, 1);
    }
    ResetHandlers() {
        this.ListenerDictionary = {};
    }
    Dispose() {
        this.ResetHandlers();
        if (window && window.top)
            window.top.removeEventListener("message", this.HandleWindowMessage);
    }
    HandleWindowMessage(event) {
        if (event != null && event.data != null && event.data.message != null && event.data.source != null && event.data.source == "eventbus") {
            this.OnDispatchMessage(event.data.message, (event.data.data != null) ? event.data.data : null);
        }
    }
    OnDispatchMessage(message, data = null) {
        const listeners = this.ListenerDictionary[message];
        if (listeners == null)
            return;
        listeners.forEach((listener) => { try {
            if (listener)
                listener(data);
        }
        catch (e) {
            console.warn(e);
        } });
    }
}
export class PreloadAssetsManager extends AssetsManager {
    addContainerTask(taskName, meshesNames, rootUrl, sceneFilename) {
        var task = new ContainerAssetTask(taskName, meshesNames, rootUrl, sceneFilename);
        const atask = task;
        atask._lengthComputable = 0;
        atask._loaded = 0;
        atask._total = 0;
        atask.runTask = (scene, onSuccess, onError) => {
            SceneLoader.LoadAssetContainer(task.rootUrl, task.sceneFilename, scene, (container) => {
                task.loadedContainer = container;
                task.loadedMeshes = container.meshes;
                task.loadedParticleSystems = container.particleSystems;
                task.loadedSkeletons = container.skeletons;
                task.loadedAnimationGroups = container.animationGroups;
                onSuccess();
            }, (event) => {
                atask._lengthComputable = event.lengthComputable;
                atask._loaded = event.loaded;
                atask._total = event.total;
                this.handlePreloadingProgress();
            }, (scene, message, exception) => {
                onError(message, exception);
            });
        };
        this._tasks.push(task);
        return task;
    }
    addMeshTask(taskName, meshesNames, rootUrl, sceneFilename) {
        var task = new MeshAssetTask(taskName, meshesNames, rootUrl, sceneFilename);
        const atask = task;
        atask._lengthComputable = 0;
        atask._loaded = 0;
        atask._total = 0;
        atask.runTask = (scene, onSuccess, onError) => {
            SceneLoader.ImportMesh(task.meshesNames, task.rootUrl, task.sceneFilename, scene, (meshes, particleSystems, skeletons, animationGroups) => {
                task.loadedMeshes = meshes;
                task.loadedParticleSystems = particleSystems;
                task.loadedSkeletons = skeletons;
                task.loadedAnimationGroups = animationGroups;
                onSuccess();
            }, (event) => {
                atask._lengthComputable = event.lengthComputable;
                atask._loaded = event.loaded;
                atask._total = event.total;
                this.handlePreloadingProgress();
            }, (scene, message, exception) => {
                onError(message, exception);
            });
        };
        this._tasks.push(task);
        return task;
    }
    addTextFileTask(taskName, url) {
        var task = new TextFileAssetTask(taskName, url);
        const atask = task;
        atask._lengthComputable = 0;
        atask._loaded = 0;
        atask._total = 0;
        atask.runTask = (scene, onSuccess, onError) => {
            scene._loadFile(task.url, (data) => {
                task.text = data;
                onSuccess();
            }, (event) => {
                atask._lengthComputable = event.lengthComputable;
                atask._loaded = event.loaded;
                atask._total = event.total;
                this.handlePreloadingProgress();
            }, false, false, (request, exception) => {
                if (request) {
                    onError(request.status + " " + request.statusText, exception);
                }
            });
        };
        this._tasks.push(task);
        return task;
    }
    addBinaryFileTask(taskName, url) {
        var task = new BinaryFileAssetTask(taskName, url);
        const atask = task;
        atask._lengthComputable = 0;
        atask._loaded = 0;
        atask._total = 0;
        atask.runTask = (scene, onSuccess, onError) => {
            scene._loadFile(task.url, (data) => {
                task.data = data;
                onSuccess();
            }, (event) => {
                atask._lengthComputable = event.lengthComputable;
                atask._loaded = event.loaded;
                atask._total = event.total;
                this.handlePreloadingProgress();
            }, true, true, (request, exception) => {
                if (request) {
                    onError(request.status + " " + request.statusText, exception);
                }
            });
        };
        this._tasks.push(task);
        return task;
    }
    addImageTask(taskName, url) {
        var task = new ImageAssetTask(taskName, url);
        const atask = task;
        atask._lengthComputable = 0;
        atask._loaded = 0;
        atask._total = 0;
        atask.runTask = (scene, onSuccess, onError) => {
            var img = new Image();
            Tools.SetCorsBehavior(task.url, img);
            img.onload = () => {
                task.image = img;
                onSuccess();
            };
            img.onerror = (err) => {
                onError("Error loading image", err);
            };
            img.onprogress = (event) => {
                atask._lengthComputable = event.lengthComputable;
                atask._loaded = event.loaded;
                atask._total = event.total;
                this.handlePreloadingProgress();
            };
            img.src = task.url;
        };
        this._tasks.push(task);
        return task;
    }
    handlePreloadingProgress() {
        let lengthComputable = true;
        let loaded = 0;
        let total = 0;
        if (this._tasks != null && this._tasks.length > 0) {
            for (let index = 0; index < this._tasks.length; index++) {
                const atask = this._tasks[index];
                if (atask._lengthComputable != null && atask._loaded != null && atask._total != null) {
                    lengthComputable = lengthComputable && atask._lengthComputable;
                    loaded += atask._loaded;
                    total += atask._total;
                }
            }
        }
        if (SceneManager.OnAssetManagerProgress != null) {
            const aevent = {
                lengthComputable: lengthComputable,
                loaded: loaded,
                total: lengthComputable ? total : 0
            };
            SceneManager.OnAssetManagerProgress(aevent);
        }
    }
}
export var MaterialAlphaMode;
(function (MaterialAlphaMode) {
    MaterialAlphaMode["OPAQUE"] = "OPAQUE";
    MaterialAlphaMode["MASK"] = "MASK";
    MaterialAlphaMode["BLEND"] = "BLEND";
})(MaterialAlphaMode || (MaterialAlphaMode = {}));
export class CubeTextureLoader {
}
export class CVTOOLS_unity_metadata {
    constructor(loader) {
        this.name = SceneManager.CVTOOLS_NAME;
        this.enabled = false;
        this._webgpu = false;
        this._babylonScene = null;
        this._metadataParser = null;
        this._loaderScene = null;
        this._assetsManager = null;
        this._materialMap = null;
        this._lightmapMap = null;
        this._reflectionMap = null;
        this._reflectionCache = null;
        this._assetContainer = false;
        this._activeMeshes = false;
        this._parseScene = false;
        this._leftHanded = false;
        this._disposeRoot = false;
        this._sceneParsed = false;
        this._preWarmTime = 1;
        this._hideLoader = false;
        this._rootUrl = null;
        this._fileName = "Unknown";
        this._licenseName = "Unknown";
        this._licenseType = "standard";
        this._loader = loader;
        this.enabled = (this._loader.isExtensionUsed(SceneManager.CVTOOLS_NAME) && this._loader.isExtensionUsed(SceneManager.CVTOOLS_HAND));
        this._parseScene = this._leftHanded = this._disposeRoot = this._sceneParsed = false;
        this._rootUrl = null;
        this._masterList = null;
        this._detailList = null;
        this._parserList = null;
        this._shaderList = null;
        this._readyList = null;
        this._preloadList = null;
        this._materialMap = null;
        this._lightmapMap = null;
        this._preWarmTime = 1;
        this._hideLoader = false;
        this._loaderScene = null;
        this._assetsManager = null;
        this._reflectionMap = null;
        this._reflectionCache = null;
        this._animationGroups = null;
        this._metadataParser = null;
        this._babylonScene = null;
        this.order = 100;
    }
    dispose() {
        delete this._loader;
    }
    onLoading() {
        Utilities.LoadingState = 0;
        this._assetContainer = (this._loader._assetContainer != null);
        this._metadataParser = null;
        this._babylonScene = this._loader.babylonScene;
        this._loaderScene = null;
        this._assetsManager = null;
        this._rootUrl = (this._loader._uniqueRootUrl) ? this._loader._uniqueRootUrl : "/";
        this._fileName = this._loader._fileName ? this._loader._fileName : "Unknown";
        if (this._fileName.indexOf("?") >= 0)
            this._fileName = this._fileName.split("?")[0];
        this._loader.parent.onCompleteObservable.addOnce(() => { this.onComplete(); });
        this._loader.parent.onValidatedObservable.addOnce(() => { this.onValidate(); });
        this._parseScene = (this._loader.isExtensionUsed(SceneManager.CVTOOLS_NAME) && this._loader.isExtensionUsed(SceneManager.CVTOOLS_HAND) && SceneManager.IsSceneParsingEnabled() === true);
        this._leftHanded = (this._loader.isExtensionUsed(SceneManager.CVTOOLS_HAND));
        this._disposeRoot = this._sceneParsed = false;
        this._animationGroups = [];
        this._masterList = [];
        this._detailList = [];
        this._parserList = [];
        this._shaderList = [];
        this._readyList = [];
        this._preloadList = [];
        this._materialMap = new Map();
        this._lightmapMap = new Map();
        this._preWarmTime = 1;
        this._hideLoader = false;
        this._reflectionMap = {};
        this._reflectionCache = {};
        Utilities.ResetLoaderItemsMarkedForDisposal();
        this._webgpu = (this._babylonScene.getEngine() instanceof WebGPUEngine);
        this._babylonScene.getEngine().getCaps().supportSRGBBuffers = SceneManager.SupportSRGBBuffers;
        if (this._leftHanded === true && this._loader.rootBabylonMesh != null) {
            this._loader.rootBabylonMesh.rotationQuaternion = Quaternion.Identity();
            this._loader.rootBabylonMesh.scaling = Vector3.One();
        }
        if (this._parseScene === true) {
            SceneManager.RenderLoopReady = false;
            if (this._loader.rootBabylonMesh != null)
                this._loader.rootBabylonMesh.name = "Root." + this._fileName.replace(".gltf", "").replace(".glb", "");
            this.setupLoader();
        }
    }
    onReady() {
        if (this._parseScene === true) {
            if (this._disposeRoot === true && this._loader.rootBabylonMesh != null)
                this._loader.rootBabylonMesh.dispose(true);
        }
    }
    onComplete() {
        if (this._parseScene === true) {
        }
        this.finishComplete();
    }
    getScriptBundleTag() {
        let result = null;
        var scene = this._loaderScene;
        var metadata = (scene != null && scene.extras != null && scene.extras.metadata != null) ? scene.extras.metadata : null;
        if (metadata != null) {
            let root = (this._rootUrl != null) ? this._rootUrl : "/";
            let script = (metadata.script != null) ? metadata.script : null;
            let project = (metadata.project != null) ? metadata.project : null;
            if (script != null && script !== "" && project != null && project !== "") {
                result = project.toLocaleLowerCase();
            }
        }
        return result;
    }
    getScriptBundleUrl() {
        let result = null;
        var scene = this._loaderScene;
        var metadata = (scene != null && scene.extras != null && scene.extras.metadata != null) ? scene.extras.metadata : null;
        if (metadata != null) {
            let root = (this._rootUrl != null) ? this._rootUrl : "/";
            let script = (metadata.script != null) ? metadata.script : null;
            let project = (metadata.project != null) ? metadata.project : null;
            if (script != null && script !== "" && project != null && project !== "") {
                result = (root + project);
            }
        }
        return result;
    }
    finishComplete() {
        if (this._parseScene === true) {
            this.startParsing();
            SceneManager.RenderLoopReady = true;
            this._babylonScene.onAfterRenderObservable.addOnce(() => {
                Utilities.LoadingState = 3;
                this._processPreloadTimeout();
            });
        }
    }
    onValidate() {
        if (this._parseScene === true) {
        }
    }
    onCleanup() {
        this._fileName = null;
        this._rootUrl = null;
        this._parseScene = this._leftHanded = this._disposeRoot = this._sceneParsed = false;
        this._masterList = null;
        this._detailList = null;
        this._parserList = null;
        this._shaderList = null;
        this._preWarmTime = 1;
        this._readyList = null;
        this._preloadList = null;
        this._hideLoader = false;
        this._animationGroups = null;
        if (this._materialMap != null) {
            this._materialMap.clear();
            this._materialMap = null;
        }
        if (this._lightmapMap != null) {
            this._lightmapMap.clear();
            this._lightmapMap = null;
        }
        this._loaderScene = null;
        this._assetsManager = null;
        this._reflectionMap = null;
        this._reflectionCache = null;
        this._metadataParser = null;
        this._babylonScene = null;
    }
    setupLoader() {
        const filename = this._fileName;
        if (this._parseScene === true) {
            this._assetsManager = new PreloadAssetsManager(this._babylonScene);
            this._assetsManager.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
                if (SceneManager.AutoUpdateProgress === true) {
                    const assetsMsg = (totalCount === 1) ? " ASSET" : " ASSETS";
                    const progressMsg = ("LOADING " + (totalCount - remainingCount) + " OF " + totalCount + assetsMsg);
                    WindowManager.UpdateLoaderDetails(progressMsg, Utilities.LoadingState);
                }
                else {
                    if (Utilities.OnPreloaderProgress != null)
                        Utilities.OnPreloaderProgress(remainingCount, totalCount, lastFinishedTask);
                }
            };
            this._assetsManager.onFinish = (tasks) => {
                WindowManager.SetTimeout(100, () => {
                    Utilities.LoadingState = 4;
                    if (SceneManager.AutoUpdateProgress === true) {
                        WindowManager.UpdateLoaderStatus("PLEASE WAIT", "PREPARING SCENE VIEW", Utilities.LoadingState);
                    }
                    const finishTimer = (this._preWarmTime > 0) ? (this._preWarmTime * 1000) : 100;
                    WindowManager.SetTimeout(finishTimer, () => {
                        if (Utilities.OnPreloaderComplete != null)
                            Utilities.OnPreloaderComplete(tasks);
                        this._processShaderMaterials(this._babylonScene, this._shaderList);
                        Utilities.RemoveLoaderItemsMarkedForDisposal();
                        if (this._readyList != null && this._readyList.length > 0) {
                            for (let index = 0; index < this._readyList.length; index++) {
                                const instance = this._readyList[index];
                                if (instance != null && instance._ready) {
                                    instance._ready();
                                }
                            }
                        }
                        this._babylonScene.onAfterRenderObservable.addOnce(() => {
                            console.warn("CVTOOLS: OnSceneReady: " + filename);
                            const scenename = (filename != null && filename !== "") ? filename : "Unknown";
                            if (SceneManager.OnSceneReadyObservable != null) {
                                SceneManager.OnSceneReadyObservable.notifyObservers(scenename);
                            }
                            if (this._hideLoader == true) {
                                WindowManager.HideSceneLoader();
                            }
                            this.onCleanup();
                        });
                    });
                });
            };
        }
    }
    startParsing() {
        if (this._parseScene === true) {
            Utilities.LoadingState = 2;
            this._processLevelOfDetail(this._babylonScene, this._detailList);
            this._processActiveMeshes(this._babylonScene, this._activeMeshes);
            this._processUnityMeshes(this._masterList);
            if (this._loaderScene != null) {
                this.preProcessSceneProperties(this._loaderScene, this._babylonScene);
                this.postProcessSceneProperties(this._rootUrl, this._loaderScene, this._babylonScene);
            }
            if (this._assetContainer === false && this._parserList != null && this._parserList.length > 0) {
                this._metadataParser = Utilities.PostParseSceneComponents(this._babylonScene, this._parserList, this._preloadList, this._readyList);
            }
        }
    }
    loadSceneAsync(context, scene) {
        if (this._parseScene === true)
            this._loaderScene = scene;
        if (this._parseScene === true && scene.extras != null && scene.extras.metadata != null) {
            if (scene.extras.metadata.rawmaterials != null) {
                const loader = this._loader;
                const rawmaterials = scene.extras.metadata.rawmaterials;
                this._preloadRawMaterialsAsync(context, loader._gltf.materials, rawmaterials);
            }
            Utilities.LoadingState = 1;
            const rval = this._loader.loadSceneAsync(context, scene);
            this.loadSceneExAsync(context, scene);
            return rval;
        }
        else {
            Utilities.LoadingState = 1;
            return null;
        }
    }
    loadSceneExAsync(context, scene) {
        const loader = this._loader;
        const promises = new Array();
        if (loader._gltf.nodes) {
            for (const node of loader._gltf.nodes) {
                if (node._babylonTransformNode && this._animationGroups) {
                    Utilities.AssignAnimationGroupsToNode(node._babylonTransformNode, this._animationGroups);
                }
            }
        }
        if (this._reflectionMap != null && this._reflectionCache != null) {
            let tindex = 0;
            for (const key in this._reflectionMap) {
                tindex++;
                if (this._reflectionMap.hasOwnProperty(key)) {
                    const cubeTextureUrl = key;
                    if (this._assetsManager != null) {
                        const reflectionTask = this._assetsManager.addBinaryFileTask(("Material.ReflectionTextureTask" + tindex.toFixed(0)), cubeTextureUrl);
                        reflectionTask.onSuccess = (task) => {
                            if (task.data != null) {
                                const blobData = new Blob([task.data]);
                                const cubeTextureLoaders = this._reflectionMap[cubeTextureUrl];
                                if (cubeTextureLoaders != null) {
                                    cubeTextureLoaders.forEach((ctx) => {
                                        if (ctx != null && ctx.mapkey != null) {
                                            const cachedCubeTexture = this._reflectionCache[ctx.mapkey];
                                            if (cachedCubeTexture != null) {
                                                if (ctx.material != null && Utilities.HasOwnProperty(ctx.material, "reflectionTexture")) {
                                                    ctx.material.reflectionTexture = cachedCubeTexture;
                                                }
                                            }
                                            else {
                                                const babylonScene = this._babylonScene;
                                                const textureBlobUrl = URL.createObjectURL(blobData);
                                                const revokeBlobURL = () => { URL.revokeObjectURL(textureBlobUrl); };
                                                const newCubeTexture = new CubeTexture(textureBlobUrl, babylonScene, null, null, null, revokeBlobURL, revokeBlobURL, null, ctx.prefiltered, ctx.extension);
                                                newCubeTexture.name = ctx.name;
                                                if (ctx.boundingBoxSize != null)
                                                    newCubeTexture.boundingBoxSize = ctx.boundingBoxSize;
                                                if (ctx.boundingBoxPosition != null)
                                                    newCubeTexture.boundingBoxPosition = ctx.boundingBoxPosition;
                                                this._reflectionCache[ctx.mapkey] = newCubeTexture;
                                                if (ctx.material != null && Utilities.HasOwnProperty(ctx.material, "reflectionTexture")) {
                                                    ctx.material.reflectionTexture = newCubeTexture;
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                            else {
                                console.error("Failed to load reflection texture task: " + cubeTextureUrl);
                            }
                        };
                        reflectionTask.onError = (task, message, exception) => { console.error(message, exception); };
                    }
                }
            }
        }
        loader.logClose();
        return Promise.all(promises).then(() => { });
    }
    _processActiveMeshes(scene, activeMeshes) {
        if (activeMeshes === true)
            scene.freeActiveMeshes();
    }
    _processUnityMeshes(masters) {
        if (masters != null && masters.length > 0) {
            masters.forEach((master) => {
                Utilities.RegisterInstancedMeshBuffers(master);
            });
        }
    }
    _processPreloadTimeout() {
        if (this._assetsManager != null) {
            if (this._preloadList != null && this._preloadList.length > 0) {
                for (let index = 0; index < this._preloadList.length; index++) {
                    const instance = this._preloadList[index];
                    if (instance != null && instance.addPreloaderTasks) {
                        instance.addPreloaderTasks(this._assetsManager);
                    }
                }
            }
            this._babylonScene._preloaded = true;
            this._assetsManager.load();
        }
    }
    loadNodeAsync(context, node, assign) {
        if (this._parseScene === true && node.extras != null && node.extras.metadata != null) {
            return this._loader.loadNodeAsync(context, node, (source) => {
                const mesh = source;
                const metadata = node.extras.metadata;
                if (mesh.metadata == null)
                    mesh.metadata = {};
                mesh.metadata.toolkit = metadata;
                Utilities.ValidateTransformGuid(mesh);
                Utilities.ValidateTransformMetadata(mesh);
                Utilities.ValidateTransformQuaternion(mesh);
                mesh.isVisible = (mesh.metadata.toolkit.visible != null) ? mesh.metadata.toolkit.visible : true;
                mesh.visibility = (mesh.metadata.toolkit.visibility != null) ? mesh.metadata.toolkit.visibility : 1;
                mesh.billboardMode = (mesh.metadata.toolkit.billboard != null) ? mesh.metadata.toolkit.billboard : 0;
                if (this._assetContainer === true) {
                    mesh.metadata.toolkit.prefab = true;
                }
                if (mesh.metadata.toolkit.prefab === true) {
                    mesh.setEnabled(false);
                }
                else {
                    this._parserList.push(mesh);
                    if (node.extras.metadata.lods != null && node.extras.metadata.distances != null) {
                        if (this._detailList != null)
                            this._detailList.push(mesh);
                    }
                }
                this._masterList.push(mesh);
                assign(mesh);
            });
        }
        else {
            return null;
        }
    }
    loadMaterialPropertiesAsync(context, material, babylonMaterial) {
        if (this._parseScene === true) {
            let materialIndex = -1;
            if (material["index"]) {
                materialIndex = material["index"];
                if (materialIndex >= 0 && this._materialMap != null) {
                    if (!this._materialMap.has(materialIndex)) {
                        this._materialMap.set(materialIndex, babylonMaterial);
                    }
                }
            }
            babylonMaterial["gltfIndex"] = materialIndex;
            const loader = this._loader;
            const promises = new Array();
            if (babylonMaterial instanceof NodeMaterial) {
                promises.push(this._parseNodeMaterialPropertiesAsync(`${context}/nodeMaterial`, material, babylonMaterial));
            }
            else if (babylonMaterial instanceof ShaderMaterial) {
                promises.push(this._parseShaderMaterialPropertiesAsync(`${context}/shaderMaterial`, material, babylonMaterial));
            }
            else if (babylonMaterial instanceof StandardMaterial) {
                promises.push(this._parseDiffuseMaterialPropertiesAsync(`${context}/standardMaterial`, material, babylonMaterial));
            }
            else {
                const extensionPromise = loader._extensionsLoadMaterialPropertiesAsync(context, material, babylonMaterial);
                if (extensionPromise) {
                    this._parseCommonConstantProperties(promises, `${context}/commonConstant`, material, babylonMaterial);
                }
                else {
                    promises.push(loader.loadMaterialBasePropertiesAsync(context, material, babylonMaterial));
                    if (material.pbrMetallicRoughness) {
                        promises.push(loader._loadMaterialMetallicRoughnessPropertiesAsync(`${context}/pbrMetallicRoughness`, material.pbrMetallicRoughness, babylonMaterial));
                    }
                    loader.loadMaterialAlphaProperties(context, material, babylonMaterial);
                    this._parseCommonConstantProperties(promises, `${context}/commonConstant`, material, babylonMaterial);
                }
            }
            return Promise.all(promises).then(() => { });
        }
        else {
            return null;
        }
    }
    _getCachedMaterialByIndex(index) {
        let result = null;
        if (index >= 0 && this._materialMap != null) {
            result = this._materialMap.get(index) || null;
        }
        return result;
    }
    _getCachedLightmapByIndex(index) {
        let result = null;
        if (index >= 0 && this._lightmapMap != null) {
            result = this._lightmapMap.get(index) || null;
        }
        return result;
    }
    createMaterial(context, material, babylonDrawMode) {
        if (this._parseScene === true) {
            if (material["index"]) {
                const materialIndex = material["index"];
                if (materialIndex >= 0) {
                    const cachedMaterial = this._getCachedMaterialByIndex(materialIndex);
                    if (cachedMaterial != null) {
                        return cachedMaterial;
                    }
                }
            }
        }
        if (this._parseScene === true) {
            let babylonMaterial = null;
            const materialName = material.name || "No Name";
            if (material.extras != null && material.extras.metadata != null && material.extras.metadata.customMaterial != null) {
                const commonConstant = material.extras.metadata;
                const CustomClassName = commonConstant.customMaterial;
                const CustomShaderName = commonConstant.customShader;
                const CustomMaterialClass = Utilities.InstantiateClass(CustomClassName);
                if (CustomMaterialClass != null) {
                    const customMaterial = new CustomMaterialClass(materialName, this._loader.babylonScene);
                    if (customMaterial != null) {
                        const ismaterial = (customMaterial instanceof Material);
                        if (ismaterial === true) {
                            babylonMaterial = customMaterial;
                            babylonMaterial.fillMode = babylonDrawMode;
                            if (babylonMaterial instanceof ShaderMaterial) {
                                Utilities.InitializeShaderMaterial(babylonMaterial);
                            }
                        }
                        else {
                            Tools.Warn("Non material instantiated class: " + CustomClassName);
                        }
                    }
                    else {
                        Tools.Warn("Failed to instantiate material class: " + CustomClassName);
                    }
                }
                else {
                    Tools.Warn("Failed to locate material class: " + CustomClassName);
                }
            }
            return babylonMaterial;
        }
        else {
            return null;
        }
    }
    loadAnimationAsync(context, animation) {
        if (this._parseScene === true) {
            const loader = this._loader;
            const xanimation = animation;
            this._babylonScene._blockEntityCollection = !!this._assetContainer;
            const babylonAnimationGroup = new AnimationGroup(animation.name || `animation${xanimation.index}`, this._babylonScene);
            babylonAnimationGroup._parentContainer = this._assetContainer;
            this._babylonScene._blockEntityCollection = false;
            xanimation._babylonAnimationGroup = babylonAnimationGroup;
            this._animationGroups.push(babylonAnimationGroup);
            const promises = new Array();
            ArrayItem.Assign(xanimation.channels);
            ArrayItem.Assign(xanimation.samplers);
            for (const channel of animation.channels) {
                const xchannel = channel;
                promises.push(this._loader._loadAnimationChannelAsync(`${context}/channels/${xchannel.index}`, context, animation, channel, (babylonTarget, babylonAnimation) => {
                    babylonTarget.animations = babylonTarget.animations || [];
                    babylonTarget.animations.push(babylonAnimation);
                    babylonAnimationGroup.addTargetedAnimation(babylonAnimation, babylonTarget);
                }));
            }
            return Promise.all(promises).then(() => {
                if (animation.extras != null && animation.extras.metadata != null) {
                    const metadata = {};
                    metadata.toolkit = animation.extras.metadata;
                    babylonAnimationGroup.metadata = metadata;
                    if (metadata.label != null && metadata.label !== "") {
                        babylonAnimationGroup.name = metadata.label;
                    }
                }
                babylonAnimationGroup.normalize(0);
                return babylonAnimationGroup;
            });
        }
        else {
            return null;
        }
    }
    _loadMeshPrimitiveAsync(context, name, node, mesh, primitive, assign) {
        if (this._parseScene === true) {
            const loader = this._loader;
            loader.logOpen(`${context}`);
            const shouldInstance = loader._disableInstancedMesh === 0 && loader._parent.createInstances && node.skin == undefined && !mesh.primitives[0].targets;
            let babylonAbstractMesh;
            let promise;
            if (shouldInstance && primitive._instanceData) {
                loader._babylonScene._blockEntityCollection = !!loader._assetContainer;
                babylonAbstractMesh = primitive._instanceData.babylonSourceMesh.createInstance(name);
                babylonAbstractMesh._parentContainer = loader._assetContainer;
                loader._babylonScene._blockEntityCollection = false;
                promise = primitive._instanceData.promise;
            }
            else {
                const promises = new Array();
                loader._babylonScene._blockEntityCollection = !!loader._assetContainer;
                const babylonMesh = new Mesh(name, loader._babylonScene);
                babylonMesh._parentContainer = loader._assetContainer;
                loader._babylonScene._blockEntityCollection = false;
                if (this._leftHanded === true) {
                    babylonMesh.overrideMaterialSideOrientation = Material.CounterClockWiseSideOrientation;
                }
                else {
                    babylonMesh.overrideMaterialSideOrientation = loader._babylonScene.useRightHandedSystem ? Material.CounterClockWiseSideOrientation : Material.ClockWiseSideOrientation;
                }
                loader._createMorphTargets(context, node, mesh, primitive, babylonMesh);
                promises.push(loader._loadVertexDataAsync(context, primitive, babylonMesh).then((babylonGeometry) => {
                    return loader._loadMorphTargetsAsync(context, primitive, babylonMesh, babylonGeometry).then(() => {
                        if (loader._disposed) {
                            return;
                        }
                        loader._babylonScene._blockEntityCollection = !!loader._assetContainer;
                        babylonGeometry.applyToMesh(babylonMesh);
                        this._setupBabylonMesh(babylonMesh, node, mesh, primitive);
                        babylonGeometry._parentContainer = loader._assetContainer;
                        loader._babylonScene._blockEntityCollection = false;
                    });
                }));
                const babylonDrawMode = GLTFLoader._GetDrawMode(context, primitive.mode);
                if (primitive.extras != null && primitive.extras.metadata != null && primitive.extras.metadata.multimaterial != null && primitive.extras.metadata.submeshes != null) {
                    this._setupBabylonMaterials(context, promises, babylonDrawMode, babylonMesh, mesh, primitive);
                }
                else if (primitive.material == undefined) {
                    let babylonMaterial = loader._defaultBabylonMaterialData[babylonDrawMode];
                    if (!babylonMaterial) {
                        babylonMaterial = loader._createDefaultMaterial("__GLTFLoader._default", babylonDrawMode);
                        loader._parent.onMaterialLoadedObservable.notifyObservers(babylonMaterial);
                        loader._defaultBabylonMaterialData[babylonDrawMode] = babylonMaterial;
                    }
                    babylonMesh.material = babylonMaterial;
                }
                else if (!loader.parent.skipMaterials) {
                    const material = ArrayItem.Get(`${context}/material`, loader._gltf.materials, primitive.material);
                    promises.push(loader._loadMaterialAsync(`/materials/${material.index}`, material, babylonMesh, babylonDrawMode, (babylonMaterial) => {
                        babylonMesh.material = babylonMaterial;
                    }));
                }
                promise = Promise.all(promises);
                if (shouldInstance) {
                    primitive._instanceData = {
                        babylonSourceMesh: babylonMesh,
                        promise: promise,
                    };
                }
                babylonAbstractMesh = babylonMesh;
            }
            GLTFLoader.AddPointerMetadata(babylonAbstractMesh, context);
            loader._parent.onMeshLoadedObservable.notifyObservers(babylonAbstractMesh);
            assign(babylonAbstractMesh);
            loader.logClose();
            return promise.then(() => {
                return babylonAbstractMesh;
            });
        }
        else {
            return null;
        }
    }
    _setupBabylonMesh(babylonMesh, node, mesh, primitive) {
        if (this._parseScene === true) {
            const loader = this._loader;
            if (primitive.extras != null && primitive.extras.metadata != null && primitive.extras.metadata.multimaterial != null && primitive.extras.metadata.submeshes != null) {
                const submeshes = primitive.extras.metadata.submeshes;
                babylonMesh.subMeshes = [];
                for (let subIndex = 0; subIndex < submeshes.length; subIndex++) {
                    const parsedSubMesh = submeshes[subIndex];
                    SubMesh.AddToMesh(parsedSubMesh.materialIndex, parsedSubMesh.verticesStart, parsedSubMesh.verticesCount, parsedSubMesh.indexStart, parsedSubMesh.indexCount, babylonMesh);
                }
            }
            babylonMesh.computeWorldMatrix(true);
        }
    }
    _setupBabylonMaterials(context, promises, drawmode, babylonMesh, mesh, primitive) {
        if (this._parseScene === true) {
            const loader = this._loader;
            const multimaterial = primitive.extras.metadata.multimaterial;
            const materialids = multimaterial.materials;
            const materials = [];
            const matid = multimaterial.id || ("MM_" + mesh.name);
            const matname = multimaterial.name || ("MM_" + mesh.name);
            const multimat = new MultiMaterial(("[" + matname + "]"), loader._babylonScene);
            multimat.id = matid;
            materialids.forEach((materialId) => {
                if (materialId != null) {
                    const matIndex = parseInt(materialId);
                    if (matIndex >= 0) {
                        const material = ArrayItem.Get(`${context}/material`, loader._gltf.materials, matIndex);
                        materials.push(material);
                    }
                    else {
                        console.warn("Invalid Submesh Material Index Encountered For: " + babylonMesh.name);
                    }
                }
                else {
                    console.warn("Null Submesh Material Encountered For: " + babylonMesh.name);
                }
            });
            promises.push(this._parseMultiMaterialAsync(`/materials/${matname}`, materials, babylonMesh, drawmode, (babylonMaterials) => {
                multimat.subMaterials = babylonMaterials;
                babylonMesh.material = multimat;
            }));
        }
    }
    _processLevelOfDetail(scene, detailList) {
        if (detailList != null && detailList.length > 0) {
            detailList.forEach((transform) => {
                if (transform.metadata != null && transform.metadata.toolkit != null && transform.metadata.toolkit.lods != null && transform.metadata.toolkit.distances != null) {
                    const metadata = transform.metadata.toolkit;
                    const lodnames = metadata.lods;
                    const distances = metadata.distances;
                    if (distances.length >= lodnames.length) {
                        let mastermesh = null;
                        let detailmeshes = null;
                        lodnames.forEach((lodname, index) => {
                            const lodnode = (lodname === "*") ? transform : SceneManager.FindChildTransformNode(transform, lodname, SearchType.ExactMatch, false);
                            if (lodnode != null && lodnode instanceof AbstractMesh) {
                                if (index === 0) {
                                    mastermesh = lodnode;
                                }
                                else {
                                    if (detailmeshes == null)
                                        detailmeshes = [];
                                    detailmeshes.push(lodnode);
                                }
                            }
                        });
                        if (mastermesh != null) {
                            if (mastermesh instanceof Mesh) {
                                let culling = (distances.length > 0) ? distances[distances.length - 1] : 0;
                                if (culling >= Infinity)
                                    culling = 0;
                                if (detailmeshes != null) {
                                    detailmeshes.forEach((detailmesh, index) => {
                                        mastermesh.addLODLevel(distances[index], detailmesh);
                                    });
                                }
                                if (culling > 0) {
                                    mastermesh.addLODLevel(culling, null);
                                }
                            }
                            else if (mastermesh instanceof InstancedMesh) {
                                if (detailmeshes != null) {
                                    detailmeshes.forEach((detailmesh, index) => {
                                        try {
                                            detailmesh.dispose();
                                        }
                                        catch { }
                                        Tools.Warn("Destroyed Unused Level Detail: " + detailmesh.name + " --> For Transform: " + transform.name);
                                    });
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    _processShaderMaterials(scene, shaderList) {
        if (shaderList != null && shaderList.length > 0) {
            shaderList.forEach((material) => { material.freeze(); });
        }
    }
    preProcessSceneProperties(scene, babylonScene) {
        if (this._assetContainer === true)
            return;
        if (this._sceneParsed === false && scene.extras != null && scene.extras.metadata != null && scene.extras.metadata.properties != null && scene.extras.metadata.properties === true) {
            this._sceneParsed = true;
            const root = (this._rootUrl != null) ? this._rootUrl : "/";
            const metadata = scene.extras.metadata;
            if (babylonScene.metadata == null)
                babylonScene.metadata = {};
            if (babylonScene.metadata.toolkit == null)
                babylonScene.metadata.toolkit = {};
            babylonScene.metadata.toolkit = metadata;
            this._disposeRoot = (metadata.disposeroot != null && metadata.disposeroot === true);
            this._hideLoader = (metadata.hideloader != null && metadata.hideloader === true);
            this._preWarmTime = (metadata.prewarmup != null) ? metadata.prewarmup : 0;
            this._licenseType = (metadata.license != null) ? metadata.license : "standard";
            this._licenseName = (metadata.licensee != null) ? metadata.licensee : "Unknown";
            SceneManager.SetRootUrl(babylonScene, root);
            SceneManager.SetSceneFile(babylonScene, this._fileName);
            SceneManager.EnableUserInput = true;
            if (this._licenseName != null && this._licenseName !== "" && this._licenseName !== "Unknown" && this._licenseName !== "DefaultCompany" && this._licenseName !== "Default Company") {
                Tools.Log(Utilities.MakeProper(this._fileName) + " licensed to " + this._licenseName);
            }
            SceneManager.GlobalOptions.ktxtextures = (metadata.ktxtextures != null) ? metadata.ktxtextures : false;
            SceneManager.GlobalOptions.ktxlightmaps = (metadata.ktxlightmaps != null) ? metadata.ktxlightmaps : false;
            SceneManager.GlobalOptions.intensityFactor = (metadata.intensity != null) ? metadata.intensity : 1.0;
            SceneManager.GlobalOptions.debugModeEnabled = (metadata.debugging != null) ? metadata.debugging : false;
            SceneManager.GlobalOptions.showDebugColliders = (metadata.showdebugcolliders != null) ? metadata.showdebugcolliders : false;
            SceneManager.GlobalOptions.colliderVisibility = (metadata.collidervisibility != null) ? metadata.collidervisibility : 0;
            SceneManager.GlobalOptions.colliderRenderGroup = (metadata.colliderrendergroup != null) ? metadata.colliderrendergroup : 0;
            SceneManager.GlobalOptions.defaultRenderGroup = (metadata.defaultrendergroup != null) ? metadata.defaultrendergroup : 0;
            SceneManager.GlobalOptions.collisionWireframe = (metadata.collisionwireframe != null) ? metadata.collisionwireframe : false;
            SceneManager.GlobalOptions.useTriangleNormals = (metadata.trianglenormals != null) ? metadata.trianglenormals : false;
            SceneManager.GlobalOptions.useConvexTriangles = (metadata.convextriangles != null) ? metadata.convextriangles : true;
            SceneManager.GlobalOptions.colliderInstances = (metadata.colliderinstances != null) ? metadata.colliderinstances : true;
            SceneManager.GlobalOptions.reparentColliders = (metadata.reparentcolliders != null) ? metadata.reparentcolliders : true;
            SceneManager.GlobalOptions.enablelegacyaudio = (metadata.enablelegacyaudio != null) ? metadata.enablelegacyaudio : false;
            SceneManager.GlobalOptions.globalillumination = (metadata.globalillumination != null) ? metadata.globalillumination : false;
            if (metadata.clearcolor != null) {
                babylonScene.clearColor = Utilities.ParseColor4(metadata.clearcolor);
            }
            if (metadata.autoclear != null && metadata.autoclear === true) {
                babylonScene.autoClear = true;
                babylonScene.autoClearDepthAndStencil = true;
            }
            if (metadata.rendergroups != null) {
                RenderingManager.MAX_RENDERINGGROUPS = metadata.rendergroups;
            }
            if (metadata.imageprocessing != null) {
                const imaging = metadata.imageprocessing;
                const contrast = (imaging.contrast != null) ? imaging.contrast : 1.0;
                const exposure = (imaging.exposure != null) ? imaging.exposure : 1.0;
                if (babylonScene.imageProcessingConfiguration != null) {
                    babylonScene.imageProcessingConfiguration.contrast = contrast;
                    babylonScene.imageProcessingConfiguration.exposure = exposure;
                }
            }
            let intensityFactor = SceneManager.AmbientLightIntensity;
            if (metadata.ambientcoloring != null)
                babylonScene.ambientColor = Utilities.ParseColor3(metadata.ambientcoloring);
            if (metadata.ambientlighting != null && metadata.ambientlighting > 0) {
                const ascene = babylonScene;
                if (ascene._AmbientLight == null) {
                    ascene._AmbientLight = new HemisphericLight("Ambient Lighting", new Vector3(0, 1, 0), babylonScene);
                    ascene._AmbientLight.falloffType = Light.FALLOFF_STANDARD;
                    ascene._AmbientLight.lightmapMode = Light.LIGHTMAP_DEFAULT;
                }
                if (ascene._AmbientLight != null) {
                    if (metadata.ambientskycolor != null)
                        ascene._AmbientLight.diffuse = Utilities.ParseColor3(metadata.ambientskycolor, Color3.Gray());
                    if (metadata.ambientspecularcolor != null)
                        ascene._AmbientLight.specular = Utilities.ParseColor3(metadata.ambientspecularcolor, Color3.White());
                    if (metadata.ambientgroundcolor != null)
                        ascene._AmbientLight.groundColor = Utilities.ParseColor3(metadata.ambientgroundcolor, Color3.Gray());
                    if (metadata.ambientlightintensity != null)
                        ascene._AmbientLight.intensity = metadata.ambientlightintensity;
                    ascene._AmbientLight.intensity *= intensityFactor;
                }
            }
            if (metadata.fogmode != null) {
                const fogmode = metadata.fogmode;
                if (fogmode > 0) {
                    babylonScene.fogMode = fogmode;
                    babylonScene.fogEnabled = true;
                    let fogIntensityFactor = 1.0;
                    if (fogmode === 1) {
                        fogIntensityFactor = 0.5;
                    }
                    else if (fogmode === 2) {
                        fogIntensityFactor = 0.75;
                    }
                    if (metadata.fogdensity != null) {
                        babylonScene.fogDensity = (metadata.fogdensity * fogIntensityFactor);
                    }
                    if (metadata.fogstart != null) {
                        babylonScene.fogStart = metadata.fogstart;
                    }
                    if (metadata.fogend != null) {
                        babylonScene.fogEnd = metadata.fogend;
                    }
                    if (metadata.fogcolor != null) {
                        babylonScene.fogColor = Utilities.ParseColor3(metadata.fogcolor);
                    }
                }
            }
            const gravitycheck = new Vector3(0, -9.81, 0);
            const defaultgravity = metadata.defaultgravity != null ? Utilities.ParseVector3(metadata.defaultgravity, gravitycheck) : gravitycheck;
            babylonScene.gravity = defaultgravity.clone();
            babylonScene.collisionsEnabled = true;
            if (metadata.enablephysics != null) {
                const enablephysics = metadata.enablephysics;
                if (enablephysics === true) {
                    const ccdenabled = metadata.ccdenabled != null ? metadata.ccdenabled : true;
                    const ccdpenetration = metadata.ccdpenetration != null ? metadata.ccdpenetration : 0.0001;
                    const subtimestep = metadata.subtimestep != null ? metadata.subtimestep : 0;
                    const maxworldsweep = metadata.maxworldsweep != null ? metadata.maxworldsweep : 0;
                    const deltaworldstep = metadata.deltaworldstep != null ? metadata.deltaworldstep : true;
                    RigidbodyPhysics.ConfigurePhysicsEngine(babylonScene, !deltaworldstep, subtimestep, maxworldsweep, ccdenabled, ccdpenetration, defaultgravity);
                }
            }
            if (metadata.userinput != null) {
                const userInput = metadata.userinput;
                UserInputOptions.KeyboardSmoothing = userInput.keyboardSmoothing;
                UserInputOptions.KeyboardMoveSensibility = userInput.keyboardSensitivity;
                UserInputOptions.KeyboardArrowSensibility = 1.0;
                UserInputOptions.KeyboardMoveDeadZone = userInput.keyboardDeadZone;
                UserInputOptions.GamepadDeadStickValue = userInput.padDeadStick;
                UserInputOptions.GamepadLStickXInverted = userInput.padLStickXInvert;
                UserInputOptions.GamepadLStickYInverted = userInput.padLStickYInvert;
                UserInputOptions.GamepadRStickXInverted = userInput.padRStickXInvert;
                UserInputOptions.GamepadRStickYInverted = userInput.padRStickYInvert;
                UserInputOptions.GamepadLStickSensibility = userInput.padLStickLevel;
                UserInputOptions.GamepadRStickSensibility = userInput.padRStickLevel;
                UserInputOptions.SupportedInputDevices = userInput.supportedDevices;
                UserInputOptions.BabylonAngularSensibility = 2000;
                UserInputOptions.DefaultAngularSensibility = userInput.mouseSensitivity;
                UserInputOptions.PointerWheelDeadZone = userInput.wheelDeadZone;
                UserInputOptions.PointerMouseDeadZone = userInput.mouseDeadZone;
                UserInputOptions.PointerMouseInverted = userInput.mouseMoveInvert;
                UserInputOptions.UseCanvasElement = userInput.useCanvasElement;
                UserInputOptions.UseArrowKeyRotation = userInput.arrowKeyRotation;
                UserInputOptions.EnableBabylonRotation = false;
            }
            if (metadata.enableinput != null) {
                const enableinput = metadata.enableinput;
                if (enableinput === true) {
                    const contextMenu = metadata.contextmenu != null ? metadata.contextmenu : true;
                    const pointerLock = metadata.pointerlock != null ? metadata.pointerlock : false;
                    const preventDefault = metadata.preventdefault != null ? metadata.preventdefault : false;
                    const useCapture = metadata.usecapture != null ? metadata.usecapture : false;
                    const inputOptions = {
                        contextMenu: contextMenu,
                        pointerLock: pointerLock,
                        preventDefault: preventDefault,
                        useCapture: useCapture
                    };
                    InputController.ConfigureUserInput(babylonScene.getEngine(), babylonScene, inputOptions);
                }
            }
            if (metadata.freezeactivemeshes != null && metadata.freezeactivemeshes === true) {
                this._activeMeshes = true;
            }
            if (metadata.performancepriority != null) {
                babylonScene.performancePriority = metadata.performancepriority;
            }
        }
    }
    postProcessSceneProperties(root, scene, babylonScene) {
        if (this._assetContainer === true)
            return;
        if (scene.extras != null && scene.extras.metadata != null && scene.extras.metadata.properties != null && scene.extras.metadata.properties === true) {
            const metadata = scene.extras.metadata;
            if (metadata.skybox != null) {
                const skybox = metadata.skybox;
                const skyfog = (skybox.skyfog != null) ? skybox.skyfog : false;
                const skytags = (skybox.skytags != null) ? skybox.skytags : "Untagged";
                const skysize = (skybox.skysize != null) ? skybox.skysize : 1000;
                const skyroty = (skybox.rotation != null) ? skybox.rotation : 0;
                const skypath = (skybox.basename != null && skybox.basename !== "") ? (root + skybox.basename) : null;
                const skyfaces = (skybox.skyfaces != null) ? skybox.skyfaces : null;
                const rendergroup = (skybox.rendergroup != null) ? skybox.rendergroup : 0;
                const extensions = (skybox.extensions != null && skybox.extensions.length > 0) ? skybox.extensions : null;
                const polynomial = (skybox.polynomial != null) ? skybox.polynomial : 1;
                try {
                    if (skyfaces != null && skyfaces !== "" && skypath != null && skypath !== "") {
                        let skyboxTexture = null;
                        if (skyfaces === "png" || skyfaces === "webp") {
                            skyboxTexture = new CubeTexture(skypath, babylonScene, extensions);
                            if (skypath.indexOf("_rgbd") >= 0) {
                                skyboxTexture.isRGBD = true;
                                skyboxTexture.gammaSpace = false;
                            }
                            else {
                                skyboxTexture.isRGBD = false;
                                skyboxTexture.gammaSpace = true;
                            }
                        }
                        else if (skyfaces === "jpg") {
                            skyboxTexture = new CubeTexture(skypath, babylonScene, extensions);
                            skyboxTexture.isRGBD = false;
                            skyboxTexture.gammaSpace = true;
                        }
                        else if (skyfaces === "ktx2") {
                            skyboxTexture = new CubeTexture(skypath, babylonScene, extensions);
                            skyboxTexture.isRGBD = false;
                            skyboxTexture.gammaSpace = true;
                        }
                        else {
                            const prefiltered = true;
                            const skyTextureFile = skypath + "." + skyfaces;
                            skyboxTexture = new CubeTexture(skyTextureFile, babylonScene, null, true, null, null, null, null, prefiltered);
                            skyboxTexture.gammaSpace = false;
                        }
                        skyboxTexture.name = skybox.basename;
                        skyboxTexture.coordinatesMode = Texture.SKYBOX_MODE;
                        skyboxTexture.rotationY = Tools.ToRadians(skyroty);
                        const skyboxLabel = "Default Skybox";
                        const skyboxMesh = MeshBuilder.CreateBox(skyboxLabel, { size: skysize }, babylonScene);
                        skyboxMesh.renderingGroupId = Utilities.DefaultRenderGroup();
                        skyboxMesh.id = skyboxLabel;
                        skyboxMesh.infiniteDistance = true;
                        skyboxMesh.applyFog = skyfog;
                        skyboxMesh.renderingGroupId = rendergroup;
                        if (skytags != null && skytags !== "") {
                            Tags.AddTagsTo(skyboxMesh, skytags);
                        }
                        if (babylonScene.useRightHandedSystem === true) {
                            skyboxMesh.scaling.x *= -1;
                        }
                        const standardMaterial = new StandardMaterial("Skybox-Material", babylonScene);
                        standardMaterial.backFaceCulling = false;
                        standardMaterial.disableLighting = true;
                        standardMaterial.diffuseColor = new Color3(0, 0, 0);
                        standardMaterial.emissiveColor = new Color3(0, 0, 0);
                        standardMaterial.specularColor = new Color3(0, 0, 0);
                        standardMaterial.ambientColor = new Color3(0, 0, 0);
                        standardMaterial.reflectionTexture = skyboxTexture;
                        skyboxMesh.material = standardMaterial;
                    }
                }
                catch (e1) {
                    console.warn(e1);
                }
                if (skybox.environment != null) {
                    const environment = skybox.environment;
                    babylonScene.environmentIntensity = (environment.level != null) ? Scalar.Clamp(environment.level, 0.0, 10.0) : 1.0;
                    const envinfo = (environment.info != null && environment.info !== "") ? environment.info : null;
                    if (envinfo != null && envinfo !== "") {
                        try {
                            const root = SceneManager.GetRootUrl(babylonScene);
                            const folder = (root + envinfo.rooturl);
                            const environmentUrl = (folder + envinfo.name);
                            if (this._assetsManager != null) {
                                const environmentTask = this._assetsManager.addBinaryFileTask("Global.EnvironmentTextureTask", environmentUrl);
                                environmentTask.onSuccess = (task) => {
                                    if (task.data != null) {
                                        const blobData = new Blob([task.data]);
                                        const babylonScene = this._babylonScene;
                                        const textureBlobUrl = URL.createObjectURL(blobData);
                                        const revokeBlobURL = () => { URL.revokeObjectURL(textureBlobUrl); };
                                        const newCubeExtension = environmentUrl.toLowerCase().endsWith(".env") ? ".env" : ".dds";
                                        const newCubeTexture = new CubeTexture(textureBlobUrl, babylonScene, null, null, null, revokeBlobURL, revokeBlobURL, null, true, newCubeExtension);
                                        babylonScene.environmentTexture = newCubeTexture;
                                        babylonScene.environmentTexture.name = ("assets/" + envinfo.name);
                                        if (babylonScene.environmentTexture != null && babylonScene.environmentTexture.sphericalPolynomial != null) {
                                            if (babylonScene.isReady())
                                                babylonScene.environmentTexture.sphericalPolynomial.scaleInPlace(polynomial);
                                            else
                                                babylonScene.onReadyObservable.addOnce(() => { babylonScene.environmentTexture.sphericalPolynomial.scaleInPlace(polynomial); });
                                        }
                                    }
                                    else {
                                        console.error("Failed to load environment texture task: " + environmentUrl);
                                    }
                                };
                                environmentTask.onError = (task, message, exception) => { console.error(message, exception); };
                            }
                        }
                        catch (e2) {
                            console.warn(e2);
                        }
                    }
                }
            }
            if (metadata.navigation != null && metadata.navigation.prebaked != null && metadata.navigation.prebaked !== "") {
                const physicsNavMesh = (metadata.navigation.collision != null && metadata.navigation.collision === true);
                const showDebugMesh = (metadata.navigation.showdebug != null && metadata.navigation.showdebug === true);
                const showDebugColor = (metadata.navigation.debugcolor != null) ? metadata.navigation.debugcolor : [0.2627451, 0.5960785, 0.7372549];
                const debugMeshOffset = (metadata.navigation.debugoffset != null) ? metadata.navigation.debugoffset : 0;
                const navMeshColor = new Color3(showDebugColor[0], showDebugColor[1], showDebugColor[2]);
                const timeSteps = (metadata.navigation.timesteps != null) ? metadata.navigation.timesteps : 0;
                if (this._assetsManager != null) {
                    const prebakedUrl = metadata.navigation.prebaked;
                    const navMeshTask = this._assetsManager.addBinaryFileTask(("System.NavigationMeshTask"), prebakedUrl);
                    navMeshTask.onSuccess = (task) => {
                        if (task.data != null) {
                            const uint8View = new Uint8Array(task.data);
                            SceneManager.LoadNavigationMesh(babylonScene, uint8View, showDebugMesh, navMeshColor, timeSteps, physicsNavMesh, debugMeshOffset);
                        }
                        else {
                            console.error("Failed to load navigation mesh task: " + prebakedUrl);
                        }
                    };
                    navMeshTask.onError = (task, message, exception) => { console.error(message, exception); };
                }
            }
        }
    }
    _preloadRawMaterialsAsync(context, materials, rawMaterialIndexes) {
        const loader = this._loader;
        const promises = new Array();
        const babylonDrawMode = Material.TriangleFillMode;
        rawMaterialIndexes.forEach((materialIndex) => {
            const material = ArrayItem.Get(`${context}/material`, materials, materialIndex);
            if (material != null) {
                const babylonMaterial = loader.createMaterial(context, material, babylonDrawMode);
                GLTFLoader.AddPointerMetadata(babylonMaterial, context);
                loader._parent.onMaterialLoadedObservable.notifyObservers(babylonMaterial);
                promises.push(loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
            }
        });
        return Promise.all(promises).then(() => { });
    }
    _parseMultiMaterialAsync(context, materials, babylonMesh, babylonDrawMode, assign = () => { }) {
        const loader = this._loader;
        const xmaterials = materials;
        xmaterials._data = xmaterials._data || {};
        let babylonData = xmaterials._data[babylonDrawMode];
        if (!babylonData) {
            loader.logOpen(`${context} ${babylonMesh.name || ""}`);
            const babylonMaterials = [];
            const promises = new Array();
            materials.forEach((material) => {
                let babylonMaterial = null;
                if (material["index"]) {
                    const materialIndex = material["index"];
                    if (materialIndex >= 0)
                        babylonMaterial = this._getCachedMaterialByIndex(materialIndex);
                }
                if (babylonMaterial == null) {
                    babylonMaterial = loader.createMaterial(context, material, babylonDrawMode);
                    GLTFLoader.AddPointerMetadata(babylonMaterial, context);
                    loader._parent.onMaterialLoadedObservable.notifyObservers(babylonMaterial);
                    promises.push(loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
                }
                babylonMaterials.push(babylonMaterial);
            });
            babylonData = {
                babylonMaterials: babylonMaterials,
                babylonMeshes: [],
                promises: promises
            };
            xmaterials._data[babylonDrawMode] = babylonData;
            loader.logClose();
        }
        babylonData.babylonMeshes.push(babylonMesh);
        babylonMesh.onDisposeObservable.addOnce(() => {
            const index = babylonData.babylonMeshes.indexOf(babylonMesh);
            if (index !== -1) {
                babylonData.babylonMeshes.splice(index, 1);
            }
        });
        assign(babylonData.babylonMaterials);
        return Promise.all(babylonData.promises).then(() => {
            return babylonData.babylonMaterials;
        });
    }
    _parseNodeMaterialPropertiesAsync(context, material, sourceMaterial) {
        const commonConstant = (material.extras != null && material.extras.metadata != null) ? material.extras.metadata : null;
        const babylonMaterial = sourceMaterial;
        const promises = new Array();
        babylonMaterial.backFaceCulling = (commonConstant != null && commonConstant.backFaceCulling != null) ? commonConstant.backFaceCulling : true;
        if (material.doubleSided) {
            babylonMaterial.backFaceCulling = false;
        }
        let baseColorAlpha = 1;
        if (material.pbrMetallicRoughness) {
            const properties = material.pbrMetallicRoughness;
            if (properties) {
                if (properties.baseColorFactor) {
                    const linearBaseColor = Color4.FromArray(properties.baseColorFactor);
                    babylonMaterial.setVector4("_Color", new Vector4(Math.pow(linearBaseColor.r, 1 / 2.2), Math.pow(linearBaseColor.g, 1 / 2.2), Math.pow(linearBaseColor.b, 1 / 2.2), linearBaseColor.a));
                    baseColorAlpha = linearBaseColor.a;
                }
                else {
                    babylonMaterial.setVector4("_Color", new Vector4(1, 1, 1, 1));
                }
                if (properties.baseColorTexture) {
                    promises.push(this._loader.loadTextureInfoAsync(`${context}/baseColorTexture`, properties.baseColorTexture, (texture) => {
                        texture.name = `${sourceMaterial.name} (Base Color)`;
                        const diffuseTexture = texture;
                        diffuseTexture.level = (commonConstant != null && commonConstant.diffuseIntensity != null) ? commonConstant.diffuseIntensity : 1;
                        babylonMaterial.setTexture("_MainTex", diffuseTexture);
                    }));
                }
            }
        }
        if (material.normalTexture) {
            promises.push(this._loader.loadTextureInfoAsync(`${context}/normalTexture`, material.normalTexture, (texture) => {
                texture.name = `${sourceMaterial.name} (Normal)`;
                const bumpTexture = texture;
                if (material.normalTexture.scale != undefined)
                    bumpTexture.level = material.normalTexture.scale;
                babylonMaterial.setTexture("_BumpMap", bumpTexture);
            }));
        }
        if (material.occlusionTexture) {
            promises.push(this._loader.loadTextureInfoAsync(`${context}/occlusionTexture`, material.occlusionTexture, (texture) => {
                texture.name = `${sourceMaterial.name} (Occlusion)`;
                const ambientTexture = texture;
                if (material.occlusionTexture.strength != undefined)
                    ambientTexture.level = material.occlusionTexture.strength;
                babylonMaterial.setTexture("_OcclusionMap", ambientTexture);
            }));
        }
        if (material.emissiveFactor) {
            const linearEmmisveColor = Color4.FromArray(material.emissiveFactor);
            if (linearEmmisveColor.r > 0 || linearEmmisveColor.g > 0 || linearEmmisveColor.b > 0) {
                babylonMaterial.setVector4("_EmissionColor", new Vector4(Math.pow(linearEmmisveColor.r, 1 / 2.2), Math.pow(linearEmmisveColor.g, 1 / 2.2), Math.pow(linearEmmisveColor.b, 1 / 2.2), linearEmmisveColor.a));
            }
        }
        if (material.emissiveTexture) {
            promises.push(this._loader.loadTextureInfoAsync(`${context}/emissiveTexture`, material.emissiveTexture, (texture) => {
                texture.name = `${sourceMaterial.name} (Emissive)`;
                const emissiveTexture = texture;
                babylonMaterial.setTexture("_EmissionMap", emissiveTexture);
            }));
        }
        if (commonConstant != null) {
            babylonMaterial.wireframe = (commonConstant.useWireframe != null) ? commonConstant.useWireframe : false;
            babylonMaterial.needDepthPrePass = (commonConstant.depthPrepass != null) ? commonConstant.depthPrepass : false;
            if (commonConstant.customTextures) {
                for (const tkey in commonConstant.customTextures) {
                    const tvalue = commonConstant.customTextures[tkey];
                    if (tvalue != null) {
                        promises.push(this._loader.loadTextureInfoAsync(context + "/" + tkey, tvalue, (texture) => {
                            if (tkey === "detailsSampler" || tkey === "normalsSampler") {
                                texture.name = `${sourceMaterial.name} (Atlas)`;
                            }
                            else {
                                texture.name = `${sourceMaterial.name} (Custom)`;
                            }
                            babylonMaterial.setTexture(tkey, texture);
                        }));
                    }
                }
            }
            if (commonConstant.customVectors) {
                for (const vkey in commonConstant.customVectors) {
                    const vvalue = commonConstant.customVectors[vkey];
                    if (vvalue != null) {
                        babylonMaterial.setVector4(vkey, Vector4.FromArray(vvalue));
                    }
                }
            }
            if (commonConstant.customColors) {
                for (const ckey in commonConstant.customColors) {
                    const cvalue = commonConstant.customColors[ckey];
                    if (cvalue != null) {
                        babylonMaterial.setVector4(ckey, Vector4.FromArray(cvalue));
                    }
                }
            }
            if (commonConstant.customFloats) {
                for (const fkey in commonConstant.customFloats) {
                    const fvalue = commonConstant.customFloats[fkey];
                    if (fvalue != null) {
                        babylonMaterial.setFloat(fkey, fvalue);
                    }
                }
            }
            if (commonConstant.freezeMaterial != null && commonConstant.freezeMaterial === true) {
                if (this._shaderList != null)
                    this._shaderList.push(babylonMaterial);
            }
        }
        var result = Promise.all(promises).then(() => { });
        babylonMaterial.compile();
        return result;
    }
    _parseShaderMaterialPropertiesAsync(context, material, sourceMaterial) {
        const commonConstant = (material.extras != null && material.extras.metadata != null) ? material.extras.metadata : null;
        const babylonMaterial = sourceMaterial;
        const promises = new Array();
        babylonMaterial.backFaceCulling = (commonConstant != null && commonConstant.backFaceCulling != null) ? commonConstant.backFaceCulling : true;
        if (material.doubleSided) {
            babylonMaterial.backFaceCulling = false;
        }
        if (Utilities.HasOwnProperty(babylonMaterial, "ambientColor")) {
            babylonMaterial.ambientColor = (commonConstant != null && commonConstant.ambientColorFactor) ? Color3.FromArray(commonConstant.ambientColorFactor) : Color3.Black();
        }
        let baseColorAlpha = 1;
        if (material.pbrMetallicRoughness) {
            const properties = material.pbrMetallicRoughness;
            if (properties) {
                if (properties.baseColorFactor) {
                    const linearBaseColor = Color4.FromArray(properties.baseColorFactor);
                    babylonMaterial.setVector4("diffuseColor", new Vector4(Math.pow(linearBaseColor.r, 1 / 2.2), Math.pow(linearBaseColor.g, 1 / 2.2), Math.pow(linearBaseColor.b, 1 / 2.2), linearBaseColor.a));
                    baseColorAlpha = linearBaseColor.a;
                }
                else {
                    babylonMaterial.setVector4("diffuseColor", new Vector4(1, 1, 1, 1));
                }
                if (properties.baseColorTexture) {
                    promises.push(this._loader.loadTextureInfoAsync(`${context}/baseColorTexture`, properties.baseColorTexture, (texture) => {
                        texture.name = `${sourceMaterial.name} (Base Color)`;
                        const diffuseTexture = texture;
                        diffuseTexture.level = (commonConstant != null && commonConstant.diffuseIntensity != null) ? commonConstant.diffuseIntensity : 1;
                        babylonMaterial.setTexture("diffuseTexture", diffuseTexture);
                    }));
                }
            }
        }
        if (material.normalTexture) {
            promises.push(this._loader.loadTextureInfoAsync(`${context}/normalTexture`, material.normalTexture, (texture) => {
                texture.name = `${sourceMaterial.name} (Normal)`;
                const bumpTexture = texture;
                if (material.normalTexture.scale != undefined)
                    bumpTexture.level = material.normalTexture.scale;
                babylonMaterial.setTexture("bumpTexture", bumpTexture);
            }));
        }
        if (material.occlusionTexture) {
            promises.push(this._loader.loadTextureInfoAsync(`${context}/occlusionTexture`, material.occlusionTexture, (texture) => {
                texture.name = `${sourceMaterial.name} (Occlusion)`;
                const ambientTexture = texture;
                if (material.occlusionTexture.strength != undefined)
                    ambientTexture.level = material.occlusionTexture.strength;
                babylonMaterial.setTexture("ambientTexture", ambientTexture);
            }));
        }
        if (material.emissiveFactor) {
            const linearEmmisveColor = Color4.FromArray(material.emissiveFactor);
            if (linearEmmisveColor.r > 0 || linearEmmisveColor.g > 0 || linearEmmisveColor.b > 0) {
                babylonMaterial.setVector4("emissiveColor", new Vector4(Math.pow(linearEmmisveColor.r, 1 / 2.2), Math.pow(linearEmmisveColor.g, 1 / 2.2), Math.pow(linearEmmisveColor.b, 1 / 2.2), linearEmmisveColor.a));
            }
        }
        if (material.emissiveTexture) {
            promises.push(this._loader.loadTextureInfoAsync(`${context}/emissiveTexture`, material.emissiveTexture, (texture) => {
                texture.name = `${sourceMaterial.name} (Emissive)`;
                const emissiveTexture = texture;
                babylonMaterial.setTexture("emissiveTexture", emissiveTexture);
            }));
        }
        babylonMaterial.alpha = baseColorAlpha;
        const alphaMode = material.alphaMode || MaterialAlphaMode.OPAQUE;
        switch (alphaMode) {
            case MaterialAlphaMode.OPAQUE: {
                babylonMaterial.alpha = 1;
                babylonMaterial.transparencyMode = ShaderMaterial.MATERIAL_OPAQUE;
                break;
            }
            case MaterialAlphaMode.MASK: {
                babylonMaterial.transparencyMode = ShaderMaterial.MATERIAL_ALPHATEST;
                break;
            }
            case MaterialAlphaMode.BLEND: {
                babylonMaterial.transparencyMode = ShaderMaterial.MATERIAL_ALPHABLEND;
                break;
            }
            default: {
                throw new Error(`${context}/AlphaMode: Invalid value (${material.alphaMode})`);
            }
        }
        if (commonConstant != null) {
            babylonMaterial.wireframe = (commonConstant.useWireframe != null) ? commonConstant.useWireframe : false;
            babylonMaterial.needDepthPrePass = (commonConstant.depthPrepass != null) ? commonConstant.depthPrepass : false;
            if (commonConstant.customTextures) {
                for (const tkey in commonConstant.customTextures) {
                    const tvalue = commonConstant.customTextures[tkey];
                    if (tvalue != null) {
                        promises.push(this._loader.loadTextureInfoAsync(context + "/" + tkey, tvalue, (texture) => {
                            if (tkey === "detailsSampler" || tkey === "normalsSampler") {
                                texture.name = `${sourceMaterial.name} (Atlas)`;
                            }
                            else {
                                texture.name = `${sourceMaterial.name} (Custom)`;
                            }
                            babylonMaterial.setTexture(tkey, texture);
                        }));
                    }
                }
            }
            if (commonConstant.customVectors) {
                for (const vkey in commonConstant.customVectors) {
                    const vvalue = commonConstant.customVectors[vkey];
                    if (vvalue != null) {
                        babylonMaterial.setVector4(vkey, Vector4.FromArray(vvalue));
                    }
                }
            }
            if (commonConstant.customColors) {
                for (const ckey in commonConstant.customColors) {
                    const cvalue = commonConstant.customColors[ckey];
                    if (cvalue != null) {
                        babylonMaterial.setVector4(ckey, Vector4.FromArray(cvalue));
                    }
                }
            }
            if (commonConstant.customFloats) {
                for (const fkey in commonConstant.customFloats) {
                    const fvalue = commonConstant.customFloats[fkey];
                    if (fvalue != null) {
                        babylonMaterial.setFloat(fkey, fvalue);
                    }
                }
            }
            if (commonConstant.freezeMaterial != null && commonConstant.freezeMaterial === true) {
                if (this._shaderList != null)
                    this._shaderList.push(babylonMaterial);
            }
        }
        return Promise.all(promises).then(() => { });
    }
    _parseDiffuseMaterialPropertiesAsync(context, material, sourceMaterial) {
        const commonConstant = (material.extras != null && material.extras.metadata != null) ? material.extras.metadata : null;
        const babylonMaterial = sourceMaterial;
        const promises = new Array();
        if (Utilities.HasOwnProperty(babylonMaterial, "ambientColor")) {
            babylonMaterial.ambientColor = (commonConstant != null && commonConstant.ambientColorFactor) ? Color3.FromArray(commonConstant.ambientColorFactor) : Color3.Black();
        }
        if (Utilities.HasOwnProperty(babylonMaterial, "backFaceCulling")) {
            babylonMaterial.backFaceCulling = (commonConstant != null && commonConstant.backFaceCulling != null) ? commonConstant.backFaceCulling : true;
        }
        if (material.doubleSided) {
            if (Utilities.HasOwnProperty(babylonMaterial, "twoSidedLighting")) {
                babylonMaterial.twoSidedLighting = true;
            }
            if (Utilities.HasOwnProperty(babylonMaterial, "backFaceCulling")) {
                babylonMaterial.backFaceCulling = false;
            }
        }
        let baseColorAlpha = 1;
        if (material.pbrMetallicRoughness) {
            const properties = material.pbrMetallicRoughness;
            if (properties) {
                if (Utilities.HasOwnProperty(babylonMaterial, "diffuseColor")) {
                    if (properties.baseColorFactor) {
                        const linearBaseColor = Color4.FromArray(properties.baseColorFactor);
                        babylonMaterial.diffuseColor = new Color3(Math.pow(linearBaseColor.r, 1 / 2.2), Math.pow(linearBaseColor.g, 1 / 2.2), Math.pow(linearBaseColor.b, 1 / 2.2));
                        baseColorAlpha = linearBaseColor.a;
                    }
                    else {
                        babylonMaterial.diffuseColor = Color3.White();
                    }
                }
                if (Utilities.HasOwnProperty(babylonMaterial, "diffuseTexture")) {
                    if (properties.baseColorTexture) {
                        promises.push(this._loader.loadTextureInfoAsync(`${context}/baseColorTexture`, properties.baseColorTexture, (texture) => {
                            texture.name = `${sourceMaterial.name} (Base Color)`;
                            babylonMaterial.diffuseTexture = texture;
                            babylonMaterial.diffuseTexture.level = (commonConstant != null && commonConstant.diffuseIntensity != null) ? commonConstant.diffuseIntensity : 1;
                        }));
                    }
                }
            }
        }
        if (Utilities.HasOwnProperty(babylonMaterial, "bumpTexture")) {
            if (material.normalTexture) {
                promises.push(this._loader.loadTextureInfoAsync(`${context}/normalTexture`, material.normalTexture, (texture) => {
                    texture.name = `${sourceMaterial.name} (Normal)`;
                    babylonMaterial.bumpTexture = texture;
                    if (material.normalTexture.scale != undefined)
                        babylonMaterial.bumpTexture.level = material.normalTexture.scale;
                }));
                if (Utilities.HasOwnProperty(babylonMaterial, "invertNormalMapX")) {
                    babylonMaterial.invertNormalMapX = !this._loader.babylonScene.useRightHandedSystem;
                }
                if (Utilities.HasOwnProperty(babylonMaterial, "invertNormalMapY")) {
                    babylonMaterial.invertNormalMapY = this._loader.babylonScene.useRightHandedSystem;
                }
            }
        }
        if (Utilities.HasOwnProperty(babylonMaterial, "ambientTexture")) {
            if (material.occlusionTexture) {
                promises.push(this._loader.loadTextureInfoAsync(`${context}/occlusionTexture`, material.occlusionTexture, (texture) => {
                    texture.name = `${sourceMaterial.name} (Occlusion)`;
                    babylonMaterial.ambientTexture = texture;
                    if (material.occlusionTexture.strength != undefined)
                        babylonMaterial.ambientTexture.level = material.occlusionTexture.strength;
                }));
            }
        }
        if (Utilities.HasOwnProperty(babylonMaterial, "emissiveColor")) {
            const linearEmmisveColor = material.emissiveFactor ? Color4.FromArray(material.emissiveFactor) : new Color4(0, 0, 0, 1);
            babylonMaterial.emissiveColor = new Color3(Math.pow(linearEmmisveColor.r, 1 / 2.2), Math.pow(linearEmmisveColor.g, 1 / 2.2), Math.pow(linearEmmisveColor.b, 1 / 2.2));
        }
        if (Utilities.HasOwnProperty(babylonMaterial, "emissiveTexture")) {
            if (material.emissiveTexture) {
                promises.push(this._loader.loadTextureInfoAsync(`${context}/emissiveTexture`, material.emissiveTexture, (texture) => {
                    texture.name = `${sourceMaterial.name} (Emissive)`;
                    babylonMaterial.emissiveTexture = texture;
                    if (Utilities.HasOwnProperty(babylonMaterial, "useEmissiveAsIllumination")) {
                        babylonMaterial.useEmissiveAsIllumination = (commonConstant != null && commonConstant.useEmissiveAsIllumination != null) ? commonConstant.useEmissiveAsIllumination : false;
                    }
                }));
            }
        }
        if (Utilities.HasOwnProperty(babylonMaterial, "alpha")) {
            babylonMaterial.alpha = baseColorAlpha;
        }
        const alphaMode = material.alphaMode || MaterialAlphaMode.OPAQUE;
        switch (alphaMode) {
            case MaterialAlphaMode.OPAQUE: {
                if (Utilities.HasOwnProperty(babylonMaterial, "alpha")) {
                    babylonMaterial.alpha = 1;
                }
                break;
            }
            case MaterialAlphaMode.MASK: {
                babylonMaterial.alphaCutOff = (material.alphaCutoff == undefined ? 0.5 : material.alphaCutoff);
                if (babylonMaterial.diffuseTexture) {
                    if (Utilities.HasOwnProperty(babylonMaterial, "diffuseTexture")) {
                        babylonMaterial.diffuseTexture.hasAlpha = true;
                    }
                }
                break;
            }
            case MaterialAlphaMode.BLEND: {
                if (babylonMaterial.diffuseTexture) {
                    if (Utilities.HasOwnProperty(babylonMaterial, "diffuseTexture")) {
                        babylonMaterial.diffuseTexture.hasAlpha = true;
                    }
                    if (Utilities.HasOwnProperty(babylonMaterial, "useAlphaFromDiffuseTexture")) {
                        babylonMaterial.useAlphaFromDiffuseTexture = true;
                    }
                }
                break;
            }
            default: {
                throw new Error(`${context}/AlphaMode: Invalid value (${material.alphaMode})`);
            }
        }
        this._parseCommonConstantProperties(promises, context, material, sourceMaterial);
        return Promise.all(promises).then(() => { });
    }
    _parseCommonConstantProperties(promises, context, material, sourceMaterial) {
        const commonConstant = (material.extras != null && material.extras.metadata != null) ? material.extras.metadata : null;
        if (commonConstant != null) {
            const commonMaterial = sourceMaterial;
            if (Utilities.HasOwnProperty(commonMaterial, "alphaMode")) {
                commonMaterial.alphaMode = (commonConstant != null && commonConstant.alphaMode) ? commonConstant.alphaMode : Engine.ALPHA_COMBINE;
            }
            if (Utilities.HasOwnProperty(commonMaterial, "ambientColor")) {
                commonMaterial.ambientColor = (commonConstant != null && commonConstant.ambientColorFactor) ? Color3.FromArray(commonConstant.ambientColorFactor) : Color3.Black();
            }
            if (Utilities.HasOwnProperty(commonMaterial, "backFaceCulling")) {
                commonMaterial.backFaceCulling = (commonConstant != null && commonConstant.backFaceCulling != null) ? commonConstant.backFaceCulling : true;
            }
            if (sourceMaterial instanceof PBRMaterial) {
                sourceMaterial.useMetallnessFromMetallicTextureBlue = true;
                sourceMaterial.useRoughnessFromMetallicTextureGreen = true;
                sourceMaterial.useRoughnessFromMetallicTextureAlpha = false;
                sourceMaterial.useAmbientOcclusionFromMetallicTextureRed = false;
                sourceMaterial.directIntensity = (commonConstant.directIntensity != null) ? commonConstant.directIntensity : 1;
                sourceMaterial.specularIntensity = (commonConstant.specularIntensity != null) ? commonConstant.specularIntensity : 1;
                sourceMaterial.emissiveIntensity = (commonConstant.emissiveIntensity != null) ? commonConstant.emissiveIntensity : 1;
                sourceMaterial.environmentIntensity = (commonConstant.environmentIntensity != null) ? commonConstant.environmentIntensity : 1;
                sourceMaterial.indexOfRefraction = (commonConstant.indexOfRefraction != null) ? commonConstant.indexOfRefraction : 1.5;
                const clearCoatIntensity = (commonConstant.clearCoatIntensity != null) ? commonConstant.clearCoatIntensity : 0;
                if (clearCoatIntensity > 0) {
                    sourceMaterial.clearCoat.isEnabled = true;
                    sourceMaterial.clearCoat.intensity = clearCoatIntensity;
                }
                if (commonConstant.useAlphaFromAlbedoTexture != null) {
                    sourceMaterial.useAlphaFromAlbedoTexture = commonConstant.useAlphaFromAlbedoTexture;
                }
                if (commonConstant.parallaxBias != null && commonConstant.parallaxBias > 0) {
                    sourceMaterial.useParallax = true;
                    sourceMaterial.parallaxScaleBias = (commonConstant.parallaxBias * 0.9);
                    sourceMaterial.useParallaxOcclusion = (commonConstant.parallaxOcclusion != null) ? commonConstant.parallaxOcclusion : true;
                    if (sourceMaterial.useParallaxOcclusion === true)
                        sourceMaterial.parallaxScaleBias *= 0.5;
                }
            }
            if (Utilities.HasOwnProperty(commonMaterial, "unlit")) {
                commonMaterial.unlit = (commonConstant.unlitMaterial != null) ? commonConstant.unlitMaterial : false;
            }
            if (Utilities.HasOwnProperty(commonMaterial, "wireframe")) {
                commonMaterial.wireframe = (commonConstant.useWireframe != null) ? commonConstant.useWireframe : false;
            }
            if (Utilities.HasOwnProperty(commonMaterial, "disableLighting")) {
                commonMaterial.disableLighting = (commonConstant.disableLighting != null) ? commonConstant.disableLighting : false;
            }
            if (Utilities.HasOwnProperty(commonMaterial, "maxSimultaneousLights")) {
                commonMaterial.maxSimultaneousLights = (commonConstant.maxSimultaneousLights != null) ? commonConstant.maxSimultaneousLights : 4;
            }
            if (Utilities.HasOwnProperty(commonMaterial, "needDepthPrePass")) {
                commonMaterial.needDepthPrePass = (commonConstant.depthPrepass != null) ? commonConstant.depthPrepass : false;
            }
            if (Utilities.HasOwnProperty(commonMaterial, "lightmapTexture")) {
                if (commonConstant.lightmapTexture) {
                    commonConstant.lightmapTexture.nonColorData = true;
                    let useLightmapAsShadowmap = true;
                    if (Utilities.HasOwnProperty(commonMaterial, "useLightmapAsShadowmap")) {
                        useLightmapAsShadowmap = (commonConstant.useLightmapAsShadowmap != null) ? commonConstant.useLightmapAsShadowmap : true;
                    }
                    let lightmapTexture = null;
                    let lightmapIndex = (commonConstant.lightmapTexture["index"] != null) ? commonConstant.lightmapTexture["index"] : -1;
                    if (lightmapIndex >= 0)
                        lightmapTexture = this._getCachedLightmapByIndex(lightmapIndex);
                    if (lightmapTexture != null) {
                        commonMaterial.lightmapTexture = lightmapTexture;
                        commonMaterial.useLightmapAsShadowmap = useLightmapAsShadowmap;
                        if (Utilities.HasOwnProperty(commonMaterial, "ambientColor")) {
                            commonMaterial.ambientColor = Color3.White();
                        }
                    }
                    else {
                        promises.push(this._loader.loadTextureInfoAsync(context + "/lightmapTexture", commonConstant.lightmapTexture, (texture) => {
                            texture.name = `assets/LightmapTexture-${lightmapIndex}`;
                            texture.level = (commonConstant.lightmapLevel) ? commonConstant.lightmapLevel : 1.0;
                            const realTexture = texture;
                            const useKtxLightmaps = (SceneManager.GlobalOptions.ktxlightmaps != null && SceneManager.GlobalOptions.ktxlightmaps === true);
                            if (useKtxLightmaps === true) {
                                texture.gammaSpace = true;
                            }
                            else {
                                texture.gammaSpace = false;
                                realTexture.onLoadObservable.addOnce(() => {
                                    if (realTexture.isReady()) {
                                        realTexture.isRGBD = true;
                                    }
                                    else {
                                        Tools.Warn("Failed to register texture as RGBD: " + realTexture.name);
                                    }
                                });
                            }
                            commonMaterial.lightmapTexture = texture;
                            if (lightmapIndex >= 0 && this._lightmapMap != null) {
                                if (!this._lightmapMap.has(lightmapIndex)) {
                                    this._lightmapMap.set(lightmapIndex, realTexture);
                                }
                            }
                            commonMaterial.useLightmapAsShadowmap = useLightmapAsShadowmap;
                            if (Utilities.HasOwnProperty(commonMaterial, "ambientColor")) {
                                commonMaterial.ambientColor = Color3.White();
                            }
                        }));
                    }
                }
            }
            if (sourceMaterial instanceof PBRMaterial) {
                if (commonConstant.detailMapTexture) {
                    promises.push(this._loader.loadTextureInfoAsync(context + "/detailMapTexture", commonConstant.detailMapTexture, (texture) => {
                        texture.name = `${sourceMaterial.name} (Detail Map)`;
                        texture.level = 1;
                        sourceMaterial.detailMap.texture = texture;
                        sourceMaterial.detailMap.bumpLevel = (commonConstant.detailBumpLevel) ? commonConstant.detailBumpLevel : 1;
                        sourceMaterial.detailMap.diffuseBlendLevel = (commonConstant.detailBlendLevel) ? commonConstant.detailBlendLevel : 0.75;
                        sourceMaterial.detailMap.roughnessBlendLevel = (commonConstant.detailRoughLevel) ? commonConstant.detailRoughLevel : 0.5;
                        sourceMaterial.detailMap.isEnabled = true;
                    }));
                }
            }
            const quality = SceneManager.GetRenderQuality();
            const allowReflections = (quality === RenderQuality.High || quality === RenderQuality.Medium);
            if (allowReflections === true && Utilities.HasOwnProperty(commonMaterial, "reflectionColor")) {
                commonMaterial.reflectionColor = (commonConstant != null && commonConstant.reflectionColorFactor) ? Color3.FromArray(commonConstant.reflectionColorFactor) : Color3.White();
            }
            if (allowReflections === true && Utilities.HasOwnProperty(commonMaterial, "reflectionTexture")) {
                if (commonConstant.reflectionCubemapInfo) {
                    const loadingRoot = this._loader._rootUrl;
                    const loadingUrl = (loadingRoot + commonConstant.reflectionCubemapInfo.rooturl + commonConstant.reflectionCubemapInfo.name).toLowerCase();
                    const lastDot = loadingUrl.lastIndexOf(".");
                    const extension = (lastDot > -1) ? loadingUrl.substring(lastDot).toLowerCase() : "";
                    const prefiltered = true;
                    const textureLoader = new CubeTextureLoader();
                    textureLoader.name = ("assets/" + commonConstant.reflectionCubemapInfo.name);
                    textureLoader.mapkey = loadingUrl;
                    textureLoader.material = commonMaterial;
                    textureLoader.extension = extension;
                    textureLoader.prefiltered = prefiltered;
                    if (commonConstant.reflectionCubemapInfo.boundingBoxSize) {
                        textureLoader.boundingBoxSize = Vector3.FromArray(commonConstant.reflectionCubemapInfo.boundingBoxSize);
                        textureLoader.name += (" (" + textureLoader.boundingBoxSize.x.toString() + " " + textureLoader.boundingBoxSize.y.toString() + " " + textureLoader.boundingBoxSize.z.toString() + ")");
                        textureLoader.mapkey += ("_" + textureLoader.boundingBoxSize.x.toString() + "_" + textureLoader.boundingBoxSize.y.toString() + "_" + textureLoader.boundingBoxSize.z.toString());
                    }
                    if (commonConstant.reflectionCubemapInfo.boundingBoxPosition) {
                        textureLoader.boundingBoxPosition = Vector3.FromArray(commonConstant.reflectionCubemapInfo.boundingBoxPosition);
                        textureLoader.name += (" (" + textureLoader.boundingBoxPosition.x.toString() + " " + textureLoader.boundingBoxPosition.y.toString() + " " + textureLoader.boundingBoxPosition.z.toString() + ")");
                        textureLoader.mapkey += ("_" + textureLoader.boundingBoxPosition.x.toString() + "_" + textureLoader.boundingBoxPosition.y.toString() + "_" + textureLoader.boundingBoxPosition.z.toString());
                    }
                    let cubeTextureLoaders = this._reflectionMap[loadingUrl];
                    if (cubeTextureLoaders == null) {
                        cubeTextureLoaders = [textureLoader];
                        this._reflectionMap[loadingUrl] = cubeTextureLoaders;
                    }
                    else {
                        cubeTextureLoaders.push(textureLoader);
                    }
                }
            }
            if (Utilities.HasOwnProperty(commonMaterial, "terrainInfo")) {
                commonMaterial.terrainInfo = (commonConstant.terrainInfo != null) ? commonConstant.terrainInfo : null;
            }
            if (Utilities.HasOwnProperty(sourceMaterial, "universalMaterial")) {
                const universalMaterial = sourceMaterial;
                if (commonConstant.customTextures) {
                    for (const tkey in commonConstant.customTextures) {
                        const tvalue = commonConstant.customTextures[tkey];
                        if (tvalue != null) {
                            universalMaterial.checkSampler(tkey);
                            promises.push(this._loader.loadTextureInfoAsync(context + "/" + tkey, tvalue, (texture) => {
                                if (tkey === "detailsSampler" || tkey === "normalsSampler") {
                                    texture.name = `${sourceMaterial.name} (Atlas)`;
                                }
                                else {
                                    texture.name = `${sourceMaterial.name} (Custom)`;
                                }
                                universalMaterial.setTextureValue(tkey, texture);
                            }));
                        }
                    }
                }
                if (commonConstant.customVectors) {
                    for (const vkey in commonConstant.customVectors) {
                        const vvalue = commonConstant.customVectors[vkey];
                        if (vvalue != null) {
                            universalMaterial.addVector4Uniform(vkey, Vector4.FromArray(vvalue), true);
                        }
                    }
                }
                if (commonConstant.customColors) {
                    for (const ckey in commonConstant.customColors) {
                        const cvalue = commonConstant.customColors[ckey];
                        if (cvalue != null) {
                            universalMaterial.addVector4Uniform(ckey, Vector4.FromArray(cvalue), true);
                        }
                    }
                }
                if (commonConstant.customFloats) {
                    for (const fkey in commonConstant.customFloats) {
                        const fvalue = commonConstant.customFloats[fkey];
                        if (fvalue != null) {
                            universalMaterial.addFloatUniform(fkey, fvalue, true);
                        }
                    }
                }
            }
            else {
                if (commonConstant.customTextures) {
                    for (const tkey in commonConstant.customTextures) {
                        const tvalue = commonConstant.customTextures[tkey];
                        if (tvalue != null && Utilities.HasOwnProperty(commonMaterial, tkey)) {
                            promises.push(this._loader.loadTextureInfoAsync(context + "/" + tkey, tvalue, (texture) => {
                                if (tkey === "detailsSampler" || tkey === "normalsSampler") {
                                    texture.name = `${sourceMaterial.name} (Atlas)`;
                                }
                                else {
                                    texture.name = `${sourceMaterial.name} (Custom)`;
                                }
                                commonMaterial[tkey] = texture;
                            }));
                        }
                    }
                }
                if (commonConstant.customVectors) {
                    for (const vkey in commonConstant.customVectors) {
                        const vvalue = commonConstant.customVectors[vkey];
                        if (vvalue != null && Utilities.HasOwnProperty(commonMaterial, vkey)) {
                            commonMaterial[vkey] = Vector4.FromArray(vvalue);
                        }
                    }
                }
                if (commonConstant.customColors) {
                    for (const ckey in commonConstant.customColors) {
                        const cvalue = commonConstant.customColors[ckey];
                        if (cvalue != null && Utilities.HasOwnProperty(commonMaterial, ckey)) {
                            if (commonMaterial[ckey] instanceof Vector4) {
                                commonMaterial[ckey] = Vector4.FromArray(cvalue);
                            }
                            else if (commonMaterial[ckey] instanceof Color4) {
                                commonMaterial[ckey] = Color4.FromArray(cvalue);
                            }
                            else {
                                commonMaterial[ckey] = Color3.FromArray(cvalue);
                            }
                        }
                    }
                }
                if (commonConstant.customFloats) {
                    for (const fkey in commonConstant.customFloats) {
                        const fvalue = commonConstant.customFloats[fkey];
                        if (fvalue != null && Utilities.HasOwnProperty(commonMaterial, fkey)) {
                            if (commonMaterial[fkey] instanceof Boolean) {
                                commonMaterial[fkey] = (fvalue > 0);
                            }
                            else {
                                commonMaterial[fkey] = fvalue;
                            }
                        }
                    }
                }
            }
            if (commonConstant.freezeMaterial != null && commonConstant.freezeMaterial === true) {
                if (this._shaderList != null)
                    this._shaderList.push(sourceMaterial);
            }
        }
    }
}
CVTOOLS_unity_metadata.ScriptBundleCache = {};
export class CVTOOLS_babylon_mesh {
    constructor(loader) {
        this.name = SceneManager.CVTOOLS_MESH;
        this.enabled = false;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(SceneManager.CVTOOLS_MESH);
        this.order = 101;
    }
    dispose() {
        delete this._loader;
    }
}
export class CVTOOLS_left_handed {
    constructor(loader) {
        this.name = SceneManager.CVTOOLS_HAND;
        this.enabled = false;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(SceneManager.CVTOOLS_HAND);
        this.order = 102;
    }
    dispose() {
        delete this._loader;
    }
}
export class MetadataParser {
    constructor(scene) { this._babylonScene = scene; this._physicList = []; this._shadowList = []; this._scriptList = []; this._freezeList = []; }
    parseSceneComponents(entity) {
        MetadataParser.DoParseSceneComponents(this._babylonScene, entity, this._physicList, this._shadowList, this._scriptList, this._freezeList);
    }
    postProcessSceneComponents(preloadList, readyList) {
        MetadataParser.DoProcessPendingPhysics(this._babylonScene, this._physicList);
        MetadataParser.DoProcessPendingShadows(this._babylonScene, this._shadowList);
        MetadataParser.DoProcessPendingScripts(this._babylonScene, this._scriptList, preloadList, readyList);
        MetadataParser.DoProcessPendingFreezes(this._freezeList);
        this._babylonScene = null;
        this._physicList = null;
        this._shadowList = null;
        this._scriptList = null;
        this._freezeList = null;
    }
    static DoParseSceneComponents(scene, entity, physicList, shadowList, scriptList, freezeList) {
        if (entity != null && entity.metadata != null && entity.metadata.toolkit != null && entity.metadata.toolkit.parsed != null && entity.metadata.toolkit.parsed === false) {
            entity.onDisposeObservable.addOnce(() => { Utilities.DisposeEntity(entity); });
            entity.metadata.toolkit.parsed = true;
            entity.metadata.toolkit.prefab = false;
            const metadata = entity.metadata.toolkit;
            const meshIsVisible = (entity.metadata.toolkit.visible != null) ? entity.metadata.toolkit.visible : true;
            const meshVisibility = (entity.metadata.toolkit.visibility != null) ? entity.metadata.toolkit.visibility : 1;
            const meshBillboardMode = (entity.metadata.toolkit.billboard != null) ? entity.metadata.toolkit.billboard : 0;
            const abstractmesh = (entity instanceof AbstractMesh);
            const lightmapped = (entity.metadata.toolkit.lightmapped != null) ? entity.metadata.toolkit.lightmapped : false;
            const tags = metadata.tags;
            if (tags != null && tags !== "") {
                Tags.AddTagsTo(entity, tags);
                if (tags.indexOf("NavigationMesh") >= 0) {
                    entity.isVisible = false;
                    entity.isPickable = false;
                    entity.useVertexColors = false;
                }
            }
            if (metadata.physics != null) {
                if (physicList != null)
                    physicList.push(entity);
            }
            if (metadata.renderer != null) {
                if (abstractmesh === true) {
                    entity.isPickable = true;
                    entity.useVertexColors = false;
                    entity.isVisible = meshIsVisible;
                    entity.visibility = meshVisibility;
                    entity.billboardMode = meshBillboardMode;
                    entity.cullingStrategy = AbstractMesh.CULLINGSTRATEGY_STANDARD;
                    if (metadata.renderer.cullingstrategy != null && metadata.renderer.cullingstrategy !== AbstractMesh.CULLINGSTRATEGY_STANDARD) {
                        entity.cullingStrategy = metadata.renderer.cullingstrategy;
                    }
                    if (metadata.renderer.castshadows != null && metadata.renderer.castshadows === true) {
                        if (shadowList != null)
                            shadowList.push(entity);
                    }
                    if (metadata.renderer.receiveshadows != null && metadata.renderer.receiveshadows === true) {
                        entity.receiveShadows = true;
                    }
                    if (metadata.renderer.checkcollisions != null && metadata.renderer.checkcollisions === true) {
                        entity.checkCollisions = true;
                    }
                    if (metadata.renderer.istriggervolume != null && metadata.renderer.istriggervolume === true) {
                        entity.collisionResponse = false;
                    }
                    if (metadata.renderer.usevertexcolors != null) {
                        entity.useVertexColors = metadata.renderer.usevertexcolors;
                    }
                    if (metadata.renderer.setmeshpickable != null) {
                        entity.isPickable = metadata.renderer.setmeshpickable;
                    }
                    if (metadata.renderer.showboundingbox != null) {
                        entity.showBoundingBox = metadata.renderer.showboundingbox;
                    }
                    if (metadata.renderer.defaultellipsoid != null) {
                        entity.ellipsoid = Utilities.ParseVector3(metadata.renderer.defaultellipsoid);
                    }
                    if (metadata.renderer.ellipsoidoffset != null) {
                        entity.ellipsoidOffset = Utilities.ParseVector3(metadata.renderer.ellipsoidoffset);
                    }
                    if (metadata.renderer.rendergroupid != null) {
                        entity.renderingGroupId = metadata.renderer.rendergroupid;
                    }
                    if (metadata.renderer.freezeworldmatrix != null && metadata.renderer.freezeworldmatrix === true) {
                        if (freezeList != null)
                            freezeList.push(entity);
                    }
                    if (metadata.renderer.snapshotrendering != null && metadata.renderer.snapshotrendering > 0) {
                        Utilities.PrepareSkeletonForRendering(entity.skeleton);
                        entity.alwaysSelectAsActiveMesh = true;
                    }
                }
                else {
                    const skin = SceneManager.GetSkinnedMesh(entity);
                    if (skin != null) {
                        skin.isPickable = true;
                        skin.useVertexColors = false;
                        skin.isVisible = meshIsVisible;
                        skin.visibility = meshVisibility;
                        skin.billboardMode = meshBillboardMode;
                        skin.cullingStrategy = AbstractMesh.CULLINGSTRATEGY_STANDARD;
                        skin.alwaysSelectAsActiveMesh = true;
                        if (metadata.renderer.cullingstrategy != null && metadata.renderer.cullingstrategy !== AbstractMesh.CULLINGSTRATEGY_STANDARD) {
                            skin.cullingStrategy = metadata.renderer.cullingstrategy;
                        }
                        if (metadata.renderer.castshadows != null && metadata.renderer.castshadows === true) {
                            if (shadowList != null)
                                shadowList.push(skin);
                        }
                        if (metadata.renderer.receiveshadows != null && metadata.renderer.receiveshadows === true) {
                            skin.receiveShadows = true;
                        }
                        if (metadata.renderer.checkcollisions != null && metadata.renderer.checkcollisions === true) {
                            skin.checkCollisions = true;
                        }
                        if (metadata.renderer.istriggervolume != null && metadata.renderer.istriggervolume === true) {
                            skin.collisionResponse = false;
                        }
                        if (metadata.renderer.usevertexcolors != null) {
                            skin.useVertexColors = metadata.renderer.usevertexcolors;
                        }
                        if (metadata.renderer.setmeshpickable != null) {
                            skin.isPickable = metadata.renderer.setmeshpickable;
                        }
                        if (metadata.renderer.showboundingbox != null) {
                            skin.showBoundingBox = metadata.renderer.showboundingbox;
                        }
                        if (metadata.renderer.defaultellipsoid != null) {
                            skin.ellipsoid = Utilities.ParseVector3(metadata.renderer.defaultellipsoid);
                        }
                        if (metadata.renderer.ellipsoidoffset != null) {
                            skin.ellipsoidOffset = Utilities.ParseVector3(metadata.renderer.ellipsoidoffset);
                        }
                        if (metadata.renderer.rendergroupid != null) {
                            skin.renderingGroupId = metadata.renderer.rendergroupid;
                        }
                        if (metadata.renderer.freezeworldmatrix != null && metadata.renderer.freezeworldmatrix === true) {
                            if (freezeList != null)
                                freezeList.push(skin);
                        }
                        if (metadata.renderer.snapshotrendering != null && metadata.renderer.snapshotrendering > 0) {
                            Utilities.PrepareSkeletonForRendering(skin.skeleton);
                        }
                    }
                    else {
                        const primitives = SceneManager.GetPrimitiveMeshes(entity);
                        if (primitives != null && primitives.length > 0) {
                            primitives.forEach((primitive) => {
                                const pskin = SceneManager.GetSkinnedMesh(primitive);
                                if (pskin != null) {
                                    pskin.isPickable = true;
                                    pskin.useVertexColors = false;
                                    pskin.isVisible = meshIsVisible;
                                    pskin.visibility = meshVisibility;
                                    pskin.billboardMode = meshBillboardMode;
                                    pskin.cullingStrategy = AbstractMesh.CULLINGSTRATEGY_STANDARD;
                                    pskin.alwaysSelectAsActiveMesh = true;
                                    if (metadata.renderer.cullingstrategy != null && metadata.renderer.cullingstrategy !== AbstractMesh.CULLINGSTRATEGY_STANDARD) {
                                        pskin.cullingStrategy = metadata.renderer.cullingstrategy;
                                    }
                                    if (metadata.renderer.castshadows != null && metadata.renderer.castshadows === true) {
                                        if (shadowList != null)
                                            shadowList.push(pskin);
                                    }
                                    if (metadata.renderer.receiveshadows != null && metadata.renderer.receiveshadows === true) {
                                        pskin.receiveShadows = true;
                                    }
                                    if (metadata.renderer.checkcollisions != null && metadata.renderer.checkcollisions === true) {
                                        pskin.checkCollisions = true;
                                    }
                                    if (metadata.renderer.istriggervolume != null && metadata.renderer.istriggervolume === true) {
                                        pskin.collisionResponse = false;
                                    }
                                    if (metadata.renderer.usevertexcolors != null) {
                                        pskin.useVertexColors = metadata.renderer.usevertexcolors;
                                    }
                                    if (metadata.renderer.setmeshpickable != null) {
                                        pskin.isPickable = metadata.renderer.setmeshpickable;
                                    }
                                    if (metadata.renderer.showboundingbox != null) {
                                        pskin.showBoundingBox = metadata.renderer.showboundingbox;
                                    }
                                    if (metadata.renderer.defaultellipsoid != null) {
                                        pskin.ellipsoid = Utilities.ParseVector3(metadata.renderer.defaultellipsoid);
                                    }
                                    if (metadata.renderer.ellipsoidoffset != null) {
                                        pskin.ellipsoidOffset = Utilities.ParseVector3(metadata.renderer.ellipsoidoffset);
                                    }
                                    if (metadata.renderer.rendergroupid != null) {
                                        pskin.renderingGroupId = metadata.renderer.rendergroupid;
                                    }
                                    if (metadata.renderer.freezeworldmatrix != null && metadata.renderer.freezeworldmatrix === true) {
                                        if (freezeList != null)
                                            freezeList.push(pskin);
                                    }
                                    if (metadata.renderer.snapshotrendering != null && metadata.renderer.snapshotrendering > 0) {
                                        Utilities.PrepareSkeletonForRendering(pskin.skeleton);
                                    }
                                }
                                else {
                                    primitive.isPickable = true;
                                    primitive.useVertexColors = false;
                                    primitive.isVisible = meshIsVisible;
                                    primitive.visibility = meshVisibility;
                                    primitive.billboardMode = meshBillboardMode;
                                    primitive.cullingStrategy = AbstractMesh.CULLINGSTRATEGY_STANDARD;
                                    if (metadata.renderer.cullingstrategy != null && metadata.renderer.cullingstrategy !== AbstractMesh.CULLINGSTRATEGY_STANDARD) {
                                        primitive.cullingStrategy = metadata.renderer.cullingstrategy;
                                    }
                                    if (metadata.renderer.castshadows != null && metadata.renderer.castshadows === true) {
                                        if (shadowList != null)
                                            shadowList.push(primitive);
                                    }
                                    if (metadata.renderer.receiveshadows != null && metadata.renderer.receiveshadows === true) {
                                        primitive.receiveShadows = true;
                                    }
                                    if (metadata.renderer.checkcollisions != null && metadata.renderer.checkcollisions === true) {
                                        primitive.checkCollisions = true;
                                    }
                                    if (metadata.renderer.istriggervolume != null && metadata.renderer.istriggervolume === true) {
                                        primitive.collisionResponse = false;
                                    }
                                    if (metadata.renderer.usevertexcolors != null) {
                                        primitive.useVertexColors = metadata.renderer.usevertexcolors;
                                    }
                                    if (metadata.renderer.setmeshpickable != null) {
                                        primitive.isPickable = metadata.renderer.setmeshpickable;
                                    }
                                    if (metadata.renderer.showboundingbox != null) {
                                        primitive.showBoundingBox = metadata.renderer.showboundingbox;
                                    }
                                    if (metadata.renderer.defaultellipsoid != null) {
                                        primitive.ellipsoid = Utilities.ParseVector3(metadata.renderer.defaultellipsoid);
                                    }
                                    if (metadata.renderer.ellipsoidoffset != null) {
                                        primitive.ellipsoidOffset = Utilities.ParseVector3(metadata.renderer.ellipsoidoffset);
                                    }
                                    if (metadata.renderer.rendergroupid != null) {
                                        primitive.renderingGroupId = metadata.renderer.rendergroupid;
                                    }
                                    if (metadata.renderer.freezeworldmatrix != null && metadata.renderer.freezeworldmatrix === true) {
                                        if (freezeList != null)
                                            freezeList.push(primitive);
                                    }
                                    if (metadata.renderer.snapshotrendering != null && metadata.renderer.snapshotrendering > 0) {
                                        Utilities.PrepareSkeletonForRendering(primitive.skeleton);
                                        primitive.alwaysSelectAsActiveMesh = true;
                                    }
                                }
                            });
                        }
                    }
                }
            }
            if (metadata.components != null) {
                const components = metadata.components;
                if (components != null && components.length > 0) {
                    components.forEach((component) => {
                        if (component != null) {
                            switch (component.alias) {
                                case "camera": {
                                    MetadataParser.SetupCameraComponent(scene, entity, component);
                                    break;
                                }
                                case "light": {
                                    MetadataParser.SetupLightComponent(scene, entity, component);
                                    break;
                                }
                                case "script": {
                                    if (scriptList != null)
                                        scriptList.push({ mesh: entity, comp: component });
                                    break;
                                }
                            }
                        }
                    });
                }
            }
        }
    }
    static DoProcessPendingScripts(scene, scriptList, preloadList, readyList) {
        if (scriptList != null && scriptList.length > 0) {
            scriptList.sort((left, right) => {
                if (left.comp.order < right.comp.order)
                    return -1;
                if (left.comp.order > right.comp.order)
                    return 1;
                return 0;
            });
            scriptList.forEach((item) => {
                if (item.comp.klass != null && item.comp.klass !== "") {
                    if (SceneManager.AutoStripNamespacePrefix === true && SceneManager.UniversalModuleDefinition === false) {
                        const nsIndex = item.comp.klass.lastIndexOf(".");
                        if (nsIndex !== -1)
                            item.comp.klass = item.comp.klass.substring(nsIndex + 1);
                    }
                    if (item.comp.klass !== "ScriptComponent") {
                        let ScriptComponentName = item.comp.klass;
                        if (item.comp.properties == null)
                            item.comp.properties = {};
                        item.comp.properties["_scriptComponentAlias"] = ScriptComponentName;
                        item.comp.properties["_registerComponentAlias"] = false;
                        const ScriptComponentClass = Utilities.InstantiateClass(ScriptComponentName);
                        if (ScriptComponentClass != null) {
                            const scriptComponent = new ScriptComponentClass(item.mesh, scene, item.comp.properties);
                            if (scriptComponent != null) {
                                item.comp.instance = scriptComponent;
                                if (readyList != null) {
                                    readyList.push(item.comp.instance);
                                }
                                if (item.comp.instance.addPreloaderTasks) {
                                    if (preloadList != null) {
                                        preloadList.push(item.comp.instance);
                                    }
                                }
                                SceneManager.AttachScriptComponent(item.comp.instance, ScriptComponentName, false);
                            }
                            else {
                                Tools.Warn("Failed to instantiate script class: " + ScriptComponentName);
                            }
                        }
                        else {
                            Tools.Warn("Failed to locate script class: " + ScriptComponentName);
                        }
                    }
                }
            });
        }
    }
    static DoProcessPendingShadows(scene, shadowList) {
        if (shadowList != null && shadowList.length > 0) {
            if (scene.lights != null && scene.lights.length > 0) {
                scene.lights.forEach((light) => {
                    const shadowgenerator = light.getShadowGenerator();
                    if (shadowgenerator != null && light.metadata != null && light.metadata.toolkit != null && light.metadata.toolkit.autorender === true) {
                        shadowList.forEach((mesh) => {
                            let oktoadd = false;
                            if (light.includedOnlyMeshes != null && light.includedOnlyMeshes.length > 0) {
                                oktoadd = (light.includedOnlyMeshes.indexOf(mesh) >= 0);
                            }
                            else {
                                oktoadd = true;
                            }
                            if (oktoadd === true) {
                                shadowgenerator.addShadowCaster(mesh, false);
                            }
                        });
                    }
                });
            }
        }
    }
    static DoProcessPendingPhysics(scene, physicList) {
        if (physicList != null && physicList.length > 0) {
            const physicsenabled = scene.isPhysicsEnabled();
            const physicsengine = (physicsenabled === true) ? scene.getPhysicsEngine() : null;
            const physicsloaded = (physicsenabled === true && physicsengine != null);
            if (physicsloaded === true) {
                physicList.forEach((mesh) => {
                    RigidbodyPhysics.SetupPhysicsComponent(scene, mesh);
                });
            }
            else {
                Tools.Warn("Physics engine not loaded. Physics impostors will not be created.");
            }
        }
    }
    static DoProcessPendingFreezes(freezeList) {
        if (freezeList != null && freezeList.length > 0) {
            freezeList.forEach((mesh) => { mesh.freezeWorldMatrix(); });
        }
    }
    static SetupCameraComponent(scene, entity, component) {
        entity.checkCollisions = false;
        let index = 0;
        const name = (entity.name + ".Rig");
        const rotationRads = 0;
        const culling = component.culling != null ? component.culling : -1;
        const camerabase = component.camerabase != null ? component.camerabase : 0;
        const clearflags = component.clearflags != null ? component.clearflags : 0;
        const renderlist = component.renderlist != null ? component.renderlist : null;
        const maincamera = component.maincamera != null ? component.maincamera : false;
        const babylonCamera = (camerabase === 4) ? new FreeCamera(name, Vector3.Zero(), scene) : new UniversalCamera(name, Vector3.Zero(), scene);
        babylonCamera.checkCollisions = false;
        babylonCamera.rotationQuaternion = Quaternion.FromEulerAngles(0, rotationRads, 0);
        babylonCamera.parent = entity;
        if (maincamera === true)
            scene.activeCamera = babylonCamera;
        const cameratype = component.type != null ? component.type : 0;
        switch (cameratype) {
            case 0: {
                babylonCamera.mode = Camera.PERSPECTIVE_CAMERA;
                if (component.perspectiveyfov != null) {
                    babylonCamera.fov = component.perspectiveyfov;
                }
                if (component.perspectiveznear != null) {
                    babylonCamera.minZ = component.perspectiveznear;
                }
                if (component.perspectivezfar != null) {
                    babylonCamera.maxZ = component.perspectivezfar;
                }
                break;
            }
            case 1: {
                babylonCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
                if (component.orthoxmag != null) {
                    babylonCamera.orthoLeft = -component.orthoxmag;
                    babylonCamera.orthoRight = component.orthoxmag;
                }
                if (component.orthoymag != null) {
                    babylonCamera.orthoBottom = -component.orthoymag;
                    babylonCamera.orthoTop = component.orthoymag;
                }
                if (component.orthoznear != null) {
                    babylonCamera.minZ = component.orthoznear;
                }
                if (component.orthozfar != null) {
                    babylonCamera.maxZ = component.orthozfar;
                }
                break;
            }
        }
        if (culling === -1) {
        }
        else if (culling === 0) {
        }
        else {
            const renderListData = renderlist;
            if (renderListData != null && renderListData.length > 0) {
                for (index = 0; index < renderListData.length; index++) {
                    const renderId = renderListData[index];
                    const renderMesh = SceneManager.GetMeshByID(scene, renderId);
                    if (renderMesh != null) {
                        const detailName = renderMesh.name + ".Detail";
                        const detailChildren = renderMesh.getChildren((node) => { return (node.name === detailName); }, true);
                        if (detailChildren != null && detailChildren.length > 0) {
                        }
                        else {
                        }
                    }
                }
            }
        }
        entity.cameraRig = babylonCamera;
    }
    static SetupLightComponent(scene, entity, component) {
        entity.checkCollisions = false;
        const name = (entity.name + ".Rig");
        let babylonLight;
        let index = 0;
        let intensityFactor = 1.0;
        const culling = component.culling != null ? component.culling : -1;
        const clearflags = component.clearflags != null ? component.clearflags : 0;
        const renderlist = component.renderlist != null ? component.renderlist : null;
        const lightType = component.type != null ? component.type : 0;
        const quality = SceneManager.GetRenderQuality();
        const exponent = component.exponentdecayspeed != null ? component.exponentdecayspeed : 1.0;
        let allowShadows = false;
        switch (lightType) {
            case 0: {
                const direction = Vector3.Forward();
                const orthoscale = component.orthoscale != null ? component.orthoscale : 0.1;
                const ortholeft = component.ortholeft != null ? component.ortholeft : Number.MAX_VALUE;
                const orthoright = component.orthoright != null ? component.orthoright : Number.MAX_VALUE;
                const orthotop = component.orthotop != null ? component.orthotop : Number.MAX_VALUE;
                const orthobottom = component.orthobottom != null ? component.orthobottom : Number.MAX_VALUE;
                const calczbounds = component.calczbounds != null ? component.calczbounds : false;
                const updateextends = component.updateextends != null ? component.updateextends : false;
                const shadowfrustumsize = component.shadowfrustumsize != null ? component.shadowfrustumsize : 0;
                const babylonDirLight = new DirectionalLight(name, direction, scene);
                babylonDirLight.shadowFrustumSize = shadowfrustumsize;
                babylonDirLight.shadowOrthoScale = orthoscale;
                babylonDirLight.autoCalcShadowZBounds = calczbounds;
                babylonDirLight.autoUpdateExtends = updateextends;
                babylonDirLight.orthoLeft = ortholeft;
                babylonDirLight.orthoRight = orthoright;
                babylonDirLight.orthoTop = orthotop;
                babylonDirLight.orthoBottom = orthobottom;
                babylonLight = babylonDirLight;
                babylonLight.falloffType = Light.FALLOFF_STANDARD;
                allowShadows = (quality === RenderQuality.High || quality === RenderQuality.Medium);
                intensityFactor = SceneManager.DirectionalLightIntensity;
                break;
            }
            case 1: {
                const babylonPointLight = babylonLight = new PointLight(name, Vector3.Zero(), scene);
                babylonLight = babylonPointLight;
                babylonLight.falloffType = Light.FALLOFF_STANDARD;
                allowShadows = (quality === RenderQuality.High || quality === RenderQuality.Medium);
                intensityFactor = SceneManager.PointLightIntensity;
                break;
            }
            case 2: {
                const direction = Vector3.Forward();
                const outerAngle = (component.spotangle != null) ? component.spotangle : (Math.PI / 4);
                const babylonSpotLight = new SpotLight(name, Vector3.Zero(), direction, 0, exponent, scene);
                babylonSpotLight.angle = Tools.ToRadians(outerAngle) * 0.966;
                babylonSpotLight.innerAngle = (babylonSpotLight.angle * 0.8);
                babylonLight = babylonSpotLight;
                babylonLight.falloffType = Light.FALLOFF_GLTF;
                allowShadows = (quality === RenderQuality.High || quality === RenderQuality.Medium);
                intensityFactor = SceneManager.SpotLightIntensity;
                break;
            }
        }
        if (babylonLight != null) {
            const lightRange = component.range != null ? component.range : Number.MAX_VALUE;
            const lightColor = component.color != null ? Utilities.ParseColor3(component.color, Color3.White()) : Color3.White();
            const specularColor = component.specular != null ? Utilities.ParseColor3(component.specular, Color3.White()) : Color3.White();
            const lightmapMode = component.lightmapmode != null ? component.lightmapmode : 0;
            const lightmapType = component.lightmaptype != null ? component.lightmaptype : 0;
            babylonLight.parent = entity;
            babylonLight.range = lightRange;
            babylonLight.diffuse = lightColor;
            babylonLight.specular = specularColor;
            babylonLight.intensity = (component.intensity != null ? component.intensity : 1) * intensityFactor;
            babylonLight.lightmapMode = (lightmapMode === 1) ? Light.LIGHTMAP_SHADOWSONLY : Light.LIGHTMAP_DEFAULT;
            babylonLight.intensityMode = Light.INTENSITYMODE_AUTOMATIC;
            babylonLight.shadowEnabled = false;
            let autorender = component.autorender != null ? component.autorender : true;
            const softshadows = component.softshadows != null ? component.softshadows : false;
            const numcascades = component.numcascades != null ? component.numcascades : 0;
            const cascadelambda = component.cascadelambda != null ? component.cascadelambda : 1.0;
            const setdepthclamp = component.setdepthclamp != null ? component.setdepthclamp : false;
            const blendpertecntage = component.blendpertecntage != null ? component.blendpertecntage : 0.00000001;
            const boundsrefreshrate = component.boundsrefreshrate != null ? component.boundsrefreshrate : 1;
            const lightcontactratio = component.lightcontactratio != null ? component.lightcontactratio : 0.1;
            const stabilizecascades = component.stabilizecascades != null ? component.stabilizecascades : false;
            const penumbradarkness = component.penumbradarkness != null ? component.penumbradarkness : 1.0;
            const softshadowsfilter = component.softshadowsfilter != null ? component.softshadowsfilter : 99;
            const freezeshadows = component.freezeshadows != null ? component.freezeshadows : false;
            const calcdepths = component.calcdepths != null ? component.calcdepths : false;
            const depthscaling = component.depthscaling != null ? component.depthscaling : 50;
            const blurscaling = component.blurscaling != null ? component.blurscaling : 2.0;
            const kernelblur = component.kernelblur != null ? component.kernelblur : true;
            const blurkernelsize = component.blurkernelsize != null ? component.blurkernelsize : 1.0;
            const blurboxoffset = component.blurboxoffset != null ? component.blurboxoffset : 1.0;
            const shadowmapsize = component.shadowmapsize != null ? component.shadowmapsize : 1024;
            const generateshadows = component.generateshadows != null ? component.generateshadows : false;
            const shadowbiasfactor = component.shadowbiasfactor != null ? component.shadowbiasfactor : 0.01;
            const normalbiasfactor = component.normalbiasfactor != null ? component.normalbiasfactor : 0.01;
            const shadowmapbias = component.shadowmapbias != null ? component.shadowmapbias : 0.05;
            const normalmapbias = component.normalmapbias != null ? component.normalmapbias : 0.4;
            const shadowstrength = component.shadowstrength != null ? component.shadowstrength : 1;
            const shadowdistance = component.shadowdistance != null ? component.shadowdistance : 150;
            const shadownearplane = component.shadownearplane != null ? component.shadownearplane : 0.2;
            const shadowfilterquality = component.shadowfilterquality != null ? component.shadowfilterquality : "Medium";
            const transparencyshadow = component.transparencyshadow != null ? component.transparencyshadow : false;
            const softtransparency = component.softtransparency != null ? component.softtransparency : false;
            const forcebackfacesonly = component.forcebackfacesonly != null ? component.forcebackfacesonly : true;
            const frustumedgefalloff = component.frustumedgefalloff != null ? component.frustumedgefalloff : 0;
            const usefullfloatfirst = component.usefullfloatfirst != null ? component.usefullfloatfirst : false;
            if (allowShadows === true && generateshadows === true) {
                const shadowlight = babylonLight;
                const engine = SceneManager.GetEngine(scene);
                const webglversion = (engine instanceof Engine) ? engine.webGLVersion : 0;
                const webgpuversion = (engine instanceof WebGPUEngine) ? 1 : 0;
                const usecascades = (lightType === 0 && numcascades >= 2 && (webglversion >= 2 || webgpuversion >= 1));
                const shadowgenerator = (usecascades === true) ? new CascadedShadowGenerator(shadowmapsize, babylonLight, usefullfloatfirst) : new ShadowGenerator(shadowmapsize, shadowlight, usefullfloatfirst);
                shadowgenerator.bias = (shadowmapbias * shadowbiasfactor);
                shadowgenerator.normalBias = (normalmapbias * normalbiasfactor);
                shadowgenerator.depthScale = depthscaling;
                shadowgenerator.useKernelBlur = kernelblur;
                shadowgenerator.blurKernel = blurkernelsize;
                shadowgenerator.blurScale = blurscaling;
                shadowgenerator.blurBoxOffset = blurboxoffset;
                shadowgenerator.frustumEdgeFalloff = frustumedgefalloff;
                shadowgenerator.forceBackFacesOnly = forcebackfacesonly;
                shadowgenerator.transparencyShadow = transparencyshadow;
                shadowgenerator.enableSoftTransparentShadow = softtransparency;
                shadowgenerator.contactHardeningLightSizeUVRatio = lightcontactratio;
                if (softshadows === true) {
                    if (webglversion <= 1 && webgpuversion <= 0) {
                        shadowgenerator.usePoissonSampling = true;
                    }
                    else {
                        if (usecascades === true) {
                            shadowgenerator.usePercentageCloserFiltering = true;
                        }
                        else {
                            switch (softshadowsfilter) {
                                case 0:
                                    shadowgenerator.usePoissonSampling = true;
                                    break;
                                case 1:
                                    shadowgenerator.useExponentialShadowMap = true;
                                    break;
                                case 2:
                                    shadowgenerator.useBlurExponentialShadowMap = true;
                                    break;
                                case 3:
                                    shadowgenerator.useCloseExponentialShadowMap = true;
                                    break;
                                case 4:
                                    shadowgenerator.useBlurCloseExponentialShadowMap = true;
                                    break;
                                case 5:
                                    shadowgenerator.useContactHardeningShadow = true;
                                    break;
                                case 99:
                                    shadowgenerator.usePercentageCloserFiltering = true;
                                    break;
                                default:
                                    shadowgenerator.usePoissonSampling = true;
                                    break;
                            }
                        }
                    }
                }
                switch (shadowfilterquality) {
                    case "High":
                        shadowgenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
                        break;
                    case "Medium":
                        shadowgenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
                        break;
                    case "Low":
                        shadowgenerator.filteringQuality = ShadowGenerator.QUALITY_LOW;
                        break;
                }
                if (usecascades === true) {
                    const cascadegenerator = shadowgenerator;
                    cascadegenerator.lambda = cascadelambda;
                    cascadegenerator.depthClamp = setdepthclamp;
                    cascadegenerator.shadowMaxZ = shadowdistance;
                    cascadegenerator.numCascades = numcascades;
                    cascadegenerator.penumbraDarkness = penumbradarkness;
                    cascadegenerator.autoCalcDepthBounds = calcdepths;
                    cascadegenerator.stabilizeCascades = stabilizecascades;
                    cascadegenerator.cascadeBlendPercentage = blendpertecntage;
                    cascadegenerator.autoCalcDepthBoundsRefreshRate = boundsrefreshrate;
                    cascadegenerator.freezeShadowCastersBoundingInfo = freezeshadows;
                    cascadegenerator.setDarkness(1 - Scalar.Clamp(shadowstrength));
                    shadowlight.shadowEnabled = true;
                    cascadegenerator.splitFrustum();
                }
                else {
                    const defaultgenerator = shadowgenerator;
                    defaultgenerator.setDarkness(1 - Scalar.Clamp(shadowstrength));
                    shadowlight.shadowEnabled = true;
                    shadowlight.shadowMinZ = shadownearplane;
                    shadowlight.shadowMaxZ = shadowdistance;
                }
                if (babylonLight.metadata == null)
                    babylonLight.metadata = {};
                if (babylonLight.metadata.toolkit == null)
                    babylonLight.metadata.toolkit = {};
                babylonLight.metadata.toolkit.autorender = autorender;
            }
            const holder = (entity.name + ".Holder");
            if (culling === -1) {
                babylonLight.includedOnlyMeshes = [];
            }
            else if (culling === 0) {
                babylonLight.includedOnlyMeshes = [new Mesh(holder, scene)];
            }
            else {
                babylonLight.includedOnlyMeshes = [new Mesh(holder, scene)];
                const renderListData = renderlist;
                if (renderListData != null && renderListData.length > 0) {
                    for (index = 0; index < renderListData.length; index++) {
                        const renderId = renderListData[index];
                        const renderMesh = SceneManager.GetMeshByID(scene, renderId);
                        if (renderMesh != null) {
                            const detailName = renderMesh.name + ".Detail";
                            const detailChildren = renderMesh.getChildren((node) => { return (node.name === detailName); }, true);
                            if (detailChildren != null && detailChildren.length > 0) {
                                babylonLight.includedOnlyMeshes.push(detailChildren[0]);
                            }
                            else {
                                babylonLight.includedOnlyMeshes.push(renderMesh);
                            }
                        }
                    }
                }
            }
            entity.lightRig = babylonLight;
        }
    }
}
export class RecastJSPluginExtension {
    constructor(recastInjection = Recast) {
        this.bjsRECAST = {};
        this.name = "RecastJSPluginExtension";
        this.navMeshes = [];
        this._maximumSubStepCount = 10;
        this._timeStep = 1 / 60;
        this._timeFactor = 1;
        this._worker = null;
        if (typeof recastInjection === "function") {
            Logger.Error("RecastJS is not ready. Please make sure you await Recast() before using the plugin.");
        }
        else {
            this.bjsRECAST = recastInjection;
        }
        if (!this.isSupported()) {
            Logger.Error("RecastJS is not available. Please make sure you included the js file.");
            return;
        }
        this.setTimeStep();
        this._tempVec1 = new this.bjsRECAST.Vec3();
        this._tempVec2 = new this.bjsRECAST.Vec3();
    }
    setWorkerURL(workerURL) {
        if (window && window.Worker) {
            this._worker = new Worker(workerURL);
            return true;
        }
        return false;
    }
    setTimeStep(newTimeStep = 1 / 60) {
        this._timeStep = newTimeStep;
    }
    getTimeStep() {
        return this._timeStep;
    }
    setMaximumSubStepCount(newStepCount = 10) {
        this._maximumSubStepCount = newStepCount;
    }
    getMaximumSubStepCount() {
        return this._maximumSubStepCount;
    }
    set timeFactor(value) {
        this._timeFactor = Math.max(value, 0);
    }
    get timeFactor() {
        return this._timeFactor;
    }
    setActiveNavMesh(index) {
        if (this.navMeshes != null && index >= 0 && index < this.navMeshes.length) {
            this.navMesh = this.navMeshes[index];
            return true;
        }
        return false;
    }
    getActiveNavMesh() {
        return this.navMesh;
    }
    getIndexedNavMesh(index) {
        let result = null;
        if (this.navMeshes != null && index >= 0 && index < this.navMeshes.length) {
            result = this.navMeshes[index];
        }
        return result;
    }
    getNavMeshCount() {
        return (this.navMeshes != null) ? this.navMeshes.length : 0;
    }
    getNavMeshArray() {
        return this.navMeshes;
    }
    createNavMesh(meshes, parameters, completion) {
        if (this._worker && !completion) {
            Logger.Warn("A worker is avaible but no completion callback. Defaulting to blocking navmesh creation");
        }
        else if (!this._worker && completion) {
            Logger.Warn("A completion callback is avaible but no worker. Defaulting to blocking navmesh creation");
        }
        this.navMesh = new this.bjsRECAST.NavMesh();
        if (this.navMeshes == null)
            this.navMeshes = [];
        this.navMeshes.push(this.navMesh);
        let result = (this.navMeshes.length - 1);
        let index;
        let tri;
        let pt;
        const indices = [];
        const positions = [];
        let offset = 0;
        for (index = 0; index < meshes.length; index++) {
            if (meshes[index]) {
                const mesh = meshes[index];
                const meshIndices = mesh.getIndices();
                if (!meshIndices) {
                    continue;
                }
                const meshPositions = mesh.getVerticesData(VertexBuffer.PositionKind, false, false);
                if (!meshPositions) {
                    continue;
                }
                const worldMatrices = [];
                const worldMatrix = mesh.computeWorldMatrix(true);
                if (mesh.hasThinInstances) {
                    const thinMatrices = mesh.thinInstanceGetWorldMatrices();
                    for (let instanceIndex = 0; instanceIndex < thinMatrices.length; instanceIndex++) {
                        const tmpMatrix = new Matrix();
                        const thinMatrix = thinMatrices[instanceIndex];
                        thinMatrix.multiplyToRef(worldMatrix, tmpMatrix);
                        worldMatrices.push(tmpMatrix);
                    }
                }
                else {
                    worldMatrices.push(worldMatrix);
                }
                for (let matrixIndex = 0; matrixIndex < worldMatrices.length; matrixIndex++) {
                    const wm = worldMatrices[matrixIndex];
                    for (tri = 0; tri < meshIndices.length; tri++) {
                        indices.push(meshIndices[tri] + offset);
                    }
                    const transformed = Vector3.Zero();
                    const position = Vector3.Zero();
                    for (pt = 0; pt < meshPositions.length; pt += 3) {
                        Vector3.FromArrayToRef(meshPositions, pt, position);
                        Vector3.TransformCoordinatesToRef(position, wm, transformed);
                        positions.push(transformed.x, transformed.y, transformed.z);
                    }
                    offset += meshPositions.length / 3;
                }
            }
        }
        if (this._worker && completion) {
            this._worker.postMessage([positions, offset, indices, indices.length, parameters]);
            this._worker.onmessage = function (e) {
                completion(e.data);
            };
        }
        else {
            const rc = new this.bjsRECAST.rcConfig();
            rc.cs = parameters.cs;
            rc.ch = parameters.ch;
            rc.borderSize = parameters.borderSize ? parameters.borderSize : 0;
            rc.tileSize = parameters.tileSize ? parameters.tileSize : 0;
            rc.walkableSlopeAngle = parameters.walkableSlopeAngle;
            rc.walkableHeight = parameters.walkableHeight;
            rc.walkableClimb = parameters.walkableClimb;
            rc.walkableRadius = parameters.walkableRadius;
            rc.maxEdgeLen = parameters.maxEdgeLen;
            rc.maxSimplificationError = parameters.maxSimplificationError;
            rc.minRegionArea = parameters.minRegionArea;
            rc.mergeRegionArea = parameters.mergeRegionArea;
            rc.maxVertsPerPoly = parameters.maxVertsPerPoly;
            rc.detailSampleDist = parameters.detailSampleDist;
            rc.detailSampleMaxError = parameters.detailSampleMaxError;
            this.navMesh.build(positions, offset, indices, indices.length, rc);
        }
        return result;
    }
    createDebugNavMesh(scene) {
        let tri;
        let pt;
        const debugNavMesh = this.navMesh.getDebugNavMesh();
        const triangleCount = debugNavMesh.getTriangleCount();
        const indices = [];
        const positions = [];
        for (tri = 0; tri < triangleCount * 3; tri++) {
            indices.push(tri);
        }
        for (tri = 0; tri < triangleCount; tri++) {
            for (pt = 0; pt < 3; pt++) {
                const point = debugNavMesh.getTriangle(tri).getPoint(pt);
                positions.push(point.x, point.y, point.z);
            }
        }
        const mesh = new Mesh("NavMeshDebug", scene);
        const vertexData = new VertexData();
        vertexData.indices = indices;
        vertexData.positions = positions;
        vertexData.applyToMesh(mesh, false);
        return mesh;
    }
    getClosestPoint(position) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        const ret = this.navMesh.getClosestPoint(this._tempVec1);
        const pr = new Vector3(ret.x, ret.y, ret.z);
        return pr;
    }
    getClosestPointToRef(position, result) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        const ret = this.navMesh.getClosestPoint(this._tempVec1);
        result.set(ret.x, ret.y, ret.z);
    }
    getRandomPointAround(position, maxRadius) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        const ret = this.navMesh.getRandomPointAround(this._tempVec1, maxRadius);
        const pr = new Vector3(ret.x, ret.y, ret.z);
        return pr;
    }
    getRandomPointAroundToRef(position, maxRadius, result) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        const ret = this.navMesh.getRandomPointAround(this._tempVec1, maxRadius);
        result.set(ret.x, ret.y, ret.z);
    }
    moveAlong(position, destination) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        this._tempVec2.x = destination.x;
        this._tempVec2.y = destination.y;
        this._tempVec2.z = destination.z;
        const ret = this.navMesh.moveAlong(this._tempVec1, this._tempVec2);
        const pr = new Vector3(ret.x, ret.y, ret.z);
        return pr;
    }
    moveAlongToRef(position, destination, result) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        this._tempVec2.x = destination.x;
        this._tempVec2.y = destination.y;
        this._tempVec2.z = destination.z;
        const ret = this.navMesh.moveAlong(this._tempVec1, this._tempVec2);
        result.set(ret.x, ret.y, ret.z);
    }
    _convertNavPathPoints(navPath) {
        let pt;
        const pointCount = navPath.getPointCount();
        const positions = [];
        for (pt = 0; pt < pointCount; pt++) {
            const p = navPath.getPoint(pt);
            positions.push(new Vector3(p.x, p.y, p.z));
        }
        return positions;
    }
    computePath(start, end) {
        this._tempVec1.x = start.x;
        this._tempVec1.y = start.y;
        this._tempVec1.z = start.z;
        this._tempVec2.x = end.x;
        this._tempVec2.y = end.y;
        this._tempVec2.z = end.z;
        const navPath = this.navMesh.computePath(this._tempVec1, this._tempVec2);
        return this._convertNavPathPoints(navPath);
    }
    computePathSmooth(start, end) {
        this._tempVec1.x = start.x;
        this._tempVec1.y = start.y;
        this._tempVec1.z = start.z;
        this._tempVec2.x = end.x;
        this._tempVec2.y = end.y;
        this._tempVec2.z = end.z;
        const navPath = this.navMesh.computePathSmooth(this._tempVec1, this._tempVec2);
        return this._convertNavPathPoints(navPath);
    }
    createCrowd(maxAgents, maxAgentRadius, scene) {
        const crowd = new RecastJSCrowdExtension(this, maxAgents, maxAgentRadius, scene);
        return crowd;
    }
    setDefaultQueryExtent(extent) {
        this._tempVec1.x = extent.x;
        this._tempVec1.y = extent.y;
        this._tempVec1.z = extent.z;
        this.navMesh.setDefaultQueryExtent(this._tempVec1);
    }
    getDefaultQueryExtent() {
        const p = this.navMesh.getDefaultQueryExtent();
        return new Vector3(p.x, p.y, p.z);
    }
    buildFromNavmeshData(data) {
        const nDataBytes = data.length * data.BYTES_PER_ELEMENT;
        const dataPtr = this.bjsRECAST._malloc(nDataBytes);
        const dataHeap = new Uint8Array(this.bjsRECAST.HEAPU8.buffer, dataPtr, nDataBytes);
        dataHeap.set(data);
        const buf = new this.bjsRECAST.NavmeshData();
        buf.dataPointer = dataHeap.byteOffset;
        buf.size = data.length;
        this.navMesh = new this.bjsRECAST.NavMesh();
        if (this.navMeshes == null)
            this.navMeshes = [];
        this.navMeshes.push(this.navMesh);
        const result = (this.navMeshes.length - 1);
        this.navMesh.buildFromNavmeshData(buf);
        this.bjsRECAST._free(dataHeap.byteOffset);
        return result;
    }
    getNavmeshData() {
        const navmeshData = this.navMesh.getNavmeshData();
        const arrView = new Uint8Array(this.bjsRECAST.HEAPU8.buffer, navmeshData.dataPointer, navmeshData.size);
        const ret = new Uint8Array(navmeshData.size);
        ret.set(arrView);
        this.navMesh.freeNavmeshData(navmeshData);
        return ret;
    }
    getDefaultQueryExtentToRef(result) {
        const p = this.navMesh.getDefaultQueryExtent();
        result.set(p.x, p.y, p.z);
    }
    dispose() { }
    addCylinderObstacle(position, radius, height) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        return this.navMesh.addCylinderObstacle(this._tempVec1, radius, height);
    }
    addBoxObstacle(position, extent, angle) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        this._tempVec2.x = extent.x;
        this._tempVec2.y = extent.y;
        this._tempVec2.z = extent.z;
        return this.navMesh.addBoxObstacle(this._tempVec1, this._tempVec2, angle);
    }
    removeObstacle(obstacle) {
        this.navMesh.removeObstacle(obstacle);
    }
    isSupported() {
        return this.bjsRECAST !== undefined;
    }
    getRandomSeed() {
        return this.bjsRECAST._getRandomSeed();
    }
    setRandomSeed(seed) {
        this.bjsRECAST._setRandomSeed(seed);
    }
}
export class RecastJSCrowdExtension {
    constructor(plugin, maxAgents, maxAgentRadius, scene) {
        this.recastCrowd = {};
        this.transforms = new Array();
        this.agents = new Array();
        this.reachRadii = new Array();
        this._agentDestinationArmed = new Array();
        this._agentDestination = new Array();
        this._onBeforeAnimationsObserver = null;
        this.onReachTargetObservable = new Observable();
        this.bjsRECASTPlugin = plugin;
        this.recastCrowd = new this.bjsRECASTPlugin.bjsRECAST.Crowd(maxAgents, maxAgentRadius, this.bjsRECASTPlugin.navMesh.getNavMesh());
        this._scene = scene;
        this._onBeforeAnimationsObserver = scene.onBeforeAnimationsObservable.add(() => {
            this.update(scene.getEngine().getDeltaTime() * 0.001 * plugin.timeFactor);
        });
    }
    addAgent(pos, parameters, transform) {
        const agentParams = new this.bjsRECASTPlugin.bjsRECAST.dtCrowdAgentParams();
        agentParams.radius = parameters.radius;
        agentParams.height = parameters.height;
        agentParams.maxAcceleration = parameters.maxAcceleration;
        agentParams.maxSpeed = parameters.maxSpeed;
        agentParams.collisionQueryRange = parameters.collisionQueryRange;
        agentParams.pathOptimizationRange = parameters.pathOptimizationRange;
        agentParams.separationWeight = parameters.separationWeight;
        agentParams.updateFlags = 7;
        agentParams.obstacleAvoidanceType = 0;
        agentParams.queryFilterType = 0;
        agentParams.userData = 0;
        const agentIndex = this.recastCrowd.addAgent(new this.bjsRECASTPlugin.bjsRECAST.Vec3(pos.x, pos.y, pos.z), agentParams);
        this.transforms.push(transform);
        this.agents.push(agentIndex);
        this.reachRadii.push(parameters.reachRadius ? parameters.reachRadius : parameters.radius);
        this._agentDestinationArmed.push(false);
        this._agentDestination.push(new Vector3(0, 0, 0));
        return agentIndex;
    }
    getAgentPosition(index) {
        const agentPos = this.recastCrowd.getAgentPosition(index);
        return new Vector3(agentPos.x, agentPos.y, agentPos.z);
    }
    getAgentPositionToRef(index, result) {
        const agentPos = this.recastCrowd.getAgentPosition(index);
        result.set(agentPos.x, agentPos.y, agentPos.z);
    }
    getAgentVelocity(index) {
        const agentVel = this.recastCrowd.getAgentVelocity(index);
        return new Vector3(agentVel.x, agentVel.y, agentVel.z);
    }
    getAgentVelocityToRef(index, result) {
        const agentVel = this.recastCrowd.getAgentVelocity(index);
        result.set(agentVel.x, agentVel.y, agentVel.z);
    }
    getAgentNextTargetPath(index) {
        const pathTargetPos = this.recastCrowd.getAgentNextTargetPath(index);
        return new Vector3(pathTargetPos.x, pathTargetPos.y, pathTargetPos.z);
    }
    getAgentNextTargetPathToRef(index, result) {
        const pathTargetPos = this.recastCrowd.getAgentNextTargetPath(index);
        result.set(pathTargetPos.x, pathTargetPos.y, pathTargetPos.z);
    }
    getAgentState(index) {
        return this.recastCrowd.getAgentState(index);
    }
    overOffmeshConnection(index) {
        return this.recastCrowd.overOffmeshConnection(index);
    }
    agentGoto(index, destination) {
        this.recastCrowd.agentGoto(index, new this.bjsRECASTPlugin.bjsRECAST.Vec3(destination.x, destination.y, destination.z));
        const item = this.agents.indexOf(index);
        if (item > -1) {
            this._agentDestinationArmed[item] = true;
            this._agentDestination[item].set(destination.x, destination.y, destination.z);
        }
    }
    agentTeleport(index, destination) {
        this.recastCrowd.agentTeleport(index, new this.bjsRECASTPlugin.bjsRECAST.Vec3(destination.x, destination.y, destination.z));
    }
    updateAgentParameters(index, parameters) {
        const agentParams = this.recastCrowd.getAgentParameters(index);
        if (parameters.radius !== undefined) {
            agentParams.radius = parameters.radius;
        }
        if (parameters.height !== undefined) {
            agentParams.height = parameters.height;
        }
        if (parameters.maxAcceleration !== undefined) {
            agentParams.maxAcceleration = parameters.maxAcceleration;
        }
        if (parameters.maxSpeed !== undefined) {
            agentParams.maxSpeed = parameters.maxSpeed;
        }
        if (parameters.collisionQueryRange !== undefined) {
            agentParams.collisionQueryRange = parameters.collisionQueryRange;
        }
        if (parameters.pathOptimizationRange !== undefined) {
            agentParams.pathOptimizationRange = parameters.pathOptimizationRange;
        }
        if (parameters.separationWeight !== undefined) {
            agentParams.separationWeight = parameters.separationWeight;
        }
        this.recastCrowd.setAgentParameters(index, agentParams);
    }
    removeAgent(index) {
        this.recastCrowd.removeAgent(index);
        const item = this.agents.indexOf(index);
        if (item > -1) {
            this.agents.splice(item, 1);
            this.transforms.splice(item, 1);
            this.reachRadii.splice(item, 1);
            this._agentDestinationArmed.splice(item, 1);
            this._agentDestination.splice(item, 1);
        }
    }
    getAgents() {
        return this.agents;
    }
    update(deltaTime) {
        this.bjsRECASTPlugin.navMesh.update();
        if (deltaTime <= Epsilon) {
            return;
        }
        const timeStep = this.bjsRECASTPlugin.getTimeStep();
        const maxStepCount = this.bjsRECASTPlugin.getMaximumSubStepCount();
        if (timeStep <= Epsilon) {
            this.recastCrowd.update(deltaTime);
        }
        else {
            let iterationCount = Math.floor(deltaTime / timeStep);
            if (maxStepCount && iterationCount > maxStepCount) {
                iterationCount = maxStepCount;
            }
            if (iterationCount < 1) {
                iterationCount = 1;
            }
            const step = deltaTime / iterationCount;
            for (let i = 0; i < iterationCount; i++) {
                this.recastCrowd.update(step);
            }
        }
        for (let index = 0; index < this.agents.length; index++) {
            const agentIndex = this.agents[index];
            const agentPosition = this.getAgentPosition(agentIndex);
            this.transforms[index].position = agentPosition;
            if (this._agentDestinationArmed[index]) {
                const dx = agentPosition.x - this._agentDestination[index].x;
                const dz = agentPosition.z - this._agentDestination[index].z;
                const radius = this.reachRadii[index];
                const groundY = this._agentDestination[index].y - this.reachRadii[index];
                const ceilingY = this._agentDestination[index].y + this.reachRadii[index];
                const distanceXZSquared = dx * dx + dz * dz;
                if (agentPosition.y > groundY && agentPosition.y < ceilingY && distanceXZSquared < radius * radius) {
                    this._agentDestinationArmed[index] = false;
                    this.onReachTargetObservable.notifyObservers({ agentIndex: agentIndex, destination: this._agentDestination[index] });
                }
            }
        }
    }
    setDefaultQueryExtent(extent) {
        const ext = new this.bjsRECASTPlugin.bjsRECAST.Vec3(extent.x, extent.y, extent.z);
        this.recastCrowd.setDefaultQueryExtent(ext);
    }
    getDefaultQueryExtent() {
        const p = this.recastCrowd.getDefaultQueryExtent();
        return new Vector3(p.x, p.y, p.z);
    }
    getDefaultQueryExtentToRef(result) {
        const p = this.recastCrowd.getDefaultQueryExtent();
        result.set(p.x, p.y, p.z);
    }
    getCorners(index) {
        let pt;
        const navPath = this.recastCrowd.getCorners(index);
        const pointCount = navPath.getPointCount();
        const positions = [];
        for (pt = 0; pt < pointCount; pt++) {
            const p = navPath.getPoint(pt);
            positions.push(new Vector3(p.x, p.y, p.z));
        }
        return positions;
    }
    dispose() {
        this.recastCrowd.destroy();
        this._scene.onBeforeAnimationsObservable.remove(this._onBeforeAnimationsObserver);
        this._onBeforeAnimationsObserver = null;
        this.onReachTargetObservable.clear();
    }
}
export class Utilities {
    static ZeroPad(num, places) {
        const zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    }
    static ShiftArray(arr, reverse) {
        if (reverse)
            arr.unshift(arr.pop());
        else
            arr.push(arr.shift());
        return arr;
    }
    static GetLayerMask(layer) {
        return 1 << layer;
    }
    static IsLayerMasked(mask, layer) {
        return ((mask & (1 << layer)) != 0);
    }
    static GetHavokPlugin() {
        return globalThis.HKP;
    }
    static GetLoadingState() {
        return Utilities.LoadingState;
    }
    static GetRandomRange(min, max, last = null, retries = null) {
        let result = Scalar.RandomRange(min, max);
        if (last != null) {
            const count = (retries != null) ? retries : 100;
            if (result === last) {
                for (let index = 0; index < count; index++) {
                    result = Scalar.RandomRange(min, max);
                    if (result !== last)
                        break;
                }
            }
        }
        return result;
    }
    static GetRandomFloat(min, max, last = null, retries = null) {
        return parseFloat(Utilities.GetRandomRange(min, max, last, retries).toFixed(2));
    }
    static GetRandomInteger(min, max, last = null, retries = null) {
        return parseInt(Utilities.GetRandomRange(min, max, last, retries).toFixed(0));
    }
    static Approximately(a, b) {
        return Math.abs(b - a) < Math.max(System.Epsilon * Math.max(Math.abs(a), Math.abs(b)), System.SingleEpsilon * 8);
    }
    static GetVertexDataFromMesh(mesh) {
        const wm = mesh.computeWorldMatrix(true);
        const vertexData = VertexData.ExtractFromMesh(mesh, true, true);
        vertexData.transform(wm);
        return vertexData;
    }
    static CalculateDestinationPoint(origin, direction, length) {
        const result = new Vector3(0, 0, 0);
        Utilities.CalculateDestinationPointToRef(origin, direction, length, result);
        return result;
    }
    static CalculateDestinationPointToRef(origin, direction, length, result) {
        if (Utilities.TempDirectionBuffer == null)
            Utilities.TempDirectionBuffer = new Vector3(0, 0, 0);
        Utilities.TempDirectionBuffer.set(0, 0, 0);
        direction.scaleToRef(length, Utilities.TempDirectionBuffer);
        origin.addToRef(Utilities.TempDirectionBuffer, result);
    }
    static UpdateAbstractMeshMaterial(mesh, material, materialIndex) {
        if (mesh != null) {
            const isInstancedMesh = (mesh instanceof InstancedMesh);
            if (isInstancedMesh === false) {
                const sourceMaterial = mesh.material;
                if (sourceMaterial instanceof MultiMaterial) {
                    const clonedMaterial = sourceMaterial.clone(sourceMaterial.name + ".Clone");
                    clonedMaterial.subMaterials[materialIndex] = material;
                    mesh.material = clonedMaterial;
                }
                else {
                    mesh.material = material;
                }
            }
            else {
                console.warn("Instanced mesh not supported as a node material on mesh: " + mesh.name);
            }
        }
        else {
            console.warn("Null source mesh for mesh: " + mesh.name);
        }
    }
    static HermiteVector3(value1, tangent1, value2, tangent2, amount) {
        const result = new Vector3(0, 0, 0);
        Utilities.HermiteVector3ToRef(value1, tangent1, value2, tangent2, amount, result);
        return result;
    }
    static HermiteVector3ToRef(value1, tangent1, value2, tangent2, amount, result) {
        const squared = amount * amount;
        const cubed = amount * squared;
        const part1 = ((2.0 * cubed) - (3.0 * squared)) + 1.0;
        const part2 = (-2.0 * cubed) + (3.0 * squared);
        const part3 = (cubed - (2.0 * squared)) + amount;
        const part4 = cubed - squared;
        const x = (((value1._x * part1) + (value2._x * part2)) + (tangent1._x * part3)) + (tangent2._x * part4);
        const y = (((value1._y * part1) + (value2._y * part2)) + (tangent1._y * part3)) + (tangent2._y * part4);
        const z = (((value1._z * part1) + (value2._z * part2)) + (tangent1._z * part3)) + (tangent2._z * part4);
        result.set(x, y, z);
    }
    static LerpLog(a, b, t) {
        const clampedT = Math.min(Math.max(t, 0), 1);
        const logT = Math.sin(clampedT * Math.PI * 0.5);
        return a + (b - a) * logT;
    }
    static LerpExp(a, b, t) {
        const clampedT = Math.min(Math.max(t, 0), 1);
        const expT = 1 - Math.cos(clampedT * Math.PI * 0.5);
        return a + (b - a) * expT;
    }
    static LerpUnclamped(a, b, t) {
        return a + (b - a) * t;
    }
    static LerpUnclampedColor3(a, b, t) {
        const result = new Color3(0, 0, 0);
        Utilities.LerpUnclampedColor3ToRef(a, b, t, result);
        return result;
    }
    static LerpUnclampedColor3ToRef(a, b, t, result) {
        result.set(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
    }
    static LerpUnclampedColor4(a, b, t) {
        const result = new Color4(0, 0, 0, 1);
        Utilities.LerpUnclampedColor4ToRef(a, b, t, result);
        return result;
    }
    static LerpUnclampedColor4ToRef(a, b, t, result) {
        result.set(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t, a.a + (b.a - a.a) * t);
    }
    static LerpUnclampedVector2(a, b, t) {
        const result = new Vector2(0, 0);
        Utilities.LerpUnclampedVector2ToRef(a, b, t, result);
        return result;
    }
    static LerpUnclampedVector2ToRef(a, b, t, result) {
        result.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    }
    static LerpUnclampedVector3(a, b, t) {
        const result = new Vector3(0, 0, 0);
        Utilities.LerpUnclampedVector3ToRef(a, b, t, result);
        return result;
    }
    static LerpUnclampedVector3ToRef(a, b, t, result) {
        result.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
    }
    static LerpUnclampedVector4(a, b, t) {
        const result = new Vector4(0, 0, 0, 0);
        Utilities.LerpUnclampedVector4ToRef(a, b, t, result);
        return result;
    }
    static LerpUnclampedVector4ToRef(a, b, t, result) {
        result.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t, a.w + (b.w - a.w) * t);
    }
    static IsEqualUsingDot(dot) {
        return (dot > 1.0 - System.Epsilon);
    }
    static QuaternionAngle(a, b) {
        const dot = Math.min(Math.abs(Quaternion.Dot(a, b)), 1.0);
        return Utilities.IsEqualUsingDot(dot) ? 0.0 : Math.acos(dot) * 2.0 * System.Rad2Deg;
    }
    static QuaternionLengthSquared(quat) {
        return quat.x * quat.x + quat.y * quat.y + quat.z * quat.z + quat.w * quat.w;
    }
    static QuaternionRotateTowards(from, to, maxDegreesDelta) {
        const result = new Quaternion(0, 0, 0, 1);
        Utilities.QuaternionRotateTowardsToRef(from, to, maxDegreesDelta, result);
        return result;
    }
    static QuaternionRotateTowardsToRef(from, to, maxDegreesDelta, result) {
        const angle = Utilities.QuaternionAngle(from, to);
        if (angle == 0.0)
            result.copyFrom(to);
        else
            Utilities.QuaternionSlerpUnclampedToRef(from, to, Math.min(1.0, maxDegreesDelta / angle), result);
    }
    static QuaternionSlerpUnclamped(from, to, t) {
        const result = new Quaternion(0, 0, 0, 1);
        Utilities.QuaternionSlerpUnclampedToRef(from, to, t, result);
        return result;
    }
    static QuaternionSlerpUnclampedToRef(a, b, t, result) {
    }
    static MoveTowardsVector2(current, target, maxDistanceDelta) {
        const result = new Vector2(0.0, 0.0);
        Utilities.MoveTowardsVector2ToRef(current, target, maxDistanceDelta, result);
        return result;
    }
    static MoveTowardsVector2ToRef(current, target, maxDistanceDelta, result) {
        const toVector_x = target.x - current.x;
        const toVector_y = target.y - current.y;
        const sqDist = toVector_x * toVector_x + toVector_y * toVector_y;
        if (sqDist == 0 || (maxDistanceDelta >= 0 && sqDist <= maxDistanceDelta * maxDistanceDelta)) {
            result.set(target.x, target.y);
        }
        else {
            const dist = Math.sqrt(sqDist);
            result.set((current.x + toVector_x / dist * maxDistanceDelta), (current.y + toVector_y / dist * maxDistanceDelta));
        }
    }
    static MoveTowardsVector3(current, target, maxDistanceDelta) {
        const result = new Vector3(0.0, 0.0, 0.0);
        Utilities.MoveTowardsVector3ToRef(current, target, maxDistanceDelta, result);
        return result;
    }
    static MoveTowardsVector3ToRef(current, target, maxDistanceDelta, result) {
        const toVector_x = target.x - current.x;
        const toVector_y = target.y - current.y;
        const toVector_z = target.z - current.z;
        const sqDist = toVector_x * toVector_x + toVector_y * toVector_y + toVector_z * toVector_z;
        if (sqDist == 0 || (maxDistanceDelta >= 0 && sqDist <= maxDistanceDelta * maxDistanceDelta)) {
            result.set(target.x, target.y, target.z);
        }
        else {
            const dist = Math.sqrt(sqDist);
            result.set((current.x + toVector_x / dist * maxDistanceDelta), (current.y + toVector_y / dist * maxDistanceDelta), (current.z + toVector_z / dist * maxDistanceDelta));
        }
    }
    static MoveTowardsVector4(current, target, maxDistanceDelta) {
        const result = new Vector4(0.0, 0.0, 0.0, 0.0);
        Utilities.MoveTowardsVector4ToRef(current, target, maxDistanceDelta, result);
        return result;
    }
    static MoveTowardsVector4ToRef(current, target, maxDistanceDelta, result) {
        const toVector_x = target.x - current.x;
        const toVector_y = target.y - current.y;
        const toVector_z = target.z - current.z;
        const toVector_w = target.w - current.w;
        const sqDist = (toVector_x * toVector_x + toVector_y * toVector_y + toVector_z * toVector_z + toVector_w * toVector_w);
        if (sqDist == 0 || (maxDistanceDelta >= 0 && sqDist <= maxDistanceDelta * maxDistanceDelta)) {
            result.set(target.x, target.y, target.z, target.w);
        }
        else {
            const dist = Math.sqrt(sqDist);
            result.set((current.x + toVector_x / dist * maxDistanceDelta), (current.y + toVector_y / dist * maxDistanceDelta), (current.z + toVector_z / dist * maxDistanceDelta), (current.w + toVector_w / dist * maxDistanceDelta));
        }
    }
    static ClampMagnitudeVector2(vector, length) {
        let result = new Vector2(0, 0);
        Utilities.ClampMagnitudeVector2ToRef(vector, length, result);
        return result;
    }
    static ClampMagnitudeVector2ToRef(vector, length, result) {
        const sqrMagnitude = vector.lengthSquared();
        if (sqrMagnitude > (length * length)) {
            const mag = Math.sqrt(sqrMagnitude);
            const normalized_x = vector.x / mag;
            const normalized_y = vector.y / mag;
            result.set((normalized_x * length), (normalized_y * length));
        }
    }
    static ClampMagnitudeVector3(vector, length) {
        let result = new Vector3(0, 0, 0);
        Utilities.ClampMagnitudeVector3ToRef(vector, length, result);
        return result;
    }
    static ClampMagnitudeVector3ToRef(vector, length, result) {
        const sqrMagnitude = vector.lengthSquared();
        if (sqrMagnitude > (length * length)) {
            const mag = Math.sqrt(sqrMagnitude);
            const normalized_x = vector.x / mag;
            const normalized_y = vector.y / mag;
            const normalized_z = vector.z / mag;
            result.set((normalized_x * length), (normalized_y * length), (normalized_z * length));
        }
    }
    static GetAngle(from, to) {
        return Utilities.GetAngleRadians(from, to) * System.Rad2Deg;
    }
    static GetAngleRadians(from, to) {
        return Math.acos(Vector3.Dot(from, to));
    }
    static ClampAngle(angle, min, max) {
        let result = angle;
        do {
            if (result < -360) {
                result += 360;
            }
            if (result > 360) {
                result -= 360;
            }
        } while (result < -360 || result > 360);
        return Scalar.Clamp(result, min, max);
    }
    static ClampAngle180(angle, min, max) {
        if (angle > 180)
            angle -= 360;
        angle = Scalar.Clamp(angle, min, max);
        if (angle < 0)
            angle += 360;
        return angle;
    }
    static ClampAngle360(angle, min, max) {
        if (angle < 90 || angle > 270) {
            if (angle > 180)
                angle -= 360;
            if (max > 180)
                max -= 360;
            if (min > 180)
                min -= 360;
        }
        angle = Scalar.Clamp(angle, min, max);
        if (angle < 0)
            angle += 360;
        return angle;
    }
    static SmoothDamp(current, target, smoothTime, maxSpeed, deltaTime, currentVelocity) {
        if (!currentVelocity)
            return 0;
        let change = current - target;
        const maxSmoothTime = Math.max(0.0001, smoothTime);
        const omega = 2 / maxSmoothTime;
        const x = omega * deltaTime;
        const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        const originalTo = target;
        const maxChange = maxSpeed * maxSmoothTime;
        change = Scalar.Clamp(change, -maxChange, maxChange);
        const newTarget = current - change;
        const temp = (currentVelocity.x + omega * change) * deltaTime;
        currentVelocity.x = (currentVelocity.x - omega * temp) * exp;
        let output = newTarget + (change + temp) * exp;
        if (originalTo - current > 0.0 == output > originalTo) {
            output = originalTo;
            currentVelocity.x = (output - originalTo) / deltaTime;
        }
        return output;
    }
    static SmoothDampAngle(current, target, smoothTime, maxSpeed, deltaTime, currentVelocity) {
        const newTarget = current + Scalar.DeltaAngle(current, target);
        return Utilities.SmoothDamp(current, newTarget, smoothTime, maxSpeed, deltaTime, currentVelocity);
    }
    static SmoothDampVector2(current, target, smoothTime, maxSpeed, deltaTime, currentVelocity) {
        const result = new Vector2(0, 0);
        Utilities.SmoothDampVector2ToRef(current, target, smoothTime, maxSpeed, deltaTime, currentVelocity, result);
        return result;
    }
    static SmoothDampVector2ToRef(current, target, smoothTime, maxSpeed, deltaTime, currentVelocity, result) {
        smoothTime = Math.max(0.0001, smoothTime);
        let omega = 2 / smoothTime;
        let x = omega * deltaTime;
        let exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        let change_x = current.x - target.x;
        let change_y = current.y - target.y;
        let originalTo = target.clone();
        let maxChange = maxSpeed * smoothTime;
        let maxChangeSq = maxChange * maxChange;
        let sqDist = change_x * change_x + change_y * change_y;
        if (sqDist > maxChangeSq) {
            let mag = Math.sqrt(sqDist);
            change_x = change_x / mag * maxChange;
            change_y = change_y / mag * maxChange;
        }
        target.x = current.x - change_x;
        target.y = current.y - change_y;
        let temp_x = (currentVelocity.x + omega * change_x) * deltaTime;
        let temp_y = (currentVelocity.y + omega * change_y) * deltaTime;
        currentVelocity.x = (currentVelocity.x - omega * temp_x) * exp;
        currentVelocity.y = (currentVelocity.y - omega * temp_y) * exp;
        let output_x = target.x + (change_x + temp_x) * exp;
        let output_y = target.y + (change_y + temp_y) * exp;
        let origMinusCurrent_x = originalTo.x - current.x;
        let origMinusCurrent_y = originalTo.y - current.y;
        let outMinusOrig_x = output_x - originalTo.x;
        let outMinusOrig_y = output_y - originalTo.y;
        if (origMinusCurrent_x * outMinusOrig_x + origMinusCurrent_y * outMinusOrig_y > 0) {
            output_x = originalTo.x;
            output_y = originalTo.y;
            currentVelocity.x = (output_x - originalTo.x) / deltaTime;
            currentVelocity.y = (output_y - originalTo.y) / deltaTime;
        }
        result.set(output_x, output_y);
    }
    static SmoothDampVector3(current, target, smoothTime, maxSpeed, deltaTime, currentVelocity) {
        const result = new Vector3(0, 0, 0);
        Utilities.SmoothDampVector3ToRef(current, target, smoothTime, maxSpeed, deltaTime, currentVelocity, result);
        return result;
    }
    static SmoothDampVector3ToRef(current, target, smoothTime, maxSpeed, deltaTime, currentVelocity, result) {
        let output_x = 0;
        let output_y = 0;
        let output_z = 0;
        smoothTime = Math.max(0.0001, smoothTime);
        let omega = 2 / smoothTime;
        let x = omega * deltaTime;
        let exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        let change_x = current.x - target.x;
        let change_y = current.y - target.y;
        let change_z = current.z - target.z;
        let originalTo = target.clone();
        let maxChange = maxSpeed * smoothTime;
        let maxChangeSq = maxChange * maxChange;
        let sqrmag = change_x * change_x + change_y * change_y + change_z * change_z;
        if (sqrmag > maxChangeSq) {
            let mag = Math.sqrt(sqrmag);
            change_x = change_x / mag * maxChange;
            change_y = change_y / mag * maxChange;
            change_z = change_z / mag * maxChange;
        }
        target.x = current.x - change_x;
        target.y = current.y - change_y;
        target.z = current.z - change_z;
        let temp_x = (currentVelocity.x + omega * change_x) * deltaTime;
        let temp_y = (currentVelocity.y + omega * change_y) * deltaTime;
        let temp_z = (currentVelocity.z + omega * change_z) * deltaTime;
        currentVelocity.x = (currentVelocity.x - omega * temp_x) * exp;
        currentVelocity.y = (currentVelocity.y - omega * temp_y) * exp;
        currentVelocity.z = (currentVelocity.z - omega * temp_z) * exp;
        output_x = target.x + (change_x + temp_x) * exp;
        output_y = target.y + (change_y + temp_y) * exp;
        output_z = target.z + (change_z + temp_z) * exp;
        let origMinusCurrent_x = originalTo.x - current.x;
        let origMinusCurrent_y = originalTo.y - current.y;
        let origMinusCurrent_z = originalTo.z - current.z;
        let outMinusOrig_x = output_x - originalTo.x;
        let outMinusOrig_y = output_y - originalTo.y;
        let outMinusOrig_z = output_z - originalTo.z;
        if (origMinusCurrent_x * outMinusOrig_x + origMinusCurrent_y * outMinusOrig_y + origMinusCurrent_z * outMinusOrig_z > 0) {
            output_x = originalTo.x;
            output_y = originalTo.y;
            output_z = originalTo.z;
            currentVelocity.x = (output_x - originalTo.x) / deltaTime;
            currentVelocity.y = (output_y - originalTo.y) / deltaTime;
            currentVelocity.z = (output_z - originalTo.z) / deltaTime;
        }
        result.set(output_x, output_y, output_z);
    }
    static ToMatrix(x, y, z) {
        return Matrix.RotationYawPitchRoll(Tools.ToRadians(y), Tools.ToRadians(x), Tools.ToRadians(z));
    }
    static ToMatrixToRef(x, y, z, result) {
        Matrix.RotationYawPitchRollToRef(Tools.ToRadians(y), Tools.ToRadians(x), Tools.ToRadians(z), result);
    }
    static FastMatrixLerp(startValue, endValue, gradient, result) {
        Matrix.LerpToRef(startValue, endValue, gradient, result);
    }
    static FastMatrixSlerp(startValue, endValue, gradient, result) {
        Matrix.DecomposeLerpToRef(startValue, endValue, gradient, result);
    }
    static ToEuler(quaternion) {
        const result = quaternion.toEulerAngles();
        result.x = Tools.ToDegrees(result.x);
        result.y = Tools.ToDegrees(result.y);
        result.z = Tools.ToDegrees(result.z);
        return result;
    }
    static ToEulerToRef(quaternion, result) {
        quaternion.toEulerAnglesToRef(result);
        result.x = Tools.ToDegrees(result.x);
        result.y = Tools.ToDegrees(result.y);
        result.z = Tools.ToDegrees(result.z);
    }
    static FromEuler(x, y, z) {
        return Quaternion.FromEulerAngles(Tools.ToRadians(x), Tools.ToRadians(y), Tools.ToRadians(z));
    }
    static FromEulerToRef(x, y, z, result) {
        Quaternion.FromEulerAnglesToRef(Tools.ToRadians(x), Tools.ToRadians(y), Tools.ToRadians(z), result);
    }
    static QuaternionDiff(a, b) {
        const result = new Quaternion(0, 0, 0, 1);
        Utilities.QuaternionDiffToRef(a, b, result);
        return result;
    }
    static QuaternionDiffToRef(a, b, result) {
        Quaternion.InverseToRef(b, Utilities.TempQuaternion);
        Utilities.TempQuaternion.multiplyToRef(a, result);
    }
    static QuaternionSubtractToRef(source, other, result) {
        result.set(source._x - other._x, source._y - other._y, source._z - other._z, source._w - other._w);
    }
    static RotateVector(vec, quat) {
        const tx = 2 * (quat.y * vec.z - quat.z * vec.y);
        const ty = 2 * (quat.z * vec.x - quat.x * vec.z);
        const tz = 2 * (quat.x * vec.y - quat.y * vec.x);
        return new Vector3(vec.x + quat.w * tx + (quat.y * tz - quat.z * ty), vec.y + quat.w * ty + (quat.z * tx - quat.x * tz), vec.z + quat.w * tz + (quat.x * ty - quat.y * tx));
    }
    static RotateVectorToRef(vec, quat, result) {
        const tx = 2 * (quat.y * vec.z - quat.z * vec.y);
        const ty = 2 * (quat.z * vec.x - quat.x * vec.z);
        const tz = 2 * (quat.x * vec.y - quat.y * vec.x);
        result.x = vec.x + quat.w * tx + (quat.y * tz - quat.z * ty);
        result.y = vec.y + quat.w * ty + (quat.z * tx - quat.x * tz);
        result.z = vec.z + quat.w * tz + (quat.x * ty - quat.y * tx);
    }
    static LookRotation(direction) {
        let result = Quaternion.Zero();
        Utilities.LookRotationToRef(direction, result);
        return result;
    }
    static LookRotationToRef(direction, result) {
        Quaternion.FromLookDirectionRHToRef(direction, Vector3.Up(), result);
    }
    static Vector3Rad2Deg(vector) {
        const result = Vector3.Zero();
        Utilities.Vector3Rad2DegToRef(vector, result);
        return result;
    }
    static Vector3Rad2DegToRef(vector, result) {
        result.x = Tools.ToDegrees(vector.x);
        result.y = Tools.ToDegrees(vector.y);
        result.z = Tools.ToDegrees(vector.z);
    }
    static MultiplyQuaternionByVector(rotation, point) {
        const result = new Vector3(0, 0, 0);
        Utilities.MultiplyQuaternionByVectorToRef(rotation, point, result);
        return result;
    }
    static MultiplyQuaternionByVectorToRef(rotation, point, result) {
        const num = rotation.x * 2;
        const num2 = rotation.y * 2;
        const num3 = rotation.z * 2;
        const num4 = rotation.x * num;
        const num5 = rotation.y * num2;
        const num6 = rotation.z * num3;
        const num7 = rotation.x * num2;
        const num8 = rotation.x * num3;
        const num9 = rotation.y * num3;
        const num10 = rotation.w * num;
        const num11 = rotation.w * num2;
        const num12 = rotation.w * num3;
        result.x = (1 - (num5 + num6)) * point.x + (num7 - num12) * point.y + (num8 + num11) * point.z;
        result.y = (num7 + num12) * point.x + (1 - (num4 + num6)) * point.y + (num9 - num10) * point.z;
        result.z = (num8 - num11) * point.x + (num9 + num10) * point.y + (1 - (num4 + num5)) * point.z;
    }
    static ValidateTransformRotation(transform) {
        if (transform.rotationQuaternion != null) {
            transform.rotation = transform.rotationQuaternion.toEulerAngles();
            transform.rotationQuaternion = null;
        }
    }
    static ValidateTransformQuaternion(transform) {
        if (transform.rotationQuaternion == null && transform.rotation != null) {
            transform.rotationQuaternion = Quaternion.FromEulerAngles(transform.rotation.x, transform.rotation.y, transform.rotation.z);
            transform.rotation.set(0.0, 0.0, 0.0);
        }
    }
    static GetKeyboardInputValue(scene, currentValue, targetValue) {
        let result = targetValue;
        if (UserInputOptions.KeyboardSmoothing === true) {
            result = Scalar.MoveTowards(currentValue, targetValue, (UserInputOptions.KeyboardMoveSensibility * SceneManager.GetDeltaSeconds(scene)));
            if (Math.abs(result) < UserInputOptions.KeyboardMoveDeadZone)
                result = 0;
        }
        return result;
    }
    static GenerateRandonNumber(min, max, decimals = 2) {
        const rand = (Math.random() * (max - min) + min).toFixed(decimals);
        return parseFloat(rand);
    }
    static ProjectVector(vector, onnormal) {
        const result = new Vector3(0, 0, 0);
        Utilities.ProjectVectorToRef(vector, onnormal, result);
        return result;
    }
    static ProjectVectorToRef(vector, onnormal, result) {
        const sqrMag = Vector3.Dot(onnormal, onnormal);
        if (sqrMag < System.Epsilon) {
            result.set(0, 0, 0);
        }
        else {
            const dot = Vector3.Dot(vector, onnormal);
            result.set((onnormal.x * dot / sqrMag), (onnormal.y * dot / sqrMag), (onnormal.z * dot / sqrMag));
        }
    }
    static ProjectVectorOnPlane(vector, planenormal) {
        const result = new Vector3(0, 0, 0);
        Utilities.ProjectVectorOnPlaneToRef(vector, planenormal, result);
        return result;
    }
    static ProjectVectorOnPlaneToRef(vector, planenormal, result) {
        const sqrMag = Vector3.Dot(planenormal, planenormal);
        if (sqrMag < System.Epsilon) {
            result.copyFrom(vector);
        }
        else {
            const dot = Vector3.Dot(vector, planenormal);
            result.set((vector.x - planenormal.x * dot / sqrMag), (vector.y - planenormal.y * dot / sqrMag), (vector.z - planenormal.z * dot / sqrMag));
        }
    }
    static AreVectorsEqual(v1, v2, p) {
        return ((Math.abs(v1.x - v2.x) < p) && (Math.abs(v1.y - v2.y) < p) && (Math.abs(v1.z - v2.z) < p));
    }
    static GetVerticalSlopeAngle(v, max = 0) {
        let result = Math.atan(Math.abs(v.y / Math.sqrt(v.x * v.x + v.z * v.z))) * System.Rad2Deg;
        result = (result != null && Number.isNaN(result) === false) ? result : 0;
        if (max > 0 && result >= max)
            result = 0;
        return result;
    }
    static DownloadEnvironment(cubemap, success = null, failure = null) {
        EnvironmentTextureTools.CreateEnvTextureAsync(cubemap).then((buffer) => {
            const name = (cubemap.name) || "Environment";
            const blob = new Blob([buffer], { type: "octet/stream" });
            Tools.Download(blob, name + ".env");
            if (success != null)
                success();
        }).catch((error) => {
            console.error(error);
            if (failure != null)
                failure();
        });
    }
    static HasOwnProperty(object, property) {
        return (object != null && property != null && property !== "" && property in object);
    }
    static FindMeshCollider(scene, object) {
        let result = null;
        if (object instanceof TransformNode) {
            const hasMeshCollider = (object.metadata != null && object.metadata.toolkit != null && object.metadata.toolkit.renderer != null && object.metadata.toolkit.renderer.hasmeshcollider != null && object.metadata.toolkit.renderer.hasmeshcollider === true);
            if (hasMeshCollider === true) {
                const collisionMesId = (object.id + "-collider");
                result = scene.getMeshById(collisionMesId);
            }
        }
        return result;
    }
    static ColliderInstances() {
        return (SceneManager.GlobalOptions.colliderInstances != null) ? SceneManager.GlobalOptions.colliderInstances : true;
    }
    static ReparentColliders() {
        return (SceneManager.GlobalOptions.reparentColliders != null) ? SceneManager.GlobalOptions.reparentColliders : true;
    }
    static UseTriangleNormals() {
        return (SceneManager.GlobalOptions.useTriangleNormals != null) ? SceneManager.GlobalOptions.useTriangleNormals : false;
    }
    static UseConvexTriangles() {
        return (SceneManager.GlobalOptions.useConvexTriangles != null) ? SceneManager.GlobalOptions.useConvexTriangles : false;
    }
    static DefaultRenderGroup() {
        return (SceneManager.GlobalOptions.defaultRenderGroup != null) ? SceneManager.GlobalOptions.defaultRenderGroup : 0;
    }
    static ShowDebugColliders() {
        if (SceneManager.EnableDebugMode === true)
            return true;
        return (SceneManager.GlobalOptions.showDebugColliders != null) ? SceneManager.GlobalOptions.showDebugColliders : false;
    }
    static ColliderVisibility() {
        return (SceneManager.GlobalOptions.colliderVisibility != null) ? SceneManager.GlobalOptions.colliderVisibility : 0;
    }
    static ColliderRenderGroup() {
        return (SceneManager.GlobalOptions.colliderRenderGroup != null) ? SceneManager.GlobalOptions.colliderRenderGroup : 0;
    }
    static CollisionWireframe() {
        return (SceneManager.GlobalOptions.collisionWireframe != null) ? SceneManager.GlobalOptions.collisionWireframe : false;
    }
    static GetColliderMaterial(scene) {
        const mname = "Collider-Material";
        let result = scene.getMaterialByName(mname);
        if (result == null) {
            const colliderMaterial = new PBRMaterial(mname, scene);
            colliderMaterial.albedoColor = new Color3(0, 0.75, 0);
            colliderMaterial.wireframe = Utilities.CollisionWireframe();
            colliderMaterial.unlit = true;
            result = colliderMaterial;
        }
        return result;
    }
    static CalculateCombinedFriction(friction0, friction1) {
        const MAX_FRICTION = 10.0;
        let friction = friction0 * friction1;
        if (friction < -MAX_FRICTION)
            friction = -MAX_FRICTION;
        if (friction > MAX_FRICTION)
            friction = MAX_FRICTION;
        return friction;
    }
    static CalculateCombinedRestitution(restitution0, restitution1) {
        return restitution0 * restitution1;
    }
    static AddLoaderItemMarkedForDisposal(node) {
        if (Utilities.LoaderItemsMarkedForDisposal == null)
            Utilities.LoaderItemsMarkedForDisposal = [];
        Utilities.LoaderItemsMarkedForDisposal.push(node);
    }
    static ResetLoaderItemsMarkedForDisposal() {
        Utilities.LoaderItemsMarkedForDisposal = [];
    }
    static RemoveLoaderItemsMarkedForDisposal() {
        if (Utilities.LoaderItemsMarkedForDisposal != null && Utilities.LoaderItemsMarkedForDisposal.length > 0) {
            Utilities.LoaderItemsMarkedForDisposal.forEach((item) => {
                try {
                    item.dispose();
                }
                catch (error) {
                    console.warn(error);
                }
            });
        }
        Utilities.ResetLoaderItemsMarkedForDisposal();
    }
    static GetDirectTargetAngle(transform, worldSpaceTarget) {
        Utilities.TempVector3.set(0, 0, 0);
        Utilities.InverseTransformPointToRef(transform, worldSpaceTarget, Utilities.TempVector3);
        return Math.atan2(Utilities.TempVector3.x, Utilities.TempVector3.z);
    }
    static GetSmoothTargetAngle(transform, worldSpaceTarget) {
        Utilities.TempVector3.set(0, 0, 0);
        Utilities.InverseTransformPointToRef(transform, worldSpaceTarget, Utilities.TempVector3);
        return (Utilities.TempVector3.x / Utilities.TempVector3.length());
    }
    static CalculatCatmullRom(p0, p1, p2, p3, i) {
        const result = new Vector3(0, 0, 0);
        Utilities.CalculatCatmullRomToRef(p0, p1, p2, p3, i, result);
        return result;
    }
    static CalculatCatmullRomToRef(p0, p1, p2, p3, i, result) {
    }
    static MakeProper(name) {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    static StartsWith(source, word) {
        return source.lastIndexOf(word, 0) === 0;
    }
    static EndsWith(source, word) {
        return source.indexOf(word, source.length - word.length) !== -1;
    }
    static ReplaceAll(source, word, replace) {
        return source.replace(new RegExp(word, 'g'), replace);
    }
    static IsNullOrEmpty(source) {
        return (source == null || source === "");
    }
    static SafeStringPush(array, value) {
        if (array.indexOf(value) === -1) {
            array.push(value);
        }
    }
    static ParseColor3(source, defaultValue = null, toLinearSpace = false) {
        let result = null;
        if (source != null && source.r != null && source.g != null && source.b != null) {
            if (toLinearSpace === true) {
                result = new Color3(source.r, source.g, source.b).toLinearSpace();
            }
            else {
                result = new Color3(source.r, source.g, source.b);
            }
        }
        else {
            result = defaultValue;
        }
        return result;
    }
    static ParseColor4(source, defaultValue = null, toLinearSpace = false) {
        let result = null;
        if (source != null && source.r != null && source.g != null && source.b != null) {
            const alpha = (source.a != null) ? source.a : 1;
            if (toLinearSpace === true) {
                result = new Color4(source.r, source.g, source.b, alpha).toLinearSpace();
            }
            else {
                result = new Color4(source.r, source.g, source.b, alpha);
            }
        }
        else {
            result = defaultValue;
        }
        return result;
    }
    static ParseVector2(source, defaultValue = null) {
        let result = null;
        if (source != null && source.x != null && source.y != null) {
            result = new Vector2(source.x, source.y);
        }
        else {
            result = defaultValue;
        }
        return result;
    }
    static ParseVector3(source, defaultValue = null) {
        let result = null;
        if (source != null && source.x != null && source.y != null && source.z != null) {
            result = new Vector3(source.x, source.y, source.z);
        }
        else {
            result = defaultValue;
        }
        return result;
    }
    static ParseVector4(source, defaultValue = null) {
        let result = null;
        if (source != null && source.x != null && source.y != null && source.z != null && source.w != null) {
            result = new Vector4(source.x, source.y, source.z, source.w);
        }
        else {
            result = defaultValue;
        }
        return result;
    }
    static async ParseSound(source, scene, name, callback, options) {
        let result = null;
        if (source != null && source.filename != null && source.filename !== "") {
            const root = SceneManager.GetRootUrl(scene);
            const url = source.filename;
            result = await AudioSource.CreateStaticSound(name, (root + url), options);
            if (callback != null)
                callback();
        }
        return result;
    }
    static ParseTexture(source, scene, noMipmap, invertY, samplingMode, onLoad, onError, buffer, deleteBuffer, format) {
        let result = null;
        if (source != null && source.filename != null && source.filename !== "") {
            const root = SceneManager.GetRootUrl(scene);
            const url = source.filename;
            result = new Texture((root + url), scene, noMipmap, invertY, samplingMode, onLoad, onError, buffer, deleteBuffer, format);
        }
        return result;
    }
    static ParseCubemap(source, scene) {
        let result = null;
        if (source != null && source.info != null) {
            const root = SceneManager.GetRootUrl(scene);
            const folder = (root + source.info.rooturl);
            result = CubeTexture.Parse(source.info, scene, folder);
            if (result != null)
                result.gammaSpace = false;
        }
        return result;
    }
    static ParseTextAsset(source, defaultValue = null) {
        let result = null;
        if (source != null && source.base64 != null && source.base64 !== "") {
            result = WindowManager.Atob(source.base64);
        }
        else {
            result = defaultValue;
        }
        return result;
    }
    static ParseJsonAsset(source, defaultValue = null, reviver = null) {
        const json = Utilities.ParseTextAsset(source, defaultValue);
        return (json != null && json !== "") ? JSON.parse(json, reviver) : null;
    }
    static ParseTransformByID(source, scene, defaultValue = null) {
        let result = null;
        if (source != null && source.id != null) {
            result = SceneManager.GetTransformNodeByID(scene, source.id);
        }
        else {
            result = defaultValue;
        }
        return result;
    }
    static ParseTransformByName(source, scene, defaultValue = null) {
        let result = null;
        if (source != null && source.id != null) {
            result = SceneManager.GetTransformNode(scene, source.id);
        }
        else {
            result = defaultValue;
        }
        return result;
    }
    static ParseChildTransform(parent, source, defaultValue = null) {
        let result = null;
        if (source != null && source.name != null) {
            result = SceneManager.FindChildTransformNode(parent, source.name, SearchType.IndexOf, false);
        }
        else {
            result = defaultValue;
        }
        return result;
    }
    static SetAbsolutePosition(transform, position) {
        transform.setAbsolutePosition(position);
    }
    static GetAbsolutePosition(transform, offsetPosition = null, computeMatrix = true) {
        const result = new Vector3(0, 0, 0);
        Utilities.GetAbsolutePositionToRef(transform, result, offsetPosition, computeMatrix);
        return result;
    }
    static GetAbsolutePositionToRef(transform, result, offsetPosition = null, computeMatrix = true) {
        if (computeMatrix === true)
            transform.computeWorldMatrix(true);
        result.copyFrom(transform.getAbsolutePosition());
        if (offsetPosition != null)
            result.addInPlace(offsetPosition);
    }
    static SetAbsoluteRotation(transform, rotation) {
        if (transform.rotationQuaternion == null) {
            transform.rotationQuaternion = transform.rotation.toQuaternion();
        }
        if (transform.parent != null && transform.parent instanceof TransformNode) {
            Utilities.TempQuaternion2.set(0, 0, 0, 1);
            Utilities.GetAbsoluteRotationToRef(transform.parent, Utilities.TempQuaternion2);
            Quaternion.InverseToRef(Utilities.TempQuaternion2, Utilities.TempQuaternion2);
            Utilities.TempQuaternion2.multiplyInPlace(rotation);
            transform.rotationQuaternion.copyFrom(Utilities.TempQuaternion2);
        }
        else {
            transform.rotationQuaternion.copyFrom(rotation);
        }
    }
    static GetAbsoluteRotation(transform) {
        const result = new Quaternion(0, 0, 0, 1);
        Utilities.GetAbsoluteRotationToRef(transform, result);
        return result;
    }
    static GetAbsoluteRotationToRef(transform, result) {
        if (transform.absoluteRotationQuaternion != null) {
            result.copyFrom(transform.absoluteRotationQuaternion);
        }
    }
    static TransformPoint(owner, position, computeMatrix = true) {
        if (computeMatrix === true)
            owner.computeWorldMatrix();
        return Vector3.TransformCoordinates(position, owner.getWorldMatrix());
    }
    static InverseTransformPoint(owner, position, computeMatrix = true) {
        if (computeMatrix === true)
            owner.computeWorldMatrix();
        Utilities.TempMatrix.reset();
        owner.getWorldMatrix().invertToRef(Utilities.TempMatrix);
        return Vector3.TransformCoordinates(position, Utilities.TempMatrix);
    }
    static TransformPointToRef(owner, position, result, computeMatrix = true) {
        if (computeMatrix === true)
            owner.computeWorldMatrix();
        Vector3.TransformCoordinatesToRef(position, owner.getWorldMatrix(), result);
    }
    static InverseTransformPointToRef(owner, position, result, computeMatrix = true) {
        if (computeMatrix === true)
            owner.computeWorldMatrix();
        Utilities.TempMatrix.reset();
        owner.getWorldMatrix().invertToRef(Utilities.TempMatrix);
        Vector3.TransformCoordinatesToRef(position, Utilities.TempMatrix, result);
    }
    static TransformDirection(owner, direction, computeMatrix = true) {
        if (computeMatrix === true)
            owner.computeWorldMatrix();
        return Vector3.TransformNormal(direction, owner.getWorldMatrix());
    }
    static InverseTransformDirection(owner, direction, computeMatrix = true) {
        if (computeMatrix === true)
            owner.computeWorldMatrix();
        Utilities.TempMatrix.reset();
        owner.getWorldMatrix().invertToRef(Utilities.TempMatrix);
        return Vector3.TransformNormal(direction, Utilities.TempMatrix);
    }
    static TransformDirectionToRef(owner, direction, result, computeMatrix = true) {
        if (computeMatrix === true)
            owner.computeWorldMatrix();
        Vector3.TransformNormalToRef(direction, owner.getWorldMatrix(), result);
    }
    static InverseTransformDirectionToRef(owner, direction, result, computeMatrix = true) {
        if (computeMatrix === true)
            owner.computeWorldMatrix();
        Utilities.TempMatrix.reset();
        owner.getWorldMatrix().invertToRef(Utilities.TempMatrix);
        Vector3.TransformNormalToRef(direction, Utilities.TempMatrix, result);
    }
    static RecomputeCenterPivotPoint(owner) {
        var boundingCenter = owner.getBoundingInfo().boundingSphere.center;
        owner.setPivotMatrix(Matrix.Translation(-boundingCenter.x, -boundingCenter.y, -boundingCenter.z));
    }
    static GetDirectionVector(owner, vector) {
        return owner.getDirection(vector);
    }
    static GetDirectionVectorToRef(owner, vector, result) {
        owner.getDirectionToRef(vector, result);
    }
    static GetForwardVector(owner) {
        return owner.getDirection(Vector3.Forward());
    }
    static GetForwardVectorToRef(owner, result) {
        owner.getDirectionToRef(Vector3.Forward(), result);
    }
    static GetRightVector(owner) {
        return owner.getDirection(Vector3.Right());
    }
    static GetRightVectorToRef(owner, result) {
        owner.getDirectionToRef(Vector3.Right(), result);
    }
    static GetUpVector(owner) {
        return owner.getDirection(Vector3.Up());
    }
    static GetUpVectorToRef(owner, result) {
        owner.getDirectionToRef(Vector3.Up(), result);
    }
    static BlendFloatValue(source, value, weight) {
        const blendWeight = Scalar.Clamp(weight, 0.0, 1.0);
        return (blendWeight > 0) ? Scalar.Lerp(source, value, blendWeight) : source;
    }
    static BlendVector2Value(source, value, weight) {
        const blendWeight = Scalar.Clamp(weight, 0.0, 1.0);
        if (blendWeight > 0) {
            const lerpedValue = Vector2.Lerp(source, value, blendWeight);
            source.copyFrom(lerpedValue);
        }
    }
    static BlendVector3Value(source, value, weight) {
        const blendWeight = Scalar.Clamp(weight, 0.0, 1.0);
        if (blendWeight > 0)
            Vector3.LerpToRef(source, value, blendWeight, source);
    }
    static BlendQuaternionValue(source, value, weight) {
        const blendWeight = Scalar.Clamp(weight, 0.0, 1.0);
        if (blendWeight > 0)
            Quaternion.SlerpToRef(source, value, blendWeight, source);
    }
    static SetAnimationTargetProperty(animation, property) {
        if (animation != null) {
            animation.targetProperty = property;
            animation.targetPropertyPath = animation.targetProperty.split(".");
        }
    }
    static SampleAnimationFloat(animation, time, loopMode = Animation.ANIMATIONLOOPMODE_CYCLE, gltfAnimation = false) {
        let result = 0;
        if (animation != null && animation.dataType === Animation.ANIMATIONTYPE_FLOAT) {
            if (animation._state == null)
                animation._state = { key: 0, repeatCount: 0, loopMode: loopMode, workValue: Matrix.Zero() };
            result = Utilities.InterpolateAnimation(animation, time, animation._state, gltfAnimation);
        }
        return result;
    }
    static SampleAnimationVector2(animation, time, loopMode = Animation.ANIMATIONLOOPMODE_CYCLE, gltfAnimation = false) {
        let result = null;
        if (animation != null && animation.dataType === Animation.ANIMATIONTYPE_VECTOR2) {
            if (animation._state == null)
                animation._state = { key: 0, repeatCount: 0, loopMode: loopMode, workValue: Matrix.Zero() };
            result = Utilities.InterpolateAnimation(animation, time, animation._state, gltfAnimation);
        }
        return result;
    }
    static SampleAnimationVector3(animation, time, loopMode = Animation.ANIMATIONLOOPMODE_CYCLE, gltfAnimation = false) {
        let result = null;
        if (animation != null && animation.dataType === Animation.ANIMATIONTYPE_VECTOR3) {
            if (animation._state == null)
                animation._state = { key: 0, repeatCount: 0, loopMode: loopMode, workValue: Matrix.Zero() };
            result = Utilities.InterpolateAnimation(animation, time, animation._state, gltfAnimation);
        }
        return result;
    }
    static SampleAnimationQuaternion(animation, time, loopMode = Animation.ANIMATIONLOOPMODE_CYCLE, gltfAnimation = false) {
        let result = null;
        if (animation != null && animation.dataType === Animation.ANIMATIONTYPE_QUATERNION) {
            if (animation._state == null)
                animation._state = { key: 0, repeatCount: 0, loopMode: loopMode, workValue: Matrix.Zero() };
            result = Utilities.InterpolateAnimation(animation, time, animation._state, gltfAnimation);
        }
        return result;
    }
    static SampleAnimationMatrix(animation, time, loopMode = Animation.ANIMATIONLOOPMODE_CYCLE, gltfAnimation = false) {
        let result = null;
        if (animation != null && animation.dataType === Animation.ANIMATIONTYPE_MATRIX) {
            if (animation._state == null)
                animation._state = { key: 0, repeatCount: 0, loopMode: loopMode, workValue: Matrix.Zero() };
            result = Utilities.InterpolateAnimation(animation, time, animation._state, gltfAnimation);
        }
        return result;
    }
    static CreateTweenAnimation(name, targetProperty, startValue, endValue, frameRate = 30, loopMode = Animation.ANIMATIONLOOPMODE_RELATIVE) {
        const keyFrames = [];
        keyFrames.push({
            frame: 0,
            value: startValue,
        });
        keyFrames.push({
            frame: frameRate,
            value: endValue,
        });
        const result = new Animation(name, targetProperty, frameRate, Animation.ANIMATIONTYPE_FLOAT, loopMode);
        result.setKeys(keyFrames);
        return result;
    }
    static GetLastKeyFrameIndex(animation) {
        let result = 0;
        if (animation != null) {
            const keys = animation.getKeys();
            if (keys != null && keys.length > 0) {
                const lastKey = keys[keys.length - 1];
                if (lastKey != null) {
                    result = lastKey.frame;
                }
            }
        }
        return result;
    }
    static InterpolateAnimation(animation, frame, state, gltfAnimation = false) {
        const animationFrame = (gltfAnimation === true) ? (frame * SceneManager.AnimationTargetFps) : frame;
        return animation._interpolate(animationFrame, state);
    }
    static UpdateLoopBlendPositionSettings(animationTrack, loopBlendPositionY, loopBlendPositionXZ) {
        const agroup = animationTrack;
        if (agroup.metadata != null && agroup.metadata.toolkit != null && agroup.metadata.toolkit.settings != null) {
            agroup.metadata.toolkit.settings.loopblendpositiony = loopBlendPositionY;
            agroup.metadata.toolkit.settings.loopblendpositionxz = loopBlendPositionXZ;
        }
    }
    static InitializeShaderMaterial(material, binding = true, clipPlanes = false) {
        const shaderMaterial = material;
        const shaderProgram = Utilities.HasOwnProperty(shaderMaterial, "getShaderName") ? shaderMaterial.getShaderName() : "glsl";
        const alphaBlending = Utilities.HasOwnProperty(shaderMaterial, "getAlphaBlending") ? shaderMaterial.getAlphaBlending() : false;
        const alphaTesting = Utilities.HasOwnProperty(shaderMaterial, "getAlphaTesting") ? shaderMaterial.getAlphaTesting() : false;
        let defaultDefines = Utilities.HasOwnProperty(shaderMaterial, "getDefaultDefines") ? shaderMaterial.getDefaultDefines() : null;
        let defaultAttributes = Utilities.HasOwnProperty(shaderMaterial, "getDefaultAttributes") ? shaderMaterial.getDefaultAttributes() : null;
        let defaultUniforms = Utilities.HasOwnProperty(shaderMaterial, "getDefaultUniforms") ? shaderMaterial.getDefaultUniforms() : null;
        if (defaultDefines == null || defaultDefines.length <= 0) {
            defaultDefines = ["#define GAMETIME", "#define DELTATIME", "#define DIFFUSECOLOR", "#define DIFFUSETEXTURE"];
        }
        if (defaultAttributes == null || defaultAttributes.length <= 0) {
            defaultAttributes = ["position", "normal", "uv", "uv2", "color"];
        }
        if (defaultUniforms == null || defaultUniforms.length <= 0) {
            defaultUniforms = ["world", "worldView", "worldViewProjection", "view", "projection", "viewProjection", "gameTime", "deltaTime", "diffuseColor", "diffuseTexture", "diffuseTextureInfos", "diffuseTextureMatrix"];
        }
        const shaderProgramInfo = { vertex: shaderProgram, fragment: shaderProgram };
        const shaderOptionsInfo = {
            needAlphaBlending: alphaBlending,
            needAlphaTesting: alphaTesting,
            attributes: defaultAttributes,
            uniforms: defaultUniforms,
            defines: defaultDefines,
            useClipPlane: clipPlanes,
            samplers: [],
            uniformBuffers: [],
            externalTextures: [],
            samplerObjects: [],
            storageBuffers: []
        };
        shaderMaterial._shaderPath = shaderProgramInfo;
        shaderMaterial._options = shaderOptionsInfo;
        if (binding === true) {
            shaderMaterial.fn_afterBind = shaderMaterial.bind;
            shaderMaterial.bind = (world, mesh, effectOverride = null) => {
                if (shaderMaterial.updateGlobalTime != null)
                    shaderMaterial.updateGlobalTime();
                if (shaderMaterial["after"])
                    shaderMaterial["after"]();
                if (shaderMaterial.fn_afterBind)
                    try {
                        shaderMaterial.fn_afterBind(world, mesh, effectOverride);
                    }
                    catch (e) { }
                ;
                const effect = effectOverride ?? shaderMaterial.getEffect();
                const scene = material.getScene();
                if (scene.texturesEnabled && effect != null) {
                    for (let name in shaderMaterial._textures) {
                        const texture = shaderMaterial._textures[name];
                        if (texture != null) {
                            effect.setFloat2(name + "Infos", texture.coordinatesIndex, texture.level);
                            effect.setMatrix(name + "Matrix", texture.getTextureMatrix());
                        }
                    }
                }
            };
        }
        if (shaderMaterial["awake"])
            shaderMaterial["awake"]();
    }
    static WorldToScreenPoint(scene, position, camera = null) {
        let result = null;
        const viewport = (camera != null) ? camera.viewport : (scene.activeCamera != null) ? scene.activeCamera.viewport : null;
        if (viewport != null) {
            result = Vector3.Project(position, Matrix.Identity(), scene.getTransformMatrix(), viewport.toGlobal(scene.getEngine().getRenderWidth(), scene.getEngine().getRenderHeight()));
        }
        return result;
    }
    static ScreenToWorldPoint(scene, position) {
        return Vector3.Unproject(position, scene.getEngine().getRenderWidth(), scene.getEngine().getRenderHeight(), Matrix.Identity(), scene.getViewMatrix(), scene.getProjectionMatrix());
    }
    static LoadTextFile(url, onSuccess, onProgress, onError) {
        return Tools.LoadFile(url, onSuccess, onProgress, null, false, onError);
    }
    static LoadTextFileAsync(url) {
        return Tools.LoadFileAsync(url, false);
    }
    static GetHttpRequest(url, headers = null, onSuccess = null, onFailure = null, onProgress = null, useArrayBuffer = false, overrideMimeType = null) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        if (useArrayBuffer === true) {
            xhr.responseType = "arraybuffer";
        }
        if (overrideMimeType != null) {
            xhr.overrideMimeType(overrideMimeType);
        }
        if (headers != null) {
            headers.forEach((header) => {
                if (header != null && header.name != null && header.name !== "") {
                    xhr.setRequestHeader(header.name, header.value);
                }
            });
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (onSuccess != null) {
                    onSuccess(xhr);
                }
            }
        };
        xhr.onprogress = (evt) => {
            if (onProgress != null) {
                onProgress(evt);
            }
        };
        xhr.onerror = () => {
            if (onFailure != null) {
                onFailure("Failed to get data from server.");
            }
        };
        xhr.onabort = () => {
            if (onFailure != null) {
                onFailure("Aborted get data from server.");
            }
        };
        xhr.send(null);
        return xhr;
    }
    static GetHttpRequestAsync(url, headers = null, onProgress = null, useArrayBuffer = false, overrideMimeType = null) {
        return new Promise((resolve, reject) => {
            Utilities.GetHttpRequest(url, headers, (xhr) => {
                resolve(xhr);
            }, (reason) => {
                reject(reason);
            }, onProgress, useArrayBuffer, overrideMimeType);
        });
    }
    static PostHttpRequest(url, data, headers = null, contentType = "application/x-www-form-urlencoded", onSuccess = null, onFailure = null, onProgress = null, useArrayBuffer = false, overrideMimeType = null) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        if (useArrayBuffer === true) {
            xhr.responseType = "arraybuffer";
        }
        if (overrideMimeType != null) {
            xhr.overrideMimeType(overrideMimeType);
        }
        if (headers != null) {
            headers.forEach((header) => {
                if (header != null && header.name != null && header.name !== "") {
                    xhr.setRequestHeader(header.name, header.value);
                }
            });
        }
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (onSuccess != null) {
                    onSuccess(xhr);
                }
            }
        };
        xhr.onprogress = (evt) => {
            if (onProgress != null) {
                onProgress(evt);
            }
        };
        xhr.onerror = () => {
            if (onFailure != null) {
                onFailure("Failed to post data to server.");
            }
        };
        xhr.onabort = () => {
            if (onFailure != null) {
                onFailure("Aborted post data to server.");
            }
        };
        xhr.send(data);
        return xhr;
    }
    static PostHttpRequestAsync(url, data, headers = null, contentType = "application/x-www-form-urlencoded", onProgress = null, useArrayBuffer = false, overrideMimeType = null) {
        return new Promise((resolve, reject) => {
            Utilities.PostHttpRequest(url, data, headers, contentType, (xhr) => {
                resolve(xhr);
            }, (reason) => {
                reject(reason);
            }, onProgress, useArrayBuffer, overrideMimeType);
        });
    }
    static RemapValueToRange(value, a1, a2, b1, b2) {
        return b1 + (value - a1) * (b2 - b1) / (a2 - a1);
    }
    static CloneSkeletonPrefab(scene, skeleton, name, id, root = null) {
        const result = new Skeleton(name, id || name, scene);
        result.needInitialSkinMatrix = skeleton.needInitialSkinMatrix;
        for (var index = 0; index < skeleton.bones.length; index++) {
            const source = skeleton.bones[index];
            let parentBone = null;
            let parent = source.getParent();
            if (parent) {
                var parentIndex = skeleton.bones.indexOf(parent);
                parentBone = result.bones[parentIndex];
            }
            const bone = new Bone(source.name, result, parentBone, source.getBaseMatrix().clone(), source.getRestPose().clone());
            bone._index = source._index;
            bone.metadata = source.metadata;
            if (source._linkedTransformNode) {
                bone.linkTransformNode(source._linkedTransformNode);
            }
            DeepCopier.DeepCopy(source.animations, bone.animations);
        }
        const aresult = result;
        const askeleton = skeleton;
        if (askeleton._ranges) {
            aresult._ranges = {};
            for (var rangeName in askeleton._ranges) {
                let range = askeleton._ranges[rangeName];
                if (range) {
                    aresult._ranges[rangeName] = range.clone();
                }
            }
        }
        askeleton._isDirty = true;
        return result;
    }
    static GetSceneTransforms(scene) {
        let transforms = null;
        if (scene.transformNodes != null && scene.transformNodes.length > 0) {
            scene.transformNodes.forEach((transformNode) => {
                if (transformNode.metadata != null && transformNode.metadata.toolkit != null && transformNode.metadata.toolkit.prefab != null) {
                    if (transformNode.metadata.toolkit.prefab === false) {
                        if (transforms == null)
                            transforms = [];
                        transforms.push(transformNode);
                    }
                }
            });
        }
        if (scene.meshes != null && scene.meshes.length > 0) {
            scene.meshes.forEach((mesh) => {
                if (mesh.metadata != null && mesh.metadata.toolkit != null && mesh.metadata.toolkit.prefab != null) {
                    if (mesh.metadata.toolkit.prefab === false) {
                        if (transforms == null)
                            transforms = [];
                        transforms.push(mesh);
                    }
                }
            });
        }
        return transforms;
    }
    static PostParseSceneComponents(scene, transforms, preloadList, readyList) {
        const parser = new MetadataParser(scene);
        if (transforms != null && transforms.length > 0) {
            transforms.forEach((transform) => {
                parser.parseSceneComponents(transform);
            });
            parser.postProcessSceneComponents(preloadList, readyList);
        }
        return parser;
    }
    static GetAssetContainerMesh(container, meshName) {
        let result = null;
        let searchName = meshName.toLowerCase();
        if (result == null && container.meshes != null && container.meshes.length > 0) {
            for (let ii = 0; ii < container.meshes.length; ii++) {
                const mesh = container.meshes[ii];
                if (mesh instanceof Mesh) {
                    if (mesh.name.toLowerCase() === searchName) {
                        result = mesh;
                        break;
                    }
                }
            }
        }
        return result;
    }
    static GetAssetContainerNode(container, nodeName) {
        let result = null;
        let searchName = nodeName.toLowerCase();
        if (result == null && container.transformNodes != null && container.transformNodes.length > 0) {
            for (let ii = 0; ii < container.transformNodes.length; ii++) {
                const node = container.transformNodes[ii];
                if (node.name.toLowerCase() === searchName) {
                    result = node;
                    break;
                }
            }
        }
        return result;
    }
    static CloneAssetContainerItem(container, assetName, nameFunction, newParent = null, makeNewMaterials = false, cloneAnimations = true) {
        let result = null;
        let convertionMap = {};
        let storeMap = {};
        let stateMap = {};
        let sourceAnimations = null;
        let sourceSkeletons = null;
        let alreadyAttachedSkeletons = [];
        let alreadySwappedMaterials = [];
        let options = { doNotInstantiate: true };
        let serachName = assetName.toLowerCase();
        let masterClone = null;
        let onClone = (source, clone) => {
            if (masterClone == null)
                masterClone = clone;
            convertionMap[source.uniqueId] = clone.uniqueId;
            storeMap[clone.uniqueId] = clone;
            if (nameFunction) {
                clone.name = nameFunction(source.name);
            }
            if (source.metadata != null && source.metadata.toolkit != null && source.metadata.toolkit.entity != null) {
                clone.metadata = Utilities.CloneEntityMetadata(source.metadata);
            }
            const animatorguid = (clone.metadata != null && clone.metadata.toolkit != null && clone.metadata.toolkit.animator != null) ? clone.metadata.toolkit.animator : null;
            if (animatorguid != null && animatorguid !== "") {
                if (sourceAnimations == null)
                    sourceAnimations = [];
                if (sourceAnimations.indexOf(animatorguid) < 0) {
                    sourceAnimations.push(animatorguid);
                }
                clone.metadata.toolkit.animator = Utilities.CreateGuid();
                stateMap[animatorguid] = clone.metadata.toolkit.animator;
            }
            if (source instanceof AbstractMesh) {
                if (source.skeleton != null) {
                    if (sourceSkeletons == null)
                        sourceSkeletons = [];
                    if (sourceSkeletons.indexOf(source.skeleton) < 0) {
                        sourceSkeletons.push(source.skeleton);
                    }
                }
            }
            if (clone instanceof Mesh) {
                let clonedMesh = clone;
                if (clonedMesh.morphTargetManager) {
                    let oldMorphTargetManager = source.morphTargetManager;
                    clonedMesh.morphTargetManager = oldMorphTargetManager.clone();
                    for (var index = 0; index < oldMorphTargetManager.numTargets; index++) {
                        let oldTarget = oldMorphTargetManager.getTarget(index);
                        let newTarget = clonedMesh.morphTargetManager.getTarget(index);
                        convertionMap[oldTarget.uniqueId] = newTarget.uniqueId;
                        storeMap[newTarget.uniqueId] = newTarget;
                    }
                }
            }
        };
        if (result == null && container.transformNodes != null && container.transformNodes.length > 0) {
            for (let ii = 0; ii < container.transformNodes.length; ii++) {
                const o = container.transformNodes[ii];
                if (o.name.toLowerCase() === serachName) {
                    let newOne = Utilities.InstantiateHierarchy(o, newParent, (source, clone) => {
                        onClone(source, clone);
                    });
                    if (newOne) {
                        result = newOne;
                        break;
                    }
                }
            }
        }
        if (result == null && container.meshes != null && container.meshes.length > 0) {
            for (let ii = 0; ii < container.meshes.length; ii++) {
                const o = container.meshes[ii];
                if (o.name.toLowerCase() === serachName) {
                    let newOne = Utilities.InstantiateHierarchy(o, newParent, (source, clone) => {
                        onClone(source, clone);
                        let mesh = clone;
                        if (o.isWorldMatrixFrozen === true && mesh.freezeWorldMatrix)
                            mesh.freezeWorldMatrix();
                        if (clone.material) {
                            if (mesh.material) {
                                if (makeNewMaterials === true) {
                                    let sourceMaterial = source.material;
                                    if (alreadySwappedMaterials.indexOf(sourceMaterial) === -1) {
                                        let swap = sourceMaterial.clone(nameFunction ? nameFunction(sourceMaterial.name) : "Clone of " + sourceMaterial.name);
                                        if (sourceMaterial.isFrozen === true && swap.freeze)
                                            swap.freeze();
                                        alreadySwappedMaterials.push(sourceMaterial);
                                        convertionMap[sourceMaterial.uniqueId] = swap.uniqueId;
                                        storeMap[swap.uniqueId] = swap;
                                        if (sourceMaterial.getClassName() === "MultiMaterial") {
                                            let multi = sourceMaterial;
                                            for (var material of multi.subMaterials) {
                                                if (!material) {
                                                    continue;
                                                }
                                                swap = material.clone(nameFunction ? nameFunction(material.name) : "Clone of " + material.name);
                                                if (material.isFrozen === true && swap.freeze)
                                                    swap.freeze();
                                                alreadySwappedMaterials.push(material);
                                                convertionMap[material.uniqueId] = swap.uniqueId;
                                                storeMap[swap.uniqueId] = swap;
                                            }
                                        }
                                    }
                                    mesh.material = storeMap[convertionMap[sourceMaterial.uniqueId]];
                                }
                                else {
                                    if (mesh.material.getClassName() === "MultiMaterial") {
                                        if (container.scene.multiMaterials.indexOf(mesh.material) === -1) {
                                            container.scene.addMultiMaterial(mesh.material);
                                        }
                                    }
                                    else {
                                        if (container.scene.materials.indexOf(mesh.material) === -1) {
                                            container.scene.addMaterial(mesh.material);
                                        }
                                    }
                                }
                            }
                        }
                    });
                    if (newOne) {
                        result = newOne;
                        break;
                    }
                }
            }
        }
        if (sourceSkeletons != null && sourceSkeletons.length > 0) {
            sourceSkeletons.forEach((s) => {
                const sname = nameFunction ? nameFunction(s.name) : "Clone of " + s.name;
                const clonedSkeleton = Utilities.CloneSkeletonPrefab(container.scene, s, sname, sname, masterClone);
                for (var m of container.meshes) {
                    if (m.skeleton === s && !m.isAnInstance) {
                        const copy = storeMap[convertionMap[m.uniqueId]];
                        copy.skeleton = clonedSkeleton;
                        if (alreadyAttachedSkeletons.indexOf(clonedSkeleton) !== -1) {
                            continue;
                        }
                        alreadyAttachedSkeletons.push(clonedSkeleton);
                        for (var bone of clonedSkeleton.bones) {
                            if (bone._linkedTransformNode) {
                                bone._linkedTransformNode = storeMap[convertionMap[bone._linkedTransformNode.uniqueId]];
                            }
                        }
                    }
                }
            });
        }
        if (cloneAnimations === true) {
            let sourceAnimationGroups = null;
            container.animationGroups.forEach((o) => {
                const oo = o;
                const osid = (oo.metadata != null && oo.metadata.toolkit != null && oo.metadata.toolkit.source != null && oo.metadata.toolkit.source !== "") ? oo.metadata.toolkit.source : null;
                if (osid != null && osid !== "" && sourceAnimations != null && sourceAnimations.indexOf(osid) >= 0) {
                    const aclone = o.clone(o.name, (oldTarget) => {
                        const newTarget = storeMap[convertionMap[oldTarget.uniqueId]];
                        return newTarget || oldTarget;
                    });
                    const newid = stateMap[osid] || osid;
                    if (oo.metadata != null) {
                        aclone.metadata = {};
                        aclone.metadata.toolkit = {};
                        aclone.metadata.toolkit.id = oo.metadata.toolkit.id;
                        aclone.metadata.toolkit.clip = oo.metadata.toolkit.clip;
                        aclone.metadata.toolkit.source = newid;
                        aclone.metadata.toolkit.legacy = oo.metadata.toolkit.legacy;
                        aclone.metadata.toolkit.length = oo.metadata.toolkit.length;
                        aclone.metadata.toolkit.looping = oo.metadata.toolkit.looping;
                        aclone.metadata.toolkit.settings = oo.metadata.toolkit.settings;
                        aclone.metadata.toolkit.behavior = oo.metadata.toolkit.behavior;
                        aclone.metadata.toolkit.wrapmode = oo.metadata.toolkit.wrapmode;
                        aclone.metadata.toolkit.framerate = oo.metadata.toolkit.framerate;
                        aclone.metadata.toolkit.humanmotion = oo.metadata.toolkit.humanmotion;
                        aclone.metadata.toolkit.averagespeed = oo.metadata.toolkit.averagespeed;
                        aclone.metadata.toolkit.averageduration = oo.metadata.toolkit.averageduration;
                        aclone.metadata.toolkit.averageangularspeed = oo.metadata.toolkit.averageangularspeed;
                    }
                    if (sourceAnimationGroups == null)
                        sourceAnimationGroups = [];
                    sourceAnimationGroups.push(aclone);
                }
            });
            if (result != null && sourceAnimationGroups != null)
                Utilities.AssignAnimationGroupsToInstance(result, sourceAnimationGroups);
        }
        return result;
    }
    static AssignAnimationGroupsToInstance(root, groups) {
        Utilities.AssignAnimationGroupsToNode(root, groups);
        const children = root.getChildren(null, false);
        if (children != null && children.length > 0) {
            children.forEach((transform) => {
                Utilities.AssignAnimationGroupsToNode(transform, groups);
            });
        }
    }
    static AssignAnimationGroupsToNode(transform, groups) {
        if (transform != null && transform.metadata != null && transform.metadata.toolkit) {
            const metadata = transform.metadata.toolkit;
            if (metadata.components != null && metadata.components.length > 0) {
                for (let ii = 0; ii < metadata.components.length; ii++) {
                    const transformscript = metadata.components[ii];
                    let transformklass = transformscript.klass;
                    if (transformklass != null && transformklass !== "") {
                        if (SceneManager.AutoStripNamespacePrefix === true && SceneManager.UniversalModuleDefinition === false) {
                            const nsIndex = transformklass.lastIndexOf(".");
                            if (nsIndex !== -1)
                                transformklass = transformklass.substring(nsIndex + 1);
                        }
                        if (transformklass === "AnimationState") {
                            transform.metadata.toolkit.sourceAnimationGroups = groups;
                        }
                    }
                }
            }
        }
    }
    static UnitySlopeAngleToCosine(unitySlopeAngleDegrees) {
        return Math.cos(unitySlopeAngleDegrees * Math.PI / 180);
    }
    static InstantiateHierarchy(node, newParent = null, onNewNodeCreated) {
        if (node instanceof Mesh) {
            const createInstance = (node.metadata != null && node.metadata.toolkit != null && node.metadata.toolkit.instance != null && node.metadata.toolkit.instance === true);
            return Utilities.InstantiateMeshHierarchy(node, newParent, createInstance, onNewNodeCreated);
        }
        else {
            return Utilities.InstantiateNodeHierarchy(node, newParent, onNewNodeCreated);
        }
    }
    static InstantiateNodeHierarchy(node, newParent = null, onNewNodeCreated) {
        const clone = node.clone("Clone of " + (node.name || node.id), newParent, true);
        if (clone) {
            if (onNewNodeCreated) {
                onNewNodeCreated(node, clone);
            }
        }
        for (var child of node.getChildTransformNodes(true)) {
            Utilities.InstantiateHierarchy(child, clone, onNewNodeCreated);
        }
        return clone;
    }
    static InstantiateMeshHierarchy(mesh, newParent = null, createInstance, onNewNodeCreated) {
        const instance = (mesh.getTotalVertices() > 0 && createInstance === true) ? mesh.createInstance("Instance of " + (mesh.name || mesh.id)) : mesh.clone("Clone of " + (mesh.name || mesh.id), newParent || mesh.parent, true);
        if (instance) {
            instance.parent = newParent;
            instance.position = mesh.position.clone();
            instance.scaling = mesh.scaling.clone();
            if (mesh.rotationQuaternion) {
                instance.rotationQuaternion = mesh.rotationQuaternion.clone();
            }
            else {
                instance.rotation = mesh.rotation.clone();
            }
            if (onNewNodeCreated) {
                onNewNodeCreated(mesh, instance);
            }
        }
        for (var child of mesh.getChildTransformNodes(true)) {
            Utilities.InstantiateHierarchy(child, instance, onNewNodeCreated);
        }
        return instance;
    }
    static PrepareSkeletonForRendering(skeleton, dontCheckFrameId = false) {
        if (skeleton != null) {
            skeleton.prepare(dontCheckFrameId);
        }
    }
    static RetargetAnimationGroupSkeleton(animationGroup, targetSkeleton, targetArmatureNode = null) {
        if (animationGroup == null || targetSkeleton == null)
            return;
        animationGroup.targetedAnimations.forEach((targetedAnimation, index) => {
            if (targetedAnimation.target != null && targetedAnimation.target.name != null) {
                const newTargetBone = targetSkeleton.bones.filter((bone) => { return bone.name.toLowerCase() === targetedAnimation.target.name.toLowerCase(); })[0];
                if (newTargetBone != null) {
                    const newTargetTransform = newTargetBone.getTransformNode();
                    if (newTargetTransform != null) {
                        targetedAnimation.target = newTargetBone.getTransformNode();
                    }
                }
                else {
                    if (targetedAnimation.target.name === "Armature" && targetArmatureNode != null) {
                        targetedAnimation.target = targetArmatureNode;
                    }
                    else {
                        console.warn("Failed to locate matching animation cloning target: " + targetedAnimation.target.name);
                    }
                }
            }
        });
    }
    static RetargetAnimationGroupBlendShapes(animationGroup, targetMesh) {
        if (animationGroup == null || targetMesh == null)
            return;
        animationGroup.targetedAnimations.forEach((targetedAnimation, index) => {
            if (targetedAnimation.target != null && targetedAnimation.target.name != null) {
            }
        });
    }
    static LinkSkeletonMeshes(master, slave) {
        if (master != null && master.bones != null && master.bones.length > 0) {
            if (slave != null && slave.bones != null && slave.bones.length > 0) {
                const boneCount = slave.bones.length;
                for (let index = 0; index < boneCount; index++) {
                    const sbone = slave.bones[index];
                    if (sbone != null) {
                        const mbone = Utilities.FindBoneByName(master, sbone.name);
                        if (mbone != null) {
                            sbone._linkedTransformNode = mbone._linkedTransformNode;
                        }
                        else {
                            console.warn("Failed to locate bone on mater rig: " + sbone.name);
                        }
                    }
                }
            }
        }
    }
    static FindBoneByName(skeleton, name) {
        let result = null;
        if (skeleton != null && skeleton.bones != null) {
            for (let index = 0; index < skeleton.bones.length; index++) {
                const bone = skeleton.bones[index];
                const bname = bone.name.toLowerCase().replace("mixamo:", "").replace("left_", "left").replace("right_", "right");
                const xname = name.toLowerCase().replace("mixamo:", "").replace("left_", "left").replace("right_", "right");
                if (bname === xname) {
                    result = bone;
                    break;
                }
            }
        }
        return result;
    }
    static SwitchHandednessVector3(input) {
        return new Vector3(input.x, input.y, -input.z);
    }
    static SwitchHandednessVector4(input) {
        return new Vector4(input.x, input.y, -input.z, -input.w);
    }
    static SwitchHandednessQuaternion(input) {
        return new Quaternion(input.x, input.y, -input.z, -input.w);
    }
    static ComputeBlendingSpeed(rate, duration, dampen = false) {
        let result = 1 / (rate * duration);
        if (dampen === true)
            result *= 0.5;
        return result;
    }
    static CalculateCameraDistance(farClipPlane, lodPercent, clipPlaneScale = 1) {
        const bias = 1;
        return Math.round(((farClipPlane * clipPlaneScale) * lodPercent) * bias);
    }
    static InstantiateClass(className) {
        try {
            const registeredClass = SceneManager.GetClass(className);
            if (registeredClass) {
                return registeredClass;
            }
            const arr = className.split(".");
            let fn;
            if (typeof window !== 'undefined') {
                fn = window;
            }
            else if (typeof globalThis !== 'undefined') {
                fn = globalThis;
            }
            else if (typeof globalThis.global !== 'undefined') {
                fn = globalThis.global;
            }
            else {
                throw new Error('No global object available');
            }
            for (let i = 0; i < arr.length; i++) {
                fn = fn[arr[i]];
                if (!fn) {
                    throw new Error(`Class not found: ${className}`);
                }
            }
            return (typeof fn === "function") ? fn : null;
        }
        catch (error) {
            console.error(`Failed to resolve class: ${className}`, error);
            return null;
        }
    }
    static GetSimpleClassName(obj) {
        if (obj && obj.constructor && obj.constructor.toString) {
            var arr = obj.constructor.toString().match(/function\s*(\w+)/);
            if (arr && arr.length == 2) {
                return arr[1];
            }
        }
        return undefined;
    }
    static DisposeEntity(entity) {
        if (entity != null) {
            if (entity.metadata != null && entity.metadata.toolkit) {
                const metadata = entity.metadata.toolkit;
                if (metadata.components != null && metadata.components.length > 0) {
                    metadata.components.forEach((ownerscript) => {
                        if (ownerscript.instance != null) {
                            try {
                                SceneManager.DestroyScriptComponent(ownerscript.instance);
                            }
                            catch { }
                            ownerscript.instance = null;
                        }
                    });
                }
                delete entity.metadata.toolkit;
            }
            if (entity.metadata != null && entity.metadata.mixer) {
                delete entity.metadata.mixer;
            }
            if (entity.metadata != null && entity.metadata.clone != null) {
                delete entity.metadata.clone;
            }
            if (entity.physicsImpostor != null) {
                const anyImpostor = entity.physicsImpostor;
                if (anyImpostor.onCollideEvent != null) {
                    anyImpostor.onCollideEvent = null;
                }
                if (anyImpostor.tmpCollisionObjects != null) {
                    delete anyImpostor.tmpCollisionObjects;
                }
                if (entity.physicsImpostor.physicsBody != null) {
                    if (entity.physicsImpostor.physicsBody.entity != null) {
                        delete entity.physicsImpostor.physicsBody.entity;
                    }
                    if (entity.physicsImpostor.physicsBody.triangleMapInfo != null) {
                        delete entity.physicsImpostor.physicsBody.triangleMapInfo;
                    }
                }
                entity.physicsImpostor.dispose();
                entity.physicsImpostor = null;
            }
            if (entity.skeleton != null) {
                if (entity.skeleton._sockets != null) {
                    delete entity.skeleton._sockets;
                }
                if (entity.skeleton.bones != null && entity.skeleton.bones.length > 0) {
                    entity.skeleton.bones.forEach((bone) => {
                        if (bone != null && bone.metadata != null) {
                            bone.metadata = null;
                        }
                    });
                }
            }
            if (entity.cameraRig != null) {
                if (entity.cameraRig.dispose) {
                    entity.cameraRig.dispose();
                }
                delete entity.cameraRig;
            }
            if (entity.lightRig != null) {
                if (entity.lightRig.dispose) {
                    entity.lightRig.dispose();
                }
                delete entity.lightRig;
            }
            if (entity.shadowBox != null) {
                if (entity.shadowBox.dispose) {
                    entity.shadowBox.dispose();
                }
                delete entity.shadowBox;
            }
            if (entity._debugCollider != null) {
                if (entity._debugCollider.dispose) {
                    entity._debugCollider.dispose();
                }
                delete entity._debugCollider;
            }
            if (entity._meshCollider != null) {
                entity._meshCollider = null;
            }
            if (entity._colliderType != null) {
                delete entity._colliderType;
            }
            if (entity._skinnedMesh != null) {
                delete entity._skinnedMesh;
            }
        }
    }
    static SearchTransformNodes(name, nodes, searchType = SearchType.ExactMatch) {
        let result = null;
        const search = (searchType != null) ? searchType : SearchType.ExactMatch;
        if (nodes != null && nodes.length > 0) {
            for (let i = 0; i < nodes.length; i++) {
                const mesh = nodes[i];
                if (search === SearchType.ExactMatch) {
                    if (mesh.name === name) {
                        result = mesh;
                        break;
                    }
                }
                else if (search === SearchType.StartsWith) {
                    if (Utilities.StartsWith(mesh.name, name)) {
                        result = mesh;
                        break;
                    }
                }
                else if (search === SearchType.EndsWith) {
                    if (Utilities.EndsWith(mesh.name, name)) {
                        result = mesh;
                        break;
                    }
                }
                else if (search === SearchType.IndexOf) {
                    if (mesh.name.indexOf(name) >= 0) {
                        result = mesh;
                        break;
                    }
                }
                else {
                    if (mesh.name === name) {
                        result = mesh;
                        break;
                    }
                }
            }
        }
        return result;
    }
    static SearchTransformNodeForTags(query, nodes) {
        let result = null;
        if (nodes != null && nodes.length > 0) {
            for (let i = 0; i < nodes.length; i++) {
                const mesh = nodes[i];
                if (mesh instanceof TransformNode) {
                    if (Tags.MatchesQuery(mesh, query)) {
                        result = mesh;
                        break;
                    }
                }
            }
        }
        return result;
    }
    static SearchAllTransformNodesForTags(query, nodes) {
        let result = null;
        if (nodes != null && nodes.length > 0) {
            for (let i = 0; i < nodes.length; i++) {
                const mesh = nodes[i];
                if (mesh instanceof TransformNode) {
                    if (Tags.MatchesQuery(mesh, query)) {
                        if (result == null)
                            result = [];
                        result.push(mesh);
                    }
                }
            }
        }
        return result;
    }
    static SearchTransformNodeForScript(klass, nodes) {
        let result = null;
        if (nodes != null && nodes.length > 0) {
            for (let i = 0; i < nodes.length; i++) {
                const mesh = nodes[i];
                if (mesh instanceof TransformNode) {
                    const scomponent = SceneManager.FindScriptComponent(mesh, klass);
                    if (scomponent != null) {
                        result = mesh;
                        break;
                    }
                }
            }
        }
        return result;
    }
    static SearchAllTransformNodesForScript(klass, nodes) {
        let result = null;
        if (nodes != null && nodes.length > 0) {
            for (let i = 0; i < nodes.length; i++) {
                const mesh = nodes[i];
                if (mesh instanceof TransformNode) {
                    const scomponent = SceneManager.FindScriptComponent(mesh, klass);
                    if (scomponent != null) {
                        if (result == null)
                            result = [];
                        result.push(mesh);
                    }
                }
            }
        }
        return result;
    }
    static CreateGuid(suffix = null) {
        let result = Tools.RandomId();
        if (!Utilities.IsNullOrEmpty(suffix)) {
            result += ("-" + suffix);
        }
        return result;
    }
    static ValidateTransformGuid(node) {
        if (node != null && node.metadata != null && node.metadata.toolkit != null && node.metadata.toolkit.guid != null && node.metadata.toolkit.guid !== "") {
            const guid = node.metadata.toolkit.guid;
            if (node.id !== guid) {
                node.id = guid;
            }
            delete node.metadata.toolkit.guid;
        }
    }
    static AddShadowCastersToLight(light, transforms, includeChildren = false) {
        const shadowgenerator = light.getShadowGenerator();
        if (shadowgenerator != null) {
            const shadowMap = shadowgenerator.getShadowMap();
            if (shadowMap != null) {
                for (let index = 0; index < transforms.length; index++) {
                    const shadowRoot = transforms[index];
                    if (shadowRoot instanceof AbstractMesh) {
                        if (light.includedOnlyMeshes != null && light.includedOnlyMeshes.length > 0) {
                            if (light.includedOnlyMeshes.indexOf(shadowRoot) < 0) {
                                light.includedOnlyMeshes.push(shadowRoot);
                            }
                        }
                        if (shadowMap.renderList == null)
                            shadowMap.renderList = [];
                        if (shadowMap.renderList.indexOf(shadowRoot) < 0) {
                            shadowMap.renderList.push(shadowRoot);
                        }
                    }
                    if (includeChildren === true) {
                        const shadowChildren = shadowRoot.getChildMeshes();
                        if (shadowChildren != null && shadowChildren.length > 0) {
                            shadowChildren.forEach((shadowChild) => {
                                if (light.includedOnlyMeshes != null && light.includedOnlyMeshes.length > 0) {
                                    if (light.includedOnlyMeshes.indexOf(shadowChild) < 0) {
                                        light.includedOnlyMeshes.push(shadowChild);
                                    }
                                }
                                if (shadowMap.renderList == null)
                                    shadowMap.renderList = [];
                                if (shadowMap.renderList.indexOf(shadowChild) < 0) {
                                    shadowMap.renderList.push(shadowChild);
                                }
                            });
                        }
                    }
                }
            }
        }
    }
    static RegisterInstancedMeshBuffers(mesh) {
        const buffers = (mesh.metadata != null && mesh.metadata.toolkit != null && mesh.metadata.toolkit.buffers != null) ? mesh.metadata.toolkit.buffers : null;
        if (buffers != null) {
            if (buffers.floats != null && buffers.floats.length > 0) {
                buffers.floats.forEach((fbuffer) => {
                    if (fbuffer.kind != null && fbuffer.kind !== "" && fbuffer.value != null) {
                        mesh.registerInstancedBuffer(fbuffer.kind, 1);
                        mesh.instancedBuffers[fbuffer.kind] = fbuffer.value;
                    }
                });
            }
            if (buffers.colors != null && buffers.colors.length > 0) {
                buffers.colors.forEach((cbuffer) => {
                    if (cbuffer.kind != null && cbuffer.kind !== "" && cbuffer.value != null) {
                        mesh.registerInstancedBuffer(cbuffer.kind, 4);
                        mesh.instancedBuffers[cbuffer.kind] = new Color4(cbuffer.value.r || 0, cbuffer.value.g || 0, cbuffer.value.b || 0, cbuffer.value.a || 1).toLinearSpace();
                    }
                });
            }
            if (buffers.vector2 != null && buffers.vector2.length > 0) {
                buffers.vector2.forEach((v2buffer) => {
                    if (v2buffer.kind != null && v2buffer.kind !== "" && v2buffer.value != null) {
                        mesh.registerInstancedBuffer(v2buffer.kind, 2);
                        mesh.instancedBuffers[v2buffer.kind] = new Vector2(v2buffer.value.x || 0, v2buffer.value.y || 0);
                    }
                });
            }
            if (buffers.vector3 != null && buffers.vector3.length > 0) {
                buffers.vector3.forEach((v3buffer) => {
                    if (v3buffer.kind != null && v3buffer.kind !== "" && v3buffer.value != null) {
                        mesh.registerInstancedBuffer(v3buffer.kind, 3);
                        mesh.instancedBuffers[v3buffer.kind] = new Vector3(v3buffer.value.x || 0, v3buffer.value.y || 0, v3buffer.value.z || 0);
                    }
                });
            }
            if (buffers.vector4 != null && buffers.vector4.length > 0) {
                buffers.vector4.forEach((v4buffer) => {
                    if (v4buffer.kind != null && v4buffer.kind !== "" && v4buffer.value != null) {
                        mesh.registerInstancedBuffer(v4buffer.kind, 4);
                        mesh.instancedBuffers[v4buffer.kind] = new Vector4(v4buffer.value.x || 0, v4buffer.value.y || 0, v4buffer.value.z || 0, v4buffer.value.w || 0);
                    }
                });
            }
        }
    }
    static CloneValue(source, destinationObject) {
        if (!source)
            return null;
        if (source instanceof Mesh)
            return null;
        if (source instanceof SubMesh) {
            return source.clone(destinationObject);
        }
        else if (source.clone) {
            return source.clone();
        }
        return source;
    }
    static CloneEntityMetadata(source) {
        let result = null;
        if (source != null) {
            let new_toolkit = null;
            if (source.toolkit != null) {
                const new_instance = source.toolkit.instance != null ? source.toolkit.instance : false;
                const new_visible = source.toolkit.visible != null ? source.toolkit.visible : true;
                const new_visibilty = source.toolkit.visibility != null ? source.toolkit.visibility : 1;
                const new_billboard = source.toolkit.billboard != null ? source.toolkit.billboard : 0;
                const new_tags = source.toolkit.tags != null ? source.toolkit.tags : "Untagged Layer0";
                const new_skin = source.toolkit.skin != null ? source.toolkit.skin : false;
                const new_bone = source.toolkit.bone != null ? source.toolkit.bone : null;
                const new_rootbone = source.toolkit.rootbone != null ? source.toolkit.rootbone : false;
                const new_rootpos = source.toolkit.rootpos != null ? source.toolkit.rootpos : null;
                const new_rootrot = source.toolkit.rootrot != null ? source.toolkit.rootrot : null;
                const new_group = source.toolkit.group != null ? source.toolkit.group : "Untagged";
                const new_layer = source.toolkit.layer != null ? source.toolkit.layer : 0;
                const new_layername = source.toolkit.layername != null ? source.toolkit.layername : "Default";
                const new_navigation = source.toolkit.navigation != null ? source.toolkit.navigation : null;
                const new_lightmapped = source.toolkit.lightmapped != null ? source.toolkit.lightmapped : false;
                const new_lightmapuvs = source.toolkit.lightmapuvs != null ? source.toolkit.lightmapuvs : null;
                const new_animator = source.toolkit.animator != null ? source.toolkit.animator : null;
                let new_physics = null;
                let new_renderer = null;
                let new_collision = null;
                let new_properties = null;
                if (source.toolkit.physics) {
                    new_physics = {};
                    Utilities.DeepCopyProperties(source.toolkit.physics, new_physics);
                }
                if (source.toolkit.renderer) {
                    new_renderer = {};
                    Utilities.DeepCopyProperties(source.toolkit.renderer, new_renderer);
                }
                if (source.toolkit.collision) {
                    new_collision = {};
                    Utilities.DeepCopyProperties(source.toolkit.collision, new_collision);
                }
                if (source.toolkit.properties) {
                    new_properties = {};
                    Utilities.DeepCopyProperties(source.toolkit.properties, new_properties);
                }
                let new_wheels = null;
                if (source.toolkit.wheels != null && source.toolkit.wheels.length > 0) {
                    new_wheels = [];
                    source.toolkit.wheels.forEach((wheel) => {
                        if (wheel != null) {
                            let new_wheel = {};
                            Utilities.DeepCopyProperties(wheel, new_wheel);
                            new_wheels.push(new_wheel);
                        }
                    });
                }
                let new_components = null;
                if (source.toolkit.components != null && source.toolkit.components.length > 0) {
                    new_components = [];
                    source.toolkit.components.forEach((comp) => {
                        if (comp != null) {
                            const new_comp = Utilities.FastJsonCopy(comp);
                            new_comp.instance = null;
                            new_components.push(new_comp);
                        }
                    });
                }
                new_toolkit = {};
                new_toolkit.parsed = false;
                new_toolkit.prefab = false;
                new_toolkit.buffers = null;
                new_toolkit.lods = null;
                new_toolkit.coverages = null;
                new_toolkit.distances = null;
                new_toolkit.handlers = null;
                new_toolkit.instance = new_instance;
                new_toolkit.visible = new_visible;
                new_toolkit.visibility = new_visibilty;
                new_toolkit.billboard = new_billboard;
                new_toolkit.tags = new_tags;
                new_toolkit.skin = new_skin;
                new_toolkit.bone = new_bone;
                new_toolkit.rootbone = new_rootbone;
                new_toolkit.rootpos = new_rootpos;
                new_toolkit.rootrot = new_rootrot;
                new_toolkit.group = new_group;
                new_toolkit.layer = new_layer;
                new_toolkit.layername = new_layername;
                new_toolkit.navigation = new_navigation;
                new_toolkit.lightmapped = new_lightmapped;
                new_toolkit.lightmapuvs = new_lightmapuvs;
                new_toolkit.animator = new_animator;
                new_toolkit.renderer = new_renderer;
                new_toolkit.physics = new_physics;
                new_toolkit.wheels = new_wheels;
                new_toolkit.collision = new_collision;
                new_toolkit.properties = new_properties;
                new_toolkit.components = new_components;
            }
            if (new_toolkit != null)
                result = { toolkit: new_toolkit };
        }
        return result;
    }
    static FastJsonCopy(val) {
        if (!val)
            return val;
        if (Array.isArray(val)) {
            var arr = [];
            var length = val.length;
            for (var i = 0; i < length; i++)
                arr.push(Utilities.FastJsonCopy(val[i]));
            return arr;
        }
        else if (typeof val === 'object') {
            var keys = Object.keys(val);
            var newObject = {};
            for (var i = keys.length - 1; i > -1; i--) {
                var key = keys[i];
                newObject[key] = Utilities.FastJsonCopy(val[key]);
            }
            return newObject;
        }
        return val;
    }
    static DeepCopyProperties(source, destination, doNotCopyList, mustCopyList) {
        for (let prop in source) {
            if (prop[0] === "_" && (!mustCopyList || mustCopyList.indexOf(prop) === -1)) {
                continue;
            }
            if (doNotCopyList && doNotCopyList.indexOf(prop) !== -1) {
                continue;
            }
            let sourceValue = source[prop];
            let typeOfSourceValue = typeof sourceValue;
            if (typeOfSourceValue === "function") {
                continue;
            }
            if (typeOfSourceValue === "object") {
                if (sourceValue instanceof Array) {
                    destination[prop] = [];
                    if (sourceValue.length > 0) {
                        if (typeof sourceValue[0] == "object") {
                            for (let index = 0; index < sourceValue.length; index++) {
                                let clonedValue = Utilities.CloneValue(sourceValue[index], destination);
                                if (destination[prop].indexOf(clonedValue) === -1) {
                                    destination[prop].push(clonedValue);
                                }
                            }
                        }
                        else {
                            destination[prop] = sourceValue.slice(0);
                        }
                    }
                }
                else {
                    destination[prop] = Utilities.CloneValue(sourceValue, destination);
                }
            }
            else {
                destination[prop] = sourceValue;
            }
        }
    }
    static ValidateTransformMetadata(transform) {
        if (transform.metadata == null)
            transform.metadata = {};
        if (transform.metadata.toolkit == null)
            transform.metadata.toolkit = {};
        const metadata = transform.metadata.toolkit;
        if (!Utilities.HasOwnProperty(metadata, "entity"))
            transform.metadata.toolkit.entity = true;
        if (!Utilities.HasOwnProperty(metadata, "parsed"))
            transform.metadata.toolkit.parsed = false;
        if (!Utilities.HasOwnProperty(metadata, "prefab"))
            transform.metadata.toolkit.prefab = false;
        if (!Utilities.HasOwnProperty(metadata, "instance"))
            transform.metadata.toolkit.instance = false;
        if (!Utilities.HasOwnProperty(metadata, "buffers"))
            transform.metadata.toolkit.buffers = null;
        if (!Utilities.HasOwnProperty(metadata, "visible"))
            transform.metadata.toolkit.visible = true;
        if (!Utilities.HasOwnProperty(metadata, "visibility"))
            transform.metadata.toolkit.visibility = 1;
        if (!Utilities.HasOwnProperty(metadata, "billboard"))
            transform.metadata.toolkit.billboard = 0;
        if (!Utilities.HasOwnProperty(metadata, "tags"))
            transform.metadata.toolkit.tags = "Untagged Layer0";
        if (!Utilities.HasOwnProperty(metadata, "skin"))
            transform.metadata.toolkit.skin = false;
        if (!Utilities.HasOwnProperty(metadata, "bone"))
            transform.metadata.toolkit.bone = null;
        if (!Utilities.HasOwnProperty(metadata, "rootbone"))
            transform.metadata.toolkit.rootbone = false;
        if (!Utilities.HasOwnProperty(metadata, "rootpos"))
            transform.metadata.toolkit.rootpos = null;
        if (!Utilities.HasOwnProperty(metadata, "rootrot"))
            transform.metadata.toolkit.rootrot = null;
        if (!Utilities.HasOwnProperty(metadata, "group"))
            transform.metadata.toolkit.group = "Untagged";
        if (!Utilities.HasOwnProperty(metadata, "layer"))
            transform.metadata.toolkit.layer = 0;
        if (!Utilities.HasOwnProperty(metadata, "layername"))
            transform.metadata.toolkit.layername = "Default";
        if (!Utilities.HasOwnProperty(metadata, "navigation"))
            transform.metadata.toolkit.navigation = null;
        if (!Utilities.HasOwnProperty(metadata, "lightmapped"))
            transform.metadata.toolkit.lightmapped = false;
        if (!Utilities.HasOwnProperty(metadata, "lightmapuvs"))
            transform.metadata.toolkit.lightmapuvs = false;
        if (!Utilities.HasOwnProperty(metadata, "animator"))
            transform.metadata.toolkit.animator = null;
        if (!Utilities.HasOwnProperty(metadata, "lods"))
            transform.metadata.toolkit.lods = null;
        if (!Utilities.HasOwnProperty(metadata, "coverages"))
            transform.metadata.toolkit.coverages = null;
        if (!Utilities.HasOwnProperty(metadata, "distances"))
            transform.metadata.toolkit.distances = null;
        if (!Utilities.HasOwnProperty(metadata, "handlers"))
            transform.metadata.toolkit.handlers = null;
        if (!Utilities.HasOwnProperty(metadata, "physics"))
            transform.metadata.toolkit.physics = null;
        if (!Utilities.HasOwnProperty(metadata, "wheels"))
            transform.metadata.toolkit.wheels = null;
        if (!Utilities.HasOwnProperty(metadata, "renderer"))
            transform.metadata.toolkit.renderer = null;
        if (!Utilities.HasOwnProperty(metadata, "collision"))
            transform.metadata.toolkit.collision = null;
        if (!Utilities.HasOwnProperty(metadata, "properties"))
            transform.metadata.toolkit.properties = null;
        if (!Utilities.HasOwnProperty(metadata, "components"))
            transform.metadata.toolkit.components = null;
    }
}
Utilities.UpVector = Vector3.Up();
Utilities.AuxVector = Vector3.Zero();
Utilities.ZeroVector = Vector3.Zero();
Utilities.TempMatrix = Matrix.Zero();
Utilities.TempMatrix2 = Matrix.Zero();
Utilities.TempVector2 = Vector2.Zero();
Utilities.TempVector3 = Vector3.Zero();
Utilities.TempQuaternion = Quaternion.Zero();
Utilities.TempQuaternion2 = Quaternion.Zero();
Utilities.TempQuaternion3 = Quaternion.Zero();
Utilities.TempDirectionBuffer = Vector3.Zero();
Utilities.LoadingState = -1;
Utilities.OnPreloaderProgress = null;
Utilities.OnPreloaderComplete = null;
Utilities.LoaderItemsMarkedForDisposal = [];
export var DragDirection;
(function (DragDirection) {
    DragDirection[DragDirection["None"] = 0] = "None";
    DragDirection[DragDirection["Up"] = 1] = "Up";
    DragDirection[DragDirection["Down"] = 2] = "Down";
    DragDirection[DragDirection["Right"] = 3] = "Right";
    DragDirection[DragDirection["Left"] = 4] = "Left";
})(DragDirection || (DragDirection = {}));
export var PinchZoomState;
(function (PinchZoomState) {
    PinchZoomState[PinchZoomState["None"] = 0] = "None";
    PinchZoomState[PinchZoomState["ZoomIn"] = 1] = "ZoomIn";
    PinchZoomState[PinchZoomState["ZoomOut"] = 2] = "ZoomOut";
})(PinchZoomState || (PinchZoomState = {}));
export class InputController {
    static GetMouseButtonsDown() { return InputController.mouseButtonsDown; }
    static GetLeftButtonDown() { return InputController.leftButtonDown; }
    static GetMiddleButtonDown() { return InputController.middleButtonDown; }
    static GetRightButtonDown() { return InputController.rightButtonDown; }
    static GetMouseDownTarget() { return InputController.mouseDownTarget; }
    static GetMouseDragTarget() { return InputController.mouseDragTarget; }
    static GetPinchZoomState() { return InputController.pinchZoomState; }
    static EnableUserInput(engine, scene, options = null) {
        InputController.ConfigureUserInput(engine, scene, options);
    }
    static ConfigureUserInput(engine, scene, options = null) {
        const contextMenu = (options != null && options.contextMenu != null) ? options.contextMenu : true;
        const pointerLock = (options != null && options.pointerLock != null) ? options.pointerLock : false;
        const preventDefault = (options != null && options.preventDefault != null) ? options.preventDefault : false;
        const useCapture = (options != null && options.useCapture != null) ? options.useCapture : false;
        InputController.resetUserInput();
        if (!InputController.input) {
            document.documentElement.tabIndex = 1;
            document.documentElement.addEventListener("keyup", InputController.inputKeyUpHandler, useCapture);
            document.documentElement.addEventListener("pointerup", InputController.inputPointerUpHandler, useCapture);
            document.documentElement.addEventListener("pointerout", InputController.inputPointerUpHandler, useCapture);
            document.documentElement.addEventListener("pointerleave", InputController.inputPointerUpHandler, useCapture);
            document.documentElement.addEventListener("pointercancel", InputController.inputPointerUpHandler, useCapture);
            const canvasElement = document.getElementById("renderingCanvas") || engine.getRenderingCanvas();
            if (canvasElement != null) {
                if (contextMenu === true) {
                    canvasElement.oncontextmenu = null;
                }
                else {
                    canvasElement.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); };
                }
            }
            if (UserInputOptions.UseCanvasElement === true) {
                canvasElement.tabIndex = 2;
                canvasElement.addEventListener("focusout", InputController.resetKeyMapHandler, useCapture);
                canvasElement.addEventListener("keydown", InputController.inputKeyDownHandler, useCapture);
                canvasElement.addEventListener("pointerdown", InputController.inputPointerDownHandler, useCapture);
                canvasElement.addEventListener("pointermove", InputController.inputPointerMoveHandler, useCapture);
                canvasElement.addEventListener("onwheel" in document ? "wheel" : "mousewheel", InputController.inputPointerWheelHandler, useCapture);
            }
            else {
                document.documentElement.addEventListener("focusout", InputController.resetKeyMapHandler, useCapture);
                document.documentElement.addEventListener("keydown", InputController.inputKeyDownHandler, useCapture);
                document.documentElement.addEventListener("pointerdown", InputController.inputPointerDownHandler, useCapture);
                document.documentElement.addEventListener("pointermove", InputController.inputPointerMoveHandler, useCapture);
                document.documentElement.addEventListener("onwheel" in document ? "wheel" : "mousewheel", InputController.inputPointerWheelHandler, useCapture);
            }
            InputController.preventDefault = preventDefault;
            if (InputController.GamepadManager == null) {
                InputController.GamepadManager = new GamepadManager();
                InputController.GamepadManager.onGamepadConnectedObservable.add(InputController.inputManagerGamepadConnected);
                InputController.GamepadManager.onGamepadDisconnectedObservable.add(InputController.inputManagerGamepadDisconnected);
            }
            InputController.input = true;
            document.documentElement.focus();
            if (pointerLock === true)
                InputController.LockMousePointer(scene, true);
        }
        scene.registerAfterRender(() => { InputController.updateUserInput(scene); });
    }
    static SetLeftJoystickBuffer(leftStickX, leftStickY, invertY = true) {
        InputController.j_horizontal = leftStickX;
        InputController.j_vertical = (invertY === true) ? -leftStickY : leftStickY;
    }
    static SetRightJoystickBuffer(rightStickX, rightStickY, invertY = true) {
        InputController.j_mousex = rightStickX;
        InputController.j_mousey = (invertY === true) ? -rightStickY : rightStickY;
    }
    static DisableUserInput(scene, useCapture = false) {
        InputController.LockMousePointer(scene, false);
        InputController.resetUserInput();
    }
    static LockMousePointer(scene, lock) {
        if (lock === true) {
            InputController.LockMousePointerObserver = scene.onPointerObservable.add((eventData, eventState) => {
                if (eventData.type == PointerEventTypes.POINTERDOWN) {
                    if (!document.pointerLockElement) {
                        SceneManager.GetEngine(scene)?.enterPointerlock();
                    }
                }
            });
        }
        else {
            if (InputController.IsPointerLockHandled()) {
                scene.onPointerObservable.remove(InputController.LockMousePointerObserver);
                InputController.LockMousePointerObserver = null;
            }
        }
    }
    static IsPointerLocked() { return InputController.PointerLockedFlag; }
    static IsPointerLockHandled() { return (InputController.LockMousePointerObserver != null); }
    static GetUserInput(input, player = PlayerNumber.One) {
        let result = 0;
        if (InputController.input) {
            switch (input) {
                case UserInputAxis.Vertical:
                case UserInputAxis.Horizontal:
                    if (player === PlayerNumber.Four) {
                        result = (input === UserInputAxis.Horizontal) ? InputController.horizontal4 : InputController.vertical4;
                    }
                    else if (player === PlayerNumber.Three) {
                        result = (input === UserInputAxis.Horizontal) ? InputController.horizontal3 : InputController.vertical3;
                    }
                    else if (player === PlayerNumber.Two) {
                        result = (input === UserInputAxis.Horizontal) ? InputController.horizontal2 : InputController.vertical2;
                    }
                    else {
                        result = (input === UserInputAxis.Horizontal) ? InputController.horizontal : InputController.vertical;
                    }
                    break;
                case UserInputAxis.MouseX:
                case UserInputAxis.MouseY:
                    if (player === PlayerNumber.Four) {
                        result = (input === UserInputAxis.MouseX) ? InputController.mousex4 : InputController.mousey4;
                    }
                    else if (player === PlayerNumber.Three) {
                        result = (input === UserInputAxis.MouseX) ? InputController.mousex3 : InputController.mousey3;
                    }
                    else if (player === PlayerNumber.Two) {
                        result = (input === UserInputAxis.MouseX) ? InputController.mousex2 : InputController.mousey2;
                    }
                    else {
                        result = (input === UserInputAxis.MouseX) ? InputController.mousex : InputController.mousey;
                    }
                    break;
                case UserInputAxis.Wheel:
                    if (player === PlayerNumber.One) {
                        result = InputController.wheel;
                    }
                    break;
            }
        }
        return result;
    }
    static OnKeyboardUp(callback) {
        if (InputController.input)
            InputController.keyButtonUp.push(callback);
    }
    static OnKeyboardDown(callback) {
        if (InputController.input)
            InputController.keyButtonDown.push(callback);
    }
    static OnKeyboardPress(keycode, callback) {
        if (InputController.input)
            InputController.keyButtonPress.push({ index: keycode, action: callback });
    }
    static GetKeyboardInput(keycode) {
        let result = false;
        if (InputController.input) {
            let key = "k:" + keycode.toString();
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                result = (keymapState.result != null) ? keymapState.result : false;
            }
        }
        return result;
    }
    static IsKeyboardButtonHeld(keycode) {
        let result = false;
        if (InputController.input) {
            let key = "k:" + keycode.toString();
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                if (keymapState.pressTime != null && keymapState.releaseTime != null) {
                    const pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true && keymapState.pressTime > 0 && keymapState.releaseTime === 0) {
                        const elapsed = SceneManager.GetTimeMs() - keymapState.pressTime;
                        result = (elapsed >= InputController.TAP_THRESHOLD_MS);
                    }
                }
            }
        }
        return result;
    }
    static WasKeyboardButtonTapped(keycode, reset = true) {
        let result = false;
        if (InputController.input) {
            let key = "k:" + keycode.toString();
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                if (keymapState.pressTime != null && keymapState.releaseTime != null) {
                    const pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false && keymapState.pressTime > 0 && keymapState.releaseTime > 0) {
                        const elapsed = keymapState.releaseTime - keymapState.pressTime;
                        result = (elapsed < InputController.TAP_THRESHOLD_MS);
                    }
                }
            }
            if (reset === true)
                InputController.ResetKeyboardButtonTapped(keycode);
        }
        return result;
    }
    static ResetKeyboardButtonTapped(keycode) {
        if (InputController.input) {
            let key = "k:" + keycode.toString();
            if (InputController.keymap[key] != null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
        }
    }
    static OnPointerUp(callback) {
        if (InputController.input)
            InputController.mouseButtonUp.push(callback);
    }
    static OnPointerDown(callback) {
        if (InputController.input)
            InputController.mouseButtonDown.push(callback);
    }
    static OnPointerPress(button, callback) {
        if (InputController.input)
            InputController.mouseButtonPress.push({ index: button, action: callback });
    }
    static GetPointerInput(button) {
        let result = false;
        if (InputController.input) {
            let key = "p:" + button.toString();
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                result = (keymapState.result != null) ? keymapState.result : false;
            }
        }
        return result;
    }
    static IsPointerButtonHeld(button) {
        let result = false;
        if (InputController.input) {
            let key = "p:" + button.toString();
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                if (keymapState.pressTime != null && keymapState.releaseTime != null) {
                    const pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true && keymapState.pressTime > 0 && keymapState.releaseTime === 0) {
                        const elapsed = SceneManager.GetTimeMs() - keymapState.pressTime;
                        result = (elapsed >= InputController.TAP_THRESHOLD_MS);
                    }
                }
            }
        }
        return result;
    }
    static WasPointerButtonTapped(number, reset = true) {
        let result = false;
        if (InputController.input) {
            let key = "p:" + number.toString();
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                if (keymapState.pressTime != null && keymapState.releaseTime != null) {
                    const pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false && keymapState.pressTime > 0 && keymapState.releaseTime > 0) {
                        const elapsed = keymapState.releaseTime - keymapState.pressTime;
                        result = (elapsed < InputController.TAP_THRESHOLD_MS);
                    }
                }
            }
            if (reset === true)
                InputController.ResetPointerButtonTapped(number);
        }
        return result;
    }
    static ResetPointerButtonTapped(button) {
        if (InputController.input) {
            let key = "p:" + button.toString();
            if (InputController.keymap[key] != null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
        }
    }
    static GetPointerDragDirection(mousex, mousey, buttondown) {
        if (buttondown === true) {
            if (mousex !== 0 || mousey !== 0) {
                if (Math.abs(mousex) > Math.abs(mousey)) {
                    if (mousex > 0) {
                        InputController.dragDirection = DragDirection.Right;
                    }
                    else if (mousex < 0) {
                        InputController.dragDirection = DragDirection.Left;
                    }
                }
                else {
                    if (mousey > 0) {
                        InputController.dragDirection = DragDirection.Up;
                    }
                    else if (mousey < 0) {
                        InputController.dragDirection = DragDirection.Down;
                    }
                }
            }
        }
        else {
            InputController.dragDirection = DragDirection.None;
        }
        return InputController.dragDirection;
    }
    static ResetPinchZoomTracking() {
        InputController.pinchZoomState = 0;
        InputController.pinchZoomEvents = [];
        InputController.pinchZoomDistance = null;
    }
    static IsWheelScrolling() {
        return (InputController.scroll !== 0);
    }
    static OnGamepadButtonUp(callback, player = PlayerNumber.One) {
        if (InputController.input) {
            switch (player) {
                case PlayerNumber.One:
                    InputController.gamepad1ButtonUp.push(callback);
                    break;
                case PlayerNumber.Two:
                    InputController.gamepad2ButtonUp.push(callback);
                    break;
                case PlayerNumber.Three:
                    InputController.gamepad3ButtonUp.push(callback);
                    break;
                case PlayerNumber.Four:
                    InputController.gamepad4ButtonUp.push(callback);
                    break;
            }
        }
    }
    static OnGamepadButtonDown(callback, player = PlayerNumber.One) {
        if (InputController.input) {
            switch (player) {
                case PlayerNumber.One:
                    InputController.gamepad1ButtonDown.push(callback);
                    break;
                case PlayerNumber.Two:
                    InputController.gamepad2ButtonDown.push(callback);
                    break;
                case PlayerNumber.Three:
                    InputController.gamepad3ButtonDown.push(callback);
                    break;
                case PlayerNumber.Four:
                    InputController.gamepad4ButtonDown.push(callback);
                    break;
            }
        }
    }
    static OnGamepadButtonPress(button, callback, player = PlayerNumber.One) {
        if (InputController.input) {
            switch (player) {
                case PlayerNumber.One:
                    InputController.gamepad1ButtonPress.push({ index: button, action: callback });
                    break;
                case PlayerNumber.Two:
                    InputController.gamepad2ButtonPress.push({ index: button, action: callback });
                    break;
                case PlayerNumber.Three:
                    InputController.gamepad3ButtonPress.push({ index: button, action: callback });
                    break;
                case PlayerNumber.Four:
                    InputController.gamepad4ButtonPress.push({ index: button, action: callback });
                    break;
            }
        }
    }
    static GetGamepadButtonInput(button, player = PlayerNumber.One) {
        let result = false;
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "b1:" + button.toString();
                    break;
                case PlayerNumber.Two:
                    key = "b2:" + button.toString();
                    break;
                case PlayerNumber.Three:
                    key = "b3:" + button.toString();
                    break;
                case PlayerNumber.Four:
                    key = "b4:" + button.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                result = (keymapState.result != null) ? keymapState.result : false;
            }
        }
        return result;
    }
    static IsGamepadButtonHeld(button, player = PlayerNumber.One) {
        let result = false;
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "b1:" + button.toString();
                    break;
                case PlayerNumber.Two:
                    key = "b2:" + button.toString();
                    break;
                case PlayerNumber.Three:
                    key = "b3:" + button.toString();
                    break;
                case PlayerNumber.Four:
                    key = "b4:" + button.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                if (keymapState.pressTime != null && keymapState.releaseTime != null) {
                    const pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true && keymapState.pressTime > 0 && keymapState.releaseTime === 0) {
                        const elapsed = SceneManager.GetTimeMs() - keymapState.pressTime;
                        result = (elapsed >= InputController.TAP_THRESHOLD_MS);
                    }
                }
            }
        }
        return result;
    }
    static IsGamepadButtonTapped(button, player = PlayerNumber.One) {
        let result = false;
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "b1:" + button.toString();
                    break;
                case PlayerNumber.Two:
                    key = "b2:" + button.toString();
                    break;
                case PlayerNumber.Three:
                    key = "b3:" + button.toString();
                    break;
                case PlayerNumber.Four:
                    key = "b4:" + button.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                if (keymapState.pressTime != null && keymapState.releaseTime != null) {
                    const pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false && keymapState.pressTime > 0 && keymapState.releaseTime > 0) {
                        const elapsed = keymapState.releaseTime - keymapState.pressTime;
                        result = (elapsed < InputController.TAP_THRESHOLD_MS);
                    }
                }
            }
        }
        return result;
    }
    static ResetGamepadButtonTapped(button, player = PlayerNumber.One) {
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "b1:" + button.toString();
                    break;
                case PlayerNumber.Two:
                    key = "b2:" + button.toString();
                    break;
                case PlayerNumber.Three:
                    key = "b3:" + button.toString();
                    break;
                case PlayerNumber.Four:
                    key = "b4:" + button.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
        }
    }
    static OnGamepadDirectionUp(callback, player = PlayerNumber.One) {
        if (InputController.input) {
            switch (player) {
                case PlayerNumber.One:
                    InputController.gamepad1DpadUp.push(callback);
                    break;
                case PlayerNumber.Two:
                    InputController.gamepad2DpadUp.push(callback);
                    break;
                case PlayerNumber.Three:
                    InputController.gamepad3DpadUp.push(callback);
                    break;
                case PlayerNumber.Four:
                    InputController.gamepad4DpadUp.push(callback);
                    break;
            }
        }
    }
    static OnGamepadDirectionDown(callback, player = PlayerNumber.One) {
        if (InputController.input) {
            switch (player) {
                case PlayerNumber.One:
                    InputController.gamepad1DpadDown.push(callback);
                    break;
                case PlayerNumber.Two:
                    InputController.gamepad2DpadDown.push(callback);
                    break;
                case PlayerNumber.Three:
                    InputController.gamepad3DpadDown.push(callback);
                    break;
                case PlayerNumber.Four:
                    InputController.gamepad4DpadDown.push(callback);
                    break;
            }
        }
    }
    static OnGamepadDirectionPress(direction, callback, player = PlayerNumber.One) {
        if (InputController.input) {
            switch (player) {
                case PlayerNumber.One:
                    InputController.gamepad1DpadPress.push({ index: direction, action: callback });
                    break;
                case PlayerNumber.Two:
                    InputController.gamepad2DpadPress.push({ index: direction, action: callback });
                    break;
                case PlayerNumber.Three:
                    InputController.gamepad3DpadPress.push({ index: direction, action: callback });
                    break;
                case PlayerNumber.Four:
                    InputController.gamepad4DpadPress.push({ index: direction, action: callback });
                    break;
            }
        }
    }
    static GetGamepadDirectionInput(direction, player = PlayerNumber.One) {
        let result = false;
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "d1:" + direction.toString();
                    break;
                case PlayerNumber.Two:
                    key = "d2:" + direction.toString();
                    break;
                case PlayerNumber.Three:
                    key = "d3:" + direction.toString();
                    break;
                case PlayerNumber.Four:
                    key = "d4:" + direction.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                result = (keymapState.result != null) ? keymapState.result : false;
            }
        }
        return result;
    }
    static IsGamepadDirectionHeld(direction, player = PlayerNumber.One) {
        let result = false;
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "d1:" + direction.toString();
                    break;
                case PlayerNumber.Two:
                    key = "d2:" + direction.toString();
                    break;
                case PlayerNumber.Three:
                    key = "d3:" + direction.toString();
                    break;
                case PlayerNumber.Four:
                    key = "d4:" + direction.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                if (keymapState.pressTime != null && keymapState.releaseTime != null) {
                    const pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true && keymapState.pressTime > 0 && keymapState.releaseTime === 0) {
                        const elapsed = SceneManager.GetTimeMs() - keymapState.pressTime;
                        result = (elapsed >= InputController.TAP_THRESHOLD_MS);
                    }
                }
            }
        }
        return result;
    }
    static IsGamepadDirectionTapped(direction, player = PlayerNumber.One) {
        let result = false;
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "d1:" + direction.toString();
                    break;
                case PlayerNumber.Two:
                    key = "d2:" + direction.toString();
                    break;
                case PlayerNumber.Three:
                    key = "d3:" + direction.toString();
                    break;
                case PlayerNumber.Four:
                    key = "d4:" + direction.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                if (keymapState.pressTime != null && keymapState.releaseTime != null) {
                    const pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false && keymapState.pressTime > 0 && keymapState.releaseTime > 0) {
                        const elapsed = keymapState.releaseTime - keymapState.pressTime;
                        result = (elapsed < InputController.TAP_THRESHOLD_MS);
                    }
                }
            }
        }
        return result;
    }
    static ResetGamepadDirectionTapped(direction, player = PlayerNumber.One) {
        let result = false;
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "d1:" + direction.toString();
                    break;
                case PlayerNumber.Two:
                    key = "d2:" + direction.toString();
                    break;
                case PlayerNumber.Three:
                    key = "d3:" + direction.toString();
                    break;
                case PlayerNumber.Four:
                    key = "d4:" + direction.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
        }
    }
    static OnGamepadTriggerLeft(callback, player = PlayerNumber.One) {
        if (InputController.input) {
            switch (player) {
                case PlayerNumber.One:
                    InputController.gamepad1LeftTrigger.push(callback);
                    break;
                case PlayerNumber.Two:
                    InputController.gamepad2LeftTrigger.push(callback);
                    break;
                case PlayerNumber.Three:
                    InputController.gamepad3LeftTrigger.push(callback);
                    break;
                case PlayerNumber.Four:
                    InputController.gamepad4LeftTrigger.push(callback);
                    break;
            }
        }
    }
    static OnGamepadTriggerRight(callback, player = PlayerNumber.One) {
        if (InputController.input) {
            switch (player) {
                case PlayerNumber.One:
                    InputController.gamepad1RightTrigger.push(callback);
                    break;
                case PlayerNumber.Two:
                    InputController.gamepad2RightTrigger.push(callback);
                    break;
                case PlayerNumber.Three:
                    InputController.gamepad3RightTrigger.push(callback);
                    break;
                case PlayerNumber.Four:
                    InputController.gamepad4RightTrigger.push(callback);
                    break;
            }
        }
    }
    static GetGamepadTriggerInput(trigger, player = PlayerNumber.One) {
        let result = 0;
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "t1:" + trigger.toString();
                    break;
                case PlayerNumber.Two:
                    key = "t2:" + trigger.toString();
                    break;
                case PlayerNumber.Three:
                    key = "t3:" + trigger.toString();
                    break;
                case PlayerNumber.Four:
                    key = "t4:" + trigger.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                result = (keymapState.result != null) ? keymapState.result : 0;
            }
        }
        return result;
    }
    static IsGamepadTriggerHeld(trigger, player = PlayerNumber.One) {
        let result = false;
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "t1:" + trigger.toString();
                    break;
                case PlayerNumber.Two:
                    key = "t2:" + trigger.toString();
                    break;
                case PlayerNumber.Three:
                    key = "t3:" + trigger.toString();
                    break;
                case PlayerNumber.Four:
                    key = "t4:" + trigger.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                if (keymapState.pressTime != null && keymapState.releaseTime != null) {
                    const pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true && keymapState.pressTime > 0 && keymapState.releaseTime === 0) {
                        const elapsed = SceneManager.GetTimeMs() - keymapState.pressTime;
                        result = (elapsed >= InputController.TAP_THRESHOLD_MS);
                    }
                }
            }
        }
        return result;
    }
    static IsGamepadTriggerTapped(trigger, player = PlayerNumber.One) {
        let result = false;
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "t1:" + trigger.toString();
                    break;
                case PlayerNumber.Two:
                    key = "t2:" + trigger.toString();
                    break;
                case PlayerNumber.Three:
                    key = "t3:" + trigger.toString();
                    break;
                case PlayerNumber.Four:
                    key = "t4:" + trigger.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                if (keymapState.pressTime != null && keymapState.releaseTime != null) {
                    const pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false && keymapState.pressTime > 0 && keymapState.releaseTime > 0) {
                        const elapsed = keymapState.releaseTime - keymapState.pressTime;
                        result = (elapsed < InputController.TAP_THRESHOLD_MS);
                    }
                }
            }
        }
        return result;
    }
    static ResetGamepadTriggerTapped(trigger, player = PlayerNumber.One) {
        if (InputController.input) {
            let key = null;
            switch (player) {
                case PlayerNumber.One:
                    key = "t1:" + trigger.toString();
                    break;
                case PlayerNumber.Two:
                    key = "t2:" + trigger.toString();
                    break;
                case PlayerNumber.Three:
                    key = "t3:" + trigger.toString();
                    break;
                case PlayerNumber.Four:
                    key = "t4:" + trigger.toString();
                    break;
            }
            if (key != null && InputController.keymap[key] != null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
        }
    }
    static GetGamepadType(player = PlayerNumber.One) {
        let type = GamepadType.None;
        if (InputController.input) {
            switch (player) {
                case PlayerNumber.One:
                    type = InputController.gamepad1Type;
                    break;
                case PlayerNumber.Two:
                    type = InputController.gamepad2Type;
                    break;
                case PlayerNumber.Three:
                    type = InputController.gamepad3Type;
                    break;
                case PlayerNumber.Four:
                    type = InputController.gamepad4Type;
                    break;
            }
        }
        return type;
    }
    static GetGamepad(player = PlayerNumber.One) {
        let pad = null;
        if (InputController.input) {
            switch (player) {
                case PlayerNumber.One:
                    pad = InputController.gamepad1;
                    break;
                case PlayerNumber.Two:
                    pad = InputController.gamepad2;
                    break;
                case PlayerNumber.Three:
                    pad = InputController.gamepad3;
                    break;
                case PlayerNumber.Four:
                    pad = InputController.gamepad4;
                    break;
            }
        }
        return pad;
    }
    static InputKeyDownHandler(keyCode, event = null) {
        if (keyCode == null || SceneManager.EnableUserInput === false)
            return false;
        if (event)
            event.preventDefault();
        let key = "k:" + keyCode.toString();
        let pressed = false;
        if (InputController.keymap[key] == null) {
            InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
        }
        if (InputController.keymap[key] != null) {
            const keymapState = InputController.keymap[key];
            pressed = (keymapState.result != null) ? keymapState.result : false;
            if (pressed === false) {
                keymapState.result = true;
                keymapState.pressTime = SceneManager.GetTimeMs();
                keymapState.releaseTime = 0;
            }
        }
        if (InputController.keyButtonDown != null && InputController.keyButtonDown.length > 0) {
            InputController.keyButtonDown.forEach((callback) => {
                callback(keyCode);
            });
        }
        if (!pressed) {
            if (InputController.keyButtonPress != null && InputController.keyButtonPress.length > 0) {
                InputController.keyButtonPress.forEach((press) => {
                    if (press.index === keyCode) {
                        press.action();
                    }
                });
            }
        }
        return true;
    }
    static InputKeyUpHandler(keyCode, event = null) {
        if (keyCode == null || SceneManager.EnableUserInput === false)
            return false;
        let key = "k:" + keyCode.toString();
        let pressed = false;
        if (InputController.keymap[key] != null) {
            const keymapState = InputController.keymap[key];
            pressed = (keymapState.result != null) ? keymapState.result : false;
            if (pressed === true) {
                keymapState.result = false;
                keymapState.releaseTime = SceneManager.GetTimeMs();
            }
        }
        if (InputController.keyButtonUp != null && InputController.keyButtonUp.length > 0) {
            InputController.keyButtonUp.forEach((callback) => {
                callback(keyCode);
            });
        }
        return true;
    }
    static tickKeyboardInput(scene) {
        if (SceneManager.EnableUserInput === false)
            return;
        const forward = InputController.GetKeyboardInput(UserInputKey.W) || InputController.GetKeyboardInput(UserInputKey.UpArrow);
        const left = InputController.GetKeyboardInput(UserInputKey.A);
        const back = InputController.GetKeyboardInput(UserInputKey.S) || InputController.GetKeyboardInput(UserInputKey.DownArrow);
        const right = InputController.GetKeyboardInput(UserInputKey.D);
        const aleft = InputController.GetKeyboardInput(UserInputKey.LeftArrow);
        const aright = InputController.GetKeyboardInput(UserInputKey.RightArrow);
        if (forward === true) {
            InputController.k_vertical = Utilities.GetKeyboardInputValue(scene, InputController.k_vertical, 1);
        }
        else if (back === true) {
            InputController.k_vertical = Utilities.GetKeyboardInputValue(scene, InputController.k_vertical, -1);
        }
        else {
            InputController.k_vertical = 0;
        }
        if (UserInputOptions.UseArrowKeyRotation === true) {
            if (right === true) {
                InputController.k_horizontal = Utilities.GetKeyboardInputValue(scene, InputController.k_horizontal, 1);
            }
            else if (left === true) {
                InputController.k_horizontal = Utilities.GetKeyboardInputValue(scene, InputController.k_horizontal, -1);
            }
            else {
                InputController.k_horizontal = 0;
            }
            if (aright === true) {
                InputController.a_mousex = (1 * UserInputOptions.KeyboardArrowSensibility);
            }
            else if (aleft === true) {
                InputController.a_mousex = (-1 * UserInputOptions.KeyboardArrowSensibility);
            }
            else {
                InputController.a_mousex = 0;
            }
        }
        else {
            if (right === true || aright === true) {
                InputController.k_horizontal = Utilities.GetKeyboardInputValue(scene, InputController.k_horizontal, 1);
            }
            else if (left === true || aleft === true) {
                InputController.k_horizontal = Utilities.GetKeyboardInputValue(scene, InputController.k_horizontal, -1);
            }
            else {
                InputController.k_horizontal = 0;
            }
        }
    }
    static updateUserInput(scene) {
        const buttonsDown = InputController.GetMouseButtonsDown();
        InputController.leftButtonDown = (buttonsDown & 1) === 1;
        InputController.middleButtonDown = (buttonsDown & 4) === 4;
        InputController.rightButtonDown = (buttonsDown & 2) === 2;
        if (SceneManager.EnableUserInput === false)
            return;
        InputController.PointerLockedFlag = scene.getEngine().isPointerLock;
        InputController.tickKeyboardInput(scene);
        InputController.x_horizontal = 0;
        InputController.x_vertical = 0;
        InputController.x_mousex = 0;
        InputController.x_mousey = 0;
        if (InputController.j_horizontal !== 0) {
            InputController.x_horizontal = InputController.j_horizontal;
        }
        else if (InputController.g_horizontal1 !== 0) {
            InputController.x_horizontal = InputController.g_horizontal1;
        }
        else if (InputController.k_horizontal !== 0) {
            InputController.x_horizontal = InputController.k_horizontal;
        }
        if (InputController.j_vertical !== 0) {
            InputController.x_vertical = InputController.j_vertical;
        }
        else if (InputController.g_vertical1 !== 0) {
            InputController.x_vertical = InputController.g_vertical1;
        }
        else if (InputController.k_vertical !== 0) {
            InputController.x_vertical = InputController.k_vertical;
        }
        if (InputController.j_mousex !== 0) {
            InputController.x_mousex = InputController.j_mousex;
        }
        else if (InputController.g_mousex1 !== 0) {
            InputController.x_mousex = InputController.g_mousex1;
        }
        else if (InputController.a_mousex !== 0) {
            InputController.x_mousex = InputController.a_mousex;
        }
        else if (InputController.k_mousex !== 0) {
            InputController.x_mousex = InputController.k_mousex;
        }
        if (InputController.j_mousey !== 0) {
            InputController.x_mousey = InputController.j_mousey;
        }
        else if (InputController.g_mousey1 !== 0) {
            InputController.x_mousey = InputController.g_mousey1;
        }
        else if (InputController.k_mousey !== 0) {
            InputController.x_mousey = InputController.k_mousey;
        }
        InputController.horizontal = InputController.x_horizontal;
        InputController.vertical = InputController.x_vertical;
        InputController.mousex = InputController.x_mousex;
        InputController.mousey = InputController.x_mousey;
        InputController.scroll = InputController.x_scroll;
        InputController.wheel = InputController.x_wheel;
        InputController.horizontal2 = InputController.g_horizontal2;
        InputController.vertical2 = InputController.g_vertical2;
        InputController.mousex2 = InputController.g_mousex2;
        InputController.mousey2 = InputController.g_mousey2;
        InputController.horizontal3 = InputController.g_horizontal3;
        InputController.vertical3 = InputController.g_vertical3;
        InputController.mousex3 = InputController.g_mousex3;
        InputController.mousey3 = InputController.g_mousey3;
        InputController.horizontal4 = InputController.g_horizontal4;
        InputController.vertical4 = InputController.g_vertical4;
        InputController.mousex4 = InputController.g_mousex4;
        InputController.mousey4 = InputController.g_mousey4;
        InputController.k_mousex = 0;
        InputController.k_mousey = 0;
        InputController.x_mousey = 0;
        InputController.x_scroll = 0;
    }
    static resetUserInput() {
        InputController.input = false;
        InputController.keymap = {};
        InputController.scroll = 0;
        InputController.wheel = 0;
        InputController.mousex = 0;
        InputController.mousey = 0;
        InputController.vertical = 0;
        InputController.horizontal = 0;
        InputController.mousex2 = 0;
        InputController.mousey2 = 0;
        InputController.vertical2 = 0;
        InputController.horizontal2 = 0;
        InputController.mousex3 = 0;
        InputController.mousey3 = 0;
        InputController.vertical3 = 0;
        InputController.horizontal3 = 0;
        InputController.mousex4 = 0;
        InputController.mousey4 = 0;
        InputController.vertical4 = 0;
        InputController.horizontal4 = 0;
        InputController.a_mousex = 0;
        InputController.x_scroll = 0;
        InputController.x_wheel = 0;
        InputController.x_mousex = 0;
        InputController.x_mousey = 0;
        InputController.x_vertical = 0;
        InputController.x_horizontal = 0;
        InputController.k_mousex = 0;
        InputController.k_mousey = 0;
        InputController.k_vertical = 0;
        InputController.k_horizontal = 0;
        InputController.j_mousex = 0;
        InputController.j_mousey = 0;
        InputController.j_vertical = 0;
        InputController.j_horizontal = 0;
        InputController.g_mousex1 = 0;
        InputController.g_mousey1 = 0;
        InputController.g_vertical1 = 0;
        InputController.g_horizontal1 = 0;
        InputController.g_mousex2 = 0;
        InputController.g_mousey2 = 0;
        InputController.g_vertical2 = 0;
        InputController.g_horizontal2 = 0;
        InputController.g_mousex3 = 0;
        InputController.g_mousey3 = 0;
        InputController.g_vertical3 = 0;
        InputController.g_horizontal3 = 0;
        InputController.g_mousex4 = 0;
        InputController.g_mousey4 = 0;
        InputController.g_vertical4 = 0;
        InputController.g_horizontal4 = 0;
        InputController.dragDirection = 0;
        InputController.pinchZoomState = 0;
        InputController.pinchZoomEvents = [];
        InputController.pinchZoomDistance = null;
        InputController.preventDefault = false;
        InputController.leftButtonDown = false;
        InputController.middleButtonDown = false;
        InputController.rightButtonDown = false;
        InputController.mouseDownTarget = null;
        InputController.mouseDragTarget = null;
        InputController.mouseButtonsDown = 0;
        InputController.mouseButtonUp = [];
        InputController.mouseButtonDown = [];
        InputController.mouseButtonPress = [];
        InputController.keyButtonUp = [];
        InputController.keyButtonDown = [];
        InputController.keyButtonPress = [];
        InputController.gamepad1ButtonUp = [];
        InputController.gamepad1ButtonDown = [];
        InputController.gamepad1ButtonPress = [];
        InputController.gamepad1DpadUp = [];
        InputController.gamepad1DpadDown = [];
        InputController.gamepad1DpadPress = [];
        InputController.gamepad1LeftTrigger = [];
        InputController.gamepad1RightTrigger = [];
        InputController.gamepad2ButtonUp = [];
        InputController.gamepad2ButtonDown = [];
        InputController.gamepad2ButtonPress = [];
        InputController.gamepad2DpadUp = [];
        InputController.gamepad2DpadDown = [];
        InputController.gamepad2DpadPress = [];
        InputController.gamepad2LeftTrigger = [];
        InputController.gamepad2RightTrigger = [];
        InputController.gamepad3ButtonUp = [];
        InputController.gamepad3ButtonDown = [];
        InputController.gamepad3ButtonPress = [];
        InputController.gamepad3DpadUp = [];
        InputController.gamepad3DpadDown = [];
        InputController.gamepad3DpadPress = [];
        InputController.gamepad3LeftTrigger = [];
        InputController.gamepad3RightTrigger = [];
        InputController.gamepad4ButtonUp = [];
        InputController.gamepad4ButtonDown = [];
        InputController.gamepad4ButtonPress = [];
        InputController.gamepad4DpadUp = [];
        InputController.gamepad4DpadDown = [];
        InputController.gamepad4DpadPress = [];
        InputController.gamepad4LeftTrigger = [];
        InputController.gamepad4RightTrigger = [];
        InputController.previousPosition = null;
    }
    static resetKeyMapHandler(e) {
        InputController.keymap = {};
    }
    static getPinchZoomDistance(pointer1, pointer2) {
        const dx = pointer2.clientX - pointer1.clientX;
        const dy = pointer2.clientY - pointer1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    static cachePinchZoomPointer(event) {
        if (InputController.EnablePinchZoomTracking === true) {
            InputController.pinchZoomEvents.push(event);
        }
    }
    static removePinchZoomPointer(event) {
        if (InputController.EnablePinchZoomTracking === true) {
            for (let i = 0; i < InputController.pinchZoomEvents.length; i++) {
                if (InputController.pinchZoomEvents[i].pointerId === event.pointerId) {
                    InputController.pinchZoomEvents.splice(i, 1);
                    break;
                }
            }
            if (InputController.pinchZoomEvents.length < 2) {
                InputController.pinchZoomDistance = null;
            }
        }
    }
    static processPinchZoomTracking(event) {
        if (InputController.EnablePinchZoomTracking === true) {
            for (let i = 0; i < InputController.pinchZoomEvents.length; i++) {
                if (InputController.pinchZoomEvents[i].pointerId === event.pointerId) {
                    InputController.pinchZoomEvents[i] = event;
                    break;
                }
            }
            InputController.pinchZoomState = PinchZoomState.None;
            if (InputController.pinchZoomEvents.length === 2) {
                const distance = InputController.getPinchZoomDistance(InputController.pinchZoomEvents[0], InputController.pinchZoomEvents[1]);
                if (distance !== InputController.pinchZoomDistance) {
                    if (distance > InputController.pinchZoomDistance) {
                        InputController.pinchZoomState = PinchZoomState.ZoomIn;
                    }
                    else if (distance < InputController.pinchZoomDistance) {
                        InputController.pinchZoomState = PinchZoomState.ZoomOut;
                    }
                    InputController.pinchZoomDistance = distance;
                }
            }
        }
    }
    static inputKeyDownHandler(e) {
        return InputController.InputKeyDownHandler(e.keyCode, e);
    }
    static inputKeyUpHandler(e) {
        return InputController.InputKeyUpHandler(e.keyCode, e);
    }
    static inputPointerWheelHandler(e) {
        if (SceneManager.EnableUserInput === false)
            return false;
        let delta = e.deltaY ? -e.deltaY : e.wheelDelta / 40;
        InputController.x_scroll = 1;
        InputController.x_wheel = Math.abs(delta) > UserInputOptions.PointerWheelDeadZone ? 0 + delta : 0;
        if (InputController.preventDefault)
            e.preventDefault();
        return true;
    }
    static inputPointerDownHandler(e) {
        InputController.mouseDownTarget = e.target;
        InputController.mouseButtonsDown = e.buttons;
        InputController.cachePinchZoomPointer(e);
        if (SceneManager.EnableUserInput === false)
            return false;
        InputController.previousPosition = {
            x: e.clientX,
            y: e.clientY
        };
        let key = "p:" + e.button.toString();
        let pressed = false;
        if (InputController.keymap[key] == null) {
            InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
        }
        if (InputController.keymap[key] != null) {
            const keymapState = InputController.keymap[key];
            pressed = (keymapState.result != null) ? keymapState.result : false;
            if (pressed === false) {
                keymapState.result = true;
                keymapState.pressTime = SceneManager.GetTimeMs();
                keymapState.releaseTime = 0;
            }
        }
        if (InputController.mouseButtonDown != null && InputController.mouseButtonDown.length > 0) {
            InputController.mouseButtonDown.forEach((callback) => {
                callback(e.button);
            });
        }
        if (!pressed) {
            if (InputController.mouseButtonPress != null && InputController.mouseButtonPress.length > 0) {
                InputController.mouseButtonPress.forEach((press) => {
                    if (press.index === e.button) {
                        press.action();
                    }
                });
            }
        }
        if (InputController.preventDefault)
            e.preventDefault();
        return true;
    }
    static inputPointerUpHandler(e) {
        InputController.mouseDownTarget = null;
        InputController.mouseDragTarget = null;
        InputController.mouseButtonsDown = e.buttons;
        InputController.removePinchZoomPointer(e);
        if (SceneManager.EnableUserInput === false)
            return false;
        InputController.previousPosition = null;
        InputController.k_mousex = 0;
        InputController.k_mousey = 0;
        let key = "p:" + e.button.toString();
        let pressed = false;
        if (InputController.keymap[key] != null) {
            const keymapState = InputController.keymap[key];
            pressed = (keymapState.result != null) ? keymapState.result : false;
            if (pressed === true) {
                keymapState.result = false;
                keymapState.releaseTime = SceneManager.GetTimeMs();
            }
        }
        if (InputController.mouseButtonUp != null && InputController.mouseButtonUp.length > 0) {
            InputController.mouseButtonUp.forEach((callback) => {
                callback(e.button);
            });
        }
        if (InputController.preventDefault)
            e.preventDefault();
        return true;
    }
    static inputPointerMoveHandler(e) {
        InputController.mouseDragTarget = e.target;
        InputController.mouseButtonsDown = e.buttons;
        InputController.processPinchZoomTracking(e);
        if (SceneManager.EnableUserInput === false)
            return false;
        if (SceneManager.VirtualJoystickEnabled === false) {
            let offsetX = 0;
            let offsetY = 0;
            if (InputController.IsPointerLocked()) {
                offsetX = e.movementX || e.mozMovementX || e.webkitMovementX || e.msMovementX || 0;
                offsetY = e.movementY || e.mozMovementY || e.webkitMovementY || e.msMovementY || 0;
                InputController.previousPosition = null;
            }
            else if (InputController.previousPosition != null) {
                offsetX = e.clientX - InputController.previousPosition.x;
                offsetY = e.clientY - InputController.previousPosition.y;
                InputController.previousPosition = {
                    x: e.clientX,
                    y: e.clientY
                };
            }
            if (UserInputOptions.PointerMouseInverted === true) {
                offsetX *= -1;
                offsetY *= -1;
            }
            if (InputController.rightHanded === true) {
                offsetX *= -1;
            }
            if (UserInputOptions.EnableBabylonRotation === true) {
                InputController.k_mousex = (offsetX / UserInputOptions.BabylonAngularSensibility);
                InputController.k_mousey = (offsetY / UserInputOptions.BabylonAngularSensibility);
            }
            else {
                let mousex = (offsetX * UserInputOptions.DefaultAngularSensibility * InputController.MOUSE_DAMPENER);
                let mousey = (offsetY * UserInputOptions.DefaultAngularSensibility * InputController.MOUSE_DAMPENER);
                if (Math.abs(offsetX) <= UserInputOptions.PointerMouseDeadZone)
                    mousex = 0;
                if (Math.abs(offsetY) <= UserInputOptions.PointerMouseDeadZone)
                    mousey = 0;
                InputController.k_mousex += mousex;
                InputController.k_mousey += mousey;
                InputController.k_mousex = Scalar.Clamp(InputController.k_mousex, -1, 1);
                InputController.k_mousey = Scalar.Clamp(InputController.k_mousey, -1, 1);
            }
        }
        if (InputController.preventDefault)
            e.preventDefault();
        return true;
    }
    static inputOneButtonDownHandler(button) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad1 != null) {
            let key = "b1:" + button.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad1ButtonDown != null && InputController.gamepad1ButtonDown.length > 0) {
                InputController.gamepad1ButtonDown.forEach((callback) => {
                    callback(button);
                });
            }
            if (!pressed) {
                if (InputController.gamepad1ButtonPress != null && InputController.gamepad1ButtonPress.length > 0) {
                    InputController.gamepad1ButtonPress.forEach((press) => {
                        if (press.index === button) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputOneButtonUpHandler(button) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad1 != null) {
            let key = "b1:" + button.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad1ButtonUp != null && InputController.gamepad1ButtonUp.length > 0) {
                InputController.gamepad1ButtonUp.forEach((callback) => {
                    callback(button);
                });
            }
        }
    }
    static inputOneXboxDPadDownHandler(dPadPressed) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad1 != null) {
            let key = "d1:" + dPadPressed.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad1DpadDown != null && InputController.gamepad1DpadDown.length > 0) {
                InputController.gamepad1DpadDown.forEach((callback) => {
                    callback(dPadPressed);
                });
            }
            if (!pressed) {
                if (InputController.gamepad1DpadPress != null && InputController.gamepad1DpadPress.length > 0) {
                    InputController.gamepad1DpadPress.forEach((press) => {
                        if (press.index === dPadPressed) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputOneShockDPadDownHandler(dPadPressed) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad1 != null) {
            let key = "d1:" + dPadPressed.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad1DpadDown != null && InputController.gamepad1DpadDown.length > 0) {
                InputController.gamepad1DpadDown.forEach((callback) => {
                    callback(dPadPressed);
                });
            }
            if (!pressed) {
                if (InputController.gamepad1DpadPress != null && InputController.gamepad1DpadPress.length > 0) {
                    InputController.gamepad1DpadPress.forEach((press) => {
                        if (press.index === dPadPressed) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputOneXboxDPadUpHandler(dPadReleased) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad1 != null) {
            let key = "d1:" + dPadReleased.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad1DpadUp != null && InputController.gamepad1DpadUp.length > 0) {
                InputController.gamepad1DpadUp.forEach((callback) => {
                    callback(dPadReleased);
                });
            }
        }
    }
    static inputOneShockDPadUpHandler(dPadReleased) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad1 != null) {
            let key = "d1:" + dPadReleased.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad1DpadUp != null && InputController.gamepad1DpadUp.length > 0) {
                InputController.gamepad1DpadUp.forEach((callback) => {
                    callback(dPadReleased);
                });
            }
        }
    }
    static inputOneXboxLeftTriggerHandler(value) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad1 != null) {
            let key = "t1:0";
            let pressed = false;
            if (value > 0) {
                if (InputController.keymap[key] == null) {
                    InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
                }
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false) {
                        keymapState.result = true;
                        keymapState.pressTime = SceneManager.GetTimeMs();
                        keymapState.releaseTime = 0;
                    }
                }
            }
            else {
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true) {
                        keymapState.result = false;
                        keymapState.releaseTime = SceneManager.GetTimeMs();
                    }
                }
            }
            if (InputController.gamepad1LeftTrigger != null && InputController.gamepad1LeftTrigger.length > 0) {
                InputController.gamepad1LeftTrigger.forEach((callback) => {
                    callback(value);
                });
            }
        }
    }
    static inputOneXboxRightTriggerHandler(value) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad1 != null) {
            let key = "t1:1";
            let pressed = false;
            if (value > 0) {
                if (InputController.keymap[key] == null) {
                    InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
                }
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false) {
                        keymapState.result = true;
                        keymapState.pressTime = SceneManager.GetTimeMs();
                        keymapState.releaseTime = 0;
                    }
                }
            }
            else {
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true) {
                        keymapState.result = false;
                        keymapState.releaseTime = SceneManager.GetTimeMs();
                    }
                }
            }
            if (InputController.gamepad1RightTrigger != null && InputController.gamepad1RightTrigger.length > 0) {
                InputController.gamepad1RightTrigger.forEach((callback) => {
                    callback(value);
                });
            }
        }
    }
    static inputOneLeftStickHandler(values) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad1 != null) {
            let LSValues = values;
            let normalizedLX = LSValues.x * UserInputOptions.GamepadLStickSensibility;
            let normalizedLY = LSValues.y * UserInputOptions.GamepadLStickSensibility;
            LSValues.x = Math.abs(normalizedLX) > UserInputOptions.GamepadDeadStickValue ? normalizedLX : 0;
            LSValues.y = Math.abs(normalizedLY) > UserInputOptions.GamepadDeadStickValue ? normalizedLY : 0;
            LSValues.x = Scalar.Clamp(LSValues.x, -1, 1);
            LSValues.y = Scalar.Clamp(LSValues.y, -1, 1);
            InputController.g_horizontal1 = (UserInputOptions.GamepadLStickXInverted) ? -LSValues.x : LSValues.x;
            InputController.g_vertical1 = (UserInputOptions.GamepadLStickYInverted) ? LSValues.y : -LSValues.y;
        }
    }
    static inputOneRightStickHandler(values) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad1 != null) {
            let RSValues = values;
            let normalizedRX = RSValues.x * UserInputOptions.GamepadRStickSensibility;
            let normalizedRY = RSValues.y * UserInputOptions.GamepadRStickSensibility;
            RSValues.x = Math.abs(normalizedRX) > UserInputOptions.GamepadDeadStickValue ? normalizedRX : 0;
            RSValues.y = Math.abs(normalizedRY) > UserInputOptions.GamepadDeadStickValue ? normalizedRY : 0;
            RSValues.x = Scalar.Clamp(RSValues.x, -1, 1);
            RSValues.y = Scalar.Clamp(RSValues.y, -1, 1);
            InputController.g_mousex1 = (UserInputOptions.GamepadRStickXInverted) ? -RSValues.x : RSValues.x;
            InputController.g_mousey1 = (UserInputOptions.GamepadRStickYInverted) ? -RSValues.y : RSValues.y;
        }
    }
    static inputTwoButtonDownHandler(button) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad2 != null) {
            let key = "b2:" + button.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad2ButtonDown != null && InputController.gamepad2ButtonDown.length > 0) {
                InputController.gamepad2ButtonDown.forEach((callback) => {
                    callback(button);
                });
            }
            if (!pressed) {
                if (InputController.gamepad2ButtonPress != null && InputController.gamepad2ButtonPress.length > 0) {
                    InputController.gamepad2ButtonPress.forEach((press) => {
                        if (press.index === button) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputTwoButtonUpHandler(button) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad2 != null) {
            let key = "b2:" + button.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad2ButtonUp != null && InputController.gamepad2ButtonUp.length > 0) {
                InputController.gamepad2ButtonUp.forEach((callback) => {
                    callback(button);
                });
            }
        }
    }
    static inputTwoXboxDPadDownHandler(dPadPressed) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad2 != null) {
            let key = "d2:" + dPadPressed.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad2DpadDown != null && InputController.gamepad2DpadDown.length > 0) {
                InputController.gamepad2DpadDown.forEach((callback) => {
                    callback(dPadPressed);
                });
            }
            if (!pressed) {
                if (InputController.gamepad2DpadPress != null && InputController.gamepad2DpadPress.length > 0) {
                    InputController.gamepad2DpadPress.forEach((press) => {
                        if (press.index === dPadPressed) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputTwoShockDPadDownHandler(dPadPressed) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad2 != null) {
            let key = "d2:" + dPadPressed.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad2DpadDown != null && InputController.gamepad2DpadDown.length > 0) {
                InputController.gamepad2DpadDown.forEach((callback) => {
                    callback(dPadPressed);
                });
            }
            if (!pressed) {
                if (InputController.gamepad2DpadPress != null && InputController.gamepad2DpadPress.length > 0) {
                    InputController.gamepad2DpadPress.forEach((press) => {
                        if (press.index === dPadPressed) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputTwoXboxDPadUpHandler(dPadReleased) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad2 != null) {
            let key = "d2:" + dPadReleased.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad2DpadUp != null && InputController.gamepad2DpadUp.length > 0) {
                InputController.gamepad2DpadUp.forEach((callback) => {
                    callback(dPadReleased);
                });
            }
        }
    }
    static inputTwoShockDPadUpHandler(dPadReleased) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad2 != null) {
            let key = "d2:" + dPadReleased.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad2DpadUp != null && InputController.gamepad2DpadUp.length > 0) {
                InputController.gamepad2DpadUp.forEach((callback) => {
                    callback(dPadReleased);
                });
            }
        }
    }
    static inputTwoXboxLeftTriggerHandler(value) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad2 != null) {
            let key = "t2:0";
            let pressed = false;
            if (value > 0) {
                if (InputController.keymap[key] == null) {
                    InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
                }
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false) {
                        keymapState.result = true;
                        keymapState.pressTime = SceneManager.GetTimeMs();
                        keymapState.releaseTime = 0;
                    }
                }
            }
            else {
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true) {
                        keymapState.result = false;
                        keymapState.releaseTime = SceneManager.GetTimeMs();
                    }
                }
            }
            if (InputController.gamepad2LeftTrigger != null && InputController.gamepad2LeftTrigger.length > 0) {
                InputController.gamepad2LeftTrigger.forEach((callback) => {
                    callback(value);
                });
            }
        }
    }
    static inputTwoXboxRightTriggerHandler(value) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad2 != null) {
            let key = "t2:1";
            let pressed = false;
            if (value > 0) {
                if (InputController.keymap[key] == null) {
                    InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
                }
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false) {
                        keymapState.result = true;
                        keymapState.pressTime = SceneManager.GetTimeMs();
                        keymapState.releaseTime = 0;
                    }
                }
            }
            else {
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true) {
                        keymapState.result = false;
                        keymapState.releaseTime = SceneManager.GetTimeMs();
                    }
                }
            }
            if (InputController.gamepad2RightTrigger != null && InputController.gamepad2RightTrigger.length > 0) {
                InputController.gamepad2RightTrigger.forEach((callback) => {
                    callback(value);
                });
            }
        }
    }
    static inputTwoLeftStickHandler(values) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad2 != null) {
            let LSValues = values;
            let normalizedLX = LSValues.x * UserInputOptions.GamepadLStickSensibility;
            let normalizedLY = LSValues.y * UserInputOptions.GamepadLStickSensibility;
            LSValues.x = Math.abs(normalizedLX) > UserInputOptions.GamepadDeadStickValue ? normalizedLX : 0;
            LSValues.y = Math.abs(normalizedLY) > UserInputOptions.GamepadDeadStickValue ? normalizedLY : 0;
            LSValues.x = Scalar.Clamp(LSValues.x, -1, 1);
            LSValues.y = Scalar.Clamp(LSValues.y, -1, 1);
            InputController.g_horizontal2 = (UserInputOptions.GamepadLStickXInverted) ? -LSValues.x : LSValues.x;
            InputController.g_vertical2 = (UserInputOptions.GamepadLStickYInverted) ? LSValues.y : -LSValues.y;
        }
    }
    static inputTwoRightStickHandler(values) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad2 != null) {
            let RSValues = values;
            let normalizedRX = RSValues.x * UserInputOptions.GamepadRStickSensibility;
            let normalizedRY = RSValues.y * UserInputOptions.GamepadRStickSensibility;
            RSValues.x = Math.abs(normalizedRX) > UserInputOptions.GamepadDeadStickValue ? normalizedRX : 0;
            RSValues.y = Math.abs(normalizedRY) > UserInputOptions.GamepadDeadStickValue ? normalizedRY : 0;
            RSValues.x = Scalar.Clamp(RSValues.x, -1, 1);
            RSValues.y = Scalar.Clamp(RSValues.y, -1, 1);
            InputController.g_mousex2 = (UserInputOptions.GamepadRStickXInverted) ? -RSValues.x : RSValues.x;
            InputController.g_mousey2 = (UserInputOptions.GamepadRStickYInverted) ? -RSValues.y : RSValues.y;
        }
    }
    static inputThreeButtonDownHandler(button) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad3 != null) {
            let key = "b3:" + button.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad3ButtonDown != null && InputController.gamepad3ButtonDown.length > 0) {
                InputController.gamepad3ButtonDown.forEach((callback) => {
                    callback(button);
                });
            }
            if (!pressed) {
                if (InputController.gamepad3ButtonPress != null && InputController.gamepad3ButtonPress.length > 0) {
                    InputController.gamepad3ButtonPress.forEach((press) => {
                        if (press.index === button) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputThreeButtonUpHandler(button) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad3 != null) {
            let key = "b3:" + button.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad3ButtonUp != null && InputController.gamepad3ButtonUp.length > 0) {
                InputController.gamepad3ButtonUp.forEach((callback) => {
                    callback(button);
                });
            }
        }
    }
    static inputThreeXboxDPadDownHandler(dPadPressed) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad3 != null) {
            let key = "d3:" + dPadPressed.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad3DpadDown != null && InputController.gamepad3DpadDown.length > 0) {
                InputController.gamepad3DpadDown.forEach((callback) => {
                    callback(dPadPressed);
                });
            }
            if (!pressed) {
                if (InputController.gamepad3DpadPress != null && InputController.gamepad3DpadPress.length > 0) {
                    InputController.gamepad3DpadPress.forEach((press) => {
                        if (press.index === dPadPressed) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputThreeShockDPadDownHandler(dPadPressed) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad3 != null) {
            let key = "d3:" + dPadPressed.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad3DpadDown != null && InputController.gamepad3DpadDown.length > 0) {
                InputController.gamepad3DpadDown.forEach((callback) => {
                    callback(dPadPressed);
                });
            }
            if (!pressed) {
                if (InputController.gamepad3DpadPress != null && InputController.gamepad3DpadPress.length > 0) {
                    InputController.gamepad3DpadPress.forEach((press) => {
                        if (press.index === dPadPressed) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputThreeXboxDPadUpHandler(dPadReleased) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad3 != null) {
            let key = "d3:" + dPadReleased.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad3DpadUp != null && InputController.gamepad3DpadUp.length > 0) {
                InputController.gamepad3DpadUp.forEach((callback) => {
                    callback(dPadReleased);
                });
            }
        }
    }
    static inputThreeShockDPadUpHandler(dPadReleased) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad3 != null) {
            let key = "d3:" + dPadReleased.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad3DpadUp != null && InputController.gamepad3DpadUp.length > 0) {
                InputController.gamepad3DpadUp.forEach((callback) => {
                    callback(dPadReleased);
                });
            }
        }
    }
    static inputThreeXboxLeftTriggerHandler(value) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad3 != null) {
            let key = "t3:0";
            let pressed = false;
            if (value > 0) {
                if (InputController.keymap[key] == null) {
                    InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
                }
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false) {
                        keymapState.result = true;
                        keymapState.pressTime = SceneManager.GetTimeMs();
                        keymapState.releaseTime = 0;
                    }
                }
            }
            else {
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true) {
                        keymapState.result = false;
                        keymapState.releaseTime = SceneManager.GetTimeMs();
                    }
                }
            }
            if (InputController.gamepad3LeftTrigger != null && InputController.gamepad3LeftTrigger.length > 0) {
                InputController.gamepad3LeftTrigger.forEach((callback) => {
                    callback(value);
                });
            }
        }
    }
    static inputThreeXboxRightTriggerHandler(value) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad3 != null) {
            let key = "t3:1";
            let pressed = false;
            if (value > 0) {
                if (InputController.keymap[key] == null) {
                    InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
                }
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false) {
                        keymapState.result = true;
                        keymapState.pressTime = SceneManager.GetTimeMs();
                        keymapState.releaseTime = 0;
                    }
                }
            }
            else {
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true) {
                        keymapState.result = false;
                        keymapState.releaseTime = SceneManager.GetTimeMs();
                    }
                }
            }
            if (InputController.gamepad3RightTrigger != null && InputController.gamepad3RightTrigger.length > 0) {
                InputController.gamepad3RightTrigger.forEach((callback) => {
                    callback(value);
                });
            }
        }
    }
    static inputThreeLeftStickHandler(values) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad3 != null) {
            let LSValues = values;
            let normalizedLX = LSValues.x * UserInputOptions.GamepadLStickSensibility;
            let normalizedLY = LSValues.y * UserInputOptions.GamepadLStickSensibility;
            LSValues.x = Math.abs(normalizedLX) > UserInputOptions.GamepadDeadStickValue ? normalizedLX : 0;
            LSValues.y = Math.abs(normalizedLY) > UserInputOptions.GamepadDeadStickValue ? normalizedLY : 0;
            LSValues.x = Scalar.Clamp(LSValues.x, -1, 1);
            LSValues.y = Scalar.Clamp(LSValues.y, -1, 1);
            InputController.g_horizontal3 = (UserInputOptions.GamepadLStickXInverted) ? -LSValues.x : LSValues.x;
            InputController.g_vertical3 = (UserInputOptions.GamepadLStickYInverted) ? LSValues.y : -LSValues.y;
        }
    }
    static inputThreeRightStickHandler(values) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad3 != null) {
            let RSValues = values;
            let normalizedRX = RSValues.x * UserInputOptions.GamepadRStickSensibility;
            let normalizedRY = RSValues.y * UserInputOptions.GamepadRStickSensibility;
            RSValues.x = Math.abs(normalizedRX) > UserInputOptions.GamepadDeadStickValue ? normalizedRX : 0;
            RSValues.y = Math.abs(normalizedRY) > UserInputOptions.GamepadDeadStickValue ? normalizedRY : 0;
            RSValues.x = Scalar.Clamp(RSValues.x, -1, 1);
            RSValues.y = Scalar.Clamp(RSValues.y, -1, 1);
            InputController.g_mousex3 = (UserInputOptions.GamepadRStickXInverted) ? -RSValues.x : RSValues.x;
            InputController.g_mousey3 = (UserInputOptions.GamepadRStickYInverted) ? -RSValues.y : RSValues.y;
        }
    }
    static inputFourButtonDownHandler(button) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad4 != null) {
            let key = "b4:" + button.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad4ButtonDown != null && InputController.gamepad4ButtonDown.length > 0) {
                InputController.gamepad4ButtonDown.forEach((callback) => {
                    callback(button);
                });
            }
            if (!pressed) {
                if (InputController.gamepad4ButtonPress != null && InputController.gamepad4ButtonPress.length > 0) {
                    InputController.gamepad4ButtonPress.forEach((press) => {
                        if (press.index === button) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputFourButtonUpHandler(button) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad4 != null) {
            let key = "b4:" + button.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad4ButtonUp != null && InputController.gamepad4ButtonUp.length > 0) {
                InputController.gamepad4ButtonUp.forEach((callback) => {
                    callback(button);
                });
            }
        }
    }
    static inputFourXboxDPadDownHandler(dPadPressed) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad4 != null) {
            let key = "d4:" + dPadPressed.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad4DpadDown != null && InputController.gamepad4DpadDown.length > 0) {
                InputController.gamepad4DpadDown.forEach((callback) => {
                    callback(dPadPressed);
                });
            }
            if (!pressed) {
                if (InputController.gamepad4DpadPress != null && InputController.gamepad4DpadPress.length > 0) {
                    InputController.gamepad4DpadPress.forEach((press) => {
                        if (press.index === dPadPressed) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputFourShockDPadDownHandler(dPadPressed) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad4 != null) {
            let key = "d4:" + dPadPressed.toString();
            let pressed = false;
            if (InputController.keymap[key] == null) {
                InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
            }
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === false) {
                    keymapState.result = true;
                    keymapState.pressTime = SceneManager.GetTimeMs();
                    keymapState.releaseTime = 0;
                }
            }
            if (InputController.gamepad4DpadDown != null && InputController.gamepad4DpadDown.length > 0) {
                InputController.gamepad4DpadDown.forEach((callback) => {
                    callback(dPadPressed);
                });
            }
            if (!pressed) {
                if (InputController.gamepad4DpadPress != null && InputController.gamepad4DpadPress.length > 0) {
                    InputController.gamepad4DpadPress.forEach((press) => {
                        if (press.index === dPadPressed) {
                            press.action();
                        }
                    });
                }
            }
        }
    }
    static inputFourXboxDPadUpHandler(dPadReleased) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad4 != null) {
            let key = "d4:" + dPadReleased.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad4DpadUp != null && InputController.gamepad4DpadUp.length > 0) {
                InputController.gamepad4DpadUp.forEach((callback) => {
                    callback(dPadReleased);
                });
            }
        }
    }
    static inputFourShockDPadUpHandler(dPadReleased) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad4 != null) {
            let key = "d4:" + dPadReleased.toString();
            let pressed = false;
            if (InputController.keymap[key] != null) {
                const keymapState = InputController.keymap[key];
                pressed = (keymapState.result != null) ? keymapState.result : false;
                if (pressed === true) {
                    keymapState.result = false;
                    keymapState.releaseTime = SceneManager.GetTimeMs();
                }
            }
            if (InputController.gamepad4DpadUp != null && InputController.gamepad4DpadUp.length > 0) {
                InputController.gamepad4DpadUp.forEach((callback) => {
                    callback(dPadReleased);
                });
            }
        }
    }
    static inputFourXboxLeftTriggerHandler(value) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad4 != null) {
            let key = "t4:0";
            let pressed = false;
            if (value > 0) {
                if (InputController.keymap[key] == null) {
                    InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
                }
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false) {
                        keymapState.result = true;
                        keymapState.pressTime = SceneManager.GetTimeMs();
                        keymapState.releaseTime = 0;
                    }
                }
            }
            else {
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true) {
                        keymapState.result = false;
                        keymapState.releaseTime = SceneManager.GetTimeMs();
                    }
                }
            }
            if (InputController.gamepad4LeftTrigger != null && InputController.gamepad4LeftTrigger.length > 0) {
                InputController.gamepad4LeftTrigger.forEach((callback) => {
                    callback(value);
                });
            }
        }
    }
    static inputFourXboxRightTriggerHandler(value) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad4 != null) {
            let key = "t4:1";
            let pressed = false;
            if (value > 0) {
                if (InputController.keymap[key] == null) {
                    InputController.keymap[key] = { result: false, pressTime: 0, releaseTime: 0 };
                }
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === false) {
                        keymapState.result = true;
                        keymapState.pressTime = SceneManager.GetTimeMs();
                        keymapState.releaseTime = 0;
                    }
                }
            }
            else {
                if (InputController.keymap[key] != null) {
                    const keymapState = InputController.keymap[key];
                    pressed = (keymapState.result != null) ? keymapState.result : false;
                    if (pressed === true) {
                        keymapState.result = false;
                        keymapState.releaseTime = SceneManager.GetTimeMs();
                    }
                }
            }
            if (InputController.gamepad4RightTrigger != null && InputController.gamepad4RightTrigger.length > 0) {
                InputController.gamepad4RightTrigger.forEach((callback) => {
                    callback(value);
                });
            }
        }
    }
    static inputFourLeftStickHandler(values) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad4 != null) {
            let LSValues = values;
            let normalizedLX = LSValues.x * UserInputOptions.GamepadLStickSensibility;
            let normalizedLY = LSValues.y * UserInputOptions.GamepadLStickSensibility;
            LSValues.x = Math.abs(normalizedLX) > UserInputOptions.GamepadDeadStickValue ? normalizedLX : 0;
            LSValues.y = Math.abs(normalizedLY) > UserInputOptions.GamepadDeadStickValue ? normalizedLY : 0;
            LSValues.x = Scalar.Clamp(LSValues.x, -1, 1);
            LSValues.y = Scalar.Clamp(LSValues.y, -1, 1);
            InputController.g_horizontal4 = (UserInputOptions.GamepadLStickXInverted) ? -LSValues.x : LSValues.x;
            InputController.g_vertical4 = (UserInputOptions.GamepadLStickYInverted) ? LSValues.y : -LSValues.y;
        }
    }
    static inputFourRightStickHandler(values) {
        if (SceneManager.EnableUserInput === false)
            return;
        if (InputController.gamepad4 != null) {
            let RSValues = values;
            let normalizedRX = RSValues.x * UserInputOptions.GamepadRStickSensibility;
            let normalizedRY = RSValues.y * UserInputOptions.GamepadRStickSensibility;
            RSValues.x = Math.abs(normalizedRX) > UserInputOptions.GamepadDeadStickValue ? normalizedRX : 0;
            RSValues.y = Math.abs(normalizedRY) > UserInputOptions.GamepadDeadStickValue ? normalizedRY : 0;
            RSValues.x = Scalar.Clamp(RSValues.x, -1, 1);
            RSValues.y = Scalar.Clamp(RSValues.y, -1, 1);
            InputController.g_mousex4 = (UserInputOptions.GamepadRStickXInverted) ? -RSValues.x : RSValues.x;
            InputController.g_mousey4 = (UserInputOptions.GamepadRStickYInverted) ? -RSValues.y : RSValues.y;
        }
    }
    static inputManagerGamepadConnected(pad, state) {
        if (InputController.gamepad1 == null && pad.index === 0) {
            InputController.gamepad1 = pad;
            Tools.Log("Gamepad One Connected: " + InputController.gamepad1.id);
            if (InputController.gamepad1 instanceof Xbox360Pad) {
                InputController.gamepad1Type = GamepadType.Xbox360;
                const xbox360Pad1 = InputController.gamepad1;
                xbox360Pad1.onbuttonup(InputController.inputOneButtonUpHandler);
                xbox360Pad1.onbuttondown(InputController.inputOneButtonDownHandler);
                xbox360Pad1.onleftstickchanged(InputController.inputOneLeftStickHandler);
                xbox360Pad1.onrightstickchanged(InputController.inputOneRightStickHandler);
                xbox360Pad1.ondpadup(InputController.inputOneXboxDPadUpHandler);
                xbox360Pad1.ondpaddown(InputController.inputOneXboxDPadDownHandler);
                xbox360Pad1.onlefttriggerchanged(InputController.inputOneXboxLeftTriggerHandler);
                xbox360Pad1.onrighttriggerchanged(InputController.inputOneXboxRightTriggerHandler);
            }
            else if (InputController.gamepad1 instanceof DualShockPad) {
                InputController.gamepad1Type = GamepadType.DualShock;
                const dualShockPad1 = InputController.gamepad1;
                dualShockPad1.onbuttonup(InputController.inputOneButtonUpHandler);
                dualShockPad1.onbuttondown(InputController.inputOneButtonDownHandler);
                dualShockPad1.onleftstickchanged(InputController.inputOneLeftStickHandler);
                dualShockPad1.onrightstickchanged(InputController.inputOneRightStickHandler);
                dualShockPad1.ondpadup(InputController.inputOneShockDPadUpHandler);
                dualShockPad1.ondpaddown(InputController.inputOneShockDPadDownHandler);
                dualShockPad1.onlefttriggerchanged(InputController.inputOneXboxLeftTriggerHandler);
                dualShockPad1.onrighttriggerchanged(InputController.inputOneXboxRightTriggerHandler);
            }
            else {
                InputController.gamepad1Type = GamepadType.Generic;
                const genericPad1 = InputController.gamepad1;
                genericPad1.onbuttonup(InputController.inputOneButtonUpHandler);
                genericPad1.onbuttondown(InputController.inputOneButtonDownHandler);
                genericPad1.onleftstickchanged(InputController.inputOneLeftStickHandler);
                genericPad1.onrightstickchanged(InputController.inputOneRightStickHandler);
            }
        }
        if (InputController.gamepad2 == null && pad.index === 1) {
            InputController.gamepad2 = pad;
            Tools.Log("Gamepad Two Connected: " + InputController.gamepad2.id);
            if (InputController.gamepad2 instanceof Xbox360Pad) {
                InputController.gamepad2Type = GamepadType.Xbox360;
                const xbox360Pad2 = InputController.gamepad2;
                xbox360Pad2.onbuttonup(InputController.inputTwoButtonUpHandler);
                xbox360Pad2.onbuttondown(InputController.inputTwoButtonDownHandler);
                xbox360Pad2.onleftstickchanged(InputController.inputTwoLeftStickHandler);
                xbox360Pad2.onrightstickchanged(InputController.inputTwoRightStickHandler);
                xbox360Pad2.ondpadup(InputController.inputTwoXboxDPadUpHandler);
                xbox360Pad2.ondpaddown(InputController.inputTwoXboxDPadDownHandler);
                xbox360Pad2.onlefttriggerchanged(InputController.inputTwoXboxLeftTriggerHandler);
                xbox360Pad2.onrighttriggerchanged(InputController.inputTwoXboxRightTriggerHandler);
            }
            else if (InputController.gamepad2 instanceof DualShockPad) {
                InputController.gamepad2Type = GamepadType.DualShock;
                const dualShockPad2 = InputController.gamepad2;
                dualShockPad2.onbuttonup(InputController.inputOneButtonUpHandler);
                dualShockPad2.onbuttondown(InputController.inputOneButtonDownHandler);
                dualShockPad2.onleftstickchanged(InputController.inputOneLeftStickHandler);
                dualShockPad2.onrightstickchanged(InputController.inputOneRightStickHandler);
                dualShockPad2.ondpadup(InputController.inputOneShockDPadUpHandler);
                dualShockPad2.ondpaddown(InputController.inputOneShockDPadDownHandler);
                dualShockPad2.onlefttriggerchanged(InputController.inputOneXboxLeftTriggerHandler);
                dualShockPad2.onrighttriggerchanged(InputController.inputOneXboxRightTriggerHandler);
            }
            else {
                InputController.gamepad2Type = GamepadType.Generic;
                let genericPad2 = InputController.gamepad2;
                genericPad2.onbuttonup(InputController.inputTwoButtonUpHandler);
                genericPad2.onbuttondown(InputController.inputTwoButtonDownHandler);
                genericPad2.onleftstickchanged(InputController.inputTwoLeftStickHandler);
                genericPad2.onrightstickchanged(InputController.inputTwoRightStickHandler);
            }
        }
        if (InputController.gamepad3 == null && pad.index === 2) {
            InputController.gamepad3 = pad;
            Tools.Log("Gamepad Three Connected: " + InputController.gamepad3.id);
            if (InputController.gamepad3 instanceof Xbox360Pad) {
                InputController.gamepad3Type = GamepadType.Xbox360;
                const xbox360Pad3 = InputController.gamepad3;
                xbox360Pad3.onbuttonup(InputController.inputThreeButtonUpHandler);
                xbox360Pad3.onbuttondown(InputController.inputThreeButtonDownHandler);
                xbox360Pad3.onleftstickchanged(InputController.inputThreeLeftStickHandler);
                xbox360Pad3.onrightstickchanged(InputController.inputThreeRightStickHandler);
                xbox360Pad3.ondpadup(InputController.inputThreeXboxDPadUpHandler);
                xbox360Pad3.ondpaddown(InputController.inputThreeXboxDPadDownHandler);
                xbox360Pad3.onlefttriggerchanged(InputController.inputThreeXboxLeftTriggerHandler);
                xbox360Pad3.onrighttriggerchanged(InputController.inputThreeXboxRightTriggerHandler);
            }
            else if (InputController.gamepad3 instanceof DualShockPad) {
                const dualShockPad3 = InputController.gamepad3;
                dualShockPad3.onbuttonup(InputController.inputOneButtonUpHandler);
                dualShockPad3.onbuttondown(InputController.inputOneButtonDownHandler);
                dualShockPad3.onleftstickchanged(InputController.inputOneLeftStickHandler);
                dualShockPad3.onrightstickchanged(InputController.inputOneRightStickHandler);
                dualShockPad3.ondpadup(InputController.inputOneShockDPadUpHandler);
                dualShockPad3.ondpaddown(InputController.inputOneShockDPadDownHandler);
                dualShockPad3.onlefttriggerchanged(InputController.inputOneXboxLeftTriggerHandler);
                dualShockPad3.onrighttriggerchanged(InputController.inputOneXboxRightTriggerHandler);
            }
            else {
                InputController.gamepad3Type = GamepadType.Generic;
                const genericPad3 = InputController.gamepad3;
                genericPad3.onbuttonup(InputController.inputThreeButtonUpHandler);
                genericPad3.onbuttondown(InputController.inputThreeButtonDownHandler);
                genericPad3.onleftstickchanged(InputController.inputThreeLeftStickHandler);
                genericPad3.onrightstickchanged(InputController.inputThreeRightStickHandler);
            }
        }
        if (InputController.gamepad4 == null && pad.index === 3) {
            InputController.gamepad4 = pad;
            Tools.Log("Gamepad Four Connected: " + InputController.gamepad4.id);
            if (InputController.gamepad4 instanceof Xbox360Pad) {
                InputController.gamepad4Type = GamepadType.Xbox360;
                const xbox360Pad4 = InputController.gamepad4;
                xbox360Pad4.onbuttonup(InputController.inputFourButtonUpHandler);
                xbox360Pad4.onbuttondown(InputController.inputFourButtonDownHandler);
                xbox360Pad4.onleftstickchanged(InputController.inputFourLeftStickHandler);
                xbox360Pad4.onrightstickchanged(InputController.inputFourRightStickHandler);
                xbox360Pad4.ondpadup(InputController.inputFourXboxDPadUpHandler);
                xbox360Pad4.ondpaddown(InputController.inputFourXboxDPadDownHandler);
                xbox360Pad4.onlefttriggerchanged(InputController.inputFourXboxLeftTriggerHandler);
                xbox360Pad4.onrighttriggerchanged(InputController.inputFourXboxRightTriggerHandler);
            }
            else if (InputController.gamepad4 instanceof DualShockPad) {
                const dualShockPad4 = InputController.gamepad4;
                dualShockPad4.onbuttonup(InputController.inputOneButtonUpHandler);
                dualShockPad4.onbuttondown(InputController.inputOneButtonDownHandler);
                dualShockPad4.onleftstickchanged(InputController.inputOneLeftStickHandler);
                dualShockPad4.onrightstickchanged(InputController.inputOneRightStickHandler);
                dualShockPad4.ondpadup(InputController.inputOneShockDPadUpHandler);
                dualShockPad4.ondpaddown(InputController.inputOneShockDPadDownHandler);
                dualShockPad4.onlefttriggerchanged(InputController.inputOneXboxLeftTriggerHandler);
                dualShockPad4.onrighttriggerchanged(InputController.inputOneXboxRightTriggerHandler);
            }
            else {
                InputController.gamepad4Type = GamepadType.Generic;
                let genericPad4 = InputController.gamepad4;
                genericPad4.onbuttonup(InputController.inputFourButtonUpHandler);
                genericPad4.onbuttondown(InputController.inputFourButtonDownHandler);
                genericPad4.onleftstickchanged(InputController.inputFourLeftStickHandler);
                genericPad4.onrightstickchanged(InputController.inputFourRightStickHandler);
            }
        }
        if (InputController.GamepadConnected != null) {
            InputController.GamepadConnected(pad, state);
        }
    }
    static inputManagerGamepadDisconnected(pad, state) {
        if (InputController.GamepadDisconnected != null) {
            InputController.GamepadDisconnected(pad, state);
        }
    }
}
InputController.MOUSE_DAMPENER = 0.5;
InputController.TAP_THRESHOLD_MS = 200;
InputController.GamepadManager = null;
InputController.GamepadConnected = null;
InputController.GamepadDisconnected = null;
InputController.AllowMobileControls = true;
InputController.MobileControlsActive = false;
InputController.EnablePinchZoomTracking = false;
InputController.PointerLockedFlag = false;
InputController.LockMousePointerObserver = null;
InputController.input = false;
InputController.keymap = {};
InputController.scroll = 0;
InputController.wheel = 0;
InputController.mousex = 0;
InputController.mousey = 0;
InputController.vertical = 0;
InputController.horizontal = 0;
InputController.mousex2 = 0;
InputController.mousey2 = 0;
InputController.vertical2 = 0;
InputController.horizontal2 = 0;
InputController.mousex3 = 0;
InputController.mousey3 = 0;
InputController.vertical3 = 0;
InputController.horizontal3 = 0;
InputController.mousex4 = 0;
InputController.mousey4 = 0;
InputController.vertical4 = 0;
InputController.horizontal4 = 0;
InputController.a_mousex = 0;
InputController.x_scroll = 0;
InputController.x_wheel = 0;
InputController.x_mousex = 0;
InputController.x_mousey = 0;
InputController.x_vertical = 0;
InputController.x_horizontal = 0;
InputController.k_mousex = 0;
InputController.k_mousey = 0;
InputController.k_vertical = 0;
InputController.k_horizontal = 0;
InputController.j_mousex = 0;
InputController.j_mousey = 0;
InputController.j_vertical = 0;
InputController.j_horizontal = 0;
InputController.g_mousex1 = 0;
InputController.g_mousey1 = 0;
InputController.g_vertical1 = 0;
InputController.g_horizontal1 = 0;
InputController.g_mousex2 = 0;
InputController.g_mousey2 = 0;
InputController.g_vertical2 = 0;
InputController.g_horizontal2 = 0;
InputController.g_mousex3 = 0;
InputController.g_mousey3 = 0;
InputController.g_vertical3 = 0;
InputController.g_horizontal3 = 0;
InputController.g_mousex4 = 0;
InputController.g_mousey4 = 0;
InputController.g_vertical4 = 0;
InputController.g_horizontal4 = 0;
InputController.dragDirection = 0;
InputController.pinchZoomState = 0;
InputController.pinchZoomEvents = [];
InputController.pinchZoomDistance = null;
InputController.mouseDownTarget = null;
InputController.mouseDragTarget = null;
InputController.leftButtonDown = false;
InputController.middleButtonDown = false;
InputController.rightButtonDown = false;
InputController.mouseButtonsDown = 0;
InputController.mouseButtonPress = [];
InputController.mouseButtonDown = [];
InputController.mouseButtonUp = [];
InputController.keyButtonPress = [];
InputController.keyButtonDown = [];
InputController.keyButtonUp = [];
InputController.previousPosition = null;
InputController.preventDefault = false;
InputController.rightHanded = true;
InputController.gamepad1 = null;
InputController.gamepad1Type = -1;
InputController.gamepad1ButtonPress = [];
InputController.gamepad1ButtonDown = [];
InputController.gamepad1ButtonUp = [];
InputController.gamepad1DpadPress = [];
InputController.gamepad1DpadDown = [];
InputController.gamepad1DpadUp = [];
InputController.gamepad1LeftTrigger = [];
InputController.gamepad1RightTrigger = [];
InputController.gamepad2 = null;
InputController.gamepad2Type = -1;
InputController.gamepad2ButtonPress = [];
InputController.gamepad2ButtonDown = [];
InputController.gamepad2ButtonUp = [];
InputController.gamepad2DpadPress = [];
InputController.gamepad2DpadDown = [];
InputController.gamepad2DpadUp = [];
InputController.gamepad2LeftTrigger = [];
InputController.gamepad2RightTrigger = [];
InputController.gamepad3 = null;
InputController.gamepad3Type = -1;
InputController.gamepad3ButtonPress = [];
InputController.gamepad3ButtonDown = [];
InputController.gamepad3ButtonUp = [];
InputController.gamepad3DpadPress = [];
InputController.gamepad3DpadDown = [];
InputController.gamepad3DpadUp = [];
InputController.gamepad3LeftTrigger = [];
InputController.gamepad3RightTrigger = [];
InputController.gamepad4 = null;
InputController.gamepad4Type = -1;
InputController.gamepad4ButtonPress = [];
InputController.gamepad4ButtonDown = [];
InputController.gamepad4ButtonUp = [];
InputController.gamepad4DpadPress = [];
InputController.gamepad4DpadDown = [];
InputController.gamepad4DpadUp = [];
InputController.gamepad4LeftTrigger = [];
InputController.gamepad4RightTrigger = [];
export class WindowManager {
    static IsWindows() {
        return (typeof Windows !== "undefined" && typeof Windows.UI !== "undefined" && typeof Windows.System !== "undefined" && typeof Windows.Foundation !== "undefined");
    }
    static IsCordova() {
        return (window.cordova != null);
    }
    static IsWebAssembly() {
        return (window.WebAssembly);
    }
    static IsOculusBrowser() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/OculusBrowser/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsSamsungBrowser() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/SamsungBrowser/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsWindowsPhone() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/Windows Phone/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsBlackBerry() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/BlackBerry/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsOperaMini() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/Opera Mini/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsAndroid() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/Android/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsWebOS() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/webOS/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsIOS() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsIPHONE() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/iPhone/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsIPAD() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/iPad/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsIPOD() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/iPod/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsIE11() {
        return (navigator.maxTouchPoints !== void 0);
    }
    static IsMobile() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            const n = navigator.userAgent;
            if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone|iPad|iPod/i) || n.match(/BlackBerry/i) || n.match(/Opera Mini/i) || n.match(/Windows Phone/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsPlaystation() {
        let result = false;
        if (navigator != null && navigator.userAgent != null) {
            if (navigator.userAgent.match(/Playstation/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsXboxConsole() {
        let result = false;
        if (WindowManager.IsWindows() && typeof Windows.System.Profile !== "undefined" && typeof Windows.System.Profile.AnalyticsInfo !== "undefined" && typeof Windows.System.Profile.AnalyticsInfo.versionInfo !== "undefined" && typeof Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily !== "undefined") {
            let n = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily;
            if (n.match(/Xbox/i)) {
                result = true;
            }
        }
        return result;
    }
    static IsXboxLive() {
        return (WindowManager.IsWindows() && typeof Microsoft !== "undefined" && typeof Microsoft.Xbox !== "undefined" && typeof Microsoft.Xbox.Services !== "undefined");
    }
    static IsFrameWindow() {
        return (window.parent != null && window !== window.parent);
    }
    static IsPortraitWindow() {
        return (WindowManager.GetOrientation() === "portrait");
    }
    static IsLandscapeWindow() {
        return (WindowManager.GetOrientation() === "landscape");
    }
    static IsStandaloneWindow() {
        if (window.navigator.standalone) {
            return true;
        }
        if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
            return true;
        }
        return false;
    }
    static IsFullscreenWindow() {
        if (window.navigator.standalone) {
            return true;
        }
        if (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) {
            return true;
        }
        return false;
    }
    static IsProgressiveWindow() {
        return (WindowManager.IsStandaloneWindow() || WindowManager.IsFullscreenWindow());
    }
    static GetDisplayMode() {
        if (window.navigator.standalone) {
            return "standalone";
        }
        if (window.matchMedia) {
            if (window.matchMedia("(display-mode: fullscreen)").matches) {
                return "fullscreen";
            }
            if (window.matchMedia("(display-mode: standalone)").matches) {
                return "standalone";
            }
            if (window.matchMedia("(display-mode: minimal-ui)").matches) {
                return "minimal-ui";
            }
        }
        return "browser";
    }
    static GetOrientation() {
        let result = "portrait";
        if (window.screen && window.screen.orientation) {
            const orientationType = window.screen.orientation.type;
            if (orientationType.includes("portrait")) {
                result = "portrait";
            }
            else if (orientationType.includes("landscape")) {
                result = "landscape";
            }
        }
        else if (window.orientation) {
            const orientation = window.orientation;
            if (orientation === 0 || orientation === 180) {
                result = "portrait";
            }
            else if (orientation === 90 || orientation === -90) {
                result = "landscape";
            }
        }
        return result;
    }
    static AlertMessage(text, title = "Babylon Toolkit") {
        let result = null;
        if (WindowManager.IsWindows()) {
            result = new Windows.UI.Popups.MessageDialog(text, title).showAsync();
        }
        else {
            window.alert(text);
        }
        return result;
    }
    static GetQueryStringParam(name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    static PostWindowMessage(msg, targetOrigin = "*", localWindow = false) {
        if (localWindow === true) {
            window.postMessage(msg, targetOrigin);
        }
        else {
            if (window.top) {
                window.top.postMessage(msg, targetOrigin);
            }
            else {
                console.warn("No Valid Top Window");
            }
        }
    }
    static LoadLevel(sceneFile, queryString = null) {
        if (window["BJS"] != null && window["BJS"] === "engine.html") {
            let loaderUrl = (window.location.protocol + "//" + window.location.host + ":" + window.location.port + window.location.pathname + "?scene=" + sceneFile);
            if (queryString != null && queryString !== "")
                loaderUrl += queryString;
            window.location.replace(loaderUrl);
        }
        else {
            Tools.Warn("Scene viewer engine.html required to load level: " + sceneFile);
        }
        return false;
    }
    static ShowSceneLoader() {
        if (window.showSceneLoader) {
            window.showSceneLoader();
        }
    }
    static HideSceneLoader() {
        if (window.hideSceneLoader) {
            window.hideSceneLoader();
        }
    }
    static UpdateLoaderStatus(status, details, state) {
        if (window.updateStatus) {
            window.updateStatus(status, details, state);
        }
    }
    static UpdateLoaderDetails(details, state) {
        if (window.updateDetails) {
            window.updateDetails(details, state);
        }
    }
    static UpdateLoaderProgress(progress, state) {
        if (window.updateProgress) {
            window.updateProgress(progress, state);
        }
    }
    static ShowPageErrorMessage(message, title = "Error", timeout = 0) {
        if (window.showErrorMessage) {
            window.showErrorMessage(message, title, timeout);
        }
    }
    static SetTimeout(timeout, func) {
        return window.setTimeout(func, timeout);
    }
    static ClearTimeout(handle) {
        window.clearTimeout(handle);
    }
    static SetInterval(interval, func) {
        return window.setInterval(func, interval);
    }
    static ClearInterval(handle) {
        window.clearInterval(handle);
    }
    static Atob(data) {
        return window.atob(data);
    }
    static Btoa(data) {
        return window.btoa(data);
    }
    static PopupDebug(scene) {
        if (scene.debugLayer) {
            scene.debugLayer.hide();
            scene.debugLayer.show({ enablePopup: true, globalRoot: null });
        }
    }
    static ToggleDebug(scene, embed = false, parent = null) {
        if (scene.debugLayer) {
            const wnd = window;
            if (WindowManager.debugLayerVisible === true) {
                WindowManager.debugLayerVisible = false;
                if (wnd.METER && wnd.METER.show)
                    wnd.METER.show();
                scene.debugLayer.hide();
            }
            else {
                WindowManager.debugLayerVisible = true;
                if (wnd.METER && wnd.METER.hide)
                    wnd.METER.hide();
                scene.debugLayer.show({ embedMode: embed, globalRoot: parent });
            }
        }
    }
    static GetLocalStorageItem(key) {
        return (window.localStorage != null) ? window.localStorage.getItem(key) : null;
    }
    static SetLocalStorageItem(key, value) {
        if (window.localStorage != null)
            window.localStorage.setItem(key, value);
    }
    static GetSessionStorageItem(key) {
        return (window.sessionStorage != null) ? window.sessionStorage.getItem(key) : null;
    }
    static SetSessionStorageItem(key, value) {
        if (window.sessionStorage != null)
            window.sessionStorage.setItem(key, value);
    }
    static GetFilenameFromUrl(url) {
        return url.substring(url.lastIndexOf('/') + 1);
    }
    static GetUrlParameter(key) {
        const name = key.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(window.location.search);
        return (results !== null) ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : null;
    }
    static GetVirtualRealityEnabled() {
        const virtualReality = WindowManager.GetLocalStorageItem("virtualReality");
        return (virtualReality != null && virtualReality === "true");
    }
    static SetVirtualRealityEnabled(enabled) {
        WindowManager.SetLocalStorageItem("virtualReality", enabled.toString().toLowerCase());
    }
    static SetWindowsLaunchMode(mode = 1) {
        if (WindowManager.IsWindows() && typeof Windows.UI.ViewManagement !== "undefined" && typeof Windows.UI.ViewManagement.ApplicationView !== "undefined") {
            Windows.UI.ViewManagement.ApplicationView.preferredLaunchWindowingMode = mode;
        }
    }
    static GetHardwareScalingLevel() {
        return (1 / window.devicePixelRatio);
    }
    static QuitWindowsApplication() {
        if (WindowManager.IsWindows()) {
            window.close();
        }
    }
    static PrintToScreen(text, color = "white") {
        WindowManager.PrintElement = document.getElementById("print");
        if (WindowManager.PrintElement == null) {
            const printer = document.createElement("div");
            printer.id = "print";
            printer.style.position = "absolute";
            printer.style.left = "6px";
            printer.style.bottom = "3px";
            printer.style.fontSize = "12px";
            printer.style.zIndex = "10000";
            printer.style.color = "#0c0";
            printer.style.pointerEvents = "none";
            document.body.appendChild(printer);
            WindowManager.PrintElement = printer;
        }
        if (WindowManager.PrintElement != null && WindowManager.PrintElement.innerHTML !== text) {
            if (WindowManager.PrintElement.style.color !== color)
                WindowManager.PrintElement.style.color = color;
            WindowManager.PrintElement.innerHTML = text;
        }
    }
}
WindowManager.debugLayerVisible = false;
WindowManager.PrintElement = null;
export class AnimationState extends ScriptComponent {
    awakened() { return this._awakened; }
    initialized() { return this._initialized; }
    hasRootMotion() { return this._hasrootmotion; }
    isFirstFrame() { return (this._frametime === 0); }
    isLastFrame() { return (this._frametime >= .985); }
    ikFrameEnabled() { return this._ikFrameEanbled; }
    getAnimationTime() { return this._frametime; }
    getFrameLoopTime() { return this._looptime; }
    getFrameLoopBlend() { return this._loopblend; }
    getAnimationPlaying() { return this._animationplaying; }
    getRuntimeController() { return this._runtimecontroller; }
    getRootBoneTransform() { return this._rootBoneTransform; }
    getDeltaRootMotionAngle() { return this._angularVelocity.y; }
    getDeltaRootMotionSpeed() { return this._rootMotionSpeed; }
    getDeltaRootMotionPosition() { return this._deltaPosition; }
    getDeltaRootMotionRotation() { return this._deltaRotation; }
    getFixedRootMotionPosition() { return (this._dirtyMotionMatrix != null) ? this._rootMotionPosition : null; }
    getFixedRootMotionRotation() { return (this._dirtyMotionMatrix != null) ? this._rootMotionRotation : null; }
    constructor(transform, scene, properties = {}, alias = "AnimationState") {
        super(transform, scene, properties, alias);
        this._looptime = false;
        this._loopblend = false;
        this._frametime = 0;
        this._layercount = 0;
        this._updatemode = 0;
        this._hasrootmotion = false;
        this._animationplaying = false;
        this._initialtargetblending = false;
        this._hastransformhierarchy = false;
        this._leftfeetbottomheight = 0;
        this._rightfeetbottomheight = 0;
        this._runtimecontroller = null;
        this._executed = false;
        this._awakened = false;
        this._initialized = false;
        this._checkers = new TransitionCheck();
        this._source = "";
        this._machine = null;
        this._animationmode = 0;
        this._animationrig = null;
        this._deltaPosition = new Vector3(0, 0, 0);
        this._deltaRotation = new Quaternion(0, 0, 0, 0);
        this._angularVelocity = new Vector3(0, 0, 0);
        this._rootMotionSpeed = 0;
        this._lastMotionSpeed = 0;
        this._loopMotionSpeed = 0;
        this._lastRotateSpeed = 0;
        this._loopRotateSpeed = 0;
        this._lastMotionRotation = new Quaternion(0, 0, 0, 0);
        this._lastMotionPosition = new Vector3(0, 0, 0);
        this._positionWeight = false;
        this._rootBoneWeight = false;
        this._rotationWeight = false;
        this._rootQuatWeight = false;
        this._rootBoneTransform = null;
        this._positionHolder = new Vector3(0, 0, 0);
        this._rootBoneHolder = new Vector3(0, 0, 0);
        this._rotationHolder = new Quaternion(0, 0, 0, 0);
        this._rootQuatHolder = new Quaternion(0, 0, 0, 0);
        this._rootMotionMatrix = Matrix.Zero();
        this._rootMotionScaling = new Vector3(0, 0, 0);
        this._rootMotionRotation = new Quaternion(0, 0, 0, 0);
        this._rootMotionPosition = new Vector3(0, 0, 0);
        this._dirtyMotionMatrix = null;
        this._dirtyBlenderMatrix = null;
        this._targetPosition = new Vector3(0, 0, 0);
        this._targetRotation = new Quaternion(0, 0, 0, 0);
        this._targetScaling = new Vector3(1, 1, 1);
        this._updateMatrix = Matrix.Zero();
        this._blenderMatrix = Matrix.Zero();
        this._blendWeights = new BlendingWeights();
        this._emptyScaling = new Vector3(1, 1, 1);
        this._emptyPosition = new Vector3(0, 0, 0);
        this._emptyRotation = new Quaternion(0, 0, 0, 0);
        this._ikFrameEanbled = false;
        this._data = new Map();
        this._anims = new Map();
        this._clips = null;
        this._numbers = new Map();
        this._booleans = new Map();
        this._triggers = new Map();
        this._parameters = new Map();
        this.speedRatio = 1.0;
        this.delayUpdateUntilReady = true;
        this.enableAnimation = true;
        this.applyRootMotion = false;
        this.onAnimationAwakeObservable = new Observable();
        this.onAnimationInitObservable = new Observable();
        this.onAnimationIKObservable = new Observable();
        this.onAnimationEndObservable = new Observable();
        this.onAnimationLoopObservable = new Observable();
        this.onAnimationEventObservable = new Observable();
        this.onAnimationUpdateObservable = new Observable();
        this.onAnimationTransitionObservable = new Observable();
        this.m_zeroVector = new Vector3(0, 0, 0);
        this.m_defaultGroup = null;
        this.m_animationTargets = null;
        this.m_rotationIdentity = new Quaternion(0, 0, 0, 0);
        this.sourceAnimationGroups = null;
    }
    awake() { this.awakeStateMachine(); }
    update() { this.updateStateMachine(); }
    destroy() { this.destroyStateMachine(); }
    playDefaultAnimation(transitionDuration = 0, animationLayer = 0, frameRate = null) {
        let result = false;
        if (this._initialized === true) {
            if (this._machine != null && this._machine.layers != null && this._machine.layers.length > animationLayer) {
                const layer = this._machine.layers[animationLayer];
                const blendFrameRate = (layer.animationStateMachine != null) ? (layer.animationStateMachine.rate || AnimationState.FPS) : AnimationState.FPS;
                const blendingSpeed = (transitionDuration > 0) ? Utilities.ComputeBlendingSpeed(frameRate || blendFrameRate, transitionDuration) : 0;
                this.playCurrentAnimationState(layer, layer.entry, blendingSpeed);
                result = true;
            }
            else {
                Tools.Warn("No animation state layers on " + this.transform.name);
            }
        }
        else {
            Tools.Warn("Animation state machine not initialized for " + this.transform.name);
        }
        return result;
    }
    playAnimation(state, transitionDuration = 0, animationLayer = 0, frameRate = null) {
        let result = false;
        if (this._initialized === true) {
            if (this._machine != null && this._machine.layers != null && this._machine.layers.length > animationLayer) {
                const layer = this._machine.layers[animationLayer];
                const blendFrameRate = (layer.animationStateMachine != null) ? (layer.animationStateMachine.rate || AnimationState.FPS) : AnimationState.FPS;
                const blendingSpeed = (transitionDuration > 0) ? Utilities.ComputeBlendingSpeed(frameRate || blendFrameRate, transitionDuration) : 0;
                this.playCurrentAnimationState(layer, state, blendingSpeed);
                result = true;
            }
            else {
                Tools.Warn("No animation state layers on " + this.transform.name);
            }
        }
        else {
            Tools.Warn("Animation state machine not initialized for " + this.transform.name);
        }
        return result;
    }
    stopAnimation(animationLayer = 0) {
        let result = false;
        if (this._initialized === true) {
            if (this._machine != null && this._machine.layers != null && this._machine.layers.length > animationLayer) {
                const layer = this._machine.layers[animationLayer];
                this.stopCurrentAnimationState(layer);
                result = true;
            }
            else {
                Tools.Warn("No animation state layers on " + this.transform.name);
            }
        }
        else {
            Tools.Warn("Animation state machine not initialized for " + this.transform.name);
        }
        return result;
    }
    killAnimations() {
        let result = false;
        if (this._initialized === true) {
            if (this._machine != null && this._machine.layers != null) {
                this._machine.layers.forEach((layer) => {
                    this.stopCurrentAnimationState(layer);
                    result = true;
                });
            }
            else {
                Tools.Warn("No animation state layers on " + this.transform.name);
            }
        }
        else {
            Tools.Warn("Animation state machine not initialized for " + this.transform.name);
        }
        return result;
    }
    hasBool(name) {
        return (this._booleans.get(name) != null);
    }
    getBool(name) {
        return this._booleans.get(name) || false;
    }
    setBool(name, value) {
        this._booleans.set(name, value);
    }
    hasFloat(name) {
        return (this._numbers.get(name) != null);
    }
    getFloat(name) {
        return this._numbers.get(name) || 0;
    }
    setFloat(name, value) {
        this._numbers.set(name, value);
    }
    hasInteger(name) {
        return (this._numbers.get(name) != null);
    }
    getInteger(name) {
        return this._numbers.get(name) || 0;
    }
    setInteger(name, value) {
        this._numbers.set(name, value);
    }
    hasTrigger(name) {
        return (this._triggers.get(name) != null);
    }
    getTrigger(name) {
        return this._triggers.get(name) || false;
    }
    setTrigger(name) {
        this._triggers.set(name, true);
    }
    resetTrigger(name) {
        this._triggers.set(name, false);
    }
    setSmoothFloat(name, targetValue, lerpSpeed) {
        const gradient = Scalar.Lerp(this.getFloat(name), targetValue, Math.min(lerpSpeed, 1.0));
        this.setFloat(name, gradient);
    }
    setSmoothInteger(name, targetValue, lerpSpeed) {
        const gradient = Scalar.Lerp(this.getInteger(name), targetValue, Math.min(lerpSpeed, 1.0));
        this.setInteger(name, gradient);
    }
    getMachineState(name) {
        return this._data.get(name);
    }
    setMachineState(name, value) {
        this._data.set(name, value);
    }
    getCurrentState(layer) {
        return (this._machine.layers != null && this._machine.layers.length > layer) ? this._machine.layers[layer].animationStateMachine : null;
    }
    getDefaultClips() {
        return this._clips;
    }
    getDefaultSource() {
        return this._source;
    }
    setLayerWeight(layer, weight) {
    }
    fixAnimationGroup(group) {
        let result = null;
        if (this._clips != null && this._clips.length > 0) {
            for (let index = 0; index < this._clips.length; index++) {
                const xclip = this._clips[index];
                if (xclip.clip != null) {
                    const skey = ("." + xclip.clip).toLowerCase();
                    if (group.name.toLowerCase().endsWith(skey)) {
                        if (group.metadata == null)
                            group.metadata = {};
                        if (group.metadata.toolkit == null)
                            group.metadata.toolkit = xclip;
                        group.metadata.toolkit.source = this._source;
                        result = xclip;
                        break;
                    }
                }
            }
        }
        return result;
    }
    getAnimationGroup(name) {
        return this._anims.get(name);
    }
    getAnimationGroups() {
        return this.sourceAnimationGroups;
    }
    setAnimationGroups(groups) {
        if (this.transform.metadata == null)
            this.transform.metadata = {};
        if (this.transform.metadata.toolkit == null)
            this.transform.metadata.toolkit = {};
        this.transform.metadata.toolkit.sourceAnimationGroups = groups;
        this.setupSourceAnimationGroups();
    }
    updateAnimationGroups(groups) {
        if (groups != null && groups.length > 0) {
            this._anims = new Map();
            this.m_animationTargets = [];
            this.m_defaultGroup = null;
            this.sourceAnimationGroups = null;
            groups.forEach((group) => {
                let issource = false;
                const agroup = group;
                if (agroup != null && agroup.metadata != null && agroup.metadata.toolkit != null && agroup.metadata.toolkit.source != null && agroup.metadata.toolkit.source !== "") {
                    if (agroup.metadata.toolkit.source === this._source) {
                        issource = true;
                    }
                }
                if (issource === true && agroup != null && agroup.metadata != null && agroup.metadata.toolkit != null && agroup.metadata.toolkit.clip != null && agroup.metadata.toolkit.clip !== "") {
                    try {
                        group.stop();
                    }
                    catch { }
                    if (this.sourceAnimationGroups == null)
                        this.sourceAnimationGroups = [];
                    this.sourceAnimationGroups.push(group);
                    this._anims.set(agroup.metadata.toolkit.clip, group);
                    if (this.m_defaultGroup == null)
                        this.m_defaultGroup = group;
                    if (group.targetedAnimations != null && group.targetedAnimations.length > 0) {
                        group.targetedAnimations.forEach((targetedAnimation) => {
                            let indexOfTarget = -1;
                            for (let i = 0; i < this.m_animationTargets.length; i++) {
                                if (this.m_animationTargets[i].target === targetedAnimation.target) {
                                    indexOfTarget = i;
                                    break;
                                }
                            }
                            if (indexOfTarget < 0) {
                                this.m_animationTargets.push(targetedAnimation);
                                if (targetedAnimation.target.metadata == null)
                                    targetedAnimation.target.metadata = {};
                                if (targetedAnimation.target instanceof TransformNode) {
                                    Utilities.ValidateTransformQuaternion(targetedAnimation.target);
                                    const layerMixers = [];
                                    for (let index = 0; index < this._layercount; index++) {
                                        const layerMixer = new AnimationMixer();
                                        layerMixer.positionBuffer = null;
                                        layerMixer.rotationBuffer = null;
                                        layerMixer.scalingBuffer = null;
                                        layerMixer.originalMatrix = null;
                                        layerMixer.blendingFactor = 0;
                                        layerMixer.blendingSpeed = 0;
                                        layerMixer.rootPosition = null;
                                        layerMixer.rootRotation = null;
                                        layerMixers.push(layerMixer);
                                    }
                                    targetedAnimation.target.metadata.mixer = layerMixers;
                                }
                                else if (targetedAnimation.target instanceof MorphTarget) {
                                    const morphLayerMixers = [];
                                    for (let index = 0; index < this._layercount; index++) {
                                        const morphLayerMixer = new AnimationMixer();
                                        morphLayerMixer.influenceBuffer = null;
                                        morphLayerMixers.push(morphLayerMixer);
                                    }
                                    targetedAnimation.target.metadata.mixer = morphLayerMixers;
                                }
                            }
                        });
                    }
                }
            });
        }
    }
    awakeStateMachine() {
        Utilities.ValidateTransformQuaternion(this.transform);
        this.m_animationTargets = [];
        this.m_defaultGroup = null;
        this.m_rotationIdentity = Quaternion.Identity();
        this._source = (this.transform.metadata != null && this.transform.metadata.toolkit != null && this.transform.metadata.toolkit.animator != null && this.transform.metadata.toolkit.animator !== "") ? this.transform.metadata.toolkit.animator : null;
        this._clips = this.getProperty("clips", this._clips);
        this._machine = this.getProperty("machine", this._machine);
        this._updatemode = this.getProperty("updatemode", this._updatemode);
        this._animationrig = this.getProperty("animationrig", this._animationrig);
        this._animationmode = this.getProperty("animationmode", this._animationmode);
        this._hasrootmotion = this.getProperty("hasrootmotion", this._hasrootmotion);
        this._runtimecontroller = this.getProperty("runtimecontroller", this._runtimecontroller);
        this._hastransformhierarchy = this.getProperty("hastransformhierarchy", this._hastransformhierarchy);
        this._leftfeetbottomheight = this.getProperty("leftfeetbottomheight", this._leftfeetbottomheight);
        this._rightfeetbottomheight = this.getProperty("rightfeetbottomheight", this._rightfeetbottomheight);
        this.applyRootMotion = this.getProperty("applyrootmotion", this.applyRootMotion);
        if (this._machine != null) {
            if (this._machine.owner == null || this._machine.owner == undefined || this._machine.owner === "" || this._machine.owner === "*") {
                this._machine.owner = (this.transform.parent != null) ? this.transform.parent.name : this.transform.name;
            }
            else {
            }
            if (this._machine.speed != null) {
                this.speedRatio = this._machine.speed;
            }
            if (this._machine.parameters != null && this._machine.parameters.length > 0) {
                const plist = this._machine.parameters;
                plist.forEach((parameter) => {
                    const name = parameter.name;
                    const type = parameter.type;
                    const curve = parameter.curve;
                    const defaultFloat = parameter.defaultFloat;
                    const defaultBool = parameter.defaultBool;
                    const defaultInt = parameter.defaultInt;
                    this._parameters.set(name, type);
                    if (type === AnimatorParameterType.Bool) {
                        this.setBool(name, defaultBool);
                    }
                    else if (type === AnimatorParameterType.Float) {
                        this.setFloat(name, defaultFloat);
                    }
                    else if (type === AnimatorParameterType.Int) {
                        this.setInteger(name, defaultInt);
                    }
                    else if (type === AnimatorParameterType.Trigger) {
                        this.resetTrigger(name);
                    }
                });
            }
            if (this._machine.layers != null && this._machine.layers.length > 0) {
                this._layercount = this._machine.layers.length;
                this._machine.layers.sort((left, right) => {
                    if (left.index < right.index)
                        return -1;
                    if (left.index > right.index)
                        return 1;
                    return 0;
                });
                this._machine.layers.forEach((layer) => {
                    if (layer.owner == null || layer.owner == undefined || layer.owner === "" || layer.owner === "*") {
                    }
                    else {
                    }
                    layer.animationMaskMap = new Map();
                    if (layer.avatarMask != null && layer.avatarMask.transformPaths != null && layer.avatarMask.transformPaths.length > 0) {
                        for (let i = 0; i < layer.avatarMask.transformPaths.length; i++) {
                            layer.animationMaskMap.set(layer.avatarMask.transformPaths[i], i);
                        }
                    }
                });
            }
        }
        this._awakened = true;
        if (this.onAnimationAwakeObservable && this.onAnimationAwakeObservable.hasObservers()) {
            this.onAnimationAwakeObservable.notifyObservers(this.transform);
        }
    }
    updateStateMachine(deltaTime = null) {
        if (this.delayUpdateUntilReady === false || (this.delayUpdateUntilReady === true && this.isReady())) {
            if (this.sourceAnimationGroups == null) {
                this.setupSourceAnimationGroups();
            }
            if (this.sourceAnimationGroups != null) {
                if (this._executed === false) {
                    this._executed = true;
                    if (this._machine.layers != null && this._machine.layers.length > 0) {
                        this._machine.layers.forEach((layer) => {
                            this.playCurrentAnimationState(layer, layer.entry, 0);
                        });
                    }
                    this._initialized = true;
                    if (this.onAnimationInitObservable && this.onAnimationInitObservable.hasObservers()) {
                        this.onAnimationInitObservable.notifyObservers(this.transform);
                    }
                }
                if (this.enableAnimation === true) {
                    const frameDeltaTime = deltaTime || this.getDeltaSeconds();
                    this.updateAnimationState(frameDeltaTime);
                    this.updateAnimationTargets(frameDeltaTime);
                    if (this.onAnimationUpdateObservable && this.onAnimationUpdateObservable.hasObservers()) {
                        this.onAnimationUpdateObservable.notifyObservers(this.transform);
                    }
                }
            }
        }
    }
    setupSourceAnimationGroups() {
        const sourcegroups = (this.transform.metadata != null && this.transform.metadata.toolkit != null && this.transform.metadata.toolkit.sourceAnimationGroups != null) ? this.transform.metadata.toolkit.sourceAnimationGroups : null;
        if (sourcegroups != null) {
            this.updateAnimationGroups(sourcegroups);
            if (this.sourceAnimationGroups != null) {
                if (this._machine != null && this._machine.states != null && this._machine.states.length > 0) {
                    this._machine.states.forEach((state) => {
                        if (state != null && state.name != null) {
                            if (state.ccurves != null && state.ccurves.length > 0) {
                                state.ccurves.forEach((curve) => {
                                    if (curve.animation != null) {
                                        const anim = Animation.Parse(curve.animation);
                                        if (anim != null) {
                                            if (state.tcurves == null)
                                                state.tcurves = [];
                                            state.tcurves.push(anim);
                                        }
                                    }
                                });
                            }
                            this.setupTreeBranches(state.blendtree);
                            this.setMachineState(state.name, state);
                        }
                    });
                }
            }
        }
    }
    destroyStateMachine() {
        this._data = null;
        this._clips = null;
        this._anims = null;
        this._numbers = null;
        this._booleans = null;
        this._triggers = null;
        this._parameters = null;
        this._checkers = null;
        this._machine = null;
        this.sourceAnimationGroups = null;
        this.onAnimationAwakeObservable.clear();
        this.onAnimationAwakeObservable = null;
        this.onAnimationInitObservable.clear();
        this.onAnimationInitObservable = null;
        this.onAnimationIKObservable.clear();
        this.onAnimationIKObservable = null;
        this.onAnimationEndObservable.clear();
        this.onAnimationEndObservable = null;
        this.onAnimationLoopObservable.clear();
        this.onAnimationLoopObservable = null;
        this.onAnimationEventObservable.clear();
        this.onAnimationEventObservable = null;
        this.onAnimationUpdateObservable.clear();
        this.onAnimationUpdateObservable = null;
        this.onAnimationTransitionObservable.clear();
        this.onAnimationTransitionObservable = null;
    }
    updateAnimationState(deltaTime) {
        if (this._machine.layers != null && this._machine.layers.length > 0) {
            this._machine.layers.forEach((layer) => {
                this.checkStateMachine(layer, deltaTime);
            });
        }
    }
    updateAnimationTargets(deltaTime) {
        this._looptime = false;
        this._loopblend = false;
        this._ikFrameEanbled = false;
        this._animationplaying = false;
        if (this._machine.layers != null && this._machine.layers.length > 0) {
            this._machine.layers.forEach((layer) => {
                if (layer.index === 0)
                    this._frametime = layer.animationTime;
                if (layer.animationStateMachine != null && layer.animationStateMachine.blendtree != null) {
                    if (layer.animationStateMachine.iKOnFeet === true) {
                        this._ikFrameEanbled = true;
                    }
                    if (layer.iKPass === true) {
                        if (this.onAnimationIKObservable && this.onAnimationIKObservable.hasObservers()) {
                            this.onAnimationIKObservable.notifyObservers(layer.index);
                        }
                    }
                    const layerState = layer.animationStateMachine;
                    if (layerState.type === MotionType.Clip && layerState.played !== -1)
                        layerState.played += deltaTime;
                    if (layerState.blendtree.children != null && layerState.blendtree.children.length > 0) {
                        const primaryBlendTree = layerState.blendtree.children[0];
                        if (primaryBlendTree != null) {
                            if (layerState.blendtree.blendType == BlendTreeType.Clip) {
                                const animationTrack = primaryBlendTree.track;
                                if (animationTrack != null) {
                                    const animLength = animationTrack.metadata.toolkit.length;
                                    const frameRatio = (AnimationState.TIME / animLength);
                                    layer.animationTime += (deltaTime * frameRatio * Math.abs(layerState.speed) * Math.abs(this.speedRatio) * AnimationState.SPEED);
                                    if (layer.animationTime > AnimationState.TIME)
                                        layer.animationTime = AnimationState.TIME;
                                    layer.animationNormal = (layer.animationTime > 0) ? Scalar.Clamp(layer.animationTime / AnimationState.TIME, 0, 1) : 0;
                                    const validateTime = (layer.animationNormal >= 0.99) ? 1 : layer.animationNormal;
                                    const formattedTime = parseFloat(validateTime.toFixed(3));
                                    if (layerState.speed < 0)
                                        layer.animationNormal = (1 - layer.animationNormal);
                                    const animationFrameTime = (animLength * layer.animationNormal);
                                    let level = 0.0;
                                    let xspeed = 0.0;
                                    let zspeed = 0.0;
                                    let looptime = false;
                                    let loopblend = false;
                                    let orientationoffsety = 0.0;
                                    let loopblendorientation = true;
                                    let loopblendpositiony = true;
                                    let loopblendpositionxz = true;
                                    const agroup = animationTrack;
                                    if (agroup.metadata != null && agroup.metadata.toolkit != null) {
                                        if (agroup.metadata.toolkit.averagespeed != null) {
                                            xspeed = (agroup.metadata.toolkit.averagespeed.x != null) ? agroup.metadata.toolkit.averagespeed.x : 0;
                                            zspeed = (agroup.metadata.toolkit.averagespeed.z != null) ? agroup.metadata.toolkit.averagespeed.z : 0;
                                        }
                                        if (agroup.metadata.toolkit.settings != null) {
                                            level = (agroup.metadata.toolkit.settings.level != null) ? agroup.metadata.toolkit.settings.level : 0;
                                            looptime = (agroup.metadata.toolkit.settings.looptime != null) ? agroup.metadata.toolkit.settings.looptime : false;
                                            loopblend = (agroup.metadata.toolkit.settings.loopblend != null) ? agroup.metadata.toolkit.settings.loopblend : false;
                                            orientationoffsety = (agroup.metadata.toolkit.settings.orientationoffsety != null) ? agroup.metadata.toolkit.settings.orientationoffsety : 0;
                                            loopblendorientation = (agroup.metadata.toolkit.settings.loopblendorientation != null) ? agroup.metadata.toolkit.settings.loopblendorientation : true;
                                            loopblendpositiony = (agroup.metadata.toolkit.settings.loopblendpositiony != null) ? agroup.metadata.toolkit.settings.loopblendpositiony : true;
                                            loopblendpositionxz = (agroup.metadata.toolkit.settings.loopblendpositionxz != null) ? agroup.metadata.toolkit.settings.loopblendpositionxz : true;
                                        }
                                    }
                                    if (layer.index === 0) {
                                        this._looptime = looptime;
                                        this._loopblend = loopblend;
                                    }
                                    orientationoffsety = Tools.ToRadians(orientationoffsety);
                                    xspeed = Math.abs(xspeed);
                                    zspeed = Math.abs(zspeed);
                                    level *= -1;
                                    if (layer.animationTime >= AnimationState.TIME) {
                                        layer.animationFirstRun = false;
                                        layer.animationLoopFrame = true;
                                        if (looptime === true) {
                                            layer.animationLoopCount++;
                                            if (this.onAnimationLoopObservable && this.onAnimationLoopObservable.hasObservers()) {
                                                this.onAnimationLoopObservable.notifyObservers(layer.index);
                                            }
                                        }
                                        else {
                                            if (layer.animationEndFrame === false) {
                                                layer.animationEndFrame = true;
                                                if (this.onAnimationEndObservable && this.onAnimationEndObservable.hasObservers()) {
                                                    this.onAnimationEndObservable.notifyObservers(layer.index);
                                                }
                                            }
                                        }
                                    }
                                    if (layer.animationFirstRun === true || looptime === true) {
                                        this._animationplaying = true;
                                        animationTrack.targetedAnimations.forEach((targetedAnim) => {
                                            if (targetedAnim.target instanceof TransformNode) {
                                                const clipTarget = targetedAnim.target;
                                                if (layer.index === 0 || layer.avatarMask == null || this.filterTargetAvatarMask(layer, clipTarget)) {
                                                    const targetRootBone = (clipTarget.metadata != null && clipTarget.metadata.toolkit != null && clipTarget.metadata.toolkit.rootbone != null) ? clipTarget.metadata.toolkit.rootbone : false;
                                                    if (targetRootBone === true) {
                                                        if (this._rootBoneTransform == null)
                                                            this._rootBoneTransform = clipTarget;
                                                    }
                                                    if (clipTarget.metadata != null && clipTarget.metadata.mixer != null) {
                                                        const clipTargetMixer = clipTarget.metadata.mixer[layer.index];
                                                        if (clipTargetMixer != null) {
                                                            if (targetedAnim.animation.targetProperty === "position") {
                                                                this._targetPosition = Utilities.SampleAnimationVector3(targetedAnim.animation, animationFrameTime, Animation.ANIMATIONLOOPMODE_CYCLE, true);
                                                                if (targetRootBone === true && this._rootBoneTransform != null) {
                                                                    this._positionWeight = true;
                                                                    this._positionHolder.set(0, 0, 0);
                                                                    this._rootBoneWeight = false;
                                                                    this._rootBoneHolder.set(0, 0, 0);
                                                                    if (this.applyRootMotion === true) {
                                                                        if (loopblendpositiony === true && loopblendpositionxz === true) {
                                                                            this._positionWeight = true;
                                                                            this._positionHolder.set(this._targetPosition.x, (this._targetPosition.y + level), this._targetPosition.z);
                                                                        }
                                                                        else if (loopblendpositiony === false && loopblendpositionxz === false) {
                                                                            this._rootBoneWeight = true;
                                                                            this._rootBoneHolder.set(this._targetPosition.x, (this._targetPosition.y + level), this._targetPosition.z);
                                                                        }
                                                                        else if (loopblendpositiony === true && loopblendpositionxz === false) {
                                                                            this._positionWeight = true;
                                                                            this._positionHolder.set(this.m_zeroVector.x, (this._targetPosition.y + level), this.m_zeroVector.z);
                                                                            this._rootBoneWeight = true;
                                                                            this._rootBoneHolder.set(this._targetPosition.x, this.m_zeroVector.y, this._targetPosition.z);
                                                                        }
                                                                        else if (loopblendpositionxz === true && loopblendpositiony === false) {
                                                                            this._positionWeight = true;
                                                                            this._positionHolder.set(this._targetPosition.x, this.m_zeroVector.y, this._targetPosition.z);
                                                                            this._rootBoneWeight = true;
                                                                            this._rootBoneHolder.set(this.m_zeroVector.x, (this._targetPosition.y + level), this.m_zeroVector.z);
                                                                        }
                                                                    }
                                                                    else {
                                                                        this._positionWeight = true;
                                                                        this._positionHolder.set(this._targetPosition.x, (this._targetPosition.y + level), this._targetPosition.z);
                                                                    }
                                                                    if (this._positionWeight === true) {
                                                                        if (clipTargetMixer.positionBuffer == null)
                                                                            clipTargetMixer.positionBuffer = new Vector3(0, 0, 0);
                                                                        Utilities.BlendVector3Value(clipTargetMixer.positionBuffer, this._positionHolder, 1.0);
                                                                    }
                                                                    if (this._rootBoneWeight === true) {
                                                                        if (clipTargetMixer.rootPosition == null)
                                                                            clipTargetMixer.rootPosition = new Vector3(0, 0, 0);
                                                                        Utilities.BlendVector3Value(clipTargetMixer.rootPosition, this._rootBoneHolder, 1.0);
                                                                    }
                                                                }
                                                                else {
                                                                    if (clipTargetMixer.positionBuffer == null)
                                                                        clipTargetMixer.positionBuffer = new Vector3(0, 0, 0);
                                                                    Utilities.BlendVector3Value(clipTargetMixer.positionBuffer, this._targetPosition, 1.0);
                                                                }
                                                            }
                                                            else if (targetedAnim.animation.targetProperty === "rotationQuaternion") {
                                                                this._targetRotation = Utilities.SampleAnimationQuaternion(targetedAnim.animation, animationFrameTime, Animation.ANIMATIONLOOPMODE_CYCLE, true);
                                                                if (targetRootBone === true && this._rootBoneTransform != null) {
                                                                    this._rotationWeight = false;
                                                                    this._rotationHolder.copyFrom(this.m_rotationIdentity);
                                                                    this._rootQuatWeight = false;
                                                                    this._rootQuatHolder.copyFrom(this.m_rotationIdentity);
                                                                    const eulerAngle = this._targetRotation.toEulerAngles();
                                                                    const orientationAngleY = eulerAngle.y;
                                                                    if (this.applyRootMotion === true) {
                                                                        if (loopblendorientation === true) {
                                                                            this._rotationWeight = true;
                                                                            Quaternion.FromEulerAnglesToRef(eulerAngle.x, (orientationAngleY + orientationoffsety), eulerAngle.z, this._rotationHolder);
                                                                        }
                                                                        else {
                                                                            this._rotationWeight = true;
                                                                            Quaternion.FromEulerAnglesToRef(eulerAngle.x, this.m_zeroVector.y, eulerAngle.z, this._rotationHolder);
                                                                            this._rootQuatWeight = true;
                                                                            Quaternion.FromEulerAnglesToRef(this.m_zeroVector.x, (orientationAngleY + orientationoffsety), this.m_zeroVector.z, this._rootQuatHolder);
                                                                        }
                                                                    }
                                                                    else {
                                                                        this._rotationWeight = true;
                                                                        Quaternion.FromEulerAnglesToRef(eulerAngle.x, (orientationAngleY + orientationoffsety), eulerAngle.z, this._rotationHolder);
                                                                    }
                                                                    if (this._rotationWeight === true) {
                                                                        if (clipTargetMixer.rotationBuffer == null)
                                                                            clipTargetMixer.rotationBuffer = new Quaternion(0, 0, 0, 0);
                                                                        Utilities.BlendQuaternionValue(clipTargetMixer.rotationBuffer, this._rotationHolder, 1.0);
                                                                    }
                                                                    if (this._rootQuatWeight === true) {
                                                                        if (clipTargetMixer.rootRotation == null)
                                                                            clipTargetMixer.rootRotation = new Quaternion(0, 0, 0, 0);
                                                                        Utilities.BlendQuaternionValue(clipTargetMixer.rootRotation, this._rootQuatHolder, 1.0);
                                                                    }
                                                                }
                                                                else {
                                                                    if (clipTargetMixer.rotationBuffer == null)
                                                                        clipTargetMixer.rotationBuffer = new Quaternion(0, 0, 0, 0);
                                                                    Utilities.BlendQuaternionValue(clipTargetMixer.rotationBuffer, this._targetRotation, 1.0);
                                                                }
                                                            }
                                                            else if (targetedAnim.animation.targetProperty === "scaling") {
                                                                this._targetScaling = Utilities.SampleAnimationVector3(targetedAnim.animation, animationFrameTime, Animation.ANIMATIONLOOPMODE_CYCLE, true);
                                                                if (clipTargetMixer.scalingBuffer == null)
                                                                    clipTargetMixer.scalingBuffer = new Vector3(1, 1, 1);
                                                                Utilities.BlendVector3Value(clipTargetMixer.scalingBuffer, this._targetScaling, 1.0);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else if (targetedAnim.target instanceof MorphTarget) {
                                                const morphTarget = targetedAnim.target;
                                                if (morphTarget.metadata != null && morphTarget.metadata.mixer != null) {
                                                    const morphTargetMixer = morphTarget.metadata.mixer[layer.index];
                                                    if (targetedAnim.animation.targetProperty === "influence") {
                                                        const floatValue = Utilities.SampleAnimationFloat(targetedAnim.animation, animationFrameTime, Animation.ANIMATIONLOOPMODE_CYCLE, true);
                                                        if (morphTargetMixer.influenceBuffer == null)
                                                            morphTargetMixer.influenceBuffer = 0;
                                                        morphTargetMixer.influenceBuffer = Utilities.BlendFloatValue(morphTargetMixer.influenceBuffer, floatValue, 1.0);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    if (this._animationplaying == true) {
                                        if (layer.animationStateMachine.tcurves != null && layer.animationStateMachine.tcurves.length > 0) {
                                            layer.animationStateMachine.tcurves.forEach((animation) => {
                                                if (animation.targetProperty != null && animation.targetProperty !== "") {
                                                    const sample = Utilities.SampleAnimationFloat(animation, layer.animationNormal, Animation.ANIMATIONLOOPMODE_CYCLE, true);
                                                    this.setFloat(animation.targetProperty, sample);
                                                }
                                            });
                                        }
                                        if (layer.animationStateMachine.events != null && layer.animationStateMachine.events.length > 0) {
                                            layer.animationStateMachine.events.forEach((animatorEvent) => {
                                                if (formattedTime >= (animatorEvent.time - 0.01) && formattedTime <= (animatorEvent.time + 0.01)) {
                                                    const animEventKey = animatorEvent.function + "_" + animatorEvent.time;
                                                    if (layer.animationLoopEvents == null)
                                                        layer.animationLoopEvents = {};
                                                    if (!layer.animationLoopEvents[animEventKey]) {
                                                        layer.animationLoopEvents[animEventKey] = true;
                                                        if (this.onAnimationEventObservable && this.onAnimationEventObservable.hasObservers()) {
                                                            this.onAnimationEventObservable.notifyObservers(animatorEvent);
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    if (layer.animationLoopFrame === true) {
                                        layer.animationTime = 0;
                                        layer.animationNormal = 0;
                                        layer.animationLoopFrame = false;
                                        layer.animationLoopEvents = null;
                                    }
                                }
                                else {
                                }
                            }
                            else {
                                this._animationplaying = true;
                                this._blendWeights.primary = null;
                                this._blendWeights.secondary = null;
                                const scaledWeightList = [];
                                const primaryBlendTree = layerState.blendtree;
                                this.parseTreeBranches(layer, primaryBlendTree, 1.0, scaledWeightList);
                                const frameRatio = this.computeWeightedFrameRatio(scaledWeightList);
                                layer.animationTime += (deltaTime * frameRatio * Math.abs(layerState.speed) * Math.abs(this.speedRatio) * AnimationState.SPEED);
                                if (layer.animationTime > AnimationState.TIME)
                                    layer.animationTime = AnimationState.TIME;
                                layer.animationNormal = (layer.animationTime > 0) ? Scalar.Clamp(layer.animationTime / AnimationState.TIME, 0, 1) : 0;
                                const validateTime = (layer.animationNormal >= 0.99) ? 1 : layer.animationNormal;
                                const formattedTime = parseFloat(validateTime.toFixed(3));
                                if (layerState.speed < 0)
                                    layer.animationNormal = (1 - layer.animationNormal);
                                const blendingNormalTime = layer.animationNormal;
                                if (layer.animationTime >= AnimationState.TIME) {
                                    layer.animationFirstRun = false;
                                    layer.animationLoopFrame = true;
                                    layer.animationLoopCount++;
                                }
                                const masterAnimationTrack = (scaledWeightList != null && scaledWeightList.length > 0 && scaledWeightList[0].track != null) ? scaledWeightList[0].track : null;
                                if (masterAnimationTrack != null) {
                                    const targetCount = masterAnimationTrack.targetedAnimations.length;
                                    for (let targetIndex = 0; targetIndex < targetCount; targetIndex++) {
                                        const masterAnimimation = masterAnimationTrack.targetedAnimations[targetIndex];
                                        if (masterAnimimation.target instanceof TransformNode) {
                                            const blendTarget = masterAnimimation.target;
                                            if (layer.index === 0 || layer.avatarMask == null || this.filterTargetAvatarMask(layer, blendTarget)) {
                                                const targetRootBone = (blendTarget.metadata != null && blendTarget.metadata.toolkit != null && blendTarget.metadata.toolkit.rootbone != null) ? blendTarget.metadata.toolkit.rootbone : false;
                                                if (targetRootBone === true) {
                                                    if (this._rootBoneTransform == null)
                                                        this._rootBoneTransform = blendTarget;
                                                }
                                                if (blendTarget.metadata != null && blendTarget.metadata.mixer != null) {
                                                    this._initialtargetblending = true;
                                                    const blendTargetMixer = blendTarget.metadata.mixer[layer.index];
                                                    this.updateBlendableTargets(deltaTime, layer, primaryBlendTree, masterAnimimation, targetIndex, blendTargetMixer, blendingNormalTime, targetRootBone, blendTarget);
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                }
                                if (layer.animationStateMachine.tcurves != null && layer.animationStateMachine.tcurves.length > 0) {
                                    layer.animationStateMachine.tcurves.forEach((animation) => {
                                        if (animation.targetProperty != null && animation.targetProperty !== "") {
                                            const sample = Utilities.SampleAnimationFloat(animation, layer.animationNormal, Animation.ANIMATIONLOOPMODE_CYCLE, true);
                                            this.setFloat(animation.targetProperty, sample);
                                        }
                                    });
                                }
                                if (layer.animationStateMachine.events != null && layer.animationStateMachine.events.length > 0) {
                                    layer.animationStateMachine.events.forEach((animatorEvent) => {
                                        if (formattedTime >= (animatorEvent.time - 0.01) && formattedTime <= (animatorEvent.time + 0.01)) {
                                            const animEventKey = animatorEvent.function + "_" + animatorEvent.time;
                                            if (layer.animationLoopEvents == null)
                                                layer.animationLoopEvents = {};
                                            if (!layer.animationLoopEvents[animEventKey]) {
                                                layer.animationLoopEvents[animEventKey] = true;
                                                if (this.onAnimationEventObservable && this.onAnimationEventObservable.hasObservers()) {
                                                    this.onAnimationEventObservable.notifyObservers(animatorEvent);
                                                }
                                            }
                                        }
                                    });
                                }
                                if (layer.animationLoopFrame === true) {
                                    layer.animationTime = 0;
                                    layer.animationNormal = 0;
                                    layer.animationLoopFrame = false;
                                    layer.animationLoopEvents = null;
                                }
                            }
                        }
                    }
                }
            });
        }
        this.finalizeAnimationTargets(deltaTime);
    }
    updateBlendableTargets(deltaTime, layer, tree, masterAnimation, targetIndex, targetMixer, normalizedFrameTime, targetRootBone, blendTarget) {
        if (targetMixer != null && tree.children != null && tree.children.length > 0) {
            for (let index = 0; index < tree.children.length; index++) {
                const child = tree.children[index];
                if (child.weight > 0) {
                    if (child.type === MotionType.Clip) {
                        if (child.track != null) {
                            let level = 0.0;
                            let xspeed = 0.0;
                            let zspeed = 0.0;
                            let loopblend = false;
                            let orientationoffsety = 0.0;
                            let loopblendorientation = true;
                            let loopblendpositiony = true;
                            let loopblendpositionxz = true;
                            const agroup = child.track;
                            if (agroup.metadata != null && agroup.metadata.toolkit != null) {
                                if (agroup.metadata.toolkit.averagespeed != null) {
                                    xspeed = (agroup.metadata.toolkit.averagespeed.x != null) ? agroup.metadata.toolkit.averagespeed.x : 0;
                                    zspeed = (agroup.metadata.toolkit.averagespeed.z != null) ? agroup.metadata.toolkit.averagespeed.z : 0;
                                }
                                if (agroup.metadata.toolkit.settings != null) {
                                    level = (agroup.metadata.toolkit.settings.level != null) ? agroup.metadata.toolkit.settings.level : 0;
                                    loopblend = (agroup.metadata.toolkit.settings.loopblend != null) ? agroup.metadata.toolkit.settings.loopblend : false;
                                    orientationoffsety = (agroup.metadata.toolkit.settings.orientationoffsety != null) ? agroup.metadata.toolkit.settings.orientationoffsety : 0;
                                    loopblendorientation = (agroup.metadata.toolkit.settings.loopblendorientation != null) ? agroup.metadata.toolkit.settings.loopblendorientation : true;
                                    loopblendpositiony = (agroup.metadata.toolkit.settings.loopblendpositiony != null) ? agroup.metadata.toolkit.settings.loopblendpositiony : true;
                                    loopblendpositionxz = (agroup.metadata.toolkit.settings.loopblendpositionxz != null) ? agroup.metadata.toolkit.settings.loopblendpositionxz : true;
                                }
                            }
                            if (layer.index === 0) {
                                this._looptime = true;
                                this._loopblend = loopblend;
                            }
                            orientationoffsety = Tools.ToRadians(orientationoffsety);
                            xspeed = Math.abs(xspeed);
                            zspeed = Math.abs(zspeed);
                            level *= -1;
                            const blendableAnim = child.track.targetedAnimations[targetIndex];
                            const blendableWeight = (this._initialtargetblending === true) ? 1.0 : parseFloat(child.weight.toFixed(2));
                            this._initialtargetblending = false;
                            if (blendableAnim.target === masterAnimation.target && blendableAnim.animation.targetProperty === masterAnimation.animation.targetProperty) {
                                let adjustedFrameTime = normalizedFrameTime;
                                if (child.timescale < 0)
                                    adjustedFrameTime = (1 - adjustedFrameTime);
                                const animLength = child.track.metadata.toolkit.length;
                                const animationFrameTime = (animLength * adjustedFrameTime);
                                if (masterAnimation.animation.targetProperty === "position") {
                                    this._targetPosition = Utilities.SampleAnimationVector3(blendableAnim.animation, animationFrameTime, Animation.ANIMATIONLOOPMODE_CYCLE, true);
                                    if (targetRootBone === true && this._rootBoneTransform != null) {
                                        this._positionWeight = true;
                                        this._positionHolder.set(0, 0, 0);
                                        this._rootBoneWeight = false;
                                        this._rootBoneHolder.set(0, 0, 0);
                                        if (this.applyRootMotion === true) {
                                            if (loopblendpositiony === true && loopblendpositionxz === true) {
                                                this._positionWeight = true;
                                                this._positionHolder.set(this._targetPosition.x, (this._targetPosition.y + level), this._targetPosition.z);
                                            }
                                            else if (loopblendpositiony === false && loopblendpositionxz === false) {
                                                this._rootBoneWeight = true;
                                                this._rootBoneHolder.set(this._targetPosition.x, (this._targetPosition.y + level), this._targetPosition.z);
                                            }
                                            else if (loopblendpositiony === true && loopblendpositionxz === false) {
                                                this._positionWeight = true;
                                                this._positionHolder.set(this.m_zeroVector.x, (this._targetPosition.y + level), this.m_zeroVector.z);
                                                this._rootBoneWeight = true;
                                                this._rootBoneHolder.set(this._targetPosition.x, this.m_zeroVector.y, this._targetPosition.z);
                                            }
                                            else if (loopblendpositionxz === true && loopblendpositiony === false) {
                                                this._positionWeight = true;
                                                this._positionHolder.set(this._targetPosition.x, this.m_zeroVector.y, this._targetPosition.z);
                                                this._rootBoneWeight = true;
                                                this._rootBoneHolder.set(this.m_zeroVector.x, (this._targetPosition.y + level), this.m_zeroVector.z);
                                            }
                                        }
                                        else {
                                            this._positionWeight = true;
                                            this._positionHolder.set(this._targetPosition.x, (this._targetPosition.y + level), this._targetPosition.z);
                                        }
                                        if (this._positionWeight === true) {
                                            if (targetMixer.positionBuffer == null)
                                                targetMixer.positionBuffer = new Vector3(0, 0, 0);
                                            Utilities.BlendVector3Value(targetMixer.positionBuffer, this._positionHolder, blendableWeight);
                                        }
                                        if (this._rootBoneWeight === true) {
                                            if (targetMixer.rootPosition == null)
                                                targetMixer.rootPosition = new Vector3(0, 0, 0);
                                            Utilities.BlendVector3Value(targetMixer.rootPosition, this._rootBoneHolder, blendableWeight);
                                        }
                                    }
                                    else {
                                        if (targetMixer.positionBuffer == null)
                                            targetMixer.positionBuffer = new Vector3(0, 0, 0);
                                        Utilities.BlendVector3Value(targetMixer.positionBuffer, this._targetPosition, blendableWeight);
                                    }
                                }
                                else if (masterAnimation.animation.targetProperty === "rotationQuaternion") {
                                    this._targetRotation = Utilities.SampleAnimationQuaternion(blendableAnim.animation, animationFrameTime, Animation.ANIMATIONLOOPMODE_CYCLE, true);
                                    if (targetRootBone === true && this._rootBoneTransform != null) {
                                        this._rotationWeight = false;
                                        this._rotationHolder.copyFrom(this.m_rotationIdentity);
                                        this._rootQuatWeight = false;
                                        this._rootQuatHolder.copyFrom(this.m_rotationIdentity);
                                        const eulerAngle = this._targetRotation.toEulerAngles();
                                        const orientationAngleY = eulerAngle.y;
                                        if (this.applyRootMotion === true) {
                                            if (loopblendorientation === true) {
                                                this._rotationWeight = true;
                                                Quaternion.FromEulerAnglesToRef(eulerAngle.x, (orientationAngleY + orientationoffsety), eulerAngle.z, this._rotationHolder);
                                            }
                                            else {
                                                this._rotationWeight = true;
                                                Quaternion.FromEulerAnglesToRef(eulerAngle.x, this.m_zeroVector.y, eulerAngle.z, this._rotationHolder);
                                                this._rootQuatWeight = true;
                                                Quaternion.FromEulerAnglesToRef(this.m_zeroVector.x, (orientationAngleY + orientationoffsety), this.m_zeroVector.z, this._rootQuatHolder);
                                            }
                                        }
                                        else {
                                            this._rotationWeight = true;
                                            Quaternion.FromEulerAnglesToRef(eulerAngle.x, (orientationAngleY + orientationoffsety), eulerAngle.z, this._rotationHolder);
                                        }
                                        if (this._rotationWeight === true) {
                                            if (targetMixer.rotationBuffer == null)
                                                targetMixer.rotationBuffer = new Quaternion(0, 0, 0, 0);
                                            Utilities.BlendQuaternionValue(targetMixer.rotationBuffer, this._rotationHolder, blendableWeight);
                                        }
                                        if (this._rootQuatWeight === true) {
                                            if (targetMixer.rootRotation == null)
                                                targetMixer.rootRotation = new Quaternion(0, 0, 0, 0);
                                            Utilities.BlendQuaternionValue(targetMixer.rootRotation, this._rootQuatHolder, blendableWeight);
                                        }
                                    }
                                    else {
                                        if (targetMixer.rotationBuffer == null)
                                            targetMixer.rotationBuffer = new Quaternion(0, 0, 0, 0);
                                        Utilities.BlendQuaternionValue(targetMixer.rotationBuffer, this._targetRotation, blendableWeight);
                                    }
                                }
                                else if (masterAnimation.animation.targetProperty === "scaling") {
                                    this._targetScaling = Utilities.SampleAnimationVector3(blendableAnim.animation, animationFrameTime, Animation.ANIMATIONLOOPMODE_CYCLE, true);
                                    if (targetMixer.scalingBuffer == null)
                                        targetMixer.scalingBuffer = new Vector3(1, 1, 1);
                                    Utilities.BlendVector3Value(targetMixer.scalingBuffer, this._targetScaling, blendableWeight);
                                }
                            }
                            else {
                            }
                        }
                    }
                    else if (child.type === MotionType.Tree) {
                        this.updateBlendableTargets(deltaTime, layer, child.subtree, masterAnimation, targetIndex, targetMixer, normalizedFrameTime, targetRootBone, blendTarget);
                    }
                }
            }
        }
    }
    finalizeAnimationTargets(deltaTime) {
        this._deltaPosition.set(0, 0, 0);
        this._deltaRotation.set(0, 0, 0, 0);
        this._angularVelocity.set(0, 0, 0);
        this._rootMotionSpeed = 0;
        this._rootMotionMatrix.reset();
        this._dirtyMotionMatrix = null;
        this._rootMotionPosition.set(0, 0, 0);
        this._rootMotionRotation.set(0, 0, 0, 0);
        if (this.m_animationTargets != null && this.m_animationTargets.length > 0) {
            this.m_animationTargets.forEach((targetedAnim) => {
                const animationTarget = targetedAnim.target;
                if (animationTarget.metadata != null && animationTarget.metadata.mixer != null) {
                    if (this._machine.layers != null && this._machine.layers.length > 0) {
                        this._blenderMatrix.reset();
                        this._dirtyBlenderMatrix = null;
                        this._machine.layers.forEach((layer) => {
                            const animationTargetMixer = animationTarget.metadata.mixer[layer.index];
                            if (animationTargetMixer != null) {
                                if (animationTarget instanceof TransformNode) {
                                    if (animationTargetMixer.positionBuffer != null || animationTargetMixer.rotationBuffer != null || animationTargetMixer.scalingBuffer != null) {
                                        Matrix.ComposeToRef((animationTargetMixer.scalingBuffer || animationTarget.scaling), (animationTargetMixer.rotationBuffer || animationTarget.rotationQuaternion), (animationTargetMixer.positionBuffer || animationTarget.position), this._updateMatrix);
                                        if (animationTargetMixer.blendingSpeed > 0.0) {
                                            if (animationTargetMixer.blendingFactor <= 1.0 && animationTargetMixer.originalMatrix == null) {
                                                animationTargetMixer.originalMatrix = Matrix.Compose((animationTarget.scaling), (animationTarget.rotationQuaternion), (animationTarget.position));
                                            }
                                            if (animationTargetMixer.blendingFactor <= 1.0 && animationTargetMixer.originalMatrix != null) {
                                                Utilities.FastMatrixSlerp(animationTargetMixer.originalMatrix, this._updateMatrix, animationTargetMixer.blendingFactor, this._updateMatrix);
                                                animationTargetMixer.blendingFactor += animationTargetMixer.blendingSpeed;
                                            }
                                        }
                                        Utilities.FastMatrixSlerp(this._blenderMatrix, this._updateMatrix, layer.defaultWeight, this._blenderMatrix);
                                        this._dirtyBlenderMatrix = true;
                                        animationTargetMixer.positionBuffer = null;
                                        animationTargetMixer.rotationBuffer = null;
                                        animationTargetMixer.scalingBuffer = null;
                                    }
                                    this._emptyPosition.set(0, 0, 0);
                                    this._emptyRotation.set(0, 0, 0, 0);
                                    this._emptyScaling.set(1, 1, 1);
                                    if (animationTargetMixer.rootPosition != null || animationTargetMixer.rootRotation != null) {
                                        const safeScaling = this._emptyPosition;
                                        const safeRotation = animationTargetMixer.rootRotation ? animationTargetMixer.rootRotation.clone() : this._emptyRotation;
                                        const safePosition = animationTargetMixer.rootPosition ? animationTargetMixer.rootPosition.clone() : this._emptyPosition;
                                        Matrix.ComposeToRef(safeScaling, safeRotation, safePosition, this._updateMatrix);
                                        Utilities.FastMatrixSlerp(this._rootMotionMatrix, this._updateMatrix, layer.defaultWeight, this._rootMotionMatrix);
                                        this._dirtyMotionMatrix = true;
                                        animationTargetMixer.rootPosition = null;
                                        animationTargetMixer.rootRotation = null;
                                    }
                                }
                                else if (animationTarget instanceof MorphTarget) {
                                    if (animationTargetMixer.influenceBuffer != null) {
                                        animationTarget.influence = Scalar.Lerp(animationTarget.influence, animationTargetMixer.influenceBuffer, layer.defaultWeight);
                                        animationTargetMixer.influenceBuffer = null;
                                    }
                                }
                            }
                        });
                        if (this._dirtyBlenderMatrix != null) {
                            this._blenderMatrix.decompose(animationTarget.scaling, animationTarget.rotationQuaternion, animationTarget.position);
                        }
                    }
                }
            });
        }
        if (this.applyRootMotion === true) {
            if (this._dirtyMotionMatrix != null) {
                this._rootMotionMatrix.decompose(this._rootMotionScaling, this._rootMotionRotation, this._rootMotionPosition);
                if (this.isFirstFrame() === true) {
                    this._deltaPosition.copyFrom(this._rootMotionPosition);
                    this._deltaRotation.copyFrom(this._rootMotionRotation);
                }
                else if (this.isLastFrame() === true) {
                    this._rootMotionPosition.subtractToRef(this._lastMotionPosition, this._deltaPosition);
                    Utilities.QuaternionDiffToRef(this._rootMotionRotation, this._lastMotionRotation, this._deltaRotation);
                    if (this._looptime === true && this._loopblend === true) {
                        let loopBlendSpeed = (this._loopMotionSpeed + this._lastMotionSpeed);
                        if (loopBlendSpeed !== 0)
                            loopBlendSpeed = (loopBlendSpeed / 2);
                        this._deltaPosition.normalize();
                        this._deltaPosition.scaleInPlace(loopBlendSpeed * deltaTime);
                        let loopBlendRotate = (this._loopRotateSpeed + this._lastRotateSpeed);
                        if (loopBlendRotate !== 0)
                            loopBlendRotate = (loopBlendRotate / 2);
                        this._deltaRotation.toEulerAnglesToRef(this._angularVelocity);
                        Quaternion.FromEulerAnglesToRef(this._angularVelocity.x, loopBlendRotate, this._angularVelocity.z, this._deltaRotation);
                    }
                }
                else {
                    this._rootMotionPosition.subtractToRef(this._lastMotionPosition, this._deltaPosition);
                    Utilities.QuaternionDiffToRef(this._rootMotionRotation, this._lastMotionRotation, this._deltaRotation);
                }
                const deltaSpeed = this._deltaPosition.length();
                this._rootMotionSpeed = (deltaSpeed > 0) ? (deltaSpeed / deltaTime) : deltaSpeed;
                this._deltaRotation.toEulerAnglesToRef(this._angularVelocity);
                this._lastMotionPosition.copyFrom(this._rootMotionPosition);
                this._lastMotionRotation.copyFrom(this._rootMotionRotation);
                this._lastMotionSpeed = this._rootMotionSpeed;
                this._lastRotateSpeed = this._angularVelocity.y;
                if (this._frametime === 0) {
                    this._loopMotionSpeed = this._rootMotionSpeed;
                    this._loopRotateSpeed = this._angularVelocity.y;
                }
            }
        }
    }
    checkStateMachine(layer, deltaTime) {
        this._checkers.result = null;
        this._checkers.offest = 0;
        this._checkers.blending = 0;
        this._checkers.triggered = [];
        if (layer.animationStateMachine != null) {
            layer.animationStateMachine.time += deltaTime;
            this.checkStateTransitions(layer, layer.animationStateMachine.transitions);
            if (this._checkers.result == null && this._machine.transitions != null) {
                this.checkStateTransitions(layer, this._machine.transitions);
            }
        }
        if (this._checkers.triggered != null && this._checkers.triggered.length > 0) {
            this._checkers.triggered.forEach((trigger) => { this.resetTrigger(trigger); });
            this._checkers.triggered = null;
        }
        if (this._checkers.result != null) {
            if (this.onAnimationTransitionObservable && this.onAnimationTransitionObservable.hasObservers()) {
                this.onAnimationTransitionObservable.notifyObservers(this.transform);
            }
            this.playCurrentAnimationState(layer, this._checkers.result, this._checkers.blending, this._checkers.offest);
        }
    }
    checkStateTransitions(layer, transitions) {
        let currentAnimationRate = layer.animationStateMachine.rate;
        let currentAnimationLength = layer.animationStateMachine.length;
        if (transitions != null && transitions.length > 0) {
            let i = 0;
            let ii = 0;
            let solo = -1;
            for (i = 0; i < transitions.length; i++) {
                if (transitions[i].solo === true && transitions[i].mute === false) {
                    solo = i;
                    break;
                }
            }
            for (i = 0; i < transitions.length; i++) {
                const transition = transitions[i];
                if (transition.layerIndex !== layer.index)
                    continue;
                if (transition.mute === true)
                    continue;
                if (solo >= 0 && solo !== i)
                    continue;
                let transitionOk = false;
                let exitTimeSecs = 0;
                let exitTimeExpired = true;
                if (transition.exitTime > 0) {
                    exitTimeSecs = (currentAnimationLength * transition.exitTime) / this.speedRatio;
                    exitTimeExpired = (transition.hasExitTime === true) ? (layer.animationStateMachine.time >= exitTimeSecs) : true;
                }
                if (transition.hasExitTime === true && transition.intSource == InterruptionSource.None && exitTimeExpired === false)
                    continue;
                if (transition.conditions != null && transition.conditions.length > 0) {
                    let passed = 0;
                    let checks = transition.conditions.length;
                    transition.conditions.forEach((condition) => {
                        const ptype = this._parameters.get(condition.parameter);
                        if (ptype != null) {
                            if (ptype == AnimatorParameterType.Float || ptype == AnimatorParameterType.Int) {
                                const numValue = parseFloat(this.getFloat(condition.parameter).toFixed(2));
                                if (condition.mode === ConditionMode.Greater && numValue > condition.threshold) {
                                    passed++;
                                }
                                else if (condition.mode === ConditionMode.Less && numValue < condition.threshold) {
                                    passed++;
                                }
                                else if (condition.mode === ConditionMode.Equals && numValue === condition.threshold) {
                                    passed++;
                                }
                                else if (condition.mode === ConditionMode.NotEqual && numValue !== condition.threshold) {
                                    passed++;
                                }
                            }
                            else if (ptype == AnimatorParameterType.Bool) {
                                const boolValue = this.getBool(condition.parameter);
                                if (condition.mode === ConditionMode.If && boolValue === true) {
                                    passed++;
                                }
                                else if (condition.mode === ConditionMode.IfNot && boolValue === false) {
                                    passed++;
                                }
                            }
                            else if (ptype == AnimatorParameterType.Trigger) {
                                const triggerValue = this.getTrigger(condition.parameter);
                                if (triggerValue === true) {
                                    passed++;
                                    let indexOfTrigger = -1;
                                    for (let i = 0; i < this._checkers.triggered.length; i++) {
                                        if (this._checkers.triggered[i] === condition.parameter) {
                                            indexOfTrigger = i;
                                            break;
                                        }
                                    }
                                    if (indexOfTrigger < 0) {
                                        this._checkers.triggered.push(condition.parameter);
                                    }
                                }
                            }
                        }
                    });
                    if (transition.hasExitTime === true) {
                        transitionOk = (exitTimeExpired === true && passed === checks);
                    }
                    else {
                        transitionOk = (passed === checks);
                    }
                }
                else {
                    transitionOk = (transition.hasExitTime === true && exitTimeExpired === true);
                }
                if (transitionOk === true) {
                    if (transition.hasExitTime === true && exitTimeExpired === true) {
                        if (this.onAnimationEndObservable && this.onAnimationEndObservable.hasObservers()) {
                            this.onAnimationEndObservable.notifyObservers(layer.index);
                        }
                    }
                    const blendRate = (currentAnimationRate > 0) ? currentAnimationRate : AnimationState.FPS;
                    const destState = (transition.isExit === false) ? transition.destination : AnimationState.EXIT;
                    const durationSecs = (transition.fixedDuration === true) ? transition.duration : Scalar.Denormalize(transition.duration, 0, currentAnimationLength);
                    const blendingSpeed = Utilities.ComputeBlendingSpeed(blendRate, durationSecs);
                    const normalizedOffset = transition.offset;
                    this._checkers.result = destState;
                    this._checkers.offest = normalizedOffset;
                    this._checkers.blending = blendingSpeed;
                    break;
                }
            }
        }
    }
    playCurrentAnimationState(layer, name, blending, normalizedOffset = 0) {
        if (layer == null)
            return;
        if (name == null || name === "" || name === AnimationState.EXIT)
            return;
        if (layer.animationStateMachine != null && layer.animationStateMachine.name === name)
            return;
        if (this.m_animationTargets != null && this.m_animationTargets.length > 0) {
            this.m_animationTargets.forEach((targetedAnim) => {
                const animationTarget = targetedAnim.target;
                if (animationTarget.metadata != null && animationTarget.metadata.mixer != null) {
                    const animationTargetMixer = animationTarget.metadata.mixer[layer.index];
                    if (animationTargetMixer != null) {
                        animationTargetMixer.originalMatrix = null;
                        animationTargetMixer.blendingFactor = 0;
                        animationTargetMixer.blendingSpeed = blending;
                    }
                }
            });
        }
        const state = this.getMachineState(name);
        if (state != null && state.layerIndex === layer.index) {
            state.time = 0;
            state.played = 0;
            state.interrupted = false;
            layer.animationTime = Scalar.Clamp(normalizedOffset);
            layer.animationNormal = 0;
            layer.animationFirstRun = true;
            layer.animationEndFrame = false;
            layer.animationLoopFrame = false;
            layer.animationLoopCount = 0;
            layer.animationLoopEvents = null;
            layer.animationStateMachine = state;
            this._deltaPosition.set(0, 0, 0);
            this._deltaRotation.set(0, 0, 0, 0);
            this._angularVelocity.set(0, 0, 0);
            this._rootMotionSpeed = 0;
            this._rootMotionMatrix.reset();
            this._dirtyMotionMatrix = null;
            this._rootMotionPosition.set(0, 0, 0);
            this._rootMotionRotation.set(0, 0, 0, 0);
            this._lastMotionPosition.set(0, 0, 0);
            this._lastMotionRotation.set(0, 0, 0, 0);
        }
    }
    stopCurrentAnimationState(layer) {
        if (layer == null)
            return;
        if (this.m_animationTargets != null && this.m_animationTargets.length > 0) {
            this.m_animationTargets.forEach((targetedAnim) => {
                const animationTarget = targetedAnim.target;
                if (animationTarget.metadata != null && animationTarget.metadata.mixer != null) {
                    const animationTargetMixer = animationTarget.metadata.mixer[layer.index];
                    if (animationTargetMixer != null) {
                        animationTargetMixer.originalMatrix = null;
                        animationTargetMixer.blendingFactor = 0;
                        animationTargetMixer.blendingSpeed = 0;
                    }
                }
            });
        }
        layer.animationTime = 0;
        layer.animationNormal = 0;
        layer.animationFirstRun = true;
        layer.animationEndFrame = false;
        layer.animationLoopFrame = false;
        layer.animationLoopCount = 0;
        layer.animationLoopEvents = null;
        layer.animationStateMachine = null;
        this._deltaPosition.set(0, 0, 0);
        this._deltaRotation.set(0, 0, 0, 0);
        this._angularVelocity.set(0, 0, 0);
        this._rootMotionSpeed = 0;
        this._rootMotionMatrix.reset();
        this._dirtyMotionMatrix = null;
        this._rootMotionPosition.set(0, 0, 0);
        this._rootMotionRotation.set(0, 0, 0, 0);
        this._lastMotionPosition.set(0, 0, 0);
        this._lastMotionRotation.set(0, 0, 0, 0);
    }
    checkAvatarTransformPath(layer, transformPath) {
        let result = false;
        if (layer.animationMaskMap != null) {
            const transformIndex = layer.animationMaskMap.get(transformPath);
            if (transformIndex != null && transformIndex >= 0) {
                result = true;
            }
        }
        return result;
    }
    filterTargetAvatarMask(layer, target) {
        let result = false;
        if (target.metadata != null && target.metadata.toolkit != null && target.metadata.toolkit.bone != null && target.metadata.toolkit.bone !== "") {
            const transformPath = target.metadata.toolkit.bone;
            result = this.checkAvatarTransformPath(layer, transformPath);
        }
        return result;
    }
    sortWeightedBlendingList(weightList) {
        if (weightList != null && weightList.length > 0) {
            weightList.sort((left, right) => {
                if (left.weight < right.weight)
                    return 1;
                if (left.weight > right.weight)
                    return -1;
                return 0;
            });
        }
    }
    computeWeightedFrameRatio(weightList) {
        let result = 1.0;
        if (weightList != null && weightList.length > 0) {
            this.sortWeightedBlendingList(weightList);
            this._blendWeights.primary = weightList[0];
            const primaryWeight = this._blendWeights.primary.weight;
            if (primaryWeight < 1.0 && weightList.length > 1) {
                this._blendWeights.secondary = weightList[1];
            }
            if (this._blendWeights.primary != null && this._blendWeights.secondary != null) {
                const frameWeightDelta = Scalar.Clamp(this._blendWeights.primary.weight);
                result = Scalar.Lerp(this._blendWeights.secondary.ratio, this._blendWeights.primary.ratio, frameWeightDelta);
            }
            else if (this._blendWeights.primary != null && this._blendWeights.secondary == null) {
                result = this._blendWeights.primary.ratio;
            }
        }
        return result;
    }
    setupTreeBranches(tree) {
        if (tree != null && tree.children != null && tree.children.length > 0) {
            tree.children.forEach((child) => {
                if (child.type === MotionType.Tree) {
                    this.setupTreeBranches(child.subtree);
                }
                else if (child.type === MotionType.Clip) {
                    if (child.motion != null && child.motion !== "") {
                        child.weight = 0;
                        child.ratio = 0;
                        child.track = this.getAnimationGroup(child.motion);
                        if (child.track != null) {
                            const animLength = child.track.metadata.toolkit.length;
                            child.ratio = (AnimationState.TIME / animLength);
                        }
                    }
                }
            });
        }
    }
    parseTreeBranches(layer, tree, parentWeight, weightList) {
        if (tree != null) {
            tree.valueParameterX = (tree.blendParameterX != null) ? parseFloat(this.getFloat(tree.blendParameterX).toFixed(2)) : 0;
            tree.valueParameterY = (tree.blendParameterY != null) ? parseFloat(this.getFloat(tree.blendParameterY).toFixed(2)) : 0;
            switch (tree.blendType) {
                case BlendTreeType.Simple1D:
                    this.parse1DSimpleTreeBranches(layer, tree, parentWeight, weightList);
                    break;
                case BlendTreeType.SimpleDirectional2D:
                    this.parse2DSimpleDirectionalTreeBranches(layer, tree, parentWeight, weightList);
                    break;
                case BlendTreeType.FreeformDirectional2D:
                    this.parse2DFreeformDirectionalTreeBranches(layer, tree, parentWeight, weightList);
                    break;
                case BlendTreeType.FreeformCartesian2D:
                    this.parse2DFreeformCartesianTreeBranches(layer, tree, parentWeight, weightList);
                    break;
            }
        }
    }
    parse1DSimpleTreeBranches(layer, tree, parentWeight, weightList) {
        if (tree != null && tree.children != null && tree.children.length > 0) {
            const blendTreeArray = [];
            tree.children.forEach((child) => {
                child.weight = 0;
                const item = {
                    source: child,
                    motion: child.motion,
                    posX: child.threshold,
                    posY: child.threshold,
                    weight: child.weight
                };
                blendTreeArray.push(item);
            });
            BlendTreeSystem.Calculate1DSimpleBlendTree(tree.valueParameterX, blendTreeArray);
            blendTreeArray.forEach((element) => {
                if (element.source != null) {
                    element.source.weight = element.weight;
                }
            });
            tree.children.forEach((child) => {
                child.weight *= parentWeight;
                if (child.type === MotionType.Clip) {
                    if (child.weight > 0) {
                        weightList.push(child);
                    }
                }
                if (child.type === MotionType.Tree) {
                    this.parseTreeBranches(layer, child.subtree, child.weight, weightList);
                }
            });
        }
    }
    parse2DSimpleDirectionalTreeBranches(layer, tree, parentWeight, weightList) {
        if (tree != null && tree.children != null && tree.children.length > 0) {
            const blendTreeArray = [];
            tree.children.forEach((child) => {
                child.weight = 0;
                const item = {
                    source: child,
                    motion: child.motion,
                    posX: child.positionX,
                    posY: child.positionY,
                    weight: child.weight
                };
                blendTreeArray.push(item);
            });
            BlendTreeSystem.Calculate2DFreeformDirectional(tree.valueParameterX, tree.valueParameterY, blendTreeArray);
            blendTreeArray.forEach((element) => {
                if (element.source != null) {
                    element.source.weight = element.weight;
                }
            });
            tree.children.forEach((child) => {
                child.weight *= parentWeight;
                if (child.type === MotionType.Clip) {
                    if (child.weight > 0) {
                        weightList.push(child);
                    }
                }
                if (child.type === MotionType.Tree) {
                    this.parseTreeBranches(layer, child.subtree, child.weight, weightList);
                }
            });
        }
    }
    parse2DFreeformDirectionalTreeBranches(layer, tree, parentWeight, weightList) {
        if (tree != null && tree.children != null && tree.children.length > 0) {
            const blendTreeArray = [];
            tree.children.forEach((child) => {
                child.weight = 0;
                const item = {
                    source: child,
                    motion: child.motion,
                    posX: child.positionX,
                    posY: child.positionY,
                    weight: child.weight
                };
                blendTreeArray.push(item);
            });
            BlendTreeSystem.Calculate2DFreeformDirectional(tree.valueParameterX, tree.valueParameterY, blendTreeArray);
            blendTreeArray.forEach((element) => {
                if (element.source != null) {
                    element.source.weight = element.weight;
                }
            });
            tree.children.forEach((child) => {
                child.weight *= parentWeight;
                if (child.type === MotionType.Clip) {
                    if (child.weight > 0) {
                        weightList.push(child);
                    }
                }
                if (child.type === MotionType.Tree) {
                    this.parseTreeBranches(layer, child.subtree, child.weight, weightList);
                }
            });
        }
    }
    parse2DFreeformCartesianTreeBranches(layer, tree, parentWeight, weightList) {
        if (tree != null && tree.children != null && tree.children.length > 0) {
            const blendTreeArray = [];
            tree.children.forEach((child) => {
                child.weight = 0;
                const item = {
                    source: child,
                    motion: child.motion,
                    posX: child.positionX,
                    posY: child.positionY,
                    weight: child.weight
                };
                blendTreeArray.push(item);
            });
            BlendTreeSystem.Calculate2DFreeformCartesian(tree.valueParameterX, tree.valueParameterY, blendTreeArray);
            blendTreeArray.forEach((element) => {
                if (element.source != null) {
                    element.source.weight = element.weight;
                }
            });
            tree.children.forEach((child) => {
                child.weight *= parentWeight;
                if (child.type === MotionType.Clip) {
                    if (child.weight > 0) {
                        weightList.push(child);
                    }
                }
                if (child.type === MotionType.Tree) {
                    this.parseTreeBranches(layer, child.subtree, child.weight, weightList);
                }
            });
        }
    }
}
AnimationState.FPS = 30;
AnimationState.EXIT = "[EXIT]";
AnimationState.TIME = 1.0;
AnimationState.SPEED = 1.0;
export class BlendTreeValue {
    constructor(config) {
        this.source = config.source;
        this.motion = config.motion;
        this.posX = config.posX || 0;
        this.posY = config.posY || 0;
        this.weight = config.weight || 0;
    }
}
export class BlendTreeUtils {
    static ClampValue(num, min, max) {
        return num <= min ? min : num >= max ? max : num;
    }
    static GetSignedAngle(a, b) {
        return Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
    }
    static GetLinearInterpolation(x0, y0, x1, y1, x) {
        return y0 + (x - x0) * ((y1 - y0) / (x1 - x0));
    }
    static GetRightNeighbourIndex(inputX, blendTreeArray) {
        blendTreeArray.sort((a, b) => { return (a.posX - b.posX); });
        for (let i = 0; i < blendTreeArray.length; ++i) {
            if (blendTreeArray[i].posX > inputX) {
                return i;
            }
        }
        return -1;
    }
}
export class BlendTreeSystem {
    static Calculate1DSimpleBlendTree(inputX, blendTreeArray) {
        const firstBlendTree = blendTreeArray[0];
        const lastBlendTree = blendTreeArray[blendTreeArray.length - 1];
        if (inputX <= firstBlendTree.posX) {
            firstBlendTree.weight = 1;
        }
        else if (inputX >= lastBlendTree.posX) {
            lastBlendTree.weight = 1;
        }
        else {
            const rightNeighbourBlendTreeIndex = BlendTreeUtils.GetRightNeighbourIndex(inputX, blendTreeArray);
            const leftNeighbour = blendTreeArray[rightNeighbourBlendTreeIndex - 1];
            const rightNeighbour = blendTreeArray[rightNeighbourBlendTreeIndex];
            const interpolatedValue = BlendTreeUtils.GetLinearInterpolation(leftNeighbour.posX, 1, rightNeighbour.posX, 0, inputX);
            leftNeighbour.weight = interpolatedValue;
            rightNeighbour.weight = 1 - leftNeighbour.weight;
        }
    }
    static Calculate2DFreeformDirectional(inputX, inputY, blendTreeArray) {
        BlendTreeSystem.TempVector2_IP.set(inputX, inputY);
        BlendTreeSystem.TempVector2_POSI.set(0, 0);
        BlendTreeSystem.TempVector2_POSJ.set(0, 0);
        BlendTreeSystem.TempVector2_POSIP.set(0, 0);
        BlendTreeSystem.TempVector2_POSIJ.set(0, 0);
        const kDirScale = 2;
        let totalWeight = 0;
        let inputLength = BlendTreeSystem.TempVector2_IP.length();
        for (let i = 0; i < blendTreeArray.length; ++i) {
            const blendTree = blendTreeArray[i];
            BlendTreeSystem.TempVector2_POSI.set(blendTree.posX, blendTree.posY);
            const posILength = BlendTreeSystem.TempVector2_POSI.length();
            const inputToPosILength = (inputLength - posILength);
            const posIToInputAngle = BlendTreeUtils.GetSignedAngle(BlendTreeSystem.TempVector2_POSI, BlendTreeSystem.TempVector2_IP);
            let weight = 1;
            for (let j = 0; j < blendTreeArray.length; ++j) {
                if (j === i) {
                    continue;
                }
                else {
                    BlendTreeSystem.TempVector2_POSJ.set(blendTreeArray[j].posX, blendTreeArray[j].posY);
                    const posJLength = BlendTreeSystem.TempVector2_POSJ.length();
                    const averageLengthOfIJ = (posILength + posJLength) / 2;
                    const magOfPosIToInputPos = (inputToPosILength / averageLengthOfIJ);
                    const magOfIJ = (posJLength - posILength) / averageLengthOfIJ;
                    const angleIJ = BlendTreeUtils.GetSignedAngle(BlendTreeSystem.TempVector2_POSI, BlendTreeSystem.TempVector2_POSJ);
                    BlendTreeSystem.TempVector2_POSIP.set(magOfPosIToInputPos, posIToInputAngle * kDirScale);
                    BlendTreeSystem.TempVector2_POSIJ.set(magOfIJ, angleIJ * kDirScale);
                    const lenSqIJ = BlendTreeSystem.TempVector2_POSIJ.lengthSquared();
                    let newWeight = Vector2.Dot(BlendTreeSystem.TempVector2_POSIP, BlendTreeSystem.TempVector2_POSIJ) / lenSqIJ;
                    newWeight = 1 - newWeight;
                    newWeight = BlendTreeUtils.ClampValue(newWeight, 0, 1);
                    weight = Math.min(newWeight, weight);
                }
            }
            blendTree.weight = weight;
            totalWeight += weight;
        }
        for (const blendTree of blendTreeArray) {
            blendTree.weight /= totalWeight;
        }
    }
    static Calculate2DFreeformCartesian(inputX, inputY, blendTreeArray) {
        BlendTreeSystem.TempVector2_IP.set(inputX, inputY);
        BlendTreeSystem.TempVector2_POSI.set(0, 0);
        BlendTreeSystem.TempVector2_POSJ.set(0, 0);
        BlendTreeSystem.TempVector2_POSIP.set(0, 0);
        BlendTreeSystem.TempVector2_POSIJ.set(0, 0);
        let totalWeight = 0;
        for (let i = 0; i < blendTreeArray.length; ++i) {
            const blendTree = blendTreeArray[i];
            BlendTreeSystem.TempVector2_POSI.set(blendTree.posX, blendTree.posY);
            BlendTreeSystem.TempVector2_IP.subtractToRef(BlendTreeSystem.TempVector2_POSI, BlendTreeSystem.TempVector2_POSIP);
            let weight = 1;
            for (let j = 0; j < blendTreeArray.length; ++j) {
                if (j === i) {
                    continue;
                }
                else {
                    BlendTreeSystem.TempVector2_POSJ.set(blendTreeArray[j].posX, blendTreeArray[j].posY);
                    BlendTreeSystem.TempVector2_POSJ.subtractToRef(BlendTreeSystem.TempVector2_POSI, BlendTreeSystem.TempVector2_POSIJ);
                    const lenSqIJ = BlendTreeSystem.TempVector2_POSIJ.lengthSquared();
                    let newWeight = Vector2.Dot(BlendTreeSystem.TempVector2_POSIP, BlendTreeSystem.TempVector2_POSIJ) / lenSqIJ;
                    newWeight = 1 - newWeight;
                    newWeight = BlendTreeUtils.ClampValue(newWeight, 0, 1);
                    weight = Math.min(weight, newWeight);
                }
            }
            blendTree.weight = weight;
            totalWeight += weight;
        }
        for (const blendTree of blendTreeArray) {
            blendTree.weight /= totalWeight;
        }
    }
}
BlendTreeSystem.TempVector2_IP = new Vector2(0, 0);
BlendTreeSystem.TempVector2_POSI = new Vector2(0, 0);
BlendTreeSystem.TempVector2_POSJ = new Vector2(0, 0);
BlendTreeSystem.TempVector2_POSIP = new Vector2(0, 0);
BlendTreeSystem.TempVector2_POSIJ = new Vector2(0, 0);
export class MachineState {
    constructor() { }
}
export class TransitionCheck {
}
export class AnimationMixer {
}
export class BlendingWeights {
}
export var MotionType;
(function (MotionType) {
    MotionType[MotionType["Clip"] = 0] = "Clip";
    MotionType[MotionType["Tree"] = 1] = "Tree";
})(MotionType || (MotionType = {}));
export var ConditionMode;
(function (ConditionMode) {
    ConditionMode[ConditionMode["If"] = 1] = "If";
    ConditionMode[ConditionMode["IfNot"] = 2] = "IfNot";
    ConditionMode[ConditionMode["Greater"] = 3] = "Greater";
    ConditionMode[ConditionMode["Less"] = 4] = "Less";
    ConditionMode[ConditionMode["Equals"] = 6] = "Equals";
    ConditionMode[ConditionMode["NotEqual"] = 7] = "NotEqual";
})(ConditionMode || (ConditionMode = {}));
export var InterruptionSource;
(function (InterruptionSource) {
    InterruptionSource[InterruptionSource["None"] = 0] = "None";
    InterruptionSource[InterruptionSource["Source"] = 1] = "Source";
    InterruptionSource[InterruptionSource["Destination"] = 2] = "Destination";
    InterruptionSource[InterruptionSource["SourceThenDestination"] = 3] = "SourceThenDestination";
    InterruptionSource[InterruptionSource["DestinationThenSource"] = 4] = "DestinationThenSource";
})(InterruptionSource || (InterruptionSource = {}));
export var BlendTreeType;
(function (BlendTreeType) {
    BlendTreeType[BlendTreeType["Simple1D"] = 0] = "Simple1D";
    BlendTreeType[BlendTreeType["SimpleDirectional2D"] = 1] = "SimpleDirectional2D";
    BlendTreeType[BlendTreeType["FreeformDirectional2D"] = 2] = "FreeformDirectional2D";
    BlendTreeType[BlendTreeType["FreeformCartesian2D"] = 3] = "FreeformCartesian2D";
    BlendTreeType[BlendTreeType["Direct"] = 4] = "Direct";
    BlendTreeType[BlendTreeType["Clip"] = 5] = "Clip";
})(BlendTreeType || (BlendTreeType = {}));
export var AnimatorParameterType;
(function (AnimatorParameterType) {
    AnimatorParameterType[AnimatorParameterType["Float"] = 1] = "Float";
    AnimatorParameterType[AnimatorParameterType["Int"] = 3] = "Int";
    AnimatorParameterType[AnimatorParameterType["Bool"] = 4] = "Bool";
    AnimatorParameterType[AnimatorParameterType["Trigger"] = 9] = "Trigger";
})(AnimatorParameterType || (AnimatorParameterType = {}));
export class AudioSource extends ScriptComponent {
    getSoundClip() { return this._audio; }
    constructor(transform, scene, properties = {}, alias = "AudioSource") {
        super(transform, scene, properties, alias);
        this._audio = null;
        this._name = null;
        this._loop = false;
        this._mute = false;
        this._pitch = 1;
        this._volume = 1;
        this._preload = false;
        this._playonawake = true;
        this._spatialblend = 0;
        this._preloaderUrl = null;
        this._lastmutedvolume = null;
        this._priority = 128;
        this._panstereo = 0;
        this._mindistance = 0;
        this._maxdistance = 50;
        this._reverbzonemix = 1;
        this._bypasseffects = false;
        this._bypassreverbzones = false;
        this._bypasslistenereffects = false;
        this._enablelegacyaudio = false;
        this._initializedReadyInstance = false;
        this._isAudioPlaying = false;
        this._isAudioPaused = false;
        this.onReadyObservable = new Observable();
    }
    awake() { this.awakeAudioSource(); }
    start() { this.startAudioSource(); }
    destroy() { this.destroyAudioSource(); }
    async awakeAudioSource() {
        this._name = this.getProperty("name", this._name);
        this._loop = this.getProperty("loop", this._loop);
        this._mute = this.getProperty("mute", this._mute);
        this._pitch = this.getProperty("pitch", this._pitch);
        this._volume = this.getProperty("volume", this._volume);
        this._preload = this.getProperty("preload", this._preload);
        this._priority = this.getProperty("priority", this._priority);
        this._panstereo = this.getProperty("panstereo", this._panstereo);
        this._playonawake = this.getProperty("playonawake", this._playonawake);
        this._mindistance = this.getProperty("mindistance", this._mindistance);
        this._maxdistance = this.getProperty("maxdistance", this._maxdistance);
        this._spatialblend = this.getProperty("spatialblend", this._spatialblend);
        this._reverbzonemix = this.getProperty("reverbzonemix", this._reverbzonemix);
        this._bypasseffects = this.getProperty("bypasseffects", this._bypasseffects);
        this._bypassreverbzones = this.getProperty("bypassreverbzones", this._bypassreverbzones);
        this._bypasslistenereffects = this.getProperty("bypasslistenereffects", this._bypasslistenereffects);
        this._enablelegacyaudio = this.getProperty("enablelegacyaudio", this._enablelegacyaudio);
        if (this._name == null || this._name === "")
            this._name = "Unknown";
        const filename = this.getProperty("file");
        if (filename != null && filename !== "") {
            const rootUrl = SceneManager.GetRootUrl(this.scene);
            const playUrl = (rootUrl + filename);
            if (playUrl != null && playUrl !== "") {
                if (this._preload === true) {
                    this._preloaderUrl = playUrl;
                }
                else {
                    if (this._enablelegacyaudio === true) {
                        this.setLegacyDataSource(playUrl);
                    }
                    else {
                        await this.setAudioDataSource(playUrl);
                    }
                }
            }
        }
    }
    startAudioSource() {
        if (this._volume >= AudioSource.MAX_VOLUME) {
            this._volume = AudioSource.DEFAULT_LEVEL;
        }
    }
    destroyAudioSource() {
        this.onReadyObservable.clear();
        this.onReadyObservable = null;
        if (this._audio != null) {
            this._audio.dispose();
            this._audio = null;
        }
    }
    isReady() {
        return (this._audio != null);
    }
    isLegacy() {
        return this._enablelegacyaudio;
    }
    isPlaying() {
        return this._isAudioPlaying;
    }
    isPaused() {
        return this._isAudioPaused;
    }
    async play(time, offset, length) {
        await AudioSource.UnlockAudioEngine();
        this.internalPlay(time, offset, length);
        return true;
    }
    internalPlay(time, offset, length) {
        if (this._audio != null) {
            if (this._initializedReadyInstance === true) {
                if (this._audio instanceof StaticSound) {
                    this._audio.play({ waitTime: time, startOffset: offset, duration: length });
                }
                else if (this._audio instanceof Sound) {
                    this._audio.play(time, offset, length);
                }
                this._isAudioPlaying = true;
                this._isAudioPaused = false;
            }
            else {
                this.onReadyObservable.addOnce(() => {
                    if (this._audio instanceof StaticSound) {
                        this._audio.play({ waitTime: time, startOffset: offset, duration: length });
                    }
                    else if (this._audio instanceof Sound) {
                        this._audio.play(time, offset, length);
                    }
                    this._isAudioPlaying = true;
                    this._isAudioPaused = false;
                });
            }
        }
    }
    pause() {
        let result = false;
        if (this._audio != null) {
            this._audio.pause();
            this._isAudioPlaying = false;
            this._isAudioPaused = true;
            result = true;
        }
        return result;
    }
    stop(time) {
        let result = false;
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                this._audio.stop({ waitTime: time });
            }
            else if (this._audio instanceof Sound) {
                this._audio.stop(time);
            }
            this._isAudioPlaying = false;
            this._isAudioPaused = false;
            result = true;
        }
        return result;
    }
    mute(time) {
        let result = false;
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                if (time != null && time > 0) {
                    WindowManager.SetTimeout(time / 1000, () => {
                        this._lastmutedvolume = this._audio.volume;
                        this._audio.volume = 0;
                    });
                }
                else {
                    this._lastmutedvolume = this._audio.volume;
                    this._audio.volume = 0;
                }
            }
            else if (this._audio instanceof Sound) {
                this._lastmutedvolume = this._audio.getVolume();
                this._audio.setVolume(0, time);
            }
        }
        return result;
    }
    unmute(time) {
        let result = false;
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                if (time != null && time > 0) {
                    WindowManager.SetTimeout(time / 1000, () => {
                        if (this._lastmutedvolume != null) {
                            this._audio.volume = this._lastmutedvolume;
                            this._lastmutedvolume = null;
                        }
                    });
                }
                else {
                    if (this._lastmutedvolume != null) {
                        this._audio.volume = this._lastmutedvolume;
                        this._lastmutedvolume = null;
                    }
                }
            }
            else if (this._audio instanceof Sound) {
                if (this._lastmutedvolume != null) {
                    this._audio.setVolume(this._lastmutedvolume, time);
                    this._lastmutedvolume = null;
                }
            }
        }
        return result;
    }
    getPitch() {
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                return this._audio.playbackRate;
            }
            else if (this._audio instanceof Sound) {
                return this._audio.getPlaybackRate();
            }
        }
        else {
            return 0;
        }
    }
    setPitch(value) {
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                this._audio.playbackRate = value;
            }
            else if (this._audio instanceof Sound) {
                this._audio.setPlaybackRate(value);
            }
        }
    }
    getVolume() {
        let result = 0;
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                result = this._audio.volume;
            }
            else if (this._audio instanceof Sound) {
                result = this._audio.getVolume();
            }
        }
        else {
            result = this._volume;
        }
        return result;
    }
    setVolume(volume, time) {
        let result = false;
        this._volume = volume;
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                if (time != null && time > 0) {
                    WindowManager.SetTimeout(time / 1000, () => {
                        this._audio.volume = this._volume;
                    });
                }
                else {
                    this._audio.volume = this._volume;
                }
            }
            else if (this._audio instanceof Sound) {
                this._audio.setVolume(this._volume, time);
            }
        }
        result = true;
        return result;
    }
    setPosition(location) {
        if (this._audio instanceof StaticSound) {
            this._audio.spatial.position = location;
        }
        else if (this._audio instanceof Sound) {
            this._audio.setPosition(location);
        }
    }
    getPlaybackSpeed() {
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                return this._audio.playbackRate;
            }
            else if (this._audio instanceof Sound) {
                return this._audio.getPlaybackRate();
            }
        }
        else {
            return 0;
        }
    }
    setPlaybackSpeed(rate) {
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                this._audio.playbackRate = rate;
            }
            else if (this._audio instanceof Sound) {
                this._audio.setPlaybackRate(rate);
            }
        }
    }
    setRolloffMode(mode) {
        if (this._audio != null) {
            if (this._audio instanceof StaticSound && (mode === "linear" || mode === "inverse" || mode === "exponential")) {
                this._audio.spatial.distanceModel = mode;
            }
            else if (this._audio instanceof Sound) {
                this._audio.distanceModel = mode;
            }
        }
    }
    setMinDistance(distance) {
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                this._audio.spatial.minDistance = distance;
            }
            else if (this._audio instanceof Sound) {
                this._audio.refDistance = distance;
            }
        }
    }
    setMaxDistance(distance) {
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                this._audio.spatial.maxDistance = distance;
            }
            else if (this._audio instanceof Sound) {
                this._audio.maxDistance = distance;
            }
        }
    }
    setSpatialBlend(blend) {
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
            }
            else if (this._audio instanceof Sound) {
            }
        }
    }
    hasSpatialSound() {
        let result = false;
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                result = (this._audio.spatial != null);
            }
            else if (this._audio instanceof Sound) {
                result = this._audio.spatialSound;
            }
        }
        return result;
    }
    getSpatialSound() {
        let result = null;
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                result = this._audio.spatial;
            }
        }
        return result;
    }
    setSpatialSound(value) {
        if (this._audio != null) {
            if (this._audio instanceof StaticSound) {
                this._audio.spatial = value;
            }
        }
    }
    getCurrentTrackTime() {
        let result = 0;
        if (this._audio != null) {
            result = this._audio.currentTime;
        }
        return result;
    }
    async setAudioDataSource(source) {
        if (this._audio != null) {
            this._audio.dispose();
            this._audio = null;
        }
        const spatialBlend = (this._spatialblend >= 0.1);
        this._initializedReadyInstance = false;
        this._lastmutedvolume = this._volume;
        this._audio = await AudioSource.CreateStaticSound(this._name, source, {
            loop: this._loop,
            volume: (this._mute === true) ? 0 : this._volume,
            autoplay: false,
            playbackRate: this._pitch,
            spatialEnabled: spatialBlend,
            spatialAutoUpdate: true,
            spatialPosition: this.transform.absolutePosition.clone(),
            spatialDistanceModel: "linear",
            spatialMinDistance: this._mindistance,
            spatialMaxDistance: this._maxdistance,
            spatialRolloffFactor: AudioSource.DEFAULT_ROLLOFF
        });
        if (this._audio != null) {
            this._initializedReadyInstance = true;
            if (spatialBlend === true && this._audio.spatial != null) {
                this._audio.spatial.attach(this.transform);
            }
            if (this.onReadyObservable && this.onReadyObservable.hasObservers()) {
                this.onReadyObservable.notifyObservers(this._audio);
            }
            if (this._playonawake === true)
                this.play();
        }
    }
    setLegacyDataSource(source) {
        if (this._audio != null) {
            this._audio.dispose();
            this._audio = null;
        }
        const spatialBlend = (this._spatialblend >= 0.1);
        const htmlAudioElementRequired = (this.transform.metadata != null && this.transform.metadata.vtt != null && this.transform.metadata.vtt === true);
        this._initializedReadyInstance = false;
        this._audio = new Sound(this._name, source, this.scene, () => {
            this._lastmutedvolume = this._volume;
            this._audio.setVolume((this._mute === true) ? 0 : this._volume);
            this._audio.setPlaybackRate(this._pitch);
            this._audio.setPosition(this.transform.absolutePosition.clone());
            this._initializedReadyInstance = true;
            if (spatialBlend === true) {
                this._audio.attachToMesh(this.transform);
            }
            if (this.onReadyObservable && this.onReadyObservable.hasObservers()) {
                this.onReadyObservable.notifyObservers(this._audio);
            }
            if (this._playonawake === true)
                this.play();
        }, {
            loop: this._loop,
            autoplay: false,
            refDistance: this._mindistance,
            maxDistance: this._maxdistance,
            rolloffFactor: AudioSource.DEFAULT_ROLLOFF,
            spatialSound: spatialBlend,
            distanceModel: "linear",
            streaming: htmlAudioElementRequired
        });
    }
    addPreloaderTasks(assetsManager) {
        if (this._preload === true) {
            const assetTask = assetsManager.addBinaryFileTask((this.transform.name + ".AudioTask"), this._preloaderUrl);
            assetTask.onSuccess = async (task) => {
                if (this._enablelegacyaudio === true) {
                    this.setLegacyDataSource(task.data);
                }
                else {
                    await this.setAudioDataSource(task.data);
                }
            };
        }
    }
    static IsLegacyEngine() {
        return (SceneManager.GlobalOptions["enablelegacyaudio"] != null) ? SceneManager.GlobalOptions["enablelegacyaudio"] : false;
    }
    static GetAudioOptions() {
        return AudioSource.AUDIO_ENGINE_V2_OPTIONS;
    }
    static SetAudioOptions(options) {
        AudioSource.AUDIO_ENGINE_V2_OPTIONS = options;
    }
    static async GetAudioEngine() {
        if (AudioSource.AUDIO_ENGINE_V2 == null)
            AudioSource.AUDIO_ENGINE_V2 = await CreateAudioEngineAsync(AudioSource.AUDIO_ENGINE_V2_OPTIONS || { listenerAutoUpdate: true, listenerEnabled: false, resumeOnInteraction: true, resumeOnPause: true });
        return AudioSource.AUDIO_ENGINE_V2;
    }
    static UnlockLegacyAudio() {
        if (Engine.audioEngine != null && !Engine.audioEngine.unlocked) {
            Engine.audioEngine.unlock();
        }
    }
    static async UnlockAudioEngine() {
        const audioEngine = await AudioSource.GetAudioEngine();
        if (audioEngine != null)
            await audioEngine.unlockAsync();
    }
    static async AttachSpatialCamera(node) {
        const audioEngine = await AudioSource.GetAudioEngine();
        if (audioEngine != null && audioEngine.listener != null)
            audioEngine.listener.attach(node);
    }
    static async DetachSpatialCamera() {
        const audioEngine = await AudioSource.GetAudioEngine();
        if (audioEngine != null && audioEngine.listener != null)
            audioEngine.listener.detach();
    }
    static async UpdateSpatialCamera(position, rotation) {
        const audioEngine = await AudioSource.GetAudioEngine();
        if (audioEngine != null && audioEngine.listener != null) {
            if (position != null)
                audioEngine.listener.position.copyFrom(position);
            if (audioEngine.listener.rotationQuaternion == null)
                audioEngine.listener.rotationQuaternion = new Quaternion(0, 0, 0, 1);
            if (rotation != null)
                audioEngine.listener.rotationQuaternion.copyFrom(rotation);
            audioEngine.listener.update();
        }
    }
    static async CreateSoundBuffer(source, options) {
        let result = null;
        const audioEngine = await AudioSource.GetAudioEngine();
        if (audioEngine != null)
            result = await audioEngine.createSoundBufferAsync(source, options);
        return result;
    }
    static async CreateStaticSound(name, source, options) {
        let result = null;
        const audioEngine = await AudioSource.GetAudioEngine();
        if (audioEngine != null)
            result = await audioEngine.createSoundAsync(name, source, options);
        return result;
    }
    static async CreateStreamingSound(name, source, options) {
        let result = null;
        const audioEngine = await AudioSource.GetAudioEngine();
        if (audioEngine != null)
            result = await audioEngine.createStreamingSoundAsync(name, source, options);
        return result;
    }
}
AudioSource.MAX_VOLUME = 1;
AudioSource.DEFAULT_LEVEL = 1;
AudioSource.DEFAULT_ROLLOFF = 1;
AudioSource.AUDIO_ENGINE_V2 = null;
AudioSource.AUDIO_ENGINE_V2_OPTIONS = { listenerAutoUpdate: true, listenerEnabled: false, resumeOnInteraction: true, resumeOnPause: true };
export class CharacterController extends ScriptComponent {
    getAvatarRadius() { return this._avatarRadius; }
    getAvatarHeight() { return this._avatarHeight; }
    getCenterOffset() { return this._centerOffset; }
    getSkinWidth() { return this._skinWidth; }
    getStepHeight() { return this._stepHeight; }
    getGravityFactor() { return this._gravityFactor; }
    setGravityFactor(factor) { this._gravityFactor = factor; }
    getInputVelocity() { return this._inputVelocity; }
    getVerticalVelocity() { return (this.isGrounded() === true) ? 0 : this._currentVelocity.y; }
    getSlopeAngleRadians() { return this._slopeAngleRadians; }
    getSlopeAngleDegrees() { return this._slopeAngleDegrees; }
    getGroundCollisionNode() { return this._groundCollisionNode; }
    getVerticalStepSpeed() { return this._verticalStepSpeed; }
    setVerticalStepSpeed(speed) { this._verticalStepSpeed = speed; }
    getMinimumStepHeight() { return this._minimumStepHeight; }
    setMinimumStepHeight(height) { this._minimumStepHeight = height; }
    getMinMoveDistance() { return this._minMoveDistance; }
    setMinMoveDistance(distance) { this._minMoveDistance = distance; }
    getSlopeSlideSpeed() { return this._slopeSlideSpeed; }
    setSlopeSlideSpeed(speed) { this._slopeSlideSpeed = speed; }
    getSlopeLimit() { return this._slopeLimit; }
    setSlopeLimit(slopeRadians) { this._slopeLimit = slopeRadians; }
    isSteppingUp() { return this._isSteppingUp; }
    isGrounded() { return this._isGrounded; }
    isSliding() { return this._isSliding; }
    canSlide() { return (this._slopeAngleDegrees > 0 && (this._slopeMoveDirection <= 0 || (this._slopeMoveDirection > 0 && this._maxSlopeTimer >= CharacterController.DEFAULT_SLIDING_TIMER))); }
    canJump() { return (this.isGrounded() === true); }
    constructor(transform, scene, properties = {}, alias = "CharacterController") {
        super(transform, scene, properties, alias);
        this._avatarRadius = 0.28;
        this._avatarHeight = 1.8;
        this._centerOffset = new Vector3(0, 0.94, 0);
        this._slopeLimit = 45;
        this._skinWidth = 0.025;
        this._stepHeight = 0.25;
        this._minMoveDistance = 0.001;
        this._slopeSlideSpeed = 10.0;
        this._slopeAngleRadians = 0;
        this._slopeAngleDegrees = 0;
        this._slopeMoveDirection = 0;
        this._verticalVelocity = 0;
        this._verticalStepSpeed = 1.0;
        this._minimumStepHeight = 0.15;
        this._collisionEvents = true;
        this._targetRotation = new Quaternion(0, 0, 0, 1);
        this._targetVelocity = new Vector3();
        this._currentVelocity = new Vector3(0, 0, 0);
        this._inputVelocity = new Vector3(0, 0, 0);
        this._gravityFactor = 3;
        this._minJumpTimer = 0;
        this._maxSlopeTimer = 0;
        this._isSliding = false;
        this._isGrounded = false;
        this._isSteppingUp = false;
        this._hitColor = new Color3(0, 1, 0);
        this._noHitColor = new Color3(1, 0, 0);
        this._groundRay = null;
        this._groundRayHelper = null;
        this._groundHitPointMesh = null;
        this._stepCheckOriginMesh = null;
        this._stepCheckHitPointMesh = null;
        this._stepCheckDestinationMesh = null;
        this._stepCheckRayHelper = null;
        this._stepCheckRay = null;
        this._groundRaycastShape = null;
        this._groundCollisionNode = null;
        this._groundRaycastOffset = new Vector3(0, 0, 0);
        this._groundRaycastOrigin = new Vector3(0, 0, 0);
        this._groundRaycastDirection = new Vector3(0, -1, 0);
        this._groundRaycastDestination = new Vector3(0, 0, 0);
        this._localGroundShapecastResult = null;
        this._worldGroundShapecastResult = null;
        this._stepCheckRaycastOrigin = new Vector3(0, 0, 0);
        this._stepCheckRaycastDestination = new Vector3(0, 0, 0);
        this._stepCheckRaycastHitPoint = new Vector3(0, 0, 0);
        this._stepCheckRaycastResult = null;
        this.m_moveDeltaX = 0;
        this.m_moveDeltaZ = 0;
        this.m_havokplugin = null;
        this.onUpdatePositionObservable = new Observable();
        this.onUpdateVelocityObservable = new Observable();
        this.verticalVelocityOffset = 0;
        this.enableStepOffset = true;
        this.enableGravity = true;
        this.downwardForce = 0;
        this.raycastLength = 0.01;
        this.showRaycasts = false;
    }
    awake() {
        this._avatarRadius = this.getProperty("avatarRadius", this._avatarRadius);
        this._avatarHeight = this.getProperty("avatarHeight", this._avatarHeight);
        this._slopeLimit = this.getProperty("slopeLimit", this._slopeLimit);
        this._skinWidth = this.getProperty("skinWidth", this._skinWidth);
        this._stepHeight = this.getProperty("stepOffset", this._stepHeight);
        this._minMoveDistance = this.getProperty("minMoveDistance", this._minMoveDistance);
        this._collisionEvents = this.getProperty("collisionEvents", this._collisionEvents);
        const centerOffsetData = this.getProperty("centerOffset");
        if (centerOffsetData != null)
            this._centerOffset = Utilities.ParseVector3(centerOffsetData);
        this.createPhysicsBodyAndShape(CharacterController.DEFAULT_CHARACTER_MASS, Utilities.GetLayerMask(31), -1);
    }
    update() {
        const deltaTime = this.getDeltaSeconds();
        if (this._minJumpTimer > 0) {
            this._minJumpTimer -= deltaTime;
            if (this._minJumpTimer < 0) {
                this._minJumpTimer = 0;
            }
        }
        if (this._slopeAngleDegrees > 0)
            this._maxSlopeTimer += deltaTime;
        else
            this._maxSlopeTimer = 0;
    }
    fixed() {
        if (this.transform != null) {
            if (this.transform.physicsBody != null)
                this.transform.physicsBody.getLinearVelocityToRef(this._currentVelocity);
            else
                this._currentVelocity.set(0, 0, 0);
            this.m_moveDeltaX = this._targetVelocity.x;
            this.m_moveDeltaZ = this._targetVelocity.z;
            if (Math.abs(this.m_moveDeltaX) < this._minMoveDistance) {
                if (this.m_moveDeltaX > 0) {
                    this.m_moveDeltaX = this._minMoveDistance;
                }
                else if (this.m_moveDeltaX < 0) {
                    this.m_moveDeltaX = -this._minMoveDistance;
                }
            }
            if (Math.abs(this.m_moveDeltaZ) < this._minMoveDistance) {
                if (this.m_moveDeltaZ > 0) {
                    this.m_moveDeltaZ = this._minMoveDistance;
                }
                else if (this.m_moveDeltaZ < 0) {
                    this.m_moveDeltaZ = -this._minMoveDistance;
                }
            }
            this._inputVelocity.set(this.m_moveDeltaX, 0, this.m_moveDeltaZ);
            this.verticalVelocityOffset = 0;
            const raycast = this.updateGroundedState();
            this.updateSlopesAndSlides(raycast?.world?.hasHit, raycast?.world?.hitNormal);
            if (this.onUpdateVelocityObservable && this.onUpdateVelocityObservable.hasObservers()) {
                this.onUpdateVelocityObservable.notifyObservers(this.transform);
            }
            this._inputVelocity.y = (this.enableGravity === true) ? (this._verticalVelocity + this.verticalVelocityOffset + this.downwardForce) : this.downwardForce;
            if (this.transform.physicsBody != null) {
                this.transform.physicsBody.setLinearVelocity(this._inputVelocity);
            }
            else {
                console.warn("No physics body attached to character controller transform: " + this.transform.name);
            }
            if (this.onUpdatePositionObservable && this.onUpdatePositionObservable.hasObservers()) {
                this.onUpdatePositionObservable.notifyObservers(this.transform);
            }
        }
    }
    set(px, py, pz, rx = null, ry = null, rz = null, rw = null) {
        if (this.transform != null) {
            if (this.transform.position != null && px != null && py != null && pz != null) {
                this.transform.position.set(px, py, pz);
            }
            if (this.transform.rotationQuaternion != null && rx != null && ry != null && rz != null && rw != null) {
                this.transform.rotationQuaternion.set(rx, ry, rz, rw);
            }
        }
    }
    move(velocity, aux = true) {
        if (velocity != null) {
            this._targetVelocity.copyFrom(velocity);
        }
    }
    jump(speed) {
        if (this.canJump()) {
            this._isGrounded = false;
            this._minJumpTimer = CharacterController.DEFAULT_JUMPING_TIMER;
            this._verticalVelocity = speed;
            if (this.transform?.physicsBody) {
                const currentVel = new Vector3();
                this.transform.physicsBody.getLinearVelocityToRef(currentVel);
                currentVel.y = speed;
                this.transform.physicsBody.setLinearVelocity(currentVel);
            }
        }
    }
    turn(angle) {
        if (this.transform != null) {
            this.transform.addRotation(0, angle, 0);
        }
    }
    rotate(x, y, z, w) {
        if (this.transform != null && this.transform.rotationQuaternion != null) {
            this._targetRotation.set(x, y, z, w);
            this.transform.rotationQuaternion.copyFrom(this._targetRotation);
        }
    }
    setRigidBodyMass(mass) {
        if (this.transform != null && this.transform.physicsBody != null) {
            const props = this.transform.physicsBody.getMassProperties();
            props.mass = (mass >= 0.0000001) ? mass : 0.0000001;
            this.transform.physicsBody.setMassProperties(props);
        }
    }
    setCollisionState(collision) {
        if (this.transform != null && this.transform.physicsBody != null && this.transform.physicsBody.shape != null) {
            this.transform.physicsBody.shape.isTrigger = !collision;
        }
    }
    updateGroundedState() {
        this._groundRaycastOffset.set(0, this._avatarHeight / 2, 0);
        this.transform.absolutePosition.addToRef(this._groundRaycastOffset, this._groundRaycastOrigin);
        let radius = (this._avatarRadius * 0.2);
        let length = (this._avatarHeight / 2) + this.raycastLength + CharacterController.MIN_GROUND_CHECK_SKINWIDTH;
        if (this.isGrounded())
            length += (this._stepHeight + CharacterController.MIN_GROUND_CHECK_DISTANCE);
        Utilities.CalculateDestinationPointToRef(this._groundRaycastOrigin, this._groundRaycastDirection, length, this._groundRaycastDestination);
        if (this._groundRaycastShape == null)
            this._groundRaycastShape = new PhysicsShapeSphere(new Vector3(0, 0, 0), radius, this.scene);
        const groundQuery = {
            shape: this._groundRaycastShape,
            rotation: this.transform.rotationQuaternion,
            startPosition: this._groundRaycastOrigin,
            endPosition: this._groundRaycastDestination,
            ignoreBody: this.transform.physicsBody,
            shouldHitTriggers: false
        };
        if (this._stepCheckRaycastResult == null)
            this._stepCheckRaycastResult = new PhysicsRaycastResult();
        if (this._localGroundShapecastResult == null)
            this._localGroundShapecastResult = new ShapeCastResult();
        if (this._worldGroundShapecastResult == null)
            this._worldGroundShapecastResult = new ShapeCastResult();
        this._stepCheckRaycastResult.reset();
        this._localGroundShapecastResult.reset();
        this._worldGroundShapecastResult.reset();
        RigidbodyPhysics.ShapecastToRef(groundQuery, this._localGroundShapecastResult, this._worldGroundShapecastResult);
        this._isGrounded = (this._minJumpTimer <= 0 && this._worldGroundShapecastResult != null && this._worldGroundShapecastResult.hasHit === true && this._worldGroundShapecastResult.body != null);
        if (this._isGrounded && this._verticalVelocity > 0) {
            this._isGrounded = false;
        }
        this._groundCollisionNode = (this.isGrounded() === true && this._worldGroundShapecastResult.body != null) ? this._worldGroundShapecastResult.body.transformNode : null;
        if (this.showRaycasts == true || Utilities.ShowDebugColliders()) {
            if (this._groundRay == null)
                this._groundRay = new Ray(this._groundRaycastOrigin, this._groundRaycastDirection, length);
            this._groundRay.origin = this._groundRaycastOrigin;
            this._groundRay.direction = this._groundRaycastDirection;
            this._groundRay.length = length;
            if (this._groundRayHelper == null)
                this._groundRayHelper = new RayHelper(this._groundRay);
            this._groundRayHelper.ray = this._groundRay;
            this._groundRayHelper.show(this.scene, (this.isGrounded()) ? this._hitColor : this._noHitColor);
            if (this._groundHitPointMesh == null) {
                this._groundHitPointMesh = MeshBuilder.CreateSphere("GroundHitMesh", { diameter: (radius * 2) }, this.scene);
                this._groundHitPointMesh.visibility = 0.5;
                this._groundHitPointMesh.material = new StandardMaterial("GroundHitMat", this.scene);
                this._groundHitPointMesh.material.diffuseColor = new Color3(1.0, 0.0, 0.0);
            }
            if (this.isGrounded())
                this._groundHitPointMesh.position.copyFrom(this._worldGroundShapecastResult.hitPoint);
            else
                this._groundHitPointMesh.position.copyFrom(this._groundRaycastDestination);
        }
        if (this.enableStepOffset === true) {
            const resetPoint = this.transform.absolutePosition;
            const stepRayLength = (this._stepHeight * 3);
            this._isSteppingUp = false;
            this._stepCheckRaycastHitPoint.copyFrom(resetPoint);
            this._stepCheckRaycastOrigin.copyFrom(resetPoint);
            this._stepCheckRaycastDestination.copyFrom(resetPoint);
            if (this.isGrounded() && this._inputVelocity.lengthSquared() > 0) {
                const movementDirectionNormalized = this._inputVelocity.clone().normalize();
                const characterPosition = this.transform.position.clone();
                const forwardOffset = movementDirectionNormalized.scale((this._avatarRadius + 0.01));
                this._stepCheckRaycastOrigin.set((characterPosition.x + forwardOffset.x), (characterPosition.y + (this._stepHeight + this._skinWidth)), (characterPosition.z + forwardOffset.z));
                Utilities.CalculateDestinationPointToRef(this._stepCheckRaycastOrigin, this._groundRaycastDirection, stepRayLength, this._stepCheckRaycastDestination);
                RigidbodyPhysics.RaycastToRef(this._stepCheckRaycastOrigin, this._stepCheckRaycastDestination, this._stepCheckRaycastResult);
                if (this._stepCheckRaycastResult.hasHit === true && this._stepCheckRaycastResult.hitPointWorld != null) {
                    this._stepCheckRaycastHitPoint.copyFrom(this._stepCheckRaycastResult.hitPointWorld);
                    const stepHeight = (this._stepCheckRaycastResult.hitPointWorld.y - characterPosition.y);
                    if (stepHeight >= this._minimumStepHeight && stepHeight <= this._stepHeight) {
                        this._isSteppingUp = true;
                        this.verticalVelocityOffset = this._verticalStepSpeed;
                    }
                }
            }
            if (this.showRaycasts == true || Utilities.ShowDebugColliders()) {
                if (this._stepCheckRay == null)
                    this._stepCheckRay = new Ray(this._stepCheckRaycastOrigin, this._groundRaycastDirection, stepRayLength);
                this._stepCheckRay.origin = this._stepCheckRaycastOrigin;
                this._stepCheckRay.direction = this._groundRaycastDirection;
                this._stepCheckRay.length = stepRayLength;
                if (this._stepCheckRayHelper == null)
                    this._stepCheckRayHelper = new RayHelper(this._stepCheckRay);
                this._stepCheckRayHelper.ray = this._stepCheckRay;
                this._stepCheckRayHelper.show(this.scene, (this._stepCheckRaycastResult.hasHit === true) ? this._hitColor : this._noHitColor);
                if (this._stepCheckOriginMesh == null) {
                    this._stepCheckOriginMesh = MeshBuilder.CreateSphere("StepCheckOriginMesh", { diameter: 0.05 }, this.scene);
                    this._stepCheckOriginMesh.visibility = 0.5;
                    this._stepCheckOriginMesh.material = new StandardMaterial("StepCheckOriginMat", this.scene);
                    this._stepCheckOriginMesh.material.diffuseColor = new Color3(0.0, 0.0, 1.0);
                }
                if (this._stepCheckHitPointMesh == null) {
                    this._stepCheckHitPointMesh = MeshBuilder.CreateSphere("StepCheckHitPointMesh", { diameter: 0.05 }, this.scene);
                    this._stepCheckHitPointMesh.visibility = 0.5;
                    this._stepCheckHitPointMesh.material = new StandardMaterial("StepCheckHitPointMat", this.scene);
                    this._stepCheckHitPointMesh.material.diffuseColor = new Color3(0.0, 1.0, 0.0);
                }
                if (this._stepCheckDestinationMesh == null) {
                    this._stepCheckDestinationMesh = MeshBuilder.CreateSphere("StepCheckDestinationMesh", { diameter: 0.05 }, this.scene);
                    this._stepCheckDestinationMesh.visibility = 0.5;
                    this._stepCheckDestinationMesh.material = new StandardMaterial("StepCheckDestinationMat", this.scene);
                    this._stepCheckDestinationMesh.material.diffuseColor = new Color3(1.0, 1.0, 1.0);
                }
                this._stepCheckOriginMesh.position.copyFrom(this._stepCheckRaycastOrigin);
                this._stepCheckHitPointMesh.position.copyFrom(this._stepCheckRaycastHitPoint);
                this._stepCheckDestinationMesh.position.copyFrom(this._stepCheckRaycastDestination);
            }
        }
        return { local: this._localGroundShapecastResult, world: this._worldGroundShapecastResult };
    }
    updateSlopesAndSlides(hasHit, hitNormal) {
        let applyGravity = true;
        this._isSliding = false;
        this._slopeAngleRadians = 0;
        this._slopeAngleDegrees = 0;
        this._slopeMoveDirection = 0;
        if (this.isGrounded()) {
            if (this._verticalVelocity <= (-CharacterController.DEFAULT_GRAVITY_FORCE)) {
                this._verticalVelocity = (-CharacterController.DEFAULT_GRAVITY_FORCE);
                applyGravity = false;
            }
            if (hitNormal != null) {
                this._slopeAngleRadians = Math.acos(Vector3.Dot(hitNormal, Vector3.UpReadOnly));
                this._slopeAngleDegrees = Tools.ToDegrees(this._slopeAngleRadians);
                const slopeRight = Vector3.Cross(hitNormal, Vector3.UpReadOnly).normalize();
                const slopeDirection = Vector3.Cross(slopeRight, hitNormal).normalize();
                this._slopeMoveDirection = Vector3.Dot(this._currentVelocity.normalize(), slopeDirection);
                if (this._slopeAngleDegrees >= CharacterController.MIN_GROUND_CHECK_SLOPEANGLE && this._slopeAngleDegrees <= this._slopeLimit) {
                    if (this._inputVelocity.length() <= 0) {
                        if (this._verticalVelocity <= (-CharacterController.STATIC_GRAVITY_FORCE)) {
                            this._verticalVelocity = (-CharacterController.STATIC_GRAVITY_FORCE);
                            applyGravity = false;
                        }
                    }
                    else {
                        if (this._slopeMoveDirection > 0) {
                            this._verticalVelocity = (-CharacterController.UPHILL_GRAVITY_FORCE);
                            applyGravity = false;
                        }
                        else if (this._slopeMoveDirection < 0) {
                            this._verticalVelocity = (-CharacterController.SLOPE_GRAVITY_FORCE);
                            applyGravity = false;
                        }
                    }
                }
                else if (this._slopeAngleDegrees >= CharacterController.MIN_GROUND_CHECK_SLOPEANGLE && this._slopeAngleDegrees > this._slopeLimit && this.canSlide()) {
                    const downVector = new Vector3(0, -1, 0);
                    const slideDirection = Vector3.Cross(Vector3.Cross(hitNormal, downVector), hitNormal).normalize();
                    const slideVelocity = slideDirection.scale(this._slopeSlideSpeed);
                    this._inputVelocity.x = slideVelocity.x;
                    this._inputVelocity.z = slideVelocity.z;
                    this._verticalVelocity = slideVelocity.y;
                    this._isSliding = true;
                    applyGravity = false;
                }
            }
        }
        if (applyGravity === true) {
            const deltaTime = this.getDeltaSeconds();
            this._verticalVelocity -= ((Math.abs(this.scene.gravity.y) * this._gravityFactor) * deltaTime);
            if (Math.abs(this._verticalVelocity) > CharacterController.TERMINAL_VELOCITY) {
                this._verticalVelocity = (-CharacterController.TERMINAL_VELOCITY);
            }
        }
    }
    createPhysicsBodyAndShape(mass, layer, filter) {
        const entity = this.transform;
        if (!Utilities.ReparentColliders()) {
            entity.setParent(null, true, true);
        }
        const capsulesize_xx = this._avatarRadius * parseFloat(entity.scaling.x.toFixed(4));
        const capsulesize_yy = this._avatarHeight * parseFloat(entity.scaling.y.toFixed(4));
        const capsuleShape = this.createPhysicsShapeCapsule(capsulesize_xx, capsulesize_yy);
        capsuleShape.filterMembershipMask = layer;
        capsuleShape.filterCollideMask = filter;
        const rotation = new Quaternion(0, 0, 0, 1);
        const center_xx = this._centerOffset.x * parseFloat(entity.scaling.x.toFixed(4));
        const center_yy = this._centerOffset.y * parseFloat(entity.scaling.y.toFixed(4));
        const center_zz = this._centerOffset.z * parseFloat(entity.scaling.z.toFixed(4));
        const center_vec = new Vector3(center_xx, center_yy, center_zz);
        const capsuleparentshape = new PhysicsShapeContainer(this.scene);
        capsuleparentshape.material = { friction: 0, staticFriction: 0, restitution: 0, frictionCombine: 0, restitutionCombine: 0 };
        capsuleparentshape.addChild(capsuleShape, center_vec, rotation, new Vector3(1, 1, 1));
        const capsulebody = new PhysicsBody(entity, PhysicsMotionType.DYNAMIC, false, this.scene);
        capsulebody.shape = capsuleparentshape;
        capsulebody.setMassProperties({ mass: mass, centerOfMass: new Vector3(0, 0, 0), inertia: new Vector3(0, 0, 0) });
        capsulebody.setGravityFactor(0);
        capsulebody.setLinearDamping(0.1);
        capsulebody.setAngularDamping(0.99);
        capsulebody.disablePreStep = false;
        if (this._collisionEvents === true) {
            capsulebody.setCollisionCallbackEnabled(true);
            capsulebody.setCollisionEndedCallbackEnabled(true);
        }
        if (Utilities.ShowDebugColliders())
            console.log("Setup character controller physics collider for: " + entity.name, entity);
        if (!Utilities.ShowDebugColliders()) {
            const aentity = entity;
            if (aentity.material != null && aentity.material.name === "CenterBox-Material") {
                aentity.isVisible = false;
            }
        }
        if (Utilities.ShowDebugColliders()) {
            if (RigidbodyPhysics.DebugPhysicsViewer == null)
                RigidbodyPhysics.DebugPhysicsViewer = new PhysicsViewer();
            if (RigidbodyPhysics.DebugPhysicsViewer != null)
                RigidbodyPhysics.DebugPhysicsViewer.showBody(capsulebody);
        }
    }
    createPhysicsShapeCapsule(radius, height) {
        const cap = 0.5;
        const top = -((height - cap) * 0.5);
        const bottom = ((height - cap) * 0.5);
        return new PhysicsShapeCapsule(new Vector3(0, top, 0), new Vector3(0, bottom, 0), radius, this.scene);
    }
    createPhysicsShapeCylinder(radius, height) {
        const top = -(height * 0.5);
        const bottom = (height * 0.5);
        return new PhysicsShapeCylinder(new Vector3(0, top, 0), new Vector3(0, bottom, 0), radius, this.scene);
    }
}
CharacterController.TERMINAL_VELOCITY = 55.0;
CharacterController.SLOPE_GRAVITY_FORCE = 3.0;
CharacterController.UPHILL_GRAVITY_FORCE = 1.0;
CharacterController.STATIC_GRAVITY_FORCE = 0.0;
CharacterController.DEFAULT_GRAVITY_FORCE = 1.0;
CharacterController.DEFAULT_JUMPING_TIMER = 0.1;
CharacterController.DEFAULT_SLIDING_TIMER = 0.15;
CharacterController.DEFAULT_CHARACTER_MASS = 85.0;
CharacterController.MIN_GROUND_CHECK_DISTANCE = 0.25;
CharacterController.MIN_GROUND_CHECK_SKINWIDTH = 0.001;
CharacterController.MIN_GROUND_CHECK_SLOPEANGLE = 1.0;
export class SimpleCharacterController extends ScriptComponent {
    constructor(transform, scene, properties = {}, alias = "SimpleCharacterController") {
        super(transform, scene, properties, alias);
        this._eulerAngles = new Vector3(0, 0, 0);
    }
    start() { }
    set(px, py, pz, rx = null, ry = null, rz = null, rw = null, aux = true) {
        if (this.transform != null) {
            if (this.transform.position != null && px != null && py != null && pz != null) {
                this.transform.position.set(px, py, pz);
            }
            if (this.transform.rotationQuaternion != null && rx != null && ry != null && rz != null && rw != null) {
                this.transform.rotationQuaternion.set(rx, ry, rz, rw);
            }
        }
    }
    move(velocity, aux = true) {
        if (velocity != null && this.transform != null && this.transform instanceof AbstractMesh) {
            this.transform.moveWithCollisions(velocity);
        }
    }
    jump(speed) {
    }
    turn(angle) {
        if (this.transform != null) {
            this.transform.addRotation(0, angle, 0);
        }
    }
    rotate(x, y, z, w) {
        if (this.transform != null && this.transform.rotationQuaternion != null) {
            this.transform.rotationQuaternion.set(x, y, z, w);
        }
    }
}
export class RecastCharacterController extends ScriptComponent {
    getNavigationAgent() { return this._navigationAgent; }
    setNavigationAgent(agent) { this._navigationAgent = agent; }
    setDestinationPoint(destination, closetPoint = true) { if (this._navigationAgent != null)
        this._navigationAgent.setDestination(destination, closetPoint); }
    constructor(transform, scene, properties = {}, alias = "RecastCharacterController") {
        super(transform, scene, properties, alias);
        this._eulerAngles = new Vector3(0, 0, 0);
        this._teleportVector = new Vector3(0, 0, 0);
        this._navigationAgent = null;
    }
    start() { this._navigationAgent = this.getComponent("NavigationAgent"); }
    set(px, py, pz, rx = null, ry = null, rz = null, rw = null, aux = true) {
        if (this.transform != null && this._navigationAgent != null) {
            if (this.transform.position != null && px != null && py != null && pz != null) {
                this._teleportVector.set(px, py, pz);
                this._navigationAgent.teleport(this._teleportVector, aux);
            }
            if (this.transform.rotationQuaternion != null && rx != null && ry != null && rz != null && rw != null) {
                this.transform.rotationQuaternion.set(rx, ry, rz, rw);
            }
        }
    }
    move(velocity, aux = true) {
        if (velocity != null && this._navigationAgent != null) {
            this._navigationAgent.move(velocity, aux);
        }
    }
    jump(speed) {
        console.warn("Jump is not supported by the navigation mesh character controller.");
    }
    turn(angle) {
        if (this.transform != null) {
            this.transform.addRotation(0, angle, 0);
        }
    }
    rotate(x, y, z, w) {
        if (this.transform != null && this.transform.rotationQuaternion != null && this._navigationAgent != null) {
            this.transform.rotationQuaternion.set(x, y, z, w);
        }
    }
}
export class HavokRaycastVehicle {
    constructor(options) {
        this.chassisBody = null;
        this.wheelInfos = [];
        this.sliding = false;
        this.world = null;
        this.indexRightAxis = 0;
        this.indexForwardAxis = 2;
        this.indexUpAxis = 1;
        this.minimumWheelContacts = 4;
        this.smoothFlyingImpulse = 0;
        this.stabilizingForce = 0;
        this.maxImpulseForce = 0;
        this.frictionRestoreSpeed = 1.0;
        this.maxVisualExtensionLimit = 1.0;
        this.maxVisualCompressionLimit = 1.0;
        this.currentVehicleSpeedKmHour = 0;
        this.stabilizeVelocity = false;
        this.multiRaycastEnabled = false;
        this.multiRaycastMultiplier = 2.0;
        this.enableRoughTrackLogging = false;
        this.frameCounter = 0;
        this.isArcadeBurnoutModeActive = false;
        this.isArcadeDonutModeActive = false;
        this.isArcadeHandbrakeActive = false;
        this.arcadeFrontSideFactor = 0.7;
        this.arcadeRearSideFactor = 0.2;
        this.arcadeHandbrakeTransitionFactor = 0.0;
        this.isDriftModeEnabled = false;
        this.driftSpeedThreshold = 40.0;
        this.driftMaxSpeed = 120.0;
        this.driftSteeringThreshold = 0.3;
        this.driftGripReduction = 0.4;
        this.driftTransitionSpeed = 0.08;
        this.driftIntensity = 0.0;
        this.previousSteeringInput = 0.0;
        this.steeringChangeRate = 0.0;
        this.driftDirection = 0.0;
        this.arcadeSteerAssistFactor = 7.50;
        this.handbrakePreserveFactor = 0.75;
        this.donutModeTransitionFactor = 0.0;
        this.donutEngineMultiplier = 1.0;
        this.donutTransitionSpeed = 0.05;
        this.donutTurnRadius = 3.5;
        this.donutModeEngaged = false;
        this.donutModeEngineBoost = 0.0;
        this.defaultBurnoutCoefficient = 15.0;
        this.burnoutCoefficient = 1.0;
        this.burnoutTargetCoefficient = 1.0;
        this.burnoutTransitionSpeed = 0.01;
        this.burnoutModeEngaged = false;
        this.burnoutPowerBoost = 0.0;
        this.baseRotationBoost = 6.0;
        this.donutRotationBoost = 8.0;
        this.currentRotationBoost = 0.0;
        this.currentSteeringInput = 0;
        this.handbrakeAngularVelocity = new Vector3();
        this.handbrakeEngaged = false;
        this.raycastResult = null;
        this.lastValidPoints = [];
        this.lastValidNormals = [];
        this.lastValidDistances = [];
        this.chassisBody = options.chassisBody;
        this.wheelInfos = [];
        this.sliding = false;
        this.world = null;
        this.indexRightAxis = typeof (options.indexRightAxis) !== 'undefined' ? options.indexRightAxis : 0;
        this.indexForwardAxis = typeof (options.indexForwardAxis) !== 'undefined' ? options.indexForwardAxis : 2;
        this.indexUpAxis = typeof (options.indexUpAxis) !== 'undefined' ? options.indexUpAxis : 1;
    }
    addWheel(options) {
        options = options || {};
        var info = new HavokWheelInfo(options);
        var index = this.wheelInfos.length;
        this.wheelInfos.push(info);
        return index;
    }
    getNumWheels() {
        return this.wheelInfos.length;
    }
    getWheelInfo(wheelIndex) {
        return this.wheelInfos[wheelIndex];
    }
    getSteeringValue(wheelIndex) {
        var wheel = this.wheelInfos[wheelIndex];
        return wheel.steering;
    }
    setSteeringValue(value, wheelIndex) {
        var wheel = this.wheelInfos[wheelIndex];
        wheel.steering = value;
    }
    applyEngineForce(value, wheelIndex) {
        this.wheelInfos[wheelIndex].engineForce = value;
    }
    setHandBrake(brake, wheelIndex) {
        this.wheelInfos[wheelIndex].brake = brake;
    }
    setWheelRotationBoost(wheelIndex, boost) {
        if (wheelIndex >= 0 && wheelIndex < this.wheelInfos.length) {
            this.wheelInfos[wheelIndex].rotationBoost = boost;
        }
    }
    setAllWheelsRotationBoost(boost) {
        for (var i = 0; i < this.wheelInfos.length; i++) {
            this.wheelInfos[i].rotationBoost = boost;
        }
    }
    setRearWheelsRotationBoost(boost) {
        for (var i = 2; i < this.wheelInfos.length; i++) {
            this.wheelInfos[i].rotationBoost = boost;
        }
    }
    setFrontWheelsRotationBoost(boost) {
        for (var i = 0; i < Math.min(2, this.wheelInfos.length); i++) {
            this.wheelInfos[i].rotationBoost = boost;
        }
    }
    addToWorld(world) {
        this.world = world;
    }
    setArcadeSteeringInput(steering) {
        this.currentSteeringInput = Math.max(-1, Math.min(1, steering));
    }
    setIsArcadeHandbrakeActive(active) {
        this.isArcadeHandbrakeActive = active;
    }
    setIsArcadeBurnoutModeActive(active) {
        this.isArcadeBurnoutModeActive = active;
    }
    getIsArcadeBurnoutModeActive() {
        return this.isArcadeBurnoutModeActive;
    }
    setIsArcadeDonutModeActive(active) {
        this.isArcadeDonutModeActive = active;
        if (active && !this.donutModeEngaged) {
            this.donutModeEngaged = true;
            this.donutModeEngineBoost = 0.0;
        }
        else if (!active && this.donutModeEngaged) {
            this.donutModeEngaged = false;
        }
    }
    setArcadeFrontSideFactor(factor) {
        this.arcadeFrontSideFactor = factor;
    }
    setArcadeRearSideFactor(factor) {
        this.arcadeRearSideFactor = factor;
    }
    getDonutModeTransitionFactor() {
        return this.donutModeTransitionFactor;
    }
    getEasedDonutModeTransitionFactor() {
        return this.getEasedDonutTransitionFactor();
    }
    getDonutModeEngineBoost() {
        return this.donutModeEngineBoost;
    }
    isDonutModeEngaged() {
        return this.donutModeEngaged;
    }
    setDonutEngineMultiplier(multiplier) {
        this.donutEngineMultiplier = multiplier;
    }
    setDonutTurnRadius(radius) {
        this.donutTurnRadius = radius;
    }
    setDonutTransitionSpeed(speed) {
        this.donutTransitionSpeed = speed;
    }
    setDefaultBurnoutCoefficient(coefficient) {
        this.defaultBurnoutCoefficient = coefficient;
    }
    getDefaultBurnoutCoefficient() {
        return this.defaultBurnoutCoefficient;
    }
    setBurnoutCoefficient(coefficient) {
        this.burnoutTargetCoefficient = Math.max(1.0, coefficient);
        if (coefficient > 1.0 && !this.burnoutModeEngaged) {
            this.burnoutModeEngaged = true;
        }
        else if (coefficient <= 1.0 && this.burnoutModeEngaged) {
            this.burnoutModeEngaged = false;
        }
    }
    getBurnoutCoefficient() {
        return this.burnoutCoefficient;
    }
    getBurnoutPowerBoost() {
        return this.burnoutPowerBoost;
    }
    isBurnoutModeEngaged() {
        return this.burnoutModeEngaged;
    }
    setBurnoutTransitionSpeed(speed) {
        this.burnoutTransitionSpeed = Math.max(0.001, Math.min(1.0, speed));
    }
    setBaseRotationBoost(boost) {
        this.baseRotationBoost = Math.max(0.0, boost);
    }
    setDonutRotationBoost(boost) {
        this.donutRotationBoost = Math.max(0.0, boost);
    }
    getBaseRotationBoost() {
        return this.baseRotationBoost;
    }
    getDonutRotationBoost() {
        return this.donutRotationBoost;
    }
    getCurrentRotationBoost() {
        return this.currentRotationBoost;
    }
    setLoggingEnabled(enabled) {
        this.enableRoughTrackLogging = enabled;
    }
    getLoggingEnabled() {
        return this.enableRoughTrackLogging;
    }
    setMultiRaycastEnabled(enabled) {
        this.multiRaycastEnabled = enabled;
    }
    getMultiRaycastEnabled() {
        return this.multiRaycastEnabled;
    }
    setMultiRaycastRadiusScale(radiusMultiplier) {
        this.multiRaycastMultiplier = Math.max(1.0, Math.min(100.0, radiusMultiplier));
    }
    getMultiRaycastRadiusScale() {
        return this.multiRaycastMultiplier;
    }
    setStabilizeVelocityEnabled(enabled) {
        this.stabilizeVelocity = enabled;
    }
    getStabilizeVelocityEnabled() {
        return this.stabilizeVelocity;
    }
    applyVelocityBasedStabilization(wheel, wheelIndex) {
        if (!wheel.raycastResult.body)
            return;
        var wheelVel = new Vector3();
        HavokVehicleUtilities.velocityAt(this.chassisBody, wheel.chassisConnectionPointWorld, wheelVel);
        var verticalVel = Vector3.Dot(wheelVel, wheel.directionWorld);
        var velocityThreshold = 5.0;
        if (Math.abs(verticalVel) > velocityThreshold) {
            var dampingStrength = 0.3;
            var stabilizingForce = wheel.directionWorld.scale(-verticalVel * dampingStrength);
            HavokVehicleUtilities.addImpulseAt(this.chassisBody, stabilizingForce, wheel.raycastResult.hitPointWorld);
            wheel.suspensionRelativeVelocity *= 0.7;
            if (this.enableRoughTrackLogging) {
                console.log(`[VELOCITY STABILIZATION] Wheel ${wheelIndex}: Applied damping for vertical velocity=${verticalVel.toFixed(2)}m/s`);
            }
        }
    }
    applyPredictiveNormalStabilization(wheel, wheelIndex) {
        if (!wheel.raycastResult.body)
            return;
        var currentVel = HavokVehicleUtilities.bodyLinearVelocity(this.chassisBody, new Vector3());
        var timeStep = 1.0 / 60.0;
        var predictedPos = wheel.chassisConnectionPointWorld.add(currentVel.scale(timeStep));
        var predictiveResult = this.performSingleRaycast(wheel, predictedPos);
        if (predictiveResult && predictiveResult.body) {
            var blendFactor = 0.3;
            var currentNormal = wheel.raycastResult.hitNormalWorld;
            var predictedNormal = predictiveResult.hitNormalWorld;
            var normalDot = Vector3.Dot(currentNormal, predictedNormal);
            if (normalDot > 0.6) {
                var stabilizedNormal = new Vector3();
                Vector3.LerpToRef(currentNormal, predictedNormal, blendFactor, stabilizedNormal);
                stabilizedNormal.normalize();
                wheel.raycastResult.hitNormalWorld.copyFrom(stabilizedNormal);
                if (this.enableRoughTrackLogging && this.frameCounter % 30 === 0) {
                    console.log(`[PREDICTIVE STABILIZATION] Wheel ${wheelIndex}: Blended normal, dot=${normalDot.toFixed(3)}`);
                }
            }
        }
    }
    updateBurnoutCoefficient() {
        if (this.burnoutCoefficient !== this.burnoutTargetCoefficient) {
            var difference = this.burnoutTargetCoefficient - this.burnoutCoefficient;
            if (this.burnoutTargetCoefficient > this.burnoutCoefficient) {
                var fastTransitionSpeed = 0.5;
                var step = difference * fastTransitionSpeed;
                this.burnoutCoefficient += step;
            }
            else {
                var step = difference * this.burnoutTransitionSpeed;
                if (Math.abs(step) > Math.abs(difference)) {
                    this.burnoutCoefficient = this.burnoutTargetCoefficient;
                }
                else {
                    this.burnoutCoefficient += step;
                }
            }
            this.burnoutCoefficient = Math.max(0.1, Math.min(20.0, this.burnoutCoefficient));
        }
        this.burnoutPowerBoost = this.burnoutCoefficient - 1.0;
    }
    updateBurnoutModeActive() {
        if (this.isArcadeBurnoutModeActive) {
            this.setBurnoutCoefficient(this.defaultBurnoutCoefficient);
        }
        else {
            this.setBurnoutCoefficient(1.0);
        }
    }
    updateWheelRotationBoost() {
        var rotationBoost = 0.0;
        if (this.isArcadeDonutModeActive) {
            rotationBoost = this.donutRotationBoost;
        }
        else if (this.burnoutModeEngaged && this.burnoutCoefficient > 1.1) {
            rotationBoost = this.baseRotationBoost;
        }
        for (var i = 2; i < this.wheelInfos.length; i++) {
            this.wheelInfos[i].rotationBoost = rotationBoost;
        }
        for (var i = 0; i < Math.min(2, this.wheelInfos.length); i++) {
        }
    }
    updateCurrentFrictionSlip() {
        const lerpSpeed = Scalar.Clamp(this.frictionRestoreSpeed, 0.0, 1.0);
        if (lerpSpeed <= 0.0)
            return;
        const FL_WheelIndex = 0;
        const FR_WheelIndex = 1;
        const RL_WheelIndex = 2;
        const RR_WheelIndex = 3;
        const FL_WheelInfo = this.wheelInfos[FL_WheelIndex];
        const FR_WheelInfo = this.wheelInfos[FR_WheelIndex];
        const RL_WheelInfo = this.wheelInfos[RL_WheelIndex];
        const RR_WheelInfo = this.wheelInfos[RR_WheelIndex];
        if (FL_WheelInfo != null && FL_WheelInfo.defaultFriction != null) {
            let frontLeftFriction = FL_WheelInfo.frictionSlip;
            if (frontLeftFriction < (FL_WheelInfo.defaultFriction - 0.1)) {
                FL_WheelInfo.frictionLerping = true;
                frontLeftFriction = Scalar.Lerp(frontLeftFriction, FL_WheelInfo.defaultFriction, (FL_WheelInfo.frictionPenalty === true) ? (lerpSpeed * 3.0) : lerpSpeed);
                FL_WheelInfo.frictionSlip = frontLeftFriction;
            }
            else {
                FL_WheelInfo.frictionPenalty = false;
                FL_WheelInfo.frictionLerping = false;
                FL_WheelInfo.frictionSlip = FL_WheelInfo.defaultFriction;
            }
        }
        if (FR_WheelInfo != null && FR_WheelInfo.defaultFriction != null) {
            let frontRightFriction = FR_WheelInfo.frictionSlip;
            if (frontRightFriction < (FR_WheelInfo.defaultFriction - 0.1)) {
                FR_WheelInfo.frictionLerping = true;
                frontRightFriction = Scalar.Lerp(frontRightFriction, FR_WheelInfo.defaultFriction, (FR_WheelInfo.frictionPenalty === true) ? (lerpSpeed * 3.0) : lerpSpeed);
                FR_WheelInfo.frictionSlip = frontRightFriction;
            }
            else {
                FR_WheelInfo.frictionPenalty = false;
                FR_WheelInfo.frictionLerping = false;
                FR_WheelInfo.frictionSlip = FR_WheelInfo.defaultFriction;
            }
        }
        if (RL_WheelInfo != null && RL_WheelInfo.defaultFriction != null) {
            let backLeftFriction = RL_WheelInfo.frictionSlip;
            if (backLeftFriction < (RL_WheelInfo.defaultFriction - 0.1)) {
                RL_WheelInfo.frictionLerping = true;
                backLeftFriction = Scalar.Lerp(backLeftFriction, RL_WheelInfo.defaultFriction, (RL_WheelInfo.frictionPenalty === true) ? (lerpSpeed * 3.0) : lerpSpeed);
                RL_WheelInfo.frictionSlip = backLeftFriction;
            }
            else {
                RL_WheelInfo.frictionPenalty = false;
                RL_WheelInfo.frictionLerping = false;
                RL_WheelInfo.frictionSlip = RL_WheelInfo.defaultFriction;
            }
        }
        if (RR_WheelInfo != null && RR_WheelInfo.defaultFriction != null) {
            let backRightFriction = RR_WheelInfo.frictionSlip;
            if (backRightFriction < (RR_WheelInfo.defaultFriction - 0.1)) {
                RR_WheelInfo.frictionLerping = true;
                backRightFriction = Scalar.Lerp(backRightFriction, RR_WheelInfo.defaultFriction, (RR_WheelInfo.frictionPenalty === true) ? (lerpSpeed * 3.0) : lerpSpeed);
                RR_WheelInfo.frictionSlip = backRightFriction;
            }
            else {
                RR_WheelInfo.frictionPenalty = false;
                RR_WheelInfo.frictionLerping = false;
                RR_WheelInfo.frictionSlip = RR_WheelInfo.defaultFriction;
            }
        }
    }
    getAngularDampingReduction() {
        return this.getEasedDonutTransitionFactor() * 0.8;
    }
    getEasedDonutTransitionFactor() {
        var t = this.donutModeTransitionFactor;
        return t * t * t * (6 * t * t - 15 * t + 10);
    }
    getVehicleAxisWorld(axisIndex, result) {
        result.set(axisIndex === 0 ? 1 : 0, axisIndex === 1 ? 1 : 0, axisIndex === 2 ? 1 : 0);
        Vector3.TransformCoordinatesToRef(result, HavokVehicleUtilities.bodyTransform(this.chassisBody, new Matrix()), result);
        return result;
    }
    getCurrentSpeedKmHour() {
        return this.currentVehicleSpeedKmHour;
    }
    calculateSteeringChangeRate(timeStep) {
        this.steeringChangeRate = Math.abs(this.currentSteeringInput - this.previousSteeringInput) / timeStep;
        this.previousSteeringInput = this.currentSteeringInput;
    }
    isDriftSystemEnabled() {
        return this.isDriftModeEnabled;
    }
    setDriftSystemEnabled(enabled) {
        this.isDriftModeEnabled = enabled;
    }
    setDriftMaxSpeed(maxSpeed) {
        this.driftMaxSpeed = maxSpeed;
    }
    getDriftMaxSpeed() {
        return this.driftMaxSpeed;
    }
    setDriftSpeedThreshold(threshold) {
        this.driftSpeedThreshold = threshold;
    }
    getDriftSpeedThreshold() {
        return this.driftSpeedThreshold;
    }
    setDriftGripReduction(reduction) {
        this.driftGripReduction = Math.max(0.0, Math.min(1.0, reduction));
    }
    getDriftGripReduction() {
        return this.driftGripReduction;
    }
    setDriftSteeringThreshold(threshold) {
        this.driftSteeringThreshold = threshold;
    }
    getDriftSteeringThreshold() {
        return this.driftSteeringThreshold;
    }
    setDriftSettings(settings) {
        if (settings.maxSpeed !== undefined)
            this.driftMaxSpeed = settings.maxSpeed;
        if (settings.speedThreshold !== undefined)
            this.driftSpeedThreshold = settings.speedThreshold;
        if (settings.gripReduction !== undefined)
            this.driftGripReduction = Math.max(0.0, Math.min(1.0, settings.gripReduction));
        if (settings.steeringThreshold !== undefined)
            this.driftSteeringThreshold = settings.steeringThreshold;
    }
    getDriftIntensity() {
        return this.driftIntensity;
    }
    isDrifting() {
        return this.driftIntensity > 0.1;
    }
    updateDriftState(timeStep) {
        if (!this.isDriftModeEnabled) {
            this.driftIntensity = Math.max(0.0, this.driftIntensity - this.driftTransitionSpeed);
            return;
        }
        var currentSpeed = Math.abs(this.currentVehicleSpeedKmHour);
        var steeringInput = Math.abs(this.currentSteeringInput);
        var speedFactor = 0.0;
        if (currentSpeed > this.driftSpeedThreshold) {
            speedFactor = Math.min(1.0, (currentSpeed - this.driftSpeedThreshold) / (this.driftMaxSpeed - this.driftSpeedThreshold));
        }
        var steeringFactor = Math.max(0.0, (steeringInput - this.driftSteeringThreshold) / (1.0 - this.driftSteeringThreshold));
        var changeRateFactor = Math.min(1.0, this.steeringChangeRate * 2.0);
        var targetDriftIntensity = speedFactor * steeringFactor * changeRateFactor;
        if (targetDriftIntensity > this.driftIntensity) {
            this.driftIntensity = Math.min(targetDriftIntensity, this.driftIntensity + this.driftTransitionSpeed);
        }
        else {
            this.driftIntensity = Math.max(targetDriftIntensity, this.driftIntensity - this.driftTransitionSpeed * 0.5);
        }
        if (this.driftIntensity > 0.1) {
            this.driftDirection = this.currentSteeringInput > 0 ? 1.0 : -1.0;
        }
    }
    updateVehicle(timeStep) {
        this.frameCounter++;
        var wheelInfos = this.wheelInfos;
        var numWheels = wheelInfos.length;
        var chassisBody = this.chassisBody;
        for (var i = 0; i < numWheels; i++) {
            this.updateWheelTransform(i);
        }
        const cVel = HavokVehicleUtilities.bodyLinearVelocity(chassisBody, new Vector3());
        const cVelLocal = Vector3.TransformNormalToRef(cVel, HavokVehicleUtilities.bodyTransform(chassisBody, new Matrix()).invert(), new Vector3());
        this.currentVehicleSpeedKmHour = (cVelLocal.z * 3.6);
        this.calculateSteeringChangeRate(timeStep);
        this.updateDriftState(timeStep);
        this.updateBurnoutModeActive();
        this.updateWheelRotationBoost();
        this.updateCurrentFrictionSlip();
        for (var i = 0; i < numWheels; i++) {
            this.performCasting(wheelInfos[i]);
        }
        var wheelsOnGround = 0;
        for (var i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];
            var groundObject = wheel.raycastResult.body;
            if (groundObject) {
                wheelsOnGround++;
            }
        }
        if (wheelsOnGround == 0 && this.smoothFlyingImpulse > 0) {
        }
        this.updateSuspension(timeStep);
        var impulse = new Vector3();
        for (var i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];
            var suspensionForce = wheel.suspensionForce;
            if (suspensionForce > wheel.maxSuspensionForce) {
                suspensionForce = wheel.maxSuspensionForce;
            }
            impulse.copyFrom(wheel.raycastResult.hitNormalWorld).scaleInPlace(suspensionForce * timeStep);
            HavokVehicleUtilities.addImpulseAt(chassisBody, impulse, wheel.raycastResult.hitPointWorld);
        }
        this.updateFriction(timeStep);
        if (this.stabilizingForce > 0 && this.minimumWheelContacts > 0 && wheelsOnGround >= this.minimumWheelContacts) {
        }
        var hitNormalWorldScaledWithProj = new Vector3();
        var vel = new Vector3();
        for (i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];
            HavokVehicleUtilities.velocityAt(chassisBody, wheel.chassisConnectionPointWorld, vel);
            if (wheel.isInContact) {
                var chassisTransform = HavokVehicleUtilities.bodyTransform(chassisBody, new Matrix());
                var velLocal = new Vector3();
                Vector3.TransformNormalToRef(vel, chassisTransform.invert(), velLocal);
                var forwardVelocity = velLocal.z;
                var groundNormal = wheel.raycastResult.hitNormalWorld;
                var forwardDirection = new Vector3(0, 0, 1);
                Vector3.TransformNormalToRef(forwardDirection, chassisTransform, forwardDirection);
                var proj = Vector3.Dot(forwardDirection, groundNormal);
                hitNormalWorldScaledWithProj.copyFrom(groundNormal).scaleInPlace(proj);
                forwardDirection.subtractToRef(hitNormalWorldScaledWithProj, forwardDirection);
                var angularVelocity = forwardVelocity / wheel.radius;
                var physicsBasedDelta = angularVelocity * timeStep;
                if (wheel.rotationBoost > 0) {
                    var rotationDirection = 0;
                    if (Math.abs(wheel.engineForce) > 0.001) {
                        rotationDirection = wheel.engineForce > 0 ? -1 : 1;
                    }
                    var burnoutMultiplier = 3.0;
                    var extraRotation = rotationDirection * wheel.rotationBoost * burnoutMultiplier * timeStep;
                    if (rotationDirection !== 0) {
                        var previousDirection = wheel.deltaRotation > 0 ? 1 : (wheel.deltaRotation < 0 ? -1 : 0);
                        if (previousDirection !== 0 && previousDirection !== rotationDirection) {
                            wheel.rotation = 0;
                        }
                        wheel.deltaRotation = extraRotation;
                    }
                    else {
                        wheel.rotation = 0;
                        wheel.deltaRotation = physicsBasedDelta;
                    }
                }
                else {
                    wheel.deltaRotation = physicsBasedDelta;
                }
            }
            else {
                if (wheel.rotationBoost > 0 && Math.abs(wheel.engineForce) > 0.001) {
                    var rotationDirection = wheel.engineForce > 0 ? -1 : 1;
                    var burnoutMultiplier = 3.0;
                    var extraRotation = rotationDirection * wheel.rotationBoost * burnoutMultiplier * timeStep;
                    var previousDirection = wheel.deltaRotation > 0 ? 1 : (wheel.deltaRotation < 0 ? -1 : 0);
                    if (previousDirection !== 0 && previousDirection !== rotationDirection) {
                        wheel.rotation = 0;
                    }
                    wheel.deltaRotation = extraRotation;
                }
                else {
                    wheel.deltaRotation = 0;
                }
                wheel.rotation += wheel.deltaRotation;
            }
            if ((wheel.sliding || !wheel.isInContact) && wheel.engineForce !== 0 && wheel.useCustomSlidingRotationalSpeed) {
                var customDelta = (wheel.engineForce > 0 ? 1 : -1) * wheel.customSlidingRotationalSpeed * timeStep;
                wheel.deltaRotation = customDelta;
                wheel.rotation += customDelta;
            }
            wheel.deltaRotation *= 0.99;
            if (wheel.locked === true) {
                wheel.deltaRotation = 0;
            }
            else {
                wheel.rotation += wheel.deltaRotation;
            }
        }
    }
    updateSuspension(deltaTime) {
        var chassisBody = this.chassisBody;
        var chassisMass = HavokVehicleUtilities.bodyMass(chassisBody);
        var wheelInfos = this.wheelInfos;
        var numWheels = wheelInfos.length;
        for (var w_it = 0; w_it < numWheels; w_it++) {
            var wheel = wheelInfos[w_it];
            if (wheel.isInContact) {
                var force = 0;
                var chassisMass = HavokVehicleUtilities.bodyMass(chassisBody);
                var suspLength = wheel.suspensionRestLength;
                var currentLength = wheel.suspensionLength;
                var lengthDiff = (suspLength - currentLength);
                var progressiveSpringRate = wheel.suspensionStiffness;
                var compressionRatio = Math.abs(lengthDiff) / wheel.maxSuspensionTravel;
                if (compressionRatio > 0.7) {
                    var stiffenFactor = 1.0 + (compressionRatio - 0.7) * 2.0;
                    progressiveSpringRate *= stiffenFactor;
                }
                force = progressiveSpringRate * lengthDiff * wheel.clippedInvContactDotSuspension;
                var projectedVel = wheel.suspensionRelativeVelocity;
                var dampingCoeff = (projectedVel < 0.0) ? wheel.dampingCompression : wheel.dampingRelaxation;
                var surfaceRoughness = this.calculateSurfaceRoughness(wheel, w_it);
                var roughnessDampingReduction = 1.0 - (surfaceRoughness * 0.4);
                dampingCoeff *= roughnessDampingReduction;
                force -= dampingCoeff * projectedVel;
                var targetSuspensionForce = force * chassisMass;
                var maxReasonableForce = chassisMass * 50.0;
                targetSuspensionForce = Math.max(-maxReasonableForce, Math.min(maxReasonableForce, targetSuspensionForce));
                var baseBlendRate = 0.85;
                var adaptiveBlendRate = baseBlendRate;
                if (surfaceRoughness > 0.3) {
                    adaptiveBlendRate = Math.max(0.6, baseBlendRate - surfaceRoughness * 0.3);
                }
                if (Math.abs(this.currentSteeringInput) > 0.2) {
                    var steeringFactor = Math.abs(this.currentSteeringInput);
                    adaptiveBlendRate = Math.max(0.7, adaptiveBlendRate - steeringFactor * 0.15);
                }
                if (this.currentVehicleSpeedKmHour > 10.0) {
                    var speedFactor = Math.min(0.2, this.currentVehicleSpeedKmHour / 50.0);
                    adaptiveBlendRate = Math.max(0.65, adaptiveBlendRate - speedFactor);
                }
                wheel.suspensionForce = wheel.suspensionForce * (1.0 - adaptiveBlendRate) + targetSuspensionForce * adaptiveBlendRate;
                if (wheel.suspensionForce < 0) {
                    wheel.suspensionForce = 0;
                }
            }
            else {
                wheel.suspensionForce = 0;
            }
        }
    }
    removeFromWorld(world) {
        world.removeBody(this.chassisBody);
        this.world = null;
    }
    calculateSurfaceRoughness(wheel, wheelIndex) {
        if (!wheel.raycastResult.body)
            return 0.0;
        var currentNormal = wheel.raycastResult.hitNormalWorld;
        var expectedUp = wheel.directionWorld.scale(-1);
        var normalDeviation = 1.0 - Vector3.Dot(currentNormal, expectedUp);
        var suspensionDeviation = Math.abs(wheel.suspensionLength - wheel.suspensionRestLength) / wheel.maxSuspensionTravel;
        var wheelVel = new Vector3();
        HavokVehicleUtilities.velocityAt(this.chassisBody, wheel.raycastResult.hitPointWorld, wheelVel);
        var verticalVel = Math.abs(Vector3.Dot(wheelVel, wheel.directionWorld));
        var velocityRoughness = Math.min(1.0, verticalVel / 3.0);
        var totalRoughness = (normalDeviation * 0.5) + (suspensionDeviation * 0.3) + (velocityRoughness * 0.2);
        return Math.min(1.0, totalRoughness);
    }
    isValidDrivableSurface(normal, wheelIndex) {
        var surfaceAngle = this.calculateSurfaceAngle(normal);
        var maxDrivableAngle = 45.0;
        if (surfaceAngle > maxDrivableAngle) {
            return false;
        }
        var worldUp = new Vector3(0, 1, 0);
        var upwardDot = Vector3.Dot(normal, worldUp);
        if (upwardDot < 0.5) {
            return false;
        }
        return true;
    }
    calculateSurfaceAngle(normal) {
        var worldUp = new Vector3(0, 1, 0);
        var dot = Math.max(-1, Math.min(1, Vector3.Dot(normal, worldUp)));
        var angleRadians = Math.acos(dot);
        return angleRadians * (180.0 / Math.PI);
    }
    performCasting(wheel) {
        this.updateWheelTransformWorld(wheel);
        var depth = -1;
        var chassisBody = this.chassisBody;
        var wheelIndex = this.wheelInfos.indexOf(wheel);
        var finalRaycastResult = this.performThinMultiRaycast(wheel, wheelIndex);
        wheel.raycastResult.groundObject = 0;
        if (finalRaycastResult) {
            wheel.raycastResult.body = finalRaycastResult.body;
            wheel.raycastResult.hitPointWorld.copyFrom(finalRaycastResult.hitPointWorld);
            wheel.raycastResult.hitNormalWorld.copyFrom(finalRaycastResult.hitNormalWorld);
            wheel.raycastResult.hitNormal.copyFrom(finalRaycastResult.hitNormalWorld);
            depth = finalRaycastResult.distance;
            if (this.stabilizeVelocity === true)
                this.applyPredictiveNormalStabilization(wheel, wheelIndex);
            wheel.raycastResult.distance = depth;
            wheel.suspensionLength = depth - wheel.radius;
            wheel.isInContact = true;
            var minSuspensionLength = wheel.suspensionRestLength - wheel.maxSuspensionTravel;
            var maxSuspensionLength = wheel.suspensionRestLength + wheel.maxSuspensionTravel;
            if (wheel.suspensionLength < minSuspensionLength) {
                wheel.suspensionLength = minSuspensionLength;
            }
            if (wheel.suspensionLength > maxSuspensionLength) {
                wheel.suspensionLength = maxSuspensionLength;
                wheel.raycastResult.reset();
            }
            var denominator = Vector3.Dot(wheel.raycastResult.hitNormalWorld, wheel.directionWorld);
            var chassis_velocity_at_contactPoint = new Vector3();
            HavokVehicleUtilities.velocityAt(chassisBody, wheel.raycastResult.hitPointWorld, chassis_velocity_at_contactPoint);
            var projVel = Vector3.Dot(wheel.raycastResult.hitNormalWorld, chassis_velocity_at_contactPoint);
            if (denominator >= -0.1) {
                wheel.suspensionRelativeVelocity = 0;
                wheel.clippedInvContactDotSuspension = 1 / 0.1;
            }
            else {
                var inv = -1 / denominator;
                wheel.suspensionRelativeVelocity = projVel * inv;
                wheel.clippedInvContactDotSuspension = inv;
            }
            if (this.stabilizeVelocity === true)
                this.applyVelocityBasedStabilization(wheel, wheelIndex);
        }
        else {
            wheel.suspensionLength = wheel.suspensionRestLength + 0 * wheel.maxSuspensionTravel;
            wheel.suspensionRelativeVelocity = 0.0;
            wheel.directionWorld.scaleToRef(-1, wheel.raycastResult.hitNormalWorld);
            wheel.clippedInvContactDotSuspension = 1.0;
        }
        return depth;
    }
    updateWheelTransformWorld(wheel) {
        wheel.isInContact = false;
        var chassisBody = this.chassisBody;
        const transform = HavokVehicleUtilities.bodyTransform(chassisBody, new Matrix());
        Vector3.TransformCoordinatesToRef(wheel.chassisConnectionPointLocal, transform, wheel.chassisConnectionPointWorld);
        Vector3.TransformNormalToRef(wheel.directionLocal, transform, wheel.directionWorld);
        Vector3.TransformNormalToRef(wheel.axleLocal, transform, wheel.axleWorld);
    }
    updateWheelTransform(wheelIndex) {
        var up = HavokVehicleUtilities.tmpVec4;
        var right = HavokVehicleUtilities.tmpVec5;
        var fwd = HavokVehicleUtilities.tmpVec6;
        var wheel = this.wheelInfos[wheelIndex];
        this.updateWheelTransformWorld(wheel);
        wheel.directionLocal.scaleToRef(-1, up);
        right.copyFrom(wheel.axleLocal);
        Vector3.CrossToRef(up, right, fwd);
        fwd.normalize();
        right.normalize();
        var steering = wheel.steering;
        var steeringOrn = new Quaternion();
        Quaternion.RotationAxisToRef(up, steering, steeringOrn);
        var rotatingOrn = new Quaternion();
        Quaternion.RotationAxisToRef(right, wheel.rotation, rotatingOrn);
        var q = wheel.worldTransform.rotationQuaternion;
        HavokVehicleUtilities.bodyOrientation(this.chassisBody, new Quaternion()).multiplyToRef(steeringOrn, q);
        q.multiplyToRef(rotatingOrn, q);
        q.normalize();
        var p = wheel.worldTransform.position;
        p.copyFrom(wheel.directionWorld);
        p.scaleToRef(wheel.suspensionLength, p);
        p.addToRef(wheel.chassisConnectionPointWorld, p);
        wheel.worldTransform.computeWorldMatrix(true);
    }
    getWheelTransformWorld(wheelIndex) {
        return this.wheelInfos[wheelIndex].worldTransform;
    }
    updateFriction(timeStep) {
        var surfNormalWS_scaled_proj = HavokVehicleUtilities.updateFriction_surfNormalWS_scaled_proj;
        var wheelInfos = this.wheelInfos;
        var numWheels = wheelInfos.length;
        var chassisBody = this.chassisBody;
        var forwardWS = HavokVehicleUtilities.updateFriction_forwardWS;
        var axle = HavokVehicleUtilities.updateFriction_axle;
        var numWheelsOnGround = 0;
        for (var i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];
            var groundObject = wheel.raycastResult.body;
            if (groundObject) {
                numWheelsOnGround++;
            }
            wheel.sideImpulse = 0;
            wheel.forwardImpulse = 0;
            if (!forwardWS[i]) {
                forwardWS[i] = new Vector3();
            }
            if (!axle[i]) {
                axle[i] = new Vector3();
            }
        }
        for (var i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];
            var groundObject = wheel.raycastResult.body;
            if (groundObject) {
                var axlei = axle[i];
                var wheelTrans = this.getWheelTransformWorld(i);
                Vector3.TransformNormalToRef(HavokVehicleUtilities.directions[this.indexRightAxis], wheelTrans.getWorldMatrix(), axlei);
                var surfNormalWS = wheel.raycastResult.hitNormalWorld;
                var proj = Vector3.Dot(axlei, surfNormalWS);
                surfNormalWS.scaleToRef(proj, surfNormalWS_scaled_proj);
                axlei.subtractToRef(surfNormalWS_scaled_proj, axlei);
                axlei.normalize();
                Vector3.CrossToRef(surfNormalWS, axlei, forwardWS[i]);
                forwardWS[i].normalize();
                wheel.sideImpulse = HavokVehicleUtilities.resolveSingleBilateral(chassisBody, wheel.raycastResult.hitPointWorld, groundObject, wheel.raycastResult.hitPointWorld, axlei);
                wheel.sideImpulse *= HavokVehicleUtilities.sideFrictionStiffness2;
                if (this.isArcadeHandbrakeActive && this.handbrakeEngaged) {
                    var sideImpulseReduction = 0.3 + (this.arcadeHandbrakeTransitionFactor * 0.4);
                    wheel.sideImpulse *= (1.0 - sideImpulseReduction);
                }
            }
        }
        this.sliding = false;
        for (var i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];
            var groundObject = wheel.raycastResult.body;
            var rollingFriction = 0.0;
            var sideFactor = 1;
            var fwdFactor = 0.5;
            if (this.isArcadeHandbrakeActive) {
                if (!this.handbrakeEngaged) {
                    this.handbrakeEngaged = true;
                    HavokVehicleUtilities.bodyAngularVelocity(chassisBody, this.handbrakeAngularVelocity);
                    this.handbrakeAngularVelocity.scaleInPlace(0.8);
                }
                this.arcadeHandbrakeTransitionFactor = Math.min(this.arcadeHandbrakeTransitionFactor + 0.15, 1.0);
                var transitionFactor = this.arcadeHandbrakeTransitionFactor;
                if (i >= 2) {
                    sideFactor = 1.0 - (transitionFactor * (1.0 - this.arcadeRearSideFactor));
                }
                else {
                    var baseFrontFactor = this.arcadeFrontSideFactor;
                    var steerAssist = Math.abs(this.currentSteeringInput) * 0.3;
                    var steerAdjustedFrontFactor = baseFrontFactor - steerAssist;
                    steerAdjustedFrontFactor = Math.max(0.2, steerAdjustedFrontFactor);
                    sideFactor = 1.0 - (transitionFactor * (1.0 - steerAdjustedFrontFactor));
                }
            }
            else {
                if (this.handbrakeEngaged) {
                    this.handbrakeEngaged = false;
                    this.handbrakeAngularVelocity.setAll(0);
                }
                this.arcadeHandbrakeTransitionFactor = Math.max(this.arcadeHandbrakeTransitionFactor - 0.08, 0.0);
                if (this.isDriftModeEnabled && this.driftIntensity > 0.0) {
                    var driftGripLoss = this.driftIntensity * this.driftGripReduction;
                    if (i >= 2) {
                        sideFactor *= (1.0 - driftGripLoss * 0.8);
                    }
                    else {
                        sideFactor *= (1.0 - driftGripLoss * 0.3);
                    }
                    fwdFactor *= (1.0 + driftGripLoss * 0.2);
                }
            }
            if (this.isArcadeDonutModeActive) {
                this.donutModeTransitionFactor = Math.min(this.donutModeTransitionFactor + this.donutTransitionSpeed, 1.0);
                var easedTransitionFactor = this.getEasedDonutTransitionFactor();
                this.donutModeEngineBoost = easedTransitionFactor * (this.donutEngineMultiplier - 1.0);
                var donutTransitionFactor = easedTransitionFactor;
                if (i >= 2) {
                    var normalizedRadius = Math.max(0.1, Math.min(10.0, this.donutTurnRadius));
                    var radiusBasedReduction = 0.05 + (10.0 - normalizedRadius) / 10.0 * 0.93;
                    sideFactor *= (1.0 - donutTransitionFactor * radiusBasedReduction);
                }
                else {
                    var normalizedRadius = Math.max(0.1, Math.min(10.0, this.donutTurnRadius));
                    var frontReduction = 0.10 + (10.0 - normalizedRadius) / 10.0 * 0.70;
                    sideFactor *= (1.0 - donutTransitionFactor * frontReduction);
                }
            }
            else {
                this.donutModeTransitionFactor = Math.max(this.donutModeTransitionFactor - this.donutTransitionSpeed, 0.0);
                var easedTransitionFactor = this.getEasedDonutTransitionFactor();
                this.donutModeEngineBoost = easedTransitionFactor * (this.donutEngineMultiplier - 1.0);
            }
            this.updateBurnoutCoefficient();
            if (groundObject) {
                if (Math.abs(wheel.engineForce) > 0.0) {
                    var effectiveEngineForce = wheel.engineForce * (1.0 + this.donutModeEngineBoost) * this.burnoutCoefficient;
                    rollingFriction = effectiveEngineForce * timeStep;
                }
                else {
                    var defaultRollingFrictionImpulse = 0.0;
                    var maxImpulse = wheel.brake ? wheel.brake : defaultRollingFrictionImpulse;
                    rollingFriction = HavokVehicleUtilities.calcRollingFriction(chassisBody, groundObject, wheel.raycastResult.hitPointWorld, forwardWS[i], maxImpulse, numWheelsOnGround);
                }
            }
            wheel.forwardImpulse = 0;
            wheel.skidInfo = 1;
            if (groundObject) {
                wheel.skidInfo = 1;
                var maximp = wheel.suspensionForce * timeStep * wheel.frictionSlip;
                var maximpSide = maximp;
                var maximpSquared = maximp * maximpSide;
                wheel.forwardImpulse = rollingFriction;
                var x = wheel.forwardImpulse * fwdFactor;
                var y = wheel.sideImpulse * sideFactor;
                var impulseSquared = x * x + y * y;
                wheel.sliding = false;
                if (impulseSquared > maximpSquared) {
                    this.sliding = true;
                    wheel.sliding = true;
                    var factor = maximp / Math.sqrt(impulseSquared);
                    wheel.skidInfo *= factor;
                }
            }
        }
        if (this.isArcadeHandbrakeActive && this.isArcadeDonutModeActive) {
            for (var i = 2; i < numWheels; i++) {
                var wheel = wheelInfos[i];
                if (wheel.raycastResult.body) {
                    wheel.sliding = true;
                    var targetSkidInfo = 0.1 + (this.arcadeHandbrakeTransitionFactor * 0.2);
                    wheel.skidInfo = Math.min(wheel.skidInfo, targetSkidInfo);
                    this.sliding = true;
                }
            }
        }
        else if (this.isArcadeHandbrakeActive) {
        }
        else if (this.isDriftModeEnabled && this.driftIntensity > 0.3) {
            for (var i = 2; i < numWheels; i++) {
                var wheel = wheelInfos[i];
                if (wheel.raycastResult.body) {
                    wheel.sliding = true;
                    var targetSkidInfo = 0.3 + (this.driftIntensity * 0.4);
                    wheel.skidInfo = Math.min(wheel.skidInfo, targetSkidInfo);
                    this.sliding = true;
                }
            }
        }
        if (this.sliding) {
            for (var i = 0; i < numWheels; i++) {
                var wheel = wheelInfos[i];
                if (wheel.sideImpulse !== 0) {
                    if (wheel.skidInfo < 1) {
                        wheel.forwardImpulse *= wheel.skidInfo;
                        wheel.sideImpulse *= wheel.skidInfo;
                    }
                }
            }
        }
        for (var i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];
            var rel_pos = new Vector3();
            wheel.raycastResult.hitPointWorld.subtractToRef(HavokVehicleUtilities.bodyPosition(chassisBody, new Vector3()), rel_pos);
            if (wheel.forwardImpulse !== 0) {
                var impulse = new Vector3();
                impulse.copyFrom(forwardWS[i]).scaleInPlace(wheel.forwardImpulse);
                HavokVehicleUtilities.addImpulseAt(chassisBody, impulse, wheel.raycastResult.hitPointWorld);
            }
            if (wheel.sideImpulse !== 0) {
                var groundObject = wheel.raycastResult.body;
                var rel_pos2 = new Vector3();
                wheel.raycastResult.hitPointWorld.subtractToRef(HavokVehicleUtilities.bodyPosition(groundObject, new Vector3()), rel_pos2);
                var sideImp = new Vector3();
                sideImp.copyFrom(axle[i]).scaleInPlace(wheel.sideImpulse);
                Vector3.TransformNormalToRef(rel_pos, HavokVehicleUtilities.bodyTransform(chassisBody, new Matrix()).invert(), rel_pos);
                rel_pos['xyz'[this.indexUpAxis]] *= wheel.rollInfluence;
                Vector3.TransformNormalToRef(rel_pos, HavokVehicleUtilities.bodyTransform(chassisBody, new Matrix()), rel_pos);
                HavokVehicleUtilities.addImpulseAt(chassisBody, sideImp, HavokVehicleUtilities.bodyPosition(chassisBody, new Vector3()).add(rel_pos));
                sideImp.scaleToRef(-1, sideImp);
                HavokVehicleUtilities.addImpulseAt(groundObject, sideImp, wheel.raycastResult.hitPointWorld);
            }
        }
        if (this.isArcadeHandbrakeActive && this.handbrakeEngaged) {
            this.handbrakeAngularVelocity.scaleInPlace(0.985);
            var currentAngularVel = HavokVehicleUtilities.bodyAngularVelocity(chassisBody, new Vector3());
            if (Math.abs(this.currentSteeringInput) > 0.1) {
                var speedKmh = Math.abs(this.currentVehicleSpeedKmHour);
                var speedFactor = Math.min(speedKmh / 80.0, 1.0);
                var steerYawTorque = this.currentSteeringInput * this.arcadeSteerAssistFactor * speedFactor * timeStep;
                if (this.donutModeTransitionFactor > 0) {
                    var easedDonutFactor = this.getEasedDonutTransitionFactor();
                    var donutAssistBoost = 1.0 + (easedDonutFactor * 0.1);
                    steerYawTorque *= donutAssistBoost;
                }
                var assistedAngularVel = new Vector3();
                assistedAngularVel.copyFrom(currentAngularVel);
                assistedAngularVel.y += steerYawTorque;
                chassisBody.setAngularVelocity(assistedAngularVel);
                this.handbrakeAngularVelocity.y = assistedAngularVel.y * 0.8;
            }
            else {
                if (Math.abs(this.handbrakeAngularVelocity.y) > 0.2) {
                    var momentumLoss = Math.abs(this.handbrakeAngularVelocity.y) - Math.abs(currentAngularVel.y);
                    if (momentumLoss > 0.8) {
                        var yawTorque = new Vector3(0, this.handbrakeAngularVelocity.y * this.handbrakePreserveFactor * timeStep * 0.02, 0);
                        var gentleAngularVel = new Vector3();
                        currentAngularVel.scaleToRef(0.95, gentleAngularVel);
                        gentleAngularVel.y += yawTorque.y;
                        chassisBody.setAngularVelocity(gentleAngularVel);
                    }
                }
            }
        }
        else if (this.isDriftModeEnabled && this.driftIntensity > 0.2) {
            var currentAngularVel = HavokVehicleUtilities.bodyAngularVelocity(chassisBody, new Vector3());
            var driftAssistStrength = 3.0;
            var speedBonus = Math.min(1.5, Math.abs(this.currentVehicleSpeedKmHour) / 60.0);
            var driftYawTorque = this.currentSteeringInput * this.driftIntensity * driftAssistStrength * speedBonus * timeStep;
            var assistedAngularVel = new Vector3();
            assistedAngularVel.copyFrom(currentAngularVel);
            assistedAngularVel.y += driftYawTorque;
            chassisBody.setAngularVelocity(assistedAngularVel);
        }
    }
    performSingleRaycast(wheel, startPos) {
        var rayvector = new Vector3();
        var target = new Vector3();
        var raylen = wheel.suspensionRestLength + wheel.radius;
        wheel.directionWorld.scaleToRef(raylen, rayvector);
        startPos.addToRef(rayvector, target);
        if (this.raycastResult == null)
            this.raycastResult = new PhysicsRaycastResult();
        this.raycastResult.reset();
        RigidbodyPhysics.RaycastToRef(startPos, target, this.raycastResult);
        if (this.raycastResult.body) {
            var distance = Vector3.Distance(startPos, this.raycastResult.hitPointWorld);
            return {
                hit: true,
                body: this.raycastResult.body,
                normal: this.raycastResult.hitNormalWorld.clone(),
                distance: distance,
                hitPoint: this.raycastResult.hitPointWorld.clone(),
                suspensionLength: distance - wheel.radius,
                hitPointWorld: this.raycastResult.hitPointWorld.clone(),
                hitNormalWorld: this.raycastResult.hitNormalWorld.clone()
            };
        }
        return { hit: false };
    }
    performThinMultiRaycast(wheel, wheelIndex) {
        var raycastCount = (this.multiRaycastEnabled === true) ? 5 : 1;
        var raylen = wheel.suspensionRestLength + wheel.radius;
        var validResults = [];
        for (var i = 0; i < raycastCount; i++) {
            var offset = new Vector3();
            if (raycastCount > 1) {
                var angle = (i / (raycastCount - 1)) * Math.PI * 2;
                var offsetDistance = wheel.radius * this.multiRaycastMultiplier;
                if (i === 0) {
                    offset.set(0, 0, 0);
                }
                else {
                    var circleAngle = ((i - 1) / (raycastCount - 1)) * Math.PI * 2;
                    offset.x = Math.cos(circleAngle) * offsetDistance;
                    offset.z = Math.sin(circleAngle) * offsetDistance;
                }
            }
            var worldOffset = new Vector3();
            if (offset.lengthSquared() > 0) {
                var transform = HavokVehicleUtilities.bodyTransform(this.chassisBody, new Matrix());
                var rightAxis = new Vector3();
                var forwardAxis = new Vector3();
                Vector3.TransformNormalToRef(HavokVehicleUtilities.directions[this.indexRightAxis], transform, rightAxis);
                Vector3.TransformNormalToRef(HavokVehicleUtilities.directions[this.indexForwardAxis], transform, forwardAxis);
                worldOffset = rightAxis.scale(offset.x).add(forwardAxis.scale(offset.z));
            }
            var startPos = wheel.chassisConnectionPointWorld.add(worldOffset);
            var direction = wheel.directionWorld.scale(raylen);
            var endPos = startPos.add(direction);
            if (this.raycastResult == null)
                this.raycastResult = new PhysicsRaycastResult();
            this.raycastResult.reset();
            RigidbodyPhysics.RaycastToRef(startPos, endPos, this.raycastResult);
            if (this.raycastResult.body) {
                var distance = Vector3.Distance(startPos, this.raycastResult.hitPointWorld);
                if (this.isValidDrivableSurface(this.raycastResult.hitNormalWorld, wheelIndex)) {
                    validResults.push({
                        body: this.raycastResult.body,
                        hitPointWorld: this.raycastResult.hitPointWorld.clone(),
                        hitNormalWorld: this.raycastResult.hitNormalWorld.clone(),
                        distance: distance,
                        weight: (i === 0) ? 2.0 : 1.0
                    });
                }
            }
        }
        if (validResults.length === 0) {
            return null;
        }
        else if (validResults.length === 1) {
            var result = validResults[0];
            return {
                body: result.body,
                hitPointWorld: result.hitPointWorld,
                hitNormalWorld: result.hitNormalWorld,
                distance: result.distance
            };
        }
        else {
            var totalWeight = 0;
            var avgHitPoint = Vector3.Zero();
            var avgNormal = Vector3.Zero();
            var avgDistance = 0;
            var firstBody = validResults[0].body;
            for (var i = 0; i < validResults.length; i++) {
                var result = validResults[i];
                var weight = result.weight;
                avgHitPoint.addInPlace(result.hitPointWorld.scale(weight));
                avgNormal.addInPlace(result.hitNormalWorld.scale(weight));
                avgDistance += result.distance * weight;
                totalWeight += weight;
            }
            if (totalWeight > 0) {
                avgHitPoint.scaleInPlace(1.0 / totalWeight);
                avgNormal.scaleInPlace(1.0 / totalWeight);
                avgNormal.normalize();
                avgDistance /= totalWeight;
                return {
                    body: firstBody,
                    hitPointWorld: avgHitPoint,
                    hitNormalWorld: avgNormal,
                    distance: avgDistance
                };
            }
        }
        return null;
    }
}
HavokRaycastVehicle.WHEEL_SPEED_SCALE = 1.0;
HavokRaycastVehicle.MUSTANG_GT_FRONT_WHEEL_CONFIG = {
    suspensionRestLength: 0.35,
    maxSuspensionTravel: 30.0,
    radius: 0.33,
    suspensionStiffness: 25.0,
    dampingCompression: 4.5,
    dampingRelaxation: 3.8,
    frictionSlip: 18.5,
    rollInfluence: 0.08,
    maxSuspensionForce: 12000.0,
    isFrontWheel: true,
    invertDirection: false
};
HavokRaycastVehicle.MUSTANG_GT_REAR_WHEEL_CONFIG = {
    suspensionRestLength: 0.32,
    maxSuspensionTravel: 35.0,
    radius: 0.34,
    suspensionStiffness: 22.0,
    dampingCompression: 3.8,
    dampingRelaxation: 4.2,
    frictionSlip: 15.5,
    rollInfluence: 0.06,
    maxSuspensionForce: 14000.0,
    isFrontWheel: false,
    invertDirection: false
};
export class HavokWheelInfo {
    constructor(options) {
        this.maxSuspensionTravel = 0;
        this.customSlidingRotationalSpeed = 0;
        this.useCustomSlidingRotationalSpeed = 0;
        this.sliding = false;
        this.frictionPenalty = false;
        this.frictionLerping = false;
        this.visualTravelRange = 0;
        this.invertDirection = false;
        this.isInContact = false;
        this.hub = null;
        this.spinner = null;
        this.defaultFriction = 18.5;
        this.steeringAngle = 0;
        this.rotationBoost = 0;
        this.locked = false;
        options = HavokVehicleUtilities.Utilsdefaults(options, {
            chassisConnectionPointLocal: new Vector3(),
            chassisConnectionPointWorld: new Vector3(),
            directionLocal: new Vector3(),
            directionWorld: new Vector3(),
            axleLocal: new Vector3(),
            axleWorld: new Vector3(),
            suspensionRestLength: 0.35,
            suspensionMaxLength: 0.50,
            radius: 0.33,
            suspensionStiffness: 25.0,
            dampingCompression: 4.5,
            dampingRelaxation: 3.8,
            frictionSlip: 18.5,
            frictionPenalty: false,
            frictionLerping: false,
            steering: 0,
            rotation: 0,
            deltaRotation: 0,
            rollInfluence: 0.08,
            maxSuspensionForce: 12000.0,
            isFrontWheel: true,
            clippedInvContactDotSuspension: 1,
            suspensionRelativeVelocity: 0,
            suspensionForce: 0,
            skidInfo: 0,
            physicsShape: null,
            invertDirection: false,
            suspensionLength: 0,
            maxSuspensionTravel: 30.0,
            useCustomSlidingRotationalSpeed: false,
            customSlidingRotationalSpeed: -0.1
        });
        this.maxSuspensionTravel = options.maxSuspensionTravel;
        this.customSlidingRotationalSpeed = options.customSlidingRotationalSpeed;
        this.useCustomSlidingRotationalSpeed = options.useCustomSlidingRotationalSpeed;
        this.sliding = false;
        this.chassisConnectionPointLocal = options.chassisConnectionPointLocal.clone();
        this.chassisConnectionPointWorld = options.chassisConnectionPointLocal.clone();
        this.directionLocal = options.directionLocal.clone();
        this.directionWorld = options.directionLocal.clone();
        this.axleLocal = options.axleLocal.clone();
        this.axleWorld = options.axleLocal.clone();
        this.suspensionRestLength = options.suspensionRestLength;
        this.suspensionMaxLength = options.suspensionMaxLength;
        this.radius = options.radius;
        this.suspensionStiffness = options.suspensionStiffness;
        this.dampingCompression = options.dampingCompression;
        this.dampingRelaxation = options.dampingRelaxation;
        this.frictionSlip = options.frictionSlip;
        this.frictionLerping = options.frictionLerping;
        this.frictionPenalty = options.frictionPenalty;
        this.steering = 0;
        this.rotation = 0;
        this.deltaRotation = 0;
        this.rollInfluence = options.rollInfluence;
        this.maxSuspensionForce = options.maxSuspensionForce;
        this.invertDirection = options.invertDirection;
        this.engineForce = 0;
        this.brake = 0;
        this.isFrontWheel = options.isFrontWheel;
        this.clippedInvContactDotSuspension = 1;
        this.suspensionRelativeVelocity = 0;
        this.suspensionForce = 0;
        this.skidInfo = 0;
        this.skidinfo = 1.0;
        this.skidThreshold = options.skidThreshold || 0.1;
        this.lateralImpulse = 0;
        this.forwardImpulse = 0;
        this.suspensionLength = 0;
        this.sideImpulse = 0;
        this.forwardImpulse = 0;
        this.physicsShape = null;
        this.raycastResult = new PhysicsRaycastResult();
        this.raycastResult.directionWorld = new Vector3();
        this.worldTransform = new TransformNode("");
        this.worldTransform.rotationQuaternion = new Quaternion();
        this.isInContact = false;
    }
    updateWheel(chassis) {
        var raycastResult = this.raycastResult;
        if (this.isInContact) {
            var project = Vector3.Dot(raycastResult.hitNormalWorld, this.raycastResult.directionWorld);
            raycastResult.hitPointWorld.subtractToRef(HavokVehicleUtilities.bodyPosition(chassis, new Vector3()), HavokVehicleUtilities.relpos);
            HavokVehicleUtilities.velocityAt(chassis, HavokVehicleUtilities.relpos, HavokVehicleUtilities.chassis_velocity_at_contactPoint);
            var projVel = Vector3.Dot(raycastResult.hitNormalWorld, HavokVehicleUtilities.chassis_velocity_at_contactPoint);
            if (project >= -0.1) {
                this.suspensionRelativeVelocity = 0.0;
                this.clippedInvContactDotSuspension = 1.0 / 0.1;
            }
            else {
                var inv = -1 / project;
                this.suspensionRelativeVelocity = projVel * inv;
                this.clippedInvContactDotSuspension = inv;
            }
        }
        else {
            this.raycastResult.suspensionLength = this.suspensionRestLength;
            this.suspensionRelativeVelocity = 0.0;
            raycastResult.hitNormalWorld.copyFrom(this.raycastResult.directionWorld).scaleInPlace(-1);
            this.clippedInvContactDotSuspension = 1.0;
        }
    }
}
export class HavokVehicleUtilities {
    static calcRollingFriction(body0, body1, frictionPosWorld, frictionDirectionWorld, maxImpulse, numWheelsOnGround = 1) {
        var j1 = 0;
        var contactPosWorld = frictionPosWorld;
        var vel1 = HavokVehicleUtilities.calcRollingFriction_vel1;
        var vel2 = HavokVehicleUtilities.calcRollingFriction_vel2;
        var vel = HavokVehicleUtilities.calcRollingFriction_vel;
        HavokVehicleUtilities.velocityAt(body0, contactPosWorld, vel1);
        HavokVehicleUtilities.velocityAt(body1, contactPosWorld, vel2);
        vel1.subtractToRef(vel2, vel);
        var vrel = Vector3.Dot(frictionDirectionWorld, vel);
        var denom0 = HavokVehicleUtilities.computeImpulseDenominator(body0, frictionPosWorld, frictionDirectionWorld);
        var denom1 = HavokVehicleUtilities.computeImpulseDenominator(body1, frictionPosWorld, frictionDirectionWorld);
        var relaxation = 1;
        var jacDiagABInv = relaxation / (denom0 + denom1);
        j1 = -vrel * jacDiagABInv / numWheelsOnGround;
        if (maxImpulse < j1) {
            j1 = maxImpulse;
        }
        if (j1 < -maxImpulse) {
            j1 = -maxImpulse;
        }
        return j1;
    }
    static computeImpulseDenominator(body, pos, normal) {
        var r0 = HavokVehicleUtilities.computeImpulseDenominator_r0;
        var c0 = HavokVehicleUtilities.computeImpulseDenominator_c0;
        var vec = HavokVehicleUtilities.computeImpulseDenominator_vec;
        var m = HavokVehicleUtilities.computeImpulseDenominator_m;
        pos.subtractToRef(HavokVehicleUtilities.bodyPosition(body, new Vector3()), r0).normalize();
        Vector3.CrossToRef(r0, normal, c0);
        HavokVehicleUtilities.bodyInertiaWorld(body, new Vector3()).multiplyToRef(c0, m);
        Vector3.CrossToRef(m, r0, vec);
        return HavokVehicleUtilities.bodyInvMass(body) + Vector3.Dot(normal, vec);
    }
    static resolveSingleBilateral(body1, pos1, body2, pos2, normal) {
        var normalLenSqr = normal.lengthSquared();
        if (normalLenSqr > 1.1) {
            return 0;
        }
        var vel1 = HavokVehicleUtilities.resolveSingleBilateral_vel1;
        var vel2 = HavokVehicleUtilities.resolveSingleBilateral_vel2;
        var vel = HavokVehicleUtilities.resolveSingleBilateral_vel;
        HavokVehicleUtilities.velocityAt(body1, pos1, vel1);
        HavokVehicleUtilities.velocityAt(body2, pos2, vel2);
        vel1.subtractToRef(vel2, vel);
        var rel_vel = Vector3.Dot(normal, vel);
        var contactDamping = 0.1;
        var massTerm = 1 / (HavokVehicleUtilities.bodyInvMass(body1) + HavokVehicleUtilities.bodyInvMass(body2));
        var impulse = -contactDamping * rel_vel * massTerm;
        return impulse;
    }
}
HavokVehicleUtilities.directions = [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1)
];
HavokVehicleUtilities.calcRollingFriction_vel1 = new Vector3();
HavokVehicleUtilities.calcRollingFriction_vel2 = new Vector3();
HavokVehicleUtilities.calcRollingFriction_vel = new Vector3();
HavokVehicleUtilities.updateFriction_surfNormalWS_scaled_proj = new Vector3();
HavokVehicleUtilities.updateFriction_axle = [];
HavokVehicleUtilities.updateFriction_forwardWS = [];
HavokVehicleUtilities.sideFrictionStiffness2 = 1;
HavokVehicleUtilities.castRay_rayvector = new Vector3();
HavokVehicleUtilities.castRay_target = new Vector3();
HavokVehicleUtilities.torque = new Vector3();
HavokVehicleUtilities.tmpVec1 = new Vector3();
HavokVehicleUtilities.tmpVec2 = new Vector3();
HavokVehicleUtilities.tmpVec3 = new Vector3();
HavokVehicleUtilities.tmpVec4 = new Vector3();
HavokVehicleUtilities.tmpVec5 = new Vector3();
HavokVehicleUtilities.tmpVec6 = new Vector3();
HavokVehicleUtilities.tmpVel2 = new Vector3();
HavokVehicleUtilities.tmpMat1 = new Matrix();
HavokVehicleUtilities.velocityAt = (body, pos, res) => {
    body.getObjectCenterWorldToRef(HavokVehicleUtilities.tmpVel2);
    pos.subtractToRef(HavokVehicleUtilities.tmpVel2, res);
    body.getAngularVelocityToRef(HavokVehicleUtilities.tmpVel2);
    Vector3.CrossToRef(HavokVehicleUtilities.tmpVel2, res, res);
    body.getLinearVelocityToRef(HavokVehicleUtilities.tmpVel2);
    res.addInPlace(HavokVehicleUtilities.tmpVel2);
    return res;
};
HavokVehicleUtilities.bodyPosition = (body, res) => {
    body.getObjectCenterWorldToRef(res);
    return res;
};
HavokVehicleUtilities.bodyLinearVelocity = (body, res) => {
    body.getLinearVelocityToRef(res);
    return res;
};
HavokVehicleUtilities.bodyAngularVelocity = (body, res) => {
    body.getAngularVelocityToRef(res);
    return res;
};
HavokVehicleUtilities.bodyTransform = (body, res) => {
    res.copyFrom(body.transformNode.getWorldMatrix());
    return res;
};
HavokVehicleUtilities.addImpulseAt = (body, impulse, point) => {
    body.applyImpulse(impulse, point);
};
HavokVehicleUtilities.addForceAt = (body, force, point) => {
    body.applyForce(force, point);
};
HavokVehicleUtilities.bodyOrientation = (body, res) => {
    res.copyFrom(body.transformNode.rotationQuaternion);
    return res;
};
HavokVehicleUtilities.bodyMass = (body) => {
    return body.getMassProperties().mass;
};
HavokVehicleUtilities.bodyInvMass = (body) => {
    const mass = body.getMassProperties().mass;
    return mass > 0 ? 1.0 / mass : 0;
};
HavokVehicleUtilities.bodyInertiaWorld = (body, res) => {
    const prop = body.getMassProperties();
    res.copyFrom(prop.inertia);
    Vector3.TransformNormalToRef(res, body.transformNode.getWorldMatrix(), res);
    res.x = res.x > 0 ? 1.0 / res.x : 0;
    res.y = res.y > 0 ? 1.0 / res.y : 0;
    res.z = res.z > 0 ? 1.0 / res.z : 0;
    return res;
};
HavokVehicleUtilities.computeImpulseDenominator_r0 = new Vector3();
HavokVehicleUtilities.computeImpulseDenominator_c0 = new Vector3();
HavokVehicleUtilities.computeImpulseDenominator_vec = new Vector3();
HavokVehicleUtilities.computeImpulseDenominator_m = new Vector3();
HavokVehicleUtilities.bodyPositionVec = new Vector3();
HavokVehicleUtilities.bodyInertiaVec = new Vector3();
HavokVehicleUtilities.resolveSingleBilateral_vel1 = new Vector3();
HavokVehicleUtilities.resolveSingleBilateral_vel2 = new Vector3();
HavokVehicleUtilities.resolveSingleBilateral_vel = new Vector3();
HavokVehicleUtilities.chassis_velocity_at_contactPoint = new Vector3();
HavokVehicleUtilities.relpos = new Vector3();
HavokVehicleUtilities.Utilsdefaults = (options, defaults) => {
    options = options || {};
    for (var key in defaults) {
        if (!(key in options)) {
            options[key] = defaults[key];
        }
    }
    return options;
};
export class NavigationAgent extends ScriptComponent {
    isReady() { return this.m_agentReady; }
    isNavigating() { return (this.m_agentDestination != null); }
    isTeleporting() { return this.teleporting; }
    isOnOffMeshLink() { return (this.m_agentState === CrowdAgentState.DT_CROWDAGENT_STATE_OFFMESH); }
    getAgentType() { return this.type; }
    getAgentState() { return this.m_agentState; }
    getAgentIndex() { return this.m_agentIndex; }
    getAgentOffset() { return this.baseOffset; }
    getTargetDistance() { return this.distanceToTarget; }
    getCurrentPosition() { return this.currentPosition; }
    getCurrentRotation() { return this.currentRotation; }
    getCurrentVelocity() { return this.currentVelocity; }
    getAgentParameters() { return this.m_agentParams; }
    setAgentParameters(parameters) { this.m_agentParams = parameters; this.updateAgentParameters(); }
    constructor(transform, scene, properties = {}, alias = "NavigationAgent") {
        super(transform, scene, properties, alias);
        this.crowd = null;
        this.distanceToTarget = 0;
        this.teleporting = false;
        this.moveDirection = new Vector3(0.0, 0.0, 0.0);
        this.resetPosition = new Vector3(0.0, 0.0, 0.0);
        this.lastPosition = new Vector3(0.0, 0.0, 0.0);
        this.distancePosition = new Vector3(0.0, 0.0, 0.0);
        this.currentPosition = new Vector3(0.0, 0.0, 0.0);
        this.currentRotation = new Quaternion(0.0, 0.0, 0.0, 1.0);
        this.currentVelocity = new Vector3(0.0, 0.0, 0.0);
        this.currentWaypoint = new Vector3(0.0, 0.0, 0.0);
        this.heightOffset = 0;
        this.angularSpeed = 0;
        this.updatePosition = true;
        this.updateRotation = true;
        this.distanceEpsilon = 0.1;
        this.velocityEpsilon = 1.1;
        this.offMeshVelocity = 1.5;
        this.stoppingDistance = 0;
        this.onReadyObservable = new Observable();
        this.onPreUpdateObservable = new Observable();
        this.onPostUpdateObservable = new Observable();
        this.onNavCompleteObservable = new Observable();
        this.m_agentState = 0;
        this.m_agentIndex = -1;
        this.m_agentReady = false;
        this.m_agentGhost = null;
        this.m_agentParams = null;
        this.m_agentMovement = new Vector3(0.0, 0.0, 0.0);
        this.m_agentDirection = new Vector3(0.0, 0.0, 1.0);
        this.m_agentQuaternion = new Quaternion(0.0, 0.0, 0.0, 1.0);
        this.m_agentDestination = null;
    }
    awake() { this.awakeNavigationAgent(); }
    update() { this.updateNavigationAgent(); }
    destroy() { this.destroyNavigationAgent(); }
    awakeNavigationAgent() {
        this.type = this.getProperty("type", this.type);
        this.speed = this.getProperty("speed", this.speed);
        this.baseOffset = this.getProperty("offset", this.baseOffset);
        this.angularSpeed = this.getProperty("angularspeed", this.angularSpeed);
        this.acceleration = this.getProperty("acceleration", this.acceleration);
        this.stoppingDistance = this.getProperty("stoppingdistance", this.stoppingDistance);
        this.autoBraking = this.getProperty("autobraking", this.autoBraking);
        this.avoidRadius = this.getProperty("avoidradius", this.avoidRadius);
        this.avoidHeight = this.getProperty("avoidheight", this.avoidHeight);
        this.obstacleAvoidanceType = this.getProperty("avoidquality", this.obstacleAvoidanceType);
        this.avoidancePriority = this.getProperty("avoidpriority", this.avoidancePriority);
        this.autoTraverseOffMeshLink = this.getProperty("autotraverse", this.autoTraverseOffMeshLink);
        this.autoRepath = this.getProperty("autopepath", this.autoRepath);
        this.areaMask = this.getProperty("areamask", this.areaMask);
        Utilities.ValidateTransformQuaternion(this.transform);
        this.m_agentGhost = new TransformNode((this.transform.name + ".Agent"), this.scene);
        this.m_agentGhost.position = new Vector3(0.0, 0.0, 0.0);
        this.m_agentGhost.rotation = new Vector3(0.0, 0.0, 0.0);
        Utilities.ValidateTransformQuaternion(this.m_agentGhost);
        this.m_agentGhost.position.copyFrom(this.transform.position);
        this.lastPosition.copyFrom(this.transform.position);
    }
    updateNavigationAgent() {
        if (this.crowd == null) {
            const plugin = SceneManager.GetNavigationTools();
            if (plugin == null || plugin.navMesh == null)
                return;
            if (NavigationAgent.GLOBAL_CROWD_INSTANCE === true) {
                this.crowd = SceneManager.GetCrowdInterface(this.scene);
            }
            else {
                this.crowd = plugin.createCrowd(SceneManager.MAX_AGENT_COUNT, SceneManager.MAX_AGENT_RADIUS, this.scene);
            }
        }
        if (this.crowd == null)
            return;
        if (this.m_agentIndex < 0) {
            this.m_agentParams = {
                radius: this.avoidRadius,
                height: this.avoidHeight,
                maxSpeed: this.speed,
                maxAcceleration: this.acceleration
            };
            Utilities.GetAbsolutePositionToRef(this.transform, this.resetPosition);
            this.m_agentIndex = this.crowd.addAgent(this.resetPosition, this.m_agentParams, this.m_agentGhost);
            if (this.m_agentIndex >= 0) {
                this.m_agentReady = true;
                if (this.onReadyObservable && this.onReadyObservable.hasObservers()) {
                    this.onReadyObservable.notifyObservers(this.transform);
                }
            }
            return;
        }
        this.m_agentState = this.crowd.getAgentState(this.m_agentIndex);
        this.getAgentWaypointToRef(this.currentWaypoint);
        this.getAgentPositionToRef(this.currentPosition);
        this.distancePosition.copyFrom(this.currentPosition);
        if (this.isOnOffMeshLink()) {
            this.currentPosition.subtractToRef(this.lastPosition, this.currentVelocity);
            this.currentVelocity.scaleInPlace(this.speed * this.offMeshVelocity);
        }
        else {
            this.getAgentVelocityToRef(this.currentVelocity);
        }
        if (this.onPreUpdateObservable && this.onPreUpdateObservable.hasObservers()) {
            this.onPreUpdateObservable.notifyObservers(this.transform);
        }
        this.currentPosition.y += (this.baseOffset + this.heightOffset);
        if (this.currentVelocity.length() >= this.velocityEpsilon) {
            this.currentVelocity.normalize();
            const rotateFactor = (this.angularSpeed * NavigationAgent.ANGULAR_SPEED_RATIO * this.getDeltaSeconds());
            if (this.isOnOffMeshLink()) {
                this.moveDirection.copyFrom(this.m_agentDirection);
                this.m_agentDirection.set((this.moveDirection.x + (this.currentVelocity.x - this.moveDirection.x)), (this.moveDirection.y + (this.currentVelocity.y - this.moveDirection.y)), (this.moveDirection.z + (this.currentVelocity.z - this.moveDirection.z)));
                this.m_agentDirection.normalize();
                const targetAngle = (NavigationAgent.TARGET_ANGLE_FACTOR - Math.atan2(this.m_agentDirection.x, this.m_agentDirection.z));
                Quaternion.FromEulerAnglesToRef(0.0, targetAngle, 0.0, this.currentRotation);
                if (this.isNavigating() && this.updateRotation === true) {
                    Quaternion.SlerpToRef(this.transform.rotationQuaternion, this.currentRotation, rotateFactor, this.transform.rotationQuaternion);
                }
            }
            else {
                this.m_agentQuaternion.copyFrom(this.transform.rotationQuaternion);
                if (this.isNavigating() && this.updateRotation === true) {
                    this.transform.lookAt(this.currentWaypoint);
                }
                this.transform.rotationQuaternion.toEulerAnglesToRef(this.m_agentDirection);
                Quaternion.FromEulerAnglesToRef(0.0, this.m_agentDirection.y, 0.0, this.currentRotation);
                if (this.isNavigating() && this.updateRotation === true) {
                    Quaternion.SlerpToRef(this.m_agentQuaternion, this.currentRotation, rotateFactor, this.transform.rotationQuaternion);
                }
            }
        }
        if (this.isNavigating() && this.updatePosition === true) {
            this.transform.position.copyFrom(this.currentPosition);
        }
        if (this.isNavigating()) {
            this.distanceToTarget = Vector3.Distance(this.distancePosition, this.m_agentDestination);
            if (this.distanceToTarget <= Math.max(this.distanceEpsilon, this.stoppingDistance)) {
                this.cancelNavigation();
                if (this.onNavCompleteObservable && this.onNavCompleteObservable.hasObservers()) {
                    this.onNavCompleteObservable.notifyObservers(this.transform);
                }
            }
        }
        else {
            this.distanceToTarget = 0;
        }
        this.lastPosition.copyFrom(this.currentPosition);
        if (this.onPostUpdateObservable && this.onPostUpdateObservable.hasObservers()) {
            this.onPostUpdateObservable.notifyObservers(this.transform);
        }
        this.teleporting = false;
    }
    updateAgentParameters() {
        if (this.crowd != null && this.m_agentIndex >= 0)
            this.crowd.updateAgentParameters(this.m_agentIndex, this.m_agentParams);
    }
    destroyNavigationAgent() {
        this.m_agentIndex = -1;
        this.m_agentReady = false;
        this.m_agentMovement = null;
        this.m_agentDirection = null;
        this.m_agentDestination = null;
        this.moveDirection = null;
        this.resetPosition = null;
        this.lastPosition = null;
        this.currentPosition = null;
        this.currentRotation = null;
        this.currentVelocity = null;
        this.currentWaypoint = null;
        this.onReadyObservable.clear();
        this.onReadyObservable = null;
        this.onPreUpdateObservable.clear();
        this.onPreUpdateObservable = null;
        this.onPostUpdateObservable.clear();
        this.onPostUpdateObservable = null;
        this.onNavCompleteObservable.clear();
        this.onNavCompleteObservable = null;
        if (this.m_agentGhost != null) {
            this.m_agentGhost.dispose();
            this.m_agentGhost = null;
        }
    }
    move(offset, closetPoint = true) {
        const plugin = SceneManager.GetNavigationTools();
        if (plugin != null && this.crowd != null) {
            this.crowd.getAgentPosition(this.m_agentIndex).addToRef(offset, this.m_agentMovement);
            if (closetPoint === true)
                this.m_agentDestination = plugin.getClosestPoint(this.m_agentMovement);
            else
                this.m_agentDestination = this.m_agentMovement.clone();
            if (this.m_agentIndex >= 0)
                this.crowd.agentGoto(this.m_agentIndex, this.m_agentDestination);
        }
        else {
            Tools.Warn("No recast navigation mesh or crowd interface data available!");
        }
    }
    teleport(destination, closetPoint = true) {
        const plugin = SceneManager.GetNavigationTools();
        if (plugin != null && this.crowd != null) {
            this.teleporting = true;
            if (closetPoint === true)
                this.m_agentDestination = plugin.getClosestPoint(destination);
            else
                this.m_agentDestination = destination.clone();
            if (this.m_agentIndex >= 0)
                this.crowd.agentTeleport(this.m_agentIndex, this.m_agentDestination);
        }
        else {
            Tools.Warn("No recast navigation mesh or crowd interface data available!");
        }
    }
    setDestination(destination, closetPoint = true) {
        const plugin = SceneManager.GetNavigationTools();
        if (plugin != null && this.crowd != null) {
            if (closetPoint === true)
                this.m_agentDestination = plugin.getClosestPoint(destination);
            else
                this.m_agentDestination = destination.clone();
            if (this.m_agentIndex >= 0)
                this.crowd.agentGoto(this.m_agentIndex, this.m_agentDestination);
        }
        else {
            Tools.Warn("No recast navigation mesh or crowd interface data available!");
        }
    }
    setAcceleration(speed) {
        if (this.m_agentParams != null) {
            this.acceleration = speed;
            this.m_agentParams.maxAcceleration = this.acceleration;
            this.updateAgentParameters();
        }
    }
    setMovementSpeed(speed) {
        if (this.m_agentParams != null) {
            this.speed = speed;
            this.m_agentParams.maxSpeed = this.speed;
            this.updateAgentParameters();
        }
    }
    setSeparationWeight(weight) {
        if (this.m_agentParams != null) {
            this.m_agentParams.separationWeight = weight;
            this.updateAgentParameters();
        }
    }
    setOptimizationRange(range) {
        if (this.m_agentParams != null) {
            this.m_agentParams.pathOptimizationRange = range;
            this.updateAgentParameters();
        }
    }
    setCollisionQueryRange(range) {
        if (this.m_agentParams != null) {
            this.m_agentParams.collisionQueryRange = range;
            this.updateAgentParameters();
        }
    }
    setAgentRadius(radius) {
        if (this.m_agentParams != null) {
            this.m_agentParams.radius = radius;
            this.updateAgentParameters();
        }
    }
    setAgentHeight(height) {
        if (this.m_agentParams != null) {
            this.m_agentParams.height = height;
            this.updateAgentParameters();
        }
    }
    getAgentVelocity() {
        return (this.crowd != null && this.m_agentIndex >= 0) ? this.crowd.getAgentVelocity(this.m_agentIndex) : null;
    }
    getAgentVelocityToRef(result) {
        if (this.crowd != null && this.m_agentIndex >= 0)
            this.crowd.getAgentVelocityToRef(this.m_agentIndex, result);
    }
    getAgentPosition() {
        return (this.crowd != null && this.m_agentIndex >= 0) ? this.crowd.getAgentPosition(this.m_agentIndex) : null;
    }
    getAgentPositionToRef(result) {
        if (this.crowd != null && this.m_agentIndex >= 0)
            this.crowd.getAgentPositionToRef(this.m_agentIndex, result);
    }
    getAgentWaypoint() {
        return (this.crowd != null && this.m_agentIndex >= 0) ? this.crowd.getAgentNextTargetPath(this.m_agentIndex) : null;
    }
    getAgentWaypointToRef(result) {
        if (this.crowd != null && this.m_agentIndex >= 0)
            this.crowd.getAgentNextTargetPathToRef(this.m_agentIndex, result);
    }
    cancelNavigation() {
        this.m_agentDestination = null;
        const position = this.getAgentPosition();
        if (position != null && this.crowd != null && this.m_agentIndex >= 0) {
            this.crowd.agentTeleport(this.m_agentIndex, position);
        }
    }
}
NavigationAgent.TARGET_ANGLE_FACTOR = (Math.PI * 0.5);
NavigationAgent.ANGULAR_SPEED_RATIO = 0.05;
NavigationAgent.GLOBAL_CROWD_INSTANCE = false;
export var CrowdAgentState;
(function (CrowdAgentState) {
    CrowdAgentState[CrowdAgentState["DT_CROWDAGENT_STATE_INVALID"] = 0] = "DT_CROWDAGENT_STATE_INVALID";
    CrowdAgentState[CrowdAgentState["DT_CROWDAGENT_STATE_WALKING"] = 1] = "DT_CROWDAGENT_STATE_WALKING";
    CrowdAgentState[CrowdAgentState["DT_CROWDAGENT_STATE_OFFMESH"] = 2] = "DT_CROWDAGENT_STATE_OFFMESH";
})(CrowdAgentState || (CrowdAgentState = {}));
export class RaycastVehicle {
    getPhysicsBody() { if (this._chassisMesh != null)
        return this._chassisMesh.physicsBody; }
    getNumWheels() { if (this.m_vehicle != null)
        return this.m_vehicle.getNumWheels(); }
    getWheelInfo(wheel) { if (this.m_vehicle != null)
        return this.m_vehicle.getWheelInfo(wheel); }
    getWheelTransform(wheel) { if (this.m_vehicle != null)
        return this.m_vehicle.getWheelTransformWorld(wheel); }
    updateWheelTransform(wheel) { if (this.m_vehicle != null)
        this.m_vehicle.updateWheelTransform(wheel); }
    getRawCurrentSpeedKph() { if (this.m_vehicle != null)
        return this.m_vehicle.getCurrentSpeedKmHour(); }
    getRawCurrentSpeedMph() { if (this.m_vehicle != null)
        return this.m_vehicle.getCurrentSpeedKmHour() * System.Kph2Mph; }
    getAbsCurrentSpeedKph() { if (this.m_vehicle != null)
        return Math.abs(this.m_vehicle.getCurrentSpeedKmHour()); }
    getAbsCurrentSpeedMph() { if (this.m_vehicle != null)
        return Math.abs(this.m_vehicle.getCurrentSpeedKmHour()) * System.Kph2Mph; }
    constructor(scene, entity, center) {
        this._centerMass = new Vector3(0, 0, 0);
        this._chassisMesh = null;
        this._tempVectorPos = new Vector3(0, 0, 0);
        this.lockedWheelIndexes = null;
        this.m_vehicleColliders = null;
        this.m_vehicle = null;
        this.m_scene = null;
        this._chassisMesh = entity;
        this._centerMass = center;
        this.m_vehicleColliders = (this._chassisMesh.metadata != null && this._chassisMesh.metadata.toolkit != null && this._chassisMesh.metadata.toolkit.wheels != null) ? this._chassisMesh.metadata.toolkit.wheels : null;
        this.m_vehicle = new HavokRaycastVehicle({ chassisBody: this._chassisMesh.physicsBody });
        this.m_scene = scene;
        this.setupWheelInformation();
        const physicsEngine = this.m_scene.getPhysicsEngine();
        if (physicsEngine != null)
            this.m_vehicle.addToWorld(physicsEngine);
    }
    dispose() {
        this.deleteWheelInformation();
        this.m_vehicleColliders = null;
    }
    setHandBrake(brake, wheel) {
        if (this.m_vehicle != null) {
            this.m_vehicle.setHandBrake(brake, wheel);
        }
    }
    setEngineForce(power, wheel) {
        if (this.m_vehicle != null) {
            this.m_vehicle.applyEngineForce(-power, wheel);
        }
    }
    applyEngineBrake(brake, smoothing = 1.0) {
        if (smoothing < 1.0) {
            let gradientBrakeForce = Scalar.Clamp(smoothing, 0.0, 1.0);
            let currentLinearDamping = this.getPhysicsBody()?.getLinearDamping();
            let smoothedLinearDamping = Scalar.Lerp(currentLinearDamping, brake, gradientBrakeForce);
            this.getPhysicsBody()?.setLinearDamping(smoothedLinearDamping);
        }
        else {
            this.getPhysicsBody()?.setLinearDamping(brake);
        }
    }
    getWheelIndexByID(id) {
        let result = -1;
        if (this.m_vehicleColliders != null && this.m_vehicleColliders.length > 0) {
            for (let index = 0; index < this.m_vehicleColliders.length; index++) {
                const wheel = this.m_vehicleColliders[index];
                if (id.toLowerCase() === wheel.id.toLowerCase()) {
                    result = index;
                    break;
                }
            }
        }
        return result;
    }
    getWheelIndexByName(name) {
        let result = -1;
        if (this.m_vehicleColliders != null && this.m_vehicleColliders.length > 0) {
            for (let index = 0; index < this.m_vehicleColliders.length; index++) {
                const wheel = this.m_vehicleColliders[index];
                if (name.toLowerCase() === wheel.name.toLowerCase()) {
                    result = index;
                    break;
                }
            }
        }
        return result;
    }
    getWheelColliderInfo(wheel) {
        let result = -1;
        if (this.m_vehicleColliders != null && this.m_vehicleColliders.length > 0 && this.m_vehicleColliders.length > wheel) {
            result = this.m_vehicleColliders[wheel];
        }
        return result;
    }
    getVisualSteeringAngle(wheel) {
        let result = 0;
        const wheelinfo = this.getWheelInfo(wheel);
        if (wheelinfo != null && wheelinfo.steeringAngle != null) {
            result = wheelinfo.steeringAngle;
        }
        return result;
    }
    setVisualSteeringAngle(angle, wheel) {
        const wheelinfo = this.getWheelInfo(wheel);
        if (wheelinfo != null) {
            wheelinfo.steeringAngle = angle;
        }
    }
    getPhysicsSteeringAngle(wheel) {
        if (this.m_vehicle != null) {
            return Math.abs(this.m_vehicle.getSteeringValue(wheel));
        }
    }
    setPhysicsSteeringAngle(angle, wheel) {
        if (this.m_vehicle != null) {
            this.m_vehicle.setSteeringValue(angle, wheel);
        }
    }
    getFrictionUpdateSpeed() {
        let result = 0;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.frictionRestoreSpeed;
        }
        return result;
    }
    setFrictionUpdateSpeed(lerpSpeed) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.frictionRestoreSpeed = lerpSpeed;
        }
    }
    setArcadeSteeringInput(steering) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setArcadeSteeringInput(steering);
        }
    }
    getArcadeSteerAssistFactor() {
        let result = -1;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.arcadeSteerAssistFactor;
        }
        return result;
    }
    setArcadeSteerAssistFactor(factor) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.arcadeSteerAssistFactor = factor;
        }
    }
    getHandbrakePreserveFactor() {
        let result = -1;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.handbrakePreserveFactor;
        }
        return result;
    }
    setHandbrakePreserveFactor(factor) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.handbrakePreserveFactor = factor;
        }
    }
    getIsArcadeHandbrakeActive() {
        let result = false;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.isArcadeHandbrakeActive;
        }
        return result;
    }
    setIsArcadeHandbrakeActive(active) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.isArcadeHandbrakeActive = active;
        }
    }
    getIsArcadeBurnoutModeActive() {
        let result = false;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.getIsArcadeBurnoutModeActive();
        }
        return result;
    }
    setIsArcadeBurnoutModeActive(active) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setIsArcadeBurnoutModeActive(active);
        }
    }
    getIsArcadeDonutModeActive() {
        let result = false;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.isArcadeDonutModeActive;
        }
        return result;
    }
    setIsArcadeDonutModeActive(active) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setIsArcadeDonutModeActive(active);
        }
    }
    getDonutModeTransitionFactor() {
        let result = 0;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.getDonutModeTransitionFactor();
        }
        return result;
    }
    getEasedDonutModeTransitionFactor() {
        let result = 0;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.getEasedDonutModeTransitionFactor();
        }
        return result;
    }
    getDonutModeEngineBoost() {
        let result = 0;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.getDonutModeEngineBoost();
        }
        return result;
    }
    isDonutModeEngaged() {
        let result = false;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.isDonutModeEngaged();
        }
        return result;
    }
    setDonutEngineMultiplier(multiplier) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setDonutEngineMultiplier(multiplier);
        }
    }
    setDonutTurnRadius(radius) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setDonutTurnRadius(radius);
        }
    }
    setDonutTransitionSpeed(speed) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setDonutTransitionSpeed(speed);
        }
    }
    getAngularDampingReduction() {
        let result = 0;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.getAngularDampingReduction();
        }
        return result;
    }
    getArcadeFrontSideFactor() {
        let result = -1;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.arcadeFrontSideFactor;
        }
        return result;
    }
    setArcadeFrontSideFactor(factor) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.arcadeFrontSideFactor = factor;
        }
    }
    getArcadeRearSideFactor() {
        let result = -1;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.arcadeRearSideFactor;
        }
        return result;
    }
    setArcadeRearSideFactor(factor) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.arcadeRearSideFactor = factor;
        }
    }
    setWheelRotationBoost(wheelIndex, boost) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setWheelRotationBoost(wheelIndex, boost);
        }
    }
    setAllWheelsRotationBoost(boost) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setAllWheelsRotationBoost(boost);
        }
    }
    setRearWheelsRotationBoost(boost) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setRearWheelsRotationBoost(boost);
        }
    }
    setFrontWheelsRotationBoost(boost) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setFrontWheelsRotationBoost(boost);
        }
    }
    isDriftSystemEnabled() {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            return this.m_vehicle.isDriftSystemEnabled();
        }
        return false;
    }
    setDriftSystemEnabled(enabled) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setDriftSystemEnabled(enabled);
        }
    }
    setDriftMaxSpeed(maxSpeed) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setDriftMaxSpeed(maxSpeed);
        }
    }
    getDriftMaxSpeed() {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            return this.m_vehicle.getDriftMaxSpeed();
        }
        return 0;
    }
    setDriftSpeedThreshold(threshold) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setDriftSpeedThreshold(threshold);
        }
    }
    getDriftSpeedThreshold() {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            return this.m_vehicle.getDriftSpeedThreshold();
        }
        return 0;
    }
    setDriftGripReduction(reduction) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setDriftGripReduction(Math.max(0.0, Math.min(1.0, reduction)));
        }
    }
    getDriftGripReduction() {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            return this.m_vehicle.getDriftGripReduction();
        }
        return 0;
    }
    setDriftSteeringThreshold(threshold) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setDriftSteeringThreshold(threshold);
        }
    }
    getDriftSteeringThreshold() {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            return this.m_vehicle.getDriftSteeringThreshold();
        }
        return 0;
    }
    isBurnoutModeEngaged() {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            return this.m_vehicle.isBurnoutModeEngaged();
        }
        return false;
    }
    setBaseRotationBoost(multiplier) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setBaseRotationBoost(multiplier);
        }
    }
    getBaseRotationBoost() {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            return this.m_vehicle.getBaseRotationBoost();
        }
        return 0;
    }
    setDonutRotationBoost(multiplier) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setDonutRotationBoost(multiplier);
        }
    }
    getDonutRotationBoost() {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            return this.m_vehicle.getDonutRotationBoost();
        }
        return 0;
    }
    getBurnoutPowerBoost() {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            return this.m_vehicle.getBurnoutPowerBoost();
        }
        return 0;
    }
    setBurnoutTransitionSpeed(speed) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setBurnoutTransitionSpeed(speed);
        }
    }
    setDefaultBurnoutCoefficient(coefficient) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setDefaultBurnoutCoefficient(coefficient);
        }
    }
    getDefaultBurnoutCoefficient() {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            return this.m_vehicle.getDefaultBurnoutCoefficient();
        }
        return 0;
    }
    getStabilizingForce() {
        let result = -1;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.stabilizingForce;
        }
        return result;
    }
    setStabilizingForce(force) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.stabilizingForce = force;
        }
    }
    getSmoothFlyingImpulse() {
        let result = -1;
        if (this.m_vehicle != null) {
            result = this.m_vehicle.smoothFlyingImpulse;
        }
        return result;
    }
    setSmoothFlyingImpulse(impulse) {
        if (this.m_vehicle != null) {
            this.m_vehicle.smoothFlyingImpulse = impulse;
        }
    }
    getMaxVisualExtensionLimit() {
        let result = -1;
        if (this.m_vehicle != null) {
            result = this.m_vehicle.maxVisualExtensionLimit;
        }
        return result;
    }
    setMaxVisualExtensionLimit(limit) {
        if (this.m_vehicle != null) {
            this.m_vehicle.maxVisualExtensionLimit = limit;
        }
    }
    getMaxVisualCompressionLimit() {
        let result = -1;
        if (this.m_vehicle != null) {
            result = this.m_vehicle.maxVisualCompressionLimit;
        }
        return result;
    }
    setMaxVisualCompressionLimit(limit) {
        if (this.m_vehicle != null) {
            this.m_vehicle.maxVisualCompressionLimit = limit;
        }
    }
    setLoggingEnabled(enabled) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setLoggingEnabled(enabled);
        }
    }
    getLoggingEnabled() {
        let result = false;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.getLoggingEnabled();
        }
        return result;
    }
    setMultiRaycastEnabled(enable) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setMultiRaycastEnabled(enable);
        }
    }
    getMultiRaycastEnabled() {
        let result = false;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.getMultiRaycastEnabled();
        }
        return result;
    }
    setMultiRaycastRadiusScale(scale) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setMultiRaycastRadiusScale(scale);
        }
    }
    getMultiRaycastRadiusScale() {
        let result = 1.0;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.getMultiRaycastRadiusScale();
        }
        return result;
    }
    setStabilizeVelocityEnabled(enabled) {
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            this.m_vehicle.setStabilizeVelocityEnabled(enabled);
        }
    }
    getStabilizeVelocityEnabled() {
        let result = false;
        if (this.m_vehicle != null && this.m_vehicle.chassisBody != null) {
            result = this.m_vehicle.getStabilizeVelocityEnabled();
        }
        return result;
    }
    setupWheelInformation() {
        if (this.m_vehicle != null && this.m_vehicleColliders != null && this.m_vehicleColliders.length > 0) {
            let index = -1;
            let defaultFriction = 0;
            let invertDirection = false;
            let visualTravelRange = 0;
            for (index = 0; index < this.m_vehicleColliders.length; index++) {
                const wheel = this.m_vehicleColliders[index];
                const wheelName = (wheel.name != null) ? wheel.name : "Unknown";
                const wheelRadius = (wheel.radius != null) ? wheel.radius : 0.35;
                const wheelHalfTrack = (wheel.position != null && wheel.position.length >= 3) ? wheel.position[0] : 1;
                const wheelAxisPosition = (wheel.position != null && wheel.position.length >= 3) ? wheel.position[2] : -1;
                const wheelConnectionPoint = (wheel.wheelconnectionpoint != null) ? wheel.wheelconnectionpoint : 0.5;
                const suspensionRestLength = (wheel.suspensionrestlength != null) ? wheel.suspensionrestlength : 0.3;
                const isfrontwheel = (wheel.frontwheel != null) ? true : (wheelName.toLowerCase().indexOf("front") >= 0);
                const wheelposition = wheelAxisPosition;
                const wheeltracking = wheelHalfTrack;
                const centermassx = -this._centerMass.x;
                const centermassz = -this._centerMass.z;
                defaultFriction = (wheel.frictionslip != null) ? wheel.frictionslip : 10;
                const defaultForce = (wheel.totalsuspensionforces != null) ? wheel.totalsuspensionforces : 100000;
                const defaultTravel = (wheel.suspensiontravelcm != null) ? wheel.suspensiontravelcm : 100;
                const defaultRolling = (wheel.rollinfluence != null) ? wheel.rollinfluence : 0.2;
                const suspensionStiffness = (wheel.suspensionstiffness != null) ? wheel.suspensionstiffness : 50;
                const suspensionCompression = (wheel.dampingcompression != null) ? wheel.dampingcompression : 2.5;
                const suspensionDamping = (wheel.dampingrelaxation != null) ? wheel.dampingrelaxation : 4.5;
                const localWheelPosition = new Vector3((wheeltracking + centermassx), wheelConnectionPoint, (wheelposition + centermassz));
                visualTravelRange = (wheel.maxVisualTravelRange != null) ? wheel.maxVisualTravelRange : 0;
                invertDirection = (wheel.invertWheelDirection != null) ? wheel.invertWheelDirection : false;
                this.m_vehicle.addWheel({
                    radius: wheelRadius,
                    isFrontWheel: isfrontwheel,
                    directionLocal: new Vector3(0, -1, 0),
                    suspensionStiffness: suspensionStiffness,
                    suspensionRestLength: suspensionRestLength,
                    frictionSlip: defaultFriction,
                    dampingRelaxation: suspensionDamping,
                    dampingCompression: suspensionCompression,
                    maxSuspensionForce: defaultForce,
                    rollInfluence: defaultRolling,
                    axleLocal: new Vector3(-1, 0, 0),
                    chassisConnectionPointLocal: localWheelPosition,
                    maxSuspensionTravel: defaultTravel,
                    steeringAngle: 0,
                    defaultFriction: defaultFriction,
                    invertDirection: invertDirection,
                    visualTravelRange: visualTravelRange
                });
            }
        }
    }
    tickVehicleController(step) {
        if (this.m_vehicle != null)
            this.m_vehicle.updateVehicle(step);
    }
    updateWheelInformation() {
        const speed = this.m_vehicle.getCurrentSpeedKmHour();
        const wheels = this.getNumWheels();
        if (wheels > 0) {
            for (let index = 0; index < wheels; index++) {
                const wheelinfo = this.getWheelInfo(index);
                if (wheelinfo != null) {
                    wheelinfo.locked = this.lockedWheelInformation(index);
                    this.updateWheelTransform(index);
                    const worldTransformNode = this.getWheelTransform(index);
                    if (worldTransformNode != null)
                        this._tempVectorPos.copyFrom(worldTransformNode.position);
                    if (wheelinfo.hub != null) {
                        const wheelhub = wheelinfo.hub;
                        if (wheelhub.parent != null) {
                            Utilities.InverseTransformPointToRef(wheelhub.parent, this._tempVectorPos, this._tempVectorPos);
                            wheelhub.position.y = this._tempVectorPos.y;
                            if (wheelinfo.visualTravelRange > 0)
                                wheelhub.position.y = Scalar.Clamp(wheelhub.position.y, -Math.abs(wheelinfo.visualTravelRange), Math.abs(wheelinfo.visualTravelRange));
                            const steeringAngle = (wheelinfo.steeringAngle != null) ? wheelinfo.steeringAngle : 0;
                            Quaternion.FromEulerAnglesToRef(0, steeringAngle, 0, wheelhub.rotationQuaternion);
                            if (wheelinfo.spinner != null && wheelinfo.rotation != null) {
                                if (wheelinfo.invertDirection === true) {
                                    Quaternion.FromEulerAnglesToRef(-wheelinfo.rotation, 0, 0, wheelinfo.spinner.rotationQuaternion);
                                }
                                else {
                                    Quaternion.FromEulerAnglesToRef(wheelinfo.rotation, 0, 0, wheelinfo.spinner.rotationQuaternion);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    lockedWheelInformation(wheel) {
        let result = false;
        if (this.lockedWheelIndexes != null && this.lockedWheelIndexes.length > 0) {
            for (let index = 0; index < this.lockedWheelIndexes.length; index++) {
                if (this.lockedWheelIndexes[index] === wheel) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }
    deleteWheelInformation() {
        const wheels = this.getNumWheels();
        if (wheels > 0) {
            for (let index = 0; index < wheels; index++) {
                const info = this.getWheelInfo(index);
                if (info != null) {
                    info.hub = null;
                    info.spinner = null;
                    info.steeringAngle = 0;
                    info.rotationBoost = 0;
                    info.defaultFriction = 0;
                }
            }
        }
    }
}
export class RigidbodyPhysics extends ScriptComponent {
    constructor(transform, scene, properties = {}, alias = "RigidbodyPhysics") {
        super(transform, scene, properties, alias);
        this._isKinematic = false;
        this._centerOfMass = new Vector3(0, 0, 0);
        this.m_raycastVehicle = null;
    }
    awake() { this.awakeRigidbodyState(); }
    update() { this.updateRigidbodyState(); }
    late() { this.lateRigidbodyState(); }
    destroy() { this.destroyRigidbodyState(); }
    awakeRigidbodyState() {
        this._isKinematic = this.getProperty("isKinematic", this._isKinematic);
        if (this.transform.metadata != null && this.transform.metadata.toolkit != null && this.transform.metadata.toolkit.physics != null) {
            this._centerOfMass = (this.transform.metadata.toolkit.physics.center != null) ? Utilities.ParseVector3(this.transform.metadata.toolkit.physics.center, this._centerOfMass) : this._centerOfMass;
        }
        if (this.hasWheelColliders()) {
            this.m_raycastVehicle = new RaycastVehicle(this.scene, this.transform, this._centerOfMass);
            if (Utilities.ShowDebugColliders())
                console.log("Raycase Vehicle Created For: " + this.transform.name);
        }
    }
    updateRigidbodyState() {
        if (this.m_raycastVehicle != null) {
            this.m_raycastVehicle.updateWheelInformation();
        }
    }
    lateRigidbodyState() {
        if (this.m_raycastVehicle != null) {
            this.m_raycastVehicle.tickVehicleController(RigidbodyPhysics.PHYSICS_STEP_TIME);
        }
    }
    destroyRigidbodyState() {
        if (this.m_raycastVehicle != null) {
            this.m_raycastVehicle.dispose();
            this.m_raycastVehicle = null;
        }
    }
    isKinematic() {
        return this._isKinematic;
    }
    hasWheelColliders() {
        return (this.transform.metadata != null && this.transform.metadata.toolkit != null && this.transform.metadata.toolkit.wheels != null);
    }
    getRaycastVehicle() {
        return this.m_raycastVehicle;
    }
    static GetHavokInstance() {
        return globalThis.HK;
    }
    static Raycast(origin, direction, length, query) {
        if (RigidbodyPhysics.RaycastResult == null)
            RigidbodyPhysics.RaycastResult = new PhysicsRaycastResult();
        if (RigidbodyPhysics.RaycastDestination == null)
            RigidbodyPhysics.RaycastDestination = new Vector3(0, 0, 0);
        RigidbodyPhysics.RaycastResult.reset();
        RigidbodyPhysics.RaycastDestination.set(0, 0, 0);
        Utilities.CalculateDestinationPointToRef(origin, direction, length, RigidbodyPhysics.RaycastDestination);
        RigidbodyPhysics.RaycastToRef(origin, RigidbodyPhysics.RaycastDestination, RigidbodyPhysics.RaycastResult, query);
        return RigidbodyPhysics.RaycastResult;
    }
    static Shapecast(query) {
        if (RigidbodyPhysics.LocalShapeResult == null)
            RigidbodyPhysics.LocalShapeResult = new ShapeCastResult();
        if (RigidbodyPhysics.WorldShapeResult == null)
            RigidbodyPhysics.WorldShapeResult = new ShapeCastResult();
        RigidbodyPhysics.LocalShapeResult.reset();
        RigidbodyPhysics.WorldShapeResult.reset();
        RigidbodyPhysics.ShapecastToRef(query, RigidbodyPhysics.LocalShapeResult, RigidbodyPhysics.WorldShapeResult);
        return { local: RigidbodyPhysics.LocalShapeResult, world: RigidbodyPhysics.WorldShapeResult };
    }
    static RaycastToRef(from, to, result, query) {
        const havokPlugin = Utilities.GetHavokPlugin();
        if (!havokPlugin) {
            Tools.Warn("Havok.js physics library not loaded");
            return;
        }
        havokPlugin.raycast(from, to, result, query);
    }
    static ShapecastToRef(query, localShapeResult, worldShapeResult) {
        const havokPlugin = Utilities.GetHavokPlugin();
        if (!havokPlugin) {
            Tools.Warn("Havok.js physics library not loaded");
            return;
        }
        havokPlugin.shapeCast(query, localShapeResult, worldShapeResult);
    }
    static SetMaxVelocities(maxLinVel, maxAngVel) {
        const havokPlugin = Utilities.GetHavokPlugin();
        if (!havokPlugin) {
            Tools.Warn("Havok.js physics library not loaded");
            return;
        }
        const heap = havokPlugin._hknp.HEAP8.buffer;
        const world1 = new Int32Array(heap, Number(havokPlugin.world), 100);
        const world2 = new Int32Array(heap, world1[8], 500);
        const mplib = new Int32Array(heap, world2[428], 100);
        const tsbuf = new Float32Array(heap, mplib[8], 300);
        tsbuf[32] = maxLinVel;
        tsbuf[33] = maxAngVel;
        tsbuf[60] = maxLinVel;
        tsbuf[61] = maxAngVel;
        tsbuf[88] = maxLinVel;
        tsbuf[89] = maxAngVel;
        tsbuf[144] = maxLinVel;
        tsbuf[145] = maxAngVel;
        tsbuf[172] = maxLinVel;
        tsbuf[173] = maxAngVel;
        tsbuf[200] = maxLinVel;
        tsbuf[201] = maxAngVel;
        tsbuf[228] = maxLinVel;
    }
    static async ConfigurePhysicsEngine(scene, fixedTimeStep = true, subTimeStep = 0, maxWorldSweep = 0, ccdEnabled = true, ccdPenetration = 0.0001, gravityLevel = null) {
        if (HavokPlugin) {
            Tools.Log("Havok.js physics engine initializing...");
            try {
                if (!scene.isPhysicsEnabled()) {
                    let havokInstance = RigidbodyPhysics.GetHavokInstance();
                    if (havokInstance == null) {
                        globalThis.HK = await HavokPhysics();
                        havokInstance = globalThis.HK;
                    }
                    const defaultvalue = new Vector3(0, -9.81, 0);
                    const defaultgravity = (gravityLevel != null) ? gravityLevel : defaultvalue;
                    globalThis.HKP = new HavokPlugin(!fixedTimeStep, havokInstance);
                    scene.enablePhysics(defaultgravity, globalThis.HKP);
                }
                else {
                }
            }
            catch (err1) {
                console.warn(err1);
            }
            finally {
                RigidbodyPhysics.PhysicsShapeCache = {};
                RigidbodyPhysics.NewPhysicsShapeCount = 0;
                RigidbodyPhysics.CachedPhysicsShapeCount = 0;
                try {
                    scene.getPhysicsEngine()?.setSubTimeStep(subTimeStep);
                    Tools.Log("Havok.js initialized with sub time step: " + subTimeStep);
                    const havokheapsize = RigidbodyPhysics.GetPhysicsHeapSize();
                    Tools.Log("Havok.js initialized with a heap size of " + havokheapsize + " MB");
                }
                catch (err2) {
                    console.warn(err2);
                }
                try {
                    if (RigidbodyPhysics.OnSetupPhysicsPlugin != null) {
                        RigidbodyPhysics.OnSetupPhysicsPlugin(scene);
                    }
                }
                catch (err3) {
                    console.warn(err3);
                }
            }
        }
    }
    static SetupPhysicsComponent(scene, entity) {
        const metadata = (entity.metadata != null && entity.metadata.toolkit != null) ? entity.metadata.toolkit : null;
        const layermask = (metadata.layermask != null) ? metadata.layermask : -1;
        if (metadata != null && (metadata.physics != null || metadata.collision != null)) {
            const hasphysics = (metadata.physics != null);
            const filtermask = (metadata.physics != null && metadata.physics.filter != null) ? metadata.physics.filter : -1;
            const vehicle = (metadata.physics != null && metadata.physics.vehicle != null) ? metadata.physics.vehicle : false;
            const complex = (metadata.physics != null && metadata.physics.root != null) ? metadata.physics.root : false;
            const simple = (metadata.collision != null && metadata.collision.compoundcolliders != null);
            const mass = (metadata.physics != null && metadata.physics.mass != null) ? metadata.physics.mass : 0;
            const com = (metadata.physics != null && metadata.physics.center != null) ? metadata.physics.center : { x: 0, y: 0, z: 0 };
            let iskinematic = (metadata.physics != null && metadata.physics.kinematic != null) ? metadata.physics.kinematic : true;
            let istruestatic = (metadata.physics != null && metadata.physics.truestatic != null) ? metadata.physics.truestatic : true;
            let motiontype = PhysicsMotionType.DYNAMIC;
            if (istruestatic === true) {
                motiontype = PhysicsMotionType.STATIC;
            }
            else if (iskinematic === true) {
                motiontype = PhysicsMotionType.ANIMATED;
            }
            else {
                motiontype = PhysicsMotionType.DYNAMIC;
            }
            if (hasphysics === true) {
                if (vehicle) {
                    let xwheels = null;
                    let xchildnodes = entity.getChildren(null, false);
                    if (xchildnodes != null && xchildnodes.length > 0) {
                        xchildnodes.forEach((xchildnode) => {
                            if (xchildnode.metadata != null && xchildnode.metadata.toolkit != null) {
                                if (xchildnode.metadata.toolkit.collision != null) {
                                    const xcollision = xchildnode.metadata.toolkit.collision;
                                    const xwheelinformation = (xcollision.wheelinformation != null) ? xcollision.wheelinformation : null;
                                    if (xwheelinformation != null) {
                                        if (Utilities.ShowDebugColliders())
                                            console.log("Setup raycast wheel collider: " + xchildnode.name + " --> on to: " + entity.name, entity);
                                        if (xwheels == null)
                                            xwheels = [];
                                        xwheels.push(xwheelinformation);
                                    }
                                }
                            }
                        });
                    }
                    if (xwheels != null && xwheels.length > 0) {
                        if (entity.metadata == null)
                            entity.metadata = {};
                        if (entity.metadata.toolkit == null)
                            entity.metadata.toolkit = {};
                        entity.metadata.toolkit.wheels = xwheels;
                    }
                }
                if (simple) {
                    const compounds = metadata.collision.compoundcolliders;
                    if (compounds != null && compounds.length > 0) {
                        let sdynamicfriction = 0;
                        let sstaticfriction = 0;
                        let srestitution = 0;
                        let strigger = false;
                        let sitems = [];
                        compounds.forEach((compound) => {
                            if (compound != null) {
                                const xcollider = (compound.type != null) ? compound.type : "BoxCollider";
                                const xrestitutioncombine = (compound.restitutioncombine != null) ? RigidbodyPhysics.GetPhysicsMaterialCombine(compound.restitutioncombine) : 0;
                                const xfrictioncombine = (compound.frictioncombine != null) ? RigidbodyPhysics.GetPhysicsMaterialCombine(compound.frictioncombine) : 0;
                                const xdynamicfriction = (compound.dynamicfriction != null) ? compound.dynamicfriction : 0.6;
                                const xstaticfriction = (compound.staticfriction != null) ? compound.staticfriction : 0.6;
                                const xrestitution = (compound.restitution != null) ? compound.restitution : 0;
                                const xistrigger = (compound.trigger != null) ? compound.trigger : false;
                                if (xdynamicfriction > sdynamicfriction)
                                    sdynamicfriction = xdynamicfriction;
                                if (xstaticfriction > sstaticfriction)
                                    sstaticfriction = xstaticfriction;
                                if (xrestitution > srestitution)
                                    srestitution = xrestitution;
                                if (xistrigger == true)
                                    strigger = true;
                                let ximpostortype = RigidbodyPhysics.BoxImpostor;
                                if (xcollider === "MeshCollider") {
                                    ximpostortype = RigidbodyPhysics.ConvexHullImpostor;
                                }
                                else if (xcollider === "CapsuleCollider") {
                                    ximpostortype = RigidbodyPhysics.CapsuleImpostor;
                                }
                                else if (xcollider === "SphereCollider") {
                                    ximpostortype = RigidbodyPhysics.SphereImpostor;
                                }
                                else {
                                    ximpostortype = RigidbodyPhysics.BoxImpostor;
                                }
                                const element = compound;
                                const center = (element.center != null) ? element.center : { x: 0, y: 0, z: 0 };
                                const persist = (element.persist != null) ? element.persist : false;
                                const item = new PhyscisContainerData();
                                if (Utilities.ShowDebugColliders())
                                    console.log("Setup simple compound child collider type (" + xcollider + ") --> on to: " + entity.name, entity);
                                RigidbodyPhysics.CreateCompoundPhysicsShapeAndBody(scene, entity, entity, element, ximpostortype, xstaticfriction, xdynamicfriction, xrestitution, xfrictioncombine, xrestitutioncombine, sitems, item, center, false, xistrigger, persist, layermask, filtermask);
                            }
                        });
                        if (sitems.length > 0) {
                            if (!Utilities.ReparentColliders()) {
                                entity.setParent(null, true, true);
                            }
                            const center_of_mass = new Vector3(com.x, com.y, com.z);
                            const simpleparentshape = new PhysicsShapeContainer(scene);
                            sitems.forEach((item) => { simpleparentshape.addChild(item.shape, item.translation, item.rotation, item.scale); });
                            simpleparentshape.material = sitems[0].shape.material;
                            const simplecompoundbody = new PhysicsBody(entity, motiontype, false, scene);
                            simplecompoundbody.shape = simpleparentshape;
                            RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, false, strigger, metadata.physics, mass, center_of_mass);
                            if (!Utilities.ShowDebugColliders()) {
                                const aentity = entity;
                                if (aentity.material != null && aentity.material.name === "CenterBox-Material") {
                                    aentity.isVisible = false;
                                }
                            }
                            if (Utilities.ShowDebugColliders()) {
                                if (RigidbodyPhysics.DebugPhysicsViewer == null)
                                    RigidbodyPhysics.DebugPhysicsViewer = new PhysicsViewer();
                                if (RigidbodyPhysics.DebugPhysicsViewer != null)
                                    RigidbodyPhysics.DebugPhysicsViewer.showBody(simplecompoundbody);
                            }
                        }
                    }
                }
                else if (complex) {
                    let fdynamicfriction = 0;
                    let fstaticfriction = 0;
                    let frestitution = 0;
                    let ftrigger = false;
                    let fitems = [];
                    const center = (metadata.physics != null && metadata.physics.center != null) ? Utilities.ParseVector3(metadata.physics.center, Vector3.Zero()) : Vector3.Zero();
                    let centernodes = entity.getChildren(null, true);
                    if (centernodes != null && centernodes.length > 0) {
                        centernodes.forEach((centernode) => { centernode.position.subtractInPlace(center); });
                    }
                    let childnodes = entity.getChildren(null, false);
                    if (childnodes != null && childnodes.length > 0) {
                        childnodes.forEach((childnode) => {
                            if (childnode.metadata != null && childnode.metadata.toolkit != null) {
                                if (childnode.metadata.toolkit.collision != null) {
                                    const ccollision = childnode.metadata.toolkit.collision;
                                    const crestitutioncombine = (ccollision.restitutioncombine != null) ? RigidbodyPhysics.GetPhysicsMaterialCombine(ccollision.restitutioncombine) : 0;
                                    const cfrictioncombine = (ccollision.frictioncombine != null) ? RigidbodyPhysics.GetPhysicsMaterialCombine(ccollision.frictioncombine) : 0;
                                    const cdynamicfriction = (ccollision.dynamicfriction != null) ? ccollision.dynamicfriction : 0.6;
                                    const cstaticfriction = (ccollision.staticfriction != null) ? ccollision.staticfriction : 0.6;
                                    const crestitution = (ccollision.restitution != null) ? ccollision.restitution : 0;
                                    const cistrigger = (ccollision.trigger != null) ? ccollision.trigger : false;
                                    const ccollider = (ccollision.type != null) ? ccollision.type : "BoxCollider";
                                    if (cdynamicfriction > fdynamicfriction)
                                        fdynamicfriction = cdynamicfriction;
                                    if (cstaticfriction > fstaticfriction)
                                        fstaticfriction = cstaticfriction;
                                    if (crestitution > frestitution)
                                        frestitution = crestitution;
                                    if (cistrigger == true)
                                        ftrigger = true;
                                    let cimpostortype = RigidbodyPhysics.BoxImpostor;
                                    if (ccollider === "MeshCollider") {
                                        cimpostortype = RigidbodyPhysics.ConvexHullImpostor;
                                    }
                                    else if (ccollider === "CapsuleCollider") {
                                        cimpostortype = RigidbodyPhysics.CapsuleImpostor;
                                    }
                                    else if (ccollider === "SphereCollider") {
                                        cimpostortype = RigidbodyPhysics.SphereImpostor;
                                    }
                                    else {
                                        cimpostortype = RigidbodyPhysics.BoxImpostor;
                                    }
                                    const element = ccollision;
                                    const center = (element.center != null) ? element.center : { x: 0, y: 0, z: 0 };
                                    const persist = (element.persist != null) ? element.persist : false;
                                    const item = new PhyscisContainerData();
                                    if (Utilities.ShowDebugColliders())
                                        console.log("Setup complex compound child collider type (" + ccollider + ") --> on to: " + entity.name, entity);
                                    RigidbodyPhysics.CreateCompoundPhysicsShapeAndBody(scene, entity, childnode, element, cimpostortype, cstaticfriction, cdynamicfriction, crestitution, cfrictioncombine, crestitutioncombine, fitems, item, center, complex, cistrigger, persist, layermask, filtermask);
                                }
                            }
                        });
                    }
                    if (fitems.length > 0) {
                        if (!Utilities.ReparentColliders()) {
                            entity.setParent(null, true, true);
                        }
                        const center_of_mass = new Vector3(com.x, com.y, com.z);
                        const complexparentshape = new PhysicsShapeContainer(scene);
                        complexparentshape.material = fitems[0].shape.material;
                        fitems.forEach((item) => { complexparentshape.addChild(item.shape, item.translation, item.rotation, item.scale); });
                        const complexcompoundbody = new PhysicsBody(entity, motiontype, false, scene);
                        complexcompoundbody.shape = complexparentshape;
                        RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, false, ftrigger, metadata.physics, mass, center_of_mass);
                        if (!Utilities.ShowDebugColliders()) {
                            const aentity = entity;
                            if (aentity.material != null && aentity.material.name === "CenterBox-Material") {
                                aentity.isVisible = false;
                            }
                        }
                        if (Utilities.ShowDebugColliders()) {
                            if (RigidbodyPhysics.DebugPhysicsViewer == null)
                                RigidbodyPhysics.DebugPhysicsViewer = new PhysicsViewer();
                            if (RigidbodyPhysics.DebugPhysicsViewer != null)
                                RigidbodyPhysics.DebugPhysicsViewer.showBody(complexcompoundbody);
                        }
                    }
                }
                else if (metadata.collision != null) {
                    const collider = (metadata.collision.type != null) ? metadata.collision.type : "BoxCollider";
                    const convexmesh = (metadata.collision.convexmesh != null) ? metadata.collision.convexmesh : false;
                    const restitutioncombine = (metadata.collision.restitutioncombine != null) ? RigidbodyPhysics.GetPhysicsMaterialCombine(metadata.collision.restitutioncombine) : 0;
                    const frictioncombine = (metadata.collision.frictioncombine != null) ? RigidbodyPhysics.GetPhysicsMaterialCombine(metadata.collision.frictioncombine) : 0;
                    const dynamicfriction = (metadata.collision.dynamicfriction != null) ? metadata.collision.dynamicfriction : 0.6;
                    const staticfriction = (metadata.collision.staticfriction != null) ? metadata.collision.staticfriction : 0.6;
                    const restitution = (metadata.collision.restitution != null) ? metadata.collision.restitution : 0;
                    const terraindata = (metadata.collision.terraindata != null) ? metadata.collision.terraindata : null;
                    const istrigger = (metadata.collision.trigger != null) ? metadata.collision.trigger : false;
                    const persist = (metadata.collision.persist != null) ? metadata.collision.persist : false;
                    let impostortype = RigidbodyPhysics.BoxImpostor;
                    if (collider === "MeshCollider") {
                        impostortype = (convexmesh === true) ? RigidbodyPhysics.ConvexHullImpostor : RigidbodyPhysics.MeshImpostor;
                    }
                    else if (collider === "TerrainCollider") {
                        impostortype = RigidbodyPhysics.HeightmapImpostor;
                    }
                    else if (collider === "CapsuleCollider") {
                        impostortype = RigidbodyPhysics.CapsuleImpostor;
                    }
                    else if (collider === "SphereCollider") {
                        impostortype = RigidbodyPhysics.SphereImpostor;
                    }
                    else {
                        impostortype = RigidbodyPhysics.BoxImpostor;
                    }
                    RigidbodyPhysics.CreateStandardPhysicsShapeAndBody(scene, entity, metadata, impostortype, istrigger, istruestatic, motiontype, mass, staticfriction, dynamicfriction, restitution, frictioncombine, restitutioncombine, terraindata, com, persist, layermask, filtermask);
                }
            }
            if (entity != null && entity.physicsBody != null && iskinematic === true) {
                entity.physicsBody.disablePreStep = false;
            }
        }
    }
    static GetPhysicsMaterialCombine(unity) {
        switch (unity) {
            case 0: return PhysicsMaterialCombineMode.ARITHMETIC_MEAN;
            case 1: return PhysicsMaterialCombineMode.MULTIPLY;
            case 2: return PhysicsMaterialCombineMode.MINIMUM;
            case 3: return PhysicsMaterialCombineMode.MAXIMUM;
            default: return PhysicsMaterialCombineMode.ARITHMETIC_MEAN;
        }
    }
    static GetCachedPhysicsMeshShape(scene, entity, meshkey, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter) {
        if (meshkey == null || meshkey === "") {
            console.warn("Invalid mesh key specfifed for child collider: " + entity.name);
            return null;
        }
        meshkey += ("_SF" + staticfriction + "_DF" + dynamicfriction + "_R" + restitution + "_T0" + "_L" + layer + "_X" + filter);
        let result = RigidbodyPhysics.PhysicsShapeCache[meshkey];
        if (result == null) {
            result = new PhysicsShapeMesh(entity, scene);
            result.material = { friction: dynamicfriction, staticFriction: staticfriction, restitution: restitution, frictionCombine: fcombine, restitutionCombine: rcombine };
            result.isTrigger = false;
            result.filterMembershipMask = layer;
            result.filterCollideMask = filter;
            RigidbodyPhysics.NewPhysicsShapeCount++;
            RigidbodyPhysics.PhysicsShapeCache[meshkey] = result;
        }
        else {
            RigidbodyPhysics.CachedPhysicsShapeCount++;
        }
        return result;
    }
    static GetCachedPhysicsConvexHullShape(scene, entity, meshkey, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter) {
        if (meshkey == null || meshkey === "") {
            console.warn("Invalid mesh key specfifed for child collider: " + entity.name);
            return null;
        }
        meshkey += ("_SF" + staticfriction + "_DF" + dynamicfriction + "_R" + restitution + "_T0" + "_L" + layer + "_X" + filter);
        let result = RigidbodyPhysics.PhysicsShapeCache[meshkey];
        if (result == null) {
            result = new PhysicsShapeConvexHull(entity, scene);
            result.material = { friction: dynamicfriction, staticFriction: staticfriction, restitution: restitution, frictionCombine: fcombine, restitutionCombine: rcombine };
            result.isTrigger = false;
            result.filterMembershipMask = layer;
            result.filterCollideMask = filter;
            RigidbodyPhysics.NewPhysicsShapeCount++;
            RigidbodyPhysics.PhysicsShapeCache[meshkey] = result;
        }
        else {
            RigidbodyPhysics.CachedPhysicsShapeCount++;
        }
        return result;
    }
    static GetCachedPhysicsBoxShape(scene, trigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter) {
        let shapekey = ("SHAPE_BOX_SF" + staticfriction + "_DF" + dynamicfriction + "_R" + restitution + "_T" + ((trigger == true) ? "1" : "0") + "_L" + layer + "_X" + filter);
        let result = RigidbodyPhysics.PhysicsShapeCache[shapekey];
        if (result == null) {
            result = new PhysicsShapeBox(new Vector3(0, 0, 0), new Quaternion(0, 0, 0, 1), new Vector3(1, 1, 1), scene);
            result.material = { friction: dynamicfriction, staticFriction: staticfriction, restitution: restitution, frictionCombine: fcombine, restitutionCombine: rcombine };
            result.isTrigger = trigger;
            result.filterMembershipMask = layer;
            result.filterCollideMask = filter;
            RigidbodyPhysics.NewPhysicsShapeCount++;
            RigidbodyPhysics.PhysicsShapeCache[shapekey] = result;
        }
        else {
            RigidbodyPhysics.CachedPhysicsShapeCount++;
        }
        return result;
    }
    static GetCachedPhysicsSphereShape(scene, trigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter) {
        let shapekey = ("SHAPE_SPHERE_SF" + staticfriction + "_DF" + dynamicfriction + "_R" + restitution + "_T" + ((trigger == true) ? "1" : "0") + "_L" + layer + "_X" + filter);
        let result = RigidbodyPhysics.PhysicsShapeCache[shapekey];
        let radius = 1.0;
        if (result == null) {
            result = new PhysicsShapeSphere(new Vector3(0, 0, 0), radius, scene);
            result.material = { friction: dynamicfriction, staticFriction: staticfriction, restitution: restitution, frictionCombine: fcombine, restitutionCombine: rcombine };
            result.isTrigger = trigger;
            result.filterMembershipMask = layer;
            result.filterCollideMask = filter;
            RigidbodyPhysics.NewPhysicsShapeCount++;
            RigidbodyPhysics.PhysicsShapeCache[shapekey] = result;
        }
        else {
            RigidbodyPhysics.CachedPhysicsShapeCount++;
        }
        return result;
    }
    static GetCachedPhysicsCapsuleShape(scene, trigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter) {
        let shapekey = ("SHAPE_CAPSULE_SF" + staticfriction + "_DF" + dynamicfriction + "_R" + restitution + "_T" + ((trigger == true) ? "1" : "0") + "_L" + layer + "_X" + filter);
        let result = RigidbodyPhysics.PhysicsShapeCache[shapekey];
        let height = 1.0;
        let cap = 1.0;
        let top = -((height + cap) * 0.5);
        let bottom = ((height + cap) * 0.5);
        let radius = 1.0;
        if (result == null) {
            result = new PhysicsShapeCapsule(new Vector3(0, top, 0), new Vector3(0, bottom, 0), radius, scene);
            result.material = { friction: dynamicfriction, staticFriction: staticfriction, restitution: restitution, frictionCombine: fcombine, restitutionCombine: rcombine };
            result.isTrigger = trigger;
            result.filterMembershipMask = layer;
            result.filterCollideMask = filter;
            RigidbodyPhysics.NewPhysicsShapeCount++;
            RigidbodyPhysics.PhysicsShapeCache[shapekey] = result;
        }
        else {
            RigidbodyPhysics.CachedPhysicsShapeCount++;
        }
        return result;
    }
    static GetCachedPhysicsCylinderShape(scene, trigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter) {
        let shapekey = ("SHAPE_CYLINDER_SF" + staticfriction + "_DF" + dynamicfriction + "_R" + restitution + "_T" + ((trigger == true) ? "1" : "0") + "_L" + layer + "_X" + filter);
        let result = RigidbodyPhysics.PhysicsShapeCache[shapekey];
        let height = 1.0;
        let top = -(height * 0.5);
        let bottom = (height * 0.5);
        let radius = 1.0;
        if (result == null) {
            result = new PhysicsShapeCylinder(new Vector3(0, top, 0), new Vector3(0, bottom, 0), radius, scene);
            result.material = { friction: dynamicfriction, staticFriction: staticfriction, restitution: restitution, frictionCombine: fcombine, restitutionCombine: rcombine };
            result.isTrigger = trigger;
            result.filterMembershipMask = layer;
            result.filterCollideMask = filter;
            RigidbodyPhysics.NewPhysicsShapeCount++;
            RigidbodyPhysics.PhysicsShapeCache[shapekey] = result;
        }
        else {
            RigidbodyPhysics.CachedPhysicsShapeCount++;
        }
        return result;
    }
    static CreateStandardPhysicsShapeAndBody(scene, entity, metadata, impostortype, istrigger, istruestatic, motiontype, mass, staticfriction, dynamicfriction, restitution, fcombine, rcombine, terraindata, com, persist, layer, filter) {
        const element = metadata.collision;
        const meshkey = (element.meshkey != null) ? element.meshkey : null;
        const center = (element.center != null) ? element.center : { x: 0, y: 0, z: 0 };
        if (impostortype == RigidbodyPhysics.HeightmapImpostor) {
            if (terraindata != null) {
                if (!Utilities.ReparentColliders()) {
                    entity.setParent(null, true, true);
                }
                const terrainMesh = entity;
                const terrainIndex = terraindata.index;
                const terrainSegments = terraindata.segments;
                const terrainResolution = terraindata.resolution;
                const terrainWidthExtents = terraindata.width;
                const terrainHeightExtents = terraindata.height;
                const terrainDepthExtents = terraindata.length;
                const terrainCollisionType = (terraindata.collider != null) ? terraindata.collider : 0;
                if (terrainCollisionType === 1) {
                    let scalex = 1;
                    let scalez = 1;
                    let posx = 0;
                    let posz = 0;
                    if (terrainSegments === 1) {
                        scalex = (terrainWidthExtents / (terrainResolution - 1));
                        scalez = (terrainDepthExtents / (terrainResolution - 1));
                        posx = ((terrainWidthExtents + scalex) * 0.5);
                        posz = ((terrainDepthExtents - scalez) * 0.5);
                    }
                    else if (terrainSegments === 2) {
                        const tileWidthExtents = (terrainWidthExtents / terrainSegments);
                        const tileDepthExtents = (terrainDepthExtents / terrainSegments);
                        scalex = (terrainWidthExtents / (terrainResolution - 1));
                        scalez = (terrainDepthExtents / (terrainResolution - 1));
                        if (terrainIndex === 0) {
                            posx = ((tileWidthExtents + scalex) * 0.5) + 0;
                            posz = ((tileDepthExtents - scalez) * 0.5) + 0;
                        }
                        else if (terrainIndex === 1) {
                            posx = (((tileWidthExtents * 1) + scalex) * 0.5) + 0;
                            posz = ((tileDepthExtents - scalez) * 0.5) + tileDepthExtents;
                        }
                        else if (terrainIndex === 2) {
                            posx = (((tileWidthExtents * 1) + scalex) * 0.5) + tileWidthExtents;
                            posz = ((tileDepthExtents - scalez) * 0.5) + 0;
                        }
                        else if (terrainIndex === 3) {
                            posx = (((tileWidthExtents * 1) + scalex) * 0.5) + tileWidthExtents;
                            posz = ((tileDepthExtents - scalez) * 0.5) + tileDepthExtents;
                        }
                    }
                    const groundShape = RigidbodyPhysics.CreateHeightFieldTerrainShapeFromMesh(terrainMesh, scalex, scalez);
                    const terrainshape = new PhysicsShape({ type: PhysicsShapeType.HEIGHTFIELD, pluginData: groundShape }, scene);
                    terrainshape.filterMembershipMask = layer;
                    terrainshape.filterCollideMask = filter;
                    terrainshape.material = { friction: dynamicfriction, staticFriction: staticfriction, restitution: restitution, frictionCombine: fcombine, restitutionCombine: rcombine };
                    const terrainkey = ("TERRAIN_MESH_ID" + terrainMesh.uniqueId + "_SF" + staticfriction + "_DF" + dynamicfriction + "_R" + restitution + "_T0" + "_L" + layer + "_X" + filter);
                    RigidbodyPhysics.NewPhysicsShapeCount++;
                    RigidbodyPhysics.PhysicsShapeCache[terrainkey] = terrainshape;
                    const terrainposition = new Vector3(posx, 0, posz);
                    const terrainrotation = new Quaternion(0, 0, 0, 1);
                    const terrainscale = new Vector3(1, 1, 1);
                    const terrainparentshape = new PhysicsShapeContainer(scene);
                    terrainparentshape.material = terrainshape.material;
                    Utilities.FromEulerToRef(0, 90, 0, terrainrotation);
                    terrainshape.isTrigger = false;
                    terrainparentshape.addChild(terrainshape, terrainposition, terrainrotation, terrainscale);
                    const terrainmeshbody = new PhysicsBody(entity, PhysicsMotionType.STATIC, false, scene);
                    terrainmeshbody.shape = terrainparentshape;
                    if (Utilities.ShowDebugColliders())
                        console.log("Setup standard terrain heightmap physics collider for: " + entity.name, entity);
                    RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, false, istrigger, metadata.physics, 0, new Vector3(com.x, com.y, com.z));
                    if (!Utilities.ShowDebugColliders()) {
                        const aentity = entity;
                        if (aentity.material != null && aentity.material.name === "CenterBox-Material") {
                            aentity.isVisible = false;
                        }
                    }
                    if (Utilities.ShowDebugColliders()) {
                        if (RigidbodyPhysics.DebugPhysicsViewer == null)
                            RigidbodyPhysics.DebugPhysicsViewer = new PhysicsViewer();
                        if (RigidbodyPhysics.DebugPhysicsViewer != null)
                            RigidbodyPhysics.DebugPhysicsViewer.showBody(terrainmeshbody);
                    }
                }
                else {
                    const meshshape = new PhysicsShapeMesh(terrainMesh, scene);
                    meshshape.filterMembershipMask = layer;
                    meshshape.filterCollideMask = filter;
                    meshshape.material = { friction: dynamicfriction, staticFriction: staticfriction, restitution: restitution, frictionCombine: fcombine, restitutionCombine: rcombine };
                    const meshbody = new PhysicsBody(entity, PhysicsMotionType.STATIC, false, scene);
                    meshbody.shape = meshshape;
                    if (Utilities.ShowDebugColliders())
                        console.log("Setup terrain mesh physics collider for: " + entity.name, entity);
                    RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, false, istrigger, metadata.physics, 0, new Vector3(com.x, com.y, com.z));
                    if (!Utilities.ShowDebugColliders()) {
                        const aentity = entity;
                        if (aentity.material != null && aentity.material.name === "CenterBox-Material") {
                            aentity.isVisible = false;
                        }
                    }
                    if (Utilities.ShowDebugColliders()) {
                        if (RigidbodyPhysics.DebugPhysicsViewer == null)
                            RigidbodyPhysics.DebugPhysicsViewer = new PhysicsViewer();
                        if (RigidbodyPhysics.DebugPhysicsViewer != null)
                            RigidbodyPhysics.DebugPhysicsViewer.showBody(meshbody);
                    }
                }
            }
            else {
                Tools.Warn("No terrain collision data found for: " + entity.name + ". No terrain collision impostor will be created.");
            }
        }
        else if (impostortype == RigidbodyPhysics.MeshImpostor) {
            let collisionMesh = SceneManager.FindChildTransformNode(entity, (entity.name + ".Collider"), SearchType.ExactMatch, true);
            if (collisionMesh != null) {
                if (persist === false)
                    Utilities.AddLoaderItemMarkedForDisposal(collisionMesh);
                if (!Utilities.ReparentColliders()) {
                    entity.setParent(null, true, true);
                }
                const meshbody = new PhysicsBody(entity, PhysicsMotionType.STATIC, false, scene);
                const meshshape = RigidbodyPhysics.GetCachedPhysicsMeshShape(scene, collisionMesh, meshkey, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
                const meshparentshape = new PhysicsShapeContainer(scene);
                meshparentshape.material = meshshape.material;
                RigidbodyPhysics.AddChildShapeFromParent(meshparentshape, entity, meshshape, collisionMesh);
                meshbody.shape = meshparentshape;
                if (Utilities.ShowDebugColliders())
                    console.log("Setup standard mesh physics collider for: " + entity.name, entity);
                RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, false, istrigger, metadata.physics, 0, new Vector3(com.x, com.y, com.z));
                if (!Utilities.ShowDebugColliders()) {
                    const aentity = entity;
                    if (aentity.material != null && aentity.material.name === "CenterBox-Material") {
                        aentity.isVisible = false;
                    }
                }
                if (Utilities.ShowDebugColliders()) {
                    if (RigidbodyPhysics.DebugPhysicsViewer == null)
                        RigidbodyPhysics.DebugPhysicsViewer = new PhysicsViewer();
                    if (RigidbodyPhysics.DebugPhysicsViewer != null)
                        RigidbodyPhysics.DebugPhysicsViewer.showBody(meshbody);
                }
            }
            else {
                Tools.Warn("No mesh collider found for: " + entity.name + ".");
            }
        }
        else if (impostortype == RigidbodyPhysics.ConvexHullImpostor) {
            let convexHullMesh = SceneManager.FindChildTransformNode(entity, (entity.name + ".Collider"), SearchType.ExactMatch, true);
            if (convexHullMesh != null) {
                if (persist === false)
                    Utilities.AddLoaderItemMarkedForDisposal(convexHullMesh);
                if (!Utilities.ReparentColliders()) {
                    entity.setParent(null, true, true);
                }
                const convexshape = RigidbodyPhysics.GetCachedPhysicsConvexHullShape(scene, convexHullMesh, meshkey, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
                const convexparentshape = new PhysicsShapeContainer(scene);
                convexparentshape.material = convexshape.material;
                RigidbodyPhysics.AddChildShapeFromParent(convexparentshape, entity, convexshape, convexHullMesh);
                const convexbody = new PhysicsBody(entity, motiontype, false, scene);
                convexbody.shape = convexparentshape;
                if (Utilities.ShowDebugColliders())
                    console.log("Setup standard convex hull physics collider for: " + entity.name, entity);
                RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, true, false, metadata.physics, mass, new Vector3(com.x, com.y, com.z));
                if (!Utilities.ShowDebugColliders()) {
                    const aentity = entity;
                    if (aentity.material != null && aentity.material.name === "CenterBox-Material") {
                        aentity.isVisible = false;
                    }
                }
                if (Utilities.ShowDebugColliders()) {
                    if (RigidbodyPhysics.DebugPhysicsViewer == null)
                        RigidbodyPhysics.DebugPhysicsViewer = new PhysicsViewer();
                    if (RigidbodyPhysics.DebugPhysicsViewer != null)
                        RigidbodyPhysics.DebugPhysicsViewer.showBody(convexbody);
                }
            }
            else {
                Tools.Warn("No convex hull child mesh collider found for: " + entity.name + ".");
            }
        }
        else if (impostortype == RigidbodyPhysics.BoxImpostor) {
            if (!Utilities.ReparentColliders()) {
                entity.setParent(null, true, true);
            }
            const boxsize = (element.boxsize != null) ? element.boxsize : { x: 1, y: 1, z: 1 };
            const boxsize_xx = boxsize.x * parseFloat(entity.scaling.x.toFixed(4));
            const boxsize_yy = boxsize.y * parseFloat(entity.scaling.y.toFixed(4));
            const boxsize_zz = boxsize.z * parseFloat(entity.scaling.z.toFixed(4));
            const center_xx = center.x * parseFloat(entity.scaling.x.toFixed(4));
            const center_yy = center.y * parseFloat(entity.scaling.y.toFixed(4));
            const center_zz = center.z * parseFloat(entity.scaling.z.toFixed(4));
            const center_vec = new Vector3(center_xx, center_yy, center_zz);
            const boxshape = RigidbodyPhysics.GetCachedPhysicsBoxShape(scene, istrigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
            const boxparentshape = new PhysicsShapeContainer(scene);
            boxparentshape.material = boxshape.material;
            boxparentshape.addChild(boxshape, center_vec, new Quaternion(0, 0, 0, 1), new Vector3(boxsize_xx, boxsize_yy, boxsize_zz));
            const boxbody = new PhysicsBody(entity, motiontype, false, scene);
            boxbody.shape = boxparentshape;
            if (Utilities.ShowDebugColliders())
                console.log("Setup standard box physics collider for: " + entity.name, entity);
            RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, false, false, metadata.physics, mass, center_vec.add(new Vector3(com.x, com.y, com.z)));
            if (!Utilities.ShowDebugColliders()) {
                const aentity = entity;
                if (aentity.material != null && aentity.material.name === "CenterBox-Material") {
                    aentity.isVisible = false;
                }
            }
            if (Utilities.ShowDebugColliders()) {
                if (RigidbodyPhysics.DebugPhysicsViewer == null)
                    RigidbodyPhysics.DebugPhysicsViewer = new PhysicsViewer();
                if (RigidbodyPhysics.DebugPhysicsViewer != null)
                    RigidbodyPhysics.DebugPhysicsViewer.showBody(boxbody);
            }
        }
        else if (impostortype == RigidbodyPhysics.SphereImpostor) {
            if (!Utilities.ReparentColliders()) {
                entity.setParent(null, true, true);
            }
            const sphereradius = (element.sphereradius != null) ? element.sphereradius : 0.5;
            const spheresize_xx = parseFloat(entity.scaling.x.toFixed(4));
            const spheresize_yy = parseFloat(entity.scaling.y.toFixed(4));
            const spheresize_zz = parseFloat(entity.scaling.z.toFixed(4));
            const spheresize_rad = Math.max(spheresize_xx, spheresize_yy, spheresize_zz) * sphereradius;
            const center_xx = center.x * parseFloat(entity.scaling.x.toFixed(4));
            const center_yy = center.y * parseFloat(entity.scaling.y.toFixed(4));
            const center_zz = center.z * parseFloat(entity.scaling.z.toFixed(4));
            const center_vec = new Vector3(center_xx, center_yy, center_zz);
            const sphereshape = RigidbodyPhysics.GetCachedPhysicsSphereShape(scene, istrigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
            const sphereparentshape = new PhysicsShapeContainer(scene);
            sphereparentshape.material = sphereshape.material;
            sphereparentshape.addChild(sphereshape, center_vec, new Quaternion(0, 0, 0, 1), new Vector3(spheresize_rad, spheresize_rad, spheresize_rad));
            const spherebody = new PhysicsBody(entity, motiontype, false, scene);
            spherebody.shape = sphereparentshape;
            if (Utilities.ShowDebugColliders())
                console.log("Setup standard sphere physics collider for: " + entity.name, entity);
            RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, false, false, metadata.physics, mass, center_vec.add(new Vector3(com.x, com.y, com.z)));
            if (!Utilities.ShowDebugColliders()) {
                const aentity = entity;
                if (aentity.material != null && aentity.material.name === "CenterBox-Material") {
                    aentity.isVisible = false;
                }
            }
            if (Utilities.ShowDebugColliders()) {
                if (RigidbodyPhysics.DebugPhysicsViewer == null)
                    RigidbodyPhysics.DebugPhysicsViewer = new PhysicsViewer();
                if (RigidbodyPhysics.DebugPhysicsViewer != null)
                    RigidbodyPhysics.DebugPhysicsViewer.showBody(spherebody);
            }
        }
        else if (impostortype == RigidbodyPhysics.CapsuleImpostor) {
            if (!Utilities.ReparentColliders()) {
                entity.setParent(null, true, true);
            }
            const cylinder = (element.cylinder != null) ? element.cylinder : false;
            const capsulesize = (element.capsulesize != null) ? element.capsulesize : { x: 0.5, y: 2, z: 1 };
            const capsulesize_xx = capsulesize.x * parseFloat(entity.scaling.x.toFixed(4));
            const capsulesize_yy = capsulesize.y * parseFloat(entity.scaling.y.toFixed(4));
            const capsulesize_zz = parseFloat(entity.scaling.z.toFixed(4));
            let capsuleshape = null;
            if (cylinder === true) {
                capsuleshape = RigidbodyPhysics.GetCachedPhysicsCylinderShape(scene, istrigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
            }
            else {
                capsuleshape = RigidbodyPhysics.GetCachedPhysicsCapsuleShape(scene, istrigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
            }
            const rotation = new Quaternion(0, 0, 0, 1);
            if (capsulesize.z === 0 || capsulesize.z === 2) {
                if (capsulesize.z === 0)
                    Utilities.FromEulerToRef(0, 0, 90, rotation);
                else if (capsulesize.z === 2)
                    Utilities.FromEulerToRef(90, 0, 0, rotation);
            }
            const center_xx = center.x * parseFloat(entity.scaling.x.toFixed(4));
            const center_yy = center.y * parseFloat(entity.scaling.y.toFixed(4));
            const center_zz = center.z * parseFloat(entity.scaling.z.toFixed(4));
            const center_vec = new Vector3(center_xx, center_yy, center_zz);
            const capsuleparentshape = new PhysicsShapeContainer(scene);
            capsuleparentshape.material = capsuleshape.material;
            if (cylinder === true) {
                capsuleparentshape.addChild(capsuleshape, center_vec, rotation, new Vector3(capsulesize_xx, capsulesize_yy, capsulesize_xx));
            }
            else {
                capsuleparentshape.addChild(capsuleshape, center_vec, rotation, new Vector3(capsulesize_xx, capsulesize_yy, capsulesize_xx));
            }
            const capsulebody = new PhysicsBody(entity, motiontype, false, scene);
            capsulebody.shape = capsuleparentshape;
            if (Utilities.ShowDebugColliders())
                console.log("Setup standard " + ((cylinder === true) ? "cylinder" : "capsule") + " physics collider for: " + entity.name, entity);
            RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, false, false, metadata.physics, mass, center_vec.add(new Vector3(com.x, com.y, com.z)));
            if (!Utilities.ShowDebugColliders()) {
                const aentity = entity;
                if (aentity.material != null && aentity.material.name === "CenterBox-Material") {
                    aentity.isVisible = false;
                }
            }
            if (Utilities.ShowDebugColliders()) {
                if (RigidbodyPhysics.DebugPhysicsViewer == null)
                    RigidbodyPhysics.DebugPhysicsViewer = new PhysicsViewer();
                if (RigidbodyPhysics.DebugPhysicsViewer != null)
                    RigidbodyPhysics.DebugPhysicsViewer.showBody(capsulebody);
            }
        }
    }
    static CreateCompoundPhysicsShapeAndBody(scene, root, entity, element, impostortype, staticfriction, dynamicfriction, restitution, fcombine, rcombine, sitems, item, center, complex, trigger, persist, layer, filter) {
        let center_xx = 0;
        let center_yy = 0;
        let center_zz = 0;
        let position = new Vector3(0, 0, 0);
        let rotation = new Quaternion(0, 0, 0, 1);
        let scaling = new Vector3(1, 1, 1);
        if (persist === false && complex === true)
            Utilities.AddLoaderItemMarkedForDisposal(entity);
        if (impostortype == RigidbodyPhysics.ConvexHullImpostor) {
            let convexHullMesh = SceneManager.FindChildTransformNode(entity, (entity.name + ".Collider"), SearchType.ExactMatch, true);
            if (convexHullMesh != null) {
                let convexsize_xx = 1;
                let convexsize_yy = 1;
                let convexsize_zz = 1;
                if (convexHullMesh instanceof InstancedMesh) {
                    if (complex === true) {
                        convexsize_xx *= parseFloat(root.scaling.x.toFixed(4));
                        convexsize_yy *= parseFloat(root.scaling.y.toFixed(4));
                        convexsize_zz *= parseFloat(root.scaling.z.toFixed(4));
                    }
                    scaling.set(convexsize_xx, convexsize_yy, convexsize_zz);
                    const sourceMesh = convexHullMesh.sourceMesh;
                    if (sourceMesh != null) {
                        const childScale = (convexHullMesh.metadata != null && convexHullMesh.metadata.toolkit != null && convexHullMesh.metadata.toolkit.collision != null && convexHullMesh.metadata.toolkit.collision.sourcescale != null) ? convexHullMesh.metadata.toolkit.collision.sourcescale : null;
                        const sourceScale = (sourceMesh.metadata != null && sourceMesh.metadata.toolkit != null && sourceMesh.metadata.toolkit.collision != null && sourceMesh.metadata.toolkit.collision.sourcescale != null) ? sourceMesh.metadata.toolkit.collision.sourcescale : null;
                        if (sourceScale != null && childScale != null) {
                            const scaleFactor = new Vector3(1, 1, 1);
                            const childScaleVec = new Vector3(childScale.x, childScale.y, childScale.z);
                            const sourceScaleVec = new Vector3(sourceScale.x, sourceScale.y, sourceScale.z);
                            childScaleVec.divideToRef(sourceScaleVec, scaleFactor);
                            scaling.multiplyInPlace(scaleFactor);
                        }
                    }
                }
                else {
                    scaling.set(convexsize_xx, convexsize_yy, convexsize_zz);
                }
                const meshkey = (element.meshkey != null) ? element.meshkey : null;
                const convexshape = RigidbodyPhysics.GetCachedPhysicsConvexHullShape(scene, convexHullMesh, meshkey, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
                if (complex === true) {
                    let pos_xx = entity.position.x * parseFloat(root.scaling.x.toFixed(4));
                    let pos_yy = entity.position.y * parseFloat(root.scaling.y.toFixed(4));
                    let pos_zz = entity.position.z * parseFloat(root.scaling.z.toFixed(4));
                    position.set(pos_xx, pos_yy, pos_zz);
                    rotation.multiplyInPlace(entity.rotationQuaternion);
                }
                else {
                    center_xx = center.x * parseFloat(entity.scaling.x.toFixed(4));
                    center_yy = center.y * parseFloat(entity.scaling.y.toFixed(4));
                    center_zz = center.z * parseFloat(entity.scaling.z.toFixed(4));
                    position.set(center_xx, center_yy, center_zz);
                }
                item.shape = convexshape;
                item.translation = position;
                item.rotation = rotation;
                item.scale = scaling;
                sitems.push(item);
            }
        }
        else if (impostortype == RigidbodyPhysics.CapsuleImpostor) {
            let cylinder = (element.cylinder != null) ? element.cylinder : false;
            let capsulesize = (element.capsulesize != null) ? element.capsulesize : { x: 0.5, y: 2, z: 1 };
            let capsulesize_xx = capsulesize.x * parseFloat(entity.scaling.x.toFixed(4));
            let capsulesize_yy = capsulesize.y * parseFloat(entity.scaling.y.toFixed(4));
            let capsulesize_zz = parseFloat(entity.scaling.z.toFixed(4));
            if (complex === true) {
                capsulesize_xx *= parseFloat(root.scaling.x.toFixed(4));
                capsulesize_yy *= parseFloat(root.scaling.y.toFixed(4));
                capsulesize_zz *= parseFloat(root.scaling.z.toFixed(4));
            }
            scaling.set(capsulesize_xx, capsulesize_yy, capsulesize_xx);
            let capsuleshape = null;
            if (cylinder === true) {
                capsuleshape = RigidbodyPhysics.GetCachedPhysicsCylinderShape(scene, trigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
            }
            else {
                capsuleshape = RigidbodyPhysics.GetCachedPhysicsCapsuleShape(scene, trigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
            }
            if (capsulesize.z === 0 || capsulesize.z === 2) {
                if (capsulesize.z === 0)
                    Utilities.FromEulerToRef(0, 0, 90, rotation);
                else if (capsulesize.z === 2)
                    Utilities.FromEulerToRef(90, 0, 0, rotation);
            }
            if (complex === true) {
                if (center.x !== 0 || center.y !== 0 || center.z !== 0)
                    console.warn("WARNING: Center offset not supported for complex compound item: " + entity.name);
                let pos_xx = entity.position.x * parseFloat(root.scaling.x.toFixed(4));
                let pos_yy = entity.position.y * parseFloat(root.scaling.y.toFixed(4));
                let pos_zz = entity.position.z * parseFloat(root.scaling.z.toFixed(4));
                position.set(pos_xx, pos_yy, pos_zz);
                rotation.multiplyInPlace(entity.rotationQuaternion);
            }
            else {
                center_xx = center.x * parseFloat(entity.scaling.x.toFixed(4));
                center_yy = center.y * parseFloat(entity.scaling.y.toFixed(4));
                center_zz = center.z * parseFloat(entity.scaling.z.toFixed(4));
                position.set(center_xx, center_yy, center_zz);
            }
            item.shape = capsuleshape;
            item.translation = position;
            item.rotation = rotation;
            item.scale = scaling;
            sitems.push(item);
        }
        else if (impostortype == RigidbodyPhysics.SphereImpostor) {
            let sphereradius = (element.sphereradius != null) ? element.sphereradius : 0.5;
            let spheresize_xx = parseFloat(entity.scaling.x.toFixed(4));
            let spheresize_yy = parseFloat(entity.scaling.y.toFixed(4));
            let spheresize_zz = parseFloat(entity.scaling.z.toFixed(4));
            let spheresize_rad = Math.max(spheresize_xx, spheresize_yy, spheresize_zz) * sphereradius;
            if (complex === true) {
                let rootspheresize_xx = parseFloat(root.scaling.x.toFixed(4));
                let rootspheresize_yy = parseFloat(root.scaling.y.toFixed(4));
                let rootspheresize_zz = parseFloat(root.scaling.z.toFixed(4));
                spheresize_rad *= Math.max(rootspheresize_xx, rootspheresize_yy, rootspheresize_zz);
            }
            scaling.set(spheresize_rad, spheresize_rad, spheresize_rad);
            let sphereshape = RigidbodyPhysics.GetCachedPhysicsSphereShape(scene, trigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
            if (complex === true) {
                if (center.x !== 0 || center.y !== 0 || center.z !== 0)
                    console.warn("WARNING: Center offset not supported for complex compound item: " + entity.name);
                let pos_xx = entity.position.x * parseFloat(root.scaling.x.toFixed(4));
                let pos_yy = entity.position.y * parseFloat(root.scaling.y.toFixed(4));
                let pos_zz = entity.position.z * parseFloat(root.scaling.z.toFixed(4));
                position.set(pos_xx, pos_yy, pos_zz);
                rotation.multiplyInPlace(entity.rotationQuaternion);
            }
            else {
                center_xx = center.x * parseFloat(entity.scaling.x.toFixed(4));
                center_yy = center.y * parseFloat(entity.scaling.y.toFixed(4));
                center_zz = center.z * parseFloat(entity.scaling.z.toFixed(4));
                position.set(center_xx, center_yy, center_zz);
            }
            item.shape = sphereshape;
            item.translation = position;
            item.rotation = rotation;
            item.scale = scaling;
            sitems.push(item);
        }
        else if (impostortype == RigidbodyPhysics.BoxImpostor) {
            let boxsize = (element.boxsize != null) ? element.boxsize : { x: 1, y: 1, z: 1 };
            let boxsize_xx = boxsize.x * parseFloat(entity.scaling.x.toFixed(4));
            let boxsize_yy = boxsize.y * parseFloat(entity.scaling.y.toFixed(4));
            let boxsize_zz = boxsize.z * parseFloat(entity.scaling.z.toFixed(4));
            if (complex === true) {
                boxsize_xx *= parseFloat(root.scaling.x.toFixed(4));
                boxsize_yy *= parseFloat(root.scaling.y.toFixed(4));
                boxsize_zz *= parseFloat(root.scaling.z.toFixed(4));
            }
            scaling.set(boxsize_xx, boxsize_yy, boxsize_zz);
            let boxshape = RigidbodyPhysics.GetCachedPhysicsBoxShape(scene, trigger, staticfriction, dynamicfriction, restitution, fcombine, rcombine, layer, filter);
            if (complex === true) {
                if (center.x !== 0 || center.y !== 0 || center.z !== 0)
                    console.warn("WARNING: Center offset not supported for complex compound item: " + entity.name);
                let pos_xx = entity.position.x * parseFloat(root.scaling.x.toFixed(4));
                let pos_yy = entity.position.y * parseFloat(root.scaling.y.toFixed(4));
                let pos_zz = entity.position.z * parseFloat(root.scaling.z.toFixed(4));
                position.set(pos_xx, pos_yy, pos_zz);
                rotation.multiplyInPlace(entity.rotationQuaternion);
            }
            else {
                center_xx = center.x * parseFloat(entity.scaling.x.toFixed(4));
                center_yy = center.y * parseFloat(entity.scaling.y.toFixed(4));
                center_zz = center.z * parseFloat(entity.scaling.z.toFixed(4));
                position.set(center_xx, center_yy, center_zz);
            }
            item.shape = boxshape;
            item.translation = position;
            item.rotation = rotation;
            item.scale = scaling;
            sitems.push(item);
        }
    }
    static CreateHeightFieldTerrainShapeFromMesh(terrainMesh, scaleX, scaleZ) {
        const havokInstance = RigidbodyPhysics.GetHavokInstance();
        if (!havokInstance) {
            Tools.Warn("Havok.js physics library not loaded");
            return null;
        }
        const vertexData = terrainMesh.getVerticesData(VertexBuffer.PositionKind);
        const totalVertices = (vertexData.length / 3);
        const havokBufferBegin = havokInstance._malloc(4 * totalVertices);
        let width = Math.sqrt(totalVertices);
        let height = width;
        if (width % 1 !== 0) {
            console.error("Terrain mesh does not seem to be a regular square grid: " + terrainMesh.name);
            return null;
        }
        let p2 = 0;
        for (let j = height - 1; j >= 0; j--) {
            for (let i = 0; i < width; i++) {
                let index = j * width + i;
                havokInstance.HEAPF32[havokBufferBegin + p2 >> 2] = vertexData[index * 3 + 1];
                p2 += 4;
            }
        }
        const heightFieldShape = havokInstance.HP_Shape_CreateHeightField(width, height, [scaleX, 1, scaleZ], havokBufferBegin)[1];
        havokInstance._free(havokBufferBegin);
        return heightFieldShape;
    }
    static GetPhysicsHeapSize() {
        const havokInstance = RigidbodyPhysics.GetHavokInstance();
        if (!havokInstance) {
            Tools.Warn("Havok.js physics library not loaded");
            return 0;
        }
        let result = 0;
        if (havokInstance.HEAP8 && havokInstance.HEAP8.length) {
            result = havokInstance.HEAP8.length / (1024 * 1024);
        }
        return result;
    }
    static ConfigRigidbodyPhysics(scene, entity, child, trigger, physics, mass, com) {
        if (entity == null || entity.physicsBody == null)
            return;
        const gravity = (physics != null && physics.gravity != null) ? physics.gravity : true;
        if (gravity === false)
            entity.physicsBody.setGravityFactor(0);
        const ldrag = (physics != null && physics.ldrag != null) ? physics.ldrag : 0;
        const adrag = (physics != null && physics.adrag != null) ? physics.adrag : 0.05;
        entity.physicsBody.setLinearDamping(ldrag);
        entity.physicsBody.setAngularDamping(adrag);
        let freeze = (physics != null && physics.freeze != null) ? physics.freeze : null;
        let freeze_pos_x = 1;
        let freeze_pos_y = 1;
        let freeze_pos_z = 1;
        let freeze_rot_x = 1;
        let freeze_rot_y = 1;
        let freeze_rot_z = 1;
        if (freeze != null) {
            freeze_pos_x = (freeze.positionx != null && freeze.positionx === true) ? 0 : 1;
            freeze_pos_y = (freeze.positiony != null && freeze.positiony === true) ? 0 : 1;
            freeze_pos_z = (freeze.positionz != null && freeze.positionz === true) ? 0 : 1;
            freeze_rot_x = (freeze.rotationx != null && freeze.rotationx === true) ? 0 : 1;
            freeze_rot_y = (freeze.rotationy != null && freeze.rotationy === true) ? 0 : 1;
            freeze_rot_z = (freeze.rotationz != null && freeze.rotationz === true) ? 0 : 1;
        }
        entity.physicsBody.setMassProperties({ mass: mass, centerOfMass: com, inertia: new Vector3(freeze_rot_x, freeze_rot_y, freeze_rot_z) });
    }
    static CreatePhysicsMetadata(mass, drag = 0.0, angularDrag = 0.05, centerMass = null) {
        const center = (centerMass != null) ? centerMass : new Vector3(0, 0, 0);
        return {
            "type": "rigidbody",
            "mass": mass,
            "ldrag": drag,
            "adrag": angularDrag,
            "center": {
                "x": center.x,
                "y": center.y,
                "z": center.z
            }
        };
    }
    static CreateCollisionMetadata(type, trigger = false, convexmesh = false, restitution = 0.0, dynamicfriction = 0.6, staticfriction = 0.6) {
        return {
            "type": type,
            "trigger": trigger,
            "convexmesh": convexmesh,
            "restitution": restitution,
            "dynamicfriction": dynamicfriction,
            "staticfriction": staticfriction,
            "wheelinformation": null
        };
    }
    static CreatePhysicsProperties(mass, drag = 0.0, angularDrag = 0.05, useGravity = true, isKinematic = false) {
        return {
            "mass": mass,
            "drag": drag,
            "angularDrag": angularDrag,
            "useGravity": useGravity,
            "isKinematic": isKinematic
        };
    }
    static AddChildShapeFromParent(containerShape, parentTransform, newChild, childTransform) {
        const childToWorld = childTransform.computeWorldMatrix(true);
        const parentToWorld = parentTransform.computeWorldMatrix(true);
        const childToParent = TmpVectors.Matrix[0];
        childToWorld.multiplyToRef(Matrix.Invert(parentToWorld), childToParent);
        const translation = TmpVectors.Vector3[0];
        const rotation = TmpVectors.Quaternion[0];
        const scaling = TmpVectors.Vector3[1];
        childToParent.decompose(scaling, rotation, translation);
        const localScaling = new Vector3(scaling.x, scaling.y, scaling.z);
        if (childTransform instanceof InstancedMesh) {
            const sourceMesh = childTransform.sourceMesh;
            if (sourceMesh != null) {
                const childScale = (childTransform.metadata != null && childTransform.metadata.toolkit != null && childTransform.metadata.toolkit.collision != null && childTransform.metadata.toolkit.collision.sourcescale != null) ? childTransform.metadata.toolkit.collision.sourcescale : null;
                const sourceScale = (sourceMesh.metadata != null && sourceMesh.metadata.toolkit != null && sourceMesh.metadata.toolkit.collision != null && sourceMesh.metadata.toolkit.collision.sourcescale != null) ? sourceMesh.metadata.toolkit.collision.sourcescale : null;
                if (sourceScale != null && childScale != null) {
                    const scaleFactor = new Vector3(1, 1, 1);
                    const childScaleVec = new Vector3(childScale.x, childScale.y, childScale.z);
                    const sourceScaleVec = new Vector3(sourceScale.x, sourceScale.y, sourceScale.z);
                    childScaleVec.divideToRef(sourceScaleVec, scaleFactor);
                    localScaling.multiplyInPlace(scaleFactor);
                }
            }
        }
        Utilities.GetHavokPlugin()?.addChild(containerShape, newChild, translation, rotation, localScaling);
    }
}
RigidbodyPhysics.PHYSICS_STEP_TIME = 0.016;
RigidbodyPhysics.RaycastResult = null;
RigidbodyPhysics.LocalShapeResult = null;
RigidbodyPhysics.WorldShapeResult = null;
RigidbodyPhysics.RaycastDestination = null;
RigidbodyPhysics.PhysicsShapeCache = {};
RigidbodyPhysics.NewPhysicsShapeCount = 0;
RigidbodyPhysics.CachedPhysicsShapeCount = 0;
RigidbodyPhysics.DebugPhysicsViewer = null;
RigidbodyPhysics.OnSetupPhysicsPlugin = null;
RigidbodyPhysics.NoImpostor = 0;
RigidbodyPhysics.SphereImpostor = 1;
RigidbodyPhysics.BoxImpostor = 2;
RigidbodyPhysics.PlaneImpostor = 3;
RigidbodyPhysics.MeshImpostor = 4;
RigidbodyPhysics.CapsuleImpostor = 6;
RigidbodyPhysics.CylinderImpostor = 7;
RigidbodyPhysics.ParticleImpostor = 8;
RigidbodyPhysics.HeightmapImpostor = 9;
RigidbodyPhysics.ConvexHullImpostor = 10;
RigidbodyPhysics.CustomImpostor = 100;
RigidbodyPhysics.RopeImpostor = 101;
RigidbodyPhysics.ClothImpostor = 102;
RigidbodyPhysics.SoftbodyImpostor = 103;
export class PhyscisContainerData {
}
export class ShurikenParticles extends ScriptComponent {
    constructor(transform, scene, properties = {}, alias = "ShurikenParticles") {
        super(transform, scene, properties, alias);
    }
    awake() { }
    start() { }
    ready() { }
    update() { }
    late() { }
    step() { }
    fixed() { }
    after() { }
    destroy() { }
}
export class TerrainGenerator extends ScriptComponent {
    constructor(transform, scene, properties = {}, alias = "TerrainGenerator") {
        super(transform, scene, properties, alias);
    }
    awake() { }
    start() { }
    ready() { }
    update() { }
    late() { }
    step() { }
    fixed() { }
    after() { }
    destroy() { }
}
export class WebVideoPlayer extends ScriptComponent {
    getVideoMaterial() { return this.m_videoMaterial; }
    getVideoTexture() { return this.m_videoTexture; }
    getVideoElement() { return (this.m_videoTexture != null) ? this.m_videoTexture.video : null; }
    getVideoScreen() { return this.m_abstractMesh; }
    getVideoBlobUrl() { return this.videoBlobUrl; }
    constructor(transform, scene, properties = {}, alias = "WebVideoPlayer") {
        super(transform, scene, properties, alias);
        this.videoLoop = false;
        this.videoMuted = false;
        this.videoAlpha = false;
        this.videoFaded = false;
        this.videoPoster = null;
        this.videoInvert = true;
        this.videoSample = 3;
        this.videoVolume = 1.0;
        this.videoMipmaps = false;
        this.videoPlayback = 1.0;
        this.videoPlayOnAwake = true;
        this.videoPreloaderUrl = null;
        this.videoBlobUrl = null;
        this.videoPreload = false;
        this._initializedReadyInstance = false;
        this.onReadyObservable = new Observable();
        this.m_abstractMesh = null;
        this.m_videoTexture = null;
        this.m_videoMaterial = null;
        this.m_diffuseIntensity = 1.0;
    }
    awake() { this.awakeWebVideoPlayer(); }
    destroy() { this.destroyWebVideoPlayer(); }
    awakeWebVideoPlayer() {
        this.videoLoop = this.getProperty("looping", false);
        this.videoMuted = this.getProperty("muted", false);
        this.videoInvert = this.getProperty("inverty", true);
        this.videoSample = this.getProperty("sampling", 3);
        this.videoVolume = this.getProperty("volume", 1.0);
        this.videoMipmaps = this.getProperty("mipmaps", false);
        this.videoAlpha = this.getProperty("texturealpha", false);
        this.videoFaded = this.getProperty("diffusealpha", false);
        this.videoPlayback = this.getProperty("playbackspeed", 1.0);
        this.videoPlayOnAwake = this.getProperty("playonawake", true);
        this.videoPreload = this.getProperty("preload", this.videoPreload);
        this.m_diffuseIntensity = this.getProperty("intensity", 1.0);
        this.m_abstractMesh = this.getAbstractMesh();
        const setPoster = this.getProperty("poster");
        if (setPoster === true && this.m_abstractMesh != null && this.m_abstractMesh.material != null) {
            if (this.m_abstractMesh.material instanceof PBRMaterial) {
                if (this.m_abstractMesh.material.albedoTexture != null && this.m_abstractMesh.material.albedoTexture.url != null && this.m_abstractMesh.material.albedoTexture.url !== "") {
                    this.videoPoster = this.m_abstractMesh.material.albedoTexture.url.replace("data:", "");
                }
            }
            else if (this.m_abstractMesh.material instanceof StandardMaterial) {
                if (this.m_abstractMesh.material.diffuseTexture != null && this.m_abstractMesh.material.diffuseTexture.url != null && this.m_abstractMesh.material.diffuseTexture.url !== "") {
                    this.videoPoster = this.m_abstractMesh.material.diffuseTexture.url.replace("data:", "");
                }
            }
        }
        const videoUrl = this.getProperty("url", null);
        const videoSrc = this.getProperty("source", null);
        let playUrl = videoUrl;
        if (videoSrc != null && videoSrc.filename != null && videoSrc.filename !== "") {
            const rootUrl = SceneManager.GetRootUrl(this.scene);
            playUrl = (rootUrl + videoSrc.filename);
        }
        if (playUrl != null && playUrl !== "") {
            if (this.videoPreload === true) {
                this.videoPreloaderUrl = playUrl;
            }
            else {
                this.setDataSource(playUrl);
            }
        }
    }
    destroyWebVideoPlayer() {
        this.m_abstractMesh = null;
        if (this.m_videoTexture != null) {
            this.m_videoTexture.dispose();
            this.m_videoTexture = null;
        }
        if (this.m_videoMaterial != null) {
            this.m_videoMaterial.dispose();
            this.m_videoMaterial = null;
        }
        this.revokeVideoBlobUrl();
    }
    isReady() {
        return (this.getVideoElement() != null);
    }
    isPlaying() {
        let result = false;
        const video = this.getVideoElement();
        if (video != null) {
            result = (video.paused === false);
        }
        return result;
    }
    isPaused() {
        let result = false;
        const video = this.getVideoElement();
        if (video != null) {
            result = (video.paused === true);
        }
        return result;
    }
    async play() {
        await AudioSource.UnlockAudioEngine();
        this.internalPlay();
        return true;
    }
    internalPlay() {
        if (this._initializedReadyInstance === true) {
            this.checkedPlay();
        }
        else {
            this.onReadyObservable.addOnce(() => { this.checkedPlay(); });
        }
    }
    checkedPlay() {
        const video = this.getVideoElement();
        if (video != null) {
            video.play().then(() => {
                if (video.paused === true) {
                    this.checkedRePlay();
                }
            });
        }
    }
    checkedRePlay() {
        const video = this.getVideoElement();
        if (video != null) {
            video.play().then(() => { });
        }
    }
    pause() {
        let result = false;
        const video = this.getVideoElement();
        if (video != null) {
            video.pause();
            result = true;
        }
        return result;
    }
    mute() {
        let result = false;
        const video = this.getVideoElement();
        if (video != null) {
            video.muted = true;
            result = true;
        }
        return result;
    }
    unmute() {
        let result = false;
        const video = this.getVideoElement();
        if (video != null) {
            video.muted = false;
            result = true;
        }
        return result;
    }
    getVolume() {
        let result = 0;
        const video = this.getVideoElement();
        if (video != null) {
            result = video.volume;
        }
        return result;
    }
    setVolume(volume) {
        let result = false;
        const video = this.getVideoElement();
        if (video != null) {
            video.volume = volume;
            result = true;
        }
        return result;
    }
    setDataSource(source) {
        if (this.m_abstractMesh != null) {
            if (this.m_videoMaterial == null) {
                this.m_videoMaterial = new StandardMaterial(this.transform.name + ".VideoMat", this.scene);
                this.m_videoMaterial.roughness = 1;
                this.m_videoMaterial.diffuseColor = new Color3(1, 1, 1);
                this.m_videoMaterial.emissiveColor = new Color3(1, 1, 1);
                this.m_videoMaterial.useAlphaFromDiffuseTexture = this.videoFaded;
                this.m_abstractMesh.material = this.m_videoMaterial;
            }
            if (this.m_videoMaterial != null) {
                this.m_videoMaterial.diffuseTexture = null;
                if (this.m_videoTexture != null) {
                    this.m_videoTexture.dispose();
                    this.m_videoTexture = null;
                }
                this._initializedReadyInstance = false;
                this.m_videoTexture = new VideoTexture(this.transform.name + ".VideoTex", source, this.scene, this.videoMipmaps, this.videoInvert, this.videoSample, { autoUpdateTexture: true, poster: this.videoPoster });
                if (this.m_videoTexture != null) {
                    this.m_videoTexture.hasAlpha = this.videoAlpha;
                    if (this.m_videoTexture.video != null) {
                        this.m_videoTexture.video.loop = this.videoLoop;
                        this.m_videoTexture.video.muted = this.videoMuted;
                        this.m_videoTexture.video.volume = this.videoVolume;
                        this.m_videoTexture.video.playbackRate = this.videoPlayback;
                        this.m_videoTexture.video.addEventListener("loadeddata", () => {
                            this._initializedReadyInstance = true;
                            if (this.onReadyObservable && this.onReadyObservable.hasObservers()) {
                                this.onReadyObservable.notifyObservers(this.m_videoTexture);
                            }
                            if (this.videoPlayOnAwake === true) {
                                this.play();
                            }
                        });
                        this.m_videoTexture.video.load();
                    }
                }
                if (this.m_videoTexture != null) {
                    this.m_videoTexture.level = this.m_diffuseIntensity;
                    this.m_videoMaterial.diffuseTexture = this.m_videoTexture;
                }
            }
            else {
                Tools.Warn("No video mesh or material available for: " + this.transform.name);
            }
        }
    }
    revokeVideoBlobUrl() {
        if (this.videoBlobUrl != null) {
            URL.revokeObjectURL(this.videoBlobUrl);
            this.videoBlobUrl = null;
        }
    }
    addPreloaderTasks(assetsManager) {
        if (this.videoPreload === true) {
            const assetTask = assetsManager.addBinaryFileTask((this.transform.name + ".VideoTask"), this.videoPreloaderUrl);
            assetTask.onSuccess = (task) => {
                this.revokeVideoBlobUrl();
                this.videoBlobUrl = URL.createObjectURL(new Blob([task.data]));
                this.setDataSource(this.videoBlobUrl);
            };
            assetTask.onError = (task, message, exception) => { console.error(message, exception); };
        }
    }
}
SceneManager.RegisterClass("CustomShaderMaterial", CustomShaderMaterial);
SceneManager.RegisterClass("CustomShaderMaterialPlugin", CustomShaderMaterialPlugin);
SceneManager.RegisterClass("UniversalTerrainMaterial", UniversalTerrainMaterial);
SceneManager.RegisterClass("AnimationState", AnimationState);
SceneManager.RegisterClass("AudioSource", AudioSource);
SceneManager.RegisterClass("CharacterController", CharacterController);
SceneManager.RegisterClass("SimpleCharacterController", SimpleCharacterController);
SceneManager.RegisterClass("RecastCharacterController", RecastCharacterController);
SceneManager.RegisterClass("NavigationAgent", NavigationAgent);
SceneManager.RegisterClass("RigidbodyPhysics", RigidbodyPhysics);
SceneManager.RegisterClass("ShurikenParticles", ShurikenParticles);
SceneManager.RegisterClass("TerrainGenerator", TerrainGenerator);
SceneManager.RegisterClass("WebVideoPlayer", WebVideoPlayer);
