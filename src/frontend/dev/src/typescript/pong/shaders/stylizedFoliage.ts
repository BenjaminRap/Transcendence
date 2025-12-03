import { Color3, Color4, Scene, Texture, Vector2, Vector3 } from "@babylonjs/core";
import { AddBlock, AnimatedInputBlockTypes, ClampBlock, DiscardBlock, DistanceBlock, DivideBlock, FragmentOutputBlock, ImageSourceBlock, InputBlock, InstancesBlock, LengthBlock, LerpBlock, LightBlock, MatrixSplitterBlock, MultiplyBlock, NegateBlock, NodeMaterial, NodeMaterialModes, NodeMaterialSystemValues, NodeMaterialTeleportInBlock, NodeMaterialTeleportOutBlock, RandomNumberBlock, SimplexPerlin3DBlock, SmoothStepBlock, SubtractBlock, TextureBlock, TransformBlock, TrigonometryBlock, TrigonometryBlockOperations, VectorMergerBlock, VectorSplitterBlock, VertexOutputBlock } from "@babylonjs/core/Materials/Node";

export type	StylizedFoliageMaterialAndInputs = [ NodeMaterial, StylizedFoliageMaterialInputsBlocks ];

interface	StylizedFoliageMaterialInputsBlocks
{
	mainImageSource : ImageSourceBlock,
	windSpeed: InputBlock,
	maxBounds : InputBlock,
	center : InputBlock,
	windContrast : InputBlock,
	windStrength : InputBlock,
	windSwaySpeed : InputBlock,
	windSwayScale : InputBlock,
	windTextureSubtract : InputBlock,
	windSwayDirection : InputBlock,
	windSwayColor : InputBlock,
	windTextureSource : ImageSourceBlock
}

