"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import Link from "next/link";

type Document = {
  id: string;
  name: string;
  uploadedAt: string;
  chunkCount: number;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchDocuments() {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "documents"),
      orderBy("uploadedAt", "desc")
    );
    const snap = await getDocs(q);
    setDocuments(
      snap.docs.map((d) => ({ id: d.id, ...d.data() } as Document))
    );
    setLoading(false);
  }

  async function deleteDocument(docId: string) {
    const user = auth.currentUser;
    if (!user) return;

    setDeleting(docId);
    try {
      const chunksSnap = await getDocs(
        collection(db, "users", user.uid, "documents", docId, "chunks")
      );
      await Promise.all(
        chunksSnap.docs.map((c) => deleteDoc(c.ref))
      );
      await deleteDoc(doc(db, "users", user.uid, "documents", docId));
      setDocuments((d) => d.filter((doc) => doc.id !== docId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchDocuments();
      else setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>My Documents</h1>
        <Link href="/" style={{ opacity: 0.7, fontSize: "0.9rem" }}>
          ← Back to dashboard
        </Link>
      </div>

      {loading ? (
        <div style={{ opacity: 0.6 }}>Loading...</div>
      ) : documents.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            borderRadius: 12,
            border: "1px dashed rgba(255,255,255,0.2)",
            textAlign: "center",
            opacity: 0.6,
          }}
        >
          No documents uploaded yet. Upload a PDF, DOCX, or TXT from the assistant.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                padding: "1rem 1.25rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>
                  {doc.name}
                </div>
                <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                  {doc.chunkCount} chunks · uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => deleteDocument(doc.id)}
                disabled={deleting === doc.id}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: 8,
                  border: "1px solid rgba(255,0,0,0.3)",
                  color: "crimson",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  background: "transparent",
                  opacity: deleting === doc.id ? 0.5 : 1,
                }}
              >
                {deleting === doc.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}