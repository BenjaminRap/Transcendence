import type { boolean } from "zod";
import { ExtendedView } from "./extendedView";
import { PongUtils, socketUtils } from './terminal'
import { TerminalUtils } from "./terminalUtils/terminalUtils";
import { RequestBackendModule } from "./terminalUtils/requestBackend";
import { WriteOnTerminal } from "./terminalUtils/writeOnTerminal";
import { ProfileUpdater } from "./profile";
import type { HtmlElementTexture } from "@babylonjs/core";



export { };



interface Match {
	id: number;
	createdAt: Date;
	winnerId: number | null;
	winnerLevel: string | null;
	loserId: number | null;
	loserLevel: string | null;
	scoreWinner: number;
	scoreLoser: number;
	duration: number;
	tournamentId: number | null;
}

export interface GameStats
{
	wins:        number,
	losses:        number,
	total:         number,
	winRate:    number,
}


export interface MatchSummary
{
	isWinner: boolean,
	opponent: { id: string, username: string, avatar: string,} | null,
	match: Match | null,
}

export interface ExtProfile
{
	id:         number,
	avatar:     string,
	username:   string,
	gameStats:  GameStats,
	lastMatchs: MatchSummary[],
}

let profile: ExtProfile;

let profileDiv : HTMLElement | null;



	export function updateProfileCard(profile: ExtProfile) {
	if (!profileDiv)
		return;
	profileDiv.innerHTML = `<img src="${profile.avatar}" alt="Avatar" class="w-[12vh] h-[12vh] border border-green-500 object-cover"></img>
							<h1 class="text-center text-[1.5vh]">${profile.username}</h1>
							<div class="flex gap-[1vw] text-[0.9vh]">
								<p>Win: ${profile.gameStats.wins}</p>
								<p>Loss: ${profile.gameStats.losses}</p>
								<p>W/L: ${(profile.gameStats.wins / (profile.gameStats.losses + profile.gameStats.wins)).toFixed(2)}</p>
							</div>`;
	}



function createProfileCard(profileElement: HTMLElement | null): HTMLElement | void {
	if (!profileElement)
		return;
	const profileCard = document.createElement('div');
	profileCard.className = "flex flex-col px-[2vw] py-[1vh] shadow-lg border border-green-500 items-center h-[19.7%] overflow-hidden";
	profileCard.innerHTML = `<img src="${profile.avatar}" alt="Avatar" class="w-[12vh] h-[12vh] border border-green-500 object-cover"></img>
							<h1 class="text-center text-[1.5vh]">${profile.username}</h1>
							<div class="flex gap-[1vw] text-[0.9vh]">
								<p>Win: ${profile.gameStats.wins}</p>
								<p>Loss: ${profile.gameStats.losses}</p>
								<p>W/L: ${(profile.gameStats.wins / (profile.gameStats.losses + profile.gameStats.wins)).toFixed(2)}</p>
							</div>`;
	profileElement.appendChild(profileCard);
	profileDiv = profileCard;
	return profileCard;
}

function updateMatchDiv()
{
	if (!profileDiv)
		return;
	const newMatchListElement = createMatchElement();
	if (!newMatchListElement)
		return;
	const oldMatchListElement = document.getElementById('match-list');
	if (oldMatchListElement && oldMatchListElement.parentElement) {
		oldMatchListElement.parentElement.replaceChild(newMatchListElement, oldMatchListElement);
	} else if (oldMatchListElement) {
		oldMatchListElement.remove();
		profileDiv.appendChild(newMatchListElement);
	} else {
		profileDiv.appendChild(newMatchListElement);
	}
}

