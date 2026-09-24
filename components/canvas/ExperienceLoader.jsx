"use client";

import dynamic from "next/dynamic";

// `dynamic(..., { ssr: false })` solo se permite dentro de un Client
// Component; por eso vive aquí y no directamente en app/page.js.
const Experience = dynamic(() => import("./Experience"), { ssr: false });

export default function ExperienceLoader() {
  return <Experience />;
}
