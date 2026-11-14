import { useCallback, useEffect, useState } from "react";
import { createUser, getUser, updateUser, lookupUser } from "../services/userService";

const KEY = "airsense_user_id";

function readStoredId() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function storeId(id) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // storage unavailable: the profile just won't survive a reload
  }
}

function clearId() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export default function useUserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Load the saved profile when the app starts
  useEffect(() => {
    const id = readStoredId();
    if (!id) return;

    let cancelled = false;
    setLoading(true);

    getUser(id)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 404 || status === 400) {
          clearId();
        } else {
          setError("Could not load your saved profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (payload) => {
      setError(null);
      setMessage(null);
      setLoading(true);
      try {
        const saved = user
          ? await updateUser(user._id, payload)
          : await createUser(payload);
        setUser(saved);
        storeId(saved._id);
        setMessage(user ? "Profile updated." : "Profile created.");
        return true;
      } catch (err) {
        const data = err.response?.data;
        if (data?.errors) {
          setError(data.errors.map((e) => e.msg).join(". "));
        } else {
          setError(data?.error || "Could not save the profile.");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Find an existing profile by email. Returns null on success, or an error message.
  const signIn = useCallback(async (email) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const found = await lookupUser(email);
      setUser(found);
      storeId(found._id);
      setMessage("Signed in.");
      return null;
    } catch (err) {
      if (err.response?.status === 404) return "No profile found for this email.";
      const data = err.response?.data;
      if (data?.errors) return data.errors.map((e) => e.msg).join(". ");
      return data?.error || "Could not sign in. Please try again.";
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out of this browser. The saved profile is not deleted.
  const forget = useCallback(() => {
    clearId();
    setUser(null);
    setError(null);
    setMessage(null);
  }, []);

  return { user, loading, error, message, save, signIn, forget };
}