"use client";

import { ArrowLeft, ImageIcon, Save, Tag } from "lucide-react";
import { useEffect, useState } from "react";

import {
  type Category,
  getCategoriesAction,
} from "@/actions/admin/manage-categories-action";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePostFormProps {
  onSubmit: (data: {
    title: string;
    content: string;
    excerpt: string;
    imageUrl?: string;
    published: boolean;
    categoryId?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    tags?: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export function CreatePostFormAdvanced({
  onSubmit,
  onCancel,
}: CreatePostFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    published: false,
    categoryId: undefined as string | undefined,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    tags: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSEO, setShowSEO] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategoriesAction();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.excerpt.trim()
    ) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);

      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await onSubmit({
        ...formData,
        imageUrl: formData.imageUrl || undefined,
        categoryId: formData.categoryId,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        metaKeywords: formData.metaKeywords || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Erro ao criar post. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: string,
    value: string | boolean | number | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="animate-in slide-in-from-right-5 space-y-6 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">Criar Novo Post</h2>
          <p className="text-slate-400">
            Preencha as informações para criar um novo post no blog
          </p>
        </div>
        <Button
          onClick={onCancel}
          className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conteúdo Principal */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-[#C2A537]">
                  Conteúdo do Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">
                    Título *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Digite o título do post"
                    className="border-slate-600 bg-slate-800/50 text-white placeholder-slate-400"
                    required
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-slate-300">
                    Resumo *
                  </Label>
                  <textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleChange("excerpt", e.target.value)}
                    placeholder="Escreva um breve resumo do post (máximo 200 caracteres)"
                    className="min-h-[100px] w-full rounded-md border border-slate-600 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                    maxLength={200}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    {formData.excerpt.length}/200 caracteres
                  </p>
                </div>

                {/* Content with Rich Text Editor */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Conteúdo *</Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => handleChange("content", value)}
                    placeholder="Escreva o conteúdo completo do post"
                    minHeight={400}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publicação */}
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-[#C2A537]">Publicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) =>
                      handleChange("published", e.target.checked)
                    }
                    className="rounded border-slate-600 bg-slate-800 text-[#C2A537] focus:ring-[#C2A537]"
                  />
                  <Label htmlFor="published" className="text-slate-300">
                    Publicar imediatamente
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Categoria */}
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-[#C2A537]">Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) =>
                    handleChange(
                      "categoryId",
                      e.target.value ? e.target.value : undefined,
                    )
                  }
                  className="w-full rounded-md border border-slate-600 bg-slate-800/50 px-3 py-2 text-white focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="border-slate-600 bg-slate-800/50 text-white placeholder-slate-400"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Separe as tags por vírgula
                </p>
              </CardContent>
            </Card>

            {/* Imagem */}
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-[#C2A537]">
                  Imagem Destacada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <ImageIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleChange("imageUrl", e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="border-slate-600 bg-slate-800/50 pl-10 text-white placeholder-slate-400"
                  />
                </div>
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="h-32 w-full rounded border border-slate-600 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO */}
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-[#C2A537]">SEO</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowSEO(!showSEO)}
                  className="border-[#C2A537] bg-[#C2A537] text-black hover:bg-[#D4B547]"
                >
                  {showSEO ? "Ocultar" : "Mostrar"} opções SEO
                </Button>
              </CardHeader>
              {showSEO && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Meta Título</Label>
                    <Input
                      value={formData.metaTitle}
                      onChange={(e) =>
                        handleChange("metaTitle", e.target.value)
                      }
                      placeholder="Título para SEO (deixe vazio para usar o título do post)"
                      className="border-slate-600 bg-slate-800/50 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Meta Descrição</Label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) =>
                        handleChange("metaDescription", e.target.value)
                      }
                      placeholder="Descrição para SEO (deixe vazio para usar o resumo)"
                      className="min-h-[80px] w-full rounded-md border border-slate-600 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                      maxLength={160}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Palavras-chave</Label>
                    <Input
                      value={formData.metaKeywords}
                      onChange={(e) =>
                        handleChange("metaKeywords", e.target.value)
                      }
                      placeholder="palavra1, palavra2, palavra3"
                      className="border-slate-600 bg-slate-800/50 text-white placeholder-slate-400"
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#C2A537] text-black hover:bg-[#D4B547] disabled:opacity-50"
          >
            {loading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-black" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {loading ? "Criando..." : "Criar Post"}
          </Button>

          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
