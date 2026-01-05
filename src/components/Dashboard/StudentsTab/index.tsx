"use client";

import { Activity, Check, Loader2, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getStudentProfileAction } from "@/actions/admin/get-student-profile-action";
import { getAllStudentsFullDataAction } from "@/actions/admin/get-students-full-data-action";
import { markFinancialPaidAction } from "@/actions/admin/mark-financial-paid-action";
import { reactivateStudentAction } from "@/actions/admin/reactivate-student-action";
import { softDeleteStudentAction } from "@/actions/admin/soft-delete-student-action";
import { updateStudentAction } from "@/actions/admin/update-student-action";
import { updateStudentHealthAction } from "@/actions/admin/update-student-health-action";
import { BodyMeasurementsHistoryView } from "@/components/Admin/BodyMeasurementsHistoryView";
import { showErrorToast, showSuccessToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCPF } from "@/lib/utils";
import type { StudentFullData } from "@/types/users";

type Profile = NonNullable<
  Awaited<ReturnType<typeof getStudentProfileAction>>["data"]
>;

interface StudentsTabProps {
  students: StudentFullData[];
  onStudentsChange?: () => void | Promise<void>;
}

export function StudentsTab({
  students: initialStudents,
  onStudentsChange,
}: StudentsTabProps) {
  const [students, setStudents] = useState<StudentFullData[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StudentFullData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<
    "personal" | "health" | "schedule" | "checkins" | "financial"
  >("personal");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);

  // Refresh list if parent updates
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const term = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.cpf.replace(/\D/g, "").includes(term.replace(/\D/g, "")),
    );
  }, [students, search]);

  const stats = useMemo(() => {
    const now = new Date();
    const active = students.filter((s) => !s.deletedAt).length;
    const thisMonth = students.filter((s) => {
      const created = new Date(s.createdAt);
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;
    return { total: students.length, active, thisMonth };
  }, [students]);

  const loadProfile = async (student: StudentFullData) => {
    setSelected(student);
    setProfile(null);
    setLoadingProfile(true);
    setActiveTab("personal");
    const res = await getStudentProfileAction(student.userId || student.id);
    if (res.success && res.data) {
      setProfile(res.data);
    } else {
      showErrorToast(res.error ?? "Não foi possível carregar o aluno");
    }
    setLoadingProfile(false);
  };

  const refreshList = async () => {
    const data = await getAllStudentsFullDataAction();
    setStudents(data);
    if (onStudentsChange) await onStudentsChange();
  };

  const handleUpdatePersonal = async (
    form: Partial<Profile["student"]> &
      Partial<Profile["student"]["personalData"]>,
  ) => {
    if (!profile) return;
    setSaving(true);
    const res = await updateStudentAction({
      id: profile.student.id,
      ...form,
    });
    setSaving(false);
    if (res.success) {
      showSuccessToast("Dados pessoais atualizados");
      await loadProfile(selected!);
      await refreshList();
    } else showErrorToast(res.error ?? "Erro ao salvar");
  };

  const handleUpdateHealth = async (form: Record<string, unknown>) => {
    if (!profile) return;
    setSaving(true);
    const res = await updateStudentHealthAction(profile.student.id, form);
    setSaving(false);
    if (res.success) {
      showSuccessToast("Dados de saúde atualizados");
      await loadProfile(selected!);
      await refreshList();
    } else showErrorToast(res.error ?? "Erro ao salvar saúde");
  };

  const handleUpdateFinancial = async (form: {
    monthlyFeeValueInCents?: number;
    paymentMethod?: string;
    dueDate?: number;
  }) => {
    if (!profile) return;
    setSaving(true);
    const res = await updateStudentAction({
      id: profile.student.id,
      ...form,
    });
    setSaving(false);
    if (res.success) {
      showSuccessToast("Financeiro atualizado");
      await loadProfile(selected!);
      await refreshList();
    } else showErrorToast(res.error ?? "Erro ao salvar financeiro");
  };

  const handleConfirmPayment = async (finId: string) => {
    const res = await markFinancialPaidAction(finId);
    if (res.success) {
      showSuccessToast("Pagamento confirmado");
      await loadProfile(selected!);
    } else showErrorToast(res.error ?? "Erro ao confirmar pagamento");
  };

  const handleSoftDelete = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await softDeleteStudentAction(selected.userId);
    setSaving(false);
    if (res.success) {
      showSuccessToast(res.message);
      setShowDeactivate(false);
      setSelected(null);
      setProfile(null);
      await refreshList();
    } else showErrorToast(res.message);
  };

  const handleReactivate = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await reactivateStudentAction(selected.userId);
    setSaving(false);
    if (res.success) {
      showSuccessToast(res.message);
      setShowReactivate(false);
      await refreshList();
    } else showErrorToast(res.message);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          title="Total de alunos"
          value={stats.total}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Ativos"
          value={stats.active}
          icon={<Check className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Novos no mês"
          value={stats.thisMonth}
          icon={<TrendingUp className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-[#C2A537]/40 bg-black/40 p-4 backdrop-blur">
            <div className="relative">
              <Input
                placeholder="Buscar por nome, email ou CPF"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-black/60 border-[#C2A537]/30 text-white"
              />
              <SearchIcon />
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {filtered.length} resultado(s)
            </p>
          </div>

          <div className="rounded-lg border border-[#C2A537]/30 bg-black/30 p-3 backdrop-blur max-h-[600px] overflow-y-auto">
            {filtered.map((s) => (
              <button
                key={s.userId}
                onClick={() => void loadProfile(s)}
                className={`w-full text-left rounded-lg border p-3 transition ${
                  selected?.userId === s.userId
                    ? "border-[#C2A537] bg-[#C2A537]/10"
                    : "border-zinc-800 hover:border-[#C2A537]/40 hover:bg-black/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-zinc-400">{s.email}</p>
                    <p className="text-xs text-zinc-500">
                      CPF: {formatCPF(s.cpf)}
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                      s.deletedAt
                        ? "bg-red-500/10 text-red-400"
                        : "bg-green-500/10 text-green-400"
                    }`}
                  >
                    {s.deletedAt ? "Inativo" : "Ativo"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-lg border border-[#C2A537]/30 bg-black/50 p-4 backdrop-blur">
            {!selected ? (
              <div className="flex min-h-[240px] items-center justify-center text-zinc-400">
                Selecione um aluno na lista.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-[#C2A537]">
                      {selected.name}
                    </h3>
                    <p className="text-sm text-zinc-400">{selected.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {selected.deletedAt ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReactivate(true)}
                        className="border-green-500/40 text-green-400"
                      >
                        Reativar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeactivate(true)}
                        className="border-red-500/40 text-red-400"
                      >
                        Desativar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                    {["personal", "health", "schedule", "checkins", "financial"].map(
                    (tab) => (
                      <Button
                        key={tab}
                        size="sm"
                        variant={activeTab === tab ? "default" : "outline"}
                        className={
                          activeTab === tab
                            ? "bg-[#C2A537] text-black hover:bg-[#D4B547]"
                            : "border-zinc-700 text-zinc-200 hover:border-[#C2A537]"
                        }
                        onClick={() => setActiveTab(tab as typeof activeTab)}
                      >
                        {tab === "personal" && "Dados pessoais"}
                        {tab === "health" && "Saúde"}
                        {tab === "schedule" && "Horário/Plano"}
                        {tab === "checkins" && "Check-ins"}
                        {tab === "financial" && "Financeiro"}
                      </Button>
                    ),
                  )}
                </div>

                {loadingProfile ? (
                  <div className="flex min-h-[200px] items-center justify-center text-zinc-400">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </div>
                ) : profile ? (
                  <>
                    {activeTab === "personal" && (
                      <PersonalForm
                        data={profile}
                        saving={saving}
                        onSave={handleUpdatePersonal}
                      />
                    )}
                    {activeTab === "health" && (
                      <div className="space-y-6">
                        <HealthForm
                          data={profile}
                          saving={saving}
                          onSave={handleUpdateHealth}
                        />
                        <BodyMeasurementsHistoryView
                          userId={selected?.userId ?? ""}
                        />
                      </div>
                    )}
                    {activeTab === "schedule" && (
                      <ScheduleForm
                        data={profile}
                        saving={saving}
                        onSave={handleUpdateFinancial}
                      />
                    )}
                    {activeTab === "financial" && (
                      <FinancialForm
                        data={profile}
                        saving={saving}
                        onSave={handleUpdateFinancial}
                        onConfirmPayment={handleConfirmPayment}
                      />
                    )}
                    {activeTab === "checkins" && (
                      <CheckinsList data={profile} />
                    )}
                  </>
                ) : (
                  <p className="text-sm text-red-400">
                    Não foi possível carregar o aluno.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeactivate}
        title="Desativar aluno"
        description="O aluno ficará inativo, mas os dados serão preservados."
        confirmLabel={saving ? "Desativando..." : "Desativar"}
        onConfirm={handleSoftDelete}
        onClose={() => setShowDeactivate(false)}
        tone="danger"
      />

      <ConfirmDialog
        open={showReactivate}
        title="Reativar aluno"
        description="O aluno será reativado e poderá acessar normalmente."
        confirmLabel={saving ? "Reativando..." : "Reativar"}
        onConfirm={handleReactivate}
        onClose={() => setShowReactivate(false)}
        tone="success"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: "green" | "yellow";
}) {
  const base =
    color === "green"
      ? "from-green-600/15 to-green-900/10 text-green-200"
      : color === "yellow"
        ? "from-amber-600/15 to-amber-900/10 text-amber-200"
        : "from-blue-600/15 to-blue-900/10 text-blue-200";
  return (
    <div
      className={`rounded-lg border border-[#C2A537]/30 bg-gradient-to-br p-4 shadow ${base}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-300">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-full bg-black/40 p-3 text-[#C2A537]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function PersonalForm({
  data,
  saving,
  onSave,
}: {
  data: Profile;
  saving: boolean;
  onSave: (form: Record<string, unknown>) => Promise<void>;
}) {
  const pd = data.student.personalData ?? {};
  const [form, setForm] = useState({
    name: data.student.name ?? "",
    email: pd.email ?? "",
    telephone: pd.telephone ?? "",
    cpf: pd.cpf ?? "",
    address: pd.address ?? "",
    sex: pd.sex ?? "",
    bornDate: pd.bornDate ? String(pd.bornDate).split("T")[0] : "",
  });

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave(form);
      }}
    >
      <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
      <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
      <Field label="Telefone" value={form.telephone} onChange={(v) => setForm({ ...form, telephone: v })} />
      <Field label="CPF" value={form.cpf} onChange={(v) => setForm({ ...form, cpf: v })} />
      <Field label="Sexo" value={form.sex} onChange={(v) => setForm({ ...form, sex: v })} />
      <Field label="Nascimento" type="date" value={form.bornDate} onChange={(v) => setForm({ ...form, bornDate: v })} />
      <div className="md:col-span-2">
        <Field label="Endereço" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

function HealthForm({
  data,
  saving,
  onSave,
}: {
  data: Profile;
  saving: boolean;
  onSave: (form: Record<string, unknown>) => Promise<void>;
}) {
  const h = data.health as Record<string, unknown> | undefined;
  const [form, setForm] = useState({
    heightCm: (h?.heightCm as string) ?? "",
    weightKg: (h?.weightKg as string) ?? "",
    bloodType: (h?.bloodType as string) ?? "",
    hasPracticedSports:
      typeof h?.hasPracticedSports === "boolean"
        ? (h.hasPracticedSports as boolean)
        : false,
    lastExercise: (h?.lastExercise as string) ?? "",
    sportsHistory: (h?.sportsHistory as string) ?? "",
    historyDiseases: (h?.historyDiseases as string) ?? "",
    medications: (h?.medications as string) ?? "",
    allergies: (h?.allergies as string) ?? "",
    injuries: (h?.injuries as string) ?? "",
    alimentalRoutine: (h?.alimentalRoutine as string) ?? "",
    diaryRoutine: (h?.diaryRoutine as string) ?? "",
    useSupplements:
      typeof h?.useSupplements === "boolean"
        ? (h.useSupplements as boolean)
        : false,
    whatSupplements: (h?.whatSupplements as string) ?? "",
    otherNotes: (h?.otherNotes as string) ?? "",
  });
  const [skinfoldForm, setSkinfoldForm] = useState({
    measurementDate: new Date().toISOString().split("T")[0],
    weight: "",
    height: "",
    chest: "",
    abdominal: "",
    suprailiac: "",
    thigh: "",
    triceps: "",
    axillary: "",
    subscapular: "",
    bodyFatPercentage: "",
    method: "3-dobras",
  });
  const [savingSkinfold, setSavingSkinfold] = useState(false);
  const [bodyFatResult, setBodyFatResult] = useState<string>("");

  const calculateBodyFat = () => {
    const gender =
      (data.student.personalData?.sex as string | undefined) ?? "masculino";
    const birth = data.student.personalData?.bornDate
      ? new Date(data.student.personalData.bornDate)
      : null;
    if (!birth) {
      showErrorToast("Data de nascimento ausente para calcular % gordura");
      return null;
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    const toNum = (v: string) => (v ? Number(v) : 0);
    const method = skinfoldForm.method;

    let density: number | null = null;
    if (method === "3-dobras") {
      if (gender === "masculino") {
        const sum =
          toNum(skinfoldForm.chest) +
          toNum(skinfoldForm.abdominal) +
          toNum(skinfoldForm.thigh);
        density =
          1.10938 -
          0.0008267 * sum +
          0.0000016 * Math.pow(sum, 2) -
          0.0002574 * age;
      } else {
        const sum =
          toNum(skinfoldForm.triceps) +
          toNum(skinfoldForm.suprailiac) +
          toNum(skinfoldForm.thigh);
        density =
          1.0994921 -
          0.0009929 * sum +
          0.0000023 * Math.pow(sum, 2) -
          0.0001392 * age;
      }
    } else {
      const sum =
        toNum(skinfoldForm.chest) +
        toNum(skinfoldForm.axillary) +
        toNum(skinfoldForm.triceps) +
        toNum(skinfoldForm.subscapular) +
        toNum(skinfoldForm.abdominal) +
        toNum(skinfoldForm.suprailiac) +
        toNum(skinfoldForm.thigh);
      if (gender === "masculino") {
        density =
          1.112 -
          0.00043499 * sum +
          0.00000055 * Math.pow(sum, 2) -
          0.00028826 * age;
      } else {
        density =
          1.097 -
          0.00046971 * sum +
          0.00000056 * Math.pow(sum, 2) -
          0.00012828 * age;
      }
    }

    if (!density || density <= 0) {
      showErrorToast("Não foi possível calcular a densidade corporal");
      return null;
    }
    const bodyFat = (4.95 / density - 4.5) * 100;
    const rounded = Number(bodyFat.toFixed(2));
    setBodyFatResult(`${rounded}%`);
    setSkinfoldForm((prev) => ({
      ...prev,
      bodyFatPercentage: String(rounded),
    }));
    return rounded;
  };

  const saveSkinfolds = async () => {
    const computed = calculateBodyFat();
    setSavingSkinfold(true);
    try {
      const payload: Record<string, unknown> = {
        userId: data.student.id,
        measurementDate: skinfoldForm.measurementDate,
        weight: skinfoldForm.weight ? Number(skinfoldForm.weight) : null,
        height: skinfoldForm.height ? Number(skinfoldForm.height) : null,
        chestSkinfoldMm: skinfoldForm.chest ? Number(skinfoldForm.chest) : null,
        abdominalSkinfoldMm: skinfoldForm.abdominal
          ? Number(skinfoldForm.abdominal)
          : null,
        suprailiacSkinfoldMm: skinfoldForm.suprailiac
          ? Number(skinfoldForm.suprailiac)
          : null,
        thighSkinfoldMm: skinfoldForm.thigh
          ? Number(skinfoldForm.thigh)
          : null,
        tricepsSkinfoldMm: skinfoldForm.triceps
          ? Number(skinfoldForm.triceps)
          : null,
        axillarySkinfoldMm: skinfoldForm.axillary
          ? Number(skinfoldForm.axillary)
          : null,
        subscapularSkinfoldMm: skinfoldForm.subscapular
          ? Number(skinfoldForm.subscapular)
          : null,
        bodyFatMethod: skinfoldForm.method,
        bodyFatPercentage:
          computed ??
          (skinfoldForm.bodyFatPercentage
            ? Number(skinfoldForm.bodyFatPercentage)
            : null),
      };

      const res = await fetch("/api/admin/body-measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao salvar dobras cutâneas");
      }
      showSuccessToast("Dobras cutâneas salvas");
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Erro ao salvar dobras cutâneas",
      );
    } finally {
      setSavingSkinfold(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave(form);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Altura (cm)"
          value={form.heightCm}
          onChange={(v) => setForm({ ...form, heightCm: v })}
        />
        <Field
          label="Peso (kg)"
          value={form.weightKg}
          onChange={(v) => setForm({ ...form, weightKg: v })}
        />
        <Field
          label="Tipo sanguíneo"
          value={form.bloodType}
          onChange={(v) => setForm({ ...form, bloodType: v })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-sm text-zinc-300">Histórico de doenças</Label>
          <Textarea
            className="mt-1 bg-black/60 text-white"
            value={form.historyDiseases}
            onChange={(e) =>
              setForm({ ...form, historyDiseases: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-zinc-300">Medicamentos</Label>
          <Textarea
            className="mt-1 bg-black/60 text-white"
            value={form.medications}
            onChange={(e) => setForm({ ...form, medications: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-zinc-300">Alergias</Label>
          <Textarea
            className="mt-1 bg-black/60 text-white"
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-zinc-300">Lesões</Label>
          <Textarea
            className="mt-1 bg-black/60 text-white"
            value={form.injuries}
            onChange={(e) => setForm({ ...form, injuries: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm text-zinc-300">
          Praticou alguma atividade física?
        </Label>
        <div className="flex gap-4 text-sm text-zinc-200">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="hasPracticedSports"
              value="true"
              checked={form.hasPracticedSports === true}
              onChange={() => setForm({ ...form, hasPracticedSports: true })}
            />
            Sim
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="hasPracticedSports"
              value="false"
              checked={form.hasPracticedSports === false}
              onChange={() => setForm({ ...form, hasPracticedSports: false })}
            />
            Não
          </label>
        </div>
        <Field
          label="Descrição / último exercício"
          value={form.lastExercise}
          onChange={(v) => setForm({ ...form, lastExercise: v })}
        />
        <div className="space-y-1">
          <Label className="text-sm text-zinc-300">Histórico esportivo</Label>
          <Textarea
            className="mt-1 bg-black/60 text-white"
            value={form.sportsHistory}
            onChange={(e) => setForm({ ...form, sportsHistory: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-sm text-zinc-300">Rotina alimentar</Label>
          <Textarea
            className="mt-1 bg-black/60 text-white"
            value={form.alimentalRoutine}
            onChange={(e) =>
              setForm({ ...form, alimentalRoutine: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-zinc-300">Rotina diária</Label>
          <Textarea
            className="mt-1 bg-black/60 text-white"
            value={form.diaryRoutine}
            onChange={(e) => setForm({ ...form, diaryRoutine: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm text-zinc-300">Usa suplementos?</Label>
        <div className="flex gap-4 text-sm text-zinc-200">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="useSupplements"
              value="true"
              checked={form.useSupplements === true}
              onChange={() => setForm({ ...form, useSupplements: true })}
            />
            Sim
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="useSupplements"
              value="false"
              checked={form.useSupplements === false}
              onChange={() => setForm({ ...form, useSupplements: false })}
            />
            Não
          </label>
        </div>
        <Field
          label="Quais suplementos?"
          value={form.whatSupplements}
          onChange={(v) => setForm({ ...form, whatSupplements: v })}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-sm text-zinc-300">Observações</Label>
        <Textarea
          className="mt-1 bg-black/60 text-white"
          value={form.otherNotes}
          onChange={(e) => setForm({ ...form, otherNotes: e.target.value })}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-800 bg-black/60 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-zinc-200">
            Dobras cutâneas / composição corporal
          </h4>
          <input
            type="date"
            className="rounded border border-zinc-700 bg-black/40 px-2 py-1 text-sm text-white"
            value={skinfoldForm.measurementDate}
            onChange={(e) =>
              setSkinfoldForm({
                ...skinfoldForm,
                measurementDate: e.target.value,
              })
            }
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Field
            label="Peitoral (mm)"
            value={skinfoldForm.chest}
            onChange={(v) => setSkinfoldForm({ ...skinfoldForm, chest: v })}
            type="number"
          />
          <Field
            label="Abdominal/Cintura (mm)"
            value={skinfoldForm.abdominal}
            onChange={(v) =>
              setSkinfoldForm({ ...skinfoldForm, abdominal: v })
            }
            type="number"
          />
          <Field
            label="Supra-ilíaca/Quadril (mm)"
            value={skinfoldForm.suprailiac}
            onChange={(v) =>
              setSkinfoldForm({ ...skinfoldForm, suprailiac: v })
            }
            type="number"
          />
          <Field
            label="Coxa (mm)"
            value={skinfoldForm.thigh}
            onChange={(v) => setSkinfoldForm({ ...skinfoldForm, thigh: v })}
            type="number"
          />
          <Field
            label="Tríceps (mm)"
            value={skinfoldForm.triceps}
            onChange={(v) => setSkinfoldForm({ ...skinfoldForm, triceps: v })}
            type="number"
          />
          <Field
            label="Axilar média (mm)"
            value={skinfoldForm.axillary}
            onChange={(v) => setSkinfoldForm({ ...skinfoldForm, axillary: v })}
            type="number"
          />
          <Field
            label="Subescapular (mm)"
            value={skinfoldForm.subscapular}
            onChange={(v) =>
              setSkinfoldForm({ ...skinfoldForm, subscapular: v })
            }
            type="number"
          />
          <Field
            label="Peso na medição (kg)"
            value={skinfoldForm.weight}
            onChange={(v) => setSkinfoldForm({ ...skinfoldForm, weight: v })}
            type="number"
          />
          <Field
            label="% Gordura (opcional)"
            value={skinfoldForm.bodyFatPercentage}
            onChange={(v) =>
              setSkinfoldForm({ ...skinfoldForm, bodyFatPercentage: v })
            }
            type="number"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <span>Método:</span>
            <select
              className="rounded border border-zinc-700 bg-black/60 px-2 py-1"
              value={skinfoldForm.method}
              onChange={(e) =>
                setSkinfoldForm({ ...skinfoldForm, method: e.target.value })
              }
            >
              <option value="3-dobras">Jackson & Pollock 3 dobras</option>
              <option value="7-dobras">Jackson & Pollock 7 dobras</option>
            </select>
          </div>
          {bodyFatResult && (
            <div className="text-sm text-green-400">
              % Gordura estimada: {bodyFatResult}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const res = calculateBodyFat();
                if (res !== null) {
                  showSuccessToast(`% Gordura: ${res.toFixed(2)}%`);
                }
              }}
              className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537]/10"
            >
              Calcular % gordura
            </Button>
            <Button
              type="button"
              disabled={savingSkinfold}
              onClick={() => void saveSkinfolds()}
              className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
            >
              {savingSkinfold ? "Salvando..." : "Salvar dobras"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
        >
          {saving ? "Salvando..." : "Salvar saúde"}
        </Button>
      </div>
    </form>
  );
}

function ScheduleForm({
  data,
  saving,
  onSave,
}: {
  data: Profile;
  saving: boolean;
  onSave: (form: {
    monthlyFeeValueInCents?: number;
    paymentMethod?: string;
    dueDate?: number;
  }) => Promise<void>;
}) {
  const latest = data.financial?.[0];
  const [form, setForm] = useState({
    monthlyFeeValueInCents: latest?.amountInCents ?? 0,
    paymentMethod: latest?.paymentMethod ?? "",
    dueDate: latest?.dueDate ?? 1,
  });

  return (
    <form
      className="grid gap-4 md:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave(form);
      }}
    >
      <Field
        label="Mensalidade (centavos)"
        type="number"
        value={form.monthlyFeeValueInCents}
        onChange={(v) =>
          setForm({ ...form, monthlyFeeValueInCents: Number(v) || 0 })
        }
      />
      <Field
        label="Método pagamento"
        value={form.paymentMethod}
        onChange={(v) => setForm({ ...form, paymentMethod: v })}
      />
      <Field
        label="Dia vencimento"
        type="number"
        value={form.dueDate}
        onChange={(v) => setForm({ ...form, dueDate: Number(v) || 1 })}
      />
      <div className="md:col-span-3 flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
        >
          {saving ? "Salvando..." : "Salvar horário/plano"}
        </Button>
      </div>
    </form>
  );
}

function FinancialForm({
  data,
  saving,
  onSave,
  onConfirmPayment,
}: {
  data: Profile;
  saving: boolean;
  onSave: (form: { monthlyFeeValueInCents?: number; paymentMethod?: string; dueDate?: number }) => Promise<void>;
  onConfirmPayment: (id: string) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <ScheduleForm data={data} saving={saving} onSave={onSave} />
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-zinc-200">
          Histórico financeiro
        </h4>
        {data.financial.length === 0 && (
          <p className="text-sm text-zinc-400">Nenhum registro.</p>
        )}
        <div className="space-y-2">
          {data.financial.map((f) => (
            <div
              key={f.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="text-sm text-zinc-200">
                <div>
                  Valor: R$ {(f.amountInCents / 100).toFixed(2).replace(".", ",")}
                </div>
                <div>Vencimento: dia {f.dueDate ?? "-"}</div>
                <div>Método: {f.paymentMethod ?? "-"}</div>
                <div>
                  Pago:{" "}
                  <span className={f.paid ? "text-green-400" : "text-red-400"}>
                    {f.paid ? "Sim" : "Não"}
                  </span>
                </div>
              </div>
              {!f.paid && (
                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-500"
                  onClick={() => void onConfirmPayment(f.id)}
                >
                  Confirmar pagamento
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckinsList({ data }: { data: Profile }) {
  if (!data.checkIns.length) {
    return <p className="text-sm text-zinc-400">Nenhum check-in registrado.</p>;
  }
  return (
    <div className="space-y-2">
      {data.checkIns.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3"
        >
          <div>
            <div className="font-medium text-zinc-100">
              {new Date(c.checkInDate).toLocaleDateString("pt-BR")} •{" "}
              {c.checkInTime}
            </div>
            <div className="text-xs text-zinc-400">
              {c.method || "Método não informado"} • {c.identifier || "-"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-zinc-300">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="bg-black/60 text-white"
      />
    </div>
  );
}

function SearchIcon() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
      <Activity className="h-4 w-4" />
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  tone = "danger",
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  tone?: "danger" | "success";
}) {
  const bg =
    tone === "danger"
      ? "border-red-500/40 bg-red-950"
      : "border-green-500/40 bg-green-950";
  const btn =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-green-600 hover:bg-green-700";
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${bg} text-white`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-zinc-300">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className={`flex-1 ${btn}`}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
