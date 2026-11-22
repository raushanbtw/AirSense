import { useState } from "react";
import { Mail } from "lucide-react";

function SignInForm({ onSignIn, loading }) {
  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setProblem(null);

    if (email.trim() === "") {
      setProblem("Enter the email you registered with.");
      return;
    }

    const result = await onSignIn(email.trim());
    if (result) setProblem(result);
  };

  return (
    <form className="card tint-teal pf-signin" onSubmit={submit}>
      <label className="pf-field">
        Email you registered with
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      {problem && <p className="error">{problem}</p>}

      <button type="submit" disabled={loading}>
        <Mail size={16} />
        Sign in
      </button>

      <p className="tiny">
        Development version: your profile is found by email only, without a password.
      </p>
    </form>
  );
}

export default SignInForm;