import { useEffect, useState } from "react";
import {
  Wind,
  HeartPulse,
  User,
  Bell,
  Check,
  LogOut,
  Save,
  ShieldCheck,
} from "lucide-react";
import Section from "../components/Section";
import HeroImage from "../components/HeroImage";
import SignInForm from "../components/SignInForm";
import { aqiCategory } from "../utils/aqiColors";

const EMPTY = {
  name: "",
  email: "",
  age: "",
  asthma: false,
  elderly: false,
  children: false,
  alertsEnabled: true,
  threshold: 100,
};

function toForm(user) {
  if (!user) return EMPTY;
  return {
    name: user.name || "",
    email: user.email || "",
    age: user.age ?? "",
    asthma: Boolean(user.healthProfile?.asthma),
    elderly: Boolean(user.healthProfile?.elderly),
    children: Boolean(user.healthProfile?.children),
    alertsEnabled: user.alertPreferences?.enabled !== false,
    threshold: user.alertPreferences?.aqiThreshold ?? 100,
  };
}

function toPayload(form) {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    healthProfile: {
      asthma: form.asthma,
      elderly: form.elderly,
      children: form.children,
    },
    alertPreferences: {
      enabled: form.alertsEnabled,
      aqiThreshold: Number(form.threshold),
    },
  };
  if (String(form.age).trim() !== "") payload.age = Number(form.age);
  return payload;
}

const SENSITIVITIES = [
  {
    key: "asthma",
    title: "Asthma",
    note: "Polluted air can trigger symptoms.",
    icon: Wind,
    tint: "tint-blue",
  },
  {
    key: "elderly",
    title: "Elderly",
    note: "Older adults can be more affected by polluted air.",
    icon: HeartPulse,
    tint: "tint-purple",
  },
  {
    key: "children",
    title: "Children",
    note: "Children's lungs are still developing.",
    icon: User,
    tint: "tint-green",
  },
];

function Profile({ profile }) {
  const { user, loading, error, message, save, signIn, forget } = profile;
  const [form, setForm] = useState(toForm(user));
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    setForm(toForm(user));
  }, [user]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLocalError(null);

    const threshold = Number(form.threshold);
    if (!Number.isInteger(threshold) || threshold < 0 || threshold > 500) {
      setLocalError("The alert threshold must be a whole number between 0 and 500.");
      return;
    }

    await save(toPayload(form));
  };

  const threshold = Number(form.threshold);
  const thresholdValid = Number.isFinite(threshold) && threshold >= 0 && threshold <= 500;
  const preview = aqiCategory(thresholdValid ? threshold : null);
  const initial = (user?.name || "").trim().charAt(0).toUpperCase();

  const flags = [];
  if (user?.healthProfile?.asthma) flags.push("Asthma");
  if (user?.healthProfile?.elderly) flags.push("Elderly");
  if (user?.healthProfile?.children) flags.push("Children");

  return (
    <main className="dash">
      {/* Banner */}
      <section className="hero profile-hero">
        <HeroImage mood="none" />
        <div className="hero-shade" />

        <div className="hero-body">
          <div className="pf-avatar">{initial || <User size={34} />}</div>

          <div className="pf-hero-text">
            <h2 className="pf-hello">
              {user ? `Hello, ${user.name}` : "Create your profile"}
            </h2>
            <p className="hero-sub">
              {user
                ? user.email
                : "Set your health sensitivity to get an advisory that fits you."}
            </p>

            {user && (
              <div className="pf-chips">
                {flags.map((f) => (
                  <span key={f} className="pf-chip">
                    {f}
                  </span>
                ))}
                <span className="pf-chip">
                  {user.alertPreferences?.enabled !== false
                    ? `Alerts above AQI ${user.alertPreferences?.aqiThreshold ?? 100}`
                    : "Alerts off"}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sign in, only when nobody is signed in */}
      {!user && (
        <Section title="Already registered?" icon={User}>
          <SignInForm onSignIn={signIn} loading={loading} />
        </Section>
      )}

      <form className="pf-form" onSubmit={submit}>
        {/* Personal details */}
        <Section title="Personal Details" icon={User}>
          <div className="cat-row">
            <div className="card tint-white">
              <div className="pf-grid">
                <label className="pf-field">
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </label>

                <label className="pf-field">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </label>

                <label className="pf-field">
                  Age (optional)
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={form.age}
                    onChange={(e) => set("age", e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="card tint-blue">
              <h2>
                <ShieldCheck size={20} /> How your profile is used
              </h2>
              <p className="advice-line">
                The dashboard compares the current AQI with your alert threshold.
              </p>
              <p className="advice-line">
                If a sensitivity is selected and the AQI is above 100, the advisory adds a
                caution. On the standard scale, values above 100 are considered unhealthy
                for sensitive groups.
              </p>
              <p className="advice-line">
                This is general information, not medical advice. Notifications are not sent
                yet.
              </p>
            </div>
          </div>
        </Section>

        {/* Health sensitivity */}
        <Section title="Health Sensitivity" icon={HeartPulse}>
          <div className="tile-grid">
            {SENSITIVITIES.map((item) => {
              const Icon = item.icon;
              const on = form[item.key];
              return (
                <label
                  key={item.key}
                  className={`card tile ${on ? "on " + item.tint : "tint-grey"}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => set(item.key, e.target.checked)}
                  />
                  <span className="tile-check">{on && <Check size={14} />}</span>
                  <Icon size={30} />
                  <strong>{item.title}</strong>
                  <span className="small">{item.note}</span>
                </label>
              );
            })}
          </div>
        </Section>

        {/* Pollution alerts */}
        <Section title="Pollution Alerts" icon={Bell}>
          <div className="pf-alert">
            <label className={`card tile ${form.alertsEnabled ? "on tint-yellow" : "tint-grey"}`}>
              <input
                type="checkbox"
                checked={form.alertsEnabled}
                onChange={(e) => set("alertsEnabled", e.target.checked)}
              />
              <span className="tile-check">{form.alertsEnabled && <Check size={14} />}</span>
              <Bell size={30} />
              <strong>Alert me about high AQI</strong>
              <span className="small">
                When off, the dashboard still shows the AQI but does not flag your threshold.
              </span>
            </label>

            <div className="card tint-white">
              <label className="pf-field">
                AQI threshold (0 to 500)
                <div className="pf-threshold-row">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={form.threshold}
                    onChange={(e) => set("threshold", e.target.value)}
                  />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="5"
                    value={thresholdValid ? threshold : 100}
                    onChange={(e) => set("threshold", e.target.value)}
                  />
                </div>
              </label>

              <p className="advice-line">
                Alert when the AQI is above{" "}
                <strong>{thresholdValid ? threshold : "..."}</strong>{" "}
                <span className="pf-pill" style={{ background: preview.color }}>
                  {preview.label}
                </span>
              </p>
            </div>
          </div>
        </Section>

        {(localError || error) && (
          <div className="card tint-red pf-msg">
            <p className="error">{localError || error}</p>
          </div>
        )}
        {message && (
          <div className="card tint-green pf-msg">
            <p className="success">{message}</p>
          </div>
        )}

        <div className="pf-actions">
          <button type="submit" disabled={loading}>
            <Save size={16} />
            {loading ? "Saving..." : user ? "Save changes" : "Create profile"}
          </button>

          {user && (
            <button type="button" className="secondary" onClick={forget}>
              <LogOut size={16} />
              Sign out
            </button>
          )}
        </div>
      </form>
    </main>
  );
}

export default Profile;