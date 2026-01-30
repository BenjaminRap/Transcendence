export { };

import { Modal } from './modal'
import { ExtendedView } from './extendedView'
import { TerminalUtils } from './terminalUtils/terminalUtils';
import { RequestBackendModule } from './terminalUtils/requestBackend';
import { PongUtils, TerminalFileSystem, TerminalUserManagement, socketUtils } from './terminal'
import { WriteOnTerminal } from './terminalUtils/writeOnTerminal';
import type { FriendStatusUpdate, GameStats, MatchSummary, UserStatusChange } from '@shared/ZodMessageType';

export interface Friend
{
	avatar:         string,
	username:       string,
	id:             number,
	status:         string,
	isOnline:       boolean,
	requesterId:    number,
}

export function numberOrNan(value : any)
{
	return parseInt(value);
}

interface ExtendedFriend
{
	status: string,
	updatedAt: Date,
	user: {
		id: number,
		username: string,
		avatar: string,
		isOnline: boolean,
		requesterId: number,
	}
}

export interface SuscriberProfile
{
	id:         number,
	avatar:     string,
	username:   string,
	gameStats:  GameStats,
	lastMatchs: MatchSummary[],
	friends:    Friend[],
}

let profile: SuscriberProfile;

let profileDiv: HTMLDivElement | null = null;

let watchMatchIds: number[];

function sortFriendList()
{
	let pendingFriends = [];
	let onlineFriends = [];
	let offlineFriends = [];

	for (const friend of profile.friends) {
		if (friend.isOnline) {
			onlineFriends.push(friend);
		} else if (friend.status === "PENDING") {
			pendingFriends.push(friend);
		} else {
			offlineFriends.push(friend);
		}
	}
	profile.friends = [...onlineFriends, ...pendingFriends, ...offlineFriends];
}


export namespace ProfileUpdater {
	export function updateProfile(username: string, linkofavatar: string) {
		console.log("Updating profile:", username, linkofavatar);
		profile.username = username;
		profile.avatar = linkofavatar;
		ProfileUpdater.updateProfileCard(profile);
	}

	export function updateProfileCard(profile: SuscriberProfile) {
	if (!profileDiv)
		return;
	let ratio = (profile.gameStats.wins / (profile.gameStats.losses + profile.gameStats.wins)).toFixed(2);
	if (ratio === 'NaN')
		ratio = '0.00';
	profileDiv.innerHTML = `<img src="${profile.avatar}" alt="Avatar" class="w-[12vh] h-[12vh] border border-green-500 object-cover"></img>
							<h1 class="text-center text-[1.5vh]">${profile.username}</h1>
							<div class="flex gap-[1vw] text-[0.9vh]">
								<p>Win: ${profile.gameStats.wins}</p>
								<p>Loss: ${profile.gameStats.losses}</p>
								<p>W/L: ${ratio}</p>
							</div>`;
	}

	export function updateFriendList(id: number, status: string) {
		const friend = profile.friends.find(friend => friend.id === id);
		let online;
		if (status === "online") {
			online = true;
		} else {
			online = false;
		}
		if (friend) {
			friend.isOnline = online;
		}
		sortFriendList();
		updateFriendDiv();
	}

	export function updateFriendProfile(userID: number, username: string, avatar: string)
	{
		if (userID === profile.id)
			ProfileUpdater.updateProfile(username, avatar);
		else
		{
			console.log("Salut " + userID)
			const index = profile.friends.findIndex(friend => friend.id === userID);
			if (index !== -1) {
				profile.friends[index].username = username;
				profile.friends[index].avatar = avatar;
			}
			if (index < 4)
			{
				sortFriendList();
				updateFriendDiv();
			}
		}
	}

	export function removeFriend(id: number) {
		profile.friends = profile.friends.filter(friend => friend.id !== id);
		sortFriendList();
		updateFriendDiv();
	}
}

function FriendToExtendedFriend(friend: Friend): ExtendedFriend {
	return {
		status: friend.status,
		updatedAt: new Date(),
		user: {
			id: friend.id,
			username: friend.username,
			avatar: friend.avatar,
			isOnline: friend.isOnline,
			requesterId: friend.requesterId,
		}
	};
}

