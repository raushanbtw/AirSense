import SkylineScene from "./SkylineScene";

const files = import.meta.glob("../assets/hero*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const PREFERENCE = ["/hero.", "/hero-good.", "/hero-moderate.", "/hero-poor."];

function findBaseImage() {
  for (const part of PREFERENCE) {
    const key = Object.keys(files).find((path) => path.includes(part));
    if (key) return files[key];
  }
  return Object.values(files)[0] || null;
}

const BASE_IMAGE = findBaseImage();

// How much white fog covers the photo for each mood
const FOG = {
  none: { opacity: 0, filter: "none" },
  good: { opacity: 0, filter: "saturate(1.1)" },
  moderate: { opacity: 0.35, filter: "saturate(0.85)" },
  poor: { opacity: 0.75, filter: "saturate(0.45) contrast(0.9)" },
};

function HeroImage({ mood }) {
  // No photo found: fall back to the drawn skyline
  if (!BASE_IMAGE) return <SkylineScene mood={mood} />;

  const fog = FOG[mood] || FOG.none;

  return (
    <>
      <img
        className="scene scene-img"
        src={BASE_IMAGE}
        alt=""
        style={{ filter: fog.filter }}
      />
      <div className="scene fog" style={{ opacity: fog.opacity }} />
    </>
  );
}

export default HeroImage;