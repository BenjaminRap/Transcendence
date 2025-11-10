import { TerminalUtils } from './terminal.ts'

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
	},{
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
	},{
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
	},{
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
	},{
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
	},{
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
	},{
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
	},{
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




function createListMatches() : HTMLDivElement
{
	const matchElement = document.createElement('div');
	matchElement.className = "flex flex-col gap-y-4 h-full overflow-y-auto";
	const lign = document.createElement('hr');
	lign.className = "border-green-500";
	for (let i = 0; i < matches.length; i++) {
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
						<p class="absolute top-[-24px] right-0 hidden group-hover:block border p-1 border-green-500 bg-black">${match.opponent}</p>
					</div>
					<img src="${match.profilelinkopponent}" alt="Avatar"
						class="w-10 h-10 border border-green-500"></img>
				</div>
			`
		matchElement.appendChild(matchDiv);
		if (i < matches.length - 1)
			matchElement.appendChild(lign.cloneNode());
	}
	return matchElement;
}



function createFriendList() : HTMLDivElement
{
	const friendElement = document.createElement('div');
	const lign = document.createElement('hr');
	lign.className = "border-green-500";
	friendElement.className = "flex flex-col gap-y-4 h-full overflow-y-auto";
	for (let i = 0; i < friends.length; i++) {
		const friend = friends[i];
		const friendDiv = document.createElement('div');
		friendDiv.className = "flex items-center px-4 gap-x-4";
		friendDiv.innerHTML = `
		<img src="${friend.linkofavatar}" alt="Avatar"
					class="w-10 h-10 border border-green-500"></img>
				<div class="flex flex-col gap-y-0">
					<p>${friend.username}</p>
					<p style="font-size: 10px;">${friend.status}</p>
				</div>
		`
		friendElement.appendChild(friendDiv);
		if (i < friends.length - 1)
			friendElement.appendChild(lign.cloneNode());
	}
	return friendElement;
}



export namespace ExtendedView { 
	export var isExtendedViewIsActive = false;

	export function makeExtendedView(dataType: 'match' | 'friend', username: string | '') {
		if (isExtendedViewIsActive)
			return;
		const view = document.createElement('div');
		view.className = "fixed top-[50%] left-[50%] border p-4 border-green-500 bg-black z-2 flex flex-col -translate-x-[50%] -translate-y-[50%] gap-4 w-[20%] max-h-[50vh] overflow-y-hidden";
		view.id = "view";

		view.setAttribute('tabindex', '0');
		view.focus();

		view.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.key === 'Escape' || (event.key === 'c' && event.ctrlKey)) {
				event.preventDefault();
				closeExtendedView();
				TerminalUtils.displayOnTerminal("^C");
			}
		});
		const closeButton = document.createElement('button');
		closeButton.className = "terminal-font absolute top-0 right-1 hover:underline hover:underline-offset-2 p-1";
		closeButton.textContent = "×";


		const container = document.createElement('div');
		container.className = "flex flex-col gap-2 px-2 h-full overflow-y-auto";
		const searchBar = document.createElement('input');
		searchBar.type = "text";
		searchBar.placeholder = "Search "+ (dataType === 'friend' ? 'friends' : 'matches');
		searchBar.autocomplete = "off";
		searchBar.className = "terminal-font border-green-500 border-2 resize-none w-full outline-0 p-2 h-auto overflow-y-hidden";
		container.appendChild(searchBar);

		if (dataType === 'friend') {
			const friendList = createFriendList();
			container.appendChild(friendList);
		}
		else if (dataType === 'match') {
			const matchList = createListMatches();
			container.appendChild(matchList);
		}

		view.appendChild(container);

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
}