import { Terminal } from './typescript/terminal'
import { ProfileBuilder } from './typescript/profile'
import { TerminalUtils } from './typescript/terminal.ts'

Terminal.buildTerminal();

const url = new URL( window.location.href);
const path = url.pathname;

const errors404 = ["You are the reason why everthing in your life is miserable", "Your only tallent is failling", "The only usefull thing you've ever done is failling"];

if (path === '/')
{
	if (ProfileBuilder.isActive)
		ProfileBuilder.removeProfile();
}
else if (path.startsWith('/profile/')) {
	const user = path.split('/profile/')[1];
	console.log('Building profile for user:', user); // Mini parsing a faire ici
	ProfileBuilder.buildProfile(user);
}
else
{
	TerminalUtils.displayOnTerminal(`cat error404.html`);
	TerminalUtils.printErrorOnTerminal(errors404[Math.floor(Math.random() * errors404.length)]);
	history.pushState({}, '', `/`);
}


