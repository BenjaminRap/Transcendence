import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { ImportMeshAsync } from "@babylonjs/core";

export class Character extends ScriptComponent {
	private static readonly _expectedMeshCount = 2;
	private static readonly _expectedAnimationGroupsCount = 5;
	
	private _knightPath! : string;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Character") {
        super(transform, scene, properties, alias);
    }

	protected awake() : void
	{
		this.loadCharacter();
	}

	private async loadCharacter() : Promise<void>
	{
		const {meshes, animationGroups} = await ImportMeshAsync(this._knightPath, this.scene);

		if (meshes.length != Character._expectedMeshCount
			|| animationGroups.length != Character._expectedAnimationGroupsCount)
		{
			throw new Error(`Invalid Character mesh : ${this._knightPath}, expected ${Character._expectedMeshCount} mesh/es and ${Character._expectedAnimationGroupsCount} animationGroup/s and got ${meshes.length} and ${animationGroups.length}`);
		}
		meshes.forEach(mesh => mesh.layerMask = 2);
		meshes[0].parent = this.transform;
		animationGroups[0].stop();
		animationGroups[4].play(true);
	}
}

SceneManager.RegisterClass("Character", Character);
