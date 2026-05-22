"use client";

import { useState } from "react";
import { IntroScreen } from "./IntroScreen";

export function HomeWithIntro({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      {!introDone && <IntroScreen onComplete={() => setIntroDone(true)} />}
      {children}
    </>
  );
}