function updateFriendDiv()
{
	if (!profileDiv)
		return;
	const newFriendListElement = createFriendElement();
	if (!newFriendListElement)
		return;
	const oldFriendListElement = document.getElementById('friend-list');
	if (oldFriendListElement && oldFriendListElement.parentElement) {
		oldFriendListElement.parentElement.replaceChild(newFriendListElement, oldFriendListElement);
	} else if (oldFriendListElement) {
		oldFriendListElement.remove();
		profileDiv.appendChild(newFriendListElement);
	} else {
		profileDiv.appendChild(newFriendListElement);
	}
}

function updateMatchDiv(flagAdd: boolean)
{
	if (!profileDiv)
		return;
	const newMatchListElement = createMatchElement();
	if (!newMatchListElement)
		return;
	if (watchMatchIds.length > 3 && flagAdd)
	{
		socketUtils.socket?.emit("unwatch-profile", [watchMatchIds[3]] );
		watchMatchIds.pop();

		watchMatchIds.unshift(numberOrNan(profile.lastMatchs[0].opponent!.id));
		socketUtils.socket?.emit("watch-profile", [watchMatchIds[0]] );
	} 
	else if (flagAdd)
	{
		watchMatchIds.unshift(numberOrNan(profile.lastMatchs[0].opponent!.id));
		socketUtils.socket?.emit("watch-profile", [watchMatchIds[0]] );
	}
	console.log("Updated watching match IDs:", watchMatchIds);
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

function createProfileCard(profileElement: HTMLElement | null): HTMLElement | void {
	if (!profileElement)
		return;
	let ratio = (profile.gameStats.wins / (profile.gameStats.losses + profile.gameStats.wins)).toFixed(2);
	if (ratio === 'NaN')
		ratio = '0.00';
	const profileCard = document.createElement('div');
	profileCard.className = "flex flex-col px-[2vw] py-[1vh] shadow-lg border border-green-500 items-center h-[19.7%] overflow-hidden";
	profileCard.innerHTML = `<img src="${profile.avatar}" alt="Avatar" class="w-[12vh] h-[12vh] border border-green-500 object-cover"></img>
							<h1 class="text-center text-[1.5vh]">${profile.username}</h1>
							<div class="flex gap-[1vw] text-[0.9vh]">
								<p>Win: ${profile.gameStats.wins}</p>
								<p>Loss: ${profile.gameStats.losses}</p>
								<p>W/L: ${ratio}</p>
							</div>`;
	profileElement.appendChild(profileCard);
	profileDiv = profileCard;
	return profileCard;
}


function createButtons(profileElement: HTMLElement | null): HTMLElement | void {
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
	return buttonContainer;
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
						<p class="truncate" style="font-size: 10px;">${new Date(match.match.createdAt).toLocaleDateString()}</p>
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
		ExtendedView.makeExtendedView('match', '', profile.id);
	});
	profileElement.appendChild(matchHistory);
	const matchElement = createMatchElement();
	console.log("Created match element:", matchElement);
	matchHistory.appendChild(matchElement);
	profileElement.appendChild(matchHistory);
	return matchHistory;
}

