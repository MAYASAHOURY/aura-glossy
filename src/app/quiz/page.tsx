"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { aesthetics } from "@/data/aesthetics";
import { ease } from "@/lib/animations";

interface Choice {
  label: string;
  description: string;
  scores: Record<string, number>;
  color: string;
}

interface Question {
  id: number;
  question: string;
  subtext: string;
  choices: Choice[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "How do you enter a room?",
    subtext: "Your presence communicates before you say a word.",
    choices: [
      {
        label: "With quiet authority",
        description: "Composed, considered, head held exactly right.",
        scores: { classic: 3, elegant: 3, minimalist: 2 },
        color: "#C4973B",
      },
      {
        label: "With unapologetic confidence",
        description: "Eyes forward, energy forward, taking up space.",
        scores: { streetwear: 3, "dark-academia": 2, y2k: 2 },
        color: "#E84040",
      },
      {
        label: "With soft, warm presence",
        description: "The kind of person a room is happy to have.",
        scores: { "soft-girl": 3, casual: 2, "korean-fashion": 2, vintage: 1 },
        color: "#E8A0C0",
      },
      {
        label: "With precise, effortless cool",
        description: "Clean. On point. Intentional in every detail.",
        scores: { minimalist: 3, "korean-fashion": 3, casual: 1 },
        color: "#A0A09A",
      },
    ],
  },
  {
    id: 2,
    question: "Which weekend calls to you?",
    subtext: "Your ideal Saturday reveals your soul's aesthetic.",
    choices: [
      {
        label: "A gallery, then a long lunch",
        description: "Art, architecture, conversation over wine.",
        scores: { classic: 2, minimalist: 3, "dark-academia": 2 },
        color: "#A0A09A",
      },
      {
        label: "Exploring vintage markets",
        description: "Searching for the piece that was waiting for you.",
        scores: { vintage: 3, "dark-academia": 2, casual: 1 },
        color: "#D4A853",
      },
      {
        label: "Street food, murals, and movement",
        description: "Urban exploration. The city as your backdrop.",
        scores: { streetwear: 3, y2k: 2, "korean-fashion": 2 },
        color: "#E84040",
      },
      {
        label: "A bookstore, cosy café, and home",
        description: "Quiet pleasures. Rich thoughts. Soft light.",
        scores: { "dark-academia": 3, "soft-girl": 2, elegant: 2, vintage: 1 },
        color: "#8B7355",
      },
    ],
  },
  {
    id: 3,
    question: "Which colour palette feels like home?",
    subtext: "Colour is the first language your wardrobe speaks.",
    choices: [
      {
        label: "Neutrals: cream, camel, black",
        description: "Enduring tones. The foundation of everything.",
        scores: { classic: 3, minimalist: 2, elegant: 2 },
        color: "#C4973B",
      },
      {
        label: "Pastels: blush, lavender, mint",
        description: "Soft light through rose-coloured glass.",
        scores: { "soft-girl": 3, "korean-fashion": 2, y2k: 1 },
        color: "#E8A0C0",
      },
      {
        label: "Rich earth tones: burgundy, rust, deep green",
        description: "Depth, warmth, and centuries of story.",
        scores: { "dark-academia": 3, vintage: 3, classic: 1 },
        color: "#8B7355",
      },
      {
        label: "Chrome, neon, holographic",
        description: "Future-forward. Reflective. Unafraid.",
        scores: { y2k: 3, streetwear: 2 },
        color: "#9090E8",
      },
    ],
  },
  {
    id: 4,
    question: "Which texture speaks to you?",
    subtext: "Fashion lives in the touch as much as the look.",
    choices: [
      {
        label: "Silk, satin, fine wool",
        description: "The luxury of quality. Fabric that drapes and dreams.",
        scores: { elegant: 3, classic: 2, vintage: 1 },
        color: "#C8B8A8",
      },
      {
        label: "Linen, cotton, chambray",
        description: "Breathable, natural, honest materials.",
        scores: { casual: 3, minimalist: 2, "korean-fashion": 1 },
        color: "#7A9E7E",
      },
      {
        label: "Tweed, corduroy, chunky knit",
        description: "Texture with a story. Tactile and literary.",
        scores: { "dark-academia": 3, vintage: 2, classic: 1 },
        color: "#8B7355",
      },
      {
        label: "Velvet, metallic, fluffy",
        description: "Tactile drama. Touch-me-if-you-dare.",
        scores: { "soft-girl": 2, y2k: 3, elegant: 1 },
        color: "#D4B8CC",
      },
    ],
  },
  {
    id: 5,
    question: "Which statement sounds most like you?",
    subtext: "Your philosophy of dress, in one sentence.",
    choices: [
      {
        label: "\"I dress to last, not to trend.\"",
        description: "Your wardrobe is an investment in who you are.",
        scores: { classic: 3, minimalist: 2, elegant: 2 },
        color: "#C4973B",
      },
      {
        label: "\"My clothes are a conversation.\"",
        description: "Fashion as self-expression and cultural dialogue.",
        scores: { streetwear: 3, "korean-fashion": 2, y2k: 1 },
        color: "#E84040",
      },
      {
        label: "\"I dress for the feeling, not the occasion.\"",
        description: "Aesthetic first, practicality second.",
        scores: { "soft-girl": 2, vintage: 2, "dark-academia": 3, elegant: 1 },
        color: "#8B7355",
      },
      {
        label: "\"My best look should feel like nothing.\"",
        description: "Effortless. Natural. The absence of effort as art.",
        scores: { casual: 3, minimalist: 3, "korean-fashion": 1 },
        color: "#A0A09A",
      },
    ],
  },
];