export function	buildStylizedFoliageMaterial(name : string, scene : Scene) : StylizedFoliageMaterialAndInputs
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

	// NodeMaterialTeleportInBlock
	var instanceWorld = new NodeMaterialTeleportInBlock("instanceWorld");
	instanceWorld.visibleInInspector = false;
	instanceWorld.visibleOnFrame = false;
	instanceWorld.target = 1;

	// InstancesBlock
	var Instances = new InstancesBlock("Instances");
	Instances.visibleInInspector = false;
	Instances.visibleOnFrame = false;
	Instances.target = 1;

	// InputBlock
	var world = new InputBlock("world0");
	world.visibleInInspector = false;
	world.visibleOnFrame = false;
	world.target = 1;
	world.setAsAttribute("world0");

	// InputBlock
	var world1 = new InputBlock("world1");
	world1.visibleInInspector = false;
	world1.visibleOnFrame = false;
	world1.target = 1;
	world1.setAsAttribute("world1");

	// InputBlock
	var world2 = new InputBlock("world2");
	world2.visibleInInspector = false;
	world2.visibleOnFrame = false;
	world2.target = 1;
	world2.setAsAttribute("world2");

	// InputBlock
	var world3 = new InputBlock("world3");
	world3.visibleInInspector = false;
	world3.visibleOnFrame = false;
	world3.target = 1;
	world3.setAsAttribute("world3");

	// InputBlock
	var world4 = new InputBlock("world");
	world4.visibleInInspector = false;
	world4.visibleOnFrame = false;
	world4.target = 1;
	world4.setAsSystemValue(NodeMaterialSystemValues.World);

	// TransformBlock
	var Worldnormal = new TransformBlock("World normal");
	Worldnormal.visibleInInspector = false;
	Worldnormal.visibleOnFrame = false;
	Worldnormal.target = 1;
	Worldnormal.complementZ = 0;
	Worldnormal.complementW = 0;

	// InputBlock
	var normal = new InputBlock("normal");
	normal.visibleInInspector = false;
	normal.visibleOnFrame = false;
	normal.target = 1;
	normal.setAsAttribute("normal");

	// NodeMaterialTeleportOutBlock
	var instanceWorld1 = new NodeMaterialTeleportOutBlock("> instanceWorld");
	instanceWorld1.visibleInInspector = false;
	instanceWorld1.visibleOnFrame = false;
	instanceWorld1.target = 1;
	instanceWorld.attachToEndpoint(instanceWorld1);

	// LightBlock
	var Lights = new LightBlock("Lights");
	Lights.visibleInInspector = false;
	Lights.visibleOnFrame = false;
	Lights.target = 3;

	// NodeMaterialTeleportInBlock
	var worldPos = new NodeMaterialTeleportInBlock("worldPos4");
	worldPos.visibleInInspector = false;
	worldPos.visibleOnFrame = false;
	worldPos.target = 1;

	// NodeMaterialTeleportOutBlock
	var worldPos1 = new NodeMaterialTeleportOutBlock("> worldPos4");
	worldPos1.visibleInInspector = false;
	worldPos1.visibleOnFrame = false;
	worldPos1.target = 1;
	worldPos.attachToEndpoint(worldPos1);

	// NodeMaterialTeleportOutBlock
	var worldPos2 = new NodeMaterialTeleportOutBlock("> worldPos4");
	worldPos2.visibleInInspector = false;
	worldPos2.visibleOnFrame = false;
	worldPos2.target = 1;
	worldPos.attachToEndpoint(worldPos2);

	// InputBlock
	var cameraPosition = new InputBlock("cameraPosition");
	cameraPosition.visibleInInspector = false;
	cameraPosition.visibleOnFrame = false;
	cameraPosition.target = 1;
	cameraPosition.setAsSystemValue(NodeMaterialSystemValues.CameraPosition);

	// LerpBlock
	var Lerp = new LerpBlock("Lerp");
	Lerp.visibleInInspector = false;
	Lerp.visibleOnFrame = false;
	Lerp.target = 4;

	// TextureBlock
	var mainTexture = new TextureBlock("mainTexture");
	mainTexture.visibleInInspector = false;
	mainTexture.visibleOnFrame = false;
	mainTexture.target = 3;
	mainTexture.convertToGammaSpace = false;
	mainTexture.convertToLinearSpace = false;
	mainTexture.disableLevelMultiplication = false;

	// InputBlock
	var uv = new InputBlock("uv");
	uv.visibleInInspector = false;
	uv.visibleOnFrame = false;
	uv.target = 1;
	uv.setAsAttribute("uv");

	// ImageSourceBlock
	var mainImageSource = new ImageSourceBlock("mainImageSource");
	mainImageSource.visibleInInspector = false;
	mainImageSource.visibleOnFrame = false;
	mainImageSource.target = 3;

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

	// InputBlock
	var swayColor = new InputBlock("swayColor");
	swayColor.visibleInInspector = false;
	swayColor.visibleOnFrame = false;
	swayColor.target = 1;
	swayColor.value = new Color3(1, 1, 1);
	swayColor.isConstant = false;

	// TextureBlock
	var windTexture = new TextureBlock("windTexture");
	windTexture.visibleInInspector = false;
	windTexture.visibleOnFrame = false;
	windTexture.target = 3;
	windTexture.convertToGammaSpace = false;
	windTexture.convertToLinearSpace = false;
	windTexture.disableLevelMultiplication = false;

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

	// VectorMergerBlock
	var VectorMerger = new VectorMergerBlock("VectorMerger");
	VectorMerger.visibleInInspector = false;
	VectorMerger.visibleOnFrame = false;
	VectorMerger.target = 4;
	VectorMerger.xSwizzle = "x";
	VectorMerger.ySwizzle = "y";
	VectorMerger.zSwizzle = "z";
	VectorMerger.wSwizzle = "w";

	// VectorSplitterBlock
	var VectorSplitter = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter.visibleInInspector = false;
	VectorSplitter.visibleOnFrame = false;
	VectorSplitter.target = 4;

	// NodeMaterialTeleportInBlock
	var worldPos3 = new NodeMaterialTeleportInBlock("worldPos3");
	worldPos3.visibleInInspector = false;
	worldPos3.visibleOnFrame = false;
	worldPos3.target = 1;

	// RandomNumberBlock
	var Randomnumber = new RandomNumberBlock("Random number");
	Randomnumber.visibleInInspector = false;
	Randomnumber.visibleOnFrame = false;
	Randomnumber.target = 4;

	// NodeMaterialTeleportOutBlock
	var worldPos4 = new NodeMaterialTeleportOutBlock("> worldPos3");
	worldPos4.visibleInInspector = false;
	worldPos4.visibleOnFrame = false;
	worldPos4.target = 1;
	worldPos3.attachToEndpoint(worldPos4);

	// MultiplyBlock
	var Multiply1 = new MultiplyBlock("Multiply");
	Multiply1.visibleInInspector = false;
	Multiply1.visibleOnFrame = false;
	Multiply1.target = 4;

	// InputBlock
	var twoPi = new InputBlock("twoPi");
	twoPi.visibleInInspector = false;
	twoPi.visibleOnFrame = false;
	twoPi.target = 1;
	twoPi.value = 6.28;
	twoPi.min = 0;
	twoPi.max = 0;
	twoPi.isBoolean = false;
	twoPi.matrixMode = 0;
	twoPi.animationType = AnimatedInputBlockTypes.None;
	twoPi.isConstant = false;

	// TrigonometryBlock
	var Sin = new TrigonometryBlock("Sin");
	Sin.visibleInInspector = false;
	Sin.visibleOnFrame = false;
	Sin.target = 4;
	Sin.operation = TrigonometryBlockOperations.Sin;

	// VectorMergerBlock
	var VectorMerger1 = new VectorMergerBlock("VectorMerger");
	VectorMerger1.visibleInInspector = false;
	VectorMerger1.visibleOnFrame = false;
	VectorMerger1.target = 4;
	VectorMerger1.xSwizzle = "x";
	VectorMerger1.ySwizzle = "y";
	VectorMerger1.zSwizzle = "z";
	VectorMerger1.wSwizzle = "w";

	// InputBlock
	var Float1 = new InputBlock("Float");
	Float1.visibleInInspector = false;
	Float1.visibleOnFrame = false;
	Float1.target = 1;
	Float1.value = 0;
	Float1.min = 0;
	Float1.max = 0;
	Float1.isBoolean = false;
	Float1.matrixMode = 0;
	Float1.animationType = AnimatedInputBlockTypes.None;
	Float1.isConstant = false;

	// TrigonometryBlock
	var Cos = new TrigonometryBlock("Cos");
	Cos.visibleInInspector = false;
	Cos.visibleOnFrame = false;
	Cos.target = 4;
	Cos.operation = TrigonometryBlockOperations.Cos;

	// MultiplyBlock
	var Multiply2 = new MultiplyBlock("Multiply");
	Multiply2.visibleInInspector = false;
	Multiply2.visibleOnFrame = false;
	Multiply2.target = 4;

	// SimplexPerlin3DBlock
	var SimplexPerlinD = new SimplexPerlin3DBlock("SimplexPerlin3D");
	SimplexPerlinD.visibleInInspector = false;
	SimplexPerlinD.visibleOnFrame = false;
	SimplexPerlinD.target = 4;

	// VectorMergerBlock
	var VectorMerger2 = new VectorMergerBlock("VectorMerger");
	VectorMerger2.visibleInInspector = false;
	VectorMerger2.visibleOnFrame = false;
	VectorMerger2.target = 4;
	VectorMerger2.xSwizzle = "x";
	VectorMerger2.ySwizzle = "y";
	VectorMerger2.zSwizzle = "z";
	VectorMerger2.wSwizzle = "w";

	// MultiplyBlock
	var Multiply3 = new MultiplyBlock("Multiply");
	Multiply3.visibleInInspector = false;
	Multiply3.visibleOnFrame = false;
	Multiply3.target = 4;

	// InputBlock
	var time = new InputBlock("time");
	time.visibleInInspector = false;
	time.visibleOnFrame = false;
	time.target = 1;
	time.value = 0;
	time.min = 0;
	time.max = 0;
	time.isBoolean = false;
	time.matrixMode = 0;
	time.animationType = AnimatedInputBlockTypes.Time;
	time.isConstant = false;

	// InputBlock
	var windSpeed = new InputBlock("windSpeed");
	windSpeed.visibleInInspector = false;
	windSpeed.visibleOnFrame = false;
	windSpeed.target = 1;
	windSpeed.value = 1;
	windSpeed.min = 0;
	windSpeed.max = 0;
	windSpeed.isBoolean = false;
	windSpeed.matrixMode = 0;
	windSpeed.animationType = AnimatedInputBlockTypes.None;
	windSpeed.isConstant = false;

	// MultiplyBlock
	var Multiply4 = new MultiplyBlock("Multiply");
	Multiply4.visibleInInspector = false;
	Multiply4.visibleOnFrame = false;
	Multiply4.target = 4;

	// InputBlock
	var windStrength = new InputBlock("windStrength");
	windStrength.visibleInInspector = false;
	windStrength.visibleOnFrame = false;
	windStrength.target = 1;
	windStrength.value = 0.2;
	windStrength.min = 0;
	windStrength.max = 0;
	windStrength.isBoolean = false;
	windStrength.matrixMode = 0;
	windStrength.animationType = AnimatedInputBlockTypes.None;
	windStrength.isConstant = false;

	// MultiplyBlock
	var Multiply5 = new MultiplyBlock("Multiply");
	Multiply5.visibleInInspector = false;
	Multiply5.visibleOnFrame = false;
	Multiply5.target = 4;

	// SmoothStepBlock
	var Smoothstep = new SmoothStepBlock("Smooth step");
	Smoothstep.visibleInInspector = false;
	Smoothstep.visibleOnFrame = false;
	Smoothstep.target = 4;

	// LengthBlock
	var Length = new LengthBlock("Length");
	Length.visibleInInspector = false;
	Length.visibleOnFrame = false;
	Length.target = 4;

	// DivideBlock
	var Divide = new DivideBlock("Divide");
	Divide.visibleInInspector = false;
	Divide.visibleOnFrame = false;
	Divide.target = 4;

	// SubtractBlock
	var Subtract = new SubtractBlock("Subtract");
	Subtract.visibleInInspector = false;
	Subtract.visibleOnFrame = false;
	Subtract.target = 4;

	// InputBlock
	var position1 = new InputBlock("position");
	position1.visibleInInspector = false;
	position1.visibleOnFrame = false;
	position1.target = 1;
	position1.setAsAttribute("position");

	// InputBlock
	var center = new InputBlock("center");
	center.visibleInInspector = false;
	center.visibleOnFrame = false;
	center.target = 1;
	center.value = new Vector3(0, 0, 0);
	center.isConstant = false;

	// InputBlock
	var maxBounds = new InputBlock("maxBounds");
	maxBounds.visibleInInspector = false;
	maxBounds.visibleOnFrame = false;
	maxBounds.target = 1;
	maxBounds.value = new Vector3(0, 0, 0);
	maxBounds.isConstant = false;

	// VectorSplitterBlock
	var VectorSplitter1 = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter1.visibleInInspector = false;
	VectorSplitter1.visibleOnFrame = false;
	VectorSplitter1.target = 4;

	// InputBlock
	var windContrast = new InputBlock("windContrast");
	windContrast.visibleInInspector = false;
	windContrast.visibleOnFrame = false;
	windContrast.target = 1;
	windContrast.value = new Vector2(0.3, 1);
	windContrast.isConstant = false;

	// AddBlock
	var Add1 = new AddBlock("Add");
	Add1.visibleInInspector = false;
	Add1.visibleOnFrame = false;
	Add1.target = 4;

	// MultiplyBlock
	var Multiply6 = new MultiplyBlock("Multiply");
	Multiply6.visibleInInspector = false;
	Multiply6.visibleOnFrame = false;
	Multiply6.target = 4;

	// SubtractBlock
	var Subtract1 = new SubtractBlock("Subtract");
	Subtract1.visibleInInspector = false;
	Subtract1.visibleOnFrame = false;
	Subtract1.target = 4;

	// InputBlock
	var windTextureSubtract = new InputBlock("windTextureSubtract");
	windTextureSubtract.visibleInInspector = false;
	windTextureSubtract.visibleOnFrame = false;
	windTextureSubtract.target = 1;
	windTextureSubtract.value = 0.3;
	windTextureSubtract.min = 0;
	windTextureSubtract.max = 0;
	windTextureSubtract.isBoolean = false;
	windTextureSubtract.matrixMode = 0;
	windTextureSubtract.animationType = AnimatedInputBlockTypes.None;
	windTextureSubtract.isConstant = false;

	// InputBlock
	var windSwayDirection = new InputBlock("windSwayDirection");
	windSwayDirection.visibleInInspector = false;
	windSwayDirection.visibleOnFrame = false;
	windSwayDirection.target = 1;
	windSwayDirection.value = new Vector3(1, 0, 1);
	windSwayDirection.isConstant = false;

	// AddBlock
	var Add2 = new AddBlock("Add");
	Add2.visibleInInspector = false;
	Add2.visibleOnFrame = false;
	Add2.target = 4;

	// NodeMaterialTeleportOutBlock
	var worldPos5 = new NodeMaterialTeleportOutBlock("> worldPos3");
	worldPos5.visibleInInspector = false;
	worldPos5.visibleOnFrame = false;
	worldPos5.target = 1;
	worldPos3.attachToEndpoint(worldPos5);

	// VectorMergerBlock
	var VectorMerger3 = new VectorMergerBlock("VectorMerger");
	VectorMerger3.visibleInInspector = false;
	VectorMerger3.visibleOnFrame = false;
	VectorMerger3.target = 4;
	VectorMerger3.xSwizzle = "x";
	VectorMerger3.ySwizzle = "y";
	VectorMerger3.zSwizzle = "z";
	VectorMerger3.wSwizzle = "w";

	// InputBlock
	var Float2 = new InputBlock("Float");
	Float2.visibleInInspector = false;
	Float2.visibleOnFrame = false;
	Float2.target = 1;
	Float2.value = 1;
	Float2.min = 0;
	Float2.max = 0;
	Float2.isBoolean = false;
	Float2.matrixMode = 0;
	Float2.animationType = AnimatedInputBlockTypes.None;
	Float2.isConstant = false;

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

	// NodeMaterialTeleportOutBlock
	var worldPos6 = new NodeMaterialTeleportOutBlock("> worldPos3");
	worldPos6.visibleInInspector = false;
	worldPos6.visibleOnFrame = false;
	worldPos6.target = 1;
	worldPos3.attachToEndpoint(worldPos6);

	// NodeMaterialTeleportOutBlock
	var worldPos7 = new NodeMaterialTeleportOutBlock("> worldPos3");
	worldPos7.visibleInInspector = false;
	worldPos7.visibleOnFrame = false;
	worldPos7.target = 1;
	worldPos3.attachToEndpoint(worldPos7);

	// InputBlock
	var windSwayScale = new InputBlock("windSwayScale");
	windSwayScale.visibleInInspector = false;
	windSwayScale.visibleOnFrame = false;
	windSwayScale.target = 1;
	windSwayScale.value = 1;
	windSwayScale.min = 0;
	windSwayScale.max = 0;
	windSwayScale.isBoolean = false;
	windSwayScale.matrixMode = 0;
	windSwayScale.animationType = AnimatedInputBlockTypes.None;
	windSwayScale.isConstant = false;

	// MultiplyBlock
	var Multiply7 = new MultiplyBlock("Multiply");
	Multiply7.visibleInInspector = false;
	Multiply7.visibleOnFrame = false;
	Multiply7.target = 4;

	// InputBlock
	var windSwaySpeed = new InputBlock("windSwaySpeed");
	windSwaySpeed.visibleInInspector = false;
	windSwaySpeed.visibleOnFrame = false;
	windSwaySpeed.target = 1;
	windSwaySpeed.value = 1;
	windSwaySpeed.min = 0;
	windSwaySpeed.max = 0;
	windSwaySpeed.isBoolean = false;
	windSwaySpeed.matrixMode = 0;
	windSwaySpeed.animationType = AnimatedInputBlockTypes.None;
	windSwaySpeed.isConstant = false;

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
	var windTextureSource = new ImageSourceBlock("windTextureSource");
	windTextureSource.visibleInInspector = false;
	windTextureSource.visibleOnFrame = false;
	windTextureSource.target = 3;

	// InputBlock
	var View = new InputBlock("View");
	View.visibleInInspector = false;
	View.visibleOnFrame = false;
	View.target = 1;
	View.setAsSystemValue(NodeMaterialSystemValues.View);

	// MultiplyBlock
	var Multiply8 = new MultiplyBlock("Multiply");
	Multiply8.visibleInInspector = false;
	Multiply8.visibleOnFrame = false;
	Multiply8.target = 4;

	// FragmentOutputBlock
	var FragmentOutput = new FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

	// NodeMaterialTeleportOutBlock
	var instanceWorld2 = new NodeMaterialTeleportOutBlock("> instanceWorld");
	instanceWorld2.visibleInInspector = false;
	instanceWorld2.visibleOnFrame = false;
	instanceWorld2.target = 1;
	instanceWorld.attachToEndpoint(instanceWorld2);

	// NodeMaterialTeleportOutBlock
	var instanceWorld3 = new NodeMaterialTeleportOutBlock("> instanceWorld");
	instanceWorld3.visibleInInspector = false;
	instanceWorld3.visibleOnFrame = false;
	instanceWorld3.target = 1;
	instanceWorld.attachToEndpoint(instanceWorld3);

	// Connections
	position.output.connectTo(WorldPos.vector);
	world.output.connectTo(Instances.world0);
	world1.output.connectTo(Instances.world1);
	world2.output.connectTo(Instances.world2);
	world3.output.connectTo(Instances.world3);
	world4.output.connectTo(Instances.world);
	Instances.output.connectTo(instanceWorld.input);
	instanceWorld3.output.connectTo(WorldPos.transform);
	WorldPos.xyz.connectTo(worldPos3.input);
	worldPos7.output.connectTo(VectorSplitter.xyzIn);
	VectorSplitter.x.connectTo(VectorMerger.x);
	VectorSplitter.z.connectTo(VectorMerger.y);
	VectorMerger.xy.connectTo(Multiply.left);
	windSwayScale.output.connectTo(Multiply.right);
	Multiply.output.connectTo(Add.left);
	windSwaySpeed.output.connectTo(Multiply7.left);
	Time.output.connectTo(Multiply7.right);
	Multiply7.output.connectTo(Add.right);
	Add.output.connectTo(windTexture.uv);
	windTextureSource.source.connectTo(windTexture.source);
	windTexture.r.connectTo(Subtract1.left);
	windTextureSubtract.output.connectTo(Subtract1.right);
	Subtract1.output.connectTo(Multiply6.left);
	windSwayDirection.output.connectTo(Multiply6.right);
	Multiply6.output.connectTo(Add1.left);
	time.output.connectTo(Multiply3.left);
	windSpeed.output.connectTo(Multiply3.right);
	Multiply3.output.connectTo(VectorMerger2.y);
	VectorMerger2.xyz.connectTo(SimplexPerlinD.seed);
	SimplexPerlinD.output.connectTo(Multiply2.left);
	worldPos4.output.connectTo(Randomnumber.seed);
	Randomnumber.output.connectTo(Multiply1.left);
	twoPi.output.connectTo(Multiply1.right);
	Multiply1.output.connectTo(Sin.input);
	Sin.output.connectTo(VectorMerger1.x);
	Float1.output.connectTo(VectorMerger1.y);
	Multiply1.output.connectTo(Cos.input);
	Cos.output.connectTo(VectorMerger1.z);
	VectorMerger1.xyz.connectTo(Multiply2.right);
	Multiply2.output.connectTo(Multiply4.left);
	windStrength.output.connectTo(Multiply4.right);
	Multiply4.output.connectTo(Multiply5.left);
	position1.output.connectTo(Subtract.left);
	center.output.connectTo(Subtract.right);
	Subtract.output.connectTo(Divide.left);
	maxBounds.output.connectTo(Divide.right);
	Divide.output.connectTo(Length.value);
	Length.output.connectTo(Smoothstep.value);
	windContrast.output.connectTo(VectorSplitter1.xyIn);
	VectorSplitter1.x.connectTo(Smoothstep.edge0);
	VectorSplitter1.y.connectTo(Smoothstep.edge1);
	Smoothstep.output.connectTo(Multiply5.right);
	Multiply5.output.connectTo(Add1.right);
	Add1.output.connectTo(Add2.left);
	worldPos5.output.connectTo(Add2.right);
	Add2.output.connectTo(VectorMerger3.xyzIn);
	Float2.output.connectTo(VectorMerger3.w);
	VectorMerger3.xyzw.connectTo(WorldPosViewProjectionTransform.vector);
	ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
	WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
	WorldPos.output.connectTo(worldPos.input);
	worldPos2.output.connectTo(Lights.worldPosition);
	normal.output.connectTo(Worldnormal.vector);
	instanceWorld1.output.connectTo(Worldnormal.transform);
	Worldnormal.output.connectTo(Lights.worldNormal);
	cameraPosition.output.connectTo(Lights.cameraPosition);
	uv.output.connectTo(mainTexture.uv);
	mainImageSource.source.connectTo(mainTexture.source);
	mainTexture.rgb.connectTo(Lerp.left);
	swayColor.output.connectTo(Lerp.right);
	windTexture.r.connectTo(Lerp.gradient);
	Lerp.output.connectTo(Lights.diffuseColor);
	View.output.connectTo(Lights.view);
	Lights.diffuseOutput.connectTo(Multiply8.left);
	Lights.shadow.connectTo(Multiply8.right);
	Multiply8.output.connectTo(FragmentOutput.rgb);
	mainTexture.a.connectTo(Discard.value);
	Float.output.connectTo(Discard.cutoff);

	// Output nodes
	nodeMaterial.addOutputNode(VertexOutput);
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.addOutputNode(Discard);
	nodeMaterial.build();

	nodeMaterial.backFaceCulling = false;
	return [
		nodeMaterial,
		{
			mainImageSource: mainImageSource,
			windSpeed: windSpeed,
			maxBounds: maxBounds,
			center: center,
			windContrast: windContrast,
			windStrength: windStrength,
			windSwaySpeed : windSwaySpeed,
			windSwayScale : windSwayScale,
			windTextureSubtract : windTextureSubtract,
			windSwayDirection : windSwayDirection,
			windSwayColor: swayColor,
			windTextureSource : windTextureSource
		}];
}
