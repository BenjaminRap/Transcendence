import { AssetContainer, InstantiatedEntries } from '@babylonjs/core/assetContainer';
import { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { AbstractAssetTask, AssetsManager, BinaryFileAssetTask, ContainerAssetTask, ImageAssetTask, MeshAssetTask, TextFileAssetTask } from '@babylonjs/core/Misc/assetsManager';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { IShadowLight, ShadowLight } from '@babylonjs/core/Lights/shadowLight';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { ISceneLoaderPlugin, ISceneLoaderPluginAsync, ISceneLoaderProgressEvent } from '@babylonjs/core/Loading/sceneLoader';
import { Node as BabylonNode } from '@babylonjs/core/node';
import { Light } from '@babylonjs/core/Lights/light';
import { Matrix, Quaternion, Vector2, Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector';
import { IAgentParameters, ICrowd, INavMeshParameters, INavigationEnginePlugin, IObstacle } from '@babylonjs/core/Navigation';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { IAction } from '@babylonjs/core/Actions/action';
import { Engine } from '@babylonjs/core/Engines/engine';
import { DeepImmutable, Nullable } from '@babylonjs/core/types';
import { Animatable } from '@babylonjs/core/Animations/animatable';
import { Material } from '@babylonjs/core/Materials/material';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import { Animation } from '@babylonjs/core/Animations/animation';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { EasingFunction } from '@babylonjs/core/Animations/easing';
import { AnimationGroup, TargetedAnimation } from '@babylonjs/core/Animations/animationGroup';
import { Space } from '@babylonjs/core/Maths/math.axis';
import { EventState, Observable } from '@babylonjs/core/Misc/observable';
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine';
import { Skeleton } from '@babylonjs/core/Bones/skeleton';
import { IPhysicsEnabledObject, IRaycastQuery, PhysicsBody, PhysicsMotionType, PhysicsRaycastResult, PhysicsShape, PhysicsShapeBox, PhysicsShapeCapsule, PhysicsShapeConvexHull, PhysicsShapeCylinder, PhysicsShapeMesh, PhysicsShapeSphere, ShapeCastResult } from '@babylonjs/core/Physics';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0/glTFLoader';
import { IAnimation, IMaterial, IMesh, INode, IScene } from '@babylonjs/loaders/glTF/2.0/glTFLoaderInterfaces';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import { IGLTFLoaderExtension } from '@babylonjs/loaders/glTF/2.0/glTFLoaderExtension';
import { Bone } from '@babylonjs/core/Bones/bone';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { AbstractSpatialAudio, AudioEngineV2, IStaticSoundBufferOptions, IStaticSoundOptions, IStreamingSoundOptions, IWebAudioEngineOptions, StaticSound, StaticSoundBuffer, StreamingSound } from '@babylonjs/core/AudioV2';
import { IFileRequest } from '@babylonjs/core/Misc/fileRequest';
import { WebRequest } from '@babylonjs/core/Misc/webRequest';
import { Sound } from '@babylonjs/core/Audio/sound';
import { Gamepad } from '@babylonjs/core/Gamepads/gamepad';
import { GamepadManager } from '@babylonjs/core/Gamepads/gamepadManager';
import { VideoTexture } from '@babylonjs/core/Materials/Textures/videoTexture';
export declare class SceneManager {
    static get Version(): string;
    static get Copyright(): string;
    static GlobalOptions: any;
    static WindowState: any;
    static ServerEndPoint: string;
    static EnableDebugMode: boolean;
    static EnableUserInput: boolean;
    static RenderLoopReady: boolean;
    static PauseRenderLoop: boolean;
    static LostRenderContext: boolean;
    static AutoUpdateProgress: boolean;
    static PhysicsCapsuleShape: number;
    static SupportSRGBBuffers: boolean;
    static AnimationStartMode: number;
    static AnimationTargetFps: number;
    static DefaultConvexHullMargin: number;
    static DefaultHeightFieldMargin: number;
    static AmbientLightIntensity: number;
    static PointLightIntensity: number;
    static SpotLightIntensity: number;
    static DirectionalLightIntensity: number;
    static TerrainColorCorrection: number;
    static AllowCameraMovement: boolean;
    static AllowCameraRotation: boolean;
    static VirtualJoystickEnabled: boolean;
    static GameTimeMilliseconds: number;
    static ParseScriptComponents: boolean;
    static AutoLoadScriptBundles: boolean;
    static AutoStripNamespacePrefix: boolean;
    static UniversalModuleDefinition: boolean;
    static WaitForSeconds: (seconds: number) => Promise<void>;
    static OnPreRenderLoopObservable: Observable<void>;
    static OnPostRenderLoopObservable: Observable<void>;
    static OnSceneReadyObservable: Observable<string>;
    static OnEngineResizeObservable: Observable<AbstractEngine>;
    static OnLoadCompleteObservable: Observable<AbstractEngine>;
    static OnRebuildContextObservable: Observable<AbstractEngine>;
    static OnAssetManagerProgress: (event: ProgressEvent) => void;
    private static _HideLoadingScreen;
    static CVTOOLS_NAME: string;
    static CVTOOLS_MESH: string;
    static CVTOOLS_HAND: string;
    static CVTOOLS_NAME_REGISTERED: boolean;
    static CVTOOLS_MESH_REGISTERED: boolean;
    static CVTOOLS_HAND_REGISTERED: boolean;
    static GetEngine(scene: Scene): Engine | WebGPUEngine;
    static GetClass(name: string): any;
    static RegisterClass(name: string, klass: any): void;
    private static _EventBus;
    static get EventBus(): GlobalMessageBus;
    static get PlaygroundCdn(): string;
    static get PlaygroundRepo(): string;
    static InitializePlayground(engine: Engine | WebGPUEngine | AbstractEngine, options?: IRuntimeOptions): Promise<void>;
    static InitializeRuntime(engine: Engine | WebGPUEngine | AbstractEngine, options?: IRuntimeOptions): Promise<void>;
    static InitializeSceneLoaderPlugin(): void;
    static LoadRuntimeAssets(assetsManager: AssetsManager, requiredFilenames: string[], readyHandler: () => void, maxTimeout?: number, debugMode?: boolean): Promise<void>;
    static ShowLoadingScreen(engine: Engine | WebGPUEngine | AbstractEngine, hideLoadingUIWithEngine?: boolean, defaultLoadingUIMarginTop?: string): void;
    static HideLoadingScreen(engine: Engine | WebGPUEngine | AbstractEngine): void;
    static ForceHideLoadingScreen(): void;
    private static DoForceHideLoadingScreen;
    static FocusRenderCanvas(scene: Scene): void;
    private static SceneLoaderFileNames;
    private static SceneLoaderPropertyBag;
    private static SceneLoaderHandledFlag;
    static SetOnSceneReadyHandler(filenames: string[], handler: () => void, timeout?: number, debug?: boolean): void;
    private static SceneParsingEnabled;
    static EnableSceneParsing(enabled: boolean): void;
    static IsSceneParsingEnabled(): boolean;
    static HasSceneBeenPreLoaded(scene: Scene): boolean;
    static GetDefaultSkybox(scene: Scene): AbstractMesh;
    static GetIntensityFactor(): number;
    static GetRenderQuality(): RenderQuality;
    static SetRenderQuality(quality: RenderQuality): void;
    static GetEngineVersionString(scene: Scene): string;
    static SetWindowState(name: string, data: any): void;
    static GetWindowState<T>(name: string): T;
    static IsDebugMode(): boolean;
    static ConsoleLog(...data: any[]): void;
    static ConsoleInfo(...data: any[]): void;
    static ConsoleWarn(...data: any[]): void;
    static ConsoleError(...data: any[]): void;
    static LogMessage(message: string): void;
    static LogWarning(warning: string): void;
    static LogError(error: string): void;
    static GetTime(): number;
    static GetTimeMs(): number;
    static GetGameTime(): number;
    static GetGameTimeMs(): number;
    static GetDeltaTime(scene: Scene, applyAnimationRatio?: boolean): number;
    static GetDeltaSeconds(scene: Scene, applyAnimationRatio?: boolean): number;
    static GetDeltaMilliseconds(scene: Scene, applyAnimationRatio?: boolean): number;
    static GetTimeMilliseconds(): number;
    static GetAnimationRatio(scene: Scene): number;
    static RunOnce(scene: Scene, func: () => void, timeout?: number): void;
    static DisposeScene(scene: Scene, clearColor?: Color4): void;
    static SafeDestroy(transform: TransformNode, delay?: number, disable?: boolean): void;
    static GetRootUrl(scene: Scene): string;
    static SetRootUrl(scene: Scene, url: string): void;
    static GetSceneFile(scene: Scene): string;
    static SetSceneFile(scene: Scene, fileName: string): void;
    static GetEngineInstances(): AbstractEngine[];
    static GetLastCreatedEngine(): AbstractEngine;
    static GetLastCreatedScene(): Scene;
    static AddShadowCaster(light: ShadowLight, transform: TransformNode, children?: boolean): void;
    private static PhysicsViewersEnabled;
    static IsPhysicsViewerEnabled(): boolean;
    static TogglePhysicsViewer(scene: Scene): void;
    static GetImportMeshes(scene: Scene, name: string): AbstractMesh[];
    static GetImportMeshesMap(scene: Scene): Map<string, AbstractMesh[]>;
    static ClearImportMeshes(scene: Scene): void;
    static RegisterImportMeshes(scene: Scene, name: string, meshes: AbstractMesh[]): void;
    static LoadImportMeshes(meshNames: string | readonly string[] | null | undefined, rootUrl: string, sceneFilename?: string, scene?: Nullable<Scene>, onSuccess?: (container: AbstractMesh[]) => void, onProgress?: (event: ISceneLoaderProgressEvent) => void, onError?: (scene: Scene, message: string, exception?: any) => void, pluginExtension?: Nullable<string>, name?: string): Nullable<ISceneLoaderPlugin | ISceneLoaderPluginAsync>;
    static LoadImportMeshesAsync(meshNames: string | readonly string[] | null | undefined, rootUrl: string, sceneFilename?: string, scene?: Nullable<Scene>, onProgress?: (event: ISceneLoaderProgressEvent) => void, pluginExtension?: Nullable<string>, name?: string): Promise<AbstractMesh[]>;
    static GetAssetContainer(scene: Scene, name: string): AssetContainer;
    static GetAssetContainerMap(scene: Scene): Map<string, AssetContainer>;
    static ClearAssetContainers(scene: Scene): void;
    static RegisterAssetContainer(scene: Scene, name: string, container: AssetContainer): void;
    static LoadAssetContainer(rootUrl: string, sceneFilename?: string, scene?: Scene, onSuccess?: (container: AssetContainer) => void, onProgress?: (event: ISceneLoaderProgressEvent) => void, onError?: (scene: Scene, message: string, exception?: any) => void, pluginExtension?: Nullable<string>, name?: string): void;
    static LoadAssetContainerAsync(rootUrl: string, sceneFilename?: string, scene?: Nullable<Scene>, onProgress?: Nullable<(event: ISceneLoaderProgressEvent) => void>, pluginExtension?: Nullable<string>, name?: string): Promise<AssetContainer>;
    static GetMesh(scene: Scene, name: string): Mesh;
    static GetMeshByID(scene: Scene, id: string): Mesh;
    static GetAbstractMesh(scene: Scene, name: string): AbstractMesh;
    static GetAbstractMeshByID(scene: Scene, id: string): AbstractMesh;
    static GetTransformNode(scene: Scene, name: string): TransformNode;
    static GetTransformNodeByID(scene: Scene, id: string): TransformNode;
    static GetTransformDetailMesh(transform: TransformNode): AbstractMesh;
    static GetSkinnedMesh(transform: TransformNode): AbstractMesh;
    static GetPrimitiveMeshes(transform: TransformNode): AbstractMesh[];
    static GetTransformLayer(transform: TransformNode): number;
    static GetTransformLayerMask(transform: TransformNode): number;
    static GetTransformLayerName(transform: TransformNode): string;
    static GetTransformTag(transform: TransformNode): string;
    static HasTransformTags(transform: TransformNode, query: string): boolean;
    static TextureFloatSupported(scene: Scene): boolean;
    static RegisterClickAction(scene: Scene, mesh: AbstractMesh, func: () => void): IAction;
    static UnregisterClickAction(mesh: AbstractMesh, action: IAction): boolean;
    static StartTweenAnimation(scene: Scene, name: string, targetObject: any, targetProperty: string, startValue: number, endValue: number, defaultSpeedRatio?: number, defaultFrameRate?: number, defaultLoopMode?: number, defaultEasingFunction?: EasingFunction, onAnimationComplete?: () => void): Animatable;
    static GetMaterialWithName(scene: Scene, name: string): Material;
    static GetAllMaterialsWithName(scene: Scene, name: string): Material[];
    static InstantiatePrefabFromScene(scene: Scene, prefabName: string, newName: string, newParent?: Nullable<TransformNode>, newPosition?: Nullable<Vector3>, newRotation?: Nullable<Quaternion>, newScaling?: Nullable<Vector3>, cloneAnimations?: boolean): TransformNode;
    static InstantiatePrefabFromContainer(container: AssetContainer, prefabName: string, newName: string, newParent?: Nullable<TransformNode>, newPosition?: Nullable<Vector3>, newRotation?: Nullable<Quaternion>, newScaling?: Nullable<Vector3>, cloneAnimations?: boolean, makeNewMaterials?: boolean): TransformNode;
    static InstantiateModelsFromContainer(container: AssetContainer, nameFunction?: (sourceName: string) => string, createInstances?: boolean, cloneMaterials?: boolean, rebuildBoundingInfo?: boolean, filterPredicate?: any): TransformNode[];
    static CreateInstancedModelsFromContainer(container: AssetContainer, newName?: string, newParent?: Nullable<TransformNode>, newPosition?: Nullable<Vector3>, newRotation?: Nullable<Quaternion>, newScaling?: Nullable<Vector3>, cloneAnimations?: boolean, makeNewMaterials?: boolean, rebuildBoundingInfo?: boolean): InstantiatedEntries;
    static CloneTransformNode(container: AssetContainer, nodeName: string, newName: string, newParent?: Nullable<TransformNode>, newPosition?: Nullable<Vector3>, newRotation?: Nullable<Quaternion>, newScaling?: Nullable<Vector3>): TransformNode;
    static CloneAbstractMesh(container: AssetContainer, nodeName: string, newName: string, newParent?: Nullable<TransformNode>, newPosition?: Nullable<Vector3>, newRotation?: Nullable<Quaternion>, newScaling?: Nullable<Vector3>): AbstractMesh;
    static CreateInstancedMesh(container: AssetContainer, meshName: string, newName: string, newParent?: Nullable<TransformNode>, newPosition?: Nullable<Vector3>, newRotation?: Nullable<Quaternion>, newScaling?: Nullable<Vector3>): InstancedMesh;
    static RebuildBoundingBoxInfo(transforms: TransformNode[]): void;
    static AttachScriptComponent(instance: ScriptComponent, alias: string, validate?: boolean): void;
    static DestroyScriptComponent(instance: ScriptComponent): void;
    static DestroyGameObject(transform: TransformNode): void;
    static GetComponent<T extends ScriptComponent>(transform: TransformNode, klass: string, recursive?: boolean): T;
    static GetComponents<T extends ScriptComponent>(transform: TransformNode, recursive?: boolean): T[];
    static FindGameObject(scene: Scene, path: string): TransformNode;
    static FindGameObjectWithTag(scene: Scene, tag: string): TransformNode;
    static FindGameObjectsWithTag(scene: Scene, tag: string): TransformNode[];
    static FindScriptComponents<T extends ScriptComponent>(transform: TransformNode, recursive?: boolean): T[];
    static FindScriptComponent<T extends ScriptComponent>(transform: TransformNode, klass: string, recursive?: boolean): T;
    static FindAllScriptComponents<T extends ScriptComponent>(transform: TransformNode, klass: string, recursive?: boolean): T[];
    static FindSceneMetadata(transform: TransformNode): any;
    static FindSceneCameraRig(transform: TransformNode): FreeCamera;
    static FindSceneLightRig(transform: TransformNode): Light;
    static FindTransformWithScript(scene: Scene, klass: string): TransformNode;
    static FindAllTransformsWithScript(scene: Scene, klass: string): TransformNode[];
    static FindChildTransformNode(parent: TransformNode, name: string, searchType?: SearchType, directDecendantsOnly?: boolean, predicate?: (node: BabylonNode) => boolean): TransformNode;
    static FindChildTransformWithTags(parent: TransformNode, query: string, directDecendantsOnly?: boolean, predicate?: (node: BabylonNode) => boolean): TransformNode;
    static FindAllChildTransformsWithTags(parent: TransformNode, query: string, directDecendantsOnly?: boolean, predicate?: (node: BabylonNode) => boolean): TransformNode[];
    static FindChildTransformWithScript(parent: TransformNode, klass: string, directDecendantsOnly?: boolean, predicate?: (node: BabylonNode) => boolean): TransformNode;
    static FindAllChildTransformsWithScript(parent: TransformNode, klass: string, directDecendantsOnly?: boolean, predicate?: (node: BabylonNode) => boolean): TransformNode[];
    static FindComponentInParent<T extends ScriptComponent>(scene: Scene, transform: TransformNode, klass: string): T;
    static FindComponentsInParent<T extends ScriptComponent>(scene: Scene, transform: TransformNode, klass: string): T[];
    static FindComponentInChildren<T extends ScriptComponent>(scene: Scene, transform: TransformNode, klass: string): T;
    static FindComponentsInChildren<T extends ScriptComponent>(scene: Scene, transform: TransformNode, klass: string): T[];
    static SearchForScriptComponentByName<T extends ScriptComponent>(scene: Scene, klass: string): T;
    static SearchForAllScriptComponentsByName<T extends ScriptComponent>(scene: Scene, klass: string): T[];
    static MoveWithCollisions(entity: AbstractMesh, velocity: Vector3): void;
    static MoveWithTranslation(entity: TransformNode, velocity: Vector3): void;
    static TurnWithRotation(entity: TransformNode, radians: number, space?: Space): void;
    static MAX_AGENT_COUNT: number;
    static MAX_AGENT_RADIUS: number;
    private static NavigationMesh;
    private static CrowdInterface;
    private static PluginInstance;
    static OnNavMeshReadyObservable: Observable<Mesh>;
    static GetRecastHeapSize(): number;
    static GetNavigationTools(): RecastJSPluginExtension;
    static GetCrowdInterface(scene: Scene): ICrowd;
    static HasNavigationData(): boolean;
    static GetNavigationMesh(): Mesh;
    static BakeNavigationMesh(scene: Scene, meshes: Mesh[], properties: INavMeshParameters, debug?: boolean, color?: Color3, collisionMesh?: boolean, debugMeshOffset?: number): number;
    static LoadNavigationMesh(scene: Scene, data: Uint8Array, debug?: boolean, color?: Color3, timeSteps?: number, collisionMesh?: boolean, debugMeshOffset?: number): number;
    static SaveNavigationMesh(): Uint8Array;
    static ComputeNavigationPath(start: Vector3, end: Vector3, closetPoint?: boolean): Vector3[];
    static MoveAlongNavigationPath(scene: Scene, agent: TransformNode, path: Vector3[], speed?: number, easing?: EasingFunction, callback?: () => void): Animation;
    static AddNavigationCylinderObstacle(position: Vector3, radius: number, height: number): IObstacle;
    static AddNavigationBoxObstacle(position: Vector3, extent: Vector3, angle: number): IObstacle;
    static RemoveNavigationObstacle(obstacle: IObstacle): void;
    static ToggleFullscreenMode(scene: Scene, requestPointerLock?: boolean): void;
    static EnterFullscreenMode(scene: Scene, requestPointerLock?: boolean): void;
    static ExitFullscreenMode(scene: Scene): void;
    private static GotoFullscreenBrowser;
    private static RequestBrowserPointerLock;
    private static ExitFromFullscreenBrowser;
}
export declare abstract class ScriptComponent {
    private _update;
    private _late;
    private _step;
    private _fixed;
    private _after;
    private _ready;
    private _lateUpdate;
    private _properties;
    private _awoken;
    private _started;
    private _scene;
    private _delyed;
    private _transform;
    private _scriptReady;
    private _registeredClassname;
    private _registerComponentAlias;
    private _lateUpdateObserver;
    resetScriptComponent: () => void;
    isReady(): boolean;
    get scene(): Scene;
    get transform(): TransformNode;
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    dispose(): void;
    getClassName(): string;
    protected setProperty(name: string, propertyValue: any): void;
    protected getProperty<T>(name: string, defaultValue?: T): T;
    getTime(): number;
    getTimeMs(): number;
    getGameTime(): number;
    getGameTimeMs(): number;
    getDeltaTime(): number;
    getDeltaSeconds(): number;
    getDeltaMilliseconds(): number;
    getAnimationRatio(): number;
    hasSkinnedMesh(): boolean;
    getSkinnedMesh(): AbstractMesh;
    getTransformMesh(): Mesh;
    getAbstractMesh(): AbstractMesh;
    getInstancedMesh(): InstancedMesh;
    getPrimitiveMeshes(): AbstractMesh[];
    getMetadata(): any;
    getComponent<T extends ScriptComponent>(klass: string, recursive?: boolean): T;
    getComponents<T extends ScriptComponent>(klass: string, recursive?: boolean): T[];
    getLightRig(): Light;
    getCameraRig(): FreeCamera;
    getTransformTag(): string;
    hasTransformTags(query: string): boolean;
    getChildNode(name: string, searchType?: SearchType, directDecendantsOnly?: boolean, predicate?: (node: BabylonNode) => boolean): TransformNode;
    getChildWithTags(query: string, directDecendantsOnly?: boolean, predicate?: (node: BabylonNode) => boolean): TransformNode;
    getChildrenWithTags(query: string, directDecendantsOnly?: boolean, predicate?: (node: BabylonNode) => boolean): TransformNode[];
    getChildWithScript(klass: string, directDecendantsOnly?: boolean, predicate?: (node: BabylonNode) => boolean): TransformNode;
    getChildrenWithScript(klass: string, directDecendantsOnly?: boolean, predicate?: (node: BabylonNode) => boolean): TransformNode[];
    private _bodyCollisionObserver;
    private _bodyCollisionEndedObserver;
    private _worldTriggerEventObserver;
    enableCollisionEvents(): void;
    disableCollisionEvents(): void;
    onCollisionEnterObservable: Observable<TransformNode>;
    onCollisionStayObservable: Observable<TransformNode>;
    onCollisionExitObservable: Observable<TransformNode>;
    onTriggerEnterObservable: Observable<TransformNode>;
    onTriggerExitObservable: Observable<TransformNode>;
    setTransformPosition(position: Vector3): void;
    setTransformRotation(rotation: Quaternion): void;
    registerOnClickAction(func: () => void): IAction;
    unregisterOnClickAction(action: IAction): boolean;
    private registerComponentInstance;
    private delayComponentInstance;
    private destroyComponentInstance;
    private setupStepComponentInstance;
    private removeStepComponentInstance;
    private setupFixedComponentInstance;
    private removeFixedComponentInstance;
    private static RegisterInstance;
    private static UpdateInstance;
    private static LateInstance;
    private static AfterInstance;
    private static StepInstance;
    private static FixedInstance;
    private static ReadyInstance;
    private static ResetInstance;
    private static DestroyInstance;
    private static ParseAutoProperties;
    private static UnpackObjectProperty;
}
export declare enum System {
    Deg2Rad,
    Rad2Deg,
    Epsilon = 0.000001,
    SingleEpsilon = 1.401298e-45,
    EpsilonNormalSqrt = 1e-15,
    Kph2Mph = 0.621371,
    Mph2Kph = 1.60934,
    Mps2Kph = 3.6,
    Mps2Mph = 2.23694,
    Meter2Inch = 39.3701,
    Inch2Meter = 0.0254,
    Gravity = 9.81,
    Gravity3G = 29.400000000000002,
    SkidFactor = 0.25,
    MaxInteger = 2147483647,
    WalkingVelocity = 4.4,
    TerminalVelocity = 55,
    SmoothDeltaFactor = 0.2,
    ToLinearSpace = 2.2,
    ToGammaSpace = 0.45454545454545453
}
export declare enum SearchType {
    ExactMatch = 0,
    StartsWith = 1,
    EndsWith = 2,
    IndexOf = 3
}
export declare enum PlayerNumber {
    Auto = 0,
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4
}
export declare enum RenderQuality {
    High = 0,
    Medium = 1,
    Low = 2
}
export declare enum GamepadType {
    None = -1,
    Generic = 0,
    Xbox360 = 1,
    DualShock = 2,
    PoseController = 3
}
export declare enum UserInputAxis {
    Horizontal = 0,
    Vertical = 1,
    ClientX = 2,
    ClientY = 3,
    MouseX = 4,
    MouseY = 5,
    Wheel = 6
}
export declare enum UserInputKey {
    BackSpace = 8,
    Tab = 9,
    Enter = 13,
    Shift = 16,
    Ctrl = 17,
    Alt = 18,
    Pause = 19,
    Break = 19,
    CapsLock = 20,
    Escape = 27,
    SpaceBar = 32,
    PageUp = 33,
    PageDown = 34,
    End = 35,
    Home = 36,
    LeftArrow = 37,
    UpArrow = 38,
    RightArrow = 39,
    DownArrow = 40,
    Insert = 45,
    Delete = 46,
    Num0 = 48,
    Num1 = 49,
    Num2 = 50,
    Num3 = 51,
    Num4 = 52,
    Num5 = 53,
    Num6 = 54,
    Num7 = 55,
    Num8 = 56,
    Num9 = 57,
    A = 65,
    B = 66,
    C = 67,
    D = 68,
    E = 69,
    F = 70,
    G = 71,
    H = 72,
    I = 73,
    J = 74,
    K = 75,
    L = 76,
    M = 77,
    N = 78,
    O = 79,
    P = 80,
    Q = 81,
    R = 82,
    S = 83,
    T = 84,
    U = 85,
    V = 86,
    W = 87,
    X = 88,
    Y = 89,
    Z = 90,
    LeftWindowKey = 91,
    RightWindowKey = 92,
    SelectKey = 93,
    Numpad0 = 96,
    Numpad1 = 97,
    Numpad2 = 98,
    Numpad3 = 99,
    Numpad4 = 100,
    Numpad5 = 101,
    Numpad6 = 102,
    Numpad7 = 103,
    Numpad8 = 104,
    Numpad9 = 105,
    Multiply = 106,
    Add = 107,
    Subtract = 109,
    DecimalPoint = 110,
    Divide = 111,
    F1 = 112,
    F2 = 113,
    F3 = 114,
    F4 = 115,
    F5 = 116,
    F6 = 117,
    F7 = 118,
    F8 = 119,
    F9 = 120,
    F10 = 121,
    F11 = 122,
    F12 = 123,
    NumLock = 144,
    ScrollLock = 145,
    SemiColon = 186,
    EqualSign = 187,
    Comma = 188,
    Dash = 189,
    Period = 190,
    ForwardSlash = 191,
    GraveAccent = 192,
    OpenBracket = 219,
    BackSlash = 220,
    CloseBraket = 221,
    SingleQuote = 222
}
export interface UserInputPress {
    index: number;
    action: () => void;
}
export type UserInputAction = (index: number) => void;
export declare class UserInputOptions {
    static KeyboardSmoothing: boolean;
    static KeyboardMoveSensibility: number;
    static KeyboardArrowSensibility: number;
    static KeyboardMoveDeadZone: number;
    static GamepadDeadStickValue: number;
    static GamepadLStickXInverted: boolean;
    static GamepadLStickYInverted: boolean;
    static GamepadRStickXInverted: boolean;
    static GamepadRStickYInverted: boolean;
    static GamepadLStickSensibility: number;
    static GamepadRStickSensibility: number;
    static SupportedInputDevices: any[];
    static BabylonAngularSensibility: number;
    static DefaultAngularSensibility: number;
    static PointerWheelDeadZone: number;
    static PointerMouseDeadZone: number;
    static PointerMouseInverted: boolean;
    static UseCanvasElement: boolean;
    static UseArrowKeyRotation: boolean;
    static EnableBabylonRotation: boolean;
}
export interface IRuntimeOptions {
    hardwareScalingLevel?: number;
    initSceneFileLoaders?: boolean;
    loadAsyncRuntimeLibs?: boolean;
    loadProjectScriptBundle?: boolean;
    projectScriptBundleUrl?: string;
    showDefaultLoadingScreen?: boolean;
    hideLoadingUIWithEngine?: boolean;
    defaultLoadingUIMarginTop?: string;
}
export interface IAssetPreloader {
    addPreloaderTasks(assetsManager: PreloadAssetsManager): void;
}
export interface IWindowMessage {
    source: string;
    command: string;
    [key: string]: any;
}
export interface IUnityTransform {
    type: string;
    id: string;
    tag: string;
    name: string;
    layer: number;
}
export interface IUnityCurve {
    type: string;
    length: number;
    prewrapmode: string;
    postwrapmode: string;
    animation: any;
}
export interface IUnityMaterial {
    type: string;
    id: string;
    name: string;
    shader: string;
    gltf: number;
}
export interface IUnityTexture {
    type: string;
    name: string;
    width: number;
    height: number;
    filename: string;
    wrapmode: string;
    filtermode: string;
    anisolevel: number;
}
export interface IUnityCubemap {
    type: string;
    name: string;
    info: any;
    width: number;
    height: number;
    filename: string;
    extension: string;
    wrapmode: string;
    filtermode: string;
    anisolevel: number;
    texelsizex: number;
    texelsizey: number;
    dimension: number;
    format: number;
    mipmapbias: number;
    mipmapcount: number;
}
export interface IUnityAudioClip {
    type: string;
    name: string;
    filename: string;
    length: number;
    channels: number;
    frequency: number;
    samples: number;
}
export interface IUnityVideoClip {
    type: string;
    name: string;
    filename: string;
    length: number;
    width: number;
    height: number;
    framerate: number;
    framecount: number;
    audiotracks: number;
}
export interface IUnityFontAsset {
    type: string;
    filename: string;
    format: string;
}
export interface IUnityTextAsset {
    type: string;
    filename: string;
    base64: string;
    json: boolean;
}
export interface IUnityDefaultAsset {
    type: string;
    filename: string;
    base64: string;
    json: boolean;
}
export interface IUnityVector2 {
    x: number;
    y: number;
}
export interface IUnityVector3 {
    x: number;
    y: number;
    z: number;
}
export interface IUnityVector4 {
    x: number;
    y: number;
    z: number;
    w: number;
}
export interface IUnityColor {
    r: number;
    g: number;
    b: number;
    a: number;
}
export declare class RequestHeader {
    name: string;
    value: string;
}
export declare class GlobalMessageBus {
    constructor();
    OnMessage<T>(message: string, handler: (data: T) => void): void;
    PostMessage(message: string, data?: any, target?: string, transfer?: Transferable[] | undefined): void;
    RemoveHandler(message: string, handler: (data: any) => void): void;
    ResetHandlers(): void;
    Dispose(): void;
    private HandleWindowMessage;
    private OnDispatchMessage;
    private ListenerDictionary;
}
export declare class PreloadAssetsManager extends AssetsManager {
    addContainerTask(taskName: string, meshesNames: any, rootUrl: string, sceneFilename: string): ContainerAssetTask;
    addMeshTask(taskName: string, meshesNames: any, rootUrl: string, sceneFilename: string): MeshAssetTask;
    addTextFileTask(taskName: string, url: string): TextFileAssetTask;
    addBinaryFileTask(taskName: string, url: string): BinaryFileAssetTask;
    addImageTask(taskName: string, url: string): ImageAssetTask;
    private handlePreloadingProgress;
}
export declare enum MaterialAlphaMode {
    OPAQUE = "OPAQUE",
    MASK = "MASK",
    BLEND = "BLEND"
}
export declare class CubeTextureLoader {
    name: string;
    mapkey: string;
    material: Material;
    extension: string;
    prefiltered: boolean;
    boundingBoxSize: Vector3;
    boundingBoxPosition: Vector3;
}
export declare class CVTOOLS_unity_metadata implements IGLTFLoaderExtension {
    readonly name: string;
    enabled: boolean;
    private _webgpu;
    private _loader;
    private _babylonScene;
    private _metadataParser;
    private _loaderScene;
    private _assetsManager;
    private _parserList;
    private _masterList;
    private _detailList;
    private _shaderList;
    private _readyList;
    private _preloadList;
    private _animationGroups;
    private _materialMap;
    private _lightmapMap;
    private _reflectionMap;
    private _reflectionCache;
    private _assetContainer;
    private _activeMeshes;
    private _parseScene;
    private _leftHanded;
    private _disposeRoot;
    private _sceneParsed;
    private _preWarmTime;
    private _hideLoader;
    private _rootUrl;
    private _fileName;
    private _licenseName;
    private _licenseType;
    private static ScriptBundleCache;
    constructor(loader: GLTFLoader);
    dispose(): void;
    onLoading(): void;
    onReady(): void;
    onComplete(): void;
    getScriptBundleTag(): string;
    getScriptBundleUrl(): string;
    finishComplete(): void;
    onValidate(): void;
    onCleanup(): void;
    setupLoader(): void;
    startParsing(): void;
    loadSceneAsync(context: string, scene: IScene): Nullable<Promise<void>>;
    private loadSceneExAsync;
    private _processActiveMeshes;
    private _processUnityMeshes;
    private _processPreloadTimeout;
    loadNodeAsync(context: string, node: INode, assign: (babylonMesh: TransformNode) => void): Nullable<Promise<TransformNode>>;
    loadMaterialPropertiesAsync(context: string, material: IMaterial, babylonMaterial: Material): Nullable<Promise<void>>;
    private _getCachedMaterialByIndex;
    private _getCachedLightmapByIndex;
    createMaterial(context: string, material: IMaterial, babylonDrawMode: number): Nullable<Material>;
    loadAnimationAsync(context: string, animation: IAnimation): Promise<AnimationGroup>;
    _loadMeshPrimitiveAsync(context: string, name: string, node: INode, mesh: IMesh, primitive: any, assign: (babylonMesh: AbstractMesh) => void): Promise<AbstractMesh>;
    private _setupBabylonMesh;
    private _setupBabylonMaterials;
    private _processLevelOfDetail;
    private _processShaderMaterials;
    private preProcessSceneProperties;
    private postProcessSceneProperties;
    private _preloadRawMaterialsAsync;
    private _parseMultiMaterialAsync;
    private _parseNodeMaterialPropertiesAsync;
    private _parseShaderMaterialPropertiesAsync;
    private _parseDiffuseMaterialPropertiesAsync;
    private _parseCommonConstantProperties;
}
export declare class CVTOOLS_babylon_mesh implements IGLTFLoaderExtension {
    readonly name: string;
    enabled: boolean;
    private _loader;
    constructor(loader: GLTFLoader);
    dispose(): void;
}
export declare class CVTOOLS_left_handed implements IGLTFLoaderExtension {
    readonly name: string;
    enabled: boolean;
    private _loader;
    constructor(loader: GLTFLoader);
    dispose(): void;
}
export declare class MetadataParser {
    private _physicList;
    private _shadowList;
    private _freezeList;
    private _scriptList;
    private _babylonScene;
    constructor(scene: Scene);
    parseSceneComponents(entity: TransformNode): void;
    postProcessSceneComponents(preloadList: Array<ScriptComponent>, readyList: Array<ScriptComponent>): void;
    private static DoParseSceneComponents;
    private static DoProcessPendingScripts;
    private static DoProcessPendingShadows;
    private static DoProcessPendingPhysics;
    private static DoProcessPendingFreezes;
    private static SetupCameraComponent;
    private static SetupLightComponent;
}
export declare class RecastJSPluginExtension implements INavigationEnginePlugin {
    bjsRECAST: any;
    name: string;
    navMesh: any;
    navMeshes: any[];
    private _maximumSubStepCount;
    private _timeStep;
    private _timeFactor;
    private _tempVec1;
    private _tempVec2;
    private _worker;
    constructor(recastInjection?: any);
    setWorkerURL(workerURL: string | URL): boolean;
    setTimeStep(newTimeStep?: number): void;
    getTimeStep(): number;
    setMaximumSubStepCount(newStepCount?: number): void;
    getMaximumSubStepCount(): number;
    set timeFactor(value: number);
    get timeFactor(): number;
    setActiveNavMesh(index: number): boolean;
    getActiveNavMesh(): any;
    getIndexedNavMesh(index: number): any;
    getNavMeshCount(): number;
    getNavMeshArray(): any[];
    createNavMesh(meshes: Array<Mesh>, parameters: INavMeshParameters, completion?: (navmeshData: Uint8Array) => void): number;
    createDebugNavMesh(scene: Scene): Mesh;
    getClosestPoint(position: Vector3): Vector3;
    getClosestPointToRef(position: Vector3, result: Vector3): void;
    getRandomPointAround(position: Vector3, maxRadius: number): Vector3;
    getRandomPointAroundToRef(position: Vector3, maxRadius: number, result: Vector3): void;
    moveAlong(position: Vector3, destination: Vector3): Vector3;
    moveAlongToRef(position: Vector3, destination: Vector3, result: Vector3): void;
    private _convertNavPathPoints;
    computePath(start: Vector3, end: Vector3): Vector3[];
    computePathSmooth(start: Vector3, end: Vector3): Vector3[];
    createCrowd(maxAgents: number, maxAgentRadius: number, scene: Scene): ICrowd;
    setDefaultQueryExtent(extent: Vector3): void;
    getDefaultQueryExtent(): Vector3;
    buildFromNavmeshData(data: Uint8Array): number;
    getNavmeshData(): Uint8Array;
    getDefaultQueryExtentToRef(result: Vector3): void;
    dispose(): void;
    addCylinderObstacle(position: Vector3, radius: number, height: number): IObstacle;
    addBoxObstacle(position: Vector3, extent: Vector3, angle: number): IObstacle;
    removeObstacle(obstacle: IObstacle): void;
    isSupported(): boolean;
    getRandomSeed(): number;
    setRandomSeed(seed: number): void;
}
export declare class RecastJSCrowdExtension implements ICrowd {
    bjsRECASTPlugin: RecastJSPluginExtension;
    recastCrowd: any;
    transforms: TransformNode[];
    agents: number[];
    reachRadii: number[];
    private _agentDestinationArmed;
    private _agentDestination;
    private _scene;
    private _onBeforeAnimationsObserver;
    onReachTargetObservable: Observable<{
        agentIndex: number;
        destination: Vector3;
    }>;
    constructor(plugin: RecastJSPluginExtension, maxAgents: number, maxAgentRadius: number, scene: Scene);
    addAgent(pos: Vector3, parameters: IAgentParameters, transform: TransformNode): number;
    getAgentPosition(index: number): Vector3;
    getAgentPositionToRef(index: number, result: Vector3): void;
    getAgentVelocity(index: number): Vector3;
    getAgentVelocityToRef(index: number, result: Vector3): void;
    getAgentNextTargetPath(index: number): Vector3;
    getAgentNextTargetPathToRef(index: number, result: Vector3): void;
    getAgentState(index: number): number;
    overOffmeshConnection(index: number): boolean;
    agentGoto(index: number, destination: Vector3): void;
    agentTeleport(index: number, destination: Vector3): void;
    updateAgentParameters(index: number, parameters: IAgentParameters): void;
    removeAgent(index: number): void;
    getAgents(): number[];
    update(deltaTime: number): void;
    setDefaultQueryExtent(extent: Vector3): void;
    getDefaultQueryExtent(): Vector3;
    getDefaultQueryExtentToRef(result: Vector3): void;
    getCorners(index: number): Vector3[];
    dispose(): void;
}
export declare class Utilities {
    private static UpVector;
    private static AuxVector;
    private static ZeroVector;
    private static TempMatrix;
    private static TempMatrix2;
    private static TempVector2;
    private static TempVector3;
    private static TempQuaternion;
    private static TempQuaternion2;
    private static TempQuaternion3;
    private static TempDirectionBuffer;
    private static LoadingState;
    static ZeroPad(num: number, places: number): string;
    static ShiftArray(arr: any[], reverse: boolean): any[];
    static OnPreloaderProgress: (remainingCount: number, totalCount: number, lastFinishedTask: AbstractAssetTask) => void;
    static OnPreloaderComplete: (tasks: AbstractAssetTask[]) => void;
    static GetLayerMask(layer: number): number;
    static IsLayerMasked(mask: number, layer: number): boolean;
    static GetHavokPlugin(): HavokPlugin;
    static GetLoadingState(): number;
    static GetRandomRange(min: number, max: number, last?: Nullable<number>, retries?: Nullable<number>): number;
    static GetRandomFloat(min: number, max: number, last?: Nullable<number>, retries?: Nullable<number>): number;
    static GetRandomInteger(min: number, max: number, last?: Nullable<number>, retries?: Nullable<number>): number;
    static Approximately(a: number, b: number): boolean;
    static GetVertexDataFromMesh(mesh: Mesh): VertexData;
    static CalculateDestinationPoint(origin: Vector3, direction: Vector3, length: number): Vector3;
    static CalculateDestinationPointToRef(origin: Vector3, direction: Vector3, length: number, result: Vector3): void;
    static UpdateAbstractMeshMaterial(mesh: AbstractMesh, material: Material, materialIndex: number): void;
    static HermiteVector3(value1: DeepImmutable<Vector3>, tangent1: DeepImmutable<Vector3>, value2: DeepImmutable<Vector3>, tangent2: DeepImmutable<Vector3>, amount: number): Vector3;
    static HermiteVector3ToRef(value1: DeepImmutable<Vector3>, tangent1: DeepImmutable<Vector3>, value2: DeepImmutable<Vector3>, tangent2: DeepImmutable<Vector3>, amount: number, result: Vector3): void;
    static LerpLog(a: number, b: number, t: number): number;
    static LerpExp(a: number, b: number, t: number): number;
    static LerpUnclamped(a: number, b: number, t: number): number;
    static LerpUnclampedColor3(a: Color3, b: Color3, t: number): Color3;
    static LerpUnclampedColor3ToRef(a: Color3, b: Color3, t: number, result: Color3): void;
    static LerpUnclampedColor4(a: Color4, b: Color4, t: number): Color4;
    static LerpUnclampedColor4ToRef(a: Color4, b: Color4, t: number, result: Color4): void;
    static LerpUnclampedVector2(a: Vector2, b: Vector2, t: number): Vector2;
    static LerpUnclampedVector2ToRef(a: Vector2, b: Vector2, t: number, result: Vector2): void;
    static LerpUnclampedVector3(a: Vector3, b: Vector3, t: number): Vector3;
    static LerpUnclampedVector3ToRef(a: Vector3, b: Vector3, t: number, result: Vector3): void;
    static LerpUnclampedVector4(a: Vector4, b: Vector4, t: number): Vector4;
    static LerpUnclampedVector4ToRef(a: Vector4, b: Vector4, t: number, result: Vector4): void;
    static IsEqualUsingDot(dot: number): boolean;
    static QuaternionAngle(a: Quaternion, b: Quaternion): number;
    static QuaternionLengthSquared(quat: Quaternion): number;
    static QuaternionRotateTowards(from: Quaternion, to: Quaternion, maxDegreesDelta: number): Quaternion;
    static QuaternionRotateTowardsToRef(from: Quaternion, to: Quaternion, maxDegreesDelta: number, result: Quaternion): void;
    static QuaternionSlerpUnclamped(from: Quaternion, to: Quaternion, t: number): Quaternion;
    static QuaternionSlerpUnclampedToRef(a: Quaternion, b: Quaternion, t: number, result: Quaternion): void;
    static MoveTowardsVector2(current: Vector2, target: Vector2, maxDistanceDelta: number): Vector2;
    static MoveTowardsVector2ToRef(current: Vector2, target: Vector2, maxDistanceDelta: number, result: Vector2): void;
    static MoveTowardsVector3(current: Vector3, target: Vector3, maxDistanceDelta: number): Vector3;
    static MoveTowardsVector3ToRef(current: Vector3, target: Vector3, maxDistanceDelta: number, result: Vector3): void;
    static MoveTowardsVector4(current: Vector4, target: Vector4, maxDistanceDelta: number): Vector4;
    static MoveTowardsVector4ToRef(current: Vector4, target: Vector4, maxDistanceDelta: number, result: Vector4): void;
    static ClampMagnitudeVector2(vector: Vector2, length: number): Vector2;
    static ClampMagnitudeVector2ToRef(vector: Vector2, length: number, result: Vector2): void;
    static ClampMagnitudeVector3(vector: Vector3, length: number): Vector3;
    static ClampMagnitudeVector3ToRef(vector: Vector3, length: number, result: Vector3): void;
    static GetAngle(from: Vector3, to: Vector3): number;
    static GetAngleRadians(from: Vector3, to: Vector3): number;
    static ClampAngle(angle: number, min: number, max: number): number;
    static ClampAngle180(angle: number, min: number, max: number): number;
    static ClampAngle360(angle: number, min: number, max: number): number;
    static SmoothDamp(current: number, target: number, smoothTime: number, maxSpeed: number, deltaTime: number, currentVelocity: Vector2): number;
    static SmoothDampAngle(current: number, target: number, smoothTime: number, maxSpeed: number, deltaTime: number, currentVelocity: Vector2): number;
    static SmoothDampVector2(current: Vector2, target: Vector2, smoothTime: number, maxSpeed: number, deltaTime: number, currentVelocity: Vector2): Vector2;
    static SmoothDampVector2ToRef(current: Vector2, target: Vector2, smoothTime: number, maxSpeed: number, deltaTime: number, currentVelocity: Vector2, result: Vector2): void;
    static SmoothDampVector3(current: Vector3, target: Vector3, smoothTime: number, maxSpeed: number, deltaTime: number, currentVelocity: Vector3): Vector3;
    static SmoothDampVector3ToRef(current: Vector3, target: Vector3, smoothTime: number, maxSpeed: number, deltaTime: number, currentVelocity: Vector3, result: Vector3): void;
    static ToMatrix(x: number, y: number, z: number): Matrix;
    static ToMatrixToRef(x: number, y: number, z: number, result: Matrix): void;
    static FastMatrixLerp(startValue: Matrix, endValue: Matrix, gradient: number, result: Matrix): void;
    static FastMatrixSlerp(startValue: Matrix, endValue: Matrix, gradient: number, result: Matrix): void;
    static ToEuler(quaternion: Quaternion): Vector3;
    static ToEulerToRef(quaternion: Quaternion, result: Vector3): void;
    static FromEuler(x: number, y: number, z: number): Quaternion;
    static FromEulerToRef(x: number, y: number, z: number, result: Quaternion): void;
    static QuaternionDiff(a: Quaternion, b: Quaternion): Quaternion;
    static QuaternionDiffToRef(a: Quaternion, b: Quaternion, result: Quaternion): void;
    static QuaternionSubtractToRef(source: Quaternion, other: Quaternion, result: Quaternion): void;
    static RotateVector(vec: Vector3, quat: Quaternion): Vector3;
    static RotateVectorToRef(vec: Vector3, quat: Quaternion, result: Vector3): void;
    static LookRotation(direction: Vector3): Quaternion;
    static LookRotationToRef(direction: Vector3, result: Quaternion): void;
    static Vector3Rad2Deg(vector: Vector3): Vector3;
    static Vector3Rad2DegToRef(vector: Vector3, result: Vector3): void;
    static MultiplyQuaternionByVector(rotation: Quaternion, point: Vector3): Vector3;
    static MultiplyQuaternionByVectorToRef(rotation: Quaternion, point: Vector3, result: Vector3): void;
    static ValidateTransformRotation(transform: TransformNode): void;
    static ValidateTransformQuaternion(transform: TransformNode): void;
    static GetKeyboardInputValue(scene: Scene, currentValue: number, targetValue: number): number;
    static GenerateRandonNumber(min: number, max: number, decimals?: number): number;
    static ProjectVector(vector: Vector3, onnormal: Vector3): Vector3;
    static ProjectVectorToRef(vector: Vector3, onnormal: Vector3, result: Vector3): void;
    static ProjectVectorOnPlane(vector: Vector3, planenormal: Vector3): Vector3;
    static ProjectVectorOnPlaneToRef(vector: Vector3, planenormal: Vector3, result: Vector3): void;
    static AreVectorsEqual(v1: Vector3, v2: Vector3, p: number): boolean;
    static GetVerticalSlopeAngle(v: Vector3, max?: number): number;
    static DownloadEnvironment(cubemap: CubeTexture, success?: () => void, failure?: () => void): void;
    static HasOwnProperty(object: any, property: string): boolean;
    static FindMeshCollider(scene: Scene, object: IPhysicsEnabledObject): IPhysicsEnabledObject;
    static ColliderInstances(): boolean;
    static ReparentColliders(): boolean;
    static UseTriangleNormals(): boolean;
    static UseConvexTriangles(): boolean;
    static DefaultRenderGroup(): number;
    static ShowDebugColliders(): boolean;
    static ColliderVisibility(): number;
    static ColliderRenderGroup(): number;
    static CollisionWireframe(): boolean;
    static GetColliderMaterial(scene: Scene): Material;
    static CalculateCombinedFriction(friction0: number, friction1: number): number;
    static CalculateCombinedRestitution(restitution0: number, restitution1: number): number;
    private static LoaderItemsMarkedForDisposal;
    static AddLoaderItemMarkedForDisposal(node: TransformNode): void;
    static ResetLoaderItemsMarkedForDisposal(): void;
    static RemoveLoaderItemsMarkedForDisposal(): void;
    static GetDirectTargetAngle(transform: TransformNode, worldSpaceTarget: Vector3): number;
    static GetSmoothTargetAngle(transform: TransformNode, worldSpaceTarget: Vector3): number;
    static CalculatCatmullRom(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, i: number): Vector3;
    static CalculatCatmullRomToRef(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, i: number, result: Vector3): void;
    static MakeProper(name: string): string;
    static StartsWith(source: string, word: string): boolean;
    static EndsWith(source: string, word: string): boolean;
    static ReplaceAll(source: string, word: string, replace: string): string;
    static IsNullOrEmpty(source: string): boolean;
    static SafeStringPush(array: string[], value: string): void;
    static ParseColor3(source: IUnityColor, defaultValue?: Color3, toLinearSpace?: boolean): Color3;
    static ParseColor4(source: IUnityColor, defaultValue?: Color4, toLinearSpace?: boolean): Color4;
    static ParseVector2(source: IUnityVector2, defaultValue?: Vector2): Vector2;
    static ParseVector3(source: IUnityVector3, defaultValue?: Vector3): Vector3;
    static ParseVector4(source: IUnityVector4, defaultValue?: Vector4): Vector4;
    static ParseSound(source: IUnityAudioClip, scene: Scene, name: string, callback?: Nullable<() => void>, options?: IStaticSoundOptions): Promise<StaticSound>;
    static ParseTexture(source: IUnityTexture, scene: Scene, noMipmap?: boolean, invertY?: boolean, samplingMode?: number, onLoad?: Nullable<() => void>, onError?: Nullable<(message?: string, exception?: any) => void>, buffer?: Nullable<any>, deleteBuffer?: boolean, format?: number): Texture;
    static ParseCubemap(source: IUnityCubemap, scene: Scene): CubeTexture;
    static ParseTextAsset(source: IUnityTextAsset, defaultValue?: string): string;
    static ParseJsonAsset<T>(source: IUnityTextAsset, defaultValue?: string, reviver?: (this: any, key: string, value: any) => any): T;
    static ParseTransformByID(source: IUnityTransform, scene: Scene, defaultValue?: TransformNode): TransformNode;
    static ParseTransformByName(source: IUnityTransform, scene: Scene, defaultValue?: TransformNode): TransformNode;
    static ParseChildTransform(parent: TransformNode, source: IUnityTransform, defaultValue?: TransformNode): TransformNode;
    static SetAbsolutePosition(transform: TransformNode, position: Vector3): void;
    static GetAbsolutePosition(transform: TransformNode, offsetPosition?: Vector3, computeMatrix?: boolean): Vector3;
    static GetAbsolutePositionToRef(transform: TransformNode, result: Vector3, offsetPosition?: Vector3, computeMatrix?: boolean): void;
    static SetAbsoluteRotation(transform: TransformNode, rotation: Quaternion): void;
    static GetAbsoluteRotation(transform: TransformNode): Quaternion;
    static GetAbsoluteRotationToRef(transform: TransformNode, result: Quaternion): void;
    static TransformPoint(owner: TransformNode | Camera, position: Vector3, computeMatrix?: boolean): Vector3;
    static InverseTransformPoint(owner: TransformNode | Camera, position: Vector3, computeMatrix?: boolean): Vector3;
    static TransformPointToRef(owner: TransformNode | Camera, position: Vector3, result: Vector3, computeMatrix?: boolean): void;
    static InverseTransformPointToRef(owner: TransformNode | Camera, position: Vector3, result: Vector3, computeMatrix?: boolean): void;
    static TransformDirection(owner: TransformNode | Camera, direction: Vector3, computeMatrix?: boolean): Vector3;
    static InverseTransformDirection(owner: TransformNode | Camera, direction: Vector3, computeMatrix?: boolean): Vector3;
    static TransformDirectionToRef(owner: TransformNode | Camera, direction: Vector3, result: Vector3, computeMatrix?: boolean): void;
    static InverseTransformDirectionToRef(owner: TransformNode | Camera, direction: Vector3, result: Vector3, computeMatrix?: boolean): void;
    static RecomputeCenterPivotPoint(owner: AbstractMesh): void;
    static GetDirectionVector(owner: TransformNode | Camera, vector: Vector3): Vector3;
    static GetDirectionVectorToRef(owner: TransformNode | Camera, vector: Vector3, result: Vector3): void;
    static GetForwardVector(owner: TransformNode | Camera): Vector3;
    static GetForwardVectorToRef(owner: TransformNode | Camera, result: Vector3): void;
    static GetRightVector(owner: TransformNode | Camera): Vector3;
    static GetRightVectorToRef(owner: TransformNode | Camera, result: Vector3): void;
    static GetUpVector(owner: TransformNode | Camera): Vector3;
    static GetUpVectorToRef(owner: TransformNode | Camera, result: Vector3): void;
    static BlendFloatValue(source: number, value: number, weight: number): number;
    static BlendVector2Value(source: Vector2, value: Vector2, weight: number): void;
    static BlendVector3Value(source: Vector3, value: Vector3, weight: number): void;
    static BlendQuaternionValue(source: Quaternion, value: Quaternion, weight: number): void;
    static SetAnimationTargetProperty(animation: Animation, property: string): void;
    static SampleAnimationFloat(animation: Animation, time: number, loopMode?: number, gltfAnimation?: boolean): number;
    static SampleAnimationVector2(animation: Animation, time: number, loopMode?: number, gltfAnimation?: boolean): Vector2;
    static SampleAnimationVector3(animation: Animation, time: number, loopMode?: number, gltfAnimation?: boolean): Vector3;
    static SampleAnimationQuaternion(animation: Animation, time: number, loopMode?: number, gltfAnimation?: boolean): Quaternion;
    static SampleAnimationMatrix(animation: Animation, time: number, loopMode?: number, gltfAnimation?: boolean): Matrix;
    static CreateTweenAnimation(name: string, targetProperty: string, startValue: number, endValue: number, frameRate?: number, loopMode?: number): Animation;
    static GetLastKeyFrameIndex(animation: Animation): number;
    private static InterpolateAnimation;
    static UpdateLoopBlendPositionSettings(animationTrack: AnimationGroup, loopBlendPositionY: boolean, loopBlendPositionXZ: boolean): void;
    static InitializeShaderMaterial(material: ShaderMaterial, binding?: boolean, clipPlanes?: Nullable<boolean>): void;
    static WorldToScreenPoint(scene: Scene, position: Vector3, camera?: Camera): Vector3;
    static ScreenToWorldPoint(scene: Scene, position: Vector3): Vector3;
    static LoadTextFile(url: string, onSuccess: (data: string | ArrayBuffer) => void, onProgress?: (data: any) => void, onError?: (request?: WebRequest, exception?: any) => void): IFileRequest;
    static LoadTextFileAsync(url: string): Promise<string>;
    static GetHttpRequest(url: string, headers?: RequestHeader[], onSuccess?: (xhr: XMLHttpRequest) => void, onFailure?: (reason: any) => void, onProgress?: (evt: ProgressEvent) => void, useArrayBuffer?: boolean, overrideMimeType?: string): XMLHttpRequest;
    static GetHttpRequestAsync(url: string, headers?: RequestHeader[], onProgress?: (evt: ProgressEvent) => void, useArrayBuffer?: boolean, overrideMimeType?: string): Promise<XMLHttpRequest>;
    static PostHttpRequest(url: string, data: any, headers?: RequestHeader[], contentType?: string, onSuccess?: (xhr: XMLHttpRequest) => void, onFailure?: (reason: any) => void, onProgress?: (evt: ProgressEvent) => void, useArrayBuffer?: boolean, overrideMimeType?: string): XMLHttpRequest;
    static PostHttpRequestAsync(url: string, data: any, headers?: RequestHeader[], contentType?: string, onProgress?: (evt: ProgressEvent) => void, useArrayBuffer?: boolean, overrideMimeType?: string): Promise<XMLHttpRequest>;
    static RemapValueToRange(value: number, a1: number, a2: number, b1: number, b2: number): number;
    static CloneSkeletonPrefab(scene: Scene, skeleton: Skeleton, name: string, id?: string, root?: TransformNode): Skeleton;
    static GetSceneTransforms(scene: Scene): TransformNode[];
    static PostParseSceneComponents(scene: Scene, transforms: TransformNode[], preloadList: Array<ScriptComponent>, readyList: Array<ScriptComponent>): MetadataParser;
    static GetAssetContainerMesh(container: AssetContainer, meshName: string): Mesh;
    static GetAssetContainerNode(container: AssetContainer, nodeName: string): TransformNode;
    static CloneAssetContainerItem(container: AssetContainer, assetName: string, nameFunction?: (sourceName: string) => string, newParent?: Nullable<TransformNode>, makeNewMaterials?: boolean, cloneAnimations?: boolean): TransformNode;
    static AssignAnimationGroupsToInstance(root: TransformNode, groups: AnimationGroup[]): void;
    static AssignAnimationGroupsToNode(transform: TransformNode, groups: AnimationGroup[]): void;
    static UnitySlopeAngleToCosine(unitySlopeAngleDegrees: number): number;
    static InstantiateHierarchy(node: TransformNode, newParent?: Nullable<TransformNode>, onNewNodeCreated?: (source: TransformNode, clone: TransformNode) => void): Nullable<TransformNode>;
    static InstantiateNodeHierarchy(node: TransformNode, newParent?: Nullable<TransformNode>, onNewNodeCreated?: (source: TransformNode, clone: TransformNode) => void): Nullable<TransformNode>;
    static InstantiateMeshHierarchy(mesh: Mesh, newParent: Nullable<TransformNode>, createInstance: boolean, onNewNodeCreated?: (source: TransformNode, clone: TransformNode) => void): Nullable<TransformNode>;
    static PrepareSkeletonForRendering(skeleton: Skeleton, dontCheckFrameId?: boolean): void;
    static RetargetAnimationGroupSkeleton(animationGroup: AnimationGroup, targetSkeleton: Skeleton, targetArmatureNode?: TransformNode): void;
    static RetargetAnimationGroupBlendShapes(animationGroup: AnimationGroup, targetMesh: Mesh): void;
    static LinkSkeletonMeshes(master: Skeleton, slave: Skeleton): void;
    static FindBoneByName(skeleton: Skeleton, name: string): Bone;
    static SwitchHandednessVector3(input: Vector3): Vector3;
    static SwitchHandednessVector4(input: Vector4): Vector4;
    static SwitchHandednessQuaternion(input: Quaternion): Quaternion;
    static ComputeBlendingSpeed(rate: number, duration: number, dampen?: boolean): number;
    static CalculateCameraDistance(farClipPlane: number, lodPercent: number, clipPlaneScale?: number): number;
    static InstantiateClass(className: string): any;
    static GetSimpleClassName(obj: any): string;
    static DisposeEntity(entity: AbstractMesh): void;
    static SearchTransformNodes(name: string, nodes: BabylonNode[], searchType?: SearchType): BabylonNode;
    static SearchTransformNodeForTags(query: string, nodes: BabylonNode[]): BabylonNode;
    static SearchAllTransformNodesForTags(query: string, nodes: BabylonNode[]): BabylonNode[];
    static SearchTransformNodeForScript(klass: string, nodes: BabylonNode[]): BabylonNode;
    static SearchAllTransformNodesForScript(klass: string, nodes: BabylonNode[]): BabylonNode[];
    static CreateGuid(suffix?: string): string;
    static ValidateTransformGuid(node: TransformNode): void;
    static AddShadowCastersToLight(light: IShadowLight, transforms: TransformNode[], includeChildren?: boolean): void;
    static RegisterInstancedMeshBuffers(mesh: Mesh): void;
    static CloneValue(source: any, destinationObject: any): any;
    static CloneEntityMetadata(source: any): any;
    static FastJsonCopy(val: any): any;
    static DeepCopyProperties(source: any, destination: any, doNotCopyList?: string[], mustCopyList?: string[]): void;
    static ValidateTransformMetadata(transform: TransformNode): void;
}
export interface KeymapState {
    result: boolean | number;
    pressTime: number;
    releaseTime: number;
}
export declare enum DragDirection {
    None = 0,
    Up = 1,
    Down = 2,
    Right = 3,
    Left = 4
}
export declare enum PinchZoomState {
    None = 0,
    ZoomIn = 1,
    ZoomOut = 2
}
export declare class InputController {
    static MOUSE_DAMPENER: number;
    static TAP_THRESHOLD_MS: number;
    static GamepadManager: GamepadManager;
    static GamepadConnected: (pad: Gamepad, state: EventState) => void;
    static GamepadDisconnected: (pad: Gamepad, state: EventState) => void;
    static GetMouseButtonsDown(): number;
    static GetLeftButtonDown(): boolean;
    static GetMiddleButtonDown(): boolean;
    static GetRightButtonDown(): boolean;
    static GetMouseDownTarget(): any;
    static GetMouseDragTarget(): any;
    static GetPinchZoomState(): PinchZoomState;
    static AllowMobileControls: boolean;
    static MobileControlsActive: boolean;
    static EnablePinchZoomTracking: boolean;
    static EnableUserInput(engine: AbstractEngine, scene: Scene, options?: {
        contextMenu?: boolean;
        pointerLock?: boolean;
        preventDefault?: boolean;
        useCapture?: boolean;
    }): void;
    static ConfigureUserInput(engine: AbstractEngine, scene: Scene, options?: {
        contextMenu?: boolean;
        pointerLock?: boolean;
        preventDefault?: boolean;
        useCapture?: boolean;
    }): void;
    static SetLeftJoystickBuffer(leftStickX: number, leftStickY: number, invertY?: boolean): void;
    static SetRightJoystickBuffer(rightStickX: number, rightStickY: number, invertY?: boolean): void;
    static DisableUserInput(scene: Scene, useCapture?: boolean): void;
    static LockMousePointer(scene: Scene, lock: boolean): void;
    private static PointerLockedFlag;
    static IsPointerLocked(): boolean;
    private static LockMousePointerObserver;
    static IsPointerLockHandled(): boolean;
    static GetUserInput(input: UserInputAxis, player?: PlayerNumber): number;
    static OnKeyboardUp(callback: (keycode: number) => void): void;
    static OnKeyboardDown(callback: (keycode: number) => void): void;
    static OnKeyboardPress(keycode: number, callback: () => void): void;
    static GetKeyboardInput(keycode: number): boolean;
    static IsKeyboardButtonHeld(keycode: number): boolean;
    static WasKeyboardButtonTapped(keycode: number, reset?: boolean): boolean;
    static ResetKeyboardButtonTapped(keycode: number): void;
    static OnPointerUp(callback: (button: number) => void): void;
    static OnPointerDown(callback: (button: number) => void): void;
    static OnPointerPress(button: number, callback: () => void): void;
    static GetPointerInput(button: number): boolean;
    static IsPointerButtonHeld(button: number): boolean;
    static WasPointerButtonTapped(number: number, reset?: boolean): boolean;
    static ResetPointerButtonTapped(button: number): void;
    static GetPointerDragDirection(mousex: number, mousey: number, buttondown: boolean): DragDirection;
    static ResetPinchZoomTracking(): void;
    static IsWheelScrolling(): boolean;
    static OnGamepadButtonUp(callback: (button: number) => void, player?: PlayerNumber): void;
    static OnGamepadButtonDown(callback: (button: number) => void, player?: PlayerNumber): void;
    static OnGamepadButtonPress(button: number, callback: () => void, player?: PlayerNumber): void;
    static GetGamepadButtonInput(button: number, player?: PlayerNumber): boolean;
    static IsGamepadButtonHeld(button: number, player?: PlayerNumber): boolean;
    static IsGamepadButtonTapped(button: number, player?: PlayerNumber): boolean;
    static ResetGamepadButtonTapped(button: number, player?: PlayerNumber): void;
    static OnGamepadDirectionUp(callback: (direction: number) => void, player?: PlayerNumber): void;
    static OnGamepadDirectionDown(callback: (direction: number) => void, player?: PlayerNumber): void;
    static OnGamepadDirectionPress(direction: number, callback: () => void, player?: PlayerNumber): void;
    static GetGamepadDirectionInput(direction: number, player?: PlayerNumber): boolean;
    static IsGamepadDirectionHeld(direction: number, player?: PlayerNumber): boolean;
    static IsGamepadDirectionTapped(direction: number, player?: PlayerNumber): boolean;
    static ResetGamepadDirectionTapped(direction: number, player?: PlayerNumber): void;
    static OnGamepadTriggerLeft(callback: (value: number) => void, player?: PlayerNumber): void;
    static OnGamepadTriggerRight(callback: (value: number) => void, player?: PlayerNumber): void;
    static GetGamepadTriggerInput(trigger: number, player?: PlayerNumber): number;
    static IsGamepadTriggerHeld(trigger: number, player?: PlayerNumber): boolean;
    static IsGamepadTriggerTapped(trigger: number, player?: PlayerNumber): boolean;
    static ResetGamepadTriggerTapped(trigger: number, player?: PlayerNumber): void;
    static GetGamepadType(player?: PlayerNumber): GamepadType;
    static GetGamepad(player?: PlayerNumber): Gamepad;
    static InputKeyDownHandler(keyCode: number, event?: MouseEvent | TouchEvent | PointerEvent | KeyboardEvent): any;
    static InputKeyUpHandler(keyCode: number, event?: MouseEvent | TouchEvent | PointerEvent | KeyboardEvent): any;
    private static input;
    private static keymap;
    private static scroll;
    private static wheel;
    private static mousex;
    private static mousey;
    private static vertical;
    private static horizontal;
    private static mousex2;
    private static mousey2;
    private static vertical2;
    private static horizontal2;
    private static mousex3;
    private static mousey3;
    private static vertical3;
    private static horizontal3;
    private static mousex4;
    private static mousey4;
    private static vertical4;
    private static horizontal4;
    private static a_mousex;
    private static x_scroll;
    private static x_wheel;
    private static x_mousex;
    private static x_mousey;
    private static x_vertical;
    private static x_horizontal;
    private static k_mousex;
    private static k_mousey;
    private static k_vertical;
    private static k_horizontal;
    private static j_mousex;
    private static j_mousey;
    private static j_vertical;
    private static j_horizontal;
    private static g_mousex1;
    private static g_mousey1;
    private static g_vertical1;
    private static g_horizontal1;
    private static g_mousex2;
    private static g_mousey2;
    private static g_vertical2;
    private static g_horizontal2;
    private static g_mousex3;
    private static g_mousey3;
    private static g_vertical3;
    private static g_horizontal3;
    private static g_mousex4;
    private static g_mousey4;
    private static g_vertical4;
    private static g_horizontal4;
    private static dragDirection;
    private static pinchZoomState;
    private static pinchZoomEvents;
    private static pinchZoomDistance;
    private static mouseDownTarget;
    private static mouseDragTarget;
    private static leftButtonDown;
    private static middleButtonDown;
    private static rightButtonDown;
    private static mouseButtonsDown;
    private static mouseButtonPress;
    private static mouseButtonDown;
    private static mouseButtonUp;
    private static keyButtonPress;
    private static keyButtonDown;
    private static keyButtonUp;
    private static previousPosition;
    private static preventDefault;
    private static rightHanded;
    private static gamepad1;
    private static gamepad1Type;
    private static gamepad1ButtonPress;
    private static gamepad1ButtonDown;
    private static gamepad1ButtonUp;
    private static gamepad1DpadPress;
    private static gamepad1DpadDown;
    private static gamepad1DpadUp;
    private static gamepad1LeftTrigger;
    private static gamepad1RightTrigger;
    private static gamepad2;
    private static gamepad2Type;
    private static gamepad2ButtonPress;
    private static gamepad2ButtonDown;
    private static gamepad2ButtonUp;
    private static gamepad2DpadPress;
    private static gamepad2DpadDown;
    private static gamepad2DpadUp;
    private static gamepad2LeftTrigger;
    private static gamepad2RightTrigger;
    private static gamepad3;
    private static gamepad3Type;
    private static gamepad3ButtonPress;
    private static gamepad3ButtonDown;
    private static gamepad3ButtonUp;
    private static gamepad3DpadPress;
    private static gamepad3DpadDown;
    private static gamepad3DpadUp;
    private static gamepad3LeftTrigger;
    private static gamepad3RightTrigger;
    private static gamepad4;
    private static gamepad4Type;
    private static gamepad4ButtonPress;
    private static gamepad4ButtonDown;
    private static gamepad4ButtonUp;
    private static gamepad4DpadPress;
    private static gamepad4DpadDown;
    private static gamepad4DpadUp;
    private static gamepad4LeftTrigger;
    private static gamepad4RightTrigger;
    private static tickKeyboardInput;
    private static updateUserInput;
    private static resetUserInput;
    private static resetKeyMapHandler;
    private static getPinchZoomDistance;
    private static cachePinchZoomPointer;
    private static removePinchZoomPointer;
    private static processPinchZoomTracking;
    private static inputKeyDownHandler;
    private static inputKeyUpHandler;
    private static inputPointerWheelHandler;
    private static inputPointerDownHandler;
    private static inputPointerUpHandler;
    private static inputPointerMoveHandler;
    private static inputOneButtonDownHandler;
    private static inputOneButtonUpHandler;
    private static inputOneXboxDPadDownHandler;
    private static inputOneShockDPadDownHandler;
    private static inputOneXboxDPadUpHandler;
    private static inputOneShockDPadUpHandler;
    private static inputOneXboxLeftTriggerHandler;
    private static inputOneXboxRightTriggerHandler;
    private static inputOneLeftStickHandler;
    private static inputOneRightStickHandler;
    private static inputTwoButtonDownHandler;
    private static inputTwoButtonUpHandler;
    private static inputTwoXboxDPadDownHandler;
    private static inputTwoShockDPadDownHandler;
    private static inputTwoXboxDPadUpHandler;
    private static inputTwoShockDPadUpHandler;
    private static inputTwoXboxLeftTriggerHandler;
    private static inputTwoXboxRightTriggerHandler;
    private static inputTwoLeftStickHandler;
    private static inputTwoRightStickHandler;
    private static inputThreeButtonDownHandler;
    private static inputThreeButtonUpHandler;
    private static inputThreeXboxDPadDownHandler;
    private static inputThreeShockDPadDownHandler;
    private static inputThreeXboxDPadUpHandler;
    private static inputThreeShockDPadUpHandler;
    private static inputThreeXboxLeftTriggerHandler;
    private static inputThreeXboxRightTriggerHandler;
    private static inputThreeLeftStickHandler;
    private static inputThreeRightStickHandler;
    private static inputFourButtonDownHandler;
    private static inputFourButtonUpHandler;
    private static inputFourXboxDPadDownHandler;
    private static inputFourShockDPadDownHandler;
    private static inputFourXboxDPadUpHandler;
    private static inputFourShockDPadUpHandler;
    private static inputFourXboxLeftTriggerHandler;
    private static inputFourXboxRightTriggerHandler;
    private static inputFourLeftStickHandler;
    private static inputFourRightStickHandler;
    private static inputManagerGamepadConnected;
    private static inputManagerGamepadDisconnected;
}
export declare class WindowManager {
    static IsWindows(): boolean;
    static IsCordova(): boolean;
    static IsWebAssembly(): boolean;
    static IsOculusBrowser(): boolean;
    static IsSamsungBrowser(): boolean;
    static IsWindowsPhone(): boolean;
    static IsBlackBerry(): boolean;
    static IsOperaMini(): boolean;
    static IsAndroid(): boolean;
    static IsWebOS(): boolean;
    static IsIOS(): boolean;
    static IsIPHONE(): boolean;
    static IsIPAD(): boolean;
    static IsIPOD(): boolean;
    static IsIE11(): boolean;
    static IsMobile(): boolean;
    static IsPlaystation(): boolean;
    static IsXboxConsole(): boolean;
    static IsXboxLive(): boolean;
    static IsFrameWindow(): boolean;
    static IsPortraitWindow(): boolean;
    static IsLandscapeWindow(): boolean;
    static IsStandaloneWindow(): boolean;
    static IsFullscreenWindow(): boolean;
    static IsProgressiveWindow(): boolean;
    static GetDisplayMode(): string;
    static GetOrientation(): string;
    static AlertMessage(text: string, title?: string): any;
    static GetQueryStringParam(name: string, url: string): string;
    static PostWindowMessage(msg: IWindowMessage, targetOrigin?: string, localWindow?: boolean): void;
    static LoadLevel(sceneFile: string, queryString?: string): boolean;
    static ShowSceneLoader(): void;
    static HideSceneLoader(): void;
    static UpdateLoaderStatus(status: string, details: string, state: number): void;
    static UpdateLoaderDetails(details: string, state: number): void;
    static UpdateLoaderProgress(progress: string, state: number): void;
    static ShowPageErrorMessage(message: string, title?: string, timeout?: number): void;
    static SetTimeout(timeout: number, func: () => void): number;
    static ClearTimeout(handle: number): void;
    static SetInterval(interval: number, func: () => void): number;
    static ClearInterval(handle: number): void;
    static Atob(data: string): string;
    static Btoa(data: string): string;
    static PopupDebug(scene: Scene): void;
    static ToggleDebug(scene: Scene, embed?: boolean, parent?: HTMLElement): void;
    private static debugLayerVisible;
    static GetLocalStorageItem(key: string): string;
    static SetLocalStorageItem(key: string, value: string): void;
    static GetSessionStorageItem(key: string): string;
    static SetSessionStorageItem(key: string, value: string): void;
    static GetFilenameFromUrl(url: string): string;
    static GetUrlParameter(key: string): string;
    static GetVirtualRealityEnabled(): boolean;
    static SetVirtualRealityEnabled(enabled: boolean): void;
    static SetWindowsLaunchMode(mode?: number): void;
    static GetHardwareScalingLevel(): number;
    static QuitWindowsApplication(): void;
    static PrintToScreen(text: string, color?: string): void;
    private static PrintElement;
}
export declare class AnimationState extends ScriptComponent {
    static FPS: number;
    static EXIT: string;
    static TIME: number;
    static SPEED: number;
    private _looptime;
    private _loopblend;
    private _frametime;
    private _layercount;
    private _updatemode;
    private _hasrootmotion;
    private _animationplaying;
    private _initialtargetblending;
    private _hastransformhierarchy;
    private _leftfeetbottomheight;
    private _rightfeetbottomheight;
    private _runtimecontroller;
    private _executed;
    private _awakened;
    private _initialized;
    private _checkers;
    private _source;
    private _machine;
    private _animationmode;
    private _animationrig;
    private _deltaPosition;
    private _deltaRotation;
    private _angularVelocity;
    private _rootMotionSpeed;
    private _lastMotionSpeed;
    private _loopMotionSpeed;
    private _lastRotateSpeed;
    private _loopRotateSpeed;
    private _lastMotionRotation;
    private _lastMotionPosition;
    private _positionWeight;
    private _rootBoneWeight;
    private _rotationWeight;
    private _rootQuatWeight;
    private _rootBoneTransform;
    private _positionHolder;
    private _rootBoneHolder;
    private _rotationHolder;
    private _rootQuatHolder;
    private _rootMotionMatrix;
    private _rootMotionScaling;
    private _rootMotionRotation;
    private _rootMotionPosition;
    private _dirtyMotionMatrix;
    private _dirtyBlenderMatrix;
    private _targetPosition;
    private _targetRotation;
    private _targetScaling;
    private _updateMatrix;
    private _blenderMatrix;
    private _blendWeights;
    private _emptyScaling;
    private _emptyPosition;
    private _emptyRotation;
    private _ikFrameEanbled;
    private _data;
    private _anims;
    private _clips;
    private _numbers;
    private _booleans;
    private _triggers;
    private _parameters;
    speedRatio: number;
    delayUpdateUntilReady: boolean;
    enableAnimation: boolean;
    applyRootMotion: boolean;
    awakened(): boolean;
    initialized(): boolean;
    hasRootMotion(): boolean;
    isFirstFrame(): boolean;
    isLastFrame(): boolean;
    ikFrameEnabled(): boolean;
    getAnimationTime(): number;
    getFrameLoopTime(): boolean;
    getFrameLoopBlend(): boolean;
    getAnimationPlaying(): boolean;
    getRuntimeController(): string;
    getRootBoneTransform(): TransformNode;
    getDeltaRootMotionAngle(): number;
    getDeltaRootMotionSpeed(): number;
    getDeltaRootMotionPosition(): Vector3;
    getDeltaRootMotionRotation(): Quaternion;
    getFixedRootMotionPosition(): Vector3;
    getFixedRootMotionRotation(): Quaternion;
    onAnimationAwakeObservable: Observable<TransformNode>;
    onAnimationInitObservable: Observable<TransformNode>;
    onAnimationIKObservable: Observable<number>;
    onAnimationEndObservable: Observable<number>;
    onAnimationLoopObservable: Observable<number>;
    onAnimationEventObservable: Observable<IAnimatorEvent>;
    onAnimationUpdateObservable: Observable<TransformNode>;
    onAnimationTransitionObservable: Observable<TransformNode>;
    protected m_zeroVector: Vector3;
    protected m_defaultGroup: AnimationGroup;
    protected m_animationTargets: TargetedAnimation[];
    protected m_rotationIdentity: Quaternion;
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    protected awake(): void;
    protected update(): void;
    protected destroy(): void;
    playDefaultAnimation(transitionDuration?: number, animationLayer?: number, frameRate?: number): boolean;
    playAnimation(state: string, transitionDuration?: number, animationLayer?: number, frameRate?: number): boolean;
    stopAnimation(animationLayer?: number): boolean;
    killAnimations(): boolean;
    hasBool(name: string): boolean;
    getBool(name: string): boolean;
    setBool(name: string, value: boolean): void;
    hasFloat(name: string): boolean;
    getFloat(name: string): number;
    setFloat(name: string, value: number): void;
    hasInteger(name: string): boolean;
    getInteger(name: string): number;
    setInteger(name: string, value: number): void;
    hasTrigger(name: string): boolean;
    getTrigger(name: string): boolean;
    setTrigger(name: string): void;
    resetTrigger(name: string): void;
    setSmoothFloat(name: string, targetValue: number, lerpSpeed: number): void;
    setSmoothInteger(name: string, targetValue: number, lerpSpeed: number): void;
    private getMachineState;
    private setMachineState;
    getCurrentState(layer: number): MachineState;
    getDefaultClips(): any[];
    getDefaultSource(): string;
    setLayerWeight(layer: number, weight: number): void;
    fixAnimationGroup(group: AnimationGroup): string;
    getAnimationGroup(name: string): AnimationGroup;
    getAnimationGroups(): AnimationGroup[];
    setAnimationGroups(groups: AnimationGroup[]): void;
    private updateAnimationGroups;
    private awakeStateMachine;
    private sourceAnimationGroups;
    private updateStateMachine;
    private setupSourceAnimationGroups;
    private destroyStateMachine;
    private updateAnimationState;
    private updateAnimationTargets;
    private updateBlendableTargets;
    private finalizeAnimationTargets;
    private checkStateMachine;
    private checkStateTransitions;
    private playCurrentAnimationState;
    private stopCurrentAnimationState;
    private checkAvatarTransformPath;
    private filterTargetAvatarMask;
    private sortWeightedBlendingList;
    private computeWeightedFrameRatio;
    private setupTreeBranches;
    private parseTreeBranches;
    private parse1DSimpleTreeBranches;
    private parse2DSimpleDirectionalTreeBranches;
    private parse2DFreeformDirectionalTreeBranches;
    private parse2DFreeformCartesianTreeBranches;
}
export declare class BlendTreeValue {
    source: IBlendTreeChild;
    motion: string;
    posX: number;
    posY: number;
    weight: number;
    constructor(config: {
        source: IBlendTreeChild;
        motion: string;
        posX?: number;
        posY?: number;
        weight?: number;
    });
}
export declare class BlendTreeUtils {
    static ClampValue(num: number, min: number, max: number): number;
    static GetSignedAngle(a: Vector2, b: Vector2): number;
    static GetLinearInterpolation(x0: number, y0: number, x1: number, y1: number, x: number): number;
    static GetRightNeighbourIndex(inputX: number, blendTreeArray: BlendTreeValue[]): number;
}
export declare class BlendTreeSystem {
    static Calculate1DSimpleBlendTree(inputX: number, blendTreeArray: BlendTreeValue[]): void;
    static Calculate2DFreeformDirectional(inputX: number, inputY: number, blendTreeArray: BlendTreeValue[]): void;
    static Calculate2DFreeformCartesian(inputX: number, inputY: number, blendTreeArray: BlendTreeValue[]): void;
    private static TempVector2_IP;
    private static TempVector2_POSI;
    private static TempVector2_POSJ;
    private static TempVector2_POSIP;
    private static TempVector2_POSIJ;
}
export declare class MachineState {
    hash: number;
    name: string;
    tag: string;
    time: number;
    type: MotionType;
    rate: number;
    length: number;
    layer: string;
    layerIndex: number;
    played: number;
    machine: string;
    motionid: number;
    interrupted: boolean;
    apparentSpeed: number;
    averageAngularSpeed: number;
    averageDuration: number;
    averageSpeed: number[];
    cycleOffset: number;
    cycleOffsetParameter: string;
    cycleOffsetParameterActive: boolean;
    iKOnFeet: boolean;
    mirror: boolean;
    mirrorParameter: string;
    mirrorParameterActive: boolean;
    speed: number;
    speedParameter: string;
    speedParameterActive: boolean;
    blendtree: IBlendTree;
    transitions: ITransition[];
    behaviours: IBehaviour[];
    events: IAnimatorEvent[];
    ccurves: IUnityCurve[];
    tcurves: Animation[];
    constructor();
}
export declare class TransitionCheck {
    result: string;
    offest: number;
    blending: number;
    triggered: string[];
}
export declare class AnimationMixer {
    influenceBuffer: number;
    positionBuffer: Vector3;
    rotationBuffer: Quaternion;
    scalingBuffer: Vector3;
    originalMatrix: Matrix;
    blendingFactor: number;
    blendingSpeed: number;
    rootPosition: Vector3;
    rootRotation: Quaternion;
}
export declare class BlendingWeights {
    primary: IBlendTreeChild;
    secondary: IBlendTreeChild;
}
export declare enum MotionType {
    Clip = 0,
    Tree = 1
}
export declare enum ConditionMode {
    If = 1,
    IfNot = 2,
    Greater = 3,
    Less = 4,
    Equals = 6,
    NotEqual = 7
}
export declare enum InterruptionSource {
    None = 0,
    Source = 1,
    Destination = 2,
    SourceThenDestination = 3,
    DestinationThenSource = 4
}
export declare enum BlendTreeType {
    Simple1D = 0,
    SimpleDirectional2D = 1,
    FreeformDirectional2D = 2,
    FreeformCartesian2D = 3,
    Direct = 4,
    Clip = 5
}
export declare enum AnimatorParameterType {
    Float = 1,
    Int = 3,
    Bool = 4,
    Trigger = 9
}
export interface IAnimatorEvent {
    id: number;
    clip: string;
    time: number;
    function: string;
    intParameter: number;
    floatParameter: number;
    stringParameter: string;
    objectIdParameter: string;
    objectNameParameter: string;
}
export interface IAvatarMask {
    hash: number;
    maskName: string;
    maskType: string;
    transformCount: number;
    transformPaths: string[];
}
export interface IAnimationLayer {
    owner: string;
    hash: number;
    name: string;
    index: number;
    entry: string;
    machine: string;
    iKPass: boolean;
    avatarMask: IAvatarMask;
    blendingMode: number;
    defaultWeight: number;
    syncedLayerIndex: number;
    syncedLayerAffectsTiming: boolean;
    animationTime: number;
    animationNormal: number;
    animationMaskMap: Map<string, number>;
    animationFirstRun: boolean;
    animationEndFrame: boolean;
    animationLoopFrame: boolean;
    animationLoopCount: number;
    animationLoopEvents: any;
    animationStateMachine: MachineState;
}
export interface IBehaviour {
    hash: number;
    name: string;
    layerIndex: number;
    properties: any;
}
export interface ITransition {
    hash: number;
    anyState: boolean;
    layerIndex: number;
    machineLayer: string;
    machineName: string;
    canTransitionToSelf: boolean;
    destination: string;
    duration: number;
    exitTime: number;
    hasExitTime: boolean;
    fixedDuration: boolean;
    intSource: InterruptionSource;
    isExit: boolean;
    mute: boolean;
    name: string;
    offset: number;
    orderedInt: boolean;
    solo: boolean;
    conditions: ICondition[];
}
export interface ICondition {
    hash: number;
    mode: ConditionMode;
    parameter: string;
    threshold: number;
}
export interface IBlendTree {
    hash: number;
    name: string;
    state: string;
    children: IBlendTreeChild[];
    layerIndex: number;
    apparentSpeed: number;
    averageAngularSpeed: number;
    averageDuration: number;
    averageSpeed: number[];
    blendParameterX: string;
    blendParameterY: string;
    blendType: BlendTreeType;
    isAnimatorMotion: boolean;
    isHumanMotion: boolean;
    isLooping: boolean;
    minThreshold: number;
    maxThreshold: number;
    useAutomaticThresholds: boolean;
    valueParameterX: number;
    valueParameterY: number;
}
export interface IBlendTreeChild {
    hash: number;
    layerIndex: number;
    cycleOffset: number;
    directBlendParameter: string;
    apparentSpeed: number;
    averageAngularSpeed: number;
    averageDuration: number;
    averageSpeed: number[];
    mirror: boolean;
    type: MotionType;
    motion: string;
    positionX: number;
    positionY: number;
    threshold: number;
    timescale: number;
    subtree: IBlendTree;
    weight: number;
    ratio: number;
    track: AnimationGroup;
}
export declare class AudioSource extends ScriptComponent implements IAssetPreloader {
    static MAX_VOLUME: number;
    static DEFAULT_LEVEL: number;
    static DEFAULT_ROLLOFF: number;
    private static AUDIO_ENGINE_V2;
    private static AUDIO_ENGINE_V2_OPTIONS;
    private _audio;
    private _name;
    private _loop;
    private _mute;
    private _pitch;
    private _volume;
    private _preload;
    private _playonawake;
    private _spatialblend;
    private _preloaderUrl;
    private _lastmutedvolume;
    private _priority;
    private _panstereo;
    private _mindistance;
    private _maxdistance;
    private _reverbzonemix;
    private _bypasseffects;
    private _bypassreverbzones;
    private _bypasslistenereffects;
    private _enablelegacyaudio;
    private _initializedReadyInstance;
    private _isAudioPlaying;
    private _isAudioPaused;
    getSoundClip(): StaticSound | Sound;
    onReadyObservable: Observable<StaticSound | Sound>;
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    protected awake(): void;
    protected start(): void;
    protected destroy(): void;
    protected awakeAudioSource(): Promise<void>;
    protected startAudioSource(): void;
    protected destroyAudioSource(): void;
    isReady(): boolean;
    isLegacy(): boolean;
    isPlaying(): boolean;
    isPaused(): boolean;
    play(time?: number, offset?: number, length?: number): Promise<boolean>;
    private internalPlay;
    pause(): boolean;
    stop(time?: number): boolean;
    mute(time?: number): boolean;
    unmute(time?: number): boolean;
    getPitch(): number;
    setPitch(value: number): void;
    getVolume(): number;
    setVolume(volume: number, time?: number): boolean;
    setPosition(location: Vector3): void;
    getPlaybackSpeed(): number;
    setPlaybackSpeed(rate: number): void;
    setRolloffMode(mode: string): void;
    setMinDistance(distance: number): void;
    setMaxDistance(distance: number): void;
    setSpatialBlend(blend: number): void;
    hasSpatialSound(): boolean;
    getSpatialSound(): AbstractSpatialAudio;
    setSpatialSound(value: AbstractSpatialAudio): void;
    getCurrentTrackTime(): number;
    setAudioDataSource(source: string | ArrayBuffer): Promise<void>;
    setLegacyDataSource(source: string | ArrayBuffer | MediaStream): void;
    addPreloaderTasks(assetsManager: PreloadAssetsManager): void;
    static IsLegacyEngine(): boolean;
    static GetAudioOptions(): IWebAudioEngineOptions;
    static SetAudioOptions(options: IWebAudioEngineOptions): void;
    static GetAudioEngine(): Promise<AudioEngineV2>;
    static UnlockLegacyAudio(): void;
    static UnlockAudioEngine(): Promise<void>;
    static AttachSpatialCamera(node: BabylonNode): Promise<void>;
    static DetachSpatialCamera(): Promise<void>;
    static UpdateSpatialCamera(position: Vector3, rotation: Quaternion): Promise<void>;
    static CreateSoundBuffer(source: ArrayBuffer | AudioBuffer | StaticSoundBuffer | string | string[], options?: Partial<IStaticSoundBufferOptions>): Promise<StaticSoundBuffer>;
    static CreateStaticSound(name: string, source: ArrayBuffer | AudioBuffer | StaticSoundBuffer | string | string[], options: Partial<IStaticSoundOptions>): Promise<StaticSound>;
    static CreateStreamingSound(name: string, source: HTMLMediaElement | string | string[], options?: Partial<IStreamingSoundOptions>): Promise<StreamingSound>;
}
export declare class CharacterController extends ScriptComponent {
    static TERMINAL_VELOCITY: number;
    static SLOPE_GRAVITY_FORCE: number;
    static UPHILL_GRAVITY_FORCE: number;
    static STATIC_GRAVITY_FORCE: number;
    static DEFAULT_GRAVITY_FORCE: number;
    static DEFAULT_JUMPING_TIMER: number;
    static DEFAULT_SLIDING_TIMER: number;
    static DEFAULT_CHARACTER_MASS: number;
    static MIN_GROUND_CHECK_DISTANCE: number;
    static MIN_GROUND_CHECK_SKINWIDTH: number;
    static MIN_GROUND_CHECK_SLOPEANGLE: number;
    private _avatarRadius;
    private _avatarHeight;
    private _centerOffset;
    private _slopeLimit;
    private _skinWidth;
    private _stepHeight;
    private _minMoveDistance;
    private _slopeSlideSpeed;
    private _slopeAngleRadians;
    private _slopeAngleDegrees;
    private _slopeMoveDirection;
    private _verticalVelocity;
    private _verticalStepSpeed;
    private _minimumStepHeight;
    private _collisionEvents;
    private _targetRotation;
    private _targetVelocity;
    private _currentVelocity;
    private _inputVelocity;
    private _gravityFactor;
    private _minJumpTimer;
    private _maxSlopeTimer;
    private _isSliding;
    private _isGrounded;
    private _isSteppingUp;
    private _hitColor;
    private _noHitColor;
    private _groundRay;
    private _groundRayHelper;
    private _groundHitPointMesh;
    private _stepCheckOriginMesh;
    private _stepCheckHitPointMesh;
    private _stepCheckDestinationMesh;
    private _stepCheckRayHelper;
    private _stepCheckRay;
    private _groundRaycastShape;
    private _groundCollisionNode;
    private _groundRaycastOffset;
    private _groundRaycastOrigin;
    private _groundRaycastDirection;
    private _groundRaycastDestination;
    private _localGroundShapecastResult;
    private _worldGroundShapecastResult;
    private _stepCheckRaycastOrigin;
    private _stepCheckRaycastDestination;
    private _stepCheckRaycastHitPoint;
    private _stepCheckRaycastResult;
    protected m_moveDeltaX: number;
    protected m_moveDeltaZ: number;
    protected m_havokplugin: any;
    getAvatarRadius(): number;
    getAvatarHeight(): number;
    getCenterOffset(): Vector3;
    getSkinWidth(): number;
    getStepHeight(): number;
    getGravityFactor(): number;
    setGravityFactor(factor: number): void;
    getInputVelocity(): Vector3;
    getVerticalVelocity(): number;
    getSlopeAngleRadians(): number;
    getSlopeAngleDegrees(): number;
    getGroundCollisionNode(): TransformNode;
    getVerticalStepSpeed(): number;
    setVerticalStepSpeed(speed: number): void;
    getMinimumStepHeight(): number;
    setMinimumStepHeight(height: number): void;
    getMinMoveDistance(): number;
    setMinMoveDistance(distance: number): void;
    getSlopeSlideSpeed(): number;
    setSlopeSlideSpeed(speed: number): void;
    getSlopeLimit(): number;
    setSlopeLimit(slopeRadians: number): void;
    isSteppingUp(): boolean;
    isGrounded(): boolean;
    isSliding(): boolean;
    canSlide(): boolean;
    canJump(): boolean;
    onUpdatePositionObservable: Observable<TransformNode>;
    onUpdateVelocityObservable: Observable<TransformNode>;
    verticalVelocityOffset: number;
    enableStepOffset: boolean;
    enableGravity: boolean;
    downwardForce: number;
    raycastLength: number;
    showRaycasts: boolean;
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    protected awake(): void;
    protected update(): void;
    protected fixed(): void;
    set(px: number, py: number, pz: number, rx?: number, ry?: number, rz?: number, rw?: number): void;
    move(velocity: Vector3, aux?: boolean): void;
    jump(speed: number): void;
    turn(angle: number): void;
    rotate(x: number, y: number, z: number, w: number): void;
    setRigidBodyMass(mass: number): void;
    setCollisionState(collision: boolean): void;
    private updateGroundedState;
    private updateSlopesAndSlides;
    private createPhysicsBodyAndShape;
    private createPhysicsShapeCapsule;
    private createPhysicsShapeCylinder;
}
export declare class SimpleCharacterController extends ScriptComponent {
    private _eulerAngles;
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    protected start(): void;
    set(px: number, py: number, pz: number, rx?: number, ry?: number, rz?: number, rw?: number, aux?: boolean): void;
    move(velocity: Vector3, aux?: boolean): void;
    jump(speed: number): void;
    turn(angle: number): void;
    rotate(x: number, y: number, z: number, w: number): void;
}
export declare class RecastCharacterController extends ScriptComponent {
    private _eulerAngles;
    private _teleportVector;
    private _navigationAgent;
    getNavigationAgent(): NavigationAgent;
    setNavigationAgent(agent: NavigationAgent): void;
    setDestinationPoint(destination: Vector3, closetPoint?: boolean): void;
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    protected start(): void;
    set(px: number, py: number, pz: number, rx?: number, ry?: number, rz?: number, rw?: number, aux?: boolean): void;
    move(velocity: Vector3, aux?: boolean): void;
    jump(speed: number): void;
    turn(angle: number): void;
    rotate(x: number, y: number, z: number, w: number): void;
}
export declare class HavokRaycastVehicle {
    static WHEEL_SPEED_SCALE: number;
    chassisBody: PhysicsBody;
    wheelInfos: HavokWheelInfo[];
    sliding: boolean;
    world: any;
    indexRightAxis: number;
    indexForwardAxis: number;
    indexUpAxis: number;
    minimumWheelContacts: number;
    smoothFlyingImpulse: number;
    stabilizingForce: number;
    maxImpulseForce: number;
    frictionRestoreSpeed: number;
    maxVisualExtensionLimit: number;
    maxVisualCompressionLimit: number;
    currentVehicleSpeedKmHour: number;
    static MUSTANG_GT_FRONT_WHEEL_CONFIG: {
        suspensionRestLength: number;
        maxSuspensionTravel: number;
        radius: number;
        suspensionStiffness: number;
        dampingCompression: number;
        dampingRelaxation: number;
        frictionSlip: number;
        rollInfluence: number;
        maxSuspensionForce: number;
        isFrontWheel: boolean;
        invertDirection: boolean;
    };
    static MUSTANG_GT_REAR_WHEEL_CONFIG: {
        suspensionRestLength: number;
        maxSuspensionTravel: number;
        radius: number;
        suspensionStiffness: number;
        dampingCompression: number;
        dampingRelaxation: number;
        frictionSlip: number;
        rollInfluence: number;
        maxSuspensionForce: number;
        isFrontWheel: boolean;
        invertDirection: boolean;
    };
    stabilizeVelocity: boolean;
    multiRaycastEnabled: boolean;
    multiRaycastMultiplier: number;
    enableRoughTrackLogging: boolean;
    private frameCounter;
    isArcadeBurnoutModeActive: boolean;
    isArcadeDonutModeActive: boolean;
    isArcadeHandbrakeActive: boolean;
    arcadeFrontSideFactor: number;
    arcadeRearSideFactor: number;
    arcadeHandbrakeTransitionFactor: number;
    isDriftModeEnabled: boolean;
    driftSpeedThreshold: number;
    driftMaxSpeed: number;
    driftSteeringThreshold: number;
    driftGripReduction: number;
    driftTransitionSpeed: number;
    private driftIntensity;
    private previousSteeringInput;
    private steeringChangeRate;
    private driftDirection;
    arcadeSteerAssistFactor: number;
    handbrakePreserveFactor: number;
    donutModeTransitionFactor: number;
    donutEngineMultiplier: number;
    donutTransitionSpeed: number;
    donutTurnRadius: number;
    private donutModeEngaged;
    private donutModeEngineBoost;
    defaultBurnoutCoefficient: number;
    burnoutCoefficient: number;
    burnoutTargetCoefficient: number;
    burnoutTransitionSpeed: number;
    private burnoutModeEngaged;
    private burnoutPowerBoost;
    private baseRotationBoost;
    private donutRotationBoost;
    private currentRotationBoost;
    private currentSteeringInput;
    private handbrakeAngularVelocity;
    private handbrakeEngaged;
    private raycastResult;
    private lastValidPoints;
    private lastValidNormals;
    private lastValidDistances;
    constructor(options: any);
    addWheel(options: any): number;
    getNumWheels(): number;
    getWheelInfo(wheelIndex: number): HavokWheelInfo;
    getSteeringValue(wheelIndex: number): number;
    setSteeringValue(value: number, wheelIndex: number): void;
    applyEngineForce(value: number, wheelIndex: number): void;
    setHandBrake(brake: number, wheelIndex: number): void;
    setWheelRotationBoost(wheelIndex: number, boost: number): void;
    setAllWheelsRotationBoost(boost: number): void;
    setRearWheelsRotationBoost(boost: number): void;
    setFrontWheelsRotationBoost(boost: number): void;
    addToWorld(world: any): void;
    setArcadeSteeringInput(steering: number): void;
    setIsArcadeHandbrakeActive(active: boolean): void;
    setIsArcadeBurnoutModeActive(active: boolean): void;
    getIsArcadeBurnoutModeActive(): boolean;
    setIsArcadeDonutModeActive(active: boolean): void;
    setArcadeFrontSideFactor(factor: number): void;
    setArcadeRearSideFactor(factor: number): void;
    getDonutModeTransitionFactor(): number;
    getEasedDonutModeTransitionFactor(): number;
    getDonutModeEngineBoost(): number;
    isDonutModeEngaged(): boolean;
    setDonutEngineMultiplier(multiplier: number): void;
    setDonutTurnRadius(radius: number): void;
    setDonutTransitionSpeed(speed: number): void;
    setDefaultBurnoutCoefficient(coefficient: number): void;
    getDefaultBurnoutCoefficient(): number;
    setBurnoutCoefficient(coefficient: number): void;
    getBurnoutCoefficient(): number;
    getBurnoutPowerBoost(): number;
    isBurnoutModeEngaged(): boolean;
    setBurnoutTransitionSpeed(speed: number): void;
    setBaseRotationBoost(boost: number): void;
    setDonutRotationBoost(boost: number): void;
    getBaseRotationBoost(): number;
    getDonutRotationBoost(): number;
    getCurrentRotationBoost(): number;
    setLoggingEnabled(enabled: boolean): void;
    getLoggingEnabled(): boolean;
    setMultiRaycastEnabled(enabled: boolean): void;
    getMultiRaycastEnabled(): boolean;
    setMultiRaycastRadiusScale(radiusMultiplier: number): void;
    getMultiRaycastRadiusScale(): number;
    setStabilizeVelocityEnabled(enabled: boolean): void;
    getStabilizeVelocityEnabled(): boolean;
    private applyVelocityBasedStabilization;
    private applyPredictiveNormalStabilization;
    private updateBurnoutCoefficient;
    private updateBurnoutModeActive;
    private updateWheelRotationBoost;
    updateCurrentFrictionSlip(): void;
    getAngularDampingReduction(): number;
    private getEasedDonutTransitionFactor;
    getVehicleAxisWorld(axisIndex: number, result: Vector3): Vector3;
    getCurrentSpeedKmHour(): number;
    private calculateSteeringChangeRate;
    isDriftSystemEnabled(): boolean;
    setDriftSystemEnabled(enabled: boolean): void;
    setDriftMaxSpeed(maxSpeed: number): void;
    getDriftMaxSpeed(): number;
    setDriftSpeedThreshold(threshold: number): void;
    getDriftSpeedThreshold(): number;
    setDriftGripReduction(reduction: number): void;
    getDriftGripReduction(): number;
    setDriftSteeringThreshold(threshold: number): void;
    getDriftSteeringThreshold(): number;
    setDriftSettings(settings: {
        maxSpeed?: number;
        speedThreshold?: number;
        gripReduction?: number;
        steeringThreshold?: number;
    }): void;
    getDriftIntensity(): number;
    isDrifting(): boolean;
    private updateDriftState;
    updateVehicle(timeStep: number): void;
    updateSuspension(deltaTime: number): void;
    removeFromWorld(world: any): void;
    private calculateSurfaceRoughness;
    private isValidDrivableSurface;
    private calculateSurfaceAngle;
    performCasting(wheel: HavokWheelInfo): number;
    updateWheelTransformWorld(wheel: HavokWheelInfo): void;
    updateWheelTransform(wheelIndex: number): void;
    getWheelTransformWorld(wheelIndex: number): TransformNode;
    updateFriction(timeStep: number): void;
    private performSingleRaycast;
    private performThinMultiRaycast;
}
export declare class HavokWheelInfo {
    maxSuspensionTravel: number;
    customSlidingRotationalSpeed: number;
    useCustomSlidingRotationalSpeed: number;
    sliding: boolean;
    chassisConnectionPointLocal: Vector3;
    chassisConnectionPointWorld: Vector3;
    directionLocal: Vector3;
    directionWorld: Vector3;
    axleLocal: Vector3;
    axleWorld: Vector3;
    suspensionRestLength: number;
    suspensionMaxLength: number;
    radius: number;
    suspensionStiffness: number;
    dampingCompression: number;
    dampingRelaxation: number;
    frictionSlip: number;
    frictionPenalty: boolean;
    frictionLerping: boolean;
    steering: number;
    rotation: number;
    deltaRotation: number;
    rollInfluence: number;
    maxSuspensionForce: number;
    engineForce: number;
    brake: number;
    isFrontWheel: boolean;
    clippedInvContactDotSuspension: number;
    suspensionRelativeVelocity: number;
    suspensionForce: number;
    skidInfo: number;
    slipInfo: number;
    suspensionLength: number;
    sideImpulse: number;
    forwardImpulse: number;
    raycastResult: PhysicsRaycastResult;
    physicsShape: PhysicsShapeSphere;
    worldTransform: TransformNode;
    visualTravelRange: number;
    invertDirection: boolean;
    isInContact: boolean;
    hub: TransformNode;
    spinner: TransformNode;
    defaultFriction: number;
    steeringAngle: number;
    rotationBoost: number;
    locked: boolean;
    skidinfo: number;
    skidThreshold: number;
    lateralImpulse: number;
    constructor(options: any);
    updateWheel(chassis: any): void;
}
export declare class HavokVehicleUtilities {
    static directions: Vector3[];
    static calcRollingFriction_vel1: Vector3;
    static calcRollingFriction_vel2: Vector3;
    static calcRollingFriction_vel: Vector3;
    static updateFriction_surfNormalWS_scaled_proj: Vector3;
    static updateFriction_axle: Vector3[];
    static updateFriction_forwardWS: Vector3[];
    static sideFrictionStiffness2: number;
    static castRay_rayvector: Vector3;
    static castRay_target: Vector3;
    static torque: Vector3;
    static tmpVec1: Vector3;
    static tmpVec2: Vector3;
    static tmpVec3: Vector3;
    static tmpVec4: Vector3;
    static tmpVec5: Vector3;
    static tmpVec6: Vector3;
    static tmpVel2: Vector3;
    static tmpMat1: Matrix;
    static velocityAt: (body: PhysicsBody, pos: any, res: any) => any;
    static bodyPosition: (body: PhysicsBody, res: any) => any;
    static bodyLinearVelocity: (body: PhysicsBody, res: any) => any;
    static bodyAngularVelocity: (body: PhysicsBody, res: any) => any;
    static bodyTransform: (body: PhysicsBody, res: any) => any;
    static addImpulseAt: (body: PhysicsBody, impulse: any, point: any) => void;
    static addForceAt: (body: PhysicsBody, force: any, point: any) => void;
    static bodyOrientation: (body: PhysicsBody, res: any) => any;
    static bodyMass: (body: PhysicsBody) => number;
    static bodyInvMass: (body: PhysicsBody) => number;
    static bodyInertiaWorld: (body: PhysicsBody, res: any) => any;
    static calcRollingFriction(body0: PhysicsBody, body1: PhysicsBody, frictionPosWorld: any, frictionDirectionWorld: any, maxImpulse: any, numWheelsOnGround?: number): number;
    static computeImpulseDenominator_r0: Vector3;
    static computeImpulseDenominator_c0: Vector3;
    static computeImpulseDenominator_vec: Vector3;
    static computeImpulseDenominator_m: Vector3;
    static bodyPositionVec: Vector3;
    static bodyInertiaVec: Vector3;
    static computeImpulseDenominator(body: PhysicsBody, pos: any, normal: any): number;
    static resolveSingleBilateral_vel1: Vector3;
    static resolveSingleBilateral_vel2: Vector3;
    static resolveSingleBilateral_vel: Vector3;
    static resolveSingleBilateral(body1: PhysicsBody, pos1: any, body2: PhysicsBody, pos2: any, normal: any): number;
    static chassis_velocity_at_contactPoint: Vector3;
    static relpos: Vector3;
    static Utilsdefaults: (options: any, defaults: any) => any;
}
export declare class NavigationAgent extends ScriptComponent {
    static TARGET_ANGLE_FACTOR: number;
    static ANGULAR_SPEED_RATIO: number;
    static GLOBAL_CROWD_INSTANCE: boolean;
    private crowd;
    private type;
    private speed;
    private baseOffset;
    private avoidRadius;
    private avoidHeight;
    private acceleration;
    private areaMask;
    private autoRepath;
    private autoBraking;
    private autoTraverseOffMeshLink;
    private avoidancePriority;
    private obstacleAvoidanceType;
    private distanceToTarget;
    private teleporting;
    private moveDirection;
    private resetPosition;
    private lastPosition;
    private distancePosition;
    private currentPosition;
    private currentRotation;
    private currentVelocity;
    private currentWaypoint;
    heightOffset: number;
    angularSpeed: number;
    updatePosition: boolean;
    updateRotation: boolean;
    distanceEpsilon: number;
    velocityEpsilon: number;
    offMeshVelocity: number;
    stoppingDistance: number;
    isReady(): boolean;
    isNavigating(): boolean;
    isTeleporting(): boolean;
    isOnOffMeshLink(): boolean;
    getAgentType(): number;
    getAgentState(): number;
    getAgentIndex(): number;
    getAgentOffset(): number;
    getTargetDistance(): number;
    getCurrentPosition(): Vector3;
    getCurrentRotation(): Quaternion;
    getCurrentVelocity(): Vector3;
    getAgentParameters(): IAgentParameters;
    setAgentParameters(parameters: IAgentParameters): void;
    onReadyObservable: Observable<TransformNode>;
    onPreUpdateObservable: Observable<TransformNode>;
    onPostUpdateObservable: Observable<TransformNode>;
    onNavCompleteObservable: Observable<TransformNode>;
    protected m_agentState: number;
    protected m_agentIndex: number;
    protected m_agentReady: boolean;
    protected m_agentGhost: TransformNode;
    protected m_agentParams: IAgentParameters;
    protected m_agentMovement: Vector3;
    protected m_agentDirection: Vector3;
    protected m_agentQuaternion: Quaternion;
    protected m_agentDestination: Vector3;
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    protected awake(): void;
    protected update(): void;
    protected destroy(): void;
    private awakeNavigationAgent;
    private updateNavigationAgent;
    private updateAgentParameters;
    private destroyNavigationAgent;
    move(offset: Vector3, closetPoint?: boolean): void;
    teleport(destination: Vector3, closetPoint?: boolean): void;
    setDestination(destination: Vector3, closetPoint?: boolean): void;
    setAcceleration(speed: number): void;
    setMovementSpeed(speed: number): void;
    setSeparationWeight(weight: number): void;
    setOptimizationRange(range: number): void;
    setCollisionQueryRange(range: number): void;
    setAgentRadius(radius: number): void;
    setAgentHeight(height: number): void;
    getAgentVelocity(): Vector3;
    getAgentVelocityToRef(result: Vector3): void;
    getAgentPosition(): Vector3;
    getAgentPositionToRef(result: Vector3): void;
    getAgentWaypoint(): Vector3;
    getAgentWaypointToRef(result: Vector3): void;
    cancelNavigation(): void;
}
export declare enum CrowdAgentState {
    DT_CROWDAGENT_STATE_INVALID = 0,
    DT_CROWDAGENT_STATE_WALKING = 1,
    DT_CROWDAGENT_STATE_OFFMESH = 2
}
export declare class RaycastVehicle {
    private _centerMass;
    private _chassisMesh;
    private _tempVectorPos;
    lockedWheelIndexes: number[];
    getPhysicsBody(): PhysicsBody;
    getNumWheels(): number;
    getWheelInfo(wheel: number): HavokWheelInfo;
    getWheelTransform(wheel: number): TransformNode;
    updateWheelTransform(wheel: number): void;
    getRawCurrentSpeedKph(): number;
    getRawCurrentSpeedMph(): number;
    getAbsCurrentSpeedKph(): number;
    getAbsCurrentSpeedMph(): number;
    protected m_vehicleColliders: any[];
    protected m_vehicle: HavokRaycastVehicle;
    protected m_scene: Scene;
    constructor(scene: Scene, entity: TransformNode, center: Vector3);
    dispose(): void;
    setHandBrake(brake: number, wheel: number): void;
    setEngineForce(power: number, wheel: number): void;
    applyEngineBrake(brake: number, smoothing?: number): void;
    getWheelIndexByID(id: string): number;
    getWheelIndexByName(name: string): number;
    getWheelColliderInfo(wheel: number): number;
    getVisualSteeringAngle(wheel: number): number;
    setVisualSteeringAngle(angle: number, wheel: number): void;
    getPhysicsSteeringAngle(wheel: number): number;
    setPhysicsSteeringAngle(angle: number, wheel: number): void;
    getFrictionUpdateSpeed(): number;
    setFrictionUpdateSpeed(lerpSpeed: number): void;
    setArcadeSteeringInput(steering: number): void;
    getArcadeSteerAssistFactor(): number;
    setArcadeSteerAssistFactor(factor: number): void;
    getHandbrakePreserveFactor(): number;
    setHandbrakePreserveFactor(factor: number): void;
    getIsArcadeHandbrakeActive(): boolean;
    setIsArcadeHandbrakeActive(active: boolean): void;
    getIsArcadeBurnoutModeActive(): boolean;
    setIsArcadeBurnoutModeActive(active: boolean): void;
    getIsArcadeDonutModeActive(): boolean;
    setIsArcadeDonutModeActive(active: boolean): void;
    getDonutModeTransitionFactor(): number;
    getEasedDonutModeTransitionFactor(): number;
    getDonutModeEngineBoost(): number;
    isDonutModeEngaged(): boolean;
    setDonutEngineMultiplier(multiplier: number): void;
    setDonutTurnRadius(radius: number): void;
    setDonutTransitionSpeed(speed: number): void;
    getAngularDampingReduction(): number;
    getArcadeFrontSideFactor(): number;
    setArcadeFrontSideFactor(factor: number): void;
    getArcadeRearSideFactor(): number;
    setArcadeRearSideFactor(factor: number): void;
    setWheelRotationBoost(wheelIndex: number, boost: number): void;
    setAllWheelsRotationBoost(boost: number): void;
    setRearWheelsRotationBoost(boost: number): void;
    setFrontWheelsRotationBoost(boost: number): void;
    isDriftSystemEnabled(): boolean;
    setDriftSystemEnabled(enabled: boolean): void;
    setDriftMaxSpeed(maxSpeed: number): void;
    getDriftMaxSpeed(): number;
    setDriftSpeedThreshold(threshold: number): void;
    getDriftSpeedThreshold(): number;
    setDriftGripReduction(reduction: number): void;
    getDriftGripReduction(): number;
    setDriftSteeringThreshold(threshold: number): void;
    getDriftSteeringThreshold(): number;
    isBurnoutModeEngaged(): boolean;
    setBaseRotationBoost(multiplier: number): void;
    getBaseRotationBoost(): number;
    setDonutRotationBoost(multiplier: number): void;
    getDonutRotationBoost(): number;
    getBurnoutPowerBoost(): number;
    setBurnoutTransitionSpeed(speed: number): void;
    setDefaultBurnoutCoefficient(coefficient: number): void;
    getDefaultBurnoutCoefficient(): number;
    getStabilizingForce(): number;
    setStabilizingForce(force: number): void;
    getSmoothFlyingImpulse(): number;
    setSmoothFlyingImpulse(impulse: number): void;
    getMaxVisualExtensionLimit(): number;
    setMaxVisualExtensionLimit(limit: number): void;
    getMaxVisualCompressionLimit(): number;
    setMaxVisualCompressionLimit(limit: number): void;
    setLoggingEnabled(enabled: boolean): void;
    getLoggingEnabled(): boolean;
    setMultiRaycastEnabled(enable: boolean): void;
    getMultiRaycastEnabled(): boolean;
    setMultiRaycastRadiusScale(scale: number): void;
    getMultiRaycastRadiusScale(): number;
    setStabilizeVelocityEnabled(enabled: boolean): void;
    getStabilizeVelocityEnabled(): boolean;
    protected setupWheelInformation(): void;
    tickVehicleController(step: number): void;
    updateWheelInformation(): void;
    protected lockedWheelInformation(wheel: number): boolean;
    protected deleteWheelInformation(): void;
}
export declare class RigidbodyPhysics extends ScriptComponent {
    static PHYSICS_STEP_TIME: number;
    private static RaycastResult;
    private static LocalShapeResult;
    private static WorldShapeResult;
    private static RaycastDestination;
    private _isKinematic;
    private _centerOfMass;
    protected m_raycastVehicle: any;
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    protected awake(): void;
    protected update(): void;
    protected late(): void;
    protected destroy(): void;
    protected awakeRigidbodyState(): void;
    protected updateRigidbodyState(): void;
    protected lateRigidbodyState(): void;
    protected destroyRigidbodyState(): void;
    isKinematic(): boolean;
    hasWheelColliders(): boolean;
    getRaycastVehicle(): any;
    static GetHavokInstance(): any;
    static Raycast(origin: Vector3, direction: Vector3, length: number, query?: IRaycastQuery): PhysicsRaycastResult;
    static Shapecast(query: IPhysicsShapeCastQuery): IPhysicsShapeCastResult;
    static RaycastToRef(from: Vector3, to: Vector3, result: PhysicsRaycastResult, query?: IRaycastQuery): void;
    static ShapecastToRef(query: IPhysicsShapeCastQuery, localShapeResult: ShapeCastResult, worldShapeResult: ShapeCastResult): void;
    static SetMaxVelocities(maxLinVel: number, maxAngVel: number): void;
    static PhysicsShapeCache: any;
    static NewPhysicsShapeCount: number;
    static CachedPhysicsShapeCount: number;
    static DebugPhysicsViewer: any;
    static OnSetupPhysicsPlugin: (scene: Scene) => void;
    static ConfigurePhysicsEngine(scene: Scene, fixedTimeStep?: boolean, subTimeStep?: number, maxWorldSweep?: number, ccdEnabled?: boolean, ccdPenetration?: number, gravityLevel?: Vector3): Promise<void>;
    static SetupPhysicsComponent(scene: Scene, entity: TransformNode): void;
    protected static GetPhysicsMaterialCombine(unity: number): number;
    protected static GetCachedPhysicsMeshShape(scene: Scene, entity: TransformNode, meshkey: string, staticfriction: number, dynamicfriction: number, restitution: number, fcombine: number, rcombine: number, layer: number, filter: number): PhysicsShapeMesh;
    protected static GetCachedPhysicsConvexHullShape(scene: Scene, entity: TransformNode, meshkey: string, staticfriction: number, dynamicfriction: number, restitution: number, fcombine: number, rcombine: number, layer: number, filter: number): PhysicsShapeConvexHull;
    protected static GetCachedPhysicsBoxShape(scene: Scene, trigger: boolean, staticfriction: number, dynamicfriction: number, restitution: number, fcombine: number, rcombine: number, layer: number, filter: number): PhysicsShapeBox;
    protected static GetCachedPhysicsSphereShape(scene: Scene, trigger: boolean, staticfriction: number, dynamicfriction: number, restitution: number, fcombine: number, rcombine: number, layer: number, filter: number): PhysicsShapeSphere;
    protected static GetCachedPhysicsCapsuleShape(scene: Scene, trigger: boolean, staticfriction: number, dynamicfriction: number, restitution: number, fcombine: number, rcombine: number, layer: number, filter: number): PhysicsShapeCapsule;
    protected static GetCachedPhysicsCylinderShape(scene: Scene, trigger: boolean, staticfriction: number, dynamicfriction: number, restitution: number, fcombine: number, rcombine: number, layer: number, filter: number): PhysicsShapeCylinder;
    protected static CreateStandardPhysicsShapeAndBody(scene: Scene, entity: TransformNode, metadata: any, impostortype: number, istrigger: boolean, istruestatic: boolean, motiontype: PhysicsMotionType, mass: number, staticfriction: number, dynamicfriction: number, restitution: number, fcombine: number, rcombine: number, terraindata: any, com: any, persist: boolean, layer: number, filter: number): void;
    protected static CreateCompoundPhysicsShapeAndBody(scene: Scene, root: TransformNode, entity: TransformNode, element: any, impostortype: number, staticfriction: number, dynamicfriction: number, restitution: number, fcombine: number, rcombine: number, sitems: PhyscisContainerData[], item: PhyscisContainerData, center: any, complex: boolean, trigger: boolean, persist: boolean, layer: number, filter: number): void;
    protected static CreateHeightFieldTerrainShapeFromMesh(terrainMesh: Mesh, scaleX: number, scaleZ: number): any;
    static GetPhysicsHeapSize(): number;
    static ConfigRigidbodyPhysics(scene: Scene, entity: TransformNode, child: boolean, trigger: boolean, physics: any, mass: number, com: Vector3): void;
    static CreatePhysicsMetadata(mass: number, drag?: number, angularDrag?: number, centerMass?: Vector3): any;
    static CreateCollisionMetadata(type: string, trigger?: boolean, convexmesh?: boolean, restitution?: number, dynamicfriction?: number, staticfriction?: number): any;
    static CreatePhysicsProperties(mass: number, drag?: number, angularDrag?: number, useGravity?: boolean, isKinematic?: boolean): any;
    protected static AddChildShapeFromParent(containerShape: PhysicsShape, parentTransform: TransformNode, newChild: PhysicsShape, childTransform: TransformNode): void;
    static NoImpostor: number;
    static SphereImpostor: number;
    static BoxImpostor: number;
    static PlaneImpostor: number;
    static MeshImpostor: number;
    static CapsuleImpostor: number;
    static CylinderImpostor: number;
    static ParticleImpostor: number;
    static HeightmapImpostor: number;
    static ConvexHullImpostor: number;
    static CustomImpostor: number;
    static RopeImpostor: number;
    static ClothImpostor: number;
    static SoftbodyImpostor: number;
}
export declare class PhyscisContainerData {
    shape: PhysicsShape;
    translation: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}
export interface IPhysicsShapeCastResult {
    local: ShapeCastResult;
    world: ShapeCastResult;
}
export interface IPhysicsShapeCastQuery {
    shape: PhysicsShape;
    rotation: Quaternion;
    startPosition: Vector3;
    endPosition: Vector3;
    shouldHitTriggers: boolean;
    ignoreBody?: PhysicsBody;
}
export declare class ShurikenParticles extends ScriptComponent {
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    protected awake(): void;
    protected start(): void;
    protected ready(): void;
    protected update(): void;
    protected late(): void;
    protected step(): void;
    protected fixed(): void;
    protected after(): void;
    protected destroy(): void;
}
export declare class TerrainGenerator extends ScriptComponent {
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    protected awake(): void;
    protected start(): void;
    protected ready(): void;
    protected update(): void;
    protected late(): void;
    protected step(): void;
    protected fixed(): void;
    protected after(): void;
    protected destroy(): void;
}
export declare class WebVideoPlayer extends ScriptComponent implements IAssetPreloader {
    private videoLoop;
    private videoMuted;
    private videoAlpha;
    private videoFaded;
    private videoPoster;
    private videoInvert;
    private videoSample;
    private videoVolume;
    private videoMipmaps;
    private videoPlayback;
    private videoPlayOnAwake;
    private videoPreloaderUrl;
    private videoBlobUrl;
    private videoPreload;
    private _initializedReadyInstance;
    getVideoMaterial(): StandardMaterial;
    getVideoTexture(): VideoTexture;
    getVideoElement(): HTMLVideoElement;
    getVideoScreen(): AbstractMesh;
    getVideoBlobUrl(): string;
    onReadyObservable: Observable<VideoTexture>;
    protected m_abstractMesh: AbstractMesh;
    protected m_videoTexture: VideoTexture;
    protected m_videoMaterial: StandardMaterial;
    protected m_diffuseIntensity: number;
    constructor(transform: TransformNode, scene: Scene, properties?: any, alias?: string);
    protected awake(): void;
    protected destroy(): void;
    protected awakeWebVideoPlayer(): void;
    protected destroyWebVideoPlayer(): void;
    isReady(): boolean;
    isPlaying(): boolean;
    isPaused(): boolean;
    play(): Promise<boolean>;
    private internalPlay;
    private checkedPlay;
    private checkedRePlay;
    pause(): boolean;
    mute(): boolean;
    unmute(): boolean;
    getVolume(): number;
    setVolume(volume: number): boolean;
    setDataSource(source: string | string[] | HTMLVideoElement): void;
    revokeVideoBlobUrl(): void;
    addPreloaderTasks(assetsManager: PreloadAssetsManager): void;
}
//# sourceMappingURL=scenemanager.d.ts.map