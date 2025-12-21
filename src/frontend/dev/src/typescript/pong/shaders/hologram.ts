import { Color3, Scene, Vector2, Vector3 } from "@babylonjs/core";
import { AddBlock, AnimatedInputBlockTypes, ClampBlock, DiscardBlock, DistanceBlock, DivideBlock, FragCoordBlock, FragmentOutputBlock, GradientBlock, GradientBlockColorStep, ImageSourceBlock, InputBlock, InstancesBlock, LerpBlock, LightBlock, ModBlock, MultiplyBlock, NegateBlock, NodeMaterial, NodeMaterialModes, NodeMaterialSystemValues, NodeMaterialTeleportInBlock, NodeMaterialTeleportOutBlock, ParticleTextureBlock, RemapBlock, ScreenSizeBlock, SimplexPerlin3DBlock, SmoothStepBlock, SubtractBlock, TextureBlock, TransformBlock, TrigonometryBlock, TrigonometryBlockOperations, VectorMergerBlock, VectorSplitterBlock, VertexOutputBlock } from "@babylonjs/core/Materials/Node";
import type { ColorGradiant } from "../ColorGradiant";

export type	HologramMaterialAndInputs = [ NodeMaterial, HologramMaterialInputsBlocks ];

interface	HologramMaterialInputsBlocks
{
	minAlpha : InputBlock,
	textureScale : InputBlock,
	textureDisplacement : InputBlock,
	color : InputBlock,
	textureSource : ImageSourceBlock
}

export function	buildHologramMaterial(name : string, scene : Scene) : HologramMaterialAndInputs
{
	var nodeMaterial = new NodeMaterial(name, scene);
	nodeMaterial.mode = NodeMaterialModes.Material;

	// InputBlock
	var position = new InputBlock("position");
	position.visibleInInspector = false;
	position.visibleOnFrame = false;
	position.target = 1;
	position.setAsAttribute("position");

	// TransformBlock
	var WorldPos = new TransformBlock("WorldPos");
	WorldPos.visibleInInspector = false;
	WorldPos.visibleOnFrame = false;
	WorldPos.target = 1;
	WorldPos.complementZ = 0;
	WorldPos.complementW = 1;

	// InputBlock
	var World = new InputBlock("World");
	World.visibleInInspector = false;
	World.visibleOnFrame = false;
	World.target = 1;
	World.setAsSystemValue(NodeMaterialSystemValues.World);

	// TransformBlock
	var WorldPosViewProjectionTransform = new TransformBlock("WorldPos * ViewProjectionTransform");
	WorldPosViewProjectionTransform.visibleInInspector = false;
	WorldPosViewProjectionTransform.visibleOnFrame = false;
	WorldPosViewProjectionTransform.target = 1;
	WorldPosViewProjectionTransform.complementZ = 0;
	WorldPosViewProjectionTransform.complementW = 1;

	// InputBlock
	var ViewProjection = new InputBlock("ViewProjection");
	ViewProjection.visibleInInspector = false;
	ViewProjection.visibleOnFrame = false;
	ViewProjection.target = 1;
	ViewProjection.setAsSystemValue(NodeMaterialSystemValues.ViewProjection);

	// VertexOutputBlock
	var VertexOutput = new VertexOutputBlock("VertexOutput");
	VertexOutput.visibleInInspector = false;
	VertexOutput.visibleOnFrame = false;
	VertexOutput.target = 1;

	// InputBlock
	var color = new InputBlock("color");
	color.visibleInInspector = false;
	color.visibleOnFrame = false;
	color.target = 1;
	color.value = new Color3(0.12549019607843137, 0.6549019607843137, 0.12549019607843137);
	color.isConstant = false;

	// FragmentOutputBlock
	var FragmentOutput = new FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

	// RemapBlock
	var Remap = new RemapBlock("Remap");
	Remap.visibleInInspector = false;
	Remap.visibleOnFrame = false;
	Remap.target = 4;
	Remap.sourceRange = new Vector2(0, 1);
	Remap.targetRange = new Vector2(0.3, 1);

	// TextureBlock
	var Texture = new TextureBlock("Texture");
	Texture.visibleInInspector = false;
	Texture.visibleOnFrame = false;
	Texture.target = 2;
	Texture.convertToGammaSpace = false;
	Texture.convertToLinearSpace = false;
	Texture.disableLevelMultiplication = false;

	// AddBlock
	var Add = new AddBlock("Add");
	Add.visibleInInspector = false;
	Add.visibleOnFrame = false;
	Add.target = 4;

	// MultiplyBlock
	var Multiply = new MultiplyBlock("Multiply");
	Multiply.visibleInInspector = false;
	Multiply.visibleOnFrame = false;
	Multiply.target = 4;

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

	// InputBlock
	var textureScale = new InputBlock("textureScale");
	textureScale.visibleInInspector = false;
	textureScale.visibleOnFrame = false;
	textureScale.target = 1;
	textureScale.value = 1;
	textureScale.min = 0;
	textureScale.max = 0;
	textureScale.isBoolean = false;
	textureScale.matrixMode = 0;
	textureScale.animationType = AnimatedInputBlockTypes.None;
	textureScale.isConstant = false;

	// MultiplyBlock
	var Multiply1 = new MultiplyBlock("Multiply");
	Multiply1.visibleInInspector = false;
	Multiply1.visibleOnFrame = false;
	Multiply1.target = 4;

	// InputBlock
	var textureDisplacement = new InputBlock("textureDisplacement");
	textureDisplacement.visibleInInspector = false;
	textureDisplacement.visibleOnFrame = false;
	textureDisplacement.target = 1;
	textureDisplacement.value = new Vector2(0, 0.3);
	textureDisplacement.isConstant = false;

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

	// ImageSourceBlock
	var ImageSource = new ImageSourceBlock("ImageSource");
	ImageSource.visibleInInspector = false;
	ImageSource.visibleOnFrame = false;
	ImageSource.target = 3;

	// InputBlock
	var minAlpha = new InputBlock("minAlpha");
	minAlpha.visibleInInspector = false;
	minAlpha.visibleOnFrame = false;
	minAlpha.target = 1;
	minAlpha.value = 0.3;
	minAlpha.min = 0;
	minAlpha.max = 0;
	minAlpha.isBoolean = false;
	minAlpha.matrixMode = 0;
	minAlpha.animationType = AnimatedInputBlockTypes.None;
	minAlpha.isConstant = false;

	// Connections
	position.output.connectTo(WorldPos.vector);
	World.output.connectTo(WorldPos.transform);
	WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
	ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
	WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
	color.output.connectTo(FragmentOutput.rgb);
	FragCoord.xy.connectTo(Divide.left);
	ScreenSize.xy.connectTo(Divide.right);
	Divide.output.connectTo(Multiply.left);
	textureScale.output.connectTo(Multiply.right);
	Multiply.output.connectTo(Add.left);
	textureDisplacement.output.connectTo(Multiply1.left);
	Time.output.connectTo(Multiply1.right);
	Multiply1.output.connectTo(Add.right);
	Add.output.connectTo(Texture.uv);
	ImageSource.source.connectTo(Texture.source);
	Texture.r.connectTo(Remap.input);
	minAlpha.output.connectTo(Remap.targetMin);
	Remap.output.connectTo(FragmentOutput.a);

	// Output nodes
	nodeMaterial.addOutputNode(VertexOutput);
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.build();

	return [
		nodeMaterial,
		{
			minAlpha: minAlpha,
			textureScale: textureScale,
			textureDisplacement: textureDisplacement,
			color: color,
			textureSource: ImageSource
		}];
}
