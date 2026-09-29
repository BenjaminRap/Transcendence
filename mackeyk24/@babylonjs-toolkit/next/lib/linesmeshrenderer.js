import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Utilities } from './scenemanager';
import { Tools } from '@babylonjs/core/Misc/tools';
export class LinesMeshRenderer {
    get pointMesh() { return this._pointMesh; }
    get linesMesh() { return this._linesMesh; }
    constructor(name, scene, pointType = 0, pointSize = 0.5) {
        this._numPoints = -1;
        this._pointMesh = null;
        this._pointSize = 0.5;
        this._pointType = 0;
        this._linesName = "MeshLines";
        this._linesMesh = null;
        this._babylonScene = null;
        this._pointMesh = null;
        this._linesMesh = null;
        this._linesName = name;
        this._babylonScene = scene;
        this._pointType = pointType;
        this._pointSize = pointSize;
    }
    dispose(doNotRecurse = true) {
        this._babylonScene = null;
        this._linesName = null;
        if (this._pointMesh != null) {
            this._pointMesh.dispose(doNotRecurse);
            this._pointMesh = null;
        }
        if (this._linesMesh != null) {
            this._linesMesh.dispose(doNotRecurse);
            this._linesMesh = null;
        }
    }
    hidePoint(hide = true) {
        if (this._pointMesh != null) {
            this._pointMesh.isVisible = !hide;
        }
    }
    drawPoint(position) {
        if (this._pointMesh == null) {
            if (this._pointType === 1) {
                this._pointMesh = MeshBuilder.CreateBox(this._linesName + ".EndPoint", { size: (this._pointSize * 2) }, this._babylonScene);
                this._pointMesh.renderingGroupId = Utilities.DefaultRenderGroup();
                this._pointMesh.visibility = 0.25;
            }
            else {
                this._pointMesh = MeshBuilder.CreateSphere(this._linesName + ".EndPoint", { segments: 24, diameter: (this._pointSize * 2) }, this._babylonScene);
                this._pointMesh.renderingGroupId = Utilities.DefaultRenderGroup();
                this._pointMesh.visibility = 0.25;
            }
        }
        if (this._pointMesh != null) {
            this._pointMesh.isVisible = true;
            this._pointMesh.position.copyFrom(position);
        }
    }
    drawLine(points, color = null) {
        if (this._linesMesh == null) {
            this._numPoints = points.length;
            this._linesMesh = MeshBuilder.CreateLines(this._linesName, { points: points, updatable: true, }, this._babylonScene);
            this._linesMesh.renderingGroupId = Utilities.DefaultRenderGroup();
            if (color != null)
                this._linesMesh.color = color;
            this._linesMesh.refreshBoundingInfo(false);
        }
        else {
            if (points.length === this._numPoints) {
                this._linesMesh = MeshBuilder.CreateLines(this._linesName, { points: points, instance: this._linesMesh }, this._babylonScene);
                this._linesMesh.renderingGroupId = Utilities.DefaultRenderGroup();
                if (color != null)
                    this._linesMesh.color = color;
                this._linesMesh.refreshBoundingInfo(false);
            }
            else {
                Tools.Warn("Dynamic line mesh point count mismatch for " + this._linesName);
            }
        }
    }
}
