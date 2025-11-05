import { Vector3 } from "@babylonjs/core";

export type GameInfos = {
	type : "itemsUpdate";
	infos : ItemsUpdate;
} | {
	type : "goal";
	infos : Goal;
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
