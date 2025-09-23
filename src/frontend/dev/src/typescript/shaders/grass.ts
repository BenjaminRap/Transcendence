import { Color4, Scene, Vector3 } from "@babylonjs/core";
import { AddBlock, AnimatedInputBlockTypes, DivideBlock, FragmentOutputBlock, InputBlock, MultiplyBlock, NodeMaterial, NodeMaterialModes, NodeMaterialSystemValues, PowBlock, SimplexPerlin3DBlock, TransformBlock, VectorMergerBlock, VectorSplitterBlock, VertexOutputBlock } from "@babylonjs/core/Materials/Node";

export type	GrassMaterialAndInputs = [ NodeMaterial, GrassMaterialInputsBlocks ];

interface	GrassMaterialInputsBlocks
{
	time : InputBlock,
	noiseDisplacement : InputBlock,
	windDirection : InputBlock,
	height: InputBlock,
	windYRepartitionPower: InputBlock,
	grassColor: InputBlock
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

	// VectorSplitterBlock
	var VectorSplitter = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter.visibleInInspector = false;
	VectorSplitter.visibleOnFrame = false;
	VectorSplitter.target = 4;

	// VectorMergerBlock
	var VectorMerger = new VectorMergerBlock("VectorMerger");
	VectorMerger.visibleInInspector = false;
	VectorMerger.visibleOnFrame = false;
	VectorMerger.target = 4;
	VectorMerger.xSwizzle = "x";
	VectorMerger.ySwizzle = "y";
	VectorMerger.zSwizzle = "z";
	VectorMerger.wSwizzle = "w";

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
	var Multiply1 = new MultiplyBlock("Multiply");
	Multiply1.visibleInInspector = false;
	Multiply1.visibleOnFrame = false;
	Multiply1.target = 4;

	// InputBlock
	var windDirection = new InputBlock("windDirection");
	windDirection.visibleInInspector = false;
	windDirection.visibleOnFrame = false;
	windDirection.target = 1;
	windDirection.value = new Vector3(1, 0, 1);
	windDirection.isConstant = false;

	// MultiplyBlock
	var Multiply2 = new MultiplyBlock("Multiply");
	Multiply2.visibleInInspector = false;
	Multiply2.visibleOnFrame = false;
	Multiply2.target = 4;

	// PowBlock
	var Pow = new PowBlock("Pow");
	Pow.visibleInInspector = false;
	Pow.visibleOnFrame = false;
	Pow.target = 4;

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

	// AddBlock
	var Add1 = new AddBlock("Add");
	Add1.visibleInInspector = false;
	Add1.visibleOnFrame = false;
	Add1.target = 4;

	// InputBlock
	var position2 = new InputBlock("position");
	position2.visibleInInspector = false;
	position2.visibleOnFrame = false;
	position2.target = 1;
	position2.setAsAttribute("position");

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
	var grassColor = new InputBlock("grassColor");
	grassColor.visibleInInspector = false;
	grassColor.visibleOnFrame = false;
	grassColor.target = 1;
	grassColor.value = new Color4(0, 1, 0, 1);
	grassColor.isConstant = false;

	// FragmentOutputBlock
	var FragmentOutput = new FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

	// Connections
	position.output.connectTo(VectorSplitter.xyzIn);
	VectorSplitter.x.connectTo(VectorMerger.x);
	VectorSplitter.z.connectTo(VectorMerger.z);
	VectorMerger.xyz.connectTo(Add.left);
	time.output.connectTo(Multiply.left);
	noiseDisplacement.output.connectTo(Multiply.right);
	Multiply.output.connectTo(Add.right);
	Add.output.connectTo(SimplexPerlinD.seed);
	SimplexPerlinD.output.connectTo(Multiply1.left);
	windDirection.output.connectTo(Multiply1.right);
	Multiply1.output.connectTo(Multiply2.left);
	position1.output.connectTo(VectorSplitter1.xyzIn);
	VectorSplitter1.y.connectTo(Divide.left);
	height.output.connectTo(Divide.right);
	Divide.output.connectTo(Pow.value);
	windYRepartitionPower.output.connectTo(Pow.power);
	Pow.output.connectTo(Multiply2.right);
	Multiply2.output.connectTo(Add1.left);
	position2.output.connectTo(Add1.right);
	Add1.output.connectTo(WorldPos.vector);
	World.output.connectTo(WorldPos.transform);
	WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
	ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
	WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
	grassColor.output.connectTo(FragmentOutput.rgba);

	// Output nodes
	nodeMaterial.addOutputNode(VertexOutput);
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.build();

	nodeMaterial.backFaceCulling = false;
	return [
		nodeMaterial,
		{
			time: time,
			noiseDisplacement: noiseDisplacement,
			windDirection: windDirection,
			height: height,
			windYRepartitionPower: windYRepartitionPower,
			grassColor: grassColor
		}
	];
}
