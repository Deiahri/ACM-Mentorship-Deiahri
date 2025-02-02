
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { collection, getDocs, getFirestore, query as firebaseQuery, where, orderBy, updateDoc, doc, setDoc, addDoc, getDoc, deleteDoc, QueryConstraint, or, QueryFieldFilterConstraint, QueryCompositeFilterConstraint } from 'firebase/firestore';

import dotenv from 'dotenv';
dotenv.config();

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIRESTORE_APIKEY,
    authDomain: "mentorship-app-23aac.firebaseapp.com",
    projectId: "mentorship-app-23aac",
    storageBucket: "mentorship-app-23aac.firebasestorage.app",
    messagingSenderId: "118949702190",
    appId: "1:118949702190:web:4f06559f7d22122cb68dbf"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

// list of all collection names
export type collectionName = 'user' | 'chat' | 'message' | 'friendship';
export const collectionsNames = ['user', 'chat', 'message', 'friendship'];

type comparisonOperator = '<' | '>' | '<=' | '>=' | '==' | '!=' | "array-contains";
type queryTuple = [string, comparisonOperator, string|null|number];
type queryStyle = 'or' | 'and';
type orderDirection = 'asc' | 'desc';
type orderTuple = [string, orderDirection];
export type DBObj = { id: string, [key: string]: any };

export async function DBGetWithID(collection: collectionName, id: string): Promise<DBObj|undefined> {
    try {
        const res = (await getDoc(doc(db, collection, id))).data();
        if (!res) {
            return undefined;
        }
        return { ...res, id };
    } catch {
        return undefined;
    }
}

export async function DBGet(collectionName: collectionName, queries?: queryTuple[], queryStyle?: queryStyle, order?: orderTuple): Promise<DBObj[]> {
    let res;
    if (!queries) {
        if (!order) {
            res = await getDocs(firebaseQuery(collection(db, collectionName)));
        } else {
            res =  await getDocs(firebaseQuery(collection(db, collectionName), orderBy(...order)));
        }
    } else {
        let compoundQuery: QueryFieldFilterConstraint[] = queries.map((qT: queryTuple) => {
            return where(...qT);
        });
        
        const isOr = queryStyle == 'or';
        if (!order) {
            if (!isOr) {
                res = await getDocs(firebaseQuery(collection(db, collectionName), ...compoundQuery));
            } else {
                res = await getDocs(firebaseQuery(collection(db, collectionName), or(...compoundQuery)));
            }
        } else {
            if (!isOr) {
                res = await getDocs(firebaseQuery(collection(db, collectionName), ...compoundQuery, orderBy(...order)));
            } else {
                res = await getDocs(firebaseQuery(collection(db, collectionName), or(...compoundQuery), orderBy(...order)));
            }
        }
    }
    if (res.empty) {
        return [];
    } else {
        const returnArr: DBObj[] = [];
        res.forEach((doc) => {
            returnArr.push({ ...doc.data(), id: doc.id });
        })
        return returnArr;
    }
}

export async function DBSet(collectionName: collectionName, value: object, queries?: queryTuple[], queryStyle?: queryStyle, combine: boolean = false) {
    const res = await DBGet(collectionName, queries, queryStyle);
    res.forEach((obj) => {
        if (combine) {
            updateDoc(doc(db, collectionName, obj.id), value);
        } else {
            setDoc(doc(db, collectionName, obj.id), value);
        }
    });
}

export async function DBSetWithID(collectionName: collectionName, id: string, value: object, combine: boolean = false) {
    if (combine) {
        updateDoc(doc(db, collectionName, id), value);
    } else {
        setDoc(doc(db, collectionName, id), value);
    }
}

export async function DBCreate(collectionName: collectionName, value: object) {
    return (await addDoc(collection(db, collectionName), value)).id;
}

export async function DBDelete(collectionName: collectionName, queries?: queryTuple[], queryStyle?: queryStyle) {
    const docs = await DBGet(collectionName, queries, queryStyle);
    docs.forEach(async (obj) => {
        await deleteDoc(doc(db, collectionName, obj.id));
    });
}

export async function DBDeleteWithID(collectionName: collectionName, id: string) {
    await deleteDoc(doc(db, collectionName, id));
}
