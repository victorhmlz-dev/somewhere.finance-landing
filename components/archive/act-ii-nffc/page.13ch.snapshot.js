import Nav from "@/components/dom/Nav";
import ChapterOverlay from "@/components/dom/ChapterOverlay";
import MicroHud from "@/components/dom/MicroHud";
import ChapterLettering from "@/components/dom/ChapterLettering";
import ChainLabels from "@/components/dom/ChainLabels";
import NebulaMessages from "@/components/dom/NebulaMessages";
import OrbitalRingLabels from "@/components/dom/OrbitalRingLabels";
import NffcIdentityCard from "@/components/dom/NffcIdentityCard";
import MarketStats from "@/components/dom/MarketStats";
import FinalCta from "@/components/dom/FinalCta";
import Letterbox from "@/components/dom/Letterbox";
import ExperienceLoader from "@/components/canvas/ExperienceLoader";
import ChapterNavigation from "@/lib/scroll/ChapterNavigation";
import { CINEMATIC } from "@/lib/tuning";

// ChapterOverlay (número de capítulo + progreso crudo) es un HUD de
// desarrollo, no parte del diseño — fuera solo en producción.
const showDevOverlay = process.env.NODE_ENV !== "production";

export default function Home() {
  return (
    <>
      <ChapterNavigation />
      <ExperienceLoader />
      <Nav />
      {showDevOverlay && <ChapterOverlay />}
      <MicroHud />
      <ChapterLettering />
      <ChainLabels />
      <NebulaMessages />
      {/* Cap. 07 — composición del NFFC featured */}
      <OrbitalRingLabels variant="composition" />
      {/* Cap. 11 — categorías de "your universe" */}
      <OrbitalRingLabels variant="category" />
      <NffcIdentityCard />
      <MarketStats />
      <FinalCta />
      {CINEMATIC.letterbox.enabled && <Letterbox />}
    </>
  );
}
