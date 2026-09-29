import { SceneManager } from './scenemanager';
import { AssetContainer } from '@babylonjs/core/assetContainer';
import { Quaternion } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
export class PrefabObjectPool {
    getAvailableCount() { return this.availableInstances.length; }
    constructor(container, prefabName, prefabCount = 1, allowGrowth = true, makeNewMaterials = false, cloneAnimations = true) {
        this.prefabName = null;
        this.allowGrowth = true;
        this.assetContainer = null;
        this.cloneAnimations = true;
        this.makeNewMaterials = false;
        this.availableInstances = null;
        this.prefabName = prefabName;
        this.allowGrowth = allowGrowth;
        this.assetContainer = container;
        this.cloneAnimations = cloneAnimations;
        this.makeNewMaterials = makeNewMaterials;
        this.availableInstances = [];
        this.populatePool(prefabCount);
    }
    populatePool(count) {
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                const instance = this.createNewInstance();
                if (instance != null)
                    this.freeInstance(instance);
            }
        }
    }
    getInstance(position = null, rotation = null) {
        const instance = (this.availableInstances.length > 0) ? this.availableInstances.pop() : this.appendNewInstance();
        if (instance != null) {
            if (position != null)
                instance.position.copyFrom(position);
            else
                instance.position.set(0, 0, 0);
            if (rotation != null) {
                if (instance.rotationQuaternion != null)
                    instance.rotationQuaternion.copyFrom(rotation);
                else
                    instance.rotationQuaternion = rotation.clone();
            }
            else {
                if (instance.rotationQuaternion != null)
                    instance.rotationQuaternion.set(0, 0, 0, 1);
                else
                    instance.rotationQuaternion = new Quaternion(0, 0, 0, 1);
            }
            instance.name = (this.prefabName + ".Instance");
            instance.setEnabled(true);
        }
        return instance;
    }
    freeInstance(instance) {
        if (instance != null) {
            instance.setEnabled(false);
            instance.position.set(0, 0, 0);
            if (instance.rotationQuaternion != null)
                instance.rotationQuaternion.set(0, 0, 0, 1);
            else
                instance.rotationQuaternion = new Quaternion(0, 0, 0, 1);
            if (instance.metadata != null && instance.metadata.toolkit != null && instance.metadata.toolkit.components != null) {
                instance.metadata.toolkit.components.forEach((script) => {
                    if (script != null) {
                        try {
                            script.resetScriptComponent();
                        }
                        catch (e) { }
                    }
                });
            }
            instance.name = (this.prefabName + ".Unassigned");
            this.availableInstances.push(instance);
        }
    }
    appendNewInstance() {
        let result = null;
        if (this.allowGrowth === true) {
            result = this.createNewInstance();
        }
        return result;
    }
    createNewInstance(newParent = null, newPosition = null, newRotation = null, newScaling = null) {
        let result = null;
        if (this.assetContainer != null && this.prefabName != null && this.prefabName !== "") {
            if (this.assetContainer instanceof AssetContainer) {
                result = SceneManager.InstantiatePrefabFromContainer(this.assetContainer, this.prefabName, (this.prefabName + ".Instance"), newParent, newPosition, newRotation, newScaling, this.cloneAnimations, this.makeNewMaterials);
            }
            else if (this.assetContainer instanceof Scene) {
                result = SceneManager.InstantiatePrefabFromScene(this.assetContainer, this.prefabName, (this.prefabName + ".Instance"), newParent, newPosition, newRotation, newScaling, this.cloneAnimations);
            }
        }
        return result;
    }
}
