export var CollisionState;
(function (CollisionState) {
    CollisionState[CollisionState["ACTIVE_TAG"] = 1] = "ACTIVE_TAG";
    CollisionState[CollisionState["ISLAND_SLEEPING"] = 2] = "ISLAND_SLEEPING";
    CollisionState[CollisionState["WANTS_DEACTIVATION"] = 3] = "WANTS_DEACTIVATION";
    CollisionState[CollisionState["DISABLE_DEACTIVATION"] = 4] = "DISABLE_DEACTIVATION";
    CollisionState[CollisionState["DISABLE_SIMULATION"] = 5] = "DISABLE_SIMULATION";
})(CollisionState || (CollisionState = {}));
