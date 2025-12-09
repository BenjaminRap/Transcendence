import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Effect, NodeMaterial, ParticleSystem, Texture, Vector2, Vector3 } from "@babylonjs/core";
import { zodInt, zodNumber } from "@shared/ImportedHelpers";
import { Imported } from "@shared/ImportedDecorator";
import { zodRange } from "@shared/Range";
import { Range } from "@shared/Range";
import { buildAlphabetTerminalMaterial } from "../shaders/alphabetTerminal";

export class CreateParticlesTerminal extends CustomScriptComponent {
	@Imported(zodRange) private _particleSizeRange! : Range;
	@Imported(zodNumber) private _particlesDistance! : number;
	@Imported(Vector2) private _particleRange! : Vector2;
	@Imported(Texture) private _spriteSheet! : Texture;
	@Imported(Vector2) private _spriteCellDimensions! : Vector2;
	@Imported(zodInt) private _spriteCount! : number;
	@Imported(zodNumber) private _speed! : number;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateParticlesTerminal") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	material = this.createMaterial();
		const	terminalParticle = this.createParticles();

		material.createEffectForParticles(terminalParticle);
		terminalParticle.start();
	}

	private	createMaterial() : NodeMaterial
	{
		const	[material, _inputs] = buildAlphabetTerminalMaterial("alphabetTerminal", this.scene);

		return material;
	}

	private	createParticles() : ParticleSystem
	{
		const	columnSize = this._particleSizeRange.max + this._particlesDistance;
		const	columnCount = Math.floor(this._particleRange.x / columnSize);
		const	emitRate = Math.floor(1 / (this._particleSizeRange.max / this._speed / columnCount));
		const	terminalParticles = new ParticleSystem("terminal", 100000, this.scene);

		terminalParticles.blendMode = 2;
		terminalParticles.isAnimationSheetEnabled = true;
		terminalParticles.startSpriteCellID = 0;
		terminalParticles.endSpriteCellID = this._spriteCount;
		terminalParticles.spriteRandomStartCell = true;
		terminalParticles.emitRate = emitRate;
		terminalParticles.minSize = this._particleSizeRange.min;
		terminalParticles.maxSize = this._particleSizeRange.max;
		terminalParticles.particleTexture = this._spriteSheet;
		terminalParticles.spriteCellHeight = this._spriteCellDimensions.x;
		terminalParticles.spriteCellWidth = this._spriteCellDimensions.y;
		terminalParticles.minLifeTime = this._particleRange.y / this._speed;
		terminalParticles.maxLifeTime = terminalParticles.maxLifeTime;
		terminalParticles.direction1 = Vector3.DownReadOnly.scale(this._speed);
		terminalParticles.direction2 = terminalParticles.direction1.clone();
		terminalParticles.startPositionFunction = (_worldMatrix, positionToUpdate, particle, _isLocal) => {
			const	x = (particle.id % columnCount) * columnSize - this._particleRange.x / 2;
			const	startPos = this.transform.absolutePosition.add(new Vector3(x));

			positionToUpdate.copyFrom(startPos);
		};
		terminalParticles.spriteCellLoop = false;
		terminalParticles.spriteCellChangeSpeed = 0;

		return terminalParticles;
	}
}

SceneManager.RegisterClass("CreateParticlesTerminal", CreateParticlesTerminal);
