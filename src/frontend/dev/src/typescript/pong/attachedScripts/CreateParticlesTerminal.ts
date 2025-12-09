import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { ParticleSystem, Texture, Vector2, Vector3 } from "@babylonjs/core";
import { zodNumber } from "@shared/ImportedHelpers";
import { Imported } from "@shared/ImportedDecorator";
import { zodRange } from "@shared/Range";
import { Range } from "@shared/Range";

export class CreateParticlesTerminal extends CustomScriptComponent {
	@Imported(zodRange) private _particleSizeRange! : Range;
	@Imported(zodNumber) private _particlesDistance! : number;
	@Imported(Vector2) private _particleRange! : Vector2;
	@Imported(Texture) private _spriteSheet! : Texture;
	@Imported(Vector2) private _spriteCellDimensions! : Vector2;
	@Imported(zodNumber) private _speed! : number;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateParticlesTerminal") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	columnSize = this._particleSizeRange.max + this._particlesDistance;
		const	columnCount = Math.floor(this._particleRange.x / columnSize);

		const	terminalParticles = new ParticleSystem("terminal", 100000, this.scene);

		terminalParticles.isAnimationSheetEnabled = true;
		terminalParticles.startSpriteCellID = 0;
		terminalParticles.endSpriteCellID = 119;
		terminalParticles.spriteRandomStartCell = true;
		terminalParticles.emitRate = 500;
		terminalParticles.minSize = this._particleSizeRange.min;
		terminalParticles.maxSize = this._particleSizeRange.max;
		terminalParticles.particleTexture = this._spriteSheet;
		terminalParticles.spriteCellHeight = this._spriteCellDimensions.y;
		terminalParticles.spriteCellWidth = this._spriteCellDimensions.x;
		terminalParticles.minLifeTime = this._particleRange.y / this._speed;
		terminalParticles.maxLifeTime = terminalParticles.maxLifeTime;
		terminalParticles.direction1 = Vector3.DownReadOnly.scale(this._speed);
		terminalParticles.direction2 = terminalParticles.direction1.clone();
		terminalParticles.startPositionFunction = (_worldMatrix, positionToUpdate, particle, _isLocal) => {
			const	x = (particle.id % columnCount) * columnSize - this._particleRange.x / 2;
			const	startPos = this.transform.absolutePosition.add(new Vector3(x));

			particle.updateCellIndex
			positionToUpdate.copyFrom(startPos);
		};
		terminalParticles.spriteCellChangeSpeed = 0;
		terminalParticles.start();
	}
}

SceneManager.RegisterClass("CreateParticlesTerminal", CreateParticlesTerminal);
