import { Terminal, TerminalFileSystem } from './typescript/terminal'
import { ProfileBuilder } from './typescript/profile'
import { WriteOnTerminal } from './typescript/terminalUtils/writeOnTerminal'
import { TerminalUtils } from './typescript/terminalUtils/terminalUtils'
import { ExtProfileBuilder } from './typescript/extprofile'
import { TerminalUserManagement } from './typescript/terminal'

const url = new URL( window.location.href);
const path = url.pathname;

const errors404 = ["You are the reason why everthing in your life is miserable", "Your only talent is failling", "The only usefull thing you've ever done is failling"];


/*
	get Var fonction
	Si var code existe
		Fetch POST /auth/42/callback avec le code
		Si reponse OK
			load user data


*/


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
	console.log("Checking for 42 auth callback...");
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
}


await auth42Callback();


await Terminal.buildTerminal();


if (path === '/')
{
	if (!TerminalUserManagement.isLoggedIn)
		WriteOnTerminal.printErrorOnTerminal("Welcome to Transencdence ! Type `help` for instructions.");
	else
		WriteOnTerminal.printErrorOnTerminal(`Welcome back ${TerminalUserManagement.username} ! Type \`help\` for instructions.`);
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
		// Si le user ==== a son propre username on met ProfileBuilder.buildProfile('') sinon ExtProfileBuilder.buildExtProfile(user)
		ProfileBuilder.buildProfile(user);
	}
}
else
{
	Error404();
	console.log('404 Not Found');
}


