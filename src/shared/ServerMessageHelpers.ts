import zod from "zod";
import type { InferArray, SetInArray } from "./ZodHelper";
import { isKey } from "./utils";
import { serverMessages, zodServerMessageData } from "./ServerMessage";

export type ServerMessage = typeof serverMessages[number];

export type ServerMessageData<T extends ServerMessage> =
  T extends keyof typeof zodServerMessageData
    ? InferArray<(typeof zodServerMessageData)[T]>
    : [];

export type ZodServerMessageData<T extends ServerMessage> =
  T extends keyof typeof zodServerMessageData
    ? (typeof zodServerMessageData)[T]
    : [];

export const zodServerMessageParameters = Object.fromEntries(
	serverMessages.map(event => {
		const	types : zod.ZodType[] = [];

		if (isKey(event, zodServerMessageData))
			types.push(...zodServerMessageData[event]);

		return [event, zod.tuple(types as any)];
	})
) as unknown as {
	[T in ServerMessage]: zod.ZodTuple<SetInArray<ZodServerMessageData<T>>, null>
}

export type ServerMessageParameters<T extends ServerMessage> = ServerMessageData<T>;

export type ServerToClientEvents = {
    [T in ServerMessage]: (...data: ServerMessageParameters<T>) => void;
};
