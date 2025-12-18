# Backend INTERFACES documentation

---

## Services Overview

### 🎮 GameService

| Method | Description |
|--------|-------------|
| **`getStats(ids: number[])`** | Retrieves game statistics for one or multiple users by their IDs |
| | |

---

### 🔐 OtherService

| Method | Description |
|--------|-------------|
| **`signature`** | quick description |

---

## Usage Pattern
```typescript
import {Container} from 'yourPath/backend/typescript/container/container.ts'

try {
	// * obtain a container instance that integrates the available services
	// * throw Error if the container initialization has not started or has not completed.
	const container = Container.getInstance();

	// * Invoke the service to access these methods
	// * throw Error if service not found
	const gameService = container.getService('GameService');

	// * invoke the methods of the service
	const result = gameService.getStats(ids);
	...
} catch(error) {
	console.log(error);
}
```

---

**Note:** This is a quick reference. See `/backend/docINTERFACE` for detailed documentation including parameters, return types, error codes, and examples.