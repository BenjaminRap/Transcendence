import type { HavokPlugin } from "@babylonjs/core"; 
import type { HavokPhysicsWithBindings } from "@babylonjs/havok"; 

declare global {
	var HK : HavokPhysicsWithBindings | undefined;
	var HKP : HavokPlugin | undefined;
}
