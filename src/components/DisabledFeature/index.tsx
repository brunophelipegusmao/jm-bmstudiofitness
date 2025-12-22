"use client";

interface DisabledFeatureProps {
  feature: string;
  children?: React.ReactNode;
}

export default function DisabledFeature({
  feature,
  children,
}: DisabledFeatureProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-yellow-500/30 bg-gradient-to-br from-yellow-900/10 via-transparent to-yellow-900/5 p-8">
      <div className="max-w-md text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
          <svg
            className="h-8 w-8 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-bold text-yellow-500">
          Funcionalidade Temporariamente Indisponível
        </h3>
        <p className="mb-4 text-slate-400">
          {feature} está sendo migrado para a nova arquitetura de API.
        </p>
        <p className="text-sm text-slate-500">
          TODO: Implementar endpoint no backend e migrar este componente
        </p>
        {children}
      </div>
    </div>
  );
}
