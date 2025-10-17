import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AssetContainer } from '@babylonjs/core/assetContainer';
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
export declare class PrefabObjectPool {
    private prefabName;
    private allowGrowth;
    private assetContainer;
    private cloneAnimations;
    private makeNewMaterials;
    private availableInstances;
    getAvailableCount(): number;
    constructor(container: AssetContainer | Scene, prefabName: string, prefabCount?: number, allowGrowth?: boolean, makeNewMaterials?: boolean, cloneAnimations?: boolean);
    populatePool(count: number): void;
    getInstance(position?: Vector3, rotation?: Quaternion): TransformNode;
    freeInstance(instance: TransformNode): void;
    private appendNewInstance;
    private createNewInstance;
}
//# sourceMappingURL=prefabobjectpool.d.ts.map