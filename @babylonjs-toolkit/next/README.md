# ESNext Edition
The <a href="https://www.babylontoolkit.com">Babylon Toolkit</a> is a runtime library extension for BabylonJS development that provides modern programming mechanics with a familiar Unity like scripting model to fast track native web game development.

<a href="https://www.npmjs.com/package/babylonjs-toolkit">Classic Edition (UMD)</a>
<br/>
<a href="https://github.com/BabylonJS/BabylonToolkit/tree/master/Runtime">Browser Library (CDN)</a>
<br/>
<a href="https://github.com/MackeyK24/ES6-StarterAssets">Demo React Project (TSX)</a>


## Basic Installation
```bash
npm install @babylonjs-toolkit/next
```

## Default Installation (ES6)
```bash
npm install @babylonjs/core @babylonjs/gui @babylonjs/loaders @babylonjs/materials @babylonjs/havok @babylonjs-toolkit/next
```

* Default Module Import Libraries
```javascript
import { Engine, Scene } from "@babylonjs/core";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import HavokPhysics from "@babylonjs/havok";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
```

* Granular File Level Import Libraries
```javascript
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import HavokPhysics from "@babylonjs/havok";
import { SceneManager } from "@babylonjs-toolkit/next/scenemanager";
import { ScriptComponent } from "@babylonjs-toolkit/next/scenemanager";
import { LocalMessageBus } from "@babylonjs-toolkit/next/localmessagebus";
import { CharacterController } from "@babylonjs-toolkit/next/charactercontroller";
```

* Legacy Global Namespace Import Libraries
```javascript
import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import HavokPhysics from "@babylonjs/havok";
import * as TOOLKIT from "@babylonjs-toolkit/next";
TOOLKIT.SceneManager.AutoStripNamespacePrefix = false;
```

### Vite Configuration (ES6)

The Vite bundle services behave differently in devmode than production. To preserve some required classes during devmode, these `exclude` and `include` settings are strongly recommended in your vite.config.js settings file.

```json
  optimizeDeps: {
    exclude: mode === 'development' ? [
      "@babylonjs/havok",
      "@babylonjs/core",
      "@babylonjs/loaders",
      "@babylonjs/loaders/glTF",
    ] : ["@babylonjs/havok"],
    include: mode === 'development' ? [
      "@babylonjs/gui", 
      "@babylonjs/materials",
      "@babylonjs/inspector",
      "@babylonjs-toolkit/dlc",
      "@babylonjs-toolkit/next"
    ] : [],
  },
```

# 🌳 Tree Shaking 

The Babylon Toolkit ES6 library is optimized for maximum tree-shaking with **39 separate module files** containing **114 total declarations**. The build system intelligently groups related classes to handle circular dependencies while maintaining optimal bundle sizes.

### Key Benefits:
- ✅ **Smart dependency grouping** - Related classes are bundled together
- ✅ **Zero unused code** - Only imported classes are included
- ✅ **Circular dependency handling** - Complex relationships are managed automatically
- ✅ **Multiple import styles** - Choose the approach that fits your needs

## 🚀 Import Methods

### Method 1: Main Index Import (Recommended)
```typescript
import { SceneManager, ScriptComponent, InputController } from "@babylonjs-toolkit/next";
```
- **Pros**: Simple, clean, easy to refactor
- **Cons**: Bundler must analyze index.js
- **Use Case**: Most applications, rapid development

### Method 2: File-Level Import (Maximum Control)
```typescript
import { SceneManager } from "@babylonjs-toolkit/next/scenemanager";
import { LocalMessageBus } from "@babylonjs-toolkit/next/localmessagebus";
```
- **Pros**: Explicit dependencies, maximum bundler hints
- **Cons**: More verbose, requires knowledge of file structure
- **Use Case**: Library authors, performance-critical applications

## 📦 Module Groups

The toolkit is organized into logical groups based on dependency analysis. The main entry point uses file level imports automatically

### Core Group (scenemanager.ts)
The largest group containing the main runtime and interconnected components:

