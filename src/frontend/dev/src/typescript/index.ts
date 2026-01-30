import "reflect-metadata"
import { FrontendSocketHandler } from "./pong/FrontendSocketHandler"
import { PongUtils, Terminal, TerminalElements, TerminalFileSystem, socketUtils } from './terminal'
import { ProfileBuilder } from './profile'
import { WriteOnTerminal } from './terminalUtils/writeOnTerminal'
import { TerminalUtils } from './terminalUtils/terminalUtils'
import { TerminalUserManagement } from './terminal'
import { HELP_MESSAGE_NOT_LOG } from './terminalUtils/helpText/help'
import { ExtProfileBuilder } from "./extprofile"

export const	frontendSocketHandler = await FrontendSocketHandler.createFrontendSocketHandler();

socketUtils.socket = frontendSocketHandler.socket;
const url = new URL( window.location.href);
let path = url.pathname;

let message = '';

const errors404 = ["You are the reason why everthing in your life is miserable", "Your only talent is failling", "The only usefull thing you've ever done is failling"];

function getUrlVar(varName: string) : string | null {
	const urlParams = new URLSearchParams(window.location.search);
	const varValue = urlParams.get(varName);
	return varValue;
}

function Error404() {
	WriteOnTerminal.displayOnTerminal(`cat error404.html`, true);
	WriteOnTerminal.printErrorOnTerminal(errors404[Math.floor(Math.random() * errors404.length)]);
	history.pushState(null, '', `/`);
}


function buildPong()
{
	if (TerminalElements.terminal) {
		TerminalElements.terminal.insertAdjacentHTML('beforeend', `
			<div id="pong-game-container" class="fixed top-[50%] left-[50%] border border-green-500 bg-black flex flex-col -translate-x-[50%] -translate-y-[50%] gap-4 " style="width: 80vw">
				<pong-game id="pong-game" class="size-full"></pong-game>
			</div>
		`);
		PongUtils.isPongLaunched = true;
		PongUtils.pongGameInstance = document.getElementById('pong-game') as HTMLDivElement;
	}
}

async function auth42Callback() {
	const code = getUrlVar('code');
	if (code) {
		try {
			const response = await fetch(`/api/auth/callback?code=${code}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			console.log("Data:", data);
			if (data.success) {
				document.cookie = `accessToken=${data.tokens.accessToken}; path=/;`;
				document.cookie = `refreshToken=${data.tokens.refreshToken}; path=/;`;
				TerminalUserManagement.username = data.user.username;
				TerminalUtils.updatePromptText( TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ " );
				TerminalUserManagement.isLoggedIn = true;
			}
			else
			{

			}
		} catch (error) {
			console.error("Error:", error);
		}
		console.log("42 des ses mort");
		history.pushState(null, '', `/`);
	}
	else if (getUrlVar('error')) {
		message = "Authentication failed. Please try again.";
		console.log("42 des ses mort if");
		history.pushState(null, '', `/`);
	}
}

await auth42Callback();

await Terminal.buildTerminal();


async function pathSelector() {
	const currentPath = window.location.pathname;

	if (currentPath === '/') {
		if (ProfileBuilder.isActive) {
			ProfileBuilder.removeProfile(false);
		}

		if (PongUtils.isPongLaunched) {
			PongUtils.removePongDiv(false);
		}
		if (!TerminalUserManagement.isLoggedIn) {
			if (typeof message !== 'undefined' && message) {
				WriteOnTerminal.printWithAnimation(message, 5);
			} else {
				await WriteOnTerminal.printWithAnimation("Welcome to Transcendence !", 5);
				await WriteOnTerminal.printWithAnimation(HELP_MESSAGE_NOT_LOG, 1);
			}
		} else {
			await WriteOnTerminal.printWithAnimation(`Welcome back ${TerminalUserManagement.username} ! Type 'help' for instructions.`, 5);
		}
		

	} 
	else if (currentPath.startsWith('/profile/')) {
		if (PongUtils.isPongLaunched) {
			PongUtils.removePongDiv(false);
		}
		const user = currentPath.split('/profile/')[1];
				if ((user.match(/\//g) || []).length >= 1) {
			Error404();
		} else {
			let result: string;
			if (user === TerminalUserManagement.username || user === '') {
				if (ProfileBuilder.isActive) {
					return ;
				}
				result = await ProfileBuilder.buildProfile('', false);
			} else {
				result = await ExtProfileBuilder.buildExtProfile(user, false);
			}

			if (!result.startsWith('Profil ouvert. Tapez "kill profile" pour le fermer.')) {
				WriteOnTerminal.printErrorOnTerminal(result);
				window.history.pushState(null, '', '/'); 
				console.log("Salam from index");
				await pathSelector();
			}
		}
	}
	else if (currentPath.startsWith('/pong')) {
		if (!PongUtils.isPongLaunched) {
			buildPong();
		}
	} else {
		Error404();
	}
}

await pathSelector();

window.addEventListener('popstate', async (event: PopStateEvent) => {
	console.log(`Navigation détectée vers : ${window.location.pathname}`);
	await pathSelector();
});