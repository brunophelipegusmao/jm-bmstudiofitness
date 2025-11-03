"use client";

import { Activity, BarChart3, Settings, Users } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-[#C2A537] to-[#D4B547] bg-clip-text text-4xl font-bold text-transparent lg:text-6xl">
            🏋️ JM Fitness Studio
          </h1>
          <p className="text-xl text-slate-300 lg:text-2xl">
            Sistema de Gerenciamento de Academia - Demo
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Explore as funcionalidades do sistema
          </p>
        </div>

        {/* Cards de Acesso */}
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {/* Área do Aluno */}
          <Link href="/user/dashboard-demo">
            <Card className="group cursor-pointer border-blue-500/40 bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-transparent transition-all duration-300 hover:scale-105 hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-400/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 rounded-full bg-blue-500/20 p-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/30">
                  <Activity className="h-12 w-12 text-blue-400 transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <CardTitle className="text-2xl text-blue-300">
                  Área do Aluno
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-blue-200/80">
                  Acesse seu dashboard pessoal, histórico de treinos, dados de
                  saúde e informações financeiras.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard Pessoal</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <Activity className="h-4 w-4" />
                    <span>Histórico de Check-ins</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <Users className="h-4 w-4" />
                    <span>Dados de Saúde</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </div>
                </div>
                <div className="pt-4 text-center">
                  <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300">
                    Clique para Acessar →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Área do Coach/Admin */}
          <Link href="/admin/dashboard-demo">
            <Card className="group cursor-pointer border-[#C2A537]/40 bg-gradient-to-br from-[#C2A537]/20 via-[#D4B547]/10 to-transparent transition-all duration-300 hover:scale-105 hover:border-[#C2A537]/60 hover:shadow-xl hover:shadow-[#C2A537]/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 rounded-full bg-[#C2A537]/20 p-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#C2A537]/30">
                  <Users className="h-12 w-12 text-[#C2A537] transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <CardTitle className="text-2xl text-[#C2A537]">
                  Área do Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-[#C2A537]/80">
                  Dashboard administrativo completo para gerenciar alunos,
                  pagamentos, frequência e relatórios.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#C2A537]">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard Administrativo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#C2A537]">
                    <Users className="h-4 w-4" />
                    <span>Gerenciamento de Alunos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#C2A537]">
                    <Activity className="h-4 w-4" />
                    <span>Controle de Frequência</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#C2A537]">
                    <Settings className="h-4 w-4" />
                    <span>Relatórios e Análises</span>
                  </div>
                </div>
                <div className="pt-4 text-center">
                  <span className="rounded-full bg-[#C2A537]/20 px-4 py-2 text-sm font-medium text-[#C2A537]">
                    Clique para Acessar →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Informações Técnicas */}
        <div className="mt-12 text-center">
          <Card className="mx-auto max-w-2xl border-slate-700/50 bg-slate-800/30">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-300">
                💡 Sobre esta Demo
              </h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>
                  Esta é uma versão de demonstração do sistema JM Fitness
                  Studio.
                </p>
                <p>
                  Os dados exibidos são fictícios e as funcionalidades estão
                  configuradas para visualização.
                </p>
                <p>
                  Desenvolvido com Next.js 15, React 19, TypeScript e
                  TailwindCSS.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            © 2025 JM Fitness Studio - Sistema de Gerenciamento
          </p>
        </footer>
      </div>
    </div>
  );
}
