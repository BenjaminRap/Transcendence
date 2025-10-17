export var CollisionFilters;
(function (CollisionFilters) {
    CollisionFilters[CollisionFilters["DefaultFilter"] = 1] = "DefaultFilter";
    CollisionFilters[CollisionFilters["StaticFilter"] = 2] = "StaticFilter";
    CollisionFilters[CollisionFilters["KinematicFilter"] = 4] = "KinematicFilter";
    CollisionFilters[CollisionFilters["DebrisFilter"] = 8] = "DebrisFilter";
    CollisionFilters[CollisionFilters["SensorTrigger"] = 16] = "SensorTrigger";
    CollisionFilters[CollisionFilters["CharacterFilter"] = 32] = "CharacterFilter";
    CollisionFilters[CollisionFilters["AllFilter"] = -1] = "AllFilter";
})(CollisionFilters || (CollisionFilters = {}));
