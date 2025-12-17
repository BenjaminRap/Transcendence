export { };

import { ProfileBuilder } from './profile.ts'
import { Modal } from './modal.ts'
import { ExtProfileBuilder } from './extprofile.ts'
import { ExtendedView } from './extendedView.ts';

import { RequestBackendModule } from './terminalUtils/requestBackend.ts';
import { WriteOnTerminal } from './terminalUtils/writeOnTerminal.ts';
import { TerminalUtils } from './terminalUtils/terminalUtils.ts';


import FileSystem from './filesystem.json' with { type: "json" };
import { HELP_MESSAGE_NOT_LOG, HELP_MESSAGE } from './terminalUtils/helpText/help';


export namespace TerminalElements {
	export let terminal: HTMLDivElement | null = null;
	export let output: HTMLDivElement | null = null;
	export let inputLine: HTMLDivElement | null = null;
	export let currentInput: HTMLTextAreaElement | null = null;
}

export namespace TerminalConfigVariables {
	export let maxOutputLines = 100;
	export let isBuilded = false;
	export let isHidden = false;
	export let HiddenContent = '';
	export let isWaitingInput = false;
	export let InputIncomming = 0;
	export let InputArgs: string[] = [];
	export let InputResult: string[] = [];
	export let WaitingHidden: number[] = [];
	export let InputFunction: Function | null = null;
	export let isTabInProcess = false;
	export let TabCompletionIndex = -1;
	export let isPrintingAnimation = false;
}

export namespace TerminalUserManagement {
	export let username = 'usah';
	export let isLoggedIn = false;
}

export namespace TerminalFileSystem {
	export let currentDirectory = '/home/user';
}

export namespace TerminalPromptAndEnv {
	export let promptText = TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ ";
	export let backUpPromptText = promptText;
	export let env = {
		'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
		'HOME': '/home/' + TerminalUserManagement.username,
		'TERM': 'minishell'
	};
}

type FileNode = {
	type: "file";
	name: string;
	content: string;
};
type DirNode = {
	type: "directory";
	name: string;
	children: Array<FileNode | DirNode>;
};
type Node = FileNode | DirNode;

export namespace TerminalCommand {
		export class Command {
		name: string;
		description: string;
		usage: string;
		execute: (args: string[], description: string, usage: string) => Promise<string> | string;

		constructor(name: string, description: string, usage: string, execute: (args: string[], description: string, usage: string) => Promise<string> | string) {
			this.name = name;
			this.description = description;
			this.usage = usage;
			this.execute = execute;
		}

		async launchCommand(args: string[]): Promise<string> {
			return await this.execute(args, this.description, this.usage);
		}
	}

	export let commandAvailable =
	[
		new Command('echo', 'Display a line of text', 'echo [text]', echoCommand),
		new Command('help', 'Display this help message', 'help', helpCommand),
		new Command('profile', 'Display user profile', 'profile [username]', profileCommand),
		new Command('kill', 'Terminate a process', 'kill [process_name]', killCommand),
		new Command('clear', 'Clear the terminal screen', 'clear', clearCommand),
		// new Command('modal', 'Create a modal dialog', 'modal [text]', modalCommand),
		new Command('register', 'Register a new user', 'register [text]', registerInput),
		new Command('cd', 'Change the current directory', 'cd [directory]', cdCommand),
		new Command('ls', 'List directory contents', 'ls', lsCommand),
		new Command('pwd', 'Print working directory', 'pwd', pwdCommand),
		new Command('cat', 'Concatenate and display file content', 'cat [file]', catCommand),
		new Command('whoami', 'Display the current username', 'whoami', whoamiCommand),
		new Command('login', 'Login to your account', 'login [email] [password]', loginInput),
		new Command('logout', 'Logout from your account', 'logout', RequestBackendModule.logout),
		new Command('42' , 'Authenticate with OAuth 42', '42', OauthCommand),
	];
	export let commandHistory: string[] = [];
	export let indexCommandHistory = -2;
}




// ------------------------------------------------------------------------ Command ---------------------------------------------------------------------