**Classes:**
- `SceneManager` - Main toolkit framework manager
- `ScriptComponent` - Base class for all script components  
- `PreloadAssetsManager` - Asset preloading management
- `GlobalMessageBus` - Global messaging system
- `RequestHeader` - HTTP request utilities
- `CubeTextureLoader` - Cube texture loading utilities
- `MetadataParser` - Scene metadata parsing
- `Utilities` - General utility functions
- `InputController` - User input management
- `WindowManager` - Window and screen management
- `AnimationState` - Animation state machine component
- `BlendTreeValue` - Animation blend tree values
- `BlendTreeUtils` - Animation blend tree utilities
- `BlendTreeSystem` - Animation blend tree system
- `MachineState` - State machine implementation
- `TransitionCheck` - Animation transition logic
- `AnimationMixer` - Animation mixing utilities
- `BlendingWeights` - Animation blending weights
- `AudioSource` - Audio playback component
- `HavokRaycastVehicle` - Havok physics vehicle
- `HavokWheelInfo` - Vehicle wheel information
- `HavokVehicleUtilities` - Vehicle utility functions
- `RaycastVehicle` - Generic raycast vehicle
- `RigidbodyPhysics` - Physics rigidbody component
- `PhyscisContainerData` - Physics container data

**Interfaces:**
- `IAssetPreloader` - Asset preloading interface
- `IWindowMessage` - Window messaging interface
- `IRuntimeOptions` - Runtime configuration
- `IUnityTransform` - Unity transform compatibility
- `IUnityCurve` - Unity animation curve compatibility
- `IUnityMaterial` - Unity material compatibility
- `IUnityTexture` - Unity texture compatibility
- `IUnityCubemap` - Unity cubemap compatibility
- `IUnityAudioClip` - Unity audio clip compatibility
- `IUnityVideoClip` - Unity video clip compatibility
- `IUnityFontAsset` - Unity font asset compatibility
- `IUnityTextAsset` - Unity text asset compatibility
- `IUnityDefaultAsset` - Unity default asset compatibility
- `IUnityVector2` - Unity Vector2 compatibility
- `IUnityVector3` - Unity Vector3 compatibility
- `IUnityVector4` - Unity Vector4 compatibility
- `IUnityColor` - Unity Color compatibility
- `UserInputPress` - User input press interface
- `KeymapState` - Input keymap state
- `IAnimatorEvent` - Animation event interface
- `IAvatarMask` - Animation avatar mask
- `IAnimationLayer` - Animation layer interface
- `IBehaviour` - Animation behavior interface
- `ITransition` - Animation transition interface
- `ICondition` - Animation condition interface
- `IBlendTree` - Animation blend tree interface
- `IBlendTreeChild` - Blend tree child interface
- `IPhysicsShapeCastResult` - Physics shape cast result
- `IPhysicsShapeCastQuery` - Physics shape cast query

**Types:**
- `UserInputAction` - User input action callback type

**Enums:**
- `System` - System type enumeration
- `SearchType` - Search functionality types  
- `PlayerNumber` - Player identification
- `RenderQuality` - Graphics quality settings
- `GamepadType` - Controller types
- `UserInputAxis` - Input axis enumeration
- `UserInputKey` - Input key enumeration
- `MaterialAlphaMode` - Material alpha blending modes
- `DragDirection` - Touch drag directions
- `PinchZoomState` - Pinch zoom states
- `MotionType` - Animation motion types
- `ConditionMode` - Animation condition modes
- `InterruptionSource` - Animation interruption sources
- `BlendTreeType` - Animation blend tree types
- `AnimatorParameterType` - Animation parameter types

### Standalone Component Groups

The remaining components are organized into standalone modules for optimal tree-shaking:

#### Animation & Media Components
- `ShurikenParticles` - Particle system component
- `WebVideoPlayer` - Video playback component

#### Character Controllers
- `CharacterController` - Physics-based character controller
- `SimpleCharacterController` - Basic character movement
- `RecastCharacterController` - Navigation mesh character controller
- `NavigationAgent` - Navigation mesh agent
- `UniversalCharacterController` - Universal character controller type

#### Terrain & Environment  
- `TerrainGenerator` - Procedural terrain generation
- `UniversalTerrainMaterial` - Advanced terrain material
- `UniversalTerrainMaterialPlugin` - Terrain material plugin

