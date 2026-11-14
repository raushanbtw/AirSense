import { useState } from "react";

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
    <div className="signin">
      <h3 className="subhead">Already registered?</h3>
      <form onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {problem && <p className="error">{problem}</p>}
        <button type="submit" disabled={loading}>
          Sign in
        </button>
      </form>
      <p className="small">
        This development version finds your profile by email only, without a password.
      </p>
    </div>
  );
}

export default SignInForm;