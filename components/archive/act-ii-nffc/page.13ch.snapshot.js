import Nav from "@/components/dom/Nav";
import ChapterLettering from "@/components/dom/ChapterLettering";
import ChainLabels from "@/components/dom/ChainLabels";
import NebulaMessages from "@/components/dom/NebulaMessages";
import OrbitalRingLabels from "@/components/dom/OrbitalRingLabels";
import NffcIdentityCard from "@/components/dom/NffcIdentityCard";
import MarketStats from "@/components/dom/MarketStats";
import FinalCta from "@/components/dom/FinalCta";
import ExperienceLoader from "@/components/canvas/ExperienceLoader";
import ChapterNavigation from "@/lib/scroll/ChapterNavigation";

// ChapterOverlay y MicroHud (HUD inferior) se eliminaron del proyecto;
// este snapshot ya no los monta.

export default function Home() {
  return (
    <>
      <ChapterNavigation />
      <ExperienceLoader />
      <Nav />
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
    </>
  );
}
