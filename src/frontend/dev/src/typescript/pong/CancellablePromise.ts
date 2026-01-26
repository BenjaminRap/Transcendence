import { PongError } from "@shared/pongError/PongError";

type ResolveType<T> = (value : T | PromiseLike<T>) => void;
type RejectType = (reason? : any) => void;

export class	CancellablePromise<T>
{
	public readonly	promise : Promise<T>;

	private _reject : RejectType | null = null;
	private _cancel : (() => void) | null = null;

	constructor(executor : (resolve : ResolveType<T>, reject : RejectType) => void, cancel : () => void)
	{
		this._cancel = cancel;
		this.promise = new Promise((resolve, reject) => {
			this._reject = reject;
			executor(resolve, reject);
		});
		this.promise
			.catch(() => {
			})
			.finally(() => {
				this._cancel = null;
				this._reject = null;
			});
	}

	public cancel()
	{
		this._cancel?.();
		this._reject?.(new PongError("canceled", "ignore"));
	}
}
