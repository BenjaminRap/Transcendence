var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { getSceneData } from "../SceneData.js";
import { CustomScriptComponent } from "../CustomScriptComponent.js";
import { Imported } from "../ImportedDecorator.js";
import { PongError } from "../pongError/PongError.js";
export class Platform extends CustomScriptComponent {
    constructor(transform, scene, properties = {}, alias = "Platform") {
        super(transform, scene, properties, alias);
        const sceneData = getSceneData(this.scene);
        sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEnter.bind(this));
    }
    onTriggerEnter(collision) {
        if (collision.type !== PhysicsEventType.TRIGGER_ENTERED
            || collision.collidedAgainst !== this._physicsBody
            || collision.collider.transformNode !== this._ball.transform)
            return;
        this._ball.reverseColliderPenetration(this.transform, "y");
        const currentVelocity = this._ball.getLinearVelocity();
        const newVelocity = this.getNewVelocity(currentVelocity);
        this._ball.setLinearVelocity(newVelocity);
    }
    getNewVelocity(currentVelocity) {
        let newVelocity = currentVelocity.clone();
        newVelocity.applyRotationQuaternionInPlace(this.transform.rotationQuaternion.invert());
        newVelocity.x *= -1;
        newVelocity.applyRotationQuaternionInPlace(this.transform.rotationQuaternion);
        return (newVelocity);
    }
    start() {
        const physicsBody = this.transform.getPhysicsBody();
        if (!physicsBody)
            throw new PongError("The Platform script should be attached to a mesh with a physic body !", "quitScene");
        this._physicsBody = physicsBody;
    }
}
__decorate([
    Imported("Ball")
], Platform.prototype, "_ball", void 0);
SceneManager.RegisterClass("Platform", Platform);
