export { };

import { ProfileBuilder } from './profile'
import { Modal } from './modal'
import { ExtProfileBuilder } from './extprofile'
import { ExtendedView } from './extendedView';

import { RequestBackendModule } from './terminalUtils/requestBackend';
import { WriteOnTerminal } from './terminalUtils/writeOnTerminal';
import { TerminalUtils } from './terminalUtils/terminalUtils';


import FileSystem from './filesystem.json';
import { HELP_MESSAGE_NOT_LOG, HELP_MESSAGE, HELP_SECONDARY,  CommandHelpMessage } from './terminalUtils/helpText/help';
import { io, Socket } from "socket.io-client";


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

export namespace PongUtils {
	export let isPongLaunched = false;
	export let pongGameInstance: HTMLDivElement | null = null;

	export function removePongDiv() {
		const pongContainer = document.getElementById('pong-game-container');
		if (pongContainer) {
			pongContainer.remove();
			isPongLaunched = false;
			pongGameInstance = null;
		}
	}
}

export namespace socketUtils {
	export let socket: Socket | null = null;
	export let userId: number | null = null;

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
		execute: (args: string[], description: string) => Promise<string> | string;

		constructor(name: string, description: string, execute: (args: string[], description: string) => Promise<string> | string) {
			this.name = name;
			this.description = description;
			this.execute = execute;
		}

		async launchCommand(args: string[]): Promise<string> {
			return await this.execute(args, this.description);
		}
	}

	export let commandAvailable =
	[
		new Command('echo', CommandHelpMessage.HELP_ECHO, echoCommand),
		new Command('help', 'Display this help message', helpCommand),
		new Command('profile', CommandHelpMessage.HELP_PROFILE, profileCommand),
		new Command('kill', 'Terminate a process', killCommand),
		new Command('clear', CommandHelpMessage.HELP_CLEAR, clearCommand),
		new Command('register', CommandHelpMessage.HELP_REGISTER, registerInput),
		new Command('cd', CommandHelpMessage.HELP_CD, cdCommand),
		new Command('ls', CommandHelpMessage.HELP_LS, lsCommand),
		new Command('pwd', CommandHelpMessage.HELP_PWD, pwdCommand),
		new Command('cat', CommandHelpMessage.HELP_CAT, catCommand),
		new Command('whoami', CommandHelpMessage.HELP_WHOAMI, whoamiCommand),
		new Command('login', CommandHelpMessage.HELP_LOGIN, loginInput),
		new Command('logout', CommandHelpMessage.HELP_LOGOUT, RequestBackendModule.logout),
		new Command('42' , CommandHelpMessage.HELP_42, OauthCommand),
		new Command('pong', CommandHelpMessage.HELP_PONG, pongCommand),
		new Command('rm', 'Remove files or directories', rmCommand),
        new Command('sudo', 'Execute a command with superuser privileges', sudoCommand)
	];
	export let commandHistory: string[] = [];
	export let indexCommandHistory = -2;
}




// ------------------------------------------------------------------------ Command ---------------------------------------------------------------------

function sudoCommand(): string {
	clearOutput();
	return CommandHelpMessage.SALAMANCA_ROLL;
}

function rmCommand(): string {
	clearOutput();
	return CommandHelpMessage.RICK_ROLL;
}

function pongCommand(args: string[], description: string): string {
	if (!TerminalElements.terminal)
		return 'Erreur lors du lancement du jeu Pong.';
	if (args.length > 1)
		return description;

	TerminalElements.terminal.insertAdjacentHTML('beforeend', `
	<div id="pong-game-container" class="fixed top-[50%] left-[50%] border border-green-500 bg-black flex flex-col -translate-x-[50%] -translate-y-[50%] gap-4 " style="width: 80vw">
		<pong-game id="pong-game" class="size-full"></pong-game>
	</div>
`);
	PongUtils.isPongLaunched = true;
	PongUtils.pongGameInstance = document.getElementById('pong-game') as HTMLDivElement;
	return 'Pong lancé !';
}


