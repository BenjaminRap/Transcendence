export { };

import { ProfileBuilder } from './profile.ts'

var maxOutputLines = 100;
var promptText = "usa@terminal:~$ ";
var env = {
	'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
	'HOME': '/home/usa',
	'TERM': 'minishell'
};
var fileSystem = {
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

var commandAvailable =
[
	{
		'name': 'echo',
		'description': 'Display a line of text',
		'usage': 'echo [text]',
		function: echoCommand
	},
	{
		'name': 'help',
		'description': 'Display this help message',
		'usage': 'help',
		function: helpCommand
	},
	{
		'name': 'profile',
		'description': 'Display user profile information',
		'usage': 'profile',
		function: profileCommand
	},
	{
		'name': 'clear',
		'description': 'Clear the terminal screen',
		'usage': 'clear',
		function: clearCommand
	},
	{
		'name': 'test',
		'description': 'Test command to resize terminal',
		'usage': 'test [size in %]',
		function: teste
	},
	{
		'name': 'kill',
		'description': 'Terminate a process',
		'usage': 'kill [process_name]',
		function: killCommand
	},
	{
		'name': 'modal',
		'description': 'Create a modal with text',
		'usage': 'modal [text]',
		function: modalCommand
	}
];

var currentDirectory = '/';
var commandHistory: string[] = [];
var indexCommandHistory = -2;

var isBuilded = false;
var isProfileActive = false;


let terminal: HTMLDivElement | null = null;
let output: HTMLDivElement | null = null;
let inputLine: HTMLDivElement | null = null;
let currentInput: HTMLTextAreaElement | null = null;

// ------------------------------------------------------------------------ Command ---------------------------------------------------------------------

function echoCommand(args: string[]): string {
	var result = '';

	for (let i = 1; i < args.length; i++) {
		result += args[i] + ' ';
	}
	return result.trim();
}

function helpCommand(): string {
	let helpText = 'Available commands:\n';
	for (let i = 0; i < commandAvailable.length; i++) {
		helpText += `${commandAvailable[i].name}: ${commandAvailable[i].description}\nUsage: ${commandAvailable[i].usage}\n\n`;
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
	makeModal(args.slice(1).join(' '));
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
	if (command == '')
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
			const result = commandAvailable[i].function(args);
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

function enterCase() {
	if (!currentInput || !output)
		return;
	const command = currentInput.value;
	if (countChar('\f') > maxOutputLines) {
		output.textContent = output.textContent.slice(output.textContent.indexOf('\f') + 1);
	}
	const result = exec(command.slice(promptText.length));
	if (result != '')
	{
		output.textContent += command + '\n';
		output.textContent += result + '\n' + '\f';
	}
	else if (result === '' && command.slice(promptText.length).trim() === 'clear')
		output.textContent += '\f';
	else
		output.textContent += command + '\n' + '\f';
	resetInput();
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
		currentInput.value = currentInput.value.slice(0, cursorPosition) + event.key + currentInput.value.slice(cursorPosition);
		currentInput.selectionStart = cursorPosition + 1;
		currentInput.selectionEnd = cursorPosition + 1;
		resize();
	}
}

function ArrowUpCase() {
	if (!currentInput || commandHistory.length === 0 || indexCommandHistory === -1)
		return;
	if (indexCommandHistory === -2)
		indexCommandHistory = commandHistory.length - 1;
	else if (indexCommandHistory > 0)
		indexCommandHistory--;
	currentInput.value = promptText + commandHistory[indexCommandHistory];
	resize();
}

function ArrowDownCase() {
	if (!currentInput || commandHistory.length === 0 || indexCommandHistory === -2)
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
			if (currentInput) {
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
	}
}


/*

  <!-- <div class="absolute top-[50%] left-[50%] border p-4 border-green-500 bg-black z-2 flex flex-col -translate-x-[50%] -translate-y-[50%] gap-4 w-[20%]">
    <div class="container">
      <p class="terminal-font p-1">Change Name :</p>
      <textarea id="nameInput" placeholder="Shadow-01" maxlength="20" spellcheck="false" autocomplete="off" rows="1" class="terminal-font border-green-500 border-2 resize-none w-full outline-0 p-2 h-auto overflow-y-hidden"></textarea>
    </div>
    <button id="changeNameButton" class="terminal-font border-green-500 border-2 w-full p-2 hover:underline hover:underline-offset-2">Change</button>
    <button id="changeNameButton" class="terminal-font absolute top-0 right-1 hover:underline hover:underline-offset-2 p-1">x</button>
  </div> -->

*/

function makeModal(args: string)
{
	const modal = document.createElement('div');
	modal.className = "absolute top-[50%] left-[50%] border p-4 border-green-500 bg-black z-2 flex flex-col -translate-x-[50%] -translate-y-[50%] gap-4 w-[20%]";
	modal.id = "modal";
	const container = document.createElement('div');
	container.className = "container";
	const p = document.createElement('p');
	p.className = "terminal-font p-1";
	p.textContent = args;
	const textarea = document.createElement('textarea');
	textarea.id = "nameInput";
	textarea.placeholder = "Shadow-01";
	textarea.maxLength = 20;
	textarea.spellcheck = false;
	textarea.autocomplete = "off";
	textarea.rows = 1;
	textarea.className = "terminal-font border-green-500 border-2 resize-none w-full outline-0 p-2 h-auto overflow-y-hidden";
	container.appendChild(p);
	container.appendChild(textarea);
	modal.appendChild(container);
	const changeNameButton = document.createElement('button');
	changeNameButton.id = "changeNameButton";
	changeNameButton.className = "terminal-font border-green-500 border-2 w-full p-2 hover:underline hover:underline-offset-2";
	changeNameButton.textContent = "Change";
	modal.appendChild(changeNameButton);
	const closeButton = document.createElement('button');
	closeButton.className = "terminal-font absolute top-0 right-1 hover:underline hover:underline-offset-2 p-1";
	closeButton.textContent = "x";
	closeButton.addEventListener('click', () => {
		if (modal.parentNode) {
			modal.parentNode.removeChild(modal);
		}
	});
	modal.appendChild(closeButton);
	const terminal = document.getElementById('terminal');
	if (terminal) {
		terminal.appendChild(modal);
	}
	else {
		console.error("Terminal not found");
		return;
	}
}

function teste(args: string[]): string {
	const test = document.getElementById('terminal');
	if (!test)
		return '';
	test.style.width = args[1] + "%";
	return "Terminal resized to " + args[1] + "%";
}