import { Color3, Scene, Vector3 } from "@babylonjs/core";
import { AddBlock, AnimatedInputBlockTypes, ClampBlock, DiscardBlock, DistanceBlock, FragmentOutputBlock, GradientBlock, GradientBlockColorStep, ImageSourceBlock, InputBlock, InstancesBlock, LerpBlock, LightBlock, ModBlock, MultiplyBlock, NegateBlock, NodeMaterial, NodeMaterialModes, NodeMaterialSystemValues, NodeMaterialTeleportInBlock, NodeMaterialTeleportOutBlock, ParticleTextureBlock, SimplexPerlin3DBlock, SmoothStepBlock, SubtractBlock, TextureBlock, TransformBlock, TrigonometryBlock, TrigonometryBlockOperations, VectorMergerBlock, VectorSplitterBlock, VertexOutputBlock } from "@babylonjs/core/Materials/Node";

export type	AlphabetTerminalMaterialAndInputs = [ NodeMaterial, AlphabetTerminalMaterialInputsBlocks ];

interface	AlphabetTerminalMaterialInputsBlocks
{
}

export function	buildAlphabetTerminalMaterial(name : string, scene : Scene) : AlphabetTerminalMaterialAndInputs
{
	var nodeMaterial = new NodeMaterial(name, scene);
	nodeMaterial.mode = NodeMaterialModes.Particle;

	// InputBlock
	var Color = new InputBlock("Color3");
	Color.visibleInInspector = false;
	Color.visibleOnFrame = false;
	Color.target = 1;
	Color.value = new Color3(0.047058823529411764, 0.9058823529411765, 0.22745098039215686);
	Color.isConstant = false;

	// FragmentOutputBlock
	var FragmentOutput = new FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

	// InputBlock
	var particle_uv = new InputBlock("particle_uv");
	particle_uv.visibleInInspector = false;
	particle_uv.visibleOnFrame = false;
	particle_uv.target = 1;
	particle_uv.setAsAttribute("particle_uv");

	// ParticleTextureBlock
	var ParticleTexture = new ParticleTextureBlock("ParticleTexture");
	ParticleTexture.visibleInInspector = false;
	ParticleTexture.visibleOnFrame = false;
	ParticleTexture.target = 2;

	// DiscardBlock
	var Discard = new DiscardBlock("Discard");
	Discard.visibleInInspector = false;
	Discard.visibleOnFrame = false;
	Discard.target = 2;

	// InputBlock
	var Float = new InputBlock("Float");
	Float.visibleInInspector = false;
	Float.visibleOnFrame = false;
	Float.target = 1;
	Float.value = 0.5;
	Float.min = 0;
	Float.max = 0;
	Float.isBoolean = false;
	Float.matrixMode = 0;
	Float.animationType = AnimatedInputBlockTypes.None;
	Float.isConstant = false;

	// Connections
	Color.output.connectTo(FragmentOutput.rgb);
	particle_uv.output.connectTo(ParticleTexture.uv);
	ParticleTexture.a.connectTo(Discard.value);
	Float.output.connectTo(Discard.cutoff);

	// Output nodes
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.addOutputNode(Discard);
	nodeMaterial.build();

	nodeMaterial.backFaceCulling = false;
	return [
		nodeMaterial,
		{
		}];
}