function createFriendElement() : HTMLElement
{
	const friendElement = document.createElement('div');
	friendElement.className = "border border-green-500 py-4 flex flex-col gap-y-4 h-full";
	friendElement.id = "friend-list";
	for (let i = 0; i < Math.min(profile.friends.length, 4); i++) {
		const friend = profile.friends[i];
		const friendDiv = document.createElement('div');
		let status;
		if (friend.status === "PENDING")
			status = "Pending...";
		else if (friend.isOnline)
			status = "Online.";
		else
			status = "Offline.";
		friendDiv.className = "flex items-center px-4 gap-x-4 min-w-0";
		friendDiv.innerHTML = `
		<img src="${friend.avatar}" alt="Avatar"
					class="w-8 h-8 sm:w-10 sm:h-10 border border-green-500 object-cover shrink-0"></img>
				<div class="flex flex-col gap-y-0 min-w-0 flex-1">
					<p class="truncate">${friend.username}</p>
					<p class="truncate" style="font-size: 10px;">${status}</p>
				</div>
		`
		if (friend.status === "PENDING" && friend.requesterId !== profile.id) {
			const pendingTag = document.createElement('div');
			pendingTag.className = "flex gap-x-2";
			pendingTag.innerHTML = `
				<button id="AcceptRequest" class="ml-auto p-1 border border-green-500 hover:underline hover:underline-offset-2 cursor-pointer">Accept</button>
				<button id="RefuseRequest" class="ml-auto p-1 border border-green-500 hover:underline hover:underline-offset-2 cursor-pointer">Refuse</button>
			`
			const buttonAccept = pendingTag.querySelector('#AcceptRequest');
			const buttonRefuse = pendingTag.querySelector('#RefuseRequest');
			buttonAccept?.addEventListener('click', () => {
				FriendRequestController.acceptFriendRequest(friend.id);
			});
			buttonRefuse?.addEventListener('click', () => {
				FriendRequestController.removeFriend(friend.id);
			});
			friendDiv.appendChild(pendingTag);
		}
		else
		{
			const pendingTag = document.createElement('div');
			pendingTag.className = "flex gap-x-2";
			pendingTag.innerHTML = `
				<button id="removeFriendButton" class="ml-auto p-1 border border-green-500 hover:underline hover:underline-offset-2 cursor-pointer">Remove</button>
			`
			const removeButton = pendingTag.querySelector('#removeFriendButton');
			removeButton?.addEventListener('click', () => {
				FriendRequestController.removeFriend(friend.id);
			});
			friendDiv.appendChild(pendingTag);
		}
		friendElement.appendChild(friendDiv);
	}
	if (profile.friends.length === 0) {
		const noMatchMessage = document.createElement('div');
		noMatchMessage.className = "text-center text-gray-500";
		noMatchMessage.innerText = "Aucun ami trouvé.";
		friendElement.appendChild(noMatchMessage);
	}
	return friendElement;
}

function createFriendDiv(profileElement: HTMLElement | null): HTMLElement | void {
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
		ExtendedView.makeExtendedView('friend', '', profile.id);
	});
	const friendElement = createFriendElement();
	friendList.appendChild(friendElement);
	profileElement.appendChild(friendList);
	return friendList;
}

async function fetchProfileData(user: string): Promise<string> {
	const token = TerminalUtils.getCookie('accessToken') || '';
	if (token === '') {
		return `Vous n'êtes pas connecté.`;
	}
	let data;
	try {
		const response = await fetch('/api/suscriber/profile', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
		});
		data = await response.json();
		if (data.success) {
			profile = data.user;
			return "OK";
		}
		if (data.message === 'Invalid or expired token') {
			const refreshed = await RequestBackendModule.tryRefreshToken();
			if (!refreshed) {
				return `Vous n'êtes pas connecté.`;
			}
			return "OK";
		}
		return data.message;
	} catch (error) {
		return 'Erreur lors de la récupération des données du profil.';
	}
}

