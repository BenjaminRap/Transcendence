import { TerminalPromptAndEnv } from "../terminal";
import { TerminalElements } from "../terminal";


export namespace TerminalUtils {
	export function getCookie(name: string): string | undefined {
		const matches = document.cookie.match(
		new RegExp(
			"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		)
		);
		return matches ? decodeURIComponent(matches[1]) : undefined;
	}

	export function updatePromptText(newPrompt: string) {
		TerminalPromptAndEnv.promptText = newPrompt;
		TerminalPromptAndEnv.backUpPromptText = newPrompt;
		if (!TerminalElements.currentInput)
			return;
		TerminalElements.currentInput.value = TerminalPromptAndEnv.promptText;
	}

	export function countChar(char: string): number {
		if (!TerminalElements.output)
			return 0;
		const outputText = TerminalElements.output.textContent;
		let count = 0;
		for (let i = 0; i < outputText.length; i++) {
			if (outputText[i] === char) {
				count++;
			}
		}
		return count;
	}
}
