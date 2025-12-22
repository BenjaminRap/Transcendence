import { MatchMaker } from "../pong/MatchMaker.js";
import { type DefaultEventsMap, Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@shared/MessageType';
import { SocketData } from '../pong/SocketData';



export type DefaultSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;

export class SocketEventController {
	constructor(
		// private socketEventService: SocketEventService,
		private authService: AuthService,
		private matchMaker: MatchMaker,
	) {}

	private static socketInstance: SocketEventController;

	/**
	 * 
	 *  
	 *  
	 * 
	 */

	// ----------------------------------------------------------------------------- //
	async handleEvent(socket: DefaultSocket, eventData: SocketEventData): Promise<{ success: boolean, message?: string }> {
		try {
			// verification pattern
			const zodParsing = CommonSchema.SocketEventData.safeParse(eventData);
			if (!zodParsing.success)
				return { success: false, message: zodParsing.error?.issues?.[0]?.message || 'Error event data format' }
	
			// call service
			return await this.socketEventService.processEvent(socket, zodParsing.data);		
		}
		catch (error) {
			return {
				success: false,
				message: 'Error processing socket event'
			}
		}
	}
	
	// ----------------------------------------------------------------------------- //


}
