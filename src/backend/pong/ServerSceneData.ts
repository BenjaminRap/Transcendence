import { DefaultSocket } from ".";

export class	ServerSceneData
{
	constructor(
		public readonly firstSocket : DefaultSocket,
		public readonly secondSocket : DefaultSocket
	) {

	}
}
