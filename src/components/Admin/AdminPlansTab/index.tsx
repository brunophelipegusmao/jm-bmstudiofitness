"use client";

import { Clock, Edit, Eye, EyeOff, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  createPlanAction,
  deletePlanAction,
  getPlansAdminAction,
  type Plan,
  updatePlanAction,
} from "@/actions/admin/plans-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AdminPlansTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewPlan, setIsNewPlan] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    features: "",
    priceValue: 0,
    durationDays: 0,
    popular: false,
    active: true,
    displayOrder: 0,
  });

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    const result = await getPlansAdminAction();
    if (result.success && result.data) {
      setPlans(result.data);
    } else {
      setError(result.error || "Erro ao carregar planos");
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      setIsNewPlan(false);
      setEditingPlan(plan);
      setFormData({
        title: plan.title,
        description: plan.description,
        features: plan.features.join("\n"),
        priceValue: plan.priceValue,
        durationDays: plan.durationDays,
        popular: plan.popular,
        active: plan.active,
        displayOrder: plan.displayOrder,
      });
    } else {
      setIsNewPlan(true);
      setEditingPlan(null);
      setFormData({
        title: "",
        description: "",
        features: "",
        priceValue: 0,
        durationDays: 0,
        popular: false,
        active: true,
        displayOrder: plans.length + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const planData = {
      title: formData.title,
      description: formData.description,
      features: formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      priceValue: formData.priceValue,
      durationDays: formData.durationDays,
      popular: formData.popular,
      active: formData.active,
      displayOrder: formData.displayOrder,
    };

    const action = isNewPlan
      ? createPlanAction(planData)
      : updatePlanAction({ id: editingPlan!.id, ...planData });

    const result = await action;
    if (!result.success) {
      setError(result.error || "Erro ao salvar plano");
      return;
    }

    await loadPlans();
    setIsDialogOpen(false);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;
    const result = await deletePlanAction(planId);
    if (!result.success) {
      setError(result.error || "Erro ao excluir plano");
      return;
    }
    await loadPlans();
  };

  const toggleActive = async (plan: Plan) => {
    const result = await updatePlanAction({
      id: plan.id,
      active: !plan.active,
    });
    if (!result.success) {
      setError(result.error || "Erro ao atualizar status");
      return;
    }
    await loadPlans();
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-zinc-400">Carregando planos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-50">Gerenciar Planos</h2>
          <p className="text-sm text-zinc-400">
            Crie, edite ou remova planos exibidos na página de planos.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-zinc-700 bg-zinc-900 text-zinc-50">
            <DialogHeader>
              <DialogTitle className="text-zinc-50">
                {isNewPlan ? "Criar Novo Plano" : "Editar Plano"}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Preencha as informações do plano
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="border-zinc-700 bg-zinc-800 text-zinc-50"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="border-zinc-700 bg-zinc-800 text-zinc-50"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="features">Benefícios (um por linha)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    className="border-zinc-700 bg-zinc-800 text-zinc-50"
                    rows={5}
                    placeholder="Benefício 1&#10;Benefício 2&#10;Benefício 3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceValue">Preço (centavos)</Label>
                  <Input
                    id="priceValue"
                    type="number"
                    value={formData.priceValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceValue: Number(e.target.value) || 0,
                      })
                    }
                    className="border-zinc-700 bg-zinc-800 text-zinc-50"
                    placeholder="8990"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duração (dias)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationDays: Number(e.target.value) || 0,
                      })
                    }
                    className="border-zinc-700 bg-zinc-800 text-zinc-50"
                    placeholder="30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Ordem de Exibição</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOrder: Number(e.target.value) || 0,
                      })
                    }
                    className="border-zinc-700 bg-zinc-800 text-zinc-50"
                    required
                  />
                </div>

                <div className="flex items-center space-x-4 md:col-span-2">
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) =>
                        setFormData({ ...formData, popular: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-800"
                    />
                    <span className="text-sm text-zinc-300">
                      Marcar como Popular
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-800"
                    />
                    <span className="text-sm text-zinc-300">Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-zinc-700 bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
                >
                  {isNewPlan ? "Criar Plano" : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-zinc-800 ${
              plan.active
                ? "bg-gradient-to-br from-zinc-900 to-black"
                : "bg-zinc-900/50 opacity-60"
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-[#C2A537]/15 p-2 text-black">
                  <Star className="h-4 w-4 text-[#C2A537]" />
                </div>
                <div className="flex gap-1">
                  {plan.popular && (
                    <Badge className="bg-[#C2A537] text-black">
                      <Star className="mr-1 h-3 w-3" />
                      Popular
                    </Badge>
                  )}
                  {!plan.active && (
                    <Badge variant="outline" className="text-zinc-500">
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg text-zinc-50">
                {plan.title}
              </CardTitle>
              <CardDescription className="text-sm text-zinc-400">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#C2A537]">
                  {plan.price}
                </span>
                <span className="text-xs text-zinc-500">
                  Ordem: {plan.displayOrder}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Clock className="h-3 w-3" />
                {plan.durationLabel}
              </div>

              <div className="space-y-1 text-xs text-zinc-300">
                {plan.features.slice(0, 4).map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C2A537]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => toggleActive(plan)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-zinc-700 bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                >
                  {plan.active ? (
                    <EyeOff className="mr-1 h-3 w-3" />
                  ) : (
                    <Eye className="mr-1 h-3 w-3" />
                  )}
                  {plan.active ? "Desativar" : "Ativar"}
                </Button>
                <Button
                  onClick={() => handleOpenDialog(plan)}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => handleDelete(plan.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50">
          <div className="text-center">
            <p className="mb-4 text-zinc-400">Nenhum plano cadastrado</p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Plano
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
