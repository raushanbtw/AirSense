import { Wind } from "lucide-react";

// Finds src/assets/logo.png (or .jpg, .jpeg, .webp, .svg)
const logoFiles = import.meta.glob("../assets/logo.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
});
const LOGO = Object.values(logoFiles)[0] || null;

function Logo({ className = "" }) {
  if (LOGO) return <img className={className} src={LOGO} alt="AirSense" />;

  // No logo file found: show an icon and the name instead
  return (
    <span className="logo-fallback">
      <Wind size={26} />
      <strong>AirSense</strong>
    </span>
  );
}

export default Logo;