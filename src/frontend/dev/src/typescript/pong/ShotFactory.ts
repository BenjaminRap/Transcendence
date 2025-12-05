import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Ball } from "@shared/attachedScripts/Ball";
import type { Paddle } from "@shared/attachedScripts/Paddle";
import type { Platform } from "@shared/attachedScripts/Platform";
import { Shot } from "./Shot";

export class	ShotFactory
{
	private _topCollisionY : number;
	private _bottomCollisionY : number;
	private _paddleRightVector : Vector3;
	private _endPosX : number;
	private _startPosX : number;

	constructor(top : Platform, bottom : Platform, goalLeft : TransformNode, paddleRight : Paddle, ball : Ball)
	{
		this._topCollisionY = top.transform.absolutePosition.y - top.transform.absoluteScaling.x / 2;
		this._bottomCollisionY = bottom.transform.absolutePosition.y + bottom.transform.absoluteScaling.x / 2;
		this._paddleRightVector = paddleRight.transform.right;
		this._endPosX = goalLeft.absolutePosition.x + goalLeft.absoluteScaling.x / 2 + ball.transform.absoluteScaling.x / 2;
		this._startPosX = paddleRight.transform.absolutePosition.x - paddleRight.transform.absoluteScaling.x / 2 - ball.transform.absoluteScaling.x / 2;
	}

	public	getShotsAtHeight(height : number, paddleMiddle : number, maxRebounds : number)
	{
		const	terrainWidth = this._startPosX - this._endPosX;
		const	angles = [ this.getShotAtHeight(height, paddleMiddle, terrainWidth) ];

		for (let index = 1; index <= maxRebounds; index++) {
			const	angleWithTopRebound = this.getShotAtHeightWithRebound(index, "top", height, paddleMiddle, terrainWidth);
			const	angleWithBottomRebound = this.getShotAtHeightWithRebound(index, "bottom", height, paddleMiddle, terrainWidth);

			angles.push(angleWithTopRebound);
			angles.push(angleWithBottomRebound);
		}
		return angles;
	}

	private	getShotAtHeight(height : number, paddleMiddle : number, terrainWidth : number)
	{
		const	direction = new Vector3(-terrainWidth, height - paddleMiddle);

		return new Shot(direction, this._paddleRightVector);
	}

	private	getShotAtHeightWithRebound(reboundCount : number, firstRebound : "top" | "bottom", height : number, paddleMiddle : number, terrainWidth : number)
	{
		if (reboundCount < 1)
			throw new Error("reboundCount should be greater to 1 in getAngleShootAtHeightWithRebound");
		const	colliderY = (firstRebound === "top") ? this._topCollisionY : this._bottomCollisionY;
		const	distEndToCollider = Math.abs(height - colliderY);
		const	distStartToCollider = Math.abs(paddleMiddle - colliderY);
		const	distTopToBottom = this._topCollisionY - this._bottomCollisionY;
		const	totalY = distEndToCollider + distStartToCollider + distTopToBottom * (reboundCount - 1);
		const	sign = "top" ? 1 : -1;
		const	direction = new Vector3(-terrainWidth, sign * totalY, 0);

		return new Shot(direction, this._paddleRightVector);
	}
}

