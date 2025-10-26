import { Button } from "@/components/Button";
import { InputCheckbox } from "@/components/ImputCheckbox";
import { InputText } from "@/components/InputText";
import { InputTextarea } from "@/components/InputTextarea";

export default function UserRegistrationPage() {
  return (
    <div className="flex flex-col items-center gap-3 p-3">
      <form action="" className="flex flex-col gap-4">
        <InputText labelText="NOME COMPLETO" />
      </form>
      <InputCheckbox labelText="Aceito os termos e condições" type="checkbox" />
      <InputTextarea labelText="Observações" />
      <Button
        variant="default"
        size="md"
        type="button"
        className="m-2 w-[200px] text-center"
      >
        Entrar
      </Button>
    </div>
  );
}
