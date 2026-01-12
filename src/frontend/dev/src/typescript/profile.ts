export { };

import { Modal } from './modal'
import { ExtendedView } from './extendedView'
import { TerminalUtils } from './terminalUtils/terminalUtils';
import { RequestBackendModule } from './terminalUtils/requestBackend';
import { PongUtils, TerminalFileSystem, TerminalUserManagement } from './terminal'
import { WriteOnTerminal } from './terminalUtils/writeOnTerminal';

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

const friends: Friend[] = [
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


const matches: Match[] = [
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

const profile = {
	username: "User",
	linkofavatar: "https://i.pravatar.cc/150?img=12",
	mmr: 500,
	win: 5,
	loss: 10,
}


function createProfileCard(profileElement: HTMLElement | null) {
	if (!profileElement)
		return;
	const profileCard = document.createElement('div');
	profileCard.className = "flex flex-col px-[2vw] py-[1vh] shadow-lg border border-green-500 items-center h-[19.7%] overflow-hidden";
	profileCard.innerHTML = `<img src="${profile.linkofavatar}" alt="Avatar" class="w-[12vh] h-[12vh] border border-green-500 object-cover"></img>
							<h1 class="text-center text-[1.5vh]">${profile.username}</h1>
							<div class="flex gap-[1vw] text-[0.9vh]">
								<p>MMR: ${profile.mmr}</p>
								<p>Win: ${profile.win}</p>
								<p>Loss: ${profile.loss}</p>
								<p>W/L: ${(profile.win / (profile.loss + profile.win)).toFixed(2)}</p>
							</div>`;
	profileElement.appendChild(profileCard);
}


function createButtons(profileElement: HTMLElement | null) {
	if (!profileElement)
		return;
	const buttonContainer = document.createElement('div');
	buttonContainer.className = "grid grid-cols-2 place-content-stretch gap-[0.5vw] h-[12.5%] text-[1.5vh]";
	buttonContainer.innerHTML = `<button id="changeNameButton" class="border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Change Name</button>
								<button id="changePasswordButton" class="border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Change Password</button>
								<button id="changeAvatarButton" class="border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Change Avatar</button>
								<button id="deleteAccountButton" class="border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Delete Account</button>`
	const changeNameButton = buttonContainer.querySelector('#changeNameButton');
	changeNameButton?.addEventListener('click', ChangeName);
	const changePasswordButton = buttonContainer.querySelector('#changePasswordButton');
	changePasswordButton?.addEventListener('click', ChangePassword);
	const changeAvatarButton = buttonContainer.querySelector('#changeAvatarButton');
	changeAvatarButton?.addEventListener('click', ChangeAvatar);
	const deleteAccountButton = buttonContainer.querySelector('#deleteAccountButton');
	deleteAccountButton?.addEventListener('click', DeleteAccount);
	profileElement.appendChild(buttonContainer);
}

function createMatchHistory(profileElement: HTMLElement | null) {
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
	const matchElement = document.createElement('div');
	matchElement.className = "border py-4 border-green-500 flex flex-col gap-y-4 h-full";

	profileElement.appendChild(matchHistory);

	for (let i = 0; i < Math.min(matches.length, 4); i++) {
		const match = matches[i];
		const matchDiv = document.createElement('div');
		matchDiv.className = "flex px-4 shadow-lg place-content-between";
		matchDiv.innerHTML = `
				<div class="flex flex-1 items-center justify-between pr-2 min-w-0">
					<div class="flex flex-col gap-y-0 min-w-0">
						<p class="p-0 m-0 truncate">${match.result}</p>
						<p class="truncate" style="font-size: 10px;">${match.date}</p>
					</div>
					<div class="flex flex-col justify-center items-center shrink-0 px-1">
						<p>${match.score}</p>
						<p style="font-size: 10px;">vs</p>
					</div>
				</div>
				<div class="flex flex-1 justify-end items-center gap-2 min-w-0 relative">
					<div class="group relative min-w-0 text-right">
						<p class="truncate cursor-pointer">${match.opponent}</p>
						<p class="absolute bottom-full right-0 mb-1 hidden group-hover:block border p-1 border-green-500 bg-black whitespace-nowrap">${match.opponent}</p>
					</div>
					<img src="${match.profilelinkopponent}" alt="Avatar"
						class="w-8 h-8 sm:w-10 sm:h-10 border border-green-500 object-cover shrink-0"></img>
				</div>
			`
		matchElement.appendChild(matchDiv);
	}
	matchHistory.appendChild(matchElement);
	profileElement.appendChild(matchHistory);
}

function createFriendList(profileElement: HTMLElement | null) {
	if (!profileElement)
		return;
	const friendList = document.createElement('div');
	friendList.className = "flex flex-col h-[28.6%]";
	friendList.innerHTML = `
		<div class="flex w-full place-content-between">
			<p class="text-center">Friends</p>
			<button id="moreFriends" class="cursor-pointer hover:underline hover:underline-offset-2">View More</button>
		</div>
	`
	const moreFriendsButton = friendList.querySelector('#moreFriends');
	moreFriendsButton?.addEventListener('click', () => {
		ExtendedView.makeExtendedView('friend', '');
	});
	const friendElement = document.createElement('div');
	friendElement.className = "border border-green-500 py-4 flex flex-col gap-y-4 h-full";
	for (let i = 0; i < Math.min(friends.length, 4); i++) {
		const friend = friends[i];
		const friendDiv = document.createElement('div');
		friendDiv.className = "flex items-center px-4 gap-x-4 min-w-0";
		friendDiv.innerHTML = `
		<img src="${friend.linkofavatar}" alt="Avatar"
					class="w-8 h-8 sm:w-10 sm:h-10 border border-green-500 object-cover shrink-0"></img>
				<div class="flex flex-col gap-y-0 min-w-0 flex-1">
					<p class="truncate">${friend.username}</p>
					<p class="truncate" style="font-size: 10px;">${friend.status}</p>
				</div>
		`
		friendElement.appendChild(friendDiv);
	}

	friendList.appendChild(friendElement);
	profileElement.appendChild(friendList);
}

async function fetchProfileData(user: string): Promise<string> {
	const token = TerminalUtils.getCookie('accessToken') || '';
	if (token === '') {
		return `Vous n'êtes pas connecté.`;
	}
	try {
		const response = await fetch('/api/suscriber/profile', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
		});
		const data = await response.json();
		if (data.success) {
			profile.username = data.user.username;
			profile.linkofavatar = data.user.avatar;
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

export namespace ProfileBuilder {
	export async function buildProfile(user: string): Promise<string> {
		const result = await fetchProfileData(user);
		if (!result || result !== "OK")
			return result;
		const profileElement = document.createElement('div');
		profileElement.id = "profile";
		profileElement.className = "p-4 m-0 terminal-font bg-black border-2 border-collapse border-green-500 flex flex-col gap-y-[4vh]"
		profileElement.style.height = "calc(100vh)";
		profileElement.style.width = "max(25%, 350px)";
		createProfileCard(profileElement);
		createButtons(profileElement);
		createMatchHistory(profileElement);
		createFriendList(profileElement);
		
		document.body.appendChild(profileElement);
		history.pushState({}, '', `/profile/${user}`);
		isActive = true;
		return 'Profil ouvert. Tapez "kill profile" pour le fermer.';
	}
	export function removeProfile() {
		const profileElement = document.getElementById('profile');
		if (profileElement) {
			document.body.removeChild(profileElement);
			isActive = false;
			history.pushState({}, '', `/`);
		}
	}
	export let isActive = false;
}


async function ChangeName() {
	if (Modal.isModalActive || PongUtils.isPongLaunched )
		return;
	Modal.makeModal("Change Name", 'text', 'Shadow 0-1', async (text: string) => {
		Modal.closeModal();
		console.log("New name:", text);
		await requetChangeName(text);
		// Send Backend
		// Update 2/3 variable
		// let args: string[] = ["System Notification (Wall) - Change Name", "You've try to change your name, attempt succesfull, your new name is " + text];
		// TerminalUtils.notification(args);
	});
}



async function requetChangeName(newName: string): Promise<boolean> {
	const token = TerminalUtils.getCookie('accessToken') || '';

	try {
		const response = await fetch('/api/suscriber/updateprofile', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + TerminalUtils.getCookie('accessToken') || '',
			},
			body: JSON.stringify({
				username: newName
			},)
		});
		const data = await response.json();
		if (data.success) {
			console.log("Name changed successfully");
			TerminalUserManagement.username = newName;
			TerminalUtils.updatePromptText( TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ " );
			WriteOnTerminal.printErrorOnTerminal("Nom d'utilisateur changé avec succès en " + newName);
			return true ;
		}
		if (data.message === 'Invalid or expired token') {
			const refreshed = await RequestBackendModule.tryRefreshToken();
			if (!refreshed) {
				WriteOnTerminal.printErrorOnTerminal("Veuillez vous connecter.");
				return false;
			}
			return await requetChangeName(newName);
		}
		return false;
	} catch (error) {
		console.error("Error:", error);
		return false;
	}

}

function ChangePassword() {
	if (Modal.isModalActive || PongUtils.isPongLaunched)
		return;

	Modal.makeModal("Actual Password", 'password', '', (text: string) => {
		Modal.closeModal();
		console.log("Password:", text);
		// Send Backend
		// Si pas bon return
		// Update 2/3 variable
		Modal.makeModal("New Password", 'password', '', (newPass: string) => {
			Modal.closeModal();
			console.log("New Password:", newPass);
			// Send Backend
			// Update 2/3 variable
		});
	});
}

function ChangeAvatar() {
	if (Modal.isModalActive || PongUtils.isPongLaunched )
		return;

	Modal.makeModal("Change Avatar", 'file', '', (text: string) => {
		Modal.closeModal();
		console.log("New avatar:", text);
	});
}

function DeleteAccount() {
	if (Modal.isModalActive || PongUtils.isPongLaunched )
		return;
	Modal.makeModal("Are you sure you want to delete your account? Type 'DELETE' to confirm.", 'text', 'DELETE', (text: string) => {
		Modal.closeModal();
		if (text === "DELETE") {
			console.log("Account deleted");
		}
		else
			console.log("Account deletion cancelled");
	});
}
