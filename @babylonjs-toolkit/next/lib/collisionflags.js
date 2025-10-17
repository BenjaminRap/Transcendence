export var CollisionFlags;
(function (CollisionFlags) {
    CollisionFlags[CollisionFlags["CF_STATIC_OBJECT"] = 1] = "CF_STATIC_OBJECT";
    CollisionFlags[CollisionFlags["CF_KINEMATIC_OBJECT"] = 2] = "CF_KINEMATIC_OBJECT";
    CollisionFlags[CollisionFlags["CF_NO_CONTACT_RESPONSE"] = 4] = "CF_NO_CONTACT_RESPONSE";
    CollisionFlags[CollisionFlags["CF_CUSTOM_MATERIAL_CALLBACK"] = 8] = "CF_CUSTOM_MATERIAL_CALLBACK";
    CollisionFlags[CollisionFlags["CF_CHARACTER_OBJECT"] = 16] = "CF_CHARACTER_OBJECT";
    CollisionFlags[CollisionFlags["CF_DISABLE_VISUALIZE_OBJECT"] = 32] = "CF_DISABLE_VISUALIZE_OBJECT";
    CollisionFlags[CollisionFlags["CF_DISABLE_SPU_COLLISION_PROCESSING"] = 64] = "CF_DISABLE_SPU_COLLISION_PROCESSING";
    CollisionFlags[CollisionFlags["CF_HAS_CONTACT_STIFFNESS_DAMPING"] = 128] = "CF_HAS_CONTACT_STIFFNESS_DAMPING";
    CollisionFlags[CollisionFlags["CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR"] = 256] = "CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR";
    CollisionFlags[CollisionFlags["CF_HAS_FRICTION_ANCHOR"] = 512] = "CF_HAS_FRICTION_ANCHOR";
    CollisionFlags[CollisionFlags["CF_HAS_COLLISION_SOUND_TRIGGER"] = 1024] = "CF_HAS_COLLISION_SOUND_TRIGGER";
})(CollisionFlags || (CollisionFlags = {}));
