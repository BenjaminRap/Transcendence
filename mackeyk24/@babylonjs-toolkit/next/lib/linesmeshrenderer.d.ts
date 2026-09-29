import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { LinesMesh } from '@babylonjs/core/Meshes/linesMesh';
import { Color3 } from '@babylonjs/core/Maths/math.color';
export declare class LinesMeshRenderer {
    private _numPoints;
    private _pointMesh;
    private _pointSize;
    private _pointType;
    private _linesName;
    private _linesMesh;
    private _babylonScene;
    get pointMesh(): Mesh;
    get linesMesh(): LinesMesh;
    constructor(name: string, scene: Scene, pointType?: number, pointSize?: number);
    dispose(doNotRecurse?: boolean): void;
    hidePoint(hide?: boolean): void;
    drawPoint(position: Vector3): void;
    drawLine(points: Vector3[], color?: Color3): void;
}
//# sourceMappingURL=linesmeshrenderer.d.ts.map