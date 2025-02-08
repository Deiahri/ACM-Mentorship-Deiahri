// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import {
  collection,
  getDocs,
  getFirestore,
  query as firebaseQuery,
  where,
  orderBy,
  doc,
  setDoc,
  addDoc,
  getDoc,
  deleteDoc,
  or,
  QueryFieldFilterConstraint,
} from "firebase/firestore";
import { LRUCache } from "lru-cache"; // for caching

import dotenv from "dotenv";
dotenv.config();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIRESTORE_APIKEY,
  authDomain: "mentorship-app-23aac.firebaseapp.com",
  projectId: "mentorship-app-23aac",
  storageBucket: "mentorship-app-23aac.firebasestorage.app",
  messagingSenderId: "118949702190",
  appId: "1:118949702190:web:4f06559f7d22122cb68dbf",
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

// list of all collection names
export type collectionName = "user" | "assessment" | "mentorshipRequest" | 'assessmentQuestion';
export const collectionsNames = ["user", "assessment", "mentorshipRequest", 'assessmentQuestion'];

type comparisonOperator =
  | "<"
  | ">"
  | "<="
  | ">="
  | "=="
  | "!="
  | "array-contains";
type queryTuple = [
  string,
  comparisonOperator,
  string | null | number | boolean
];
type queryStyle = "or" | "and";
type orderDirection = "asc" | "desc";
type orderTuple = [string, orderDirection];
export type DBObj = { id: string; [key: string]: any };

const DBCacheMaxItems = 15000; // currently optimized for 512 mb of ram.
const DBCache = new LRUCache<string, DBObj>({ max: DBCacheMaxItems });

export async function DBGetWithID(
  collectionName: collectionName,
  id: string
): Promise<DBObj | undefined> {
  try {
    // try fetching from cache first.
    const cacheRes = CacheGet(collectionName, id);
    if (cacheRes) {
      return { ...cacheRes }; // avoids mutations
    }

    // if cache is empty, fetch from db
    const res = (await getDoc(doc(db, collectionName, id))).data();
    if (!res) {
      return undefined;
    }
    const resComb = { ...res, id };
    // if db hit, then store data in cache.
    CacheSet(collectionName, id, resComb);
    return { ...resComb };
  } catch (error) {
    console.error(`Error in DBGetWithID(${collectionName}, ${id}): ${error}`);
    return undefined;
  }
}

export async function DBGet(
  collectionName: collectionName,
  queries?: queryTuple[],
  queryStyle?: queryStyle,
  order?: orderTuple
): Promise<DBObj[]> {
  let res;
  if (!queries) {
    if (!order) {
      res = await getDocs(firebaseQuery(collection(db, collectionName)));
    } else {
      res = await getDocs(
        firebaseQuery(collection(db, collectionName), orderBy(...order))
      );
    }
  } else {
    let compoundQuery: QueryFieldFilterConstraint[] = queries.map(
      (qT: queryTuple) => where(...qT)
    );

    const isOr = queryStyle == "or";
    if (!order) {
      if (!isOr) {
        res = await getDocs(
          firebaseQuery(collection(db, collectionName), ...compoundQuery)
        );
      } else {
        res = await getDocs(
          firebaseQuery(collection(db, collectionName), or(...compoundQuery))
        );
      }
    } else {
      if (!isOr) {
        res = await getDocs(
          firebaseQuery(
            collection(db, collectionName),
            ...compoundQuery,
            orderBy(...order)
          )
        );
      } else {
        res = await getDocs(
          firebaseQuery(
            collection(db, collectionName),
            or(...compoundQuery),
            orderBy(...order)
          )
        );
      }
    }
  }

  if (res.empty) {
    return [];
  } else {
    // when successful get, store values in cache.
    const returnArr: DBObj[] = [];
    res.forEach((doc) => {
      const val = { ...doc.data(), id: doc.id };
      CacheSet(collectionName, doc.id, { ...val });
      returnArr.push(val);
    });
    return returnArr;
  }
}

export async function DBSet(
  collectionName: collectionName,
  value: object,
  queries?: queryTuple[],
  queryStyle?: queryStyle,
  combine: boolean = false
) {
  const res = await DBGet(collectionName, queries, queryStyle);
  res.forEach(async (obj) => {
    let newObj: object;
    if (combine) {
      newObj = { ...obj, ...value };
    } else {
      newObj = value;
    }
    CacheSet(collectionName, obj.id, { ...newObj, id: obj.id });
    await setDoc(doc(db, collectionName, obj.id), newObj);
  });
}

export async function DBSetWithID(
  collectionName: collectionName,
  id: string,
  value: object,
  combine: boolean = false
) {
  let newObj: object;
  if (combine) {
    const obj = await DBGetWithID(collectionName, id); // needed to update cache. If item is in cache already, this fetches it from there.
    newObj = { ...obj, ...value };
  } else {
    newObj = value;
  }

  CacheSet(collectionName, id, { ...newObj, id });
  await setDoc(doc(db, collectionName, id), newObj);
}

export async function DBCreate(collectionName: collectionName, value: object) {
  const resID = (await addDoc(collection(db, collectionName), value)).id;
  CacheSet(collectionName, resID, { ...value, id: resID });
  return resID;
}

export async function DBDelete(
  collectionName: collectionName,
  queries?: queryTuple[],
  queryStyle?: queryStyle
) {
  const docs = await DBGet(collectionName, queries, queryStyle);
  await Promise.all(
    docs.map(async (obj) => {
      await deleteDoc(doc(db, collectionName, obj.id));
      CacheDelete(collectionName, obj.id);
    })
  );
}

export async function DBDeleteWithID(
  collectionName: collectionName,
  id: string
) {
  await deleteDoc(doc(db, collectionName, id));
  CacheDelete(collectionName, id);
}

function CacheGet(collection: collectionName, id: string) {
  return DBCache.get(collection + id);
}

function CacheSet(collection: collectionName, id: string, val: DBObj) {
  DBCache.set(collection + id, val);
}

function CacheDelete(collection: collectionName, id: string) {
  // this is done so subsequent get requests don't need to check DB to see item was deleted.
  DBCache.set(collection + id, undefined);
}

