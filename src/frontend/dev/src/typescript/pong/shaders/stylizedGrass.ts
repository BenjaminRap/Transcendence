import { Color3, Scene, Texture, Vector2, Vector3 } from "@babylonjs/core";
import { AddBlock, AnimatedInputBlockTypes, ClampBlock, DistanceBlock, FragmentOutputBlock, ImageSourceBlock, InputBlock, InstancesBlock, LerpBlock, LightBlock, MultiplyBlock, NegateBlock, NodeMaterial, NodeMaterialModes, NodeMaterialSystemValues, NodeMaterialTeleportInBlock, NodeMaterialTeleportOutBlock, SimplexPerlin3DBlock, SmoothStepBlock, SubtractBlock, TextureBlock, TransformBlock, VectorMergerBlock, VectorSplitterBlock, VertexOutputBlock } from "@babylonjs/core/Materials/Node";

export type	StylizedGrassMaterialAndInputs = [ NodeMaterial, StylizedGrassMaterialInputsBlocks ];

interface	StylizedGrassMaterialInputsBlocks
{
	mainTextureSource: ImageSourceBlock,
	bottomColor: InputBlock,
	nearColor: InputBlock,
	farColor: InputBlock,
	near: InputBlock,
	far: InputBlock,
	minHeight: InputBlock,
	maxHeight: InputBlock,
	windSpeed: InputBlock,
	windDirection: InputBlock,
	windSwayScale: InputBlock,
	windSwaySpeed: InputBlock,
	windTextureSubtract: InputBlock
	windSwayDirection: InputBlock,
	swayColor: InputBlock,
	windTextureSource: ImageSourceBlock
}