#### Material & Rendering Systems
- `CustomShaderMaterial` - Custom shader material system
- `CustomShaderMaterialPlugin` - Custom shader material plugin
- `CustomLoadingScreen` - Custom loading screen implementation
- `LinesMeshRenderer` - Line rendering utilities

#### Input & Control Enums
- `Handedness` - Hand preference enumeration
- `PlayerControl` - Player control types
- `Xbox360Trigger` - Xbox controller trigger enumeration
- `MovementType` - Character movement types
- `MouseButtonMode` - Mouse button interaction modes
- `TouchMouseButton` - Touch to mouse button mapping
- `UserInputPointer` - Input pointer types

#### Physics & Collision Systems
- `CollisionContact` - Collision contact types
- `CollisionState` - Collision state enumeration
- `CollisionFlags` - Physics collision flags
- `CollisionFilters` - Collision filtering system
- `IntersectionPrecision` - Ray intersection precision

#### Animation & UI Types
- `BlendTreePosition` - Animation blend tree positioning
- `IAnimationCurve` - Animation curve interface
- `IAnimationKeyframe` - Animation keyframe interface
- `TouchJoystickHandler` - Touch joystick input handler

#### Data Structures & Results
- `RaycastHitResult` - Ray casting result data
- `TriggerVolume` - Physics trigger volume
- `RoomErrorMessage` - Network room error messaging
- `PrefabObjectPool` - Object pooling system
- `LocalMessageBus` - Local messaging system
- `EntityController` - Entity management controller

## 🎯 Best Practices

### 1. Start Small
Begin with minimal imports and add components as needed:
```typescript
// Start with this
import { SceneManager } from "@babylonjs-toolkit/next";

// Add components incrementally
import { SceneManager, InputController } from "@babylonjs-toolkit/next";
```

### 2. Group Related Imports
Import related functionality together:
```typescript
// Good - related physics components
import { 
    CharacterController, 
    RigidbodyPhysics, 
    CollisionState 
} from "@babylonjs-toolkit/next";
```

### 3. Use File-Level Imports For Maximum Control
When bundle size is critical:
```typescript
// Maximum tree-shaking for production
import { SceneManager } from "@babylonjs-toolkit/next/scenemanager";

// Character Controllers
import { CharacterController } from "@babylonjs-toolkit/next/scenemanager";
import { SimpleCharacterController } from "@babylonjs-toolkit/next/scenemanager";
import { RecastCharacterController } from "@babylonjs-toolkit/next/scenemanager";

// Animation & Media Components
import { ShurikenParticles } from "@babylonjs-toolkit/next/shurikenparticles";
import { WebVideoPlayer } from "@babylonjs-toolkit/next/webvideoplayer";

// Terrain & Environment
import { TerrainGenerator } from "@babylonjs-toolkit/next/terraingenerator";
import { UniversalTerrainMaterial } from "@babylonjs-toolkit/next/universalterrainmaterial";

// Material Systems
import { CustomShaderMaterial } from "@babylonjs-toolkit/next/customshadermaterial";
import { CustomShaderMaterialPlugin } from "@babylonjs-toolkit/next/customshadermaterialplugin";

// Utility Classes
import { CustomLoadingScreen } from "@babylonjs-toolkit/next/customloadingscreen";
import { PrefabObjectPool } from "@babylonjs-toolkit/next/prefabobjectpool";
import { LocalMessageBus } from "@babylonjs-toolkit/next/localmessagebus";
import { LinesMeshRenderer } from "@babylonjs-toolkit/next/linesmeshrenderer";

// Enums & Types (Smallest Imports)
import { Handedness } from "@babylonjs-toolkit/next/handedness";
import { PlayerControl } from "@babylonjs-toolkit/next/playercontrol";
import { MovementType } from "@babylonjs-toolkit/next/movementtype";
import { CollisionContact } from "@babylonjs-toolkit/next/collisioncontact";
import { BlendTreePosition } from "@babylonjs-toolkit/next/blendtreeposition";
```

### 4. Analyze Your Bundle
Use your bundler's analysis tools to verify tree-shaking:
```bash
# Vite bundle analysis
npm run build -- --mode production

# Webpack bundle analyzer
npm install --save-dev webpack-bundle-analyzer
```