function OauthCommand(args: string[], description: string, usage: string): string {
	const redirectUri = encodeURIComponent('https://localhost:8080/');

	const uri = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-add813989568aed927d34847da79446b327e2cce154f4c1313b970f9796da37c&redirect_uri=${redirectUri}&response_type=code`;
	console.log("Redirecting to 42 OAuth:", uri);
	window.location.href = uri;
	return '';
}

function echoCommand(args: string[], description: string, usage: string): string {
	let result = '';

	if (args[1] === '-h' || args[1] === '--help') {
		return `${description}\n> Usage: ${usage}`;
	}

	for (let i = 1; i < args.length; i++) {
		result += args[i] + ' ';
	}
	return result.trim();
}

function helpCommand(): string {

	let result: string;

	if (!TerminalUserManagement.isLoggedIn)
		result = HELP_MESSAGE_NOT_LOG;
	else
		result = HELP_MESSAGE;
	const lines = result.split('\n');
	if (lines.length > 1) {
		result = lines[0] + '\n' + lines.slice(1).map(line => '> ' + line).join('\n');
	} else {
		result = lines[0];
	}
	return result;
}

function whoamiCommand(): string {
	return TerminalUserManagement.username;
}

async function profileCommand(args: string[]): Promise<string> {
	let result: string = '';
	if (args.length > 2) {
		return 'Usage: profile to see your profile or profile [username] to see another user\'s profile.';
	}
	if (ProfileBuilder.isActive || ExtProfileBuilder.isActive)
		return 'Profile is already open. Type "kill profile" to close it.';
	if (args.length === 1)
		result = await ProfileBuilder.buildProfile('');
	else
	{
		// result = await ExtProfileBuilder.buildExtProfile(args[1]);
		ExtProfileBuilder.buildExtProfile(args[1]);
		result = "Profile is now open.";
	}
	return result;
}

function killCommand(args: string[]): string {
	if (args.length !== 2)
		return 'Usage: kill [process_name]';
	if (args[1] === 'profile' && ProfileBuilder.isActive) {
		ProfileBuilder.removeProfile();
		return 'kill profile';
	}
	if (args[1] === 'profile' && ExtProfileBuilder.isActive) {
		ExtProfileBuilder.removeExtProfile();
		return 'kill profile';
	}
	return `No such process: ${args[1]}`;
}

function clearCommand(): string
{
	clearOutput();
	return ''
}

function modalCommand(args: string[]): string {
	if (args.length < 2) {
		return 'Usage: modal [text]';
	}
	Modal.makeModal(args.slice(1).join(' '),'text', '', (text: string) => {
		console.log(`Modal input: ${text}`);
		Modal.closeModal();
	});
	return `Modal created with text: ${args.slice(1).join(' ')}`;
}

function cdCommand(args: string[], description: string, usage: string): string {
	if (args.length !== 2) {
		TerminalFileSystem.currentDirectory = '/';
		TerminalUtils.updatePromptText(TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ ");
		return '';
	}
	let targetPath = '';
	if (TerminalFileSystem.currentDirectory === '/')
		targetPath = TerminalFileSystem.currentDirectory + args[1];
	else
		targetPath = TerminalFileSystem.currentDirectory + '/' + args[1];
	targetPath = normalizePath(targetPath);
	if (args[1] === '/') {
		TerminalFileSystem.currentDirectory = '/';
		TerminalUtils.updatePromptText(TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ ");
		return '';
	}
	const node = getNode(targetPath);
	if (!node || node.type !== 'directory') {
		return `cd: no such file or directory: ${targetPath}`;
	}
	TerminalFileSystem.currentDirectory = targetPath;
	TerminalUtils.updatePromptText(TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ ");
	return '';
}

function lsCommand(args: string[], description: string, usage: string): string {
	let node: Node | null;
	let targetPath: string;

	if (args.length === 1) {
		node = getNode(TerminalFileSystem.currentDirectory);
		targetPath = TerminalFileSystem.currentDirectory;
	}
	else if (args.length === 2) {
		targetPath = normalizePath(TerminalFileSystem.currentDirectory + '/' + args[1]);
		node = getNode(targetPath);
	}
	else 
		return `Usage: ${usage}`;
	if (!node || node.type !== 'directory') {
		return `ls: cannot access '${targetPath}': No such directory`;
	}
	return node.children.map(child => (child.type === 'directory' ? child.name + '/' : child.name)).join('\n> ');
}

function pwdCommand(args: string[], description: string, usage: string): string {
	return TerminalFileSystem.currentDirectory;
}

function catCommand(args: string[], description: string, usage: string): string {
	if (args.length !== 2) {
		return `Usage: ${usage}`;
	}
	const targetPath = normalizePath(TerminalFileSystem.currentDirectory + '/' + args[1]);
	const fileNode = getNode(targetPath);
	if (!fileNode || fileNode.type !== 'file') {
		return `cat: ${args[1]}: No such file`;
	}
	return fileNode.content;
}

// ------------------------------------------------------------------------ Utilities ---------------------------------------------------------------------

function getStartWithList(prefix: string, list: string[]): string[] {
	let tabCommand: string[] = [];
	for (const command of list) {
		if (command.startsWith(prefix) && prefix !== command) {
			tabCommand.push(command);
		}
	}
	return tabCommand.sort();
}

function isFirstWord(command: string, cursorPosition: number): boolean {
	const beforeCursor = command.slice(0, cursorPosition);
	return !beforeCursor.includes(' ');
}

function getFirstWord(command: string): string {
	const parts = command.trim().split(' ');
	return parts[0];
}

function normalizePath(path: string): string {
	const parts = path.split('/').filter(p => p.length > 0);
	const stack: string[] = [];

	for (const part of parts) {
		if (part === '.') {
			continue;
		} else if (part === '..') {
			if (stack.length > 0) {
				stack.pop();
			}
		} else {
			stack.push(part);
		}
	}
	return '/' + stack.join('/');
}

function getNode(path: string): Node | null
{
	const parts = path.split("/").filter(p => p.length > 0);
	let node = FileSystem as Node;
	if (parts.length === 0)
		return node;
	for (const part of parts) {
		if (node.type === "directory") {
			const child = node.children.find(c => c.name === part);
			if (child) {
				node = child;
			} else {
				return null;
			}
		} else {
			return null;
		}
	}
	return node;
}

function checkArgs(args: string): boolean {
	let quote: string | null = null;
	for (let i = 0; i < args.length; i++) {
		const char = args[i];
		if (char === "'" || char === '"') {
			if (quote === null) {
				quote = char;
			} else if (quote === char) {
				quote = null;
			}
		}
	}
	return quote === null;
}

function updateCurrentHistory(command: string) {
	if (command == '' || TerminalConfigVariables.isWaitingInput)
		return;	
	if (TerminalCommand.commandHistory.length === 0 || TerminalCommand.commandHistory[TerminalCommand.commandHistory.length - 1] !== command) {
		TerminalCommand.commandHistory.push(command);
	}
	if (TerminalCommand.commandHistory.length > 100) {
		TerminalCommand.commandHistory.shift();
	}
	TerminalCommand.indexCommandHistory = -2;
}

function clearTabCompletion() {
	if (!TerminalElements.terminal)
		return;
	const tabElement = document.getElementById('tab-completion');
	if (tabElement) {
		TerminalElements.terminal.removeChild(tabElement);
	}
	TerminalConfigVariables.isTabInProcess = false;
	TerminalConfigVariables.TabCompletionIndex = -1;
}
function resize() {
	if (!TerminalElements.currentInput)
		return;
	TerminalElements.currentInput.style.height = 'auto';
	TerminalElements.currentInput.style.height = TerminalElements.currentInput.scrollHeight + 'px';
}

function resetInput() {
	if (!TerminalElements.currentInput)
		return;
	TerminalElements.currentInput.value = TerminalPromptAndEnv.promptText;
	resize();
}

function updateCursorPosition(position: number) {
	if (!TerminalElements.currentInput)
		return;
	TerminalElements.currentInput.selectionStart = position;
	TerminalElements.currentInput.selectionEnd = position;
}

function TabProcessInTab() {
	const tabElement = document.querySelector('.tab-completion');
	if (!tabElement)
		return;
	TerminalConfigVariables.TabCompletionIndex = (TerminalConfigVariables.TabCompletionIndex + 1) % tabElement.children.length;
	for (let i = 0; i < tabElement.children.length; i++) {
		const item = tabElement.children[i] as HTMLElement;
		if (i === TerminalConfigVariables.TabCompletionIndex) {
			item.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
		} else {
			item.style.backgroundColor = 'transparent';
		}
	}
	return;
}

async function getListOfElementTabCompletion(command: string, cursorPosition: number): Promise<string[]> {
	let result: string[] | null = null;
	if (isFirstWord(command, cursorPosition))
		result = getStartWithList(command.trim(), TerminalCommand.commandAvailable.map(cmd => cmd.name));
	else
	{
		if (getFirstWord(command) === 'profile')
		{
			const startby = command.slice(0, cursorPosition).split(' ').pop() || '';
			if (startby === '')
				return [];
			result = await RequestBackendModule.getTenUsers(startby)
		}
		else
		{
			const path = command.slice(0, cursorPosition).split(' ').pop() || '';
			if (path.includes('/'))
			{
				let clearedPath =  path.slice(0, path.lastIndexOf('/') + 1);
				let filePart = path.slice(path.lastIndexOf('/') + 1);
				if (!clearedPath.startsWith('/'))
					clearedPath = '/' + clearedPath;
				result = lsCommand(['ls', clearedPath], '', '').split('\n> ').filter(item => item !== '');
				if (filePart !== '')
					result = getStartWithList(filePart, result);
			}
			else
			{
				result = lsCommand(['ls'], '', '').split('\n> ').filter(item => item !== '');
				if (path !== '')
					result = getStartWithList(path, result);
			}
		}
	}
	return result;
}

//---------------------------------------------------------------------------------- CASE ---------------------------------------------------------------------

async function exec(command: string) {
	const args = command.match(/"[^"]*"|'[^']*'|\S+/g) || [];
	for (let i = 0; i < args.length; i++) {
		if (!checkArgs(args[i])) {
			return `Erreur de syntaxe dans l'argument : ${args[i]}`;
		}
		args[i] = args[i].replace(/^['"]|['"]$/g, '');
	}

	if (args.length === 0 || args[0] === '') {
		return '';
	}

	for (let i = 0; i < TerminalCommand.commandAvailable.length; i++) {
		if (args[0] === TerminalCommand.commandAvailable[i].name) {
			const result = await TerminalCommand.commandAvailable[i].launchCommand(args);
			if (result === undefined || result === null || result === '')
				return '';
			return '> ' + result;
		}
	}
	return `> Unknown command: ${args[0]}`;
}

