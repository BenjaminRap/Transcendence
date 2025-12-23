import type { Profile } from "./Profile";

export class	Match
{
	constructor(
		private _right : Match | Profile,
		private _left : Match | Profile) {
	}
}

