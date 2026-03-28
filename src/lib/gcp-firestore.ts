import { Firestore, FieldValue } from "@google-cloud/firestore";

/**
 * Google Cloud Firestore — persist analysis history and user profiles.
 * Stores food label analyses for trend tracking and user dashboards.
 * Requires GOOGLE_APPLICATION_CREDENTIALS or running on GCP with appropriate IAM.
 */

let _db: Firestore | null = null;

function getFirestore(): Firestore {
  if (_db) return _db;
  _db = new Firestore();
  return _db;
}

export interface AnalysisRecord {
  userId?: string;
  labelText: string;
  verdict: "good" | "okay" | "avoid";
  reason: string;
  flags: string[];
  profile: string[];
  createdAt: FirebaseFirestore.Timestamp;
}

const ANALYSES_COLLECTION = "analyses";
const USERS_COLLECTION = "users";

/** Save an analysis result to Firestore */
export async function saveAnalysis(
  labelText: string,
  verdict: string,
  reason: string,
  flags: string[],
  profile: string[],
  userId?: string
): Promise<string> {
  const db = getFirestore();
  const docRef = await db.collection(ANALYSES_COLLECTION).add({
    userId: userId || "anonymous",
    labelText,
    verdict,
    reason,
    flags,
    profile,
    createdAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

/** Get recent analyses, optionally filtered by user */
export async function getRecentAnalyses(
  limit: number = 10,
  userId?: string
): Promise<AnalysisRecord[]> {
  const db = getFirestore();
  let query = db
    .collection(ANALYSES_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (userId) {
    query = query.where("userId", "==", userId);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data() as AnalysisRecord);
}

/** Save or update a user's health profile */
export async function saveUserProfile(
  userId: string,
  profile: string[]
): Promise<void> {
  const db = getFirestore();
  await db.collection(USERS_COLLECTION).doc(userId).set(
    {
      profile,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/** Get a user's health profile */
export async function getUserProfile(
  userId: string
): Promise<string[] | null> {
  const db = getFirestore();
  const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
  if (!doc.exists) return null;
  return doc.data()?.profile || [];
}
