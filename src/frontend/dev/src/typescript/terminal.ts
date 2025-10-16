export { };

import { ProfileBuilder } from './profile.ts'
import { Modal } from './modal.ts'


let maxOutputLines = 100;
let promptText = "usah@terminal:~$ ";
let backUpPromptText = promptText;
let env = {
	'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
	'HOME': '/home/usa',
	'TERM': 'minishell'
};
let fileSystem = {
	'/': {
		'type': 'dir',
		'content': {
			'file1.txt': {
				'type': 'file',
				'content': 'This is the content of file1.txt'
			},
			'file2.txt': {
				'type': 'file',
				'content': 'This is the content of file2.txt'
			},
			'subdir': {
				'type': 'dir',
				'content': {
					'file3.txt': {
						'type': 'file',
						'content': 'This is the content of file3.txt in subdir'
					}
				}
			}
		}
	}
};

// HASH_MAP



class Command {
	name: string;
	description: string;
	usage: string;
	execute: (args: string[], description: string, usage: string) => string;

	constructor(name: string, description: string, usage: string, execute: (args: string[], description: string, usage: string) => string) {
		this.name = name;
		this.description = description;
		this.usage = usage;
		this.execute = execute;
	}

	launchCommand(args: string[]): string {
		return this.execute(args, this.description, this.usage);
	}
}

// const test = new Command('test', 'A test command', 'test [args]', (args: string[]) => {
// 	return 'Test command executed with args: ' + args.join(' ');
// });


let commandAvailable =
[
	new Command('echo', 'Display a line of text', 'echo [text]', echoCommand),
	new Command('help', 'Display this help message', 'help', helpCommand),
	new Command('profile', 'Display user profile', 'profile [username]', profileCommand),
	new Command('kill', 'Terminate a process', 'kill [process_name]', killCommand),
	new Command('clear', 'Clear the terminal screen', 'clear', clearCommand),
	new Command('modal', 'Create a modal dialog', 'modal [text]', modalCommand),
	new Command('test', 'Test command for input prompt', 'test [text]', teste),
];

let currentDirectory = '/';
let commandHistory: string[] = [];
let indexCommandHistory = -2;

let isBuilded = false;
let isProfileActive = false;
let isHidden = false;
let HiddenContent = '';


let terminal: HTMLDivElement | null = null;
let output: HTMLDivElement | null = null;
let inputLine: HTMLDivElement | null = null;
let currentInput: HTMLTextAreaElement | null = null;

let isWaitingInput = false;
let InputIncomming = 0;
let InputArgs: string[] = [];
let InputResult: string[] = [];
let WaitingHidden: number[] = [];
let InputFunction: Function | null = null;


// ------------------------------------------------------------------------ Command ---------------------------------------------------------------------

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
	let helpText = 'Available commands:\n';
	for (let i = 0; i < commandAvailable.length; i++) {
		helpText += `${commandAvailable[i].name}\n\n`;
	}
	return helpText;
}

function profileCommand(args: string[]): string {
	if (args.length > 2) {
		return 'Usage: profile to see your profile or profile [username] to see another user\'s profile.';
	}
	if (isProfileActive)
		return 'Profile is already open. Type "kill profile" to close it.';
	if (args.length === 1)
		ProfileBuilder.buildProfile('');
	else
		ProfileBuilder.buildProfile(args[1]);
	isProfileActive = true;
	return 'Profile is now open.';
}


function killCommand(args: string[]): string {
	if (args.length !== 2)
		return 'Usage: kill [process_name]';
	if (args[1] === 'profile' && isProfileActive) {
		ProfileBuilder.removeProfile();
		isProfileActive = false;
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
	Modal.makeModal(args.slice(1).join(' '), (text: string) => {
		console.log(`Modal input: ${text}`);
		Modal.closeModal();
	});
	return `Modal created with text: ${args.slice(1).join(' ')}`;
}



// ------------------------------------------------------------------------ Utilities ---------------------------------------------------------------------

function countChar(char: string): number {
	if (!output)
		return 0;
	const outputText = output.textContent;
	let count = 0;
	for (let i = 0; i < outputText.length; i++) {
		if (outputText[i] === char) {
			count++;
		}
	}
	return count;
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
	if (command == '' || isWaitingInput)
		return;	
	if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
		commandHistory.push(command);
	}
	if (commandHistory.length > 100) {
		commandHistory.shift();
	}
	indexCommandHistory = -2;
}


//---------------------------------------------------------------------------------- CASE ---------------------------------------------------------------------

// FIND --> DEBUG, remove later
function exec(command: string) {
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

	for (let i = 0; i < commandAvailable.length; i++) {
		if (args[0] === commandAvailable[i].name) {
			const result = commandAvailable[i].launchCommand(args);
			if (result === undefined || result === null || result === '')
				return '';
			return '> ' + result;
		}
	}
	return `> Unknown command: ${args[0]}`;
}

function resize() {
	if (!currentInput)
		return;
	currentInput.style.height = 'auto';
	currentInput.style.height = currentInput.scrollHeight + 'px';
}