function createMatchElement() : HTMLElement
{
	const matchElement = document.createElement('div');
	matchElement.className = "border py-4 border-green-500 flex flex-col gap-y-4 h-full";
	matchElement.id = "match-list";
	for (let i = 0; i < Math.min(profile.lastMatchs.length, 4); i++) {
		const match = profile.lastMatchs[i];
		const matchDiv = document.createElement('div');
		if (!match || !match.match || !match.opponent) 
			continue;
		let result;
		if (match.isWinner) {
			result = "Win";
		} else {
			result = "Loose";
		}
		let score;
		if (result === "Win") {
			score = `${match.match.scoreWinner} - ${match.match.scoreLoser}`;
		} else {
			score = `${match.match.scoreLoser} - ${match.match.scoreWinner}`;
		}
		matchDiv.className = "flex px-4 shadow-lg place-content-between";
		matchDiv.innerHTML = `
				<div class="flex flex-1 items-center justify-between pr-2 min-w-0">
					<div class="flex flex-col gap-y-0 min-w-0">
						<p class="p-0 m-0 truncate">${result}</p>
						<p class="truncate" style="font-size: 10px;">${match.match.createdAt}</p>
					</div>
					<div class="flex flex-col justify-center items-center shrink-0 px-1">
						<p>${score}</p>
						<p style="font-size: 10px;">vs</p>
					</div>
				</div>
				<div class="flex flex-1 justify-end items-center gap-2 min-w-0 relative">
					<div class="group relative min-w-0 text-right">
						<p class="truncate cursor-pointer">${match.opponent.username}</p>
						<p class="absolute bottom-full right-0 mb-1 hidden group-hover:block border p-1 border-green-500 bg-black whitespace-nowrap">${match.opponent.username}</p>
					</div>
					<img src="${match.opponent.avatar}" alt="Avatar"
						class="w-8 h-8 sm:w-10 sm:h-10 border border-green-500 object-cover shrink-0"></img>
				</div>
			`
		matchElement.appendChild(matchDiv);
	}
	if (profile.lastMatchs.length === 0) {
		const noMatchMessage = document.createElement('div');
		noMatchMessage.className = "text-center text-gray-500";
		noMatchMessage.innerText = "Aucun match trouvé.";
		matchElement.appendChild(noMatchMessage);
	}
	return matchElement;
}

function createMatchHistory(profileElement: HTMLElement | null): HTMLElement | void {
	if (!profileElement)
		return;
	const matchHistory = document.createElement('div');
	matchHistory.className = "flex flex-col h-[31.5%]"; 
	matchHistory.innerHTML = `<div class="flex w-full place-content-between">
								<p class="text-center">Last match</p>
								<button id="moreMatch" class="cursor-pointer hover:underline hover:underline-offset-2">View More</button>
							</div>`
	const moreMatchButton = matchHistory.querySelector('#moreMatch');
	moreMatchButton?.addEventListener('click', () => {
		ExtendedView.makeExtendedView('match', '');
	});
	profileElement.appendChild(matchHistory);
	const matchElement = createMatchElement();
	matchHistory.appendChild(matchElement);
	profileElement.appendChild(matchHistory);
	return matchHistory;
}


function createButtons(profileElement: HTMLElement | null) {
	if (!profileElement)
		return;
	const buttonContainer = document.createElement('div');
	buttonContainer.className = "flex gap-2";
	buttonContainer.innerHTML = `<button id="addFriendButton" class=" w-full p-2 border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Add Friend</button>`
								// <button class="p-2 border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Block User</button>`
								// 	<button class="p-2 border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Change Avatar</button>
								// <button class="p-2 border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Delete Account</button>
	const addFriendButton = buttonContainer.querySelector('#addFriendButton');
	addFriendButton?.addEventListener('click', () => sendFriendRequest(profile.id));
	profileElement.appendChild(buttonContainer);
}


