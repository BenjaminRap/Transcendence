import { Color3, Scene, Vector2, Vector3 } from "@babylonjs/core";
import { AddBlock, AnimatedInputBlockTypes, ClampBlock, DiscardBlock, DistanceBlock, DivideBlock, FragCoordBlock, FragmentOutputBlock, GradientBlock, GradientBlockColorStep, ImageSourceBlock, InputBlock, InstancesBlock, LerpBlock, LightBlock, ModBlock, MultiplyBlock, NegateBlock, NodeMaterial, NodeMaterialModes, NodeMaterialSystemValues, NodeMaterialTeleportInBlock, NodeMaterialTeleportOutBlock, ParticleTextureBlock, ScreenSizeBlock, SimplexPerlin3DBlock, SmoothStepBlock, SubtractBlock, TextureBlock, TransformBlock, TrigonometryBlock, TrigonometryBlockOperations, VectorMergerBlock, VectorSplitterBlock, VertexOutputBlock } from "@babylonjs/core/Materials/Node";
import type { ColorGradiant } from "../ColorGradiant";

export type	AlphabetTerminalMaterialAndInputs = [ NodeMaterial, AlphabetTerminalMaterialInputsBlocks ];

interface	AlphabetTerminalMaterialInputsBlocks
{
	noiseScale : InputBlock,
	noiseDisplacement : InputBlock
}

export function	buildAlphabetTerminalMaterial(name : string, scene : Scene, colorGradiant : ColorGradiant) : AlphabetTerminalMaterialAndInputs
{
	var nodeMaterial = new NodeMaterial(name, scene);
	nodeMaterial.mode = NodeMaterialModes.Particle;

	// InputBlock
	var noiseDisplacement = new InputBlock("noiseDisplacement");
	noiseDisplacement.visibleInInspector = false;
	noiseDisplacement.visibleOnFrame = false;
	noiseDisplacement.target = 1;
	noiseDisplacement.value = new Vector2(0, 1);
	noiseDisplacement.isConstant = false;

	// MultiplyBlock
	var Multiply = new MultiplyBlock("Multiply");
	Multiply.visibleInInspector = false;
	Multiply.visibleOnFrame = false;
	Multiply.target = 4;

	// InputBlock
	var Time = new InputBlock("Time");
	Time.visibleInInspector = false;
	Time.visibleOnFrame = false;
	Time.target = 1;
	Time.value = 0;
	Time.min = 0;
	Time.max = 0;
	Time.isBoolean = false;
	Time.matrixMode = 0;
	Time.animationType = AnimatedInputBlockTypes.Time;
	Time.isConstant = false;

	// AddBlock
	var Add = new AddBlock("Add");
	Add.visibleInInspector = false;
	Add.visibleOnFrame = false;
	Add.target = 4;

	// DivideBlock
	var Divide = new DivideBlock("Divide");
	Divide.visibleInInspector = false;
	Divide.visibleOnFrame = false;
	Divide.target = 4;

	// FragCoordBlock
	var FragCoord = new FragCoordBlock("FragCoord");
	FragCoord.visibleInInspector = false;
	FragCoord.visibleOnFrame = false;
	FragCoord.target = 2;

	// ScreenSizeBlock
	var ScreenSize = new ScreenSizeBlock("ScreenSize");
	ScreenSize.visibleInInspector = false;
	ScreenSize.visibleOnFrame = false;
	ScreenSize.target = 2;

	// MultiplyBlock
	var Multiply1 = new MultiplyBlock("Multiply");
	Multiply1.visibleInInspector = false;
	Multiply1.visibleOnFrame = false;
	Multiply1.target = 4;

	// InputBlock
	var noiseScale = new InputBlock("noiseScale");
	noiseScale.visibleInInspector = false;
	noiseScale.visibleOnFrame = false;
	noiseScale.target = 1;
	noiseScale.value = new Vector2(10, 10);
	noiseScale.isConstant = false;

	// VectorMergerBlock
	var VectorMerger = new VectorMergerBlock("VectorMerger");
	VectorMerger.visibleInInspector = false;
	VectorMerger.visibleOnFrame = false;
	VectorMerger.target = 4;
	VectorMerger.xSwizzle = "x";
	VectorMerger.ySwizzle = "y";
	VectorMerger.zSwizzle = "z";
	VectorMerger.wSwizzle = "w";

	// SimplexPerlin3DBlock
	var SimplexPerlinD = new SimplexPerlin3DBlock("SimplexPerlin3D");
	SimplexPerlinD.visibleInInspector = false;
	SimplexPerlinD.visibleOnFrame = false;
	SimplexPerlinD.target = 4;

	// GradientBlock
	var Gradient = new GradientBlock("Gradient");
	Gradient.visibleInInspector = false;
	Gradient.visibleOnFrame = false;
	Gradient.target = 4;
	Gradient.colorSteps = colorGradiant.map((colorStep) => {
		const	color = new Color3(colorStep.color.r, colorStep.color.g, colorStep.color.b);

		return new GradientBlockColorStep(colorStep.step, color);
	});

	// FragmentOutputBlock
	var FragmentOutput = new FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

	// ParticleTextureBlock
	var ParticleTexture = new ParticleTextureBlock("ParticleTexture");
	ParticleTexture.visibleInInspector = false;
	ParticleTexture.visibleOnFrame = false;
	ParticleTexture.target = 2;

	// InputBlock
	var particle_uv = new InputBlock("particle_uv");
	particle_uv.visibleInInspector = false;
	particle_uv.visibleOnFrame = false;
	particle_uv.target = 1;
	particle_uv.setAsAttribute("particle_uv");

	// Connections
	FragCoord.xy.connectTo(Divide.left);
	ScreenSize.xy.connectTo(Divide.right);
	Divide.output.connectTo(Add.left);
	noiseDisplacement.output.connectTo(Multiply.left);
	Time.output.connectTo(Multiply.right);
	Multiply.output.connectTo(Add.right);
	Add.output.connectTo(Multiply1.left);
	noiseScale.output.connectTo(Multiply1.right);
	Multiply1.output.connectTo(VectorMerger.xyIn);
	VectorMerger.xyz.connectTo(SimplexPerlinD.seed);
	SimplexPerlinD.output.connectTo(Gradient.gradient);
	Gradient.output.connectTo(FragmentOutput.rgb);
	particle_uv.output.connectTo(ParticleTexture.uv);
	ParticleTexture.a.connectTo(FragmentOutput.a);

	// Output nodes
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.build();

	nodeMaterial.backFaceCulling = false;
	return [
		nodeMaterial,
		{
			noiseScale: noiseScale,
			noiseDisplacement : noiseDisplacement
		}];
}
