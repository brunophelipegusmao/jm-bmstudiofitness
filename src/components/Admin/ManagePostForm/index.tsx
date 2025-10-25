"use client";

import { InputText } from "@/components/InputText";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { useActionState, useEffect, useState } from "react";
import { ImageUploader } from "../ImageUploader";
import { InputCheckbox } from "@/components/InputCheckbox";
import { makePartialPublicPost, PublicPost } from "@/dto/post/dto";
import { Button } from "@/components/Button";
import { createPostAction } from "@/actions/post/create-post-action";
import { toast } from "react-toastify";
import { updatePostAction } from "@/actions/post/update-post.action";
import { useRouter, useSearchParams } from "next/navigation";

type ManagePostFormUpdateProps = {
  mode: "update";
  publicPost: PublicPost;
};

type ManagePostFormCreateProps = {
  mode: "create";
};

type ManagePostFormProps =
  | ManagePostFormUpdateProps
  | ManagePostFormCreateProps;

export function ManagePostForm(props: ManagePostFormProps) {
  const { mode } = props;
  const searchParams = useSearchParams();
  const created = searchParams.get("created");
  const router = useRouter();


  let publicPost;

  if (mode === "update") {
    publicPost = props.publicPost;
  }

  const actionsMap = {
    create: createPostAction,
    update: updatePostAction,
  };

  const initialState = {
    formState: makePartialPublicPost(publicPost),
    errors: [],
  };

  const [state, action, isPending] = useActionState(
    actionsMap[mode],
    initialState,
  );
  useEffect(() => {
    if (state.errors.length > 0) {
      toast.dismiss();
      state.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [state.errors]);

  useEffect(() => {
    if (state.success) {
      toast.dismiss();
      toast.success(
        mode === "create"
          ? "Post criado com sucesso!"
          : "Post atualizado com sucesso!",
      );
    }
  }, [state.success, mode]);

  useEffect(() => {
    if (created === "1" && mode === "create") {
      toast.dismiss();
      toast.success("Post criado com sucesso!");
      const url = new URL(window.location.href);
      url.searchParams.delete("created");
      router.replace(url.toString());
    }
  }, [created, mode, router]);

  const { formState } = state;
  const [contentValue, setContentValue] = useState(publicPost?.content || "");

  return (
    <form action={action} className="mb-16">
      <div className="flex flex-col gap-6">
        <InputText
          labelText="ID"
          name="id"
          type="text"
          placeholder="ID gerado automaticamente"
          defaultValue={formState.id}
          disabled={isPending}
          readOnly
        />

        <InputText
          labelText="Slug"
          name="slug"
          type="text"
          placeholder="Slug gerado automaticamente"
          defaultValue={formState.slug}
          disabled={isPending}
          readOnly
        />

        <InputText
          labelText="Autor"
          name="author"
          type="text"
          placeholder="Nome do autor"
          defaultValue={formState.author}
          disabled={isPending}
        />

        <InputText
          labelText="Título"
          name="title"
          type="text"
          placeholder="Título do post"
          defaultValue={formState.title}
          disabled={isPending}
        />

        <InputText
          labelText="Resumo"
          name="excerpt"
          type="text"
          placeholder="Digite um resumo do post"
          defaultValue={formState.excerpt}
          disabled={isPending}
        />

        <MarkdownEditor
          labelText="Conteúdo do post"
          value={contentValue}
          setValue={setContentValue}
          textAreaName="content"
          disabled={isPending}
        />

        <ImageUploader disabled={isPending} />

        <InputText
          labelText="URL da imagem de capa"
          name="coverImageUrl"
          type="text"
          placeholder="URL da imagem de capa"
          defaultValue={formState.coverImageUrl}
          disabled={isPending}
        />

        <InputCheckbox
          labelText="Publicar?"
          name="published"
          defaultChecked={formState.published}
          disabled={isPending}
        />

        <div className="mt-4 flex flex-col items-center">
          <Button disabled={isPending} className="self-center" type="submit">
            Salvar Post
          </Button>
        </div>
      </div>
    </form>
  );
}
