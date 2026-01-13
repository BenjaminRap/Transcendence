import { TerminalUtils } from "./terminalUtils";
import { WriteOnTerminal } from "./writeOnTerminal";
import { TerminalFileSystem, TerminalUserManagement } from "../terminal";
import { CommandHelpMessage } from './helpText/help';
import { io } from "socket.io-client";
import { socketUtils } from '../terminal'


export namespace RequestBackendModule {
	export var isLoggedIn = false;
	
	export async function register(args: string[]): Promise<string> 
	{
		try {
			const response = await fetch('/api/auth/register', {
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
				return 'Le compte a été créé avec succès.';
			} else {
				let message = data.message || "Unknown error";
				return 'Échec de l\'inscription : ' + message;
			}
		} catch (error) {
			console.error("Error:", error);
			return 'Échec de l\'inscription en raison d\'une erreur.';
		}
	}

	export async function login(args: string[]): Promise<string> {
		try {
			const response = await fetch('/api/auth/login', {
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
				return 'Connexion réussie ! Tapez **help** pour de nouvelles instructions.';
			} else {
				let message = data.message || "Erreur inconnue";
				return 'Échec de la connexion : ' + message;
			}
		} catch (error) {
			console.error("Error:", error);
			return 'Échec de la connexion en raison d\'une erreur.';
		}
	}

	export async function loadUser(): Promise<boolean> {
		const token = TerminalUtils.getCookie('accessToken') || '';
		if (token === '') {
			return false;
		}
		try {
			const response = await fetch('/api/suscriber/profile', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token
				},
			});
			const data = await response.json();
			if (data.success) {
				TerminalUserManagement.username = data.user.username;
				TerminalUtils.updatePromptText( TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ " );
				TerminalUserManagement.isLoggedIn = true;
				const socket = io("http://localhost:8181/socket.io/", {
				auth: {
					token: token
				},
				transports: ["websocket"],
				autoConnect: true,
				});
				console.log(socket)
				socketUtils.socket = socket;
				socketUtils.userId = data.user.id;
				console.log(socketUtils.userId);
				return true;
			}
			if (data.message === 'Invalid or expired token') {
				const refreshed = await tryRefreshToken();
				if (!refreshed) {
					WriteOnTerminal.printErrorOnTerminal("Veuillez vous connecter.");
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


	export async function getTenUsers(args: string): Promise<string[]> {
		const token = TerminalUtils.getCookie('accessToken') || '';
		if (token === '') {
			return [];
		}
		try {
			const response = await fetch('/api/users/search/username/' + args, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token
				},
			});
			const data = await response.json();
			if (data.success) {
				let result: string[] = [];
				for (let i = 0; i < data.user.length && i < 10; i++) {
					result.push(data.user[i].username);
				}
				return result;
			}
			if (data.message === 'Invalid or expired token') {
				const refreshed = await tryRefreshToken();
				if (!refreshed) {
					WriteOnTerminal.printErrorOnTerminal("Veuillez vous connecter.");
					return [];
				}
				return await getTenUsers(args);
			}
			return [];
		} catch (error) {
			console.error("Error:", error);
			return [];
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
			const response = await fetch('/api/auth/refresh', {
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

	export function logout(args: string[], description: string): string
	{
		if (!TerminalUserManagement.isLoggedIn)
			return 'You are not logged in.';
		if (args.length > 1)
			return description;
		// API LOGOUT (avant delete token :) )
		document.cookie = 'accessToken=; path=/;';
		document.cookie = 'refreshToken=; path=/;';
		TerminalUserManagement.isLoggedIn = false;
		TerminalUserManagement.username = 'usah';
		TerminalUtils.updatePromptText( TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ " );
		return 'Déconnexion réussie.';
	}
}