import { Vector3 } from "@babylonjs/core";

export type KeysUpdate = {
	up? : {
		event: "keyDown" | "keyUp"
	},
	down? : {
		event: "keyDown" | "keyUp"
	}
}

export type GameInit = {
	playerIndex : number
}

export type GameInfos = {
	type : "itemsUpdate";
	infos : ItemsUpdate;
} | {
	type : "goal";
	infos : Goal;
} | {
	type: "input";
	infos: KeysUpdate;
}

interface	Goal {
	side : "Right" | "Left";
}

interface	ItemsUpdate {
	paddleRightPos : Vector3;
	paddleLeftPos : Vector3;
	ball: {
		pos : Vector3;
		linearVelocity: Vector3;
	}
}
