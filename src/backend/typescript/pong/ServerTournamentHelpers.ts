// import type { DefaultSocket } from "../controllers/SocketEventController";
// import type { TournamentController } from "../controllers/TournamentController";
// import type { SocketData } from "./SocketData";
//
// export function	mapValues<T, K>(map : Map<any, T>, mapper : (input : T) => K)
// {
// 	const	result : K[] = [];
//
// 	map.values().forEach((value) => result.push(mapper(value)));
//
// 	return result;
// }
//
// export	async function	createTournament(name :string, creator : SocketData, players: Map<string, DefaultSocket>, tournamentController : TournamentController)
// {
// 	const	tournamentParticipants = mapValues(players, (player) => ({
// 		userId: player.data.getUserId(),
// 		guestName: player.data.getGuestName(),
// 		alias: player.data.getProfile().shownName
// 	}))
//
// 	const result = await tournamentController.createTournament({
// 		title: name,
// 		creatorId: creator.getUserId(),
// 		creatorGuestName: creator.getGuestName(),
// 		participants: tournamentParticipants
// 	});
//
// 	return result;
// }
//
// export function	banParticipant(name :string, creator : SocketData, players: Map<string, DefaultSocket>)
// {
// 	if (this._state !== "creation")
// 		return ;
// 	const	socket = this._players.get(name);
//
// 	if (!socket || socket === this._creator)
// 		return ;
// 	const	userId = socket.data.getUserId();
//
// 	if (userId !== undefined)
// 		this._bannedPlayers.add(userId);
// 	else
// 		this._bannedPlayers.add(name);
// 	socket.emit("tournament-event", {type: "banned"});
// 	this.removePlayerFromTournament(socket);
// 	console.log(`${name} has been banned from the ${this._settings.name} tournament !`);
// }
//
// export function	kickParticipant(name : string)
// {
// 	if (this._state !== "creation")
// 		return ;
// 	const	socket = this._players.get(name);
// 	if (!socket || socket === this._creator)
// 		return ;
// 	socket.emit("tournament-event", {type: "kicked"});
// 	this.removePlayerFromTournament(socket);
// 	console.log(`${name} has been kicked from the ${this._settings.name} tournament !`);
// }
//
// private	removeCreatorEvents()
// {
// 	this._creator.removeAllListeners("start-tournament");
// 	this._creator.removeAllListeners("cancel-tournament");
// 	this._creator.removeAllListeners("ban-participant");
// 	this._creator.removeAllListeners("kick-participant");
// }
//
