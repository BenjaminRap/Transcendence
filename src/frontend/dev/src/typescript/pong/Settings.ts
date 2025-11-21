import { ClientInput } from "./FrontendSceneData";

export class	Settings
{
	public readonly _playerInputs : readonly ClientInput[] = [{
		index: 0,
		upKey: "z",
		downKey:"s"
	},
	{
		index: 1,
		upKey: "ArrowUp",
		downKey: "ArrowDown"
	}];
}
