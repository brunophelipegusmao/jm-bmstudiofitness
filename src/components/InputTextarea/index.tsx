import clsx from "clsx";
import { useId } from "react";

type InputTextProps = {
  id?: string;
  labelText?: string;
} & React.ComponentProps<"textarea">;

export function InputTextarea({ labelText = "", ...props }: InputTextProps) {
    const id = useId();
  return (
    <div className="flex flex-col p-2">
      <label
        htmlFor={id}
        className="text-md text-semibold pb-2 text-white"
      >
        {labelText}
      </label>
      <textarea
        id={id}
        className={clsx(
          "bg-[#d7ceac] text-base/tight font-bold text-black outline-0",
          "rounded-sm ring-3 ring-[#867536]",
          "disabled:cursor-not-allowed disabled:bg-[#8d7d54] disabled:italic",
          "read-only:cursor-not-allowed read-only:bg-[#b3a475] read-only:italic read-only:text-black/70",
          'w-auto h-32 resize-none',
          props.className,
        )}
        {...props}
      />
    </div>
  );
}