async function getInputCase(command: string)
{
	let result = '';
	if (!TerminalElements.currentInput || !TerminalElements.output)
		return;
	if (TerminalConfigVariables.isWaitingInput) {
		if (TerminalConfigVariables.InputIncomming >= 0) {
			TerminalConfigVariables.InputResult.push(command.slice(TerminalPromptAndEnv.promptText.length));
			TerminalConfigVariables.InputIncomming--;
		}
	}
	if (TerminalConfigVariables.isHidden)
		command = TerminalPromptAndEnv.promptText + '*'.repeat(command.length - TerminalPromptAndEnv.promptText.length);
	if (TerminalConfigVariables.isWaitingInput && TerminalConfigVariables.InputIncomming == 0 && TerminalConfigVariables.InputFunction) {
		result = await TerminalConfigVariables.InputFunction(TerminalConfigVariables.InputResult);
		TerminalConfigVariables.isWaitingInput = false;
		TerminalConfigVariables.InputFunction = null;
	}
	TerminalElements.output.textContent += command + '\n';
	if (TerminalConfigVariables.isWaitingInput && TerminalConfigVariables.InputIncomming >= 0)
		TerminalPromptAndEnv.promptText = TerminalConfigVariables.InputArgs[TerminalConfigVariables.InputArgs.length - TerminalConfigVariables.InputIncomming] + ': ';
	if (TerminalConfigVariables.InputIncomming === 0 && !TerminalConfigVariables.isWaitingInput)
		TerminalPromptAndEnv.promptText = TerminalPromptAndEnv.backUpPromptText;
	if (result && result != '')
		WriteOnTerminal.displayOnTerminal(result, false);
	resetInput();
}