export namespace ProfileBuilder {
	export async function buildProfile(user: string, push: boolean): Promise<string> {
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
		createFriendDiv(profileElement);

		document.body.appendChild(profileElement);
		if (push) {
			history.pushState(null, '', `/profile/${user}`);
		}
		isActive = true;
		if (socketUtils && socketUtils.socket)
		{
			socketUtils.socket.on("profile-update", (user: { id: string, username: string, avatar: string }) => {
				// console.log("Profile updated:", user.id);
				// ProfileUpdater.updateFriendProfile(parseInt(user.id), user.username, user.avatar);
				console.log("Profile updated:", user.id, ' : ', user.username, ' : ', user.avatar);
				if (parseInt(user.id) === profile.id) {
					profile.username = user.username;
					profile.avatar = user.avatar;
					history.replaceState(null, '', `/profile/${profile.username}`);
					ProfileUpdater.updateProfileCard(profile);
				}
				else
				{
					for (let i = 0; i < profile.lastMatchs.length; i++)
					{
						if (profile.lastMatchs[i].opponent && numberOrNan(profile.lastMatchs[i].opponent!.id) === parseInt(user.id))
						{
							profile.lastMatchs[i].opponent!.username = user.username;
							profile.lastMatchs[i].opponent!.avatar = user.avatar;
							updateMatchDiv(false);
							break ;
						}
					}
					for (let i = 0; i < profile.friends.length; i++)
					{
						if (profile.friends[i].id === parseInt(user.id))
						{
							profile.friends[i].username = user.username;
							profile.friends[i].avatar = user.avatar;
							sortFriendList();
							updateFriendDiv();
							break ;
						}
					}
					if (ExtendedView.isExtendedViewIsActive && ExtendedView.type === 'friend')
					{
						ExtendedView.updateFriendInfo(parseInt(user.id), user.username, '', user.avatar);
					}
					if (ExtendedView.isExtendedViewIsActive && ExtendedView.type === 'match')
					{
						ExtendedView.updateMatchOpponent(parseInt(user.id), user.username, user.avatar);
					}
				}
			});
			socketUtils.socket.on("user-status-change", (data: UserStatusChange) => {
				ProfileUpdater.updateFriendList(data.userId, data.status);
				if (ExtendedView.isExtendedViewIsActive && ExtendedView.type === 'friend')
				{
					ExtendedView.updateFriendStatus(data.userId, data.status);
				}
			});

			socketUtils.socket.on("match-update", (data: MatchSummary) => {
				console.log("Match updated:", data);
				profile.lastMatchs.unshift(data);
				if (profile.lastMatchs.length > 4)
					profile.lastMatchs.pop();
				updateMatchDiv(true);
			});

			socketUtils.socket.on("stat-update", (data: GameStats) => {
				console.log("Stat updated:", data);
				profile.gameStats = data;
				ProfileUpdater.updateProfileCard(profile);
			});

			socketUtils.socket.on("friend-status-update", (data: FriendStatusUpdate) => {
				console.log("Friend status updated DATA:", data);
				
				// Récupère les données utilisateur, qu'elles soient dans 'requester' ou 'friendProfile'
				const userData = data.requester || data.friendProfile;

				if (!userData) return;

				let friendToAdd: Friend = {
					id: userData.id,
					username: userData.username,
					avatar: userData.avatar,
					isOnline: userData.isOnline,
					status: data.status,
					requesterId: userData.requesterId,
				};
				if (data.status === "ACCEPTED") {
					WriteOnTerminal.printErrorOnTerminal(`You are now friends with ${userData.username}.`);
				} else if (data.status === "PENDING") {
					WriteOnTerminal.notification([`New friend request`, `New friend request from ${userData.username}. Check your 'profile'to accept it.`]);
					if (ExtendedView.isExtendedViewIsActive && ExtendedView.type === 'friend')
					{
							ExtendedView.addFriend(FriendToExtendedFriend(friendToAdd));
					}
				}
				profile.friends.push(friendToAdd);
				sortFriendList();
				updateFriendDiv();
			});
			watchMatchIds = getWathIdMatch();
			socketUtils.socket.emit("watch-profile", watchMatchIds);
			console.log("Watching match IDs:", watchMatchIds);
		}
		return 'Profil ouvert. Tapez "kill profile" pour le fermer.';
	}
	export function removeProfile(pushHistory: boolean) {
		const profileElement = document.getElementById('profile');
		if (profileElement) {
			document.body.removeChild(profileElement);
			isActive = false;
			if (socketUtils && socketUtils.socket)
				socketUtils.socket.off("profile-update");
			if (pushHistory)
			{
				history.pushState(null, '', `/`);
			}
		}
		if (socketUtils && socketUtils.socket)
		{
			socketUtils.socket.emit("unwatch-profile", watchMatchIds);
			socketUtils.socket.off("user-status-change");
			socketUtils.socket.off("friend-status-update");
			socketUtils.socket.off("profile-update");
			socketUtils.socket.off("match-update");
			socketUtils.socket.off("stat-update");
		}
		watchMatchIds = [];
	}
	export let isActive = false;
}

