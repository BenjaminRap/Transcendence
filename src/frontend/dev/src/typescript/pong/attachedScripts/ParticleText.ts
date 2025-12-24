import { Scene } from "@babylonjs/core/scene";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { ParticleSystem, Vector2, Vector3, type BaseTexture } from "@babylonjs/core";
import { getFrontendSceneData } from "../PongGame";
import { TimerManager } from "@shared/attachedScripts/TimerManager";
import type { FrontendSceneData } from "../FrontendSceneData";

export class ParticleText extends CustomScriptComponent {
	@Imported(Mesh) private _scoreLeft! : Mesh;
	@Imported(Mesh) private _scoreRight! : Mesh;
	@Imported("TimerManager") private _timerManager! : TimerManager;

	private _sceneData : FrontendSceneData;
	private _particleExitLifeTimeMs : number = 500;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ParticleText") {
        super(transform, scene, properties, alias);

		this._sceneData = getFrontendSceneData(this.scene);
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
			throw new Error("A mesh assigned to the ParticleText CustomScriptComponent doesn't have a material !");
		const	textures = material.getActiveTextures();
		// console.log(textures.map((texture) => texture.name));
		// if (textures.length !== 1)
		// 	throw new Error("A mesh with multiple texture has been assigned to the ParticleText CustomScriptComponent !");
		const	texture = textures[0];

		const	particleSystem = this.createParticleSystemForTexture(texture, mesh.absolutePosition);

		this._sceneData.events.getObservable(event).add(() => {
			this.updateParticles(particleSystem, mesh.absolutePosition, texture);
		});
		return particleSystem;
	}

	private	createParticleSystemForTexture(texture : BaseTexture, position : Vector3) : ParticleSystem
	{
		const	textParticles = new ParticleSystem("textParticle", 1000, this.scene);

		textParticles.minLifeTime = Infinity;
		textParticles.maxLifeTime = Infinity;
		textParticles.minSize = 0.1;
		textParticles.maxSize = 0.1;
		textParticles.direction1 = Vector3.Zero();
		textParticles.direction2 = Vector3.Zero();

		this.spawnNewParticles(textParticles, position, texture);
		return textParticles;
	}

	private	updateParticles(particleSystem : ParticleSystem, position : Vector3, texture : BaseTexture)
	{
		this.exitCurrentParticles(particleSystem, position);
		this._timerManager.setTimeout(() => {
			this.spawnNewParticles(particleSystem, position, texture);
		}, this._particleExitLifeTimeMs);
	}

	private	exitCurrentParticles(particleSystem : ParticleSystem, position : Vector3)
	{
		const	particleExitSpeed = 10;

		particleSystem.particles.forEach((particle) => {
			const	newDirection = particle.position.subtract(position).normalize().scale(particleExitSpeed);
			const	newLifeTime = particle.age + this._particleExitLifeTimeMs;

			particle.direction = newDirection;
			particle.lifeTime = newLifeTime;
		});
	}

	private	async spawnNewParticles(particleSystem : ParticleSystem, position : Vector3, texture : BaseTexture)
	{
		const	data = await texture.readPixels()

		if (data === null)
			throw new Error("Could not read the texture pixels !");
		const	pixels = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
		const	opaquePixelCount = this.getOpaquePixelCount(pixels);
		const	size = texture.getSize();
		let		particleIndex = 0;
		let		currentOpaquePixelIndex : number | undefined;

		particleSystem.manualEmitCount = opaquePixelCount;
		particleSystem.startPositionFunction = (_worldMatrix, positionToUpdate, _particle, _isLocal) => {
			currentOpaquePixelIndex = this.getNextOpaquePixelIndex(pixels, currentOpaquePixelIndex)
			if (currentOpaquePixelIndex === undefined)
				throw new Error("Error counting particles !");
			const	imagePos = new Vector2(currentOpaquePixelIndex % size.width, Math.floor(currentOpaquePixelIndex / size.width));
			const	localPos = imagePos.multiplyByFloats(1 / size.width, 1 / size.height);
			const	worldPos = position.addInPlaceFromFloats(localPos.x, localPos.y, 0);

			positionToUpdate.copyFrom(worldPos);
			particleIndex++;
		}
		particleSystem.start();
	}

	private	getOpaquePixelCount(pixels : Uint8Array)
	{
		const	opaqueStep = 100;

		let		opaquePixelCount = 0;

		for (let index = 3; index < pixels.length; index += 4) {
			if (pixels[index] > opaqueStep)
				opaquePixelCount++;
		}
		
		return opaquePixelCount;
	}

	private	getNextOpaquePixelIndex(pixels : Uint8Array, currentPixelIndex? : number)
	{
		const	opaqueStep = 100;

		if (currentPixelIndex === undefined || currentPixelIndex < -1)
			currentPixelIndex = -1;
		for (let index = currentPixelIndex + 4; index < pixels.length; index += 4) {
			if (pixels[index] > opaqueStep)
				return index;
		}
		return undefined;
	}
}

SceneManager.RegisterClass("ParticleText", ParticleText);