function insertIntoCurrentInput(completion: string): void {
	if (!TerminalElements.currentInput)
		return;
	const full = TerminalElements.currentInput.value;
	const cursor = TerminalElements.currentInput.selectionStart ?? full.length;
	const cmdAfterPrompt = full.slice(TerminalPromptAndEnv.promptText.length);
	const cursorRel = Math.max(0, cursor - TerminalPromptAndEnv.promptText.length);
	const cmdBeforeCursor = cmdAfterPrompt.slice(0, cursorRel);
	const lastSpace = cmdBeforeCursor.lastIndexOf(' ');
	const lastSlash = cmdBeforeCursor.lastIndexOf('/');
	const tokenStartRel = Math.max(lastSpace + 1, lastSlash + 1);

	const absStart = TerminalPromptAndEnv.promptText.length + tokenStartRel;
	const absEnd = TerminalPromptAndEnv.promptText.length + cursorRel;
	TerminalElements.currentInput.value = full.slice(0, absStart) + completion + full.slice(absEnd);
	updateCursorPosition(absStart + completion.length);
}

function TabProcessInEnter() {
	const tabElement = document.getElementById('tab-completion');
	if (tabElement) {
		TerminalElements.terminal?.removeChild(tabElement);
	}
	if (tabElement && TerminalElements.currentInput) {
		const selectedItem = tabElement.children[TerminalConfigVariables.TabCompletionIndex] as HTMLElement;
		if (selectedItem) {
			const completionText = selectedItem.textContent?.slice(2) || '';
			insertIntoCurrentInput(completionText);
		}
	}
	resize();
	TerminalConfigVariables.isTabInProcess = false;
	TerminalConfigVariables.TabCompletionIndex = -1;
	return;
}

