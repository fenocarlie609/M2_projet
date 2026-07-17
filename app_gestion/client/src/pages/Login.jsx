import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const fakeUser = {
      user: {
        name: "Administrateur",
        role: "SUPERADMIN",
      },
    };

    login(fakeUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900/90 border border-slate-700 rounded-3xl p-8 shadow-xl"
      >
        <h1 className="text-2xl font-semibold mb-6">Connexion</h1>

        <label className="block text-sm text-slate-300 mb-2">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-brand-primary"
          />
        </label>

        <label className="block text-sm text-slate-300 mb-4">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-brand-primary"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-brand-primary py-3 text-sm font-semibold text-white transition hover:bg-brand-secondary"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Login;
