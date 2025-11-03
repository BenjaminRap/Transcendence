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
	profileCard.className = "flex flex-col p-4 shadow-lg border border-green-500 align-center justify-center items-center";
	profileCard.innerHTML = `<img src="${profile.linkofavatar}" alt="Avatar" class="w-24 h-24 border border-green-500"></img>
							<h1 class="text-center">${profile.username}</h1>
							<div class="flex gap-4 text-xs">
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
	buttonContainer.className = "grid grid-cols-2 place-content-stretch gap-2";
	buttonContainer.innerHTML = `<button class="p-2 border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Add Friend</button>
								<button class="p-2 border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Block User</button>`
								// 	<button class="p-2 border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Change Avatar</button>
								// <button class="p-2 border border-green-500 cursor-pointer hover:underline hover:underline-offset-2">Delete Account</button>

	profileElement.appendChild(buttonContainer);
}

function createMatchHistory(profileElement: HTMLElement | null) {
	if (!profileElement)
		return;
	const matchHistory = document.createElement('div');
	matchHistory.className = "flex flex-col min-h-[25vh]"; 
	matchHistory.innerHTML = `<div class="flex w-full place-content-between">
								<p class="text-center">Last match</p>
								<button class="cursor-pointer hover:underline hover:underline-offset-2">View More</button>
							</div>`
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
						<p class="absolute top-[-24px] right-0 hidden group-hover:block border p-1 border-green-500 bg-black">${match.opponent}</p>
					</div>
					<img src="${match.profilelinkopponent}" alt="Avatar"
						class="w-10 h-10 border border-green-500"></img>
				</div>
			`
		matchElement.appendChild(matchDiv);
	}
	matchHistory.appendChild(matchElement);
	profileElement.appendChild(matchHistory);
}

export namespace ExtProfileBuilder {
	export function buildExtProfile(user: string) {
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
