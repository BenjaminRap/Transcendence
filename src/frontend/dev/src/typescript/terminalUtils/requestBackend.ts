import { TerminalUtils } from "./terminalUtils";
import { WriteOnTerminal } from "./writeOnTerminal";
import { TerminalFileSystem } from "../terminal";



export namespace RequestBackendModule {
	export var isLoggedIn = false;
	export var username = 'usah';
	
	export async function register(args: string[]): Promise<string> 
	{
		try {
			const response = await fetch('http://localhost:8181/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: args[1],
					password: args[2],
					email: args[0]
				})
			});
			const data = await response.json();
			if (data.success) {
				document.cookie = `accessToken=${data.tokens.accessToken}; path=/;`;
				document.cookie = `refreshToken=${data.tokens.refreshToken}; path=/;`;
				await loadUser();
				return 'Registration successful!';
			} else {
				let message = data.message || "Unknown error";
				return 'Login failed: ' + message;
			}
		} catch (error) {
			console.error("Error:", error);
			return 'Login failed due to an error.';
		}
	}

	export async function login(args: string[]): Promise<string> {
		try {
			const response = await fetch('http://localhost:8181/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					identifier: args[0],
					password: args[1],
				})
			});
			const data = await response.json();
			if (data.success) {
				document.cookie = `accessToken=${data.tokens.accessToken}; path=/;`;
				document.cookie = `refreshToken=${data.tokens.refreshToken}; path=/;`;
				await loadUser();
				return 'Login successful!';
			} else {
				let message = data.message || "Unknown error";
				return 'Login failed: ' + message;
			}
		} catch (error) {
			console.error("Error:", error);
			return 'Login failed due to an error.';
		}
	}

	export async function loadUser(): Promise<boolean> {
		const token = TerminalUtils.getCookie('accessToken') || '';
		if (token === '') {
			return false;
		}
		try {
			const response = await fetch('http://localhost:8181/suscriber/profile', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token
				},
			});
			const data = await response.json();
			if (data.success) {
				username = data.user.username;
				TerminalUtils.updatePromptText( username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ " );
				isLoggedIn = true;
				return true;
			}
			if (data.message === 'Token expired') {
				const refreshed = await tryRefreshToken();
				if (!refreshed) {
					WriteOnTerminal.printErrorOnTerminal("Please log in.");
					return false;
				}
				return await loadUser();
			}
			return false;
		} catch (error) {
			console.error("Error:", error);
			return false;
		}
	}

	export async function tryRefreshToken() : Promise<boolean>
	{
		console.log("Trying to refresh token...");
		const token =  TerminalUtils.getCookie('refreshToken') || '';
		if (token === '') {
			return false;
		}
		try {
			const response = await fetch('http://localhost:8181/auth/refresh', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token
				},
			});
			const data = await response.json();
			if (data.success) {
				document.cookie = `accessToken=${data.tokens.accessToken}; path=/;`;
				document.cookie = `refreshToken=${data.tokens.refreshToken}; path=/;`;
				return true;
			}
			else
				return false;
		} catch (error) {
			console.error("Error:", error);
			return false;
		}
	}

	export function logout(): string
	{
		if (!isLoggedIn)
			return 'You are not logged in.';
		document.cookie = 'accessToken=; path=/;';
		document.cookie = 'refreshToken=; path=/;';
		isLoggedIn = false;
		username = 'usah';
		TerminalUtils.updatePromptText( username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ " );
		return 'Logged out successfully.';
	}
}