export function	buildStylizedGrassMaterial(name : string, scene : Scene) : StylizedGrassMaterialAndInputs
{
	var nodeMaterial = new NodeMaterial(name, scene);
	nodeMaterial.mode = NodeMaterialModes.Material;

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

	// MultiplyBlock
	var noiseDisplacement = new MultiplyBlock("noiseDisplacement");
	noiseDisplacement.visibleInInspector = false;
	noiseDisplacement.visibleOnFrame = false;
	noiseDisplacement.target = 4;

	// InputBlock
	var windSpeed = new InputBlock("windSpeed");
	windSpeed.visibleInInspector = false;
	windSpeed.visibleOnFrame = false;
	windSpeed.target = 1;
	windSpeed.value = 0.1;
	windSpeed.min = 0;
	windSpeed.max = 0;
	windSpeed.isBoolean = false;
	windSpeed.matrixMode = 0;
	windSpeed.animationType = AnimatedInputBlockTypes.None;
	windSpeed.isConstant = false;

	// VectorMergerBlock
	var noiseSeed = new VectorMergerBlock("noiseSeed");
	noiseSeed.visibleInInspector = false;
	noiseSeed.visibleOnFrame = false;
	noiseSeed.target = 4;
	noiseSeed.xSwizzle = "x";
	noiseSeed.ySwizzle = "y";
	noiseSeed.zSwizzle = "z";
	noiseSeed.wSwizzle = "w";

	// SimplexPerlin3DBlock
	var simplexPerlinD = new SimplexPerlin3DBlock("simplexPerlin3D");
	simplexPerlinD.visibleInInspector = false;
	simplexPerlinD.visibleOnFrame = false;
	simplexPerlinD.target = 4;

	// MultiplyBlock
	var Multiply = new MultiplyBlock("Multiply");
	Multiply.visibleInInspector = false;
	Multiply.visibleOnFrame = false;
	Multiply.target = 4;

	// InputBlock
	var windDirection = new InputBlock("windDirection");
	windDirection.visibleInInspector = false;
	windDirection.visibleOnFrame = false;
	windDirection.target = 1;
	windDirection.value = new Vector3(1, 0, 1);
	windDirection.isConstant = false;

	// AddBlock
	var Add = new AddBlock("Add");
	Add.visibleInInspector = false;
	Add.visibleOnFrame = false;
	Add.target = 4;

	// MultiplyBlock
	var Multiply1 = new MultiplyBlock("Multiply");
	Multiply1.visibleInInspector = false;
	Multiply1.visibleOnFrame = false;
	Multiply1.target = 4;

	// SubtractBlock
	var Subtract = new SubtractBlock("Subtract");
	Subtract.visibleInInspector = false;
	Subtract.visibleOnFrame = false;
	Subtract.target = 4;

	// TextureBlock
	var windTexture = new TextureBlock("windTexture");
	windTexture.visibleInInspector = false;
	windTexture.visibleOnFrame = false;
	windTexture.target = 3;
	windTexture.convertToGammaSpace = false;
	windTexture.convertToLinearSpace = false;
	windTexture.disableLevelMultiplication = false;

	// AddBlock
	var Add1 = new AddBlock("Add");
	Add1.visibleInInspector = false;
	Add1.visibleOnFrame = false;
	Add1.target = 4;

	// MultiplyBlock
	var Multiply2 = new MultiplyBlock("Multiply");
	Multiply2.visibleInInspector = false;
	Multiply2.visibleOnFrame = false;
	Multiply2.target = 4;

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
	var worldPos = new NodeMaterialTeleportInBlock("worldPos3");
	worldPos.visibleInInspector = false;
	worldPos.visibleOnFrame = false;
	worldPos.target = 1;

	// TransformBlock
	var worldPos1 = new TransformBlock("worldPos");
	worldPos1.visibleInInspector = false;
	worldPos1.visibleOnFrame = false;
	worldPos1.target = 1;
	worldPos1.complementZ = 0;
	worldPos1.complementW = 1;

	// InputBlock
	var position = new InputBlock("position");
	position.visibleInInspector = false;
	position.visibleOnFrame = false;
	position.target = 1;
	position.setAsAttribute("position");

	// NodeMaterialTeleportInBlock
	var instanceWorld = new NodeMaterialTeleportInBlock("instanceWorld");
	instanceWorld.visibleInInspector = false;
	instanceWorld.visibleOnFrame = false;
	instanceWorld.target = 1;

	// InstancesBlock
	var instances = new InstancesBlock("instances");
	instances.visibleInInspector = false;
	instances.visibleOnFrame = false;
	instances.target = 1;

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
	var worldNormal = new TransformBlock("worldNormal");
	worldNormal.visibleInInspector = false;
	worldNormal.visibleOnFrame = false;
	worldNormal.target = 1;
	worldNormal.complementZ = 0;
	worldNormal.complementW = 0;

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
	var lights = new LightBlock("lights");
	lights.visibleInInspector = false;
	lights.visibleOnFrame = false;
	lights.target = 3;

	// NodeMaterialTeleportInBlock
	var worldPos2 = new NodeMaterialTeleportInBlock("worldPos4");
	worldPos2.visibleInInspector = false;
	worldPos2.visibleOnFrame = false;
	worldPos2.target = 1;

	// NodeMaterialTeleportOutBlock
	var worldPos3 = new NodeMaterialTeleportOutBlock("> worldPos4");
	worldPos3.visibleInInspector = false;
	worldPos3.visibleOnFrame = false;
	worldPos3.target = 1;
	worldPos2.attachToEndpoint(worldPos3);

	// NodeMaterialTeleportOutBlock
	var worldPos4 = new NodeMaterialTeleportOutBlock("> worldPos4");
	worldPos4.visibleInInspector = false;
	worldPos4.visibleOnFrame = false;
	worldPos4.target = 1;
	worldPos2.attachToEndpoint(worldPos4);

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

	// LerpBlock
	var unlitColor = new LerpBlock("unlitColor");
	unlitColor.visibleInInspector = false;
	unlitColor.visibleOnFrame = false;
	unlitColor.target = 4;

	// InputBlock
	var bottomColor = new InputBlock("bottomColor");
	bottomColor.visibleInInspector = false;
	bottomColor.visibleOnFrame = false;
	bottomColor.target = 1;
	bottomColor.value = new Color3(0.027450980392156862, 0.25882352941176473, 0.08235294117647059);
	bottomColor.isConstant = false;

	// LerpBlock
	var distanceBlendedColor = new LerpBlock("distanceBlendedColor");
	distanceBlendedColor.visibleInInspector = false;
	distanceBlendedColor.visibleOnFrame = false;
	distanceBlendedColor.target = 4;

	// InputBlock
	var nearColor = new InputBlock("nearColor");
	nearColor.visibleInInspector = false;
	nearColor.visibleOnFrame = false;
	nearColor.target = 1;
	nearColor.value = new Color3(0, 0, 0);
	nearColor.isConstant = false;

	// InputBlock
	var farColor = new InputBlock("farColor");
	farColor.visibleInInspector = false;
	farColor.visibleOnFrame = false;
	farColor.target = 1;
	farColor.value = new Color3(0.8666666666666667, 1, 0);
	farColor.isConstant = false;

	// SmoothStepBlock
	var distanceBlending = new SmoothStepBlock("distanceBlending");
	distanceBlending.visibleInInspector = false;
	distanceBlending.visibleOnFrame = false;
	distanceBlending.target = 4;

	// DistanceBlock
	var viewVector = new DistanceBlock("viewVector");
	viewVector.visibleInInspector = false;
	viewVector.visibleOnFrame = false;
	viewVector.target = 4;

	// NodeMaterialTeleportOutBlock
	var worldPos5 = new NodeMaterialTeleportOutBlock("> worldPos3");
	worldPos5.visibleInInspector = false;
	worldPos5.visibleOnFrame = false;
	worldPos5.target = 1;
	worldPos.attachToEndpoint(worldPos5);

	// InputBlock
	var cameraPosition1 = new InputBlock("cameraPosition");
	cameraPosition1.visibleInInspector = false;
	cameraPosition1.visibleOnFrame = false;
	cameraPosition1.target = 1;
	cameraPosition1.setAsSystemValue(NodeMaterialSystemValues.CameraPosition);

	// InputBlock
	var near = new InputBlock("near");
	near.visibleInInspector = false;
	near.visibleOnFrame = false;
	near.target = 1;
	near.value = 0;
	near.min = 0;
	near.max = 50;
	near.isBoolean = false;
	near.matrixMode = 0;
	near.animationType = AnimatedInputBlockTypes.None;
	near.isConstant = false;

	// InputBlock
	var far = new InputBlock("far");
	far.visibleInInspector = false;
	far.visibleOnFrame = false;
	far.target = 1;
	far.value = 50;
	far.min = 0;
	far.max = 50;
	far.isBoolean = false;
	far.matrixMode = 0;
	far.animationType = AnimatedInputBlockTypes.None;
	far.isConstant = false;

	// ClampBlock
	var Clamp = new ClampBlock("Clamp");
	Clamp.visibleInInspector = false;
	Clamp.visibleOnFrame = false;
	Clamp.target = 4;
	Clamp.minimum = 0;
	Clamp.maximum = 1;

	// SmoothStepBlock
	var heightBlending = new SmoothStepBlock("heightBlending");
	heightBlending.visibleInInspector = false;
	heightBlending.visibleOnFrame = false;
	heightBlending.target = 4;

	// VectorSplitterBlock
	var vertexY = new VectorSplitterBlock("vertexY");
	vertexY.visibleInInspector = false;
	vertexY.visibleOnFrame = false;
	vertexY.target = 4;

	// InputBlock
	var position1 = new InputBlock("position");
	position1.visibleInInspector = false;
	position1.visibleOnFrame = false;
	position1.target = 1;
	position1.setAsAttribute("position");

	// InputBlock
	var minHeight = new InputBlock("minHeight");
	minHeight.visibleInInspector = false;
	minHeight.visibleOnFrame = false;
	minHeight.target = 1;
	minHeight.value = 0;
	minHeight.min = 0;
	minHeight.max = 1;
	minHeight.isBoolean = false;
	minHeight.matrixMode = 0;
	minHeight.animationType = AnimatedInputBlockTypes.None;
	minHeight.isConstant = false;

	// InputBlock
	var maxHeight = new InputBlock("maxHeight");
	maxHeight.visibleInInspector = false;
	maxHeight.visibleOnFrame = false;
	maxHeight.target = 1;
	maxHeight.value = 18;
	maxHeight.min = 0;
	maxHeight.max = 0;
	maxHeight.isBoolean = false;
	maxHeight.matrixMode = 0;
	maxHeight.animationType = AnimatedInputBlockTypes.None;
	maxHeight.isConstant = false;

	// NodeMaterialTeleportInBlock
	var normalizedHeight = new NodeMaterialTeleportInBlock("normalizedHeight");
	normalizedHeight.visibleInInspector = false;
	normalizedHeight.visibleOnFrame = false;
	normalizedHeight.target = 4;

	// MultiplyBlock
	var Multiply3 = new MultiplyBlock("Multiply");
	Multiply3.visibleInInspector = false;
	Multiply3.visibleOnFrame = false;
	Multiply3.target = 4;

	// NodeMaterialTeleportOutBlock
	var normalizedHeight1 = new NodeMaterialTeleportOutBlock("> normalizedHeight");
	normalizedHeight1.visibleInInspector = false;
	normalizedHeight1.visibleOnFrame = false;
	normalizedHeight1.target = 4;
	normalizedHeight.attachToEndpoint(normalizedHeight1);

	// AddBlock
	var displacedWorldPos = new AddBlock("displacedWorldPos");
	displacedWorldPos.visibleInInspector = false;
	displacedWorldPos.visibleOnFrame = false;
	displacedWorldPos.target = 4;

	// NodeMaterialTeleportOutBlock
	var worldPos6 = new NodeMaterialTeleportOutBlock("> worldPos3");
	worldPos6.visibleInInspector = false;
	worldPos6.visibleOnFrame = false;
	worldPos6.target = 1;
	worldPos.attachToEndpoint(worldPos6);

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
	var one = new InputBlock("one");
	one.visibleInInspector = false;
	one.visibleOnFrame = false;
	one.target = 1;
	one.value = 1;
	one.min = 1;
	one.max = 1;
	one.isBoolean = false;
	one.matrixMode = 0;
	one.animationType = AnimatedInputBlockTypes.None;
	one.isConstant = false;

	// TransformBlock
	var vertexScreenPos = new TransformBlock("vertexScreenPos");
	vertexScreenPos.visibleInInspector = false;
	vertexScreenPos.visibleOnFrame = false;
	vertexScreenPos.target = 1;
	vertexScreenPos.complementZ = 0;
	vertexScreenPos.complementW = 1;

	// InputBlock
	var viewProjection = new InputBlock("viewProjection");
	viewProjection.visibleInInspector = false;
	viewProjection.visibleOnFrame = false;
	viewProjection.target = 1;
	viewProjection.setAsSystemValue(NodeMaterialSystemValues.ViewProjection);

	// VertexOutputBlock
	var vertexOutput = new VertexOutputBlock("vertexOutput");
	vertexOutput.visibleInInspector = false;
	vertexOutput.visibleOnFrame = false;
	vertexOutput.target = 1;

	// InputBlock
	var swayColor = new InputBlock("swayColor");
	swayColor.visibleInInspector = false;
	swayColor.visibleOnFrame = false;
	swayColor.target = 1;
	swayColor.value = new Color3(0, 0, 0);
	swayColor.isConstant = false;

	// NodeMaterialTeleportInBlock
	var windTextureSample = new NodeMaterialTeleportInBlock("windTextureSample");
	windTextureSample.visibleInInspector = false;
	windTextureSample.visibleOnFrame = false;
	windTextureSample.target = 4;

	// NodeMaterialTeleportOutBlock
	var windTextureSample1 = new NodeMaterialTeleportOutBlock("> windTextureSample");
	windTextureSample1.visibleInInspector = false;
	windTextureSample1.visibleOnFrame = false;
	windTextureSample1.target = 4;
	windTextureSample.attachToEndpoint(windTextureSample1);

	// NodeMaterialTeleportOutBlock
	var windTextureSample2 = new NodeMaterialTeleportOutBlock("> windTextureSample");
	windTextureSample2.visibleInInspector = false;
	windTextureSample2.visibleOnFrame = false;
	windTextureSample2.target = 4;
	windTextureSample.attachToEndpoint(windTextureSample2);

	// InputBlock
	var View = new InputBlock("View");
	View.visibleInInspector = false;
	View.visibleOnFrame = false;
	View.target = 1;
	View.setAsSystemValue(NodeMaterialSystemValues.View);

	// MultiplyBlock
	var litColor = new MultiplyBlock("litColor");
	litColor.visibleInInspector = false;
	litColor.visibleOnFrame = false;
	litColor.target = 4;

	// FragmentOutputBlock
	var fragmentOutput = new FragmentOutputBlock("fragmentOutput");
	fragmentOutput.visibleInInspector = false;
	fragmentOutput.visibleOnFrame = false;
	fragmentOutput.target = 2;
	fragmentOutput.convertToGammaSpace = false;
	fragmentOutput.convertToLinearSpace = false;
	fragmentOutput.useLogarithmicDepth = false;

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
	var mainTextureSource = new ImageSourceBlock("mainTextureSource");
	mainTextureSource.visibleInInspector = false;
	mainTextureSource.visibleOnFrame = false;
	mainTextureSource.target = 3;

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

	// NodeMaterialTeleportOutBlock
	var worldPos7 = new NodeMaterialTeleportOutBlock("> worldPos3");
	worldPos7.visibleInInspector = false;
	worldPos7.visibleOnFrame = false;
	worldPos7.target = 1;
	worldPos.attachToEndpoint(worldPos7);

	// NodeMaterialTeleportOutBlock
	var worldPos8 = new NodeMaterialTeleportOutBlock("> worldPos3");
	worldPos8.visibleInInspector = false;
	worldPos8.visibleOnFrame = false;
	worldPos8.target = 1;
	worldPos.attachToEndpoint(worldPos8);

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
	var Multiply4 = new MultiplyBlock("Multiply");
	Multiply4.visibleInInspector = false;
	Multiply4.visibleOnFrame = false;
	Multiply4.target = 4;

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

	// ImageSourceBlock
	var windTextureSource = new ImageSourceBlock("windTextureSource");
	windTextureSource.visibleInInspector = false;
	windTextureSource.visibleOnFrame = false;
	windTextureSource.target = 3;

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
	windSwayDirection.value = new Vector3(1, 1, 1);
	windSwayDirection.isConstant = false;

	// Connections
	time.output.connectTo(noiseDisplacement.left);
	windSpeed.output.connectTo(noiseDisplacement.right);
	noiseDisplacement.output.connectTo(noiseSeed.x);
	noiseSeed.xyz.connectTo(simplexPerlinD.seed);
	simplexPerlinD.output.connectTo(Multiply.left);
	windDirection.output.connectTo(Multiply.right);
	Multiply.output.connectTo(Add.left);
	position.output.connectTo(worldPos1.vector);
	world.output.connectTo(instances.world0);
	world1.output.connectTo(instances.world1);
	world2.output.connectTo(instances.world2);
	world3.output.connectTo(instances.world3);
	world4.output.connectTo(instances.world);
	instances.output.connectTo(instanceWorld.input);
	instanceWorld3.output.connectTo(worldPos1.transform);
	worldPos1.xyz.connectTo(worldPos.input);
	worldPos8.output.connectTo(VectorSplitter.xyzIn);
	VectorSplitter.x.connectTo(VectorMerger.x);
	VectorSplitter.z.connectTo(VectorMerger.y);
	VectorMerger.xy.connectTo(Multiply2.left);
	windSwayScale.output.connectTo(Multiply2.right);
	Multiply2.output.connectTo(Add1.left);
	Time.output.connectTo(Multiply4.left);
	windSwaySpeed.output.connectTo(Multiply4.right);
	Multiply4.output.connectTo(Add1.right);
	Add1.output.connectTo(windTexture.uv);
	windTextureSource.source.connectTo(windTexture.source);
	windTexture.r.connectTo(Subtract.left);
	windTextureSubtract.output.connectTo(Subtract.right);
	Subtract.output.connectTo(Multiply1.left);
	windSwayDirection.output.connectTo(Multiply1.right);
	Multiply1.output.connectTo(Add.right);
	Add.output.connectTo(Multiply3.left);
	position1.output.connectTo(vertexY.xyzIn);
	vertexY.y.connectTo(heightBlending.value);
	minHeight.output.connectTo(heightBlending.edge0);
	maxHeight.output.connectTo(heightBlending.edge1);
	heightBlending.output.connectTo(Clamp.value);
	Clamp.output.connectTo(normalizedHeight.input);
	normalizedHeight1.output.connectTo(Multiply3.right);
	Multiply3.output.connectTo(displacedWorldPos.left);
	worldPos6.output.connectTo(displacedWorldPos.right);
	displacedWorldPos.output.connectTo(VectorMerger1.xyzIn);
	one.output.connectTo(VectorMerger1.w);
	VectorMerger1.xyzw.connectTo(vertexScreenPos.vector);
	viewProjection.output.connectTo(vertexScreenPos.transform);
	vertexScreenPos.output.connectTo(vertexOutput.vector);
	worldPos1.output.connectTo(worldPos2.input);
	worldPos4.output.connectTo(lights.worldPosition);
	normal.output.connectTo(worldNormal.vector);
	instanceWorld1.output.connectTo(worldNormal.transform);
	worldNormal.output.connectTo(lights.worldNormal);
	cameraPosition.output.connectTo(lights.cameraPosition);
	bottomColor.output.connectTo(unlitColor.left);
	nearColor.output.connectTo(distanceBlendedColor.left);
	farColor.output.connectTo(distanceBlendedColor.right);
	worldPos5.output.connectTo(viewVector.left);
	cameraPosition1.output.connectTo(viewVector.right);
	viewVector.output.connectTo(distanceBlending.value);
	near.output.connectTo(distanceBlending.edge0);
	far.output.connectTo(distanceBlending.edge1);
	distanceBlending.output.connectTo(distanceBlendedColor.gradient);
	distanceBlendedColor.output.connectTo(unlitColor.right);
	Clamp.output.connectTo(unlitColor.gradient);
	unlitColor.output.connectTo(Lerp.left);
	swayColor.output.connectTo(Lerp.right);
	windTexture.r.connectTo(windTextureSample.input);
	windTextureSample2.output.connectTo(Lerp.gradient);
	Lerp.output.connectTo(lights.diffuseColor);
	View.output.connectTo(lights.view);
	lights.diffuseOutput.connectTo(litColor.left);
	lights.shadow.connectTo(litColor.right);
	litColor.output.connectTo(fragmentOutput.rgb);
	uv.output.connectTo(mainTexture.uv);
	mainTextureSource.source.connectTo(mainTexture.source);
	mainTexture.a.connectTo(fragmentOutput.a);

	// Output nodes
	nodeMaterial.addOutputNode(vertexOutput);
	nodeMaterial.addOutputNode(fragmentOutput);
	nodeMaterial.build();

	nodeMaterial.backFaceCulling = false;
	return [
		nodeMaterial,
		{
			mainTextureSource: mainTextureSource,
			bottomColor: bottomColor,
			nearColor: nearColor,
			farColor: farColor,
			near: near,
			far: far,
			minHeight: minHeight,
			maxHeight: maxHeight,
			windSpeed: windSpeed,
			windDirection: windDirection,
			windSwaySpeed: windSwaySpeed,
			windSwayScale: windSwayScale,
			windTextureSubtract: windTextureSubtract,
			windSwayDirection: windSwayDirection,
			swayColor: swayColor,
			windTextureSource: windTextureSource
		}];
}
