import "reflect-metadata"
import { Terminal, TerminalFileSystem } from './terminal'
import { ProfileBuilder } from './profile'
import { WriteOnTerminal } from './terminalUtils/writeOnTerminal'
import { TerminalUtils } from './terminalUtils/terminalUtils'
import { TerminalUserManagement } from './terminal'
import { HELP_MESSAGE_NOT_LOG } from './terminalUtils/helpText/help'
import { ExtProfileBuilder } from "./extprofile"

const url = new URL( window.location.href);
const path = url.pathname;

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
	history.pushState({}, '', `/`);
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
		history.pushState({}, '', `/`);
	}
	else if (getUrlVar('error')) {
		message = "Authentication failed. Please try again.";
		history.pushState({}, '', `/`);
	}
}


await auth42Callback();


await Terminal.buildTerminal();


if (path === '/')
{
	if (!TerminalUserManagement.isLoggedIn)
	{
		if (message) {
			WriteOnTerminal.printWithAnimation(message, 5);
		} else {
			await WriteOnTerminal.printWithAnimation("Welcome to Transencdence !", 5);
			await WriteOnTerminal.printWithAnimation(HELP_MESSAGE_NOT_LOG, 1);

		}
	}
	else
	{
		await WriteOnTerminal.printWithAnimation(`Welcome back ${TerminalUserManagement.username} ! Type 'help' for instructions.`, 5);
	}
	if (ProfileBuilder.isActive)
		ProfileBuilder.removeProfile();
}
else if (path.startsWith('/profile/')) {
	const user = path.split('/profile/')[1];
	if ((user.match(/\//g) || []).length >= 1) {
		Error404();
	}
	else
	{
		if (user === TerminalUserManagement.username)
			ProfileBuilder.buildProfile('');
		else
			ExtProfileBuilder.buildExtProfile(user);
	}
}
else
{
	Error404();
	console.log('404 Not Found');
}