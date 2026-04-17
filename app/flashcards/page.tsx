"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardSet {
  id: string;
  cards: Flashcard[];
  createdAt: { seconds: number };
  count: number;
}

interface DocMeta {
  id: string;
  name: string;
}

function FlipCard({
  card,
  index,
  total,
}: {
  card: Flashcard;
  index: number;
  total: number;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-neutral-400 mb-3">
        {index + 1} / {total}
      </p>
      <div
        className="w-full max-w-lg cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: 220,
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-xs font-medium text-emerald-400 mb-4 tracking-widest uppercase">
              Question
            </span>
            <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 text-center leading-snug">
              {card.front}
            </p>
            <p className="text-xs text-neutral-400 mt-6">Tap to reveal answer</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col items-center justify-center p-8"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <span className="text-xs font-medium text-emerald-500 mb-4 tracking-widest uppercase">
              Answer
            </span>
            <p className="text-base text-neutral-700 dark:text-neutral-200 text-center leading-relaxed">
              {card.back}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>("");
  const [cardCount, setCardCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedSets, setSavedSets] = useState<FlashcardSet[]>([]);
  const [view, setView] = useState<"generate" | "study" | "history">(
    "generate"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDocs(
        collection(db, "users", user.uid, "documents")
      );
      setDocs(snap.docs.map((d) => ({ id: d.id, name: d.data().name ?? d.id })));

      const setsSnap = await getDocs(
        query(
          collection(db, "users", user.uid, "flashcardSets"),
          orderBy("createdAt", "desc"),
          limit(10)
        )
      );
      setSavedSets(
        setsSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FlashcardSet, "id">),
        }))
      );
    })();
  }, [user]);

  const generate = async () => {
    if (generating) return;
    setError("");
    setGenerating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          docId: selectedDoc || undefined,
          count: cardCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setCards(data.cards);
      setCurrentIndex(0);
      setView("study");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Flashcards
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            AI-generated from your uploaded documents.
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-8 bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1">
          {(["generate", "study", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              disabled={tab === "study" && !cards.length}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                view === tab
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
              }`}
            >
              {tab}
              {tab === "study" && cards.length > 0 && (
                <span className="ml-1 text-xs text-emerald-400">
                  ({cards.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Generate view */}
        {view === "generate" && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Source document
              </label>
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All documents</option>
                {docs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Number of cards &mdash; {cardCount}
              </label>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>5</span>
                <span>20</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {docs.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 rounded-lg px-3 py-2">
                No documents uploaded yet. Go to Documents to add one.
              </p>
            )}

            <button
              onClick={generate}
              disabled={generating || docs.length === 0}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate flashcards"
              )}
            </button>
          </div>
        )}

        {/* Study view */}
        {view === "study" && cards.length > 0 && (
          <div className="space-y-6">
            <FlipCard
              card={cards[currentIndex]}
              index={currentIndex}
              total={cards.length}
            />
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-300 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                &larr; Prev
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((i) => Math.min(cards.length - 1, i + 1))
                }
                disabled={currentIndex === cards.length - 1}
                className="px-5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-300 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Next &rarr;
              </button>
            </div>
            {/* All cards list */}
            <details className="mt-6">
              <summary className="text-xs text-neutral-400 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300">
                Show all {cards.length} cards
              </summary>
              <div className="mt-3 space-y-3">
                {cards.map((c, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4"
                  >
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                      {c.front}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {c.back}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* History view */}
        {view === "history" && (
          <div className="space-y-3">
            {savedSets.length === 0 ? (
              <p className="text-sm text-neutral-400 dark:text-neutral-600 text-center py-12">
                No saved sets yet. Generate some flashcards first.
              </p>
            ) : (
              savedSets.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCards(s.cards);
                    setCurrentIndex(0);
                    setView("study");
                  }}
                  className="w-full text-left bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                >
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {s.count} flashcards
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(s.createdAt.seconds * 1000).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </p>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
