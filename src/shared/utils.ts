import { Vector3 } from "@babylonjs/core";
import type { EndData } from "./attachedScripts/GameManager";

export function isPowerOfTwo (value : number) {
	return value !== 0 && (value & (value - 1)) === 0;
};

export function shuffle<T>(array: T[]) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
  
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
};

export type Result<ValueType, ErrorType = string> = {
	success: true,
	value: ValueType
} | {
	success: false,
	error: ErrorType
}

export function success<ValueType, ErrorType = string>(value: ValueType): Result<ValueType, ErrorType> {
    return { success: true, value };
}

export function error<ValueType, ErrorType = string>(error: ErrorType): Result<ValueType, ErrorType> {
    return { success: false, error };
}

export function	toVec3(xyz : {x : number, y : number, z : number})
{
	return new Vector3(xyz.x, xyz.y, xyz.z);
}

export function	toXYZ(v : Vector3)
{
	return { x: v.x, y: v.y, z: v.z };
}

export function	getEndDataOnInvalidMatch(isLeftValid : boolean, isRightValid: boolean) : EndData
{
	const	winner =
		(isLeftValid && !isRightValid) ? "left" :
		(!isLeftValid && isRightValid) ? "right" :
		"draw";
	const	endData : EndData = {
		winner: winner,
		endCause: "forfeit",
		scoreLeft: 0,
		scoreRight: 0,
		duration: 0
	};
	
	return endData;
}
