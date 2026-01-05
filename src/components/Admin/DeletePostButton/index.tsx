"use client";

// COMPONENTE TEMPORARIAMENTE DESABILITADO - FUNCIONALIDADE DE POSTS NÃO IMPLEMENTADA

type DeletePostButtonProps = {
  id: string;
  title: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DeletePostButton(_props: DeletePostButtonProps) {
  // Componente temporariamente desabilitado
  return (
    <div className="text-sm text-gray-500">
      Funcionalidade de posts em desenvolvimento
    </div>
  );
}

/* 
// CÓDIGO ORIGINAL COMENTADO:

export function DeletePostButton({ id, title }: DeletePostButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);

  function handleClick() {
    toast.dismiss();
    setShowDialog(true);
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await deletePostAction(id);
      setShowDialog(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Post deletado com sucesso!");
    });
  }

  return (
    <>
      <button
        className={clsx(
          "cursor-pointer text-red-500 transition",
          "[&_svg]:h-4  [&_svg]:w-4",
          "hover:scale-120",
          " hover:text-red-700",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-label={`Deletar post ${title} definitivamente`}
        title={`Deletar post ${title} definitivamente`}
        onClick={handleClick}
        disabled={isPending}
      >
        <Trash2Icon />
      </button>
      {showDialog && (
        <Dialog
          isVisible={showDialog}
          title="Você deseja apagar o post?"
          content={`Tem certeza que deseja apagar o post "${title}"?`}
          onCancel={() => setShowDialog(false)}
          onConfirm={() => {
            handleConfirm();
          }}
          disabled={isPending}
        />
      )}
    </>
  );
}
*/
