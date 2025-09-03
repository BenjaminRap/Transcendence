import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { IUnityVector3, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsShape, PhysicsShapeContainer } from "@babylonjs/core/Physics/v2/physicsShape";
import { PhysicsMotionType, Quaternion, Vector3 } from "@babylonjs/core";

interface SerializableShape
{
    type : number;
    center : IUnityVector3;

    extents : IUnityVector3 | undefined;
    radius : number | undefined;
}

export class ColliderGenerator extends ScriptComponent {
	public	shapeProperties : SerializableShape[] = [];
	public	physicsMotionType : PhysicsMotionType = PhysicsMotionType.STATIC;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ColliderGenerator") {
        super(transform, scene, properties, alias);
    }

    protected awake(): void {
		if (this.shapeProperties.length == 0)
			return ;
		let	shape = this.getPhysicsShape();
		let	body = new PhysicsBody(this.transform, this.physicsMotionType, false, this.scene);

		body.shape = shape;
    }

	private getPhysicsShape() : PhysicsShape
	{
		if (this.shapeProperties.length == 0)
			throw new Error("GetPhysicsShape called with an empty shapeProperties list !");
		if (this.shapeProperties.length == 1)
			return (this.getShapeFromSerializable(this.shapeProperties[0]));
		let	parentShape = new PhysicsShapeContainer(this.scene);
		
		this.shapeProperties.forEach((properties : SerializableShape) => {
			const	shape = this.getShapeFromSerializable(properties);

			parentShape.addChild(shape);
		})
		return (parentShape);
	}

	private getShapeFromSerializable(properties : SerializableShape)
	{
		return new PhysicsShape({
			type: properties.type,
			parameters: {
				center: this.getVector3FromIUnityVector3(properties.center),
				rotation: Quaternion.Identity(),
				extents: this.getVector3FromIUnityVector3(properties.extents)
			}
		}, this.scene);
	}

	private getVector3FromIUnityVector3(vector3 : IUnityVector3 | undefined) : Vector3 | undefined
	{
		if (vector3 === undefined)
			return (undefined);
		return new Vector3(vector3.x, vector3.y, vector3.z);
	}
}

SceneManager.RegisterClass("ColliderGenerator", ColliderGenerator);
