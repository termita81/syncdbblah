export const OP_ADD = 'add';
export const OP_EDIT = 'edit';
export const OP_REMOVE = 'remove';
export const OP_SYNC = 'sync';
export const OP_SAVE = 'save';
    
export function createDatabase (get, set) {
    
    function nextInSequence (collection) { 
        let result = null
        for (var i in collection.items) {
            if (result && (collection.items[i].id > result)) {
                result = collection.items[i].id
            }
        }
        if (result) {
            return (collection.sequence = ++result);
        } else {
            return ++collection.sequence;
        }
    }
    function createCollection(collectionName) {
        if (!isNaN(parseInt(collectionName))) throw new Error('Invalid collection name');
        state.data[collectionName] = { 
            sequence: 0, 
            items: {} 
        };
    }
    function getCollection(collectionName, forInsert) {
        let collection = state.data[collectionName];
        if (!collection) {
            if (forInsert === true) {
                collection = (state.data[collectionName] = createCollection(collectionName));
            } else { 
                throw Error('Collection not found'); 
            }
        } 
        return collection;
    }
    function getUpdateKey(collectionName, id) {
        return `${collectionName}_${id}`;
    }
    function insert(collectionName, item) {
        const collection = getCollection(collectionName, true);

        if (!item.id) item.id = nextInSequence(collection);

        collection.items[item.id] = item;

        let key = getUpdateKey(collectionName, item.id);
        let update = state.updates[key] || { id: item.id, op: OP_ADD };
        state.updates[key] = update;
    }
    function edit(collectionName, item) {
        const collection = getCollection(collectionName);

        if (!collection.items[item.id]) throw Error('Item not found');
        
        collection.items[item.id] = item;

        let key = getUpdateKey(collectionName, item.id);
        let update = state.updates[key] || { id: item.id }
        if (update.op != OP_ADD) update.op = OP_EDIT;
        state.updates[key] = update;
    }
    function remove(collectionName, item) {
        const collection = getCollection(collectionName);
        
        if (!collection.items[item.id]) throw Error('Item not found');
        
        delete(collection.items[item.id]);

        let key = getUpdateKey(collectionName, item.id);
        let update = state.updates[key]
        if (!update) {
            update = { id: item.id, op: OP_REMOVE }
            state.updates[key] = update;
        }
        else {
            if (update.op == OP_ADD) {
                delete(state.updates[key])
            } else {
                update.op = OP_REMOVE;
                state.updates[key] = update;
            }
        }
    }
    function getCollectionData(collectionName) {
        const collection = state.data[collectionName];
        if (!collection) throw Error('Collection not found');

        let res = [];
        for (var i in collection.items) {
          res.push(collection.items[i])
        }
        return res;
    }
    function getUpdates() {
        let res = [];
        for (var i in state.updates) {
            res.push(state.updates[i])
        }
        return res;
    }
    function getState(...collectionNames) {
        const data = {};
        for (var i in collectionNames) {
            const collectionName = collectionNames[i];
            data[collectionName] = getCollectionData(collectionName);
        }
        return {
            data,
            updates: getUpdates()
        }
    }
    function load() {
        state = get() || dummyState;
    }
    function save() {
        set(state);
    }

    function sync() {
        const result = []
        for (var i in state.updates) {
            const update = state.updates[i]
            result.push(`${update.op} for ${update.id}`)
        }
        return result;
    }

    const dummyState = {
        updates: {},
        data: {
            samples: {
                items: {
                    '1': { id: 1, name: 'one'},
                    '2': { id: 2, name: 'two'},
                    '3': { id: 3, name: 'tre'}
                },
                sequence: 3
            }
        }
    };
    let state = null;
    load();

    return {
        insert,
        edit,
        remove,
        getState,
        getCollectionData,
        createCollection,
        sync
    }
}