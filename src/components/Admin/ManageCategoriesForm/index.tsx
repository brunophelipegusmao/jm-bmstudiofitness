"use client";

import { Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { Category } from "@/actions/admin/manage-categories-action";
import {
  createCategoryAction,
  deleteCategoryAction,
  getCategoriesAction,
  updateCategoryAction,
} from "@/actions/admin/manage-categories-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ManageCategoriesForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#64748b",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategoriesAction();
      setCategories(
        data.map((cat) => ({
          ...cat,
          slug: cat.slug ?? "",
        })),
      );
    } catch (error) {
      console.error("Error loading categories:", error);
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert(
          "Acesso negado. Apenas administradores podem gerenciar categorias.",
        );
      } else {
        alert("Erro ao carregar categorias. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Por favor, insira um nome para a categoria");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategoryAction(editingCategory.id, formData);
      } else {
        await createCategoryAction(formData);
      }

      setFormData({ name: "", description: "", color: "#64748b" });
      setShowCreateForm(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert(
          "Acesso negado. Apenas administradores podem gerenciar categorias.",
        );
      } else {
        alert("Erro ao salvar categoria. Tente novamente.");
      }
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color ?? "#64748b",
    });
    setEditingCategory(category);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    try {
      await deleteCategoryAction(id);
      await loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert(
          "Acesso negado. Apenas administradores podem excluir categorias.",
        );
      } else {
        alert(
          "Erro ao excluir categoria. Verifique se não há posts usando esta categoria.",
        );
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", color: "#64748b" });
    setShowCreateForm(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">
            Gerenciar Categorias de Eventos
          </h2>
          <p className="text-slate-400">
            Gerencie categorias opcionais para eventos
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Form */}
      {showCreateForm && (
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="text-[#C2A537]">
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Nome *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ex: Treino, Nutrição, Suplementação"
                    className="border-slate-600 bg-slate-800/50 text-white placeholder-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color" className="text-slate-300">
                    Cor
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="h-10 w-16 border-slate-600 bg-slate-800/50"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      placeholder="#64748b"
                      className="flex-1 border-slate-600 bg-slate-800/50 text-white placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">
                  Descrição
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descrição opcional da categoria"
                  className="min-h-20 w-full rounded-md border border-slate-600 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
                >
                  {editingCategory ? "Atualizar" : "Criar"} Categoria
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C2A537]"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.length === 0 ? (
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-slate-400">
                  Nenhuma categoria encontrada.
                  <br />
                  Clique em &quot;Nova Categoria&quot; para criar sua primeira
                  categoria.
                </p>
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => (
              <Card
                key={category.id}
                className="border-slate-700/50 bg-slate-800/30"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <CardTitle className="text-lg text-white">
                          {category.name}
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          Slug: {category.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(category)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(category.id)}
                        className="border-red-600 text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {category.description && (
                  <CardContent className="pt-0">
                    <p className="text-slate-300">{category.description}</p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