// GET /users/search/username/:username
async function fetchProfileData(user: string) : Promise <string>
{
	const token = TerminalUtils.getCookie('accessToken') || '';
	if (token === '') {
		return `Vous n'êtes pas connecté.`;
	}
	try {
		const response = await fetch(`/api/users/search/username/${user}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
		});
		const data = await response.json();
		if (data.success) {

			let user : ExtProfile = {
				id:         data.user[0].id,
				avatar:     data.user[0].avatar,
				username:   data.user[0].username,
				gameStats:  data.user[0].stats,
				lastMatchs: data.user[0].lastMatchs,
			}
			profile = user;
			return "OK";
		}
		if (data.message === 'Invalid or expired token') {
			const refreshed = await RequestBackendModule.tryRefreshToken();
			if (!refreshed) {
				return `Vous n'êtes pas connecté.`;
			}
			return "OK";
		}
		console.error("Error fetching profile data:", data.message);
		return 'Erreur lors de la récupération des données du profil.';
	} catch (error) {
		console.error("Error:", error);
		return 'Erreur lors de la récupération des données du profil.';
	}
}


export namespace ExtProfileBuilder {
	export async function buildExtProfile(user: string) {
		const result = await fetchProfileData(user);
		if (result !== "OK") {
			console.error("Error fetching profile data:", result);
			return;
		}
		const profileElement = document.createElement('div');
		profileElement.id = "profile";
		profileElement.className = "p-4 m-0 terminal-font bg-black border-2 border-collapse border-green-500 flex flex-col gap-y-4"
		profileElement.style.height = "calc(100vh)";
		profileElement.style.width = "max(25%, 350px)";
		createProfileCard(profileElement);
		createButtons(profileElement);
		createMatchHistory(profileElement);
		
		document.body.appendChild(profileElement);
		history.pushState({}, '', `/profile/${user}`);
		isActive = true;

		if (socketUtils && socketUtils.socket)
		{
			socketUtils.socket.emit("watch-profile", profile.id);

			socketUtils.socket.on("profile-update", (data : {user: { id: string; username: string; avatar: string }}) => {
				console.log("Profile updated:", data.user.id, ' : ', data.user.username, ' : ', data.user.avatar);
				if (parseInt(data.user.id) === profile.id) {
					profile.username = data.user.username;
					profile.avatar = data.user.avatar;
					updateProfileCard(profile);
				}
			});

			socketUtils.socket.on("match-update", (data: MatchSummary) => {
				console.log("Match updated:", data);
				// Update lastMatchs
				profile.lastMatchs.unshift(data);
				if (profile.lastMatchs.length > 4)
					profile.lastMatchs.pop();
				updateMatchDiv();
			});

			socketUtils.socket.on("stat-update", (data: GameStats) => {
				console.log("Stat updated:", data);
				profile.gameStats = data;
				updateProfileCard(profile);
			});

		}
	}
	export function removeExtProfile() {
		const profileElement = document.getElementById('profile');
		if (profileElement) {
			document.body.removeChild(profileElement);
			isActive = false;
			history.pushState({}, '', `/`);
		}
	}
	export let isActive = false;
}

// POST /friend/request/:id
async function sendFriendRequest(id: number) 
{
	const token = TerminalUtils.getCookie('accessToken') || '';
	if (token === '') {
		return `Vous n'êtes pas connecté.`;
	}
	try {
		const response = await fetch(`/api/friend/request/${id}`, {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + token
			},
		});
		const data = await response.json();
		if (data.success) {
			console.log('data :', data);
			WriteOnTerminal.printErrorOnTerminal(`Demande d'ami envoyée à ${profile.username}`);
			return "OK";
		}
		if (data.message === 'Invalid or expired token') {
			const refreshed = await RequestBackendModule.tryRefreshToken();
			if (!refreshed) {
				WriteOnTerminal.printErrorOnTerminal(`Vous n'êtes pas connecté.`);
			}
			return "OK";
		}
		if (data.message === 'Friendship in pending mod')
		{
			WriteOnTerminal.printErrorOnTerminal('Votre demande d\'ami est en attente.');
			return "OK";
		}
		console.error("Error fetching profile data:", data.message);
		WriteOnTerminal.printErrorOnTerminal('Erreur lors de la récupération des données du profil.');
	} catch (error) {
		console.error("Error:", error);
		WriteOnTerminal.printErrorOnTerminal('Erreur lors de la récupération des données du profil.');
	}
}