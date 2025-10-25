"use client";

import { uploadImageAction } from "@/actions/upload/upload-image-action";
import { Button } from "@/components/Button";
import { ImageUpIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "react-toastify";

type ImageUploaderProps = {
  disabled?: boolean;
};

export function ImageUploader({ disabled = false }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startTransition] = useTransition();
  const [imgUrl, setImgUrl] = useState("");

  function handleFileChange() {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  }

  function handleChange() {
    toast.dismiss();
    if (!fileInputRef.current) return;

    const fileInput = fileInputRef.current;
    const file = fileInput?.files?.[0];

    if (!file) {
      setImgUrl("");
      return;
    }
    const uploadMaxSize =
      Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 1048576;

    if (file.size > uploadMaxSize) {
      const readableMaxSize = (uploadMaxSize / 1024).toFixed(2);
      toast.error(
        `O arquivo é muito grande. O tamanho máximo é ${readableMaxSize}KB.`,
      );
      fileInput.value = "";
      setImgUrl("");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadImageAction(formData);

      if (result.error) {
        toast.error(result.error);
        fileInput.value = "";
        setImgUrl("");
        return;
      }
      setImgUrl(result.url);
      toast.success("Imagem enviada!");
    });

    fileInput.value = "";
    // TODO: upload para o servidor
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      <Button
        onClick={handleFileChange}
        type="button"
        className="self-start"
        disabled={isUploading || disabled}
      >
        <ImageUpIcon /> Enviar Foto
      </Button>

      {imgUrl && (
        <div className="flex flex-col gap-4">
          <p>
            <b>URL: </b> {imgUrl}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="h-[220px] w-[220px] rounded-lg"
            src={imgUrl}
            alt="Uploaded image"
          />
        </div>
      )}

      <input
        onChange={handleChange}
        ref={fileInputRef}
        className="hidden"
        name="file"
        type="file"
        accept="image/*"
        disabled={isUploading || disabled}
      />
    </div>
  );
}
