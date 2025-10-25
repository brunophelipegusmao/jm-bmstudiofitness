import clsx from "clsx";
import { useId } from "react";
type InputCheckBoxProps = {
  labelText?: string;
  checked?: boolean;
} & React.ComponentProps<"input">;

export function InputCheckbox({
  labelText = "",
  type = "checkbox",
  ...props
}: InputCheckBoxProps) {
  const id = useId();
  return (
    <div className="intems-center flex gap-3">
      <input
        {...props}
        className={clsx(
          "h-4 w-4 outline-none",
          "focus:ring-4 focus:ring-[#867536]",
          props.className,
        )}
        id={id}
        type={type}
      />
      {labelText && (
        <label htmlFor={id} className="text-sm">
          {labelText}
        </label>
      )}
    </div>
  );
}
