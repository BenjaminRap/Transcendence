import zod from "zod";
import { zodDefaultFunction, type InferArray, type InferZodAck, type SetInArray } from "./ZodHelper";
import { isKey } from "./utils";
import { clientMessages, zodClientMessageAcknowledgementParameters, zodClientMessageData } from "./ClientMessage";

export function	isClientMessage(eventName : string) : eventName is ClientMessage
{
	return clientMessages.find(value => value === eventName) !== undefined;
}

export type ClientMessage = typeof clientMessages[number];

export type ZodClientMessageData<T extends ClientMessage> =
  T extends keyof typeof zodClientMessageData
    ? (typeof zodClientMessageData)[T]
    : [];

export type ClientMessageData<T extends ClientMessage> =
  T extends keyof typeof zodClientMessageData
    ? InferArray<(typeof zodClientMessageData)[T]>
    : [];

export type ClientMessageAcknowledgementParameters<T extends ClientMessage> =
  T extends keyof typeof zodClientMessageAcknowledgementParameters
    ? InferArray<(typeof zodClientMessageAcknowledgementParameters)[T]>
    : undefined;

export const zodClientMessageAcknowledgement = Object.fromEntries(
	Object.entries(zodClientMessageAcknowledgementParameters).map(([key, value]) => {
		return [key, zod.function({input: value, output: zod.void()})]
	})
) as unknown as {
	[T in keyof typeof zodClientMessageAcknowledgementParameters]: zod.ZodFunction<
		zod.ZodTuple<(typeof zodClientMessageAcknowledgementParameters)[T], null>
		, zod.ZodVoid>
}

export type ZodClientMessageAcknowledgement<T extends ClientMessage> =
  T extends keyof typeof zodClientMessageAcknowledgement
    ? (typeof zodClientMessageAcknowledgement)[T]
	: undefined;

export type ClientMessageAcknowledgement<T extends ClientMessage> =
  T extends keyof typeof zodClientMessageAcknowledgement
    ? InferZodAck<(typeof zodClientMessageAcknowledgement)[T]>
	: undefined;

export const zodClientMessageParameters = Object.fromEntries(
	clientMessages.map(event => {
		const	types : zod.ZodType[] = [];

		if (isKey(event, zodClientMessageData))
			types.push(...zodClientMessageData[event]);
		if (isKey(event, zodClientMessageAcknowledgement))
			types.push(zodDefaultFunction);

		return [event, zod.tuple(types as any)];
	})
) as unknown as {
	[T in ClientMessage]: zod.ZodTuple<[
		...SetInArray<ZodClientMessageData<T>>, 
		...T extends keyof typeof zodClientMessageAcknowledgement ? [typeof zodDefaultFunction] : []
	]
	, null>
}

export type ClientMessageParameters<T extends ClientMessage> = 
	[...SetInArray<ClientMessageData<T>>, ...SetInArray<ClientMessageAcknowledgement<T>>]

export type ClientToServerEvents = {
    [T in ClientMessage]: (...data: ClientMessageParameters<T>) => void;
};

export function	areParametersValid<T extends ClientMessage>(event : T, args : any[]) : args is ClientMessageParameters<T>
{
	const	zodChecker = zodClientMessageParameters[event];
	const	result = zodChecker.safeParse(args);

	return result.success;
}
