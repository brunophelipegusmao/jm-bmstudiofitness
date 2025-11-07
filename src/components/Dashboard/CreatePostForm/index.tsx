"use client";

import { ArrowLeft, ImageIcon, Save } from "lucide-react";
import { useState } from "react";

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
  }) => Promise<void>;
  onCancel: () => void;
}

export function CreatePostForm({ onSubmit, onCancel }: CreatePostFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    published: false,
  });
  const [loading, setLoading] = useState(false);

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
      await onSubmit({
        ...formData,
        imageUrl: formData.imageUrl || undefined,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Erro ao criar post. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
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
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="text-[#C2A537]">
              Informações do Post
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

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-slate-300">
                Conteúdo *
              </Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Escreva o conteúdo completo do post"
                className="min-h-[300px] w-full rounded-md border border-slate-600 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                required
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-slate-300">
                URL da Imagem (opcional)
              </Label>
              <div className="relative">
                <ImageIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="imageUrl"
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
                    className="h-32 max-w-xs rounded border border-slate-600 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Published Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => handleChange("published", e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-[#C2A537] focus:ring-[#C2A537]"
              />
              <Label htmlFor="published" className="text-slate-300">
                Publicar imediatamente
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
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
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