function getWathIdMatch(): number[]
{
	if (!profile.lastMatchs)
		return [];
	let ids: number[] = [];
	for (let i = 0; i < 4; i++)
	{
		if (profile.lastMatchs[i] && profile.lastMatchs[i].opponent)
			ids.push(numberOrNan(profile.lastMatchs[i].opponent!.id));
	}
	return ids;
}

function getWathIdFriend(): number[]
{
	if (!profile.friends)
		return [];
	let ids: number[] = [];
	for (let i = 0; i < 4; i++)
	{
		if (profile.friends[i])
			ids.push(profile.friends[i].id);
	}
	return ids;
}


async function ChangeName() {
	if (Modal.isModalActive || PongUtils.isPongLaunched )
		return;
	Modal.makeModal("Change Name", 'text', 'Shadow 0-1', async (text: string) => {
		Modal.closeModal();
		console.log("New name:", text);
		await requetChangeName(text);
	});
}

async function requetChangeName(newName: string): Promise<boolean> {
	const token = TerminalUtils.getCookie('accessToken') || '';

	try {
		const response = await fetch('/api/suscriber/update/username', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
			body: JSON.stringify({
				username: newName
			},)
		});
		const data = await response.json();
		if (data.success) {
			WriteOnTerminal.printErrorOnTerminal("Le nom a été changé avec succès.");
			TerminalUserManagement.username = newName;
			TerminalUtils.updatePromptText( TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ " );
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
		else {
			WriteOnTerminal.printErrorOnTerminal(data.message || "Error changing name.");
		}
		return false;
	} catch (error) {
		WriteOnTerminal.printErrorOnTerminal("Error changing name.");
		return false;
	}

}

function ChangePassword() {
	if (Modal.isModalActive || PongUtils.isPongLaunched)
		return;

	Modal.makeModal("Actual Password", 'password', '', (text: string) => {
		Modal.closeModal();
		Modal.makeModal("New Password", 'password', '', (newPass: string) => {
			Modal.closeModal();
			Modal.makeModal("Confirm Password", 'password', '', (confirmPass: string) => {
				Modal.closeModal();
				requestChangePassword(text, newPass, confirmPass);
			});
		});
	});
}

async function requestChangePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<boolean> {
	const token = TerminalUtils.getCookie('accessToken') || '';

	try {
		const response = await fetch('/api/suscriber/update/password', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
			body: JSON.stringify({
				currentPassword: currentPassword,
				newPassword: newPassword,
				confirmNewPassword: confirmNewPassword
			})
		});
		const data = await response.json();
		if (data.success) {
			WriteOnTerminal.printErrorOnTerminal("Password changed successfully");
			return true;
		}
		if (data.message === 'Invalid or expired token') {
			const refreshed = await RequestBackendModule.tryRefreshToken();
			if (!refreshed) {
				WriteOnTerminal.printErrorOnTerminal("Veuillez vous connecter.");
				return false;
			}
			return await requestChangePassword(currentPassword, newPassword, confirmNewPassword);
		}
		WriteOnTerminal.printErrorOnTerminal(data.message || "Error changing password.");
		return false;
	} catch (error) {
		WriteOnTerminal.printErrorOnTerminal("Error changing password.");
		return false;
	}
}

function ChangeAvatar() {
	if (Modal.isModalActive || PongUtils.isPongLaunched )
		return;

	Modal.makeModal("Change Avatar", 'file', '', (imageFile: File | null) => {
		Modal.closeModal();
		if (!(imageFile instanceof File)) {
			WriteOnTerminal.printErrorOnTerminal("No file selected.");
			return;
		}
		const formData = new FormData();
		formData.append('avatar', imageFile);
		requestChangeAvatar(formData);
		
	});
}

