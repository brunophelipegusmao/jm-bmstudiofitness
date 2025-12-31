"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

import { confirmEventAttendanceAction } from "@/actions/public/event-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventAttendanceFormProps {
  slug: string;
}

export function EventAttendanceForm({ slug }: EventAttendanceFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Informe seu nome para confirmar presença.");
      return;
    }

    try {
      setLoading(true);
      const response = await confirmEventAttendanceAction(slug, {
        name: name.trim(),
        email: email.trim() || undefined,
      });
      if (response?.success) {
        setSuccess("Presença confirmada! Te esperamos no evento.");
        setName("");
        setEmail("");
      } else {
        setError("Não foi possível confirmar sua presença. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao confirmar presença. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
    >
      <div>
        <h3 className="text-lg font-semibold text-[#C2A537]">
          Confirmar presença
        </h3>
        <p className="text-sm text-slate-300">
          Garanta sua vaga informando nome e (opcional) e-mail para contato.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendance-name" className="text-slate-200">
          Nome *
        </Label>
        <Input
          id="attendance-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          className="border-slate-700 bg-slate-800 text-white placeholder-slate-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendance-email" className="text-slate-200">
          E-mail (opcional)
        </Label>
        <Input
          id="attendance-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          className="border-slate-700 bg-slate-800 text-white placeholder-slate-500"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && (
        <p className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle className="h-4 w-4" />
          {success}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="bg-[#C2A537] text-black hover:bg-[#D4B547] disabled:opacity-60"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Confirmar presença
      </Button>
    </form>
  );
}