async function enterCase() {
	if (!TerminalElements.currentInput || !TerminalElements.output)
		return;
	if (TerminalConfigVariables.isTabInProcess)
		return TabProcessInEnter();
	let command = TerminalElements.currentInput.value;
	let changeHidden = false;
	if (TerminalUtils.countChar('\f') > TerminalConfigVariables.maxOutputLines) {
		TerminalElements.output.textContent = TerminalElements.output.textContent.slice(TerminalElements.output.textContent.indexOf('\f') + 1);
	}
	if (TerminalConfigVariables.isHidden)
	{
		command = TerminalPromptAndEnv.promptText + TerminalConfigVariables.HiddenContent;
		TerminalConfigVariables.HiddenContent = '';
		changeHidden = true;
	}
	if (TerminalConfigVariables.isWaitingInput)
	{
		getInputCase(command);
		if (TerminalConfigVariables.isWaitingInput && TerminalConfigVariables.WaitingHidden.includes(TerminalConfigVariables.InputArgs.length - TerminalConfigVariables.InputIncomming + 1))
			TerminalConfigVariables.isHidden = true;
		if (changeHidden)
			TerminalConfigVariables.isHidden = false;
		return;
	}
	updateCurrentHistory(command.slice(TerminalPromptAndEnv.promptText.length));
	const result = await exec(command.slice(TerminalPromptAndEnv.promptText.length));
	if (TerminalConfigVariables.isHidden)
		command = TerminalPromptAndEnv.promptText + '*'.repeat(command.length - TerminalPromptAndEnv.promptText.length);
	if (result != '')
	{
		TerminalElements.output.textContent += command + '\n';
		TerminalElements.output.textContent += result + '\f' + '\n';
	}
	else if (result === '' && command.slice(TerminalPromptAndEnv.promptText.length).trim() === 'clear')
		TerminalElements.output.textContent += '';
	else
		TerminalElements.output.textContent += command + '\f' + '\n';
	if (TerminalConfigVariables.isWaitingInput)
		TerminalPromptAndEnv.promptText = TerminalConfigVariables.InputArgs[TerminalConfigVariables.InputArgs.length - TerminalConfigVariables.InputIncomming] + ': ';
	resetInput();
	if (changeHidden)
		TerminalConfigVariables.isHidden = false;
	if (TerminalElements.terminal) {
		TerminalElements.terminal.scrollTop = TerminalElements.terminal.scrollHeight;
	}
}

