"use client";

import { Calendar, Clock, Download, Eye, FileText, User } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccessLog {
  timestamp: string;
  studentId: string;
  dataType: string;
  action: "view" | "edit" | "export";
  userId: string;
  ip: string;
}

interface AccessLogsViewerProps {
  studentId?: string;
  className?: string;
}

export function AccessLogsViewer({
  studentId,
  className = "",
}: AccessLogsViewerProps) {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [studentId]);

  const loadLogs = () => {
    setIsLoading(true);
    try {
      const savedLogs = localStorage.getItem("jmfitness-access-logs");
      if (savedLogs) {
        const allLogs: AccessLog[] = JSON.parse(savedLogs);

        // Filtrar por estudante se especificado
        const filteredLogs = studentId
          ? allLogs.filter((log) => log.studentId === studentId)
          : allLogs;

        // Ordenar por timestamp mais recente
        const sortedLogs = filteredLogs.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        setLogs(sortedLogs.slice(0, 50)); // Mostrar apenas os 50 mais recentes
      }
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("pt-BR"),
      time: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "view":
        return <Eye className="h-4 w-4 text-blue-400" />;
      case "edit":
        return <FileText className="h-4 w-4 text-green-400" />;
      case "export":
        return <Download className="h-4 w-4 text-purple-400" />;
      default:
        return <Eye className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "view":
        return "Visualização";
      case "edit":
        return "Edição";
      case "export":
        return "Exportação";
      default:
        return "Desconhecido";
    }
  };

  const exportLogs = () => {
    const csvContent = [
      "Data,Hora,Estudante,Tipo de Dado,Ação,Usuário",
      ...logs.map((log) => {
        const { date, time } = formatTimestamp(log.timestamp);
        return `${date},${time},${log.studentId},${log.dataType},${getActionLabel(log.action)},${log.userId}`;
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `logs_acesso_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card
        className={`border-[#C2A537]/50 bg-black/60 backdrop-blur-sm ${className}`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-slate-400">Carregando logs...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border-[#C2A537]/50 bg-black/60 backdrop-blur-sm ${className}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <FileText className="h-5 w-5" />
            Log de Acessos {studentId && "(Estudante Específico)"}
          </CardTitle>
          {logs.length > 0 && (
            <Button
              onClick={exportLogs}
              size="sm"
              variant="outline"
              className="border-[#C2A537]/50 text-[#C2A537] hover:bg-[#C2A537]/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="py-8 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <p className="text-slate-400">Nenhum acesso registrado</p>
          </div>
        ) : (
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {logs.map((log, index) => {
              const { date, time } = formatTimestamp(log.timestamp);
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-lg border border-slate-700/50 bg-slate-800/50 p-3"
                >
                  <div className="flex-shrink-0">
                    {getActionIcon(log.action)}
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-2 text-sm md:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      <span className="text-white">{date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span className="text-white">{time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-slate-500" />
                      <span className="text-slate-300">{log.userId}</span>
                    </div>

                    <div className="text-slate-400">
                      {getActionLabel(log.action)} • {log.dataType}
                      {!studentId && (
                        <span className="ml-2 rounded bg-slate-700 px-2 py-1 text-xs">
                          {log.studentId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
