import type { boolean } from "zod";
import { ExtendedView } from "./extendedView";
import { PongUtils, socketUtils } from './terminal'
import { TerminalUtils } from "./terminalUtils/terminalUtils";
import { RequestBackendModule } from "./terminalUtils/requestBackend";
import { WriteOnTerminal } from "./terminalUtils/writeOnTerminal";
import { ProfileUpdater } from "./profile";
import type { HtmlElementTexture } from "@babylonjs/core";


export { };


/*
	Attente des donnes backend. Penser a sanitize les donnes avant de les afficher https://github.com/cure53/DOMPurify
*/

interface Match {
	state: string;
	opponent: string;
	result: string;
	date: string;
	profilelinkopponent: string;
	score: string;
}

interface Friend {
	username: string;
	linkofavatar: string;
	status: string;
}

let friends: Friend[] = [
	{
		username: "Friend1",
		linkofavatar: "https://i.pravatar.cc/150?img=5",
		status: "Online"
	},
	{
		username: "Friend2",
		linkofavatar: "https://i.pravatar.cc/150?img=6",
		status: "Last seen : 2h ago"
	},
	{
		username: "Friend3",
		linkofavatar: "https://i.pravatar.cc/150?img=7",
		status: "In Game"
	},
	{
		username: "Friend4",
		linkofavatar: "https://i.pravatar.cc/150?img=8",
		status: "Online"
	},
	{
		username: "Friend5",
		linkofavatar: "https://i.pravatar.cc/150?img=9",
		status: ""
	},
];


let matches: Match[] = [
	{
		state: "Finished",
		opponent: "Opponent1",
		result: "Win",
		date: "2023-10-01",
		profilelinkopponent: "https://i.pravatar.cc/150?img=1",
		score: "1-0"
	},
	{
		state: "Finished",
		opponent: "Opponent2",
		result: "Loss",
		date: "2023-10-02",
		profilelinkopponent: "https://i.pravatar.cc/150?img=2",
		score: "0-1"
	},
	{
		state: "Finished",
		opponent: "Opponent3",
		result: "Win",
		date: "2023-10-03",
		profilelinkopponent: "https://i.pravatar.cc/150?img=3",
		score: "1-0"
	},
	{
		state: "Finished",
		opponent: "Opponent4",
		result: "Loss",
		date: "2023-10-04",
		profilelinkopponent: "https://i.pravatar.cc/150?img=4",
		score: "0-1"
	},
	{
		state: "Finished",
		opponent: "Opponent4",
		result: "Loss",
		date: "2023-10-04",
		profilelinkopponent: "https://i.pravatar.cc/150?img=4",
		score: "0-1"
	},
	{
		state: "Finished",
		opponent: "Opponent4",
		result: "Loss",
		date: "2023-10-04",
		profilelinkopponent: "https://i.pravatar.cc/150?img=4",
		score: "0-1"
	},
	{
		state: "Finished",
		opponent: "Opponent4",
		result: "Loss",
		date: "2023-10-04",
		profilelinkopponent: "https://i.pravatar.cc/150?img=4",
		score: "0-1"
	},
	{
		state: "Finished",
		opponent: "Opponent4",
		result: "Loss",
		date: "2023-10-04",
		profilelinkopponent: "https://i.pravatar.cc/150?img=4",
		score: "0-1"
	}
];

let profile = {
	id: 1,
	username: "User",
	linkofavatar: "https://i.pravatar.cc/150?img=12",
	mmr: 500,
	win: 5,
	loss: 10,
}

let profileDiv : HTMLElement | null;



function updateProfileCard() {
	if (!profileDiv)
		return;
	profileDiv.innerHTML = `<img src="${profile.linkofavatar}" alt="Avatar" class="w-[12vh] h-[12vh] border border-green-500 object-cover"></img>
							<h1 class="text-center text-[1.5vh]">${profile.username}</h1>
							<div class="flex gap-[1vw] text-[0.9vh]">
								<p>Win: ${profile.win}</p>
								<p>Loss: ${profile.loss}</p>
								<p>W/L: ${(profile.win / (profile.loss + profile.win)).toFixed(2)}</p>
							</div>`;
	history.pushState({}, '', `/profile/${profile.username}`);

}

