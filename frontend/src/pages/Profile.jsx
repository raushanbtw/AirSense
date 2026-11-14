import { useEffect, useState } from "react";
import SignInForm from "../components/SignInForm";

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

  return (
    <main className="profile">
      <section className="card profile-card">
        {!user && <SignInForm onSignIn={signIn} loading={loading} />}
        <h2>{user ? "Your profile" : "Create your profile"}</h2>
        <p className="small">
          Your health settings are used to compare the air quality with your own alert
          threshold. This is general information, not medical advice.
        </p>

        <form onSubmit={submit}>
          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </label>

          <label>
            Age (optional)
            <input
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
            />
          </label>

          <fieldset>
            <legend>Health sensitivity</legend>
            <label className="check">
              <input
                type="checkbox"
                checked={form.asthma}
                onChange={(e) => set("asthma", e.target.checked)}
              />
              Asthma
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.elderly}
                onChange={(e) => set("elderly", e.target.checked)}
              />
              Elderly
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.children}
                onChange={(e) => set("children", e.target.checked)}
              />
              Children
            </label>
          </fieldset>

          <fieldset>
            <legend>Pollution alerts</legend>
            <label className="check">
              <input
                type="checkbox"
                checked={form.alertsEnabled}
                onChange={(e) => set("alertsEnabled", e.target.checked)}
              />
              Alert me when the AQI is above my threshold
            </label>
            <label>
              AQI threshold (0 to 500)
              <input
                type="number"
                min="0"
                max="500"
                value={form.threshold}
                onChange={(e) => set("threshold", e.target.value)}
              />
            </label>
          </fieldset>

          {(localError || error) && <p className="error">{localError || error}</p>}
          {message && <p className="success">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : user ? "Save changes" : "Create profile"}
          </button>
          {user && (
            <button type="button" className="secondary" onClick={forget}>
              Use a different profile
            </button>
          )}
        </form>
      </section>
    </main>
  );
}

export default Profile;