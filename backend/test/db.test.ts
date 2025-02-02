import { expect, it, describe } from 'vitest';
import { collectionName, DBCreate, DBDelete, DBDeleteWithID, DBGet, DBSet, DBSetWithID } from '../src/db';

const testObjects = {
    'user': {
        _test_property: 'heemie',
        val: 20
    },
    'chat': {
        _test_property: 'heemie',
        val: 20
    }, 
    'message': {
        _test_property: 'heemie',
        val: 20
    }, 
    'friendship': {
        _test_property: 'heemie',
        val: 20
    }
}

/**
 * acquires all test objects from each collection.
 * 
 * @returns 
 * ```
 *  {
 *      collectionName: [testObjects, ...],
 *      collectionName: [testObjects, ...],
 *      ...
 *  }
 * ```
 */
async function getTestObjectsFromCollections(): Promise<object> {
    const existingObjects = {}; // used to store existing objects

    // acquire all documents in collections with _test_property defined
    for (let key in testObjects) {
        const res = await DBGet(key, [['_test_property', '!=', null]]);
        if (res.length > 0) {
            existingObjects[key] = res;
        }
    }

    return existingObjects;
}

describe('db', async () => {
    const nonsenseTestingValue = '!nonesense__294U';
    const testObjectsExistTest = async (count: number) => {
        // check if any test objects still exist (there should be none)
        const existingTestObjects = await getTestObjectsFromCollections();
        let realCount = 0;
        for (let collection in existingTestObjects) {
            realCount += existingTestObjects[collection].length;
        }
        expect(realCount).toBe(count);
        return existingTestObjects;
    };

    /**
     * Testing objects could be left over from previously failed tests.
     * This function deletes them, and tests if it deleted successfully
     * 
     * Made it a function so it can be called before and after all tests.
     */
    const deleteTest = async () => {
        it('should delete all existing test objects', async () => {
            const existingTestObjects = await getTestObjectsFromCollections();
            if (Object.keys(existingTestObjects).length == 0) {
                return;
            }
            
            // iterate through each collection with test objects
            for (let collection in existingTestObjects) {
                // delete each test object in current collection
                for (let obj of existingTestObjects[collection]) {
                    await DBDeleteWithID(collection, obj.id);
                }
            }

            await testObjectsExistTest(0);
        });
    };
    
    await deleteTest();

    /**
     * tests creating by creating n test objects, counting existing test objects, then creating n more test objects.
     * In the end, there should be 2n test objects.
     * 
     */
    it('should create testing objects', async () => {
        // ensure no test objects exist right now
        await testObjectsExistTest(0);

        // create test objects
        for (let testObjectCollection in testObjects) {
            await DBCreate(testObjectCollection, testObjects[testObjectCollection]);
        }

        // expect certain number of test objects
        await testObjectsExistTest(Object.keys(testObjects).length);

        // create slightly different test objects (used later in tests)
        for (let testObjectCollection in testObjects) {
            await DBCreate(testObjectCollection, {...testObjects[testObjectCollection], _test_property: 42});
        }

        // expect certain number of test objects
        await testObjectsExistTest(Object.keys(testObjects).length * 2);
    });

    let currentTestObjects: object;
    /**
     * The test objects created in the previous test should result in 2 test objects for each collection
     * of the 2 objects, 1 property: _test_property
     * 
     * 1st object _test_property = 'heemie', 2nd object _test_property = 42
     * 
     * get works correctly if, it gets 0 with nonsense query parameters, 1 when _test_property = 'heemie', 1 when _test_property = 42, and 2 when _test_property = 'heemie' or 42
     * 
     * no need to test for other comparisions (>=, <=, etc.), as these are tested by google (firebase)
     */
    it('should get testing objects correctly', async () => {
        // expect required number of test objects
        currentTestObjects = await testObjectsExistTest(Object.keys(testObjects).length * 2);

        // test each collection
        for (let collection in testObjects) {
            // nonsense query, expect 0
            expect((await DBGet(collection, [['_test_property', '==', nonsenseTestingValue]])).length).toBe(0);
            
            // _test_property = 'heemie', expect 1
            expect((await DBGet(collection, [['_test_property', '==', 'heemie']])).length).toBe(1);

            // val = 42, expect 1
            expect((await DBGet(collection, [['_test_property', '==', 42]])).length).toBe(1);

            // val = 'heemie' | val = 42, expect 2
            expect((await DBGet(collection, [['_test_property', '==', 'heemie'], ['_test_property', '==', 42]], 'or')).length).toBe(2);
        }
    });

    /**
     * runs the test on one collection, as we really only need to try it out on one objects.
     * 
     * 1 nonsensicle get request should return 0 values. 
     * 
     * After Setting 1 item to that nonsense value, it should return 1 value.
     */
    it('should set contents of testing objects correctly, using query or id', async () => {
        let collection = Object.keys(currentTestObjects)[0];
        if (currentTestObjects[collection].length < 1) {
            throw new Error('Expected at least one test object in database');
        }

        // ensure none have nonsensicle value
        expect((await DBGet(collection, [['_test_property', '==', nonsenseTestingValue]])).length).toBe(0);
        
        // set 1 item to nonsensicle value
        const currentTestObj = currentTestObjects[collection][0];
        // DBSet(collection, { _test_property: 'bruh' }, [['_test_property', '!=', ]])
        await DBSetWithID(collection, currentTestObj.id, { _test_property: nonsenseTestingValue });
        
        // ensure one item is set to nonsensicle value, and the id is the same as the one modified.
        const modifiedObj = await DBGet(collection, [['_test_property', '==', nonsenseTestingValue]]);
        expect(modifiedObj.length).toBe(1);
        expect(modifiedObj[0].id).toBe(currentTestObj.id);

        // modify it again, using DBSet instead of DBSetWithID
        // set _test_property to nonsenseTestingValue+"!"
        await DBSet(collection, { '_test_property': nonsenseTestingValue+"!" }, [['_test_property', '==', nonsenseTestingValue]]);

        // ensure it exists, only one exists, and its id is the same as the id before.
        const modifiedObj2 = await DBGet(collection, [['_test_property', '==', nonsenseTestingValue+"!"]]);
        expect(modifiedObj2.length).toBe(1);
        expect(modifiedObj2[0].id).toBe(modifiedObj[0].id);
    });

    // cleanup test objects from database after all tests. 
    // This effectively tests DBDeleteWithID as well.
    it('should delete all matching a query correctly', async () => {
        for(let collection in testObjects) {
            await DBDelete(collection, [['_test_property', '!=', null]]);
        }
        await testObjectsExistTest(0);
    });
});