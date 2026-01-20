var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsShape, PhysicsShapeContainer } from "@babylonjs/core/Physics/v2/physicsShape";
import { PhysicsMotionType, Quaternion, Vector3 } from "@babylonjs/core";
import zod from "zod";
import { Imported } from "../ImportedDecorator.js";
import { zodVector3 } from "../ServerMessage.js";
import { CustomScriptComponent } from "../CustomScriptComponent.js";
import { PongError } from "../pongError/PongError.js";
const zodSerializedShape = zod.object({
    type: zod.int(),
    center: zodVector3,
    isTrigger: zod.boolean(),
    extents: zodVector3.nullable(),
    radius: zod.number().nullable()
});
const zodPhysicsMotionType = zod.literal([0, 1, 2]);
export class ColliderGenerator extends CustomScriptComponent {
    constructor(transform, scene, properties = {}, alias = "ColliderGenerator") {
        super(transform, scene, properties, alias);
        this._shapeProperties = [];
    }
    awake() {
        if (this._shapeProperties.length == 0)
            return;
        let shape = this.getPhysicsShape();
        let body = new PhysicsBody(this.transform, this._physicsMotionType, false, this.scene);
        body.shape = shape;
    }
    getPhysicsShape() {
        if (this._shapeProperties.length == 0)
            throw new PongError("GetPhysicsShape called with an empty shapeProperties list !", "quitScene");
        if (this._shapeProperties.length == 1)
            return (this.getShapeFromSerializable(this._shapeProperties[0]));
        let parentShape = new PhysicsShapeContainer(this.scene);
        this._shapeProperties.forEach((properties) => {
            const shape = this.getShapeFromSerializable(properties);
            parentShape.addChild(shape);
        });
        return (parentShape);
    }
    getShapeFromSerializable(properties) {
        let shape = new PhysicsShape({
            type: properties.type,
            parameters: {
                center: this.getVector3FromIUnityVector3(properties.center),
                rotation: Quaternion.Identity(),
                extents: properties.extents ? this.getVector3FromIUnityVector3(properties.extents) : undefined
            }
        }, this.scene);
        shape.isTrigger = properties.isTrigger;
        return shape;
    }
    getVector3FromIUnityVector3(vector3) {
        if (vector3 === undefined)
            return (undefined);
        return new Vector3(vector3.x, vector3.y, vector3.z);
    }
}
__decorate([
    Imported(zodSerializedShape, true)
], ColliderGenerator.prototype, "_shapeProperties", void 0);
__decorate([
    Imported(zodPhysicsMotionType)
], ColliderGenerator.prototype, "_physicsMotionType", void 0);
SceneManager.RegisterClass("ColliderGenerator", ColliderGenerator);
