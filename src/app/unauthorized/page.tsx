import Link from "next/link";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <Container>
      <div className="flex min-h-[calc(100vh-240px)] items-center justify-center py-8">
        <Card className="w-[450px] max-w-md border-red-500/50 bg-black/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-400">
              Acesso Negado
            </CardTitle>
            <CardDescription className="text-slate-300">
              Você não tem permissão para acessar esta página
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="mb-4 text-6xl">🚫</div>
            <p className="text-slate-400">
              Esta área é restrita a usuários com permissões específicas. Entre
              em contato com o administrador se você acredita que deveria ter
              acesso.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <Link href="/user/login">
                <Button className="w-full bg-[#C2A537] text-black hover:bg-[#D4B547]">
                  Fazer Login
                </Button>
              </Link>

              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-400 hover:bg-slate-800"
                >
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