function clearOutput() {
	if (!TerminalElements.output)
		return;

	TerminalElements.output.textContent = '';
}

function sigintCase() {
	if (!TerminalElements.currentInput || !TerminalElements.output)
		return;
	if (TerminalUtils.countChar('\f') > TerminalConfigVariables.maxOutputLines) {
		TerminalElements.output.textContent = TerminalElements.output.textContent.slice(TerminalElements.output.textContent.indexOf('\f') + 1);
	}
	TerminalElements.output.textContent += TerminalElements.currentInput.value + '^C\n' + '\f';
	if (TerminalConfigVariables.isWaitingInput) {
		TerminalConfigVariables.isWaitingInput = false;
		TerminalConfigVariables.InputIncomming = 0;
		TerminalConfigVariables.InputArgs = [];
		TerminalConfigVariables.InputResult = [];
		TerminalConfigVariables.InputFunction = null;
		TerminalConfigVariables.isHidden = false;
		TerminalPromptAndEnv.promptText = TerminalPromptAndEnv.backUpPromptText;
	}
	resetInput();
}

function cursorLeft() {
	if (!TerminalElements.currentInput)
		return;

	const cursorPosition = TerminalElements.currentInput.selectionStart;
	if (cursorPosition && cursorPosition > TerminalPromptAndEnv.promptText.length) {
		updateCursorPosition(cursorPosition - 1);
	}
}

function cursorRight() {
	if (!TerminalElements.currentInput)
		return;

	const cursorEndPosition = TerminalElements.currentInput.selectionEnd;
	if (cursorEndPosition && cursorEndPosition < TerminalElements.currentInput.value.length) {
		updateCursorPosition(cursorEndPosition + 1)
	}
}

function backspaceCase() {
	if (TerminalElements.currentInput && TerminalElements.currentInput.value !== null) {
		if (TerminalConfigVariables.isHidden && TerminalElements.currentInput.selectionStart > TerminalPromptAndEnv.promptText.length) {
			const cursorPosition = TerminalElements.currentInput.selectionStart;
			TerminalElements.currentInput.value = TerminalElements.currentInput.value.slice(0, cursorPosition - 1) + TerminalElements.currentInput.value.slice(cursorPosition);
			TerminalConfigVariables.HiddenContent = TerminalConfigVariables.HiddenContent.slice(0, cursorPosition - TerminalPromptAndEnv.promptText.length - 1) + TerminalConfigVariables.HiddenContent.slice(cursorPosition - TerminalPromptAndEnv.promptText.length);
			TerminalElements.currentInput.selectionStart = cursorPosition - 1;
			TerminalElements.currentInput.selectionEnd = cursorPosition - 1;
			resize();
		}
		else if (TerminalElements.currentInput.value.length > TerminalPromptAndEnv.promptText.length && TerminalElements.currentInput.selectionStart > TerminalPromptAndEnv.promptText.length) {
			const cursorPosition = TerminalElements.currentInput.selectionStart;
			TerminalElements.currentInput.value = TerminalElements.currentInput.value.slice(0, cursorPosition - 1) + TerminalElements.currentInput.value.slice(cursorPosition);
			TerminalElements.currentInput.selectionStart = cursorPosition - 1;
			TerminalElements.currentInput.selectionEnd = cursorPosition - 1;
			resize();
		}
	}
}

