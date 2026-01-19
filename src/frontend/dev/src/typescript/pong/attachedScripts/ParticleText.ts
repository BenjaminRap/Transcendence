import { Scene } from "@babylonjs/core/scene";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { ParticleSystem, Texture, Vector2, Vector3, type BaseTexture } from "@babylonjs/core";
import { getFrontendSceneData } from "../PongGame";
import { TimerManager } from "@shared/attachedScripts/TimerManager";
import type { FrontendSceneData } from "../FrontendSceneData";
import { zodNumber } from "@shared/ImportedHelpers";
import { zodRange } from "@shared/Range";
import { Range } from "@shared/Range";
import { randomFromRange } from "../utilities";
import { PongError } from "@shared/pongError/PongError";

export class ParticleText extends CustomScriptComponent {
	@Imported(Mesh) private _scoreLeft! : Mesh;
	@Imported(Mesh) private _scoreRight! : Mesh;
	@Imported("TimerManager") private _timerManager! : TimerManager;
	@Imported(Vector2) private _scale! : Vector2;
	@Imported(Texture) private _particleTexture!  : Texture;
	@Imported(zodRange) private _particleExitLifeTimeMs! : Range;
	@Imported(zodRange) private _particleExitSpeed! : Range;
	@Imported(zodNumber) private _alphaStep! : number;
	@Imported(zodNumber) private _precision! : number;

	private _sceneData : FrontendSceneData;
	private _pixelSkipCount! : number;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ParticleText") {
        super(transform, scene, properties, alias);

		this._sceneData = getFrontendSceneData(this.scene);
    }

	protected	awake()
	{
		const	pixelPerParticule = Math.floor(1 / this._precision);

		this._pixelSkipCount = Math.max(pixelPerParticule - 1, 0);
	}

	protected	start()
	{
		this.createParticleSystemForMesh(this._scoreLeft, "updateLeftScore");
		this.createParticleSystemForMesh(this._scoreRight, "updateRightScore");
	}

	private	createParticleSystemForMesh(mesh : Mesh, event : "updateRightScore" | "updateLeftScore") : ParticleSystem
	{
		const	material = mesh.material;

		if (material === null)
			throw new PongError("A mesh assigned to the ParticleText CustomScriptComponent doesn't have a material !", "quitScene");
		const	textures = material.getActiveTextures();
		if (textures.length === 0)
			throw new PongError("A mesh with no texture has been assigned to the ParticleText CustomScriptComponent !", "quitScene");
		mesh.isVisible = false;
		const	texture = textures[0];

		const	particleSystem = this.createParticleSystemForTexture(texture, mesh.absolutePosition);

		this._sceneData.events.getObservable(event).add(() => {
			this.updateParticles(particleSystem, mesh.absolutePosition, texture);
		});
		this._sceneData.events.getObservable("game-start").add(() => {
			this.updateParticles(particleSystem, mesh.absolutePosition, texture);
		});
		return particleSystem;
	}

	private	createParticleSystemForTexture(texture : BaseTexture, position : Vector3) : ParticleSystem
	{
		const	textParticles = new ParticleSystem("textParticle", 1000000, this.scene);

		textParticles.minLifeTime = Infinity;
		textParticles.maxLifeTime = Infinity;
		textParticles.minSize = this._scale.x / texture.getSize().width * 1 / this._precision;
		textParticles.maxSize = textParticles.minSize *  1.3;
		textParticles.direction1 = Vector3.Zero();
		textParticles.direction2 = Vector3.Zero();
		textParticles.particleTexture = this._particleTexture;

		this.spawnNewParticles(textParticles, position, texture);
		return textParticles;
	}

	private	updateParticles(particleSystem : ParticleSystem, position : Vector3, texture : BaseTexture)
	{
		this.exitCurrentParticles(particleSystem, position);
		this._timerManager.setTimeout(() => {
			this.spawnNewParticles(particleSystem, position, texture);
		}, this._particleExitLifeTimeMs.max);
	}

	private	exitCurrentParticles(particleSystem : ParticleSystem, position : Vector3)
	{
		particleSystem.particles.forEach((particle) => {
			const	newDirection = particle.position.subtract(position).normalize().scale(randomFromRange(this._particleExitSpeed));
			const	newLifeTime = particle.age + randomFromRange(this._particleExitLifeTimeMs) / 1000;

			particle.direction = newDirection;
			particle.lifeTime = newLifeTime;
		});
	}

	private	async spawnNewParticles(particleSystem : ParticleSystem, position : Vector3, texture : BaseTexture)
	{
		const	data = await texture.readPixels()

		if (data === null)
			throw new PongError("Could not read the texture pixels !", "quitPong");
		const	pixels = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
		const	opaquePixelCount = this.getOpaquePixelCount(pixels);
		const	size = texture.getSize();
		let		particleIndex = 0;
		let		currentOpaquePixelIndex : number | undefined;

		particleSystem.emitRate = opaquePixelCount;
		particleSystem.manualEmitCount = opaquePixelCount;
		particleSystem.startPositionFunction = (_worldMatrix, positionToUpdate, _particle, _isLocal) => {
			currentOpaquePixelIndex = this.getNextOpaquePixelIndex(pixels, currentOpaquePixelIndex)
			if (currentOpaquePixelIndex === undefined)
				throw new PongError("Error counting particles !", "quitPong");
			const	imagePos = new Vector2(currentOpaquePixelIndex % size.width, Math.floor(currentOpaquePixelIndex / size.width));
			const	localPos = imagePos.multiplyByFloats(1 / size.width, 1 / size.height);
			localPos.y = 1 - localPos.y;
			localPos.addInPlaceFromFloats(-0.5, -0.5);
			const	scalePos  = localPos.multiply(this._scale);
			const	worldPos = position.clone().addInPlaceFromFloats(scalePos.x, scalePos.y, 0);

			positionToUpdate.copyFrom(worldPos);
			particleIndex++;
		}
		particleSystem.start();
	}

	private	getOpaquePixelCount(pixels : Uint32Array)
	{
		let		opaquePixelCount = 0;
		let		pixelSkiped = 0;

		for (let index = 0; index < pixels.length; index++) {
			if (this.isPixelOpaque(pixels[index]))
			{
				if (pixelSkiped === this._pixelSkipCount)
				{
					pixelSkiped = 0;
					opaquePixelCount++;
				}
				else
					pixelSkiped++;
			}
		}
		
		return opaquePixelCount;
	}

	private	getNextOpaquePixelIndex(pixels : Uint32Array, currentPixelIndex? : number)
	{
		let		pixelSkiped = 0;

		if (currentPixelIndex === undefined || currentPixelIndex < -1)
			currentPixelIndex = -1;
		for (let index = currentPixelIndex + 1; index < pixels.length; index++) {
			if (this.isPixelOpaque(pixels[index]))
			{
				if (pixelSkiped === this._pixelSkipCount)
					return index;
				pixelSkiped++;
			}
		}
		return undefined;
	}

	private	isPixelOpaque(pixel : number)
	{
		const alpha = pixel & 255;
		return alpha > this._alphaStep;
	}
}

SceneManager.RegisterClass("ParticleText", ParticleText);
