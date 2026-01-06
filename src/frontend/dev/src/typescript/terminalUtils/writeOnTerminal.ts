import { TerminalConfigVariables, TerminalElements, TerminalPromptAndEnv } from "../terminal";
import { TerminalUtils } from "./terminalUtils";



export namespace WriteOnTerminal {
	export function displayOnTerminal(text: string, showPrompt: boolean) {
		if (!TerminalElements.output)
			return;
		if (TerminalUtils.countChar('\f') > TerminalConfigVariables.maxOutputLines) {
			TerminalElements.output.textContent = TerminalElements.output.textContent.slice(TerminalElements.output.textContent.indexOf('\f') + 1);
		}
		if (showPrompt)
			TerminalElements.output.textContent += TerminalPromptAndEnv.promptText + text + '\f' + '\n';
		else
		TerminalElements.output.textContent += text + '\f' + '\n';
		if (TerminalElements.terminal) {
			TerminalElements.terminal.scrollTop = TerminalElements.terminal.scrollHeight;
		}
	}

	export function printErrorOnTerminal(text: string) {
		if (!TerminalElements.output)
			return;
		if (TerminalUtils.countChar('\f') > TerminalConfigVariables.maxOutputLines) {
			TerminalElements.output.textContent = TerminalElements.output.textContent.slice(TerminalElements.output.textContent.indexOf('\f') + 1);
		}
		TerminalElements.output.textContent += '> ' + text + '\f' + '\n';
		if (TerminalElements.terminal) {
			TerminalElements.terminal.scrollTop = TerminalElements.terminal.scrollHeight;
		}
	}

	export function notification(args: string[]) {
		let title: string | null = null;
		let message: string;
		if (args.length >= 2) {
			title = args[0];
			message = args.slice(1).join(' ');
		} else {
			message = args.slice(0).join(' ');
		}
		WriteOnTerminal.displayOnTerminal("Wall :", false);
		
		const lines = message.split('\n');
		let maxLen = Math.max(...lines.map(l => l.length));
		if (title)
			maxLen = Math.max(maxLen, title.length);

		const innerWidth = maxLen + 2;
		if (title) {
			const titleStr = ` ${title} `;
			const left = Math.floor((innerWidth - titleStr.length) / 2);
			const right = innerWidth - titleStr.length - left;
			WriteOnTerminal.displayOnTerminal('╭' + '─'.repeat(left) + titleStr + '─'.repeat(right) + '╮', false);
		} else {
			WriteOnTerminal.displayOnTerminal('╭' + '─'.repeat(innerWidth) + '╮', false);
		}

		for (const line of lines) {
			const padded = line.padEnd(maxLen, ' ');
			WriteOnTerminal.displayOnTerminal('│ ' + padded + ' │', false);
		}
		WriteOnTerminal.displayOnTerminal('╰' + '─'.repeat(innerWidth) + '╯', false);
	}

	export let skipAnimation = false;

	export async function printWithAnimation(text: string, delay: number) {
		TerminalConfigVariables.isPrintingAnimation = true;
		
		
		return new Promise<void>((resolve) => {
			if (!TerminalElements.output)
				return;

			let i = 0;
			const iterationsPerChar = 3; 
			let currentIteration = 0;
			const randomChars = "@#$%^&*{}[]()-_=+<>?/|\\`~";
			
			if (skipAnimation) {
				TerminalElements.output.textContent += text + '\n';
				TerminalConfigVariables.isPrintingAnimation = false;
				resolve();
				return;
			}

			const interval = setInterval(() => {
				if (skipAnimation) {
					clearInterval(interval);
					if (!TerminalElements.output)
						return;
					if (currentIteration > 0 && currentIteration < iterationsPerChar) {
						TerminalElements.output.textContent = TerminalElements.output.textContent.slice(0, -1);
					}
					TerminalElements.output.textContent += text.slice(i) + '\n';
					if (TerminalElements.terminal) {
						TerminalElements.terminal.scrollTop = TerminalElements.terminal.scrollHeight;
					}
					TerminalConfigVariables.isPrintingAnimation = false;
					resolve();
					return;
				}

				if (i >= text.length) {
					clearInterval(interval);
					if (TerminalElements.output)
						TerminalElements.output.textContent += '\n';
					TerminalConfigVariables.isPrintingAnimation = false;
					resolve();
					return;
				}
				const targetChar = text[i];
				if (targetChar === ' ') {
					if (TerminalElements.output)
						TerminalElements.output.textContent += targetChar;
					i++;
					currentIteration = 0;
					return;
				}
				if (currentIteration < iterationsPerChar) {
					const randomChar = randomChars[Math.floor(Math.random() * randomChars.length)];
					if (TerminalElements.output) {
						if (currentIteration > 0)
							TerminalElements.output.textContent = TerminalElements.output.textContent.slice(0, -1);
						TerminalElements.output.textContent += randomChar;
					}
					currentIteration++;
				} else {
					if (TerminalElements.output) {
						TerminalElements.output.textContent = TerminalElements.output.textContent.slice(0, -1);
						TerminalElements.output.textContent += targetChar;
					}
					i++;
					currentIteration = 0;
				}

				if (TerminalElements.terminal)
					TerminalElements.terminal.scrollTop = TerminalElements.terminal.scrollHeight;
			}, delay / 2);
		});
	}
}