function resetInput() {
	if (!currentInput)
		return;
	currentInput.value = promptText;
	resize();
}

function updateCursorPosition(position: number) {
	if (!currentInput)
		return;
	currentInput.selectionStart = position;
	currentInput.selectionEnd = position;
}



export namespace TerminalUtils {
	export function displayOnTerminal(text: string) {
		if (!output)
			return;
		if (countChar('\f') > maxOutputLines) {
			output.textContent = output.textContent.slice(output.textContent.indexOf('\f') + 1);
		}
		output.textContent += promptText+ text + '\n' + '\f';
		if (terminal) {
			terminal.scrollTop = terminal.scrollHeight;
		}
	}
	export function printErrorOnTerminal(text: string) {
		if (!output)
			return;
		if (countChar('\f') > maxOutputLines) {
			output.textContent = output.textContent.slice(output.textContent.indexOf('\f') + 1);
		}
		output.textContent += '> ' + text + '\n' + '\f';
		if (terminal) {
			terminal.scrollTop = terminal.scrollHeight;
		}
	}
}

function getInputCase(command: string)
{
	if (!currentInput || !output)
		return;
	if (isWaitingInput) {
		if (InputIncomming >= 0) {
			InputResult.push(command.slice(promptText.length));
			InputIncomming--;
		}
		if (InputIncomming == 0 && InputFunction) {
			InputFunction(InputResult);
			isWaitingInput = false;
			isHidden = false;
			InputFunction = null;
			promptText = backUpPromptText;
		}
	}
	if (isHidden)
		command = promptText + '*'.repeat(command.length - promptText.length);
	output.textContent += command + '\n';
	if (isWaitingInput && InputIncomming > 0)
		promptText = InputArgs[InputArgs.length - InputIncomming] + ': ';
	resetInput();
	updateCurrentHistory(command.slice(promptText.length));
}

function enterCase() {
	if (!currentInput || !output)
		return;
	let command = currentInput.value;
	let changeHidden = false;
	if (countChar('\f') > maxOutputLines) {
		output.textContent = output.textContent.slice(output.textContent.indexOf('\f') + 1);
	}
	if (isHidden)
	{
		command = promptText + HiddenContent;
		HiddenContent = '';
		changeHidden = true;
	}
	if (isWaitingInput)
	{
		getInputCase(command);
		if (isWaitingInput && WaitingHidden.includes(InputArgs.length - InputIncomming + 1))
			isHidden = true;
		if (changeHidden)
			isHidden = false;
		return;
	}
	
	const result = exec(command.slice(promptText.length));
	if (isHidden)
		command = promptText + '*'.repeat(command.length - promptText.length);
	if (result != '')
	{
		output.textContent += command + '\n';
		output.textContent += result + '\n' + '\f';
	}
	else if (result === '' && command.slice(promptText.length).trim() === 'clear')
		output.textContent += '\f';
	else
		output.textContent += command + '\n' + '\f';
	if (isWaitingInput)
		promptText = InputArgs[InputArgs.length - InputIncomming] + ': ';
	resetInput();
	if (changeHidden)
		isHidden = false;
	updateCurrentHistory(command.slice(promptText.length));
}

function clearOutput() {
	if (!output)
		return;

	output.textContent = '';
}

function sigintCase() {
	if (!currentInput || !output)
		return;
	if (countChar('\f') > maxOutputLines) {
		output.textContent = output.textContent.slice(output.textContent.indexOf('\f') + 1);
	}
	output.textContent += currentInput.value + '^C\n' + '\f';
	if (isWaitingInput) {
		isWaitingInput = false;
		InputIncomming = 0;
		InputArgs = [];
		InputResult = [];
		InputFunction = null;
		isHidden = false;
		promptText = backUpPromptText;
	}
	resetInput();
}

function cursorLeft() {
	if (!currentInput)
		return;

	const cursorPosition = currentInput.selectionStart;
	if (cursorPosition && cursorPosition > promptText.length) {
		updateCursorPosition(cursorPosition - 1);
	}
}

function cursorRight() {
	if (!currentInput)
		return;

	const cursorEndPosition = currentInput.selectionEnd;
	if (cursorEndPosition && cursorEndPosition < currentInput.value.length) {
		updateCursorPosition(cursorEndPosition + 1)
	}
}

function backspaceCase() {
	if (currentInput && currentInput.value !== null) {
		if (currentInput.value.length > promptText.length && currentInput.selectionStart > promptText.length) {
			const cursorPosition = currentInput.selectionStart;
			currentInput.value = currentInput.value.slice(0, cursorPosition - 1) + currentInput.value.slice(cursorPosition);
			currentInput.selectionStart = cursorPosition - 1;
			currentInput.selectionEnd = cursorPosition - 1;
			resize();
		}
	}
}

