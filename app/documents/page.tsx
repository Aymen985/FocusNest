"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection, getDocs, doc, deleteDoc, query, orderBy,
} from "firebase/firestore";

// --- Types --------------------------------------------------------------------

type Doc = {
  id: string;
  name: string;
  uploadedAt: string;
  chunkCount: number;
};

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; name: string; progress: number }
  | { status: "success"; name: string }
  | { status: "error"; message: string };

// --- Helpers ------------------------------------------------------------------

const ACCEPTED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ACCEPTED_EXT = ".pdf,.docx,.txt";
const MAX_MB = 20;

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf")  return { icon: "PDF",  color: "text-red-400",    bg: "bg-red-500/10"    };
  if (ext === "docx") return { icon: "DOC",  color: "text-blue-400",   bg: "bg-blue-500/10"   };
  return                     { icon: "TXT",  color: "text-neutral-400", bg: "bg-neutral-500/10" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatSize(chunks: number) {
  // rough estimate: ~500 chars/chunk ~ 0.5 KB
  const kb = Math.round(chunks * 0.5);
  return kb > 999 ? `${(kb / 1000).toFixed(1)} MB` : `${kb} KB`;
}

// --- Upload area --------------------------------------------------------------

function UploadZone({
  onUpload,
  uploadState,
}: {
  onUpload: (file: File) => void;
  uploadState: UploadState;
}) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  const busy = uploadState.status === "uploading";

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => !busy && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3
        border-2 border-dashed rounded-2xl px-6 py-10 text-center
        transition-all cursor-pointer select-none
        ${drag
          ? "border-emerald-500 bg-emerald-500/5"
          : "border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/40"
        }
        ${busy ? "pointer-events-none opacity-70" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT}
        className="hidden"
        onChange={handleChange}
      />

      {/* Icon */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${drag ? "bg-emerald-500/20" : "bg-neutral-800"}`}>
        {busy ? (
          <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        ) : (
          <svg className={`w-6 h-6 transition-colors ${drag ? "text-emerald-400" : "text-neutral-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        )}
      </div>

      {/* Text */}
      {uploadState.status === "uploading" ? (
        <>
          <p className="text-sm font-medium text-neutral-300">
            Uploading {uploadState.name}...
          </p>
          <div className="w-48 h-1.5 rounded-full bg-neutral-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="text-sm font-semibold text-neutral-200">
              {drag ? "Drop to upload" : "Drop a file or click to browse"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              PDF, DOCX, or TXT &middot; max {MAX_MB} MB
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// --- Document row -------------------------------------------------------------

function DocRow({
  doc: d,
  deleting,
  onDelete,
}: {
  doc: Doc;
  deleting: boolean;
  onDelete: () => void;
}) {
  const { icon, color, bg } = fileIcon(d.name);

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-800/50 transition-colors group">
      {/* file type badge */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <span className={`text-[10px] font-bold ${color}`}>{icon}</span>
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-100 truncate" title={d.name}>
          {d.name}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">
          {d.chunkCount} chunks &middot; ~{formatSize(d.chunkCount)} &middot; {formatDate(d.uploadedAt)}
        </p>
      </div>

      {/* delete */}
      <button
        onClick={onDelete}
        disabled={deleting}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}

// --- Page ---------------------------------------------------------------------

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  // -- Fetch --
  async function fetchDocuments() {
    const user = auth.currentUser;
    if (!user) return;
    const q    = query(collection(db, "users", user.uid, "documents"), orderBy("uploadedAt", "desc"));
    const snap = await getDocs(q);
    setDocuments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Doc)));
    setLoading(false);
  }

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) fetchDocuments();
      else setLoading(false);
    });
    return unsub;
  }, []);

  // -- Upload --
  async function handleUpload(file: File) {
    if (!ACCEPTED.includes(file.type) && !file.name.endsWith(".txt")) {
      setUploadState({ status: "error", message: "Only PDF, DOCX, and TXT files are supported." });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadState({ status: "error", message: `File is too large. Max size is ${MAX_MB} MB.` });
      return;
    }

    setUploadState({ status: "uploading", name: file.name, progress: 10 });

    try {
      const token = await auth.currentUser?.getIdToken();

      const ticker = setInterval(() => {
        setUploadState((prev) =>
          prev.status === "uploading" && prev.progress < 85
            ? { ...prev, progress: prev.progress + 10 }
            : prev
        );
      }, 400);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      clearInterval(ticker);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed");
      }

      setUploadState({ status: "uploading", name: file.name, progress: 100 });

      await fetchDocuments();
      setUploadState({ status: "success", name: file.name });
      setTimeout(() => setUploadState({ status: "idle" }), 3000);
    } catch (err: any) {
      setUploadState({ status: "error", message: err.message || "Upload failed." });
    }
  }

  // -- Delete --
  async function handleDelete(docId: string) {
    const user = auth.currentUser;
    if (!user) return;
    setDeleting(docId);
    try {
      const chunksSnap = await getDocs(
        collection(db, "users", user.uid, "documents", docId, "chunks")
      );
      await Promise.all(chunksSnap.docs.map((c) => deleteDoc(c.ref)));
      await deleteDoc(doc(db, "users", user.uid, "documents", docId));
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">Documents</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Upload study materials &mdash; your assistant will use them to answer questions.
          </p>
        </div>

        {/* Upload zone */}
        <div className="mb-3">
          <UploadZone onUpload={handleUpload} uploadState={uploadState} />
        </div>

        {/* Upload feedback */}
        {uploadState.status === "success" && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-4">
            &ldquo;{uploadState.name}&rdquo; uploaded successfully.
          </p>
        )}
        {uploadState.status === "error" && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
            {uploadState.message}
            <button
              onClick={() => setUploadState({ status: "idle" })}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </p>
        )}

        {/* Document list */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
              Uploaded files
            </h2>
            {documents.length > 0 && (
              <span className="text-xs text-neutral-500">{documents.length} file{documents.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-400 mb-1">No documents yet</p>
                <p className="text-xs text-neutral-600">
                  Upload a PDF, DOCX, or TXT above to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {documents.map((d) => (
                  <DocRow
                    key={d.id}
                    doc={d}
                    deleting={deleting === d.id}
                    onDelete={() => handleDelete(d.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
