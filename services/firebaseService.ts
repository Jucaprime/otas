import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    type User as FirebaseUser
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import type { Note } from './types';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCJPYhsErrOvRc3h79HoqnaMba1dPRmNF4",
  authDomain: "financeirogemini-46751.firebaseapp.com",
  projectId: "financeirogemini-46751",
  storageBucket: "financeirogemini-46751.firebasestorage.app",
  messagingSenderId: "612730562812",
  appId: "1:612730562812:web:9abc2a39af27ec910ccf79",
  measurementId: "G-FG6FQZRK19"
};

// --- Firebase Initialization ---
initializeApp(firebaseConfig);
export const auth = getAuth();
const db = getFirestore();

// --- Firestore Service ---

const getNotesCollection = (userId: string) => collection(db, 'users', userId, 'notes');
const getNoteDoc = (userId:string, noteId: string) => doc(db, 'users', userId, 'notes', noteId);

/**
 * Listens for real-time updates to a user's notes.
 * @param userId The ID of the user.
 * @param setNotes The React state setter function to update the notes.
 * @returns An unsubscribe function to detach the listener.
 */
export const onNotesSnapshot = (
    userId: string,
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>
): (() => void) => {
    if (!userId) {
        setNotes([]);
        return () => {};
    }
    const notesCollectionRef = getNotesCollection(userId);
    const q = query(notesCollectionRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                content: data.content,
                color: data.color,
                // Convert Firestore Timestamps to milliseconds for date operations
                createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
                updatedAt: (data.updatedAt as Timestamp)?.toMillis() || Date.now(),
                uid: userId
            } as Note;
        });
        setNotes(notesData);
    }, (error) => {
        console.error("Error fetching real-time notes:", error);
        setNotes([]);
    });

    return unsubscribe;
};

export const addNote = (
    userId: string,
    noteData: { title: string; content: string; color: string }
) => {
    if (!userId) return Promise.reject("User ID is required.");
    const notesCollectionRef = getNotesCollection(userId);
    return addDoc(notesCollectionRef, {
        ...noteData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
};

export const updateNote = (
    userId: string,
    noteId: string,
    noteData: { title: string; content:string; color: string }
) => {
    if (!userId) return Promise.reject("User ID is required.");
    const noteDocRef = getNoteDoc(userId, noteId);
    return updateDoc(noteDocRef, {
        ...noteData,
        updatedAt: serverTimestamp(),
    });
};

export const updateNoteColor = (userId: string, noteId: string, color: string) => {
    if (!userId) return Promise.reject("User ID is required.");
    const noteDocRef = getNoteDoc(userId, noteId);
    return updateDoc(noteDocRef, { color, updatedAt: serverTimestamp() });
};

export const deleteNote = (userId: string, noteId: string) => {
    if (!userId) return Promise.reject("User ID is required.");
    const noteDocRef = getNoteDoc(userId, noteId);
    return deleteDoc(noteDocRef);
};

// --- Re-export Auth services for easy import in components ---
export {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    type FirebaseUser
};
