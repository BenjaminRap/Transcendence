var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { getSceneData, SceneData } from "../SceneData.js";
import { TimerManager } from "../attachedScripts/TimerManager.js";
import { Imported } from "../ImportedDecorator.js";
import { zodNumber } from "../ImportedHelpers.js";
import { CustomScriptComponent } from "../CustomScriptComponent.js";
import { ShapeCastResult } from "@babylonjs/core/Physics/shapeCastResult";
import { PongError } from "../pongError/PongError.js";
export class Ball extends CustomScriptComponent {
    static { this._startMaxAngleRadian = Math.PI / 6; }
    constructor(transform, scene, properties = {}, alias = "Ball") {
        super(transform, scene, properties, alias);
        this._startsRight = true;
        this._ballStartTimeout = null;
        this._startDirection = Vector3.Right();
        this._initialPosition = transform.position.clone();
        this._sceneData = getSceneData(this.scene);
        this.setBallRandomStartDirection();
        this._sceneData.events.getObservable("game-start").add(() => {
            this.launch();
        });
    }
    start() {
        const physicsBody = this.transform.getPhysicsBody();
        if (!physicsBody)
            throw new PongError("The Ball script should be attached to a mesh with a physic body !", "quitScene");
        this._physicsBody = physicsBody;
        this._physicsBody.disablePreStep = false;
    }
    launch() {
        this.reset();
        this._ballStartTimeout = this._timerManager.setTimeout(() => {
            this.transform.position.copyFrom(this._initialPosition);
            const velocity = this._startDirection.scale(this._initialSpeed);
            if (this._sceneData.gameType !== "Multiplayer")
                this.setBallRandomStartDirection();
            this._physicsBody.setLinearVelocity(velocity);
            this._ballStartTimeout = null;
        }, this._goalTimeoutMs);
    }
    getColliderPenetration(collider, axis) {
        const colliderPos = collider.absolutePosition[axis];
        const ballPos = this.transform.absolutePosition[axis];
        const colliderWidth = collider.absoluteScaling.x;
        const ballWidth = this.transform.absoluteScaling.x;
        const colliderPenetration = (ballPos < colliderPos) ?
            (colliderPos - colliderWidth / 2) - (ballPos + ballWidth / 2) :
            (colliderPos + colliderWidth / 2) - (ballPos - ballWidth / 2);
        return colliderPenetration;
    }
    reverseColliderPenetration(collider, axis) {
        const colliderPenetration = this.getColliderPenetration(collider, axis);
        const velocity = this._physicsBody.getLinearVelocity();
        const oppositeAxis = (axis === "x") ? "y" : "x";
        const slope = velocity[oppositeAxis] / velocity[axis];
        const displacement = new Vector3();
        displacement[axis] = colliderPenetration;
        displacement[oppositeAxis] = colliderPenetration * slope;
        const newAbsolutionPosition = this.transform.absolutePosition.add(displacement);
        this.transform.setAbsolutePosition(newAbsolutionPosition);
    }
    reset() {
        if (this._ballStartTimeout !== null) {
            this._timerManager.clearTimer(this._ballStartTimeout);
            this._ballStartTimeout = null;
        }
        this.transform.position.copyFrom(this._initialPosition);
        this._physicsBody.setLinearVelocity(Vector3.Zero());
    }
    setBallRandomStartDirection() {
        const sideVector = this._startsRight ? Vector3.Right() : Vector3.Left();
        const angle = (Math.random() - 0.5) * Ball._startMaxAngleRadian * 2;
        const rotation = Quaternion.RotationAxis(Vector3.LeftHandedForwardReadOnly, angle);
        this._startDirection = sideVector.applyRotationQuaternion(rotation);
        this._startsRight = !this._startsRight;
    }
    setBallStartDirection(direction) {
        this._startDirection = direction;
    }
    getBallStartDirection() {
        return this._startDirection;
    }
    shapeCast(startPosition, endPosition) {
        const shapeLocalResult = new ShapeCastResult();
        const hitWorldResult = new ShapeCastResult();
        const query = {
            shape: this._physicsBody.shape,
            rotation: this.transform.rotationQuaternion,
            startPosition: startPosition,
            endPosition: endPosition,
            shouldHitTriggers: true,
            ignoreBody: this._physicsBody
        };
        this._sceneData.havokPlugin.shapeCast(query, shapeLocalResult, hitWorldResult);
        return hitWorldResult;
    }
    getLinearVelocity() {
        return this._physicsBody.getLinearVelocity();
    }
    setLinearVelocity(linearVelocity) {
        if (this._ballStartTimeout !== null)
            return;
        this._physicsBody.setLinearVelocity(linearVelocity);
    }
    isInResetTimeout() {
        return (this._ballStartTimeout !== null);
    }
}
__decorate([
    Imported("TimerManager")
], Ball.prototype, "_timerManager", void 0);
__decorate([
    Imported(zodNumber)
], Ball.prototype, "_initialSpeed", void 0);
__decorate([
    Imported(zodNumber)
], Ball.prototype, "_goalTimeoutMs", void 0);
SceneManager.RegisterClass("Ball", Ball);
