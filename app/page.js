import Nav from "@/components/dom/Nav";
import ChapterOverlay from "@/components/dom/ChapterOverlay";
import MicroHud from "@/components/dom/MicroHud";
import ChapterLettering from "@/components/dom/ChapterLettering";
import EcosystemNodes from "@/components/dom/EcosystemNodes";
import NebulaMessages from "@/components/dom/NebulaMessages";
import FinalCta from "@/components/dom/FinalCta";
import Letterbox from "@/components/dom/Letterbox";
import ExperienceLoader from "@/components/canvas/ExperienceLoader";
import ChapterNavigation from "@/lib/scroll/ChapterNavigation";
import { CINEMATIC } from "@/lib/tuning";

// ChapterOverlay (número de capítulo + progreso crudo) es un HUD de
// desarrollo, no parte del diseño — fuera solo en producción.
const showDevOverlay = process.env.NODE_ENV !== "production";

// Restructuración a 5 capítulos: "nffc" en adelante se archivó (ver
// docs/ARCHIVED_NFFC_ACT.md — el árbol de esta página con 13 capítulos vive
// como referencia en components/archive/act-ii-nffc/page.13ch.snapshot.js).
// FinalCta.jsx se mantiene tal cual, ahora como cierre de "the-universe" en
// vez de un capítulo propio.
export default function Home() {
  return (
    <>
      <ChapterNavigation />
      <ExperienceLoader />
      <Nav />
      {showDevOverlay && <ChapterOverlay />}
      <MicroHud />
      <ChapterLettering />
      <EcosystemNodes />
      <NebulaMessages />
      <FinalCta />
      {CINEMATIC.letterbox.enabled && <Letterbox />}
    </>
  );
}