function OauthCommand(args: string[], description: string): string {
	const redirectUri = encodeURIComponent('https://localhost:8080/');
	const uri = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-add813989568aed927d34847da79446b327e2cce154f4c1313b970f9796da37c&redirect_uri=${redirectUri}&response_type=code`;

	if (TerminalUserManagement.isLoggedIn)
		return 'Vous êtes déjà connecté.';
	if (args.length != 1)
		return description;
	window.location.href = uri;
	return '';
}

function echoCommand(args: string[], description: string): string {
	let result = '';

	if (args[1] === '-h' || args[1] === '--help') {
		return description;
	}

	for (let i = 1; i < args.length; i++) {
		result += args[i] + ' ';
	}
	return result.trim();
}

function helpCommand(args: string[]): string {

	let result: string;

	if (!TerminalUserManagement.isLoggedIn)
		result = HELP_MESSAGE_NOT_LOG;
	else
	{
		if (args.length > 1 &&  args[1] === '2')
			result = HELP_SECONDARY;
		else
			result = HELP_MESSAGE;

	}
	const lines = result.split('\n');
	if (lines.length > 1) {
		result = lines[0] + '\n' + lines.slice(1).map(line => '> ' + line).join('\n');
	} else {
		result = lines[0];
	}
	return result;
}

function whoamiCommand(args: string[], description: string): string {
	if (args.length > 1)
		return description;
	return TerminalUserManagement.username;
}

async function profileCommand(args: string[], description: string): Promise<string> {
	let result: string = '';
	if (args.length > 2 || (args.length === 2 && args[1] === '--help' )) {
		return description;
	}
	if (ProfileBuilder.isActive || ExtProfileBuilder.isActive)
		return 'Le profil est déjà ouvert. Tapez "kill profile" pour le fermer.';
	if (args.length === 1)
		result = await ProfileBuilder.buildProfile('');
	else
	{
		await ExtProfileBuilder.buildExtProfile(args[1]);
		result = 'Profil ouvert. Tapez "kill profile" pour le fermer.';
	}
	return result;
}

function killCommand(args: string[], description: string): string {
	if (args.length !== 2)
		return description;
	if (args[1] === 'profile' && ProfileBuilder.isActive) {
		ProfileBuilder.removeProfile();
		return 'kill profile';
	}
	if (args[1] === 'profile' && ExtProfileBuilder.isActive) {
		ExtProfileBuilder.removeExtProfile();
		return 'kill profile';
	}
	if (args[1].toLowerCase() === 'me') {
		return `Non, je t'aime trop pour te laisser partir si facilement.`;
	}

	return `Aucun processus de ce type : ${args[1]}`;
}

function clearCommand(args: string[], description: string): string
{
	if (args.length > 1)
		return description
	clearOutput();
	return ''
}

function cdCommand(args: string[], description: string): string {
	if (args.length !== 2) {
		TerminalFileSystem.currentDirectory = '/';
		TerminalUtils.updatePromptText(TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ ");
		return '';
	}
	if (args[1] === '--help') {
		return description;
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
		return `cd : aucun fichier ou dossier de ce type : ${targetPath}`;
	}
	TerminalFileSystem.currentDirectory = targetPath;
	TerminalUtils.updatePromptText(TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ ");
	return '';
}

function lsCommand(args: string[], description: string): string {
	let node: Node | null;
	let targetPath: string;

	if (args.length > 1 && args[1] === '--help')
		return description;
	if (args.length === 1) {
		node = getNode(TerminalFileSystem.currentDirectory);
		targetPath = TerminalFileSystem.currentDirectory;
	}
	else if (args.length === 2) {
		targetPath = normalizePath(TerminalFileSystem.currentDirectory + '/' + args[1]);
		node = getNode(targetPath);
	}
	else 
		return description;
	if (!node || node.type !== 'directory') {
		return `ls : impossible d'accéder à '${targetPath}' : Aucun dossier de ce type`;
	}
	return node.children.map(child => (child.type === 'directory' ? child.name + '/' : child.name)).join('\n> ');
}

function pwdCommand(args: string[], description: string): string {
	if (args.length > 1)
		return description;
	return TerminalFileSystem.currentDirectory;
}

function catCommand(args: string[], description: string): string {
	if (args.length !== 2) {
		return description;
	}
	const targetPath = normalizePath(TerminalFileSystem.currentDirectory + '/' + args[1]);
	const fileNode = getNode(targetPath);
	if (!fileNode || fileNode.type !== 'file') {
		return `cat : ${args[1]} : Aucun fichier de ce type`;
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
				result = lsCommand(['ls', clearedPath], '').split('\n> ').filter(item => item !== '');
				if (filePart !== '')
					result = getStartWithList(filePart, result);
			}
			else
			{
				result = lsCommand(['ls'], '').split('\n> ').filter(item => item !== '');
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
	return `> Commande inconnue : ${args[0]}`;
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
			if (PongUtils.isPongLaunched)
			{
				PongUtils.pongGameInstance?.focus();
				return;
			}
			if (TerminalElements.currentInput && !Modal.isModalActive && !ExtendedView.isExtendedViewIsActive)
				TerminalElements.currentInput.focus();
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
				{
					WriteOnTerminal.skipAnimation = true;
					if (event.key !== 'Enter')
						return;
				}
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
		await RequestBackendModule.loadUser();
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
		return 'Vous êtes déjà connecté.';
	let argsTest = ["Identifiant", "Mot de passe"];
	AskInput(argsTest, [2], RequestBackendModule.login);
	return '';
}

function registerInput(args: string[], description: string): string {
	if (TerminalUserManagement.isLoggedIn)
		return 'Vous êtes déjà connecté.';
	if (args.length != 1)
		return description;
	let argsTest = ["Mail", "Nom d'utilisateur", "Mot de passe"];
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



