import { Color3, Scene, Vector2, Vector3 } from "@babylonjs/core";
import { AddBlock, AnimatedInputBlockTypes, ClampBlock, DiscardBlock, DistanceBlock, DivideBlock, FragCoordBlock, FragmentOutputBlock, GradientBlock, GradientBlockColorStep, ImageSourceBlock, InputBlock, InstancesBlock, LerpBlock, LightBlock, ModBlock, MultiplyBlock, NegateBlock, NodeMaterial, NodeMaterialModes, NodeMaterialSystemValues, NodeMaterialTeleportInBlock, NodeMaterialTeleportOutBlock, ParticleTextureBlock, ScreenSizeBlock, SimplexPerlin3DBlock, SmoothStepBlock, SubtractBlock, TextureBlock, TransformBlock, TrigonometryBlock, TrigonometryBlockOperations, VectorMergerBlock, VectorSplitterBlock, VertexOutputBlock } from "@babylonjs/core/Materials/Node";
import type { ColorGradiant } from "../ColorGradiant";

export type	HologramMaterialAndInputs = [ NodeMaterial, HologramMaterialInputsBlocks ];

interface	HologramMaterialInputsBlocks
{
	textureDisplacement : InputBlock,
	firstColor : InputBlock,
	secondColor : InputBlock,
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
	var Color = new InputBlock("Color3");
	Color.visibleInInspector = false;
	Color.visibleOnFrame = false;
	Color.target = 1;
	Color.value = new Color3(0.10196078431372549, 0.4666666666666667, 0.10196078431372549);
	Color.isConstant = false;

	// LerpBlock
	var Lerp = new LerpBlock("Lerp");
	Lerp.visibleInInspector = false;
	Lerp.visibleOnFrame = false;
	Lerp.target = 4;

	// InputBlock
	var Color1 = new InputBlock("Color3");
	Color1.visibleInInspector = false;
	Color1.visibleOnFrame = false;
	Color1.target = 1;
	Color1.value = new Color3(0.34901960784313724, 0.9058823529411765, 0.49411764705882355);
	Color1.isConstant = false;

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
	var Multiply = new MultiplyBlock("Multiply");
	Multiply.visibleInInspector = false;
	Multiply.visibleOnFrame = false;
	Multiply.target = 4;

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

	// FragmentOutputBlock
	var FragmentOutput = new FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

	// Connections
	position.output.connectTo(WorldPos.vector);
	World.output.connectTo(WorldPos.transform);
	WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
	ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
	WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
	Color.output.connectTo(Lerp.left);
	Color1.output.connectTo(Lerp.right);
	FragCoord.xy.connectTo(Divide.left);
	ScreenSize.xy.connectTo(Divide.right);
	Divide.output.connectTo(Add.left);
	textureDisplacement.output.connectTo(Multiply.left);
	Time.output.connectTo(Multiply.right);
	Multiply.output.connectTo(Add.right);
	Add.output.connectTo(Texture.uv);
	ImageSource.source.connectTo(Texture.source);
	Texture.r.connectTo(Lerp.gradient);
	Lerp.output.connectTo(FragmentOutput.rgb);

	// Output nodes
	nodeMaterial.addOutputNode(VertexOutput);
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.build();

	return [
		nodeMaterial,
		{
			textureDisplacement: textureDisplacement,
			firstColor: Color,
			secondColor: Color1,
			textureSource: ImageSource
		}];
}
