import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const IdTokenContext = createContext<string | undefined>(undefined);

export function useIdToken() {
  const ctx = useContext(IdTokenContext);
  if (!ctx) {
    throw new Error("useIdToken must be used within an IdTokenProvider");
  }
  return ctx;
}

export function AutoLogin({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, loginWithRedirect, getIdTokenClaims } =
    useAuth0();

  const [idToken, setIdToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect().catch((err) => setError(err));
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isAuthenticated) {
        if (!cancelled) setIdToken(null);
        return;
      }

      try {
        const claims = await getIdTokenClaims();
        const token = claims?.__raw ?? null;

        if (!token) {
          throw new Error("Auth0 returned no ID token (__raw missing).");
        }

        if (!cancelled) {
          setIdToken(token);
        }
      } catch (e) {
        if (!cancelled) setError(e as Error);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, getIdTokenClaims]);

  const value = useMemo<string | undefined>(() => {
    return idToken ?? undefined;
  }, [idToken]);

  const ready = !isLoading && isAuthenticated && !!idToken && !error;

  if (error) {
    return (
      <div>
        <p>Authentication error</p>
        <pre>{error.message}</pre>
      </div>
    );
  }

  if (!ready) {
    return <p>Loading...</p>;
  }

  return (
    <IdTokenContext.Provider value={value}>{children}</IdTokenContext.Provider>
  );
}
