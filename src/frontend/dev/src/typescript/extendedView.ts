import { WriteOnTerminal } from "./terminalUtils/writeOnTerminal";
import { PongUtils } from './terminal'
import { TerminalUtils } from "./terminalUtils/terminalUtils";




interface Friend
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


interface Match {
	id: number;
	createdAt: Date;
	winnerId: number | null;
	loserId: number | null;
	scoreWinner: number;
	scoreLoser: number;
	duration: number;
	tournamentId: number | null;
}

interface MatchSummary
{
	isWinner: boolean,
	opponent: { id: string, username: string, avatar: string,} | null,
	match: Match | null,
}

let matches: MatchSummary[] = [];
let friends: Friend[] = [];

let MatchDisplay: MatchSummary[] = [...matches];
let FriendDisplay: Friend[] = [...friends];

let profileId = 0;



function createListMatches() : HTMLDivElement
{
	const matchElement = document.createElement('div');
	matchElement.id = "matchList";
	matchElement.className = "flex flex-col gap-y-4 px-2 h-full overflow-y-auto";
	const lign = document.createElement('hr');
	lign.className = "border-green-500";
	for (let i = 0; i < Math.min(MatchDisplay.length, 4); i++) {
		const match = MatchDisplay[i];
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
		if (i < MatchDisplay.length - 1)
			matchElement.appendChild(lign.cloneNode());
	}
	if (MatchDisplay.length === 0) {
		const noMatchMessage = document.createElement('div');
		noMatchMessage.className = "text-center text-gray-500";
		noMatchMessage.innerText = "Aucun match trouvé.";
		matchElement.appendChild(noMatchMessage);
	}
	return matchElement;
}



function createFriendList() : HTMLDivElement
{
		const friendElement = document.createElement('div');
	friendElement.id = "friendList";
	const lign = document.createElement('hr');
	lign.className = "border-green-500";
	friendElement.className = "terminal-font flex flex-col gap-y-4 px-2 h-full overflow-y-auto";
	for (let i = 0; i < FriendDisplay.length; i++) {
		const friend = FriendDisplay[i];
		const friendDiv = document.createElement('div');
		let status;
		if (friend.status === "PENDING")
			status = "Pending...";
		else if (friend.user.isOnline)
			status = "Online.";
		else
			status = "Offline.";
		friendDiv.className = "flex items-center px-4 gap-x-4 min-w-0";
		friendDiv.innerHTML = `
		<img src="${friend.user.avatar}" alt="Avatar"
					class="w-8 h-8 sm:w-10 sm:h-10 border border-green-500 object-cover shrink-0"></img>
				<div class="flex flex-col gap-y-0 min-w-0 flex-1">
					<p class="truncate">${friend.user.username}</p>
					<p class="truncate" style="font-size: 10px;">${status}</p>
				</div>
		`
		if (friend.status === "PENDING" && friend.user.requesterId !== profileId) {
			const pendingTag = document.createElement('div');
			pendingTag.className = "flex gap-x-2";
			pendingTag.innerHTML = `
				<button id="AcceptRequest" class="ml-auto p-1 border border-green-500 hover:underline hover:underline-offset-2 cursor-pointer">Accept</button>
				<button id="RefuseRequest" class="ml-auto p-1 border border-green-500 hover:underline hover:underline-offset-2 cursor-pointer">Refuse</button>
			`
			const buttonAccept = pendingTag.querySelector('#AcceptRequest');
			const buttonRefuse = pendingTag.querySelector('#RefuseRequest');
			buttonAccept?.addEventListener('click', () => {
				acceptFriendRequest(FriendDisplay[i].user.username);
			});
			buttonRefuse?.addEventListener('click', () => {
				removeFriend(FriendDisplay[i].user.username);
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
				removeFriend(FriendDisplay[i].user.username);
			});
			friendDiv.appendChild(pendingTag);
		}
		friendElement.appendChild(friendDiv);
		if (i < FriendDisplay.length - 1)
			friendElement.appendChild(lign.cloneNode());
	}
	return friendElement;
}

async function fetchFriendData() : Promise<void>
{
	try {
		const token = TerminalUtils.getCookie('accessToken') || '';
		if (token === '') {
			console.error("No access token found.");
			return;
		}
		const response = await fetch('/api/friend/search/myfriends', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
		});
		const data = await response.json();
		if (data.success)
		{
			friends = data.friendList as Friend[];
			FriendDisplay = [...friends];
			console.log("Friend data fetched successfully:", FriendDisplay);
		}
		else
			console.error("Failed to fetch friend data:", data.message);
	}
	catch (error) {
		console.error("Error fetching friend data:", error);
	}
}


async function fetchMatchData() {
	try {
		const token = TerminalUtils.getCookie('accessToken') || '';
		if (token === '') {
			console.error("No access token found.");
			return;
		}
		const response = await fetch('/api/suscriber/profile/allmatches', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
		});
		const data = await response.json();
		if (data.success)
		{
			matches = data.matches as MatchSummary[];
			MatchDisplay = [...matches];
			console.log("Match data fetched successfully:", MatchDisplay);
		}
		else
			console.error("Failed to fetch match data:", data.message);
	}
	catch (error) {
		console.error("Error fetching match data:", error);
	}
}


export namespace ExtendedView { 
	export var isExtendedViewIsActive = false;

