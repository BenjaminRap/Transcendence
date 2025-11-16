## Services Overview

### 🎮 GameService

#### `getStats(ids: number[])`

Retrieves game statistics for multiple users

**Signature:**
```typescript
async getStats(ids: number[]): Promise<ServiceResponse<GameStats[]>>
```

**Parameters:**
- `ids` - Array of user IDs to fetch stats for (max 200 IDs)

**Returns:**
- `success` - Boolean indicating if the operation succeeded
- `message` - Error message if success is false
- `stats` - Array of GameStats if success is true

**Error Handling:**
- Never throws exceptions
- Returns `success: false` with descriptive message on failure

**Example:**
```typescript
// Initialize container and service beforehand (see docINTERFACES/README.md)
const gameService = container.getService('GameService');

const result = await gameService.getStats([1, 2, 3]);
if (result.success) {
  console.log(result.stats);
} else {
  console.error(result.message);
}
```

**Remarks:**
- Limited to 200 IDs per request for DDOS protection

---

