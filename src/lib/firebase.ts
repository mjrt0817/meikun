import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';
import { UserProgress } from '../types';
import { Card, initialCards } from '../cards';

const app = initializeApp({
  projectId: config.projectId,
  appId: config.appId,
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
});

export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

// Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Login failed', error);
  }
};

export const logout = async () => {
  await signOut(auth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

const DEFAULT_PROGRESS: UserProgress = { answeredQuestions: {}, reviewList: [], mockExamScores: [], coins: 0, unlockedCards: [] };

export const loadProgress = async (userId: string): Promise<UserProgress> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<UserProgress>;
      return {
        answeredQuestions: data.answeredQuestions || {},
        reviewList: data.reviewList || [],
        mockExamScores: data.mockExamScores || [],
        coins: data.coins || 0,
        unlockedCards: data.unlockedCards || [],
        gachaRates: data.gachaRates
      };
    } else {
      // Initialize if missing
      await setDoc(docRef, DEFAULT_PROGRESS);
      return DEFAULT_PROGRESS;
    }
  } catch (error) {
    console.error('Failed to load progress', error);
    return DEFAULT_PROGRESS;
  }
};

export const saveProgress = async (userId: string, progress: UserProgress) => {
  try {
    const docRef = doc(db, 'users', userId);
    // Sanitize progress to remove any undefined fields so Firestore doesn't error
    const cleanedProgress = JSON.parse(JSON.stringify(progress, (key, value) => {
      return value === undefined ? null : value;
    }));
    await setDoc(docRef, cleanedProgress, { merge: true });
  } catch (error) {
    console.error('Failed to save progress', error);
  }
};

// Cards CRUD Operations
export const loadCards = async (): Promise<Card[]> => {
  const path = 'cards';
  try {
    const colRef = collection(db, path);
    const querySnapshot = await getDocs(colRef);
    const dbCards: Card[] = [];
    querySnapshot.forEach((doc) => {
      dbCards.push(doc.data() as Card);
    });
    
    if (dbCards.length === 0) {
      if (auth.currentUser) {
        try {
          // Seed default cards into Firestore
          const batch = writeBatch(db);
          for (const card of initialCards) {
            const cardDocRef = doc(db, 'cards', card.id);
            const cleaned = JSON.parse(JSON.stringify(card));
            batch.set(cardDocRef, cleaned);
          }
          await batch.commit();
        } catch (seedError) {
          console.warn('Failed to seed default cards:', seedError);
        }
      }
      return initialCards;
    }
    
    // Maintain a stable order for the cards
    // Sort by rarity or ID to keep consistent
    return dbCards;
  } catch (error) {
    console.warn('Failed to load cards from Firestore, falling back to local initial cards:', error);
    return initialCards;
  }
};

export const saveCard = async (card: Card) => {
  const path = `cards/${card.id}`;
  try {
    const docRef = doc(db, 'cards', card.id);
    // Sanitize card to remove any undefined fields so Firestore doesn't error
    const cleanedCard = JSON.parse(JSON.stringify(card));
    await setDoc(docRef, cleanedCard);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const removeCard = async (cardId: string) => {
  const path = `cards/${cardId}`;
  try {
    const docRef = doc(db, 'cards', cardId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
