import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { type IUnityVector3, SceneManager } from "@babylonjs-toolkit/next";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsShape, PhysicsShapeContainer } from "@babylonjs/core/Physics/v2/physicsShape";
import { PhysicsMotionType, Quaternion, Vector3 } from "@babylonjs/core";
import zod from "zod";
import { Imported } from "@shared/ImportedDecorator";
import { zodVector3 } from "@shared/ServerMessage";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { PongError } from "@shared/pongError/PongError";

const	zodSerializedShape = zod.object({
	type: zod.int(),
	center: zodVector3,
	isTrigger: zod.boolean(),
	extents: zodVector3.nullable(),
	radius: zod.number().nullable()
});
type SerializableShape = zod.infer<typeof zodSerializedShape>;

const	zodPhysicsMotionType = zod.literal([0, 1, 2]);

export class ColliderGenerator extends CustomScriptComponent {
	@Imported(zodSerializedShape, true) private	_shapeProperties : SerializableShape[] = [];
	@Imported(zodPhysicsMotionType) private	_physicsMotionType! : PhysicsMotionType;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ColliderGenerator") {
        super(transform, scene, properties, alias);
    }

    protected awake(): void {
		if (this._shapeProperties.length == 0)
			return ;
		let	shape = this.getPhysicsShape();
		let	body = new PhysicsBody(this.transform, this._physicsMotionType, false, this.scene);

		body.shape = shape;
    }

	private getPhysicsShape() : PhysicsShape
	{
		if (this._shapeProperties.length == 0)
			throw new PongError("GetPhysicsShape called with an empty shapeProperties list !", "quitScene");
		if (this._shapeProperties.length == 1)
			return (this.getShapeFromSerializable(this._shapeProperties[0]));
		let	parentShape = new PhysicsShapeContainer(this.scene);
		
		this._shapeProperties.forEach((properties : SerializableShape) => {
			const	shape = this.getShapeFromSerializable(properties);

			parentShape.addChild(shape);
		})
		return (parentShape);
	}

	private getShapeFromSerializable(properties : SerializableShape)
	{
		let	shape =  new PhysicsShape({
			type: properties.type,
			parameters: {
				center: this.getVector3FromIUnityVector3(properties.center),
				rotation: Quaternion.Identity(),
				extents: properties.extents ? this.getVector3FromIUnityVector3(properties.extents) : undefined
			}
		}, this.scene);

		shape.isTrigger = properties.isTrigger;
		return shape;
	}

	private getVector3FromIUnityVector3(vector3 : IUnityVector3) : Vector3 | undefined
	{
		if (vector3 === undefined)
			return (undefined);
		return new Vector3(vector3.x, vector3.y, vector3.z);
	}
}

SceneManager.RegisterClass("ColliderGenerator", ColliderGenerator);
