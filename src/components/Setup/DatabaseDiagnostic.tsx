"use client";

import {
  AlertCircle,
  CheckCircle,
  Database,
  Loader2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getDatabaseInfo,
  testDatabaseConnection,
} from "@/actions/setup/database-check";

export function DatabaseDiagnostic() {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);
  const [dbInfo, setDbInfo] = useState<{
    tables?: string[];
    error?: string;
  } | null>(null);

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  async function loadDatabaseInfo() {
    const info = await getDatabaseInfo();
    setDbInfo(info);
  }

  async function handleTestConnection() {
    setIsChecking(true);
    setConnectionResult(null);

    try {
      const result = await testDatabaseConnection();
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({
        success: false,
        error: "Erro ao testar conexão",
        details: String(error),
      });
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#C2A537] to-[#D4B547]">
          <Database className="h-8 w-8 text-black" />
        </div>
        <h1 className="text-3xl font-bold text-[#C2A537]">
          Diagnóstico de Banco de Dados
        </h1>
        <p className="text-slate-400">
          Verifique a configuração e conexão com PostgreSQL
        </p>
      </div>

      {/* Informações do Banco */}
      <div className="rounded-lg border border-[#C2A537]/20 bg-gradient-to-b from-slate-900 via-slate-900 to-black p-6">
        <h2 className="mb-4 text-xl font-semibold text-[#C2A537]">
          Configuração Atual
        </h2>

        {dbInfo ? (
          dbInfo.configured ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Host:</span>
                <span className="font-mono text-slate-200">{dbInfo.host}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Porta:</span>
                <span className="font-mono text-slate-200">{dbInfo.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Banco:</span>
                <span className="font-mono text-slate-200">
                  {dbInfo.database}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Usuário:</span>
                <span className="font-mono text-slate-200">
                  {dbInfo.username}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-400">
              <AlertCircle className="h-5 w-5" />
              <span>{dbInfo.message}</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando informações...</span>
          </div>
        )}
      </div>

      {/* Teste de Conexão */}
      <div className="rounded-lg border border-[#C2A537]/20 bg-gradient-to-b from-slate-900 via-slate-900 to-black p-6">
        <h2 className="mb-4 text-xl font-semibold text-[#C2A537]">
          Teste de Conexão
        </h2>

        <button
          onClick={handleTestConnection}
          disabled={isChecking || !dbInfo?.configured}
          className="w-full rounded-lg bg-linear-to-r from-[#C2A537] to-[#D4B547] px-4 py-3 font-semibold text-black transition-all hover:opacity-90 disabled:opacity-50"
        >
          {isChecking ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Testando conexão...
            </span>
          ) : (
            "Testar Conexão"
          )}
        </button>

        {/* Resultado do Teste */}
        {connectionResult && (
          <div className="mt-4">
            {connectionResult.success ? (
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Conexão bem-sucedida!</span>
                </div>
                <p className="mt-2 text-sm text-green-300">
                  {connectionResult.message}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">
                    {connectionResult.error}
                  </span>
                </div>
                {connectionResult.details && (
                  <p className="mt-2 text-sm text-red-300">
                    <strong>Detalhes:</strong> {connectionResult.details}
                  </p>
                )}
                {connectionResult.solution && (
                  <p className="mt-2 text-sm text-red-300">
                    <strong>Solução:</strong> {connectionResult.solution}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
        <h3 className="mb-2 font-semibold text-blue-300">📋 Como Configurar</h3>
        <ol className="space-y-2 text-sm text-blue-200">
          <li>
            1. Copie o arquivo{" "}
            <code className="rounded bg-black/50 px-1">.env.example</code> para{" "}
            <code className="rounded bg-black/50 px-1">.env.local</code>
          </li>
          <li>
            2. Edite{" "}
            <code className="rounded bg-black/50 px-1">.env.local</code> com
            suas credenciais do PostgreSQL
          </li>
          <li>3. Certifique-se que o PostgreSQL está rodando</li>
          <li>4. Crie o banco de dados (se ainda não existe)</li>
          <li>5. Teste a conexão usando o botão acima</li>
          <li>
            6. Se a conexão funcionar, prossiga para{" "}
            <Link
              href="/setup"
              className="font-semibold text-[#C2A537] underline"
            >
              /setup
            </Link>
          </li>
        </ol>
      </div>

      {/* Comandos Úteis */}
      <div className="rounded-lg border border-[#C2A537]/20 bg-gradient-to-b from-slate-900 via-slate-900 to-black p-6">
        <h2 className="mb-4 text-xl font-semibold text-[#C2A537]">
          Comandos Úteis
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-400">Criar banco de dados:</p>
            <code className="mt-1 block rounded bg-black/50 p-2 text-slate-200">
              createdb jm_fitness_studio
            </code>
          </div>
          <div>
            <p className="text-slate-400">
              Verificar se PostgreSQL está rodando:
            </p>
            <code className="mt-1 block rounded bg-black/50 p-2 text-slate-200">
              pg_ctl status
            </code>
          </div>
          <div>
            <p className="text-slate-400">Conectar ao banco:</p>
            <code className="mt-1 block rounded bg-black/50 p-2 text-slate-200">
              psql jm_fitness_studio
            </code>
          </div>
        </div>
      </div>

      {/* Botão para Setup */}
      {connectionResult?.success && (
        <Link
          href="/setup"
          className="block w-full rounded-lg border border-[#C2A537] bg-[#C2A537]/10 px-4 py-3 text-center font-semibold text-[#C2A537] transition-all hover:bg-[#C2A537]/20"
        >
          ✅ Conexão OK - Prosseguir para Setup →
        </Link>
      )}
    </div>
  );
}
