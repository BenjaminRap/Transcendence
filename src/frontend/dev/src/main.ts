import { Terminal } from './typescript/terminal'
import { ProfileBuilder } from './typescript/profile'
import { TerminalUtils } from './typescript/terminal.ts'
import { ExtProfileBuilder } from './typescript/extprofile'

Terminal.buildTerminal();

const url = new URL( window.location.href);
const path = url.pathname;

const errors404 = ["You are the reason why everthing in your life is miserable", "Your only talent is failling", "The only usefull thing you've ever done is failling"];


function Error404() {
	TerminalUtils.displayOnTerminal(`cat error404.html`);
	TerminalUtils.printErrorOnTerminal(errors404[Math.floor(Math.random() * errors404.length)]);
	history.pushState({}, '', `/`);
}



if (path === '/')
{
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
	Error404();


