export class EntityController {
    static HasNetworkEntity(transform) {
        if (transform == null)
            return false;
        return (transform.networkEntity != null);
    }
    static GetNetworkEntityId(transform) {
        if (transform == null)
            return null;
        return (transform.networkEntity != null) ? transform.networkEntity.id : null;
    }
    static GetNetworkEntityType(transform) {
        if (transform == null)
            return 0;
        return (transform.networkEntityType != null) ? transform.networkEntityType : 0;
    }
    static GetNetworkEntitySessionId(transform) {
        if (transform == null)
            return null;
        return (transform.networkEntity != null) ? transform.networkEntity.ownerId : null;
    }
    static QueryNetworkAttribute(transform, key) {
        let result = null;
        if (transform != null && transform.networkEntity != null && transform.networkEntity.attributes != null) {
            result = transform.networkEntity.attributes.get(key);
        }
        return result;
    }
    static QueryBufferedAttribute(transform, index) {
        let result = 0;
        if (transform != null && transform.networkEntityAttributeBuffer != null) {
            result = transform.networkEntityAttributeBuffer[index.toFixed(0)];
        }
        return result;
    }
    static PostBufferedAttribute(transform, index, value) {
        if (transform.networkEntityBatch == null)
            transform.networkEntityBatch = {};
        transform.networkEntityBatch[index.toFixed(0)] = value;
    }
}
