import { useState } from "react";
import { useAuth, loginService } from "@/features/auth";
import { showToast } from "@/shared/utils/toast";

function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await loginService.login(identifier, password);
      login(response.data);
      showToast.success("Connexion réussie !");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la connexion. Vérifiez vos identifiants.";
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900/90 border border-slate-700 rounded-3xl p-8 shadow-xl"
      >
        <h1 className="text-2xl font-semibold mb-6">Connexion</h1>

        <label className="block text-sm text-slate-300 mb-2">
          Identifient
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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
          disabled={loading}
          className="w-full rounded-2xl bg-brand-primary py-3 text-sm font-semibold text-white transition hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
