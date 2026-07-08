class Cache {
    static storage = new Map();


    static set(key, value, duration = 3600000) {
        this.storage.set(key, {
            value,
            expires: Date.now() + duration
        });
    }


    static get(key) {
        const item = this.storage.get(key);

        if (!item) {
            return null;
        }

        if (Date.now() > item.expires) {
            this.storage.delete(key);
            return null;
        }

        return item.value;
    }


    static has(key) {
        return this.get(key) !== null;
    }


    static clear() {
        this.storage.clear();
    }
}


export default Cache;
