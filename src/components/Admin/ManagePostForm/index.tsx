"use client";

import { Edit3, Eye, EyeOff, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  createPostAction,
  deletePostAction,
  getPostsAction,
  updatePostAction,
} from "@/actions/admin/manage-posts-action";
import { CreatePostFormAdvanced } from "@/components/Dashboard/CreatePostFormAdvanced";
import { EditPostForm } from "@/components/Dashboard/EditPostForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "@/types/posts";

export function ManagePostForm() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getPostsAction();
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
      // Verificar se é erro de permissão
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert("Acesso negado. Apenas administradores podem gerenciar posts.");
      } else {
        alert("Erro ao carregar posts. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData: {
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
  }) => {
    try {
      await createPostAction(postData);
      setShowCreateForm(false);
      await loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert("Acesso negado. Apenas administradores podem criar posts.");
      } else {
        alert("Erro ao criar post. Tente novamente.");
      }
      throw error;
    }
  };

  const handleTogglePublished = async (
    postId: string,
    published: boolean,
  ) => {
    try {
      await updatePostAction(postId, { published });
      await loadPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert("Acesso negado. Apenas administradores podem editar posts.");
      } else {
        alert("Erro ao atualizar post. Tente novamente.");
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) {
      return;
    }

    try {
      await deletePostAction(postId);
      await loadPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert("Acesso negado. Apenas administradores podem excluir posts.");
      } else {
        alert("Erro ao excluir post. Tente novamente.");
      }
    }
  };

  if (showCreateForm) {
    return (
      <CreatePostFormAdvanced
        onSubmit={handleCreatePost}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingPost) {
    return (
      <EditPostForm
        post={editingPost}
        onComplete={() => {
          setEditingPost(null);
          loadPosts();
        }}
        onCancel={() => setEditingPost(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">Gerenciar Posts</h2>
          <p className="text-slate-400">Gerencie todos os posts do blog</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Post
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C2A537]"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.length === 0 ? (
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-slate-400">
                  Nenhum post encontrado.
                  <br />
                  Clique em &quot;Novo Post&quot; para criar seu primeiro post.
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                className="border-slate-700/50 bg-slate-800/30"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-lg text-white">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{post.published ? "Publicado" : "Rascunho"}</span>
                        {post.category && (
                          <span
                            className="rounded px-2 py-1 text-xs"
                            style={{
                              backgroundColor: post.category.color + "20",
                              color: post.category.color,
                            }}
                          >
                            {post.category.name}
                          </span>
                        )}
                        <span>{post.readTime} min de leitura</span>
                        <span>{post.views} visualizações</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleTogglePublished(post.id, !post.published)
                        }
                        className="border-[#C2A537] bg-[#C2A537] text-black hover:bg-[#D4B547]"
                      >
                        {post.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setEditingPost(post)}
                        className="border-[#C2A537] bg-[#C2A537] text-black hover:bg-[#D4B547]"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="border-red-600 bg-red-600 text-white hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-slate-300">{post.excerpt}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
