import { Vector3 } from '@babylonjs/core/Maths/math.vector';
export declare class RaycastHitResult {
    private _hit;
    private _dest;
    private _origin;
    private _hitPoint;
    private _hitNormal;
    private _hitDistance;
    private _collisionObject;
    get hasHit(): boolean;
    get hitPoint(): Vector3;
    get hitNormal(): Vector3;
    get hitDistance(): number;
    get collisionObject(): any;
    get rayDestination(): Vector3;
    get rayOrigin(): Vector3;
    constructor();
    reset(origin: Vector3, destination: Vector3): void;
    update(hit: boolean, pointX: number, pointY: number, pointZ: number, normalX: number, normalY: number, normalZ: number, collisionObject?: any): void;
}
//# sourceMappingURL=raycasthitresult.d.ts.map