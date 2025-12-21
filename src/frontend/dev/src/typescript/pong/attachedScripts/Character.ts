import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { AnimationGroup, ImportMeshAsync, Space, Vector3 } from "@babylonjs/core";
import { TimerManager } from "@shared/attachedScripts/TimerManager";
import { Imported } from "@shared/ImportedDecorator";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { zodNumber, zodString } from "@shared/ImportedHelpers";

enum CharacterAnim
{
	TPOSE,
	IDLE,
	DEFEAT,
	VICTORY,
	WALK
}

export class Character extends CustomScriptComponent {
	private static readonly _expectedMeshCount = 2;
	private static readonly _expectedAnimationGroupsCount = 5;
	private static readonly _timeBeforeGoingOnScreenMs = 2000;
	
	@Imported(zodString) private _knightPath! : string;
	@Imported(Vector3) private _fightPoint! : Vector3
	@Imported(zodNumber) private _speed : number = 3;
	@Imported("TimerManager") private _timerManager! : TimerManager;

	private _direction : Vector3 = Vector3.Zero();
	private _knight! : AbstractMesh;
	private _animations! : AnimationGroup[];
	private _currentAnimation : AnimationGroup | null = null;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Character") {
        super(transform, scene, properties, alias);
    }

	protected async awake() : Promise<void>
	{
		await this.loadCharacter();
		this.playAnim(CharacterAnim.WALK, true);
	}

	protected update()
	{
		if (this._currentAnimation && !this._currentAnimation.isPlaying)
			this.playAnim(CharacterAnim.IDLE, true);
		if (this._direction.equals(Vector3.ZeroReadOnly))
			return ;
		this._knight.translate(this._direction, this._speed * this.getDeltaTime(), Space.WORLD);
	}

	protected async ready()
	{
		this._timerManager.setTimeout(() => {
			this.setCharacterDirection();
		}, Character._timeBeforeGoingOnScreenMs);
	}

	private setCharacterDirection()
	{
		this._direction = this._fightPoint.subtract(this.transform.position);

		const distance = this._direction.length();
		const durationSeconds = this._speed / distance;
		this._direction.normalize();

		this._timerManager.setTimeout(this.setCharacterIdle.bind(this), durationSeconds * 1000);

	}

	private setCharacterIdle()
	{
		this._direction.copyFrom(Vector3.ZeroReadOnly);
		this.playAnim(CharacterAnim.IDLE, true);
	}

	private async loadCharacter() : Promise<void>
	{
		const {meshes, animationGroups} = await ImportMeshAsync(this._knightPath, this.scene);

		if (meshes.length != Character._expectedMeshCount
			|| animationGroups.length != Character._expectedAnimationGroupsCount)
		{
			throw new Error(`Invalid Character mesh : ${this._knightPath}, expected ${Character._expectedMeshCount} mesh/es and ${Character._expectedAnimationGroupsCount} animationGroup/s and got ${meshes.length} and ${animationGroups.length}`);
		}
		this._knight = meshes[0];
		this._knight.parent = this.transform;
		this._animations = animationGroups;
		meshes.forEach(mesh => mesh.layerMask = 2);
	}

	private playAnim(animation : CharacterAnim, loop : boolean) : void
	{
		if (this._currentAnimation != null && this._currentAnimation.isPlaying)
			this._currentAnimation.stop();
		this._currentAnimation = this._animations[animation];
		this._currentAnimation.play(loop);
	}
}

SceneManager.RegisterClass("Character", Character);