async function requestChangeAvatar(formData: FormData): Promise<boolean> {
	const token = TerminalUtils.getCookie('accessToken') || '';
	try {
		const response = await fetch('/api/suscriber/update/avatar', {
			method: 'PUT',
			headers: {
				'Authorization': 'Bearer ' + token
			},
			body: formData
		});
		const data = await response.json();
		if (data.success) {
			WriteOnTerminal.printErrorOnTerminal("Avatar changé avec succès.");
			return true;
		}
		if (data.message === 'Invalid or expired token') {
			const refreshed = await RequestBackendModule.tryRefreshToken();
			if (!refreshed) {
				WriteOnTerminal.printErrorOnTerminal("Veuillez vous connecter.");
				return false;
			}
			return await requestChangeAvatar(formData);
		}
		WriteOnTerminal.printErrorOnTerminal(data.message || "Error changing avatar.");
		return false;
	} catch (error) {
		WriteOnTerminal.printErrorOnTerminal("Error changing avatar.");
		return false;
	}
}

function DeleteAccount() {
	if (Modal.isModalActive || PongUtils.isPongLaunched )
		return;
	Modal.makeModal("Are you sure you want to delete your account? Type 'DELETE' to confirm.", 'text', 'DELETE', (text: string) => {
		Modal.closeModal();
		if (text === "DELETE") {
			requestDeleteAccount();
		}
		else
			console.log("Account deletion cancelled");
	});
}


// DELETE /suscriber/deleteaccount
async function requestDeleteAccount(): Promise<boolean>
{
	const token = TerminalUtils.getCookie('accessToken') || '';
	try {
		const response = await fetch('/api/suscriber/delete/account', {
			method: 'DELETE',
			headers: {
				'Authorization': 'Bearer ' + token
			}
		});
		const data = await response;
		console.log("Account deletion response:", data);
		if (response.status === 204) {
			WriteOnTerminal.printErrorOnTerminal("Compte supprimé avec succès.");
			RequestBackendModule.logout([], "");
			return true;
		}
		else
			WriteOnTerminal.printErrorOnTerminal("Erreur lors de la suppression du compte.");
		return false;
	} catch (error) {
		WriteOnTerminal.printErrorOnTerminal("Error deleting account.");
		return false;
	}
}

export namespace FriendRequestController {
	export async function acceptFriendRequest(id: number): Promise<boolean> {
		try {
			const response = await fetch(`/api/friend/accept/${id}`, {
				method: 'PUT',
				headers: {
					'Authorization': 'Bearer ' + TerminalUtils.getCookie('accessToken')
				}
			});
			if (response.status === 204) {
				const friend = profile.friends.find(friend => friend.id === id);
				if (friend) {
					friend.status = "ACCEPTED";
					WriteOnTerminal.displayOnTerminal(`${friend.username} est maintenant votre ami.`, false);
					
				}
				sortFriendList();
				updateFriendDiv();
				return true;
			}
			const data = await response.json();
			if (data.message === 'Invalid or expired token') {
				const refreshed = await RequestBackendModule.tryRefreshToken();
				if (!refreshed) {
					WriteOnTerminal.printErrorOnTerminal("Veuillez vous connecter.");
					return false;
				}
				return await acceptFriendRequest(id);
			}
			return false;
		} catch (error) {
			WriteOnTerminal.printErrorOnTerminal("Error accepting friend request.");
			return false;
		}
	}

	export async function removeFriend(id: number): Promise<boolean> {
		try {
			const response = await fetch(`/api/friend/delete/${id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': 'Bearer ' + TerminalUtils.getCookie('accessToken')
				}
			});
			if (response.status === 204) {
				{
					const friend = profile.friends.find(friend => friend.id === id);
					if (friend)
						WriteOnTerminal.displayOnTerminal(`Vous avez supprimé ${friend.username} de votre liste d'amis.`, false);
				}
				ProfileUpdater.removeFriend(id);
				fetchProfileData('');
				sortFriendList();
				updateFriendDiv();
				return true;
			}
			const data = await response.json();
			if (data.success) {

				return true;
			}
			if (data.message === 'Invalid or expired token') {
				const refreshed = await RequestBackendModule.tryRefreshToken();
				if (!refreshed) {
					WriteOnTerminal.printErrorOnTerminal("Veuillez vous connecter.");
					return false;
				}
				return await removeFriend(id);
			}
			return false;
		} catch (error) {
			WriteOnTerminal.printErrorOnTerminal("Error removing friend.");
			return false;
		}
	}


}