function calculateResult(answers: number[]) {
  const scores: Record<string, number> = {};
  aesthetics.forEach((a) => (scores[a.id] = 0));

  answers.forEach((choiceIndex, questionIndex) => {
    if (choiceIndex === -1) return;
    const choice = questions[questionIndex].choices[choiceIndex];
    Object.entries(choice.scores).forEach(([id, score]) => {
      scores[id] = (scores[id] || 0) + score;
    });
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return {
    primary: aesthetics.find((a) => a.id === sorted[0][0])!,
    secondary: aesthetics.find((a) => a.id === sorted[1][0])!,
  };
}

export default function QuizPage() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<ReturnType<typeof calculateResult> | null>(null);

  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;

  function handleSelect(i: number) {
    setSelected(i);
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const r = calculateResult(newAnswers);
      setResult(r);
      setPhase("result");
    }
  }

  return (
    <div className="min-h-screen bg-aura-black">
      <Navigation />

      {/* Intro */}
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7 }}
          >
            <motion.p
              className="text-label text-gold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Aesthetic Discovery
            </motion.p>
            <motion.h1
              className="font-cormorant text-cream font-light mb-6"
              style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 0.92 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, ease }}
            >
              Find Your
              <br />
              <em className="italic">Aesthetic</em>
            </motion.h1>
            <motion.p
              className="text-body text-cream/50 max-w-md mb-10 text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Five questions. Infinite style. Discover which fashion world reflects your truest
              self.
            </motion.p>
            <motion.button
              onClick={() => setPhase("quiz")}
              className="group flex items-center gap-3 text-label text-aura-black bg-cream px-10 py-4 hover:bg-gold transition-colors duration-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              Begin the Quiz
              <svg
                className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>
        )}

        {/* Quiz */}
        {phase === "quiz" && (
          <motion.div
            key={`q-${currentQ}`}
            className="min-h-screen flex flex-col px-8 pt-28 pb-16"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="max-w-3xl mx-auto w-full">
              {/* Progress */}
              <div className="flex items-center gap-4 mb-12">
                <div className="flex-1 h-px bg-white/8 relative overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gold"
                    initial={{ width: `${progress}%` }}
                    animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.6, ease }}
                  />
                </div>
                <p className="text-label text-cream/30" style={{ fontSize: "0.6rem" }}>
                  {currentQ + 1} / {questions.length}
                </p>
              </div>

              {/* Question */}
              <p className="text-label text-gold mb-4">Question {currentQ + 1}</p>
              <h2
                className="font-cormorant text-cream font-light mb-3"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)" }}
              >
                {q.question}
              </h2>
              <p className="text-body text-cream/40 text-sm mb-10 italic">{q.subtext}</p>

              {/* Choices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
                {q.choices.map((choice, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`relative text-left p-6 border transition-all duration-300 ${
                      selected === i
                        ? "border-opacity-100"
                        : "border-white/8 hover:border-white/20"
                    }`}
                    style={
                      selected === i
                        ? { borderColor: choice.color, backgroundColor: choice.color + "12" }
                        : {}
                    }
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                    whileHover={{ y: -2 }}
                  >
                    {selected === i && (
                      <motion.div
                        className="absolute top-4 right-4 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: choice.color }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </motion.div>
                    )}
                    <p className="text-body text-cream/80 text-sm font-medium mb-2">
                      {choice.label}
                    </p>
                    <p className="text-body text-cream/35 text-xs leading-relaxed">
                      {choice.description}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Next button */}
              <motion.button
                onClick={handleNext}
                disabled={selected === null}
                className={`flex items-center gap-3 text-label px-8 py-4 transition-all duration-300 ${
                  selected !== null
                    ? "bg-cream text-aura-black cursor-pointer hover:bg-gold"
                    : "bg-white/5 text-cream/20 cursor-not-allowed"
                }`}
                whileHover={selected !== null ? { x: 4 } : {}}
              >
                {currentQ < questions.length - 1 ? "Next Question" : "Reveal My Aesthetic"}
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Result */}
        {phase === "result" && result && (
          <motion.div
            key="result"
            className="min-h-screen flex flex-col items-center justify-center px-8 text-center pt-24 pb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.p
              className="text-label text-cream/40 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your Aesthetic is
            </motion.p>

            <motion.h1
              className="font-cormorant font-light leading-none mb-4"
              style={{
                fontSize: "clamp(4rem, 12vw, 10rem)",
                color: result.primary.accentColor,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease }}
            >
              {result.primary.name}
            </motion.h1>

            <motion.p
              className="font-cormorant italic text-cream/50 mb-6"
              style={{ fontSize: "clamp(1.1rem, 2vw, 1.6rem)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {result.primary.tagline}
            </motion.p>

            <motion.p
              className="text-body text-cream/40 max-w-lg mb-3 text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {result.primary.description}
            </motion.p>

            {result.secondary && (
              <motion.p
                className="text-label text-cream/25 mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                With hints of{" "}
                <span className="text-cream/50">{result.secondary.name}</span>
              </motion.p>
            )}

            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
            >
              <Link
                href={`/aesthetic/${result.primary.id}`}
                className="group flex items-center gap-3 text-label text-aura-black px-8 py-4 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: result.primary.accentColor }}
              >
                Explore {result.primary.name}
                <svg
                  className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <button
                onClick={() => {
                  setPhase("intro");
                  setCurrentQ(0);
                  setAnswers(new Array(questions.length).fill(-1));
                  setSelected(null);
                  setResult(null);
                }}
                className="text-label text-cream/40 hover:text-cream transition-colors underline underline-offset-4 decoration-cream/20"
              >
                Retake Quiz
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
