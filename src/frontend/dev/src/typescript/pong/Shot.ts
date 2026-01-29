import { Clamp } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Paddle } from "@shared/attachedScripts/Paddle";

export class	Shot
{
	public static readonly scoreGainPerAngle = 1;
	public static readonly scoreLossPerClampedAngle = 1;

	public readonly angle;
	public readonly score;

	constructor(direction : Vector3, paddleRight : Vector3)
	{
		const	angle = Vector3.GetAngleBetweenVectors(paddleRight, direction, Vector3.Forward());
		const	clampedAngle = Clamp(angle, -Paddle.maxAngle, Paddle.maxAngle);

		this.angle = clampedAngle;

		const	angleRemoved = Math.abs(angle - clampedAngle);
		this.score = Math.abs(this.angle) * Shot.scoreGainPerAngle - angleRemoved * Shot.scoreLossPerClampedAngle;
	}
}
