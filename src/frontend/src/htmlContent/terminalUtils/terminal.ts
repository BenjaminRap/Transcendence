export { };


var maxOutputLines = 100; 
var promptText = "usa@terminal:~$ ";

const currentInput = document.getElementById('current-input') as HTMLTextAreaElement | null;
const output = document.getElementById('output') as HTMLDivElement | null;
const terminal = document.getElementById('terminal') as HTMLDivElement | null;

if (currentInput) {
	currentInput.value = promptText;
}


// ------------------------------------------------------------------------ Utilities ---------------------------------------------------------------------

function countChar(char: string): number
{
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
// FIND --> DEBUG, remove later
function exec(command: string) {
	if (command === 'find') {
		let count = countChar('\f');
		return `${count}`
	}
	return `Commande : ${command} executée avec succès`;
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
	output.textContent += command + '\n';
	output.textContent += result + '\n' + '\f';
	resetInput();
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

function defaultCase(event : KeyboardEvent) {
	if (currentInput && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
		const cursorPosition = currentInput.selectionStart;
		currentInput.value = currentInput.value.slice(0, cursorPosition) + event.key + currentInput.value.slice(cursorPosition);
		currentInput.selectionStart = cursorPosition + 1;
		currentInput.selectionEnd = cursorPosition + 1;
		resize();
	}
}

// -------------------------------------------------------------------- Event Listeners ---------------------------------------------------------------------

if (terminal) {
	terminal.addEventListener('click', () => {
		if (currentInput) {
			currentInput.focus();
		}
	});
}

window.addEventListener('resize', (e) => {
	console.log("Log : Terminal resized", e);
	if (currentInput) {
		resize();
	}
});

if (currentInput) {
	currentInput.addEventListener('mousedown', e => {
		e.preventDefault();
	});
}

if (currentInput) {
	currentInput.addEventListener('keydown', (event: KeyboardEvent) => {
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
				console.log("Log : Arrow Up");
				break;
			case (event.key === 'ArrowDown'):
				console.log("Log : Arrow Down");
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