	export async function makeExtendedView(dataType: 'match' | 'friend', username: string | '') {
		if (isExtendedViewIsActive || PongUtils.isPongLaunched)
			return;
		ExtendedView.type = dataType;
		if (dataType === 'friend') {
			await fetchFriendData();
		}
		else if (dataType === 'match') {
			await fetchMatchData();
		}
		const view = document.createElement('div');
		view.className = "terminal-font fixed top-[50%] left-[50%] border p-4 border-green-500 bg-black z-2 flex flex-col -translate-x-[50%] -translate-y-[50%] gap-4 w-[20%] max-h-[50vh] overflow-y-auto focus:outline-none";
		view.style = "width: 30%"
		view.id = "view";

		view.setAttribute('tabindex', '0');
		view.focus();

		view.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.key === 'Escape' || (event.key === 'c' && event.ctrlKey)) {
				console.log("Kill signal recu par :", event.key);
				event.preventDefault();
				closeExtendedView();
				WriteOnTerminal.displayOnTerminal("^C", true);
			}
		});
		const closeButton = document.createElement('button');
		closeButton.className = "terminal-font absolute top-0 right-1 hover:underline hover:underline-offset-2 p-1";
		closeButton.textContent = "×";


		const container = document.createElement('div');
		container.className = "flex flex-col px-2 h-full";
		const searchBar = document.createElement('input');
		searchBar.id = "searchBar";
		searchBar.type = "text";
		searchBar.placeholder = "Search "+ (dataType === 'friend' ? 'friends' : 'matches');
		searchBar.autocomplete = "off";
		searchBar.className = "terminal-font border-green-500 border-2 resize-none w-full outline-0 p-2 h-auto";
		searchBarFunctionality(searchBar);
		container.appendChild(searchBar);

		view.appendChild(container);

		if (dataType === 'friend') {
			const friendList = createFriendList();
			view.appendChild(friendList);
		}
		else if (dataType === 'match') {
			const matchList = createListMatches();
			view.appendChild(matchList);
		}

		setTimeout(() => {
			window?.addEventListener('click', handleOutsideClick);
		}, 0);
		closeButton.addEventListener('click', closeExtendedView);

		view.appendChild(closeButton);
		const terminal = document.getElementById('terminal');
		if (terminal) {
			terminal.appendChild(view);
		}
		else {
			console.error("Terminal not found");
			return;
		}

		isExtendedViewIsActive = true;
		searchBar.focus();
	}

	export function closeExtendedView() {
		const view = document.getElementById('view');
		const terminal = document.getElementById('terminal');
		const inputLine = document.getElementById('current-input');
		if (!view || !terminal || !inputLine)
			return;
		if (view.parentNode) {
			view.parentNode.removeChild(view);
			isExtendedViewIsActive = false;
			window?.removeEventListener('click', handleOutsideClick);
			inputLine.focus();
		}
	};

	export function handleOutsideClick(event: MouseEvent) {
		const view = document.getElementById('view');
		const terminal = document.getElementById('terminal');
		if (!view || !terminal)
			return;
		if (!view.contains(event.target as Node))
			closeExtendedView();
		else
			event.stopPropagation();
	};

	export let type = '';

	export function addMatch(match: Match) {
	}

	export function addFriend(friend: Friend) {
	}
}

function acceptFriendRequest(username: string) {
	console.log(`Accepted friend request from: ${username}`);
}

function refuseFriendRequest(username: string) {
	console.log(`Refused friend request from: ${username}`);
}

function removeFriend(username: string) {
	console.log(`Removing friend: ${username}`);
}

function searchBarFunctionality(searchBar: HTMLInputElement) {
	
	searchBar.addEventListener('input', () => {
		const filter = searchBar.value.toLowerCase();
		if (ExtendedView.type === 'friend') {
			if (filter === '')
				FriendDisplay = [...friends];
			else
				FriendDisplay = friends.filter(friend => friend.user.username.toLowerCase().startsWith(filter));
			const oldList = document.getElementById('friendList');
			if (oldList && oldList.parentNode)
				oldList.parentNode.removeChild(oldList);
			if (FriendDisplay.length === 0) {
				const noFriendMessage = document.createElement('p');
				noFriendMessage.id = "friendList";
				noFriendMessage.className = "terminal-font text-center mt-4";
				noFriendMessage.textContent = "No friends found.";
				document.getElementById('view')?.appendChild(noFriendMessage);
				return;
			}
			else
			{
				const newFriendList = createFriendList();
				document.getElementById('view')?.appendChild(newFriendList);
			}
		}
		else if (ExtendedView.type === 'match') {
			if (filter === '')
				MatchDisplay = [...matches]; // Sa evite les shadow copy
			else
				MatchDisplay = matches.filter(match => match.opponent?.username.toLowerCase().startsWith(filter));
			const matchList = document.getElementById('matchList');
			if (matchList && matchList.parentNode)
				matchList.parentNode.removeChild(matchList);
			if (MatchDisplay.length === 0) {
				const noMatchMessage = document.createElement('p');
				noMatchMessage.id = "matchList";
				noMatchMessage.className = "terminal-font text-center mt-4";
				noMatchMessage.textContent = "No matches found.";
				document.getElementById('view')?.appendChild(noMatchMessage);
				return;
			}
			else
			{
				const newMatchList = createListMatches();
				document.getElementById('view')?.appendChild(newMatchList);
			}
		}
	});
}

