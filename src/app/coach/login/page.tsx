"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CoachLogin = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/coach");
      } else {
        setError(result.error || "Erro ao fazer login");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-gradient-to-br from-[#1b1b1a] via-black to-[#1b1b1a] py-20 text-white"
    >
      {/* Background decorativo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>

      <div className="relative z-10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="perspective-1000 relative">
            {/* Background decorativo para o card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute -inset-4 animate-pulse rounded-3xl bg-gradient-to-r from-[#C2A537]/20 via-[#C2A537]/10 to-[#C2A537]/20 blur-xl"
            ></motion.div>

            <motion.div
              initial={{ rotateX: 15, rotateY: -15, z: -100 }}
              animate={{ rotateX: 0, rotateY: 0, z: 0 }}
              whileHover={{
                rotateX: -5,
                rotateY: 5,
                z: 50,
                transition: { duration: 0.3 },
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ transformStyle: "preserve-3d" }}
              className="transform-gpu"
            >
              <Card className="hover:shadow-3xl relative border-2 border-[#C2A537]/50 bg-black/95 shadow-2xl shadow-[#C2A537]/20 backdrop-blur-lg transition-all duration-300 hover:shadow-[#C2A537]/30">
                <CardHeader>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center gap-4"
                  >
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="mb-4 rounded-lg border border-red-500/50 bg-red-900/20 p-3 text-sm text-red-300 backdrop-blur-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                    <GraduationCap className="h-16 w-16 text-[#C2A537]" />
                    <CardTitle className="font-oswald text-center text-2xl font-bold tracking-wide text-[#C2A537] uppercase md:text-3xl">
                      Login do Professor
                    </CardTitle>
                    <CardDescription className="text-center text-sm text-slate-300 md:text-base">
                      Acesse sua área exclusiva para acompanhar seus alunos
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    {state.error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="mb-4 rounded-lg border border-red-500/50 bg-red-900/20 p-3 text-sm text-red-300 backdrop-blur-sm"
                      >
                        {state.error}
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="grid gap-3"
                      >
                        <Label
                          htmlFor="email"
                          className="font-medium text-[#C2A537]"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu.email@jmfitnessstudio.com"
                          required
                          disabled={isPending}
                          defaultValue={state.email}
                          className="border-[#C2A537]/30 bg-slate-900/50 text-white transition-all duration-300 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]/20"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 1.2 }}
                        className="grid gap-3"
                      >
                        <Label
                          htmlFor="password"
                          className="font-medium text-[#C2A537]"
                        >
                          Senha
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="sua senha"
                            required
                            disabled={isPending}
                            className="border-[#C2A537]/30 bg-slate-900/50 pr-12 text-white transition-all duration-300 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]/20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0 h-full px-3 py-2 transition-colors duration-300 hover:bg-[#C2A537]/10"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isPending}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-slate-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-slate-400" />
                              )}
                            </motion.div>
                          </Button>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.4 }}
                      >
                        <Button
                          type="submit"
                          disabled={isPending}
                          className="w-full transform bg-gradient-to-r from-[#C2A537] to-[#D4B547] font-semibold text-black transition-all duration-700 hover:scale-[1.02] hover:from-[#D4B547] hover:to-[#E6C658] hover:shadow-xl hover:shadow-[#C2A537]/30 active:scale-[0.98]"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Entrando...
                            </>
                          ) : (
                            <>
                              <GraduationCap className="mr-2 h-4 w-4" />
                              Entrar como Professor
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 1.6 }}
                        className="text-center"
                      >
                        <p className="text-sm text-slate-400">
                          Acesso exclusivo para professores credenciados
                        </p>
                      </motion.div>
                    </form>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CoachLogin;
