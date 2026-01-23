import type { IGUI } from "./IGUI";

export type OnlineTournamentProfileGUIInputs =
{
	setAlias? : HTMLButtonElement,
	ban? : HTMLButtonElement,
	kick? : HTMLButtonElement,
}

export class	OnlineTournamentProfileGUI extends HTMLElement implements IGUI<OnlineTournamentProfileGUIInputs>
{
	private static readonly _kickImage = "url(/images/kick.png)";
	private static readonly _banImage = "url(/images/ban.png)";
	private static readonly _setAliasImage = "url(/images/setAlias.png)";

	private _inputs : OnlineTournamentProfileGUIInputs;
	private _alias : HTMLParagraphElement | HTMLInputElement;
	private _aliasIndicator : HTMLParagraphElement;

	constructor(
		private _addKickAndBanButtons = false,
		private _name = "unkown",
		private _isNameInput : boolean)
	{
		super();
		this.style.setProperty("--kick-image", OnlineTournamentProfileGUI._kickImage);
		this.style.setProperty("--ban-image", OnlineTournamentProfileGUI._banImage);
		this.style.setProperty("--set-alias-image", OnlineTournamentProfileGUI._setAliasImage);
		this.style.setProperty("--border-softened", "color-mix(in oklch, var(--border-color) 60%, transparent)");
		this.classList.add("inline-flex", "flex-row", "border-solid", "border-(length:--border-width)", "border-(--border-color)", this._addKickAndBanButtons ? "justify-between" : "justify-around", "rounded-(--rounded)", "aspect-16/3", "pt-[0.5cqw]", "pb-[0.5cqw]", "pl-[2cqw]", "pr-[1cqw]");
		this.innerHTML = `
			<div class="inline-flex flex-row w-[85%]">
				<p class="text-(--text-color) font-(family-name:--font) text-[2.5cqw] leading-[0.85] onlineTournamentProfileAliasIndicator absolute ml-[0.3cqw]"></p>
				${this.getNameHTML()}
			</div>
			${this._addKickAndBanButtons ? this.getKickAndBanButtonsHTML() : ""}
		`;
		this._inputs = {
			setAlias : this.querySelector<HTMLButtonElement>("button.onlineTournamentProfileSetAlias") ?? undefined,
			ban : this.querySelector<HTMLButtonElement>("button.onlineTournamentProfileBan") ?? undefined,
			kick : this.querySelector<HTMLButtonElement>("button.onlineTournamentProfileKick") ?? undefined,
		};
		this._alias = this.querySelector<HTMLParagraphElement | HTMLInputElement>(".onlineTournamentProfileAlias")!;
		this._aliasIndicator = this.querySelector<HTMLParagraphElement>("p.onlineTournamentProfileAliasIndicator")!;
		if (!this._isNameInput)
			return ;
		this._alias.addEventListener("input", () => {
			const	alias = this._alias as HTMLInputElement;

			if (alias.value === this._name)
				this._inputs.setAlias?.classList.add("invisible");
			else
				this._inputs.setAlias?.classList.remove("invisible");
		});
	}

	private	getNameHTML()
	{
		if (!this._isNameInput)
			return `<p class="text-(--text-color) font-(family-name:--font) text-[2.5cqw] leading-[0.85] w-[95%] onlineTournamentProfileAlias" >${this._name}</p>`;
		return `
			<input class="text-(--text-color) font-(family-name:--font) text-[2.5cqw] border-solid border rounded-[0.3cqw] w-[95%] outline-none pl-[1.1cqw] pb-[0.8cqw] border-(--border-softened) focus:border-(--border-color) onlineTournamentProfileAlias" value="${this._name}" placeholder="alias">
			${this.getButtonWithMask("onlineTournamentProfileSetAlias mask-(--set-alias-image) invisible")}
		`;
	}

	private	getKickAndBanButtonsHTML()
	{
		return this.getButtonWithMask("onlineTournamentProfileKick mask-(--kick-image)") +
				this.getButtonWithMask("onlineTournamentProfileBan mask-(--ban-image)");
	}

	private	getButtonWithMask(className : string)
	{
		return `<button class="h-full aspect-square mask-no-repeat mask-contain mask-center bg-(--border-color) hover:scale-125 ${className}"></button>`;
	}

	public getAlias()
	{
		if (this._alias instanceof HTMLParagraphElement)
			return "";
		return `@${this._alias.value}`;
	}

	public setAlias(newAlias : string)
	{
		this._alias.textContent = newAlias;
	}

	public validate()
	{
		if (this._alias instanceof HTMLParagraphElement)
			return ;
		this._aliasIndicator.textContent = "@";
		this._name = this._alias.value;
		this._inputs.setAlias?.classList.add("invisible");
	}

	public getInputs()
	{
		return this._inputs;
	}
}

customElements.define("online-tournament-profile-gui", OnlineTournamentProfileGUI);