function createProfileCard(profileElement: HTMLElement | null): HTMLElement | void {
	if (!profileElement)
		return;
	const profileCard = document.createElement('div');
	profileCard.className = "flex flex-col px-[2vw] py-[1vh] shadow-lg border border-green-500 items-center h-[19.7%] overflow-hidden";
	profileCard.innerHTML = `<img src="${profile.linkofavatar}" alt="Avatar" class="w-[12vh] h-[12vh] border border-green-500 object-cover"></img>
							<h1 class="text-center text-[1.5vh]">${profile.username}</h1>
							<div class="flex gap-[1vw] text-[0.9vh]">
								<p>Win: ${profile.win}</p>
								<p>Loss: ${profile.loss}</p>
								<p>W/L: ${(profile.win / (profile.loss + profile.win)).toFixed(2)}</p>
							</div>`;
	profileElement.appendChild(profileCard);
	profileDiv = profileCard;
	return profileCard;
}


// function createProfileCard(profileElement: HTMLElement | null) {
// 	if (!profileElement)
// 		return;
// 	const profileCard = document.createElement('div');
// 	profileCard.className = "flex flex-col p-4 shadow-lg border border-green-500 align-center justify-center items-center";
// 	profileCard.innerHTML = `<img src="${profile.linkofavatar}" alt="Avatar" class="w-24 h-24 border border-green-500 object-cover"></img>
// 							<h1 class="text-center">${profile.username}</h1>
// 							<div class="flex gap-4 text-xs">
// 								<p>MMR: ${profile.mmr}</p>
// 								<p>Win: ${profile.win}</p>
// 								<p>Loss: ${profile.loss}</p>
// 								<p>W/L: ${(profile.win / (profile.loss + profile.win)).toFixed(2)}</p>
// 							</div>`;
// 	profileElement.appendChild(profileCard);
// }


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

function createMatchHistory(profileElement: HTMLElement | null) {
	if (!profileElement)
		return;
	const matchHistory = document.createElement('div');
	matchHistory.className = "flex flex-col min-h-[25vh]"; 
	matchHistory.innerHTML = `<div class="flex w-full place-content-between">
								<p class="text-center">Last match</p>
								<button id="moreMatch" class="cursor-pointer hover:underline hover:underline-offset-2">View More</button>
							</div>`
	const moreMatchButton = matchHistory.querySelector('#moreMatch');
	moreMatchButton?.addEventListener('click', () => {
		ExtendedView.makeExtendedView('match', '');
	});
	const matchElement = document.createElement('div');
	matchElement.className = "border py-4 border-green-500 flex flex-col gap-y-4 h-full";		
	for (let i = 0; i < Math.min(matches.length, 4); i++) {
		const match = matches[i];
		const matchDiv = document.createElement('div');
		matchDiv.className = "flex px-4 shadow-lg place-content-between";
		matchDiv.innerHTML = `
				<div class="flex w-1/2 place-content-between pr-4">
					<div class="flex flex-col gap-y-0">
						<p class="p-0 m-0">Win</p>
						<p class="" style="font-size: 10px;">${match.date}</p>
					</div>
					<div class="flex flex-col justify-center items-center">
						<p>${match.score}</p>
						<p>vs</p>
					</div>
				</div>
				<div class="card flex justify-center items-center gap-2 max-w-1/2 relative ">
					<div class="group w-full max-w-[80%]">
						<p class="truncate cursor-pointer">${match.opponent}</p>
						<p class="absolute -top-6 right-0 hidden group-hover:block border p-1 border-green-500 bg-black">${match.opponent}</p>
					</div>
					<img src="${match.profilelinkopponent}" alt="Avatar"
						class="w-10 h-10 border border-green-500 object-cover"></img>
				</div>
			`
		matchElement.appendChild(matchDiv);
	}
	matchHistory.appendChild(matchElement);
	profileElement.appendChild(matchHistory);
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
			console.log('data :', data.user);
			profile.username = data.user[0].username;
			profile.linkofavatar = data.user[0].avatar;
			profile.id = data.user[0].id;
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
			socketUtils.socket.on("profile-update", (data : {user: { id: string; username: string; avatar: string }}) => {
				console.log("Profile updated:", data.user.id, ' : ', data.user.username, ' : ', data.user.avatar);
				if (parseInt(data.user.id) === profile.id) {
					profile.username = data.user.username;
					profile.linkofavatar = data.user.avatar;
					updateProfileCard();
				}
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