function defaultCase(event: KeyboardEvent) {
	if (TerminalElements.currentInput && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
		const cursorPosition = TerminalElements.currentInput.selectionStart;
		if (!TerminalConfigVariables.isHidden)
			TerminalElements.currentInput.value = TerminalElements.currentInput.value.slice(0, cursorPosition) + event.key + TerminalElements.currentInput.value.slice(cursorPosition);
		else
		{
			TerminalElements.currentInput.value = TerminalElements.currentInput.value.slice(0, cursorPosition) + '*' + TerminalElements.currentInput.value.slice(cursorPosition);
			TerminalConfigVariables.HiddenContent = TerminalConfigVariables.HiddenContent.slice(0, cursorPosition - TerminalPromptAndEnv.promptText.length) + event.key + TerminalConfigVariables.HiddenContent.slice(cursorPosition - TerminalPromptAndEnv.promptText.length);
		}
		TerminalElements.currentInput.selectionStart = cursorPosition + 1;
		TerminalElements.currentInput.selectionEnd = cursorPosition + 1;
		resize();
	}
}

function ArrowUpCase() {
	if (!TerminalElements.currentInput || TerminalCommand.commandHistory.length === 0 || TerminalCommand.indexCommandHistory === -1 || TerminalConfigVariables.isWaitingInput)
		return;
	if (TerminalCommand.indexCommandHistory === -2)
		TerminalCommand.indexCommandHistory = TerminalCommand.commandHistory.length - 1;
	else if (TerminalCommand.indexCommandHistory > 0)
		TerminalCommand.indexCommandHistory--;
	TerminalElements.currentInput.value = TerminalPromptAndEnv.promptText + TerminalCommand.commandHistory[TerminalCommand.indexCommandHistory];
	resize();
}

function ArrowDownCase() {
	if (!TerminalElements.currentInput || TerminalCommand.commandHistory.length === 0 || TerminalCommand.indexCommandHistory === -2 || TerminalConfigVariables.isWaitingInput)
		return;
	if (TerminalCommand.indexCommandHistory < TerminalCommand.commandHistory.length - 1) {
		TerminalCommand.indexCommandHistory++;
		TerminalElements.currentInput.value = TerminalPromptAndEnv.promptText + TerminalCommand.commandHistory[TerminalCommand.indexCommandHistory];
	}
}

async function tabCase() {
	if (!TerminalElements.currentInput || !TerminalElements.terminal)
		return;
	if (TerminalConfigVariables.isTabInProcess)
		return TabProcessInTab();
	const command = TerminalElements.currentInput.value.slice(TerminalPromptAndEnv.promptText.length);
	const cursorPosition = TerminalElements.currentInput.selectionStart - TerminalPromptAndEnv.promptText.length;
	let result = await getListOfElementTabCompletion(command, cursorPosition);
	if (!result || !result[0] || result[0].startsWith('ls:'))
		return;
	if (result.length === 0)
		return;
	if (result.length === 1) {
		insertIntoCurrentInput(result[0]);
		resize();
		return;
	}
	TerminalConfigVariables.isTabInProcess = true;

	const element = document.createElement('div');
	element.id = "tab-completion";
	element.className = "tab-completion bg-black text-green-400 text-sm flex gap-x-4 flex-wrap";
	for (let i = 0; i < result.length; i++) {
		const item = document.createElement('p');
		item.id = "tab-item-" + i;
		item.textContent = '> ' + result[i];
		element.appendChild(item);
	}
	TerminalElements.terminal.appendChild(element);
}

// -------------------------------------------------------------------- Event Listeners ---------------------------------------------------------------------

function setEventListeners() {
	if (!TerminalConfigVariables.isBuilded)
		return;

	if (TerminalElements.terminal) {
		TerminalElements.terminal.addEventListener('click', () => {
			if (TerminalElements.currentInput && !Modal.isModalActive && !ExtendedView.isExtendedViewIsActive) {
				TerminalElements.currentInput.focus();
			}
		});
		window.addEventListener('resize', (e) => {
			if (TerminalElements.currentInput)
				resize();
		});
		if (TerminalElements.currentInput) {
			TerminalElements.currentInput.addEventListener('mousedown', e => {
				e.preventDefault();
			});
		}
		if (TerminalElements.currentInput) {
			TerminalElements.currentInput.addEventListener('keydown', (event: KeyboardEvent) => {
				if (event.key === 'F11' || (event.ctrlKey && event.key.toLowerCase() === 'r')) {
					return;
				}
				event.preventDefault();
				if (TerminalConfigVariables.isPrintingAnimation)
					return;
				switch (true) {
					case (event.key === 'Enter'): enterCase(); break;
					case (event.ctrlKey && event.key.toLowerCase() === 'c'): sigintCase(); break;
					case (event.ctrlKey && event.key.toLowerCase() === 'l'): clearOutput(); break;
					case (event.key === 'ArrowUp'): ArrowUpCase(); break;
					case (event.key === 'ArrowDown'): ArrowDownCase(); break;
					case (event.key === 'Tab'): tabCase(); break;
					case (event.key === 'ArrowLeft'): cursorLeft(); break;
					case (event.key === 'ArrowRight'): cursorRight(); break;
					case (event.key === 'Backspace'): backspaceCase(); break;
					default: defaultCase(event); break;
				}
				if (TerminalElements.terminal) {
					TerminalElements.terminal.scrollTop = TerminalElements.terminal.scrollHeight;
				}
				if (event.key !== 'Tab' && TerminalConfigVariables.isTabInProcess) {
					clearTabCompletion();
				}
			});
		}
	}
}

