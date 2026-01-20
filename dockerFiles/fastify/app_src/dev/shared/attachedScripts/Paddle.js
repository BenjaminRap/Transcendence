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
import { InputManager, PlayerInput } from "./InputManager.js";
import { PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { Clamp } from "@babylonjs/core";
import { getSceneData } from "../SceneData.js";
import { Imported } from "../ImportedDecorator.js";
import { zodInt } from "../ImportedHelpers.js";
import { CustomScriptComponent } from "../CustomScriptComponent.js";
import { Range } from "../Range.js";
import { PongError } from "../pongError/PongError.js";
export class Paddle extends CustomScriptComponent {
    static { this._range = 7.56; }
    static { this._hitAcceleration = 1.05; }
    static { this._ballXSpeedRange = new Range(8, 12); }
    static { this._ballmaxSpeed = 16; }
    static { this._speed = 9; }
    static { this._maxAngle = Math.PI / 3; }
    constructor(transform, scene, properties = {}, alias = "Paddle") {
        super(transform, scene, properties, alias);
        this._canMove = false;
        this._initialPosition = this.transform.position.clone();
        const sceneData = getSceneData(this.scene);
        sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEnter.bind(this));
        sceneData.events.getObservable("game-start").add(() => {
            this._canMove = true;
            this.reset();
        });
        sceneData.events.getObservable("end").add(() => {
            this._physicsBody.setLinearVelocity(Vector3.ZeroReadOnly);
            this._canMove = false;
        });
    }
    onTriggerEnter(collision) {
        if (collision.type !== PhysicsEventType.TRIGGER_ENTERED
            || collision.collider !== this._physicsBody
            || collision.collidedAgainst.transformNode !== this._ball.transform)
            return;
        const currentVelocity = this._ball.getLinearVelocity();
        const newVelocity = this.getNewVelocity(currentVelocity);
        this._ball.setLinearVelocity(newVelocity);
    }
    getNewVelocity(currentVelocity) {
        if (this._ball.isInResetTimeout())
            return this.onBallCollisionY(currentVelocity);
        return this.onBallCollisionX(currentVelocity);
    }
    onBallCollisionY(currentVelocity) {
        const directionSign = Math.sign(this._ball.transform.absolutePosition.y - this.transform.absolutePosition.y);
        const newVelocity = currentVelocity.clone();
        newVelocity.y = Paddle._speed * 1.2 * directionSign;
        return newVelocity;
    }
    onBallCollisionX(currentVelocity) {
        this._ball.reverseColliderPenetration(this.transform, "x");
        const ballAbsolutePosition = this._ball.transform.absolutePosition;
        const newDirection = this.getNewDirection(ballAbsolutePosition);
        const newSpeed = this.getNewSpeed(currentVelocity, newDirection);
        const newVelocity = newDirection.scale(newSpeed);
        return newVelocity;
    }
    getNewDirection(collidedWorldPos) {
        const collidedPosInPaddleLocal = Vector3.TransformCoordinates(collidedWorldPos, this.transform.getWorldMatrix().invert());
        if (Math.abs(collidedPosInPaddleLocal.y) < 0.04)
            collidedPosInPaddleLocal.y = 0;
        const prct = Clamp(collidedPosInPaddleLocal.y * 2, -1, 1);
        const angle = Paddle._maxAngle * prct;
        const rotation = Quaternion.RotationAxis(Vector3.LeftHandedForwardReadOnly, angle);
        const direction = this.transform.right.applyRotationQuaternion(rotation);
        return (direction);
    }
    getHeightDisplacementForAngle(angle) {
        const prct = angle / Paddle._maxAngle;
        const collidePosPaddleLocal = prct / 2;
        const heightDisplacementWorld = collidePosPaddleLocal * this.transform.absoluteScaling.y;
        return heightDisplacementWorld;
    }
    getNewSpeed(currentVelocity, newDirection) {
        const newXVelocity = Math.abs(currentVelocity.x) * Paddle._hitAcceleration;
        const clampedNewXVelocity = Clamp(newXVelocity, Paddle._ballXSpeedRange.min, Paddle._ballXSpeedRange.max);
        const newSpeed = clampedNewXVelocity / Math.abs(newDirection.x);
        const clampedNewSpeed = Math.min(newSpeed, Paddle._ballmaxSpeed);
        return clampedNewSpeed;
    }
    start() {
        this._playerInput = this._inputManager.getPlayerInput(this._playerIndex);
        const physicsBody = this.transform.getPhysicsBody();
        if (!physicsBody)
            throw new PongError("The Paddle script should be attached to a mesh with a physic body !", "quitScene");
        this._physicsBody = physicsBody;
        this._physicsBody.disablePreStep = false;
    }
    update() {
        if (!this._canMove)
            return;
        const isUpPressed = this._playerInput.up.isKeyDown();
        const isDownPressed = this._playerInput.down.isKeyDown();
        const canMoveUp = this.transform.position.y < Paddle._range / 2;
        const canMoveDown = this.transform.position.y > -Paddle._range / 2;
        let yVelocity = 0;
        if (!canMoveUp)
            this.transform.position.y = Paddle._range / 2;
        if (!canMoveDown)
            this.transform.position.y = -Paddle._range / 2;
        if (isUpPressed && !isDownPressed && canMoveUp)
            yVelocity = 1;
        else if (isDownPressed && !isUpPressed && canMoveDown)
            yVelocity = -1;
        this._physicsBody.setLinearVelocity(Vector3.Up().scale(yVelocity * Paddle._speed));
    }
    reset() {
        this.transform.position.copyFrom(this._initialPosition);
        this._physicsBody.setLinearVelocity(Vector3.ZeroReadOnly);
    }
}
__decorate([
    Imported("InputManager")
], Paddle.prototype, "_inputManager", void 0);
__decorate([
    Imported(zodInt)
], Paddle.prototype, "_playerIndex", void 0);
__decorate([
    Imported("Ball")
], Paddle.prototype, "_ball", void 0);
SceneManager.RegisterClass("Paddle", Paddle);
