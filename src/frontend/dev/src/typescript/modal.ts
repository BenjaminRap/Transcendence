import { TerminalUtils } from './terminal.ts'


export namespace Modal { 
	export var isModalActive = false;

	export function makeModal(args: string, exec: Function) {
		if (isModalActive)
			return;
		const modal = document.createElement('div');
		modal.className = "fixed top-[50%] left-[50%] border p-4 border-green-500 bg-black z-2 flex flex-col -translate-x-[50%] -translate-y-[50%] gap-4 w-[20%]";
		modal.id = "modal";
		const container = document.createElement('div');
		container.className = "container";
		const p = document.createElement('p');
		p.className = "terminal-font p-1";
		p.textContent = args;
		const textarea = document.createElement('input');
		textarea.type = "text"; // File pour fichier mais CSS a voir
		textarea.id = "nameInput";
		textarea.placeholder = "Shadow-01";
		textarea.maxLength = 20;
		textarea.spellcheck = false;
		textarea.autocomplete = "off";
		// textarea.rows = 1;
		textarea.className = "terminal-font border-green-500 border-2 resize-none w-full outline-0 p-2 h-auto overflow-y-hidden";
		container.appendChild(p);
		container.appendChild(textarea);
		modal.appendChild(container);
		const changeNameButton = document.createElement('button');
		changeNameButton.id = "changeNameButton";
		changeNameButton.className = "terminal-font border-green-500 border-2 w-full p-2 hover:underline hover:underline-offset-2";
		changeNameButton.textContent = "Change";
		changeNameButton.addEventListener('click', () => {
			exec(textarea.value);
		});

		modal.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				exec(textarea.value);
			}
			else if (event.key === 'Escape' || event.key ==='c' && event.ctrlKey) {
				event.preventDefault();
				closeModal();
				TerminalUtils.displayOnTerminal("^C");
			}
		});


		modal.appendChild(changeNameButton);
		const closeButton = document.createElement('button');
		closeButton.className = "terminal-font absolute top-0 right-1 hover:underline hover:underline-offset-2 p-1";
		closeButton.textContent = "×";


		setTimeout(() => {
			const terminal = document.getElementById('terminal');
			terminal?.addEventListener('click', handleOutsideClick);
		}, 0);

		closeButton.addEventListener('click', closeModal);
		modal.appendChild(closeButton);
		const terminal = document.getElementById('terminal');
		if (terminal) {
			terminal.appendChild(modal);
		}
		else {
			console.error("Terminal not found");
			return;
		}

		isModalActive = true;
		textarea.focus();
	}

	export function closeModal() {
		const modal = document.getElementById('modal');
		const terminal = document.getElementById('terminal');
		const inputLine = document.getElementById('current-input');
		if (!modal || !terminal || !inputLine)
			return;
		if (modal.parentNode) {
			modal.parentNode.removeChild(modal);
			isModalActive = false;
			terminal?.removeEventListener('click', handleOutsideClick);
			inputLine.focus();
		}
	};

	export function handleOutsideClick(event: MouseEvent) {
		const modal = document.getElementById('modal');
		const terminal = document.getElementById('terminal');
		if (!modal || !terminal)
			return;
		if (!modal.contains(event.target as Node)) {
			closeModal();
		}
		else
			event.stopPropagation();
	};
}
