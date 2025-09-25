import { Color3, Scene, Vector3 } from "@babylonjs/core";
import { AddBlock, AnimatedInputBlockTypes, DivideBlock, DotBlock, FragmentOutputBlock, InputBlock, InstancesBlock, LerpBlock, LightBlock, MultiplyBlock, NegateBlock, NodeMaterial, NodeMaterialModes, NodeMaterialSystemValues, NodeMaterialTeleportInBlock, NodeMaterialTeleportOutBlock, PowBlock, SimplexPerlin3DBlock, SubtractBlock, TransformBlock, TrigonometryBlock, TrigonometryBlockOperations, VectorMergerBlock, VectorSplitterBlock, VertexOutputBlock } from "@babylonjs/core/Materials/Node";

export type	GrassMaterialAndInputs = [ NodeMaterial, GrassMaterialInputsBlocks ];

interface	GrassMaterialInputsBlocks
{
	positionFactor: InputBlock
	timeFactor: InputBlock,
	time : InputBlock,
	noiseDisplacement : InputBlock,
	windDirection : InputBlock,
	height: InputBlock,
	windYRepartitionPower: InputBlock,
	grassMovementFactor: InputBlock,
	grassColorBottom: InputBlock,
	grassColorTop: InputBlock
}

export function	buildGrassMaterial(name : string, scene : Scene) : GrassMaterialAndInputs
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
	var Worldposition = new TransformBlock("World position");
	Worldposition.visibleInInspector = false;
	Worldposition.visibleOnFrame = false;
	Worldposition.target = 1;
	Worldposition.complementZ = 0;
	Worldposition.complementW = 1;

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

	// DotBlock
	var Dot = new DotBlock("Dot");
	Dot.visibleInInspector = false;
	Dot.visibleOnFrame = false;
	Dot.target = 4;

	// SubtractBlock
	var Subtract = new SubtractBlock("Subtract");
	Subtract.visibleInInspector = false;
	Subtract.visibleOnFrame = false;
	Subtract.target = 4;

	// NodeMaterialTeleportInBlock
	var worldPos = new NodeMaterialTeleportInBlock("worldPos");
	worldPos.visibleInInspector = false;
	worldPos.visibleOnFrame = false;
	worldPos.target = 1;

	// VectorSplitterBlock
	var VectorSplitter = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter.visibleInInspector = false;
	VectorSplitter.visibleOnFrame = false;
	VectorSplitter.target = 4;

	// NodeMaterialTeleportOutBlock
	var worldPos1 = new NodeMaterialTeleportOutBlock("> worldPos");
	worldPos1.visibleInInspector = false;
	worldPos1.visibleOnFrame = false;
	worldPos1.target = 1;
	worldPos.attachToEndpoint(worldPos1);

	// VectorMergerBlock
	var VectorMerger = new VectorMergerBlock("VectorMerger");
	VectorMerger.visibleInInspector = false;
	VectorMerger.visibleOnFrame = false;
	VectorMerger.target = 4;
	VectorMerger.xSwizzle = "x";
	VectorMerger.ySwizzle = "y";
	VectorMerger.zSwizzle = "z";
	VectorMerger.wSwizzle = "w";

	// MultiplyBlock
	var Multiply = new MultiplyBlock("Multiply");
	Multiply.visibleInInspector = false;
	Multiply.visibleOnFrame = false;
	Multiply.target = 4;

	// InputBlock
	var positionFactor = new InputBlock("positionFactor");
	positionFactor.visibleInInspector = false;
	positionFactor.visibleOnFrame = false;
	positionFactor.target = 1;
	positionFactor.value = 0.01;
	positionFactor.min = 0;
	positionFactor.max = 0;
	positionFactor.isBoolean = false;
	positionFactor.matrixMode = 0;
	positionFactor.animationType = AnimatedInputBlockTypes.None;
	positionFactor.isConstant = false;

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

	// MultiplyBlock
	var Multiply2 = new MultiplyBlock("Multiply");
	Multiply2.visibleInInspector = false;
	Multiply2.visibleOnFrame = false;
	Multiply2.target = 4;

	// InputBlock
	var timeFactor = new InputBlock("timeFactor");
	timeFactor.visibleInInspector = false;
	timeFactor.visibleOnFrame = false;
	timeFactor.target = 1;
	timeFactor.value = 0.5;
	timeFactor.min = 0;
	timeFactor.max = 0;
	timeFactor.isBoolean = false;
	timeFactor.matrixMode = 0;
	timeFactor.animationType = AnimatedInputBlockTypes.None;
	timeFactor.isConstant = false;

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
	var noiseDisplacement = new InputBlock("noiseDisplacement");
	noiseDisplacement.visibleInInspector = false;
	noiseDisplacement.visibleOnFrame = false;
	noiseDisplacement.target = 1;
	noiseDisplacement.value = new Vector3(1, 0, 0);
	noiseDisplacement.isConstant = false;

	// SimplexPerlin3DBlock
	var SimplexPerlinD = new SimplexPerlin3DBlock("SimplexPerlin3D");
	SimplexPerlinD.visibleInInspector = false;
	SimplexPerlinD.visibleOnFrame = false;
	SimplexPerlinD.target = 4;

	// MultiplyBlock
	var Multiply3 = new MultiplyBlock("Multiply");
	Multiply3.visibleInInspector = false;
	Multiply3.visibleOnFrame = false;
	Multiply3.target = 4;

	// InputBlock
	var windDirection = new InputBlock("windDirection");
	windDirection.visibleInInspector = false;
	windDirection.visibleOnFrame = false;
	windDirection.target = 1;
	windDirection.value = new Vector3(1, 0, 1);
	windDirection.isConstant = false;

	// MultiplyBlock
	var Multiply4 = new MultiplyBlock("Multiply");
	Multiply4.visibleInInspector = false;
	Multiply4.visibleOnFrame = false;
	Multiply4.target = 4;

	// MultiplyBlock
	var Multiply5 = new MultiplyBlock("Multiply");
	Multiply5.visibleInInspector = false;
	Multiply5.visibleOnFrame = false;
	Multiply5.target = 4;

	// PowBlock
	var Pow = new PowBlock("Pow");
	Pow.visibleInInspector = false;
	Pow.visibleOnFrame = false;
	Pow.target = 4;

	// NodeMaterialTeleportInBlock
	var normalizedY = new NodeMaterialTeleportInBlock("normalizedY");
	normalizedY.visibleInInspector = false;
	normalizedY.visibleOnFrame = false;
	normalizedY.target = 4;

	// DivideBlock
	var Divide = new DivideBlock("Divide");
	Divide.visibleInInspector = false;
	Divide.visibleOnFrame = false;
	Divide.target = 4;

	// VectorSplitterBlock
	var VectorSplitter1 = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter1.visibleInInspector = false;
	VectorSplitter1.visibleOnFrame = false;
	VectorSplitter1.target = 4;

	// InputBlock
	var position1 = new InputBlock("position");
	position1.visibleInInspector = false;
	position1.visibleOnFrame = false;
	position1.target = 1;
	position1.setAsAttribute("position");

	// InputBlock
	var height = new InputBlock("height");
	height.visibleInInspector = false;
	height.visibleOnFrame = false;
	height.target = 1;
	height.value = 1;
	height.min = 0;
	height.max = 0;
	height.isBoolean = false;
	height.matrixMode = 0;
	height.animationType = AnimatedInputBlockTypes.None;
	height.isConstant = false;

	// LerpBlock
	var Lerp = new LerpBlock("Lerp");
	Lerp.visibleInInspector = false;
	Lerp.visibleOnFrame = false;
	Lerp.target = 4;

	// InputBlock
	var grassColorBottom = new InputBlock("grassColorBottom");
	grassColorBottom.visibleInInspector = false;
	grassColorBottom.visibleOnFrame = false;
	grassColorBottom.target = 1;
	grassColorBottom.value = new Color3(0.027450980392156862, 0.30196078431372547, 0.027450980392156862);
	grassColorBottom.isConstant = false;

	// InputBlock
	var grassColorTop = new InputBlock("grassColorTop");
	grassColorTop.visibleInInspector = false;
	grassColorTop.visibleOnFrame = false;
	grassColorTop.target = 1;
	grassColorTop.value = new Color3(0.023529411764705882, 0.6784313725490196, 0.023529411764705882);
	grassColorTop.isConstant = false;

	// LightBlock
	var Lights = new LightBlock("Lights");
	Lights.visibleInInspector = false;
	Lights.visibleOnFrame = false;
	Lights.target = 3;

	// VectorMergerBlock
	var VectorMerger1 = new VectorMergerBlock("VectorMerger");
	VectorMerger1.visibleInInspector = false;
	VectorMerger1.visibleOnFrame = false;
	VectorMerger1.target = 4;
	VectorMerger1.xSwizzle = "x";
	VectorMerger1.ySwizzle = "y";
	VectorMerger1.zSwizzle = "z";
	VectorMerger1.wSwizzle = "w";

	// NodeMaterialTeleportOutBlock
	var worldPos2 = new NodeMaterialTeleportOutBlock("> worldPos");
	worldPos2.visibleInInspector = false;
	worldPos2.visibleOnFrame = false;
	worldPos2.target = 1;
	worldPos.attachToEndpoint(worldPos2);

	// InputBlock
	var Float = new InputBlock("Float");
	Float.visibleInInspector = false;
	Float.visibleOnFrame = false;
	Float.target = 1;
	Float.value = 1;
	Float.min = 0;
	Float.max = 0;
	Float.isBoolean = false;
	Float.matrixMode = 0;
	Float.animationType = AnimatedInputBlockTypes.None;
	Float.isConstant = true;

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
	var Multiply6 = new MultiplyBlock("Multiply");
	Multiply6.visibleInInspector = false;
	Multiply6.visibleOnFrame = false;
	Multiply6.target = 4;

	// NegateBlock
	var Negate = new NegateBlock("Negate");
	Negate.visibleInInspector = false;
	Negate.visibleOnFrame = false;
	Negate.target = 4;

	// TrigonometryBlock
	var Sign = new TrigonometryBlock("Sign");
	Sign.visibleInInspector = false;
	Sign.visibleOnFrame = false;
	Sign.target = 4;
	Sign.operation = TrigonometryBlockOperations.Sign;

	// InputBlock
	var normal1 = new InputBlock("normal");
	normal1.visibleInInspector = false;
	normal1.visibleOnFrame = false;
	normal1.target = 1;
	normal1.setAsAttribute("normal");

	// InputBlock
	var Float1 = new InputBlock("Float");
	Float1.visibleInInspector = false;
	Float1.visibleOnFrame = false;
	Float1.target = 1;
	Float1.value = 1;
	Float1.min = 0;
	Float1.max = 0;
	Float1.isBoolean = false;
	Float1.matrixMode = 0;
	Float1.animationType = AnimatedInputBlockTypes.None;
	Float1.isConstant = true;

	// InputBlock
	var cameraPosition = new InputBlock("cameraPosition");
	cameraPosition.visibleInInspector = false;
	cameraPosition.visibleOnFrame = false;
	cameraPosition.target = 1;
	cameraPosition.setAsSystemValue(NodeMaterialSystemValues.CameraPosition);

	// InputBlock
	var View = new InputBlock("View");
	View.visibleInInspector = false;
	View.visibleOnFrame = false;
	View.target = 1;
	View.setAsSystemValue(NodeMaterialSystemValues.View);

	// MultiplyBlock
	var Multiply7 = new MultiplyBlock("Multiply");
	Multiply7.visibleInInspector = false;
	Multiply7.visibleOnFrame = false;
	Multiply7.target = 4;

	// FragmentOutputBlock
	var FragmentOutput = new FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

	// NodeMaterialTeleportOutBlock
	var normalizedY1 = new NodeMaterialTeleportOutBlock("> normalizedY");
	normalizedY1.visibleInInspector = false;
	normalizedY1.visibleOnFrame = false;
	normalizedY1.target = 4;
	normalizedY.attachToEndpoint(normalizedY1);

	// NodeMaterialTeleportOutBlock
	var normalizedY2 = new NodeMaterialTeleportOutBlock("> normalizedY");
	normalizedY2.visibleInInspector = false;
	normalizedY2.visibleOnFrame = false;
	normalizedY2.target = 4;
	normalizedY.attachToEndpoint(normalizedY2);

	// InputBlock
	var windYRepartitionPower = new InputBlock("windYRepartitionPower");
	windYRepartitionPower.visibleInInspector = false;
	windYRepartitionPower.visibleOnFrame = false;
	windYRepartitionPower.target = 1;
	windYRepartitionPower.value = 2;
	windYRepartitionPower.min = 0;
	windYRepartitionPower.max = 0;
	windYRepartitionPower.isBoolean = false;
	windYRepartitionPower.matrixMode = 0;
	windYRepartitionPower.animationType = AnimatedInputBlockTypes.None;
	windYRepartitionPower.isConstant = false;

	// InputBlock
	var grassMovementFactor = new InputBlock("grassMovementFactor");
	grassMovementFactor.visibleInInspector = false;
	grassMovementFactor.visibleOnFrame = false;
	grassMovementFactor.target = 1;
	grassMovementFactor.value = 0.5;
	grassMovementFactor.min = 0;
	grassMovementFactor.max = 0;
	grassMovementFactor.isBoolean = false;
	grassMovementFactor.matrixMode = 0;
	grassMovementFactor.animationType = AnimatedInputBlockTypes.None;
	grassMovementFactor.isConstant = false;

	// AddBlock
	var Add1 = new AddBlock("Add");
	Add1.visibleInInspector = false;
	Add1.visibleOnFrame = false;
	Add1.target = 4;

	// NodeMaterialTeleportOutBlock
	var worldPos3 = new NodeMaterialTeleportOutBlock("> worldPos");
	worldPos3.visibleInInspector = false;
	worldPos3.visibleOnFrame = false;
	worldPos3.target = 1;
	worldPos.attachToEndpoint(worldPos3);

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
	var worldPos4 = new NodeMaterialTeleportOutBlock("> worldPos");
	worldPos4.visibleInInspector = false;
	worldPos4.visibleOnFrame = false;
	worldPos4.target = 1;
	worldPos.attachToEndpoint(worldPos4);

	// NodeMaterialTeleportOutBlock
	var worldPos5 = new NodeMaterialTeleportOutBlock("> worldPos");
	worldPos5.visibleInInspector = false;
	worldPos5.visibleOnFrame = false;
	worldPos5.target = 1;
	worldPos.attachToEndpoint(worldPos5);

	// InputBlock
	var Cameraposition = new InputBlock("Camera position");
	Cameraposition.visibleInInspector = false;
	Cameraposition.visibleOnFrame = false;
	Cameraposition.target = 1;
	Cameraposition.setAsSystemValue(NodeMaterialSystemValues.CameraPosition);

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
	position.output.connectTo(Worldposition.vector);
	world.output.connectTo(Instances.world0);
	world1.output.connectTo(Instances.world1);
	world2.output.connectTo(Instances.world2);
	world3.output.connectTo(Instances.world3);
	world4.output.connectTo(Instances.world);
	Instances.output.connectTo(instanceWorld.input);
	instanceWorld3.output.connectTo(Worldposition.transform);
	Worldposition.xyz.connectTo(worldPos.input);
	worldPos1.output.connectTo(VectorSplitter.xyzIn);
	VectorSplitter.x.connectTo(VectorMerger.x);
	VectorSplitter.z.connectTo(VectorMerger.z);
	VectorMerger.xyz.connectTo(Multiply.left);
	positionFactor.output.connectTo(Multiply.right);
	Multiply.output.connectTo(Add.left);
	timeFactor.output.connectTo(Multiply2.left);
	time.output.connectTo(Multiply2.right);
	Multiply2.output.connectTo(Multiply1.left);
	noiseDisplacement.output.connectTo(Multiply1.right);
	Multiply1.output.connectTo(Add.right);
	Add.output.connectTo(SimplexPerlinD.seed);
	SimplexPerlinD.output.connectTo(Multiply3.left);
	windDirection.output.connectTo(Multiply3.right);
	Multiply3.output.connectTo(Multiply4.left);
	position1.output.connectTo(VectorSplitter1.xyzIn);
	VectorSplitter1.y.connectTo(Divide.left);
	height.output.connectTo(Divide.right);
	Divide.output.connectTo(normalizedY.input);
	normalizedY2.output.connectTo(Pow.value);
	windYRepartitionPower.output.connectTo(Pow.power);
	Pow.output.connectTo(Multiply5.left);
	grassMovementFactor.output.connectTo(Multiply5.right);
	Multiply5.output.connectTo(Multiply4.right);
	Multiply4.output.connectTo(Add1.left);
	worldPos3.output.connectTo(Add1.right);
	Add1.output.connectTo(WorldPosViewProjectionTransform.vector);
	ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
	WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
	grassColorBottom.output.connectTo(Lerp.left);
	grassColorTop.output.connectTo(Lerp.right);
	Divide.output.connectTo(Lerp.gradient);
	Lerp.output.connectTo(Multiply7.left);
	worldPos2.output.connectTo(VectorMerger1.xyzIn);
	Float.output.connectTo(VectorMerger1.w);
	VectorMerger1.xyzw.connectTo(Lights.worldPosition);
	worldPos5.output.connectTo(Subtract.left);
	Cameraposition.output.connectTo(Subtract.right);
	Subtract.output.connectTo(Dot.left);
	normal.output.connectTo(Worldnormal.vector);
	instanceWorld1.output.connectTo(Worldnormal.transform);
	Worldnormal.xyz.connectTo(Dot.right);
	Dot.output.connectTo(Sign.input);
	Sign.output.connectTo(Negate.value);
	Negate.output.connectTo(Multiply6.left);
	normal1.output.connectTo(Multiply6.right);
	Multiply6.output.connectTo(VectorMerger2.xyzIn);
	Float1.output.connectTo(VectorMerger2.w);
	VectorMerger2.xyzw.connectTo(Lights.worldNormal);
	cameraPosition.output.connectTo(Lights.cameraPosition);
	Lerp.output.connectTo(Lights.diffuseColor);
	View.output.connectTo(Lights.view);
	Lights.shadow.connectTo(Multiply7.right);
	Multiply7.output.connectTo(FragmentOutput.rgb);

	// Output nodes
	nodeMaterial.addOutputNode(VertexOutput);
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.build();

	nodeMaterial.backFaceCulling = false;
	return [
		nodeMaterial,
		{
			positionFactor: positionFactor,
			timeFactor: timeFactor,
			time : time ,
			noiseDisplacement : noiseDisplacement ,
			windDirection : windDirection ,
			height: height,
			windYRepartitionPower: windYRepartitionPower,
			grassMovementFactor: grassMovementFactor,
			grassColorBottom: grassColorBottom,
			grassColorTop: grassColorTop
		}
	];
}
