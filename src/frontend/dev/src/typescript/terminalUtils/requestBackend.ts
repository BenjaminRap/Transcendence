import { TerminalUtils } from "./terminalUtils";
import { WriteOnTerminal } from "./writeOnTerminal";
import { TerminalFileSystem, TerminalUserManagement } from "../terminal";
import { socketUtils } from '../terminal'
import type { Result } from "@shared/utils";
import { ProfileBuilder } from "../profile";
import { ExtProfileBuilder } from "../extprofile";


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
				return 'Le compte a été créé avec succès. Vous êtes maintenant connecté. Tapez **help** pour de nouvelles instructions.';
			} else {
				let message = data.message || "Unknown error";
				return 'Échec de l\'inscription : ' + message;
			}
		} catch (error) {
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
			return 'Échec de la connexion en raison d\'une erreur.';
		}
	}

	export async function createWebSocket(token: string)
	{
		if (socketUtils.socket === null)
			return ;

		socketUtils.socket.emit("authenticate", { token: token }, (result: Result<null>) => {})
	}

	export async function loadUser(): Promise<void> {
		const token = TerminalUtils.getCookie('accessToken') || '';
		if (token === '') {
			return ;
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
				createWebSocket(token);
				return ;
			}
			if (data.message === 'Invalid or expired token') {
				const refreshed = await tryRefreshToken();
				if (!refreshed) {
					WriteOnTerminal.printErrorOnTerminal("Veuillez vous connecter.");
					return ;
				}
				return await loadUser();
			}
			return ;
		} catch (error) {
			WriteOnTerminal.printErrorOnTerminal("Error loading user data.");
			return ;
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
			return [];
		}
	}

	export async function tryRefreshToken() : Promise<boolean>
	{
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
			return false;
		}
	}

	export function logout(args: string[], description: string): string
	{
		if (!TerminalUserManagement.isLoggedIn)
			return 'You are not logged in.';
		if (args.length > 1)
			return description;
		socketUtils.socket?.emit('logout');
		document.cookie = 'accessToken=; path=/;';
		document.cookie = 'refreshToken=; path=/;';
		TerminalUserManagement.isLoggedIn = false;
		TerminalUserManagement.username = 'usah';
		TerminalUtils.updatePromptText( TerminalUserManagement.username + "@terminal:" + TerminalFileSystem.currentDirectory +"$ " );

		if (ExtProfileBuilder.isActive)
			ExtProfileBuilder.removeExtProfile(true);
		else if (ProfileBuilder.isActive)
			ProfileBuilder.removeProfile(true);
		return 'Déconnexion réussie.';
	}
}
 
