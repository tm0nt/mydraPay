"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, insira seu e-mail");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erro ao enviar e-mail de recuperação");
        return;
      }

      setIsEmailSent(true);
      toast.success("E-mail de recuperação enviado com sucesso!", {
        description: "Verifique sua caixa de entrada e spam.",
        duration: 5000,
      });
    } catch (error) {
      toast.error("Erro inesperado ao enviar e-mail");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsEmailSent(false);
    setEmail("");
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />

        <div className="w-full max-w-md mx-auto relative z-10">
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-4 pb-6 text-center">
              <div className="mx-auto w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                E-mail enviado!
              </CardTitle>
              <p className="text-gray-400">
                Enviamos um link de recuperação para <br />
                <span className="text-white font-medium">{email}</span>
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-blue-100 text-sm font-medium">
                      Verifique sua caixa de entrada
                    </p>
                    <p className="text-blue-200/80 text-xs">
                      O e-mail pode levar alguns minutos para chegar. Não esqueça de verificar a pasta de spam.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white h-12 rounded-xl"
                >
                  Enviar para outro e-mail
                </Button>

                <Link href="/login">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="flex items-center">
              <Image
                src="/logo-mydra.png"
                width={300}
                height={80}
                alt="Logo Mydra"
                priority
              />
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-4 pb-6">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
                <Image
                  src="/logo-mydra.png"
                  width={300}
                  height={80}
                  alt="Logo Mydra"
                  priority
                />
              </div>
              <CardTitle className="text-2xl font-bold text-white text-center">
                Esqueceu sua senha?
              </CardTitle>
              <p className="text-gray-400 text-center">
                Sem problemas, vamos ajudá-lo a recuperar
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Digite o e-mail associado à sua conta
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl font-medium transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Enviando e-mail...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar link de recuperação
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-gray-400">
                  Lembrou da senha?{" "}
                  <Link
                    href="/login"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors inline-flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar ao login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