function defaultCase(event: KeyboardEvent) {
	if (currentInput && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
		const cursorPosition = currentInput.selectionStart;
		if (!isHidden)
			currentInput.value = currentInput.value.slice(0, cursorPosition) + event.key + currentInput.value.slice(cursorPosition);
		else
		{
			currentInput.value = currentInput.value.slice(0, cursorPosition) + '*' + currentInput.value.slice(cursorPosition);
			HiddenContent = HiddenContent.slice(0, cursorPosition - promptText.length) + event.key + HiddenContent.slice(cursorPosition - promptText.length);
		}
		currentInput.selectionStart = cursorPosition + 1;
		currentInput.selectionEnd = cursorPosition + 1;
		resize();
	}
}

function ArrowUpCase() {
	if (!currentInput || commandHistory.length === 0 || indexCommandHistory === -1 || isWaitingInput)
		return;
	if (indexCommandHistory === -2)
		indexCommandHistory = commandHistory.length - 1;
	else if (indexCommandHistory > 0)
		indexCommandHistory--;
	currentInput.value = promptText + commandHistory[indexCommandHistory];
	resize();
}

function ArrowDownCase() {
	if (!currentInput || commandHistory.length === 0 || indexCommandHistory === -2 || isWaitingInput)
		return;
	if (indexCommandHistory < commandHistory.length - 1) {
		indexCommandHistory++;
		currentInput.value = promptText + commandHistory[indexCommandHistory];
	}
}

// -------------------------------------------------------------------- Event Listeners ---------------------------------------------------------------------

function setEventListeners() {
	if (!isBuilded)
		return;

	if (terminal) {
		terminal.addEventListener('click', () => {
			if (currentInput && !Modal.isModalActive) {
				currentInput.focus();
			}
		});

		window.addEventListener('resize', (e) => {
			if (currentInput)
				resize();
		});

		if (currentInput) {
			currentInput.addEventListener('mousedown', e => {
				e.preventDefault();
			});
		}

		if (currentInput) {
			currentInput.addEventListener('keydown', (event: KeyboardEvent) => {
				if (event.key === 'F11' || (event.ctrlKey && event.key.toLowerCase() === 'r')) {
					return;
				}
				event.preventDefault();
				switch (true) {
					case (event.key === 'Enter'):
						enterCase();
						break;
					case (event.ctrlKey && event.key.toLowerCase() === 'c'):
						sigintCase();
						break;
					case (event.ctrlKey && event.key.toLowerCase() === 'l'):
						clearOutput();
						break;
					case (event.key === 'ArrowUp'):
						ArrowUpCase();
						break;
					case (event.key === 'ArrowDown'):
						ArrowDownCase();
						break;
					case (event.key === 'Tab'):
						console.log("Log : Tab");
						break;
					case (event.key === 'ArrowLeft'):
						cursorLeft();
						break
					case (event.key === 'ArrowRight'):
						cursorRight();
						break;
					case (event.key === 'Backspace'):
						backspaceCase();
						break;
					default:
						defaultCase(event);
						break;
				}
				if (terminal) {
					terminal.scrollTop = terminal.scrollHeight;
				}
			});
		}
	}
}


// -------------------------------------------------------------------- Initialisation ---------------------------------------------------------------------
export namespace Terminal {
	export function buildTerminal() {
		if (isBuilded)
			return;
		terminal = document.createElement('div');
		terminal.id = "terminal";
		terminal.className = "terminal-font p-4 m-0 bg-black border-2 border-green-500 float-left text-green-400 text-sm overflow-y-auto focus:outline-none cursor-text relative scroll-smooth"
		terminal.style.height = "calc(100vh)";
		terminal.style.width = "100%";
		terminal.tabIndex = 0;
		terminal.setAttribute('role', 'region');
		terminal.setAttribute('aria-label', 'Terminal interactif');
		terminal.setAttribute('aria-readonly', 'true');
		terminal.setAttribute('aria-hidden', 'false');

		output = document.createElement('div');
		output.id = "output";
		output.className = "terminal-output";
		terminal.appendChild(output);

		inputLine = document.createElement('div');
		inputLine.id = "input-line";
		inputLine.className = "input-line";

		currentInput = document.createElement('textarea');
		currentInput.spellcheck = false;
		currentInput.autocomplete = "off";
		currentInput.id = "current-input";
		currentInput.className = "current-input";
		currentInput.rows = 1;
		currentInput.value = promptText;
		inputLine.appendChild(currentInput);
		terminal.appendChild(inputLine);
		document.body.appendChild(terminal);

		isBuilded = true;
		setEventListeners();
		currentInput.focus();
	}
}

function testeeee(args: string[]): string {
	console.log("Test function called with args:", args);
	return 'Test command executed with args: ' + args.join(' ');
}

function teste(args: string[]): string {
	let argsTest = ["Test 1", "Test 2", "Test 3"];
	AskInput(argsTest, [2], testeeee);
	return '';
}

function AskInput(args: string[], hideInput: number[], fun: Function): string
{
	InputIncomming = args.length;
	WaitingHidden = hideInput;
	isWaitingInput = true;
	InputArgs = args;
	InputResult = [];
	InputFunction = fun;
	return '';
}