// -------------------------------------------------------------------- Initialisation ---------------------------------------------------------------------
export namespace Terminal {
	export async function buildTerminal() : Promise<void> {
		if (TerminalConfigVariables.isBuilded)
			return;
		const success = await RequestBackendModule.loadUser();
		TerminalElements.terminal = document.createElement('div');
		TerminalElements.terminal.id = "terminal";
		TerminalElements.terminal.className = "terminal-font p-4 m-0 bg-black border-2 border-green-500 float-left text-green-400 text-sm overflow-y-auto focus:outline-none cursor-text relative scroll-smooth"
		TerminalElements.terminal.style.height = "calc(100vh)";
		TerminalElements.terminal.style.width = "100%";
		TerminalElements.terminal.tabIndex = 0;
		TerminalElements.terminal.setAttribute('role', 'region');
		TerminalElements.terminal.setAttribute('aria-label', 'Terminal interactif');
		TerminalElements.terminal.setAttribute('aria-readonly', 'true');
		TerminalElements.terminal.setAttribute('aria-hidden', 'false');

		TerminalElements.output = document.createElement('div');
		TerminalElements.output.id = "output";
		TerminalElements.output.className = "terminal-output";
		TerminalElements.terminal.appendChild(TerminalElements.output);
		
		TerminalElements.inputLine = document.createElement('div');
		TerminalElements.inputLine.id = "input-line";
		TerminalElements.inputLine.className = "input-line";

		TerminalElements.currentInput = document.createElement('textarea');
		TerminalElements.currentInput.spellcheck = false;
		TerminalElements.currentInput.autocomplete = "off";
		TerminalElements.currentInput.id = "current-input";
		TerminalElements.currentInput.className = "current-input";
		TerminalElements.currentInput.rows = 1;
		TerminalElements.currentInput.value = TerminalPromptAndEnv.promptText;
		TerminalElements.inputLine.appendChild(TerminalElements.currentInput);
		TerminalElements.terminal.appendChild(TerminalElements.inputLine);
		document.body.appendChild(TerminalElements.terminal);

		TerminalConfigVariables.isBuilded = true;
		setEventListeners();
		TerminalElements.currentInput.focus();
	}
}



function loginInput(args: string[]): string {
	if (TerminalUserManagement.isLoggedIn)
		return 'You are already logged in.';
	let argsTest = ["Identifier", "Password"];
	AskInput(argsTest, [2], RequestBackendModule.login);
	return '';
}

function registerInput(args: string[]): string {
	if (TerminalUserManagement.isLoggedIn)
		return 'You are already logged in.';
	let argsTest = ["Mail", "Username", "Password"];
	AskInput(argsTest, [3], RequestBackendModule.register);
	return '';
}

function AskInput(args: string[], hideInput: number[], fun: Function): string
{
	TerminalConfigVariables.InputIncomming = args.length;
	TerminalConfigVariables.WaitingHidden = hideInput;
	TerminalConfigVariables.isWaitingInput = true;
	TerminalConfigVariables.InputArgs = args;
	TerminalConfigVariables.InputResult = [];
	TerminalConfigVariables.InputFunction = fun;
	return '';
}



