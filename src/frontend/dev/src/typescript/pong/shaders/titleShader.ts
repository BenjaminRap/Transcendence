import { Color3, Scene, Vector3 } from "@babylonjs/core";
import { AddBlock, AnimatedInputBlockTypes, ClampBlock, DistanceBlock, FragmentOutputBlock, GradientBlock, GradientBlockColorStep, ImageSourceBlock, InputBlock, InstancesBlock, LerpBlock, LightBlock, ModBlock, MultiplyBlock, NegateBlock, NodeMaterial, NodeMaterialModes, NodeMaterialSystemValues, NodeMaterialTeleportInBlock, NodeMaterialTeleportOutBlock, SimplexPerlin3DBlock, SmoothStepBlock, SubtractBlock, TextureBlock, TransformBlock, TrigonometryBlock, TrigonometryBlockOperations, VectorMergerBlock, VectorSplitterBlock, VertexOutputBlock } from "@babylonjs/core/Materials/Node";

export type	TitleMaterialAndInputs = [ NodeMaterial, TitleMaterialInputsBlocks ];

interface	TitleMaterialInputsBlocks
{
	pixelSize : InputBlock,
	speed : InputBlock
}

export function	buildTitleMaterial(name : string, scene : Scene) : TitleMaterialAndInputs
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
	var position1 = new InputBlock("position");
	position1.visibleInInspector = false;
	position1.visibleOnFrame = false;
	position1.target = 1;
	position1.setAsAttribute("position");

	// VectorSplitterBlock
	var VectorSplitter = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter.visibleInInspector = false;
	VectorSplitter.visibleOnFrame = false;
	VectorSplitter.target = 4;

	// SubtractBlock
	var Subtract = new SubtractBlock("Subtract");
	Subtract.visibleInInspector = false;
	Subtract.visibleOnFrame = false;
	Subtract.target = 4;

	// ModBlock
	var Mod = new ModBlock("Mod");
	Mod.visibleInInspector = false;
	Mod.visibleOnFrame = false;
	Mod.target = 4;

	// NodeMaterialTeleportInBlock
	var pixelSize = new NodeMaterialTeleportInBlock("pixelSize");
	pixelSize.visibleInInspector = false;
	pixelSize.visibleOnFrame = false;
	pixelSize.target = 1;

	// InputBlock
	var pixelSize1 = new InputBlock("pixelSize");
	pixelSize1.visibleInInspector = false;
	pixelSize1.visibleOnFrame = false;
	pixelSize1.target = 1;
	pixelSize1.value = 0.07;
	pixelSize1.min = 0;
	pixelSize1.max = 0;
	pixelSize1.isBoolean = false;
	pixelSize1.matrixMode = 0;
	pixelSize1.animationType = AnimatedInputBlockTypes.None;
	pixelSize1.isConstant = false;

	// ModBlock
	var Mod1 = new ModBlock("Mod");
	Mod1.visibleInInspector = false;
	Mod1.visibleOnFrame = false;
	Mod1.target = 4;

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

	// InputBlock
	var speed = new InputBlock("speed");
	speed.visibleInInspector = false;
	speed.visibleOnFrame = false;
	speed.target = 1;
	speed.value = 0.5;
	speed.min = 0;
	speed.max = 0;
	speed.isBoolean = false;
	speed.matrixMode = 0;
	speed.animationType = AnimatedInputBlockTypes.None;
	speed.isConstant = false;

	// SubtractBlock
	var Subtract1 = new SubtractBlock("Subtract");
	Subtract1.visibleInInspector = false;
	Subtract1.visibleOnFrame = false;
	Subtract1.target = 4;

	// AddBlock
	var Add1 = new AddBlock("Add");
	Add1.visibleInInspector = false;
	Add1.visibleOnFrame = false;
	Add1.target = 4;

	// TrigonometryBlock
	var Fract = new TrigonometryBlock("Fract");
	Fract.visibleInInspector = false;
	Fract.visibleOnFrame = false;
	Fract.target = 4;
	Fract.operation = TrigonometryBlockOperations.Fract;

	// GradientBlock
	var Gradient = new GradientBlock("Gradient");
	Gradient.visibleInInspector = false;
	Gradient.visibleOnFrame = false;
	Gradient.target = 4;
	Gradient.colorSteps = [];
	Gradient.colorSteps.push(new GradientBlockColorStep(0, new Color3(0.611764705882353, 0.30980392156862746, 0.5882352941176471)));
	Gradient.colorSteps.push(new GradientBlockColorStep(0.21, new Color3(1, 0.38823529411764707, 0.3333333333333333)));
	Gradient.colorSteps.push(new GradientBlockColorStep(0.31, new Color3(0.984313725490196, 0.6627450980392157, 0.28627450980392155)));
	Gradient.colorSteps.push(new GradientBlockColorStep(0.49, new Color3(0.9803921568627451, 0.8941176470588236, 0.25882352941176473)));
	Gradient.colorSteps.push(new GradientBlockColorStep(0.66, new Color3(0.5450980392156862, 0.8313725490196079, 0.2823529411764706)));
	Gradient.colorSteps.push(new GradientBlockColorStep(0.84, new Color3(0.16470588235294117, 0.6588235294117647, 0.9490196078431372)));
	Gradient.colorSteps.push(new GradientBlockColorStep(1, new Color3(0.611764705882353, 0.30980392156862746, 0.5882352941176471)));

	// FragmentOutputBlock
	var FragmentOutput = new FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

	// NodeMaterialTeleportOutBlock
	var pixelSize2 = new NodeMaterialTeleportOutBlock("> pixelSize");
	pixelSize2.visibleInInspector = false;
	pixelSize2.visibleOnFrame = false;
	pixelSize2.target = 1;
	pixelSize.attachToEndpoint(pixelSize2);

	// NodeMaterialTeleportOutBlock
	var pixelSize3 = new NodeMaterialTeleportOutBlock("> pixelSize");
	pixelSize3.visibleInInspector = false;
	pixelSize3.visibleOnFrame = false;
	pixelSize3.target = 1;
	pixelSize.attachToEndpoint(pixelSize3);

	// NodeMaterialTeleportOutBlock
	var pixelSize4 = new NodeMaterialTeleportOutBlock("> pixelSize");
	pixelSize4.visibleInInspector = false;
	pixelSize4.visibleOnFrame = false;
	pixelSize4.target = 1;
	pixelSize.attachToEndpoint(pixelSize4);

	// Connections
	position.output.connectTo(WorldPos.vector);
	World.output.connectTo(WorldPos.transform);
	WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
	ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
	WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
	position1.output.connectTo(VectorSplitter.xyzIn);
	VectorSplitter.x.connectTo(Subtract.left);
	VectorSplitter.x.connectTo(Mod.left);
	pixelSize1.output.connectTo(pixelSize.input);
	pixelSize4.output.connectTo(Mod.right);
	Mod.output.connectTo(Subtract.right);
	Subtract.output.connectTo(Add1.left);
	VectorSplitter.y.connectTo(Add.left);
	Time.output.connectTo(Multiply.left);
	speed.output.connectTo(Multiply.right);
	Multiply.output.connectTo(Add.right);
	Add.output.connectTo(Subtract1.left);
	Add.output.connectTo(Mod1.left);
	pixelSize2.output.connectTo(Mod1.right);
	Mod1.output.connectTo(Subtract1.right);
	Subtract1.output.connectTo(Add1.right);
	Add1.output.connectTo(Fract.input);
	Fract.output.connectTo(Gradient.gradient);
	Gradient.output.connectTo(FragmentOutput.rgb);

	// Output nodes
	nodeMaterial.addOutputNode(VertexOutput);
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.build();

	nodeMaterial.backFaceCulling = false;
	return [
		nodeMaterial,
		{
			pixelSize : pixelSize1,
			speed : speed
		}];
}
