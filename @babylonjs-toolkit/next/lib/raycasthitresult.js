import { Vector3 } from '@babylonjs/core/Maths/math.vector';
export class RaycastHitResult {
    get hasHit() { return this._hit; }
    get hitPoint() { return this._hitPoint; }
    get hitNormal() { return this._hitNormal; }
    get hitDistance() { return this._hitDistance; }
    get collisionObject() { return this._collisionObject; }
    get rayDestination() { return this._dest; }
    get rayOrigin() { return this._origin; }
    constructor() {
        this._hit = false;
        this._dest = new Vector3(0, 0, 0);
        this._origin = new Vector3(0, 0, 0);
        this._hitPoint = new Vector3(0, 0, 0);
        this._hitNormal = new Vector3(0, 0, 0);
        this._hitDistance = 0;
        this._collisionObject = null;
        this.reset(Vector3.Zero(), Vector3.Zero());
    }
    reset(origin, destination) {
        this._hit = false;
        this._hitPoint.set(0, 0, 0);
        this._hitNormal.set(0, 0, 0);
        this._hitDistance = 0;
        this._collisionObject = null;
        this._origin.copyFrom(origin);
        this._dest.copyFrom(destination);
    }
    update(hit, pointX, pointY, pointZ, normalX, normalY, normalZ, collisionObject = null) {
        this._hit = hit;
        this._hitPoint.set(pointX, pointY, pointZ);
        this._hitNormal.set(normalX, normalY, normalZ);
        this._hitDistance = Vector3.Distance(this._origin, this.hitPoint);
        this._collisionObject = collisionObject;
    }
}
