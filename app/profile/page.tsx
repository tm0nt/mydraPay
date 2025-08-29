"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Mail, Phone, Calendar, Save, TrendingUp, Target, Bell, Moon, Upload, Lock
} from "lucide-react";
import { useUserStore } from "@/stores/useProfileStore"; // Import do store

// Utilitário seguro para JSON de erro
async function safeJson(res: Response) { try { return await res.json(); } catch { return null; } }

// Máscaras simples
function formatCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
  if (d.length <= 9) return d.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
  return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*$/, "$1.$2.$3-$4");
}
function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return d.replace(/^(\d{2})(\d{0,3})$/, "$1.$2");
  if (d.length <= 8) return d.replace(/^(\d{2})(\d{3})(\d{0,3})$/, "$1.$2.$3");
  if (d.length <= 12) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})$/, "$1.$2.$3/$4");
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*$/, "$1.$2.$3/$4-$5");
}

export default function ProfilePage() {
  // Store Zustand
  const { data, loading: storeLoading, error: storeError, fetchProfile } = useUserStore();

  const [active, setActive] = useState<"pessoal" | "kyc" | "seguranca">("pessoal");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kycApproved, setKycApproved] = useState<boolean>(false);
  const [hasSavedTaxId, setHasSavedTaxId] = useState(false);

  // Form principal (preenchido pelo store)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    taxId: "",
    joinDate: "",
    type: "INDIVIDUAL" as "INDIVIDUAL" | "BUSINESS",
  });

  // Documento (inputs com máscara)
  const isBusiness = form.type === "BUSINESS";
  const taxIdMasked = isBusiness ? formatCNPJ(form.taxId) : formatCPF(form.taxId);

  // KYC: arquivos e tipo de documento PF
  const [docTypePF, setDocTypePF] = useState<"PASSPORT" | "NATIONAL_ID" | "DRIVER_LICENSE">("NATIONAL_ID");
  const [fileFront, setFileFront] = useState<File | null>(null);
  const [fileBack, setFileBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [kycLoading, setKycLoading] = useState(false);

  // Modal de confirmação para travar taxId ao salvar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ name?: string; phone?: string; taxId?: string } | null>(null);

  // Senha (para aba segurança)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Stats usando dados do store
  const stats = useMemo(() => {
    if (!data || storeLoading) {
      return [
        { title: "Transações", value: "0", change: "+0%", icon: TrendingUp, color: "text-green-400" },
        { title: "Volume Total", value: "R$ 0,00", change: "+0%", icon: Target, color: "text-purple-400" },
      ];
    }

    const transactionsCount = data.incomingStats?.totalIncomingCompleted || 0;
    const totalVolume = data.incomingStats?.totalIncomingAmount || 0;

    return [
      { 
        title: "Transações", 
        value: transactionsCount.toLocaleString("pt-BR"), 
        change: "+12%", 
        icon: TrendingUp, 
        color: "text-green-400" 
      },
      { 
        title: "Volume Total", 
        value: new Intl.NumberFormat("pt-BR", { 
          style: "currency", 
          currency: "BRL" 
        }).format(totalVolume), 
        change: "+23%", 
        icon: Target, 
        color: "text-purple-400" 
      },
    ];
  }, [data, storeLoading]);

  // Inicialização dos dados quando o store carrega
  useEffect(() => {
    if (data?.user && !loading) {
      const u = data.user;
      setForm({
        name: u.name ?? "",
        email: u.email ?? "",
        phone: u.phone ?? "",
        taxId: u.taxId ?? "",
        joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "",
        type: u.type === "BUSINESS" ? "BUSINESS" : "INDIVIDUAL",
      });
      setKycApproved(Boolean(u.kycApproved));
      setHasSavedTaxId(!!u.taxId);
    }
  }, [data, loading]);

  // Garantir que os dados sejam carregados
  useEffect(() => {
    if (!data && !storeLoading && !storeError) {
      fetchProfile();
    }
  }, [data, storeLoading, storeError, fetchProfile]);

  // Submissão unificada
  async function onSubmitPessoal(e: React.FormEvent) {
    e.preventDefault();
    const changes = {
      name: form.name,
      phone: form.phone || null,
    };
    const toSaveTaxId = form.taxId.trim();

    if (!hasSavedTaxId && toSaveTaxId) {
      setPendingChanges({ ...changes, taxId: toSaveTaxId });
      setConfirmOpen(true);
      return;
    }

    // Salvar sem modal se não houver taxId novo
    await saveProfile(changes);
  }

  // Salvar perfil
  async function saveProfile(changes: { name?: string; phone?: string; taxId?: string }) {
    try {
      setSaving(true);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.error || "Falha ao salvar");
      }
      toast.success("Informações atualizadas com sucesso");
      if (changes.taxId) {
        setHasSavedTaxId(true);
      }
      // Recarregar dados do store após salvar
      await fetchProfile();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao atualizar informações");
    } finally {
      setSaving(false);
    }
  }

  // Confirmar modal: efetiva o salvamento com taxId
  async function confirmarTaxId() {
    setConfirmOpen(false);
    if (pendingChanges) {
      await saveProfile(pendingChanges);
      setPendingChanges(null);
    }
  }

  // Cancelar modal
  function cancelarTaxId() {
    setConfirmOpen(false);
    setPendingChanges(null);
  }

  // Envio de KYC
  async function onSubmitKyc(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Regras:
      // PF: precisa fileFront, fileBack, selfie e type = doc selecionado (PASSPORT/NATIONAL_ID/DRIVER_LICENSE)
      // PJ: precisa fileFront (contrato social) e type = COMPANY_REGISTRATION
      const fd = new FormData();
      if (form.type === "INDIVIDUAL") {
        if (!fileFront || !fileBack || !selfie) {
          toast.error("Envie frente, verso e selfie do documento.");
          return;
        }
        fd.append("fileFront", fileFront);
        fd.append("fileBack", fileBack);
        fd.append("selfie", selfie);
        fd.append("type", docTypePF); // 'PASSPORT' | 'NATIONAL_ID' | 'DRIVER_LICENSE'
      } else {
        if (!fileFront) {
          toast.error("Envie o Contrato Social da empresa.");
          return;
        }
        fd.append("fileFront", fileFront);
        fd.append("type", "COMPANY_REGISTRATION");
      }

      setKycLoading(true);
      const res = await fetch("/api/user/kyc", { method: "POST", body: fd });
      const body = await safeJson(res);
      if (!res.ok) {
        throw new Error(body?.error || "Falha ao enviar KYC");
      }
      toast.success("KYC enviado com sucesso");
      // Opcional: ajustar estado local kycApproved conforme back-office
      // Aqui não marcamos como aprovado automaticamente; aprovação é processo assíncrono.
    } catch (e: any) {
      toast.error(e?.message || "Erro ao enviar KYC");
    } finally {
      setKycLoading(false);
    }
  }

  // Troca de senha
  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As senhas novas não coincidem");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres");
      return;
    }
    try {
      setPasswordLoading(true);
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const body = await safeJson(res);
      if (!res.ok) {
        throw new Error(body?.error || "Falha ao alterar senha");
      }
      toast.success("Senha alterada com sucesso");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao alterar senha");
    } finally {
      setPasswordLoading(false);
    }
  }

  // Loading ou erro do store
  if (storeError) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-black">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6 md:p-8 space-y-8">
              <div className="text-center space-y-4">
                <div className="text-red-400 text-lg">Erro ao carregar dados</div>
                <p className="text-gray-400">{storeError}</p>
                <Button onClick={fetchProfile} className="bg-purple-600 hover:bg-purple-700">
                  Tentar novamente
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-black">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-10 w-10 hover:bg-gray-800/50 transition-all duration-300 rounded-xl border border-gray-800/50 bg-gray-900/50" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Meu Perfil</h1>
                  <p className="text-gray-400">Gerencie suas informações pessoais</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-800/50 rounded-xl" type="button">
                  <Moon className="h-5 w-5 text-gray-400" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-800/50 rounded-xl" type="button">
                  <Bell className="h-5 w-5 text-gray-400" />
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Perfil à esquerda */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardContent className="p-6 text-center space-y-6">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center mx-auto">
                        <Image 
                          src="/avatar/profile.png" 
                          alt="Profile Avatar"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-white">
                        {storeLoading ? "Carregando..." : data?.user?.name || form.name || "—"}
                      </h2>
                      <p className="text-gray-400">
                        {storeLoading ? "Carregando..." : data?.user?.email || form.email || "—"}
                      </p>
                      {kycApproved ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">KYC Aprovado</Badge>
                      ) : (
                        <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">KYC Pendente</Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Perfil Completo</span>
                        <span className="text-white font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2 bg-gray-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800/50">
                      {stats.map((stat) => (
                        <div key={stat.title} className="text-center">
                          <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                          <div className="text-xs text-gray-400">{stat.title}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna Direita */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader className="flex flex-col gap-4">
                    <CardTitle className="text-white">Configurações</CardTitle>

                    {/* Tabs */}
                    <div className="hidden md:block">
                      <Tabs value={active} onValueChange={(v: any) => setActive(v)}>
                        <TabsList className="bg-neutral-900 border border-gray-800 rounded-lg p-1">
                          <TabsTrigger value="pessoal" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">
                            Informações Pessoais
                          </TabsTrigger>
                          <TabsTrigger value="kyc" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">
                            KYC
                          </TabsTrigger>
                          <TabsTrigger value="seguranca" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">
                            Segurança
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Informações Pessoais */}
                    {active === "pessoal" && (
                      <form onSubmit={onSubmitPessoal} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-gray-300 flex items-center gap-2"><User className="w-4 h-4" />Nome Completo</Label>
                            <Input
                              value={form.name}
                              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                              className="bg-gray-800/50 border-gray-700/50 text-white"
                              required
                              disabled={storeLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300 flex items-center gap-2"><Mail className="w-4 h-4" />Email</Label>
                            <Input
                              type="email"
                              value={form.email}
                              className="bg-gray-800/50 border-gray-700/50 text-white"
                              disabled
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">{isBusiness ? "CNPJ" : "CPF"}</Label>
                            <Input
                              inputMode="numeric"
                              className="bg-neutral-900 border border-gray-800 text-white"
                              placeholder={isBusiness ? "00.000.000/0000-00" : "000.000.000-00"}
                              value={taxIdMasked}
                              onChange={(e) => {
                                const onlyDigits = e.target.value.replace(/\D/g, "");
                                setForm((p) => ({ ...p, taxId: onlyDigits }));
                              }}
                              required
                              disabled={storeLoading || hasSavedTaxId}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300 flex items-center gap-2"><Phone className="w-4 h-4" />Telefone</Label>
                            <Input
                              value={form.phone}
                              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                              className="bg-gray-800/50 border-gray-700/50 text-white"
                              disabled={storeLoading}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Membro desde {form.joinDate || "—"}</span>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white" disabled={saving || storeLoading}>
                            {saving ? "Salvando..." : (<><Save className="w-4 h-4 mr-2" />Salvar Alterações</>)}
                          </Button>
                        </div>
                        {hasSavedTaxId && (
                          <p className="text-xs text-gray-400">Documento já cadastrado e não pode ser alterado.</p>
                        )}
                      </form>
                    )}

                    {/* KYC dinâmico PF/PJ */}
                    {active === "kyc" && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Status:</span>
                          {kycApproved ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aprovado</Badge>
                          ) : (
                            <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">Pendente</Badge>
                          )}
                        </div>

                        {kycApproved ? (
                          <div className="text-green-400 text-center py-8">
                            <p className="text-lg font-semibold">Documentação aprovada com sucesso!</p>
                          </div>
                        ) : (
                          <form onSubmit={onSubmitKyc} className="space-y-6">
                            {form.type === "INDIVIDUAL" ? (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2 md:col-span-3">
                                    <Label className="text-gray-300">Tipo de Documento (PF)</Label>
                                    <select
                                      value={docTypePF}
                                      onChange={(e) => setDocTypePF(e.target.value as any)}
                                      className="w-full h-11 rounded-lg bg-neutral-900 border border-gray-800 text-white px-3"
                                    >
                                      <option value="PASSPORT">Passaporte</option>
                                      <option value="NATIONAL_ID">RG</option>
                                      <option value="DRIVER_LICENSE">CNH</option>
                                    </select>
                                  </div>

                                  <UploadField id="pfFront" label="Documento (Frente)" onChange={(f) => setFileFront(f)} />
                                  <UploadField id="pfBack" label="Documento (Verso)" onChange={(f) => setFileBack(f)} />
                                  <UploadField id="pfSelfie" label="Selfie com Documento" onChange={(f) => setSelfie(f)} />
                                </div>

                                <Button className="bg-purple-600 hover:bg-purple-700" disabled={kycLoading}>
                                  {kycLoading ? "Enviando..." : "Enviar KYC"}
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <UploadField id="pjContrato" label="Contrato Social (PDF/Imagem)" onChange={(f) => setFileFront(f)} />
                                </div>
                                <p className="text-xs text-gray-400">Para PJ, envie apenas o Contrato Social.</p>
                                <Button className="bg-purple-600 hover:bg-purple-700" disabled={kycLoading}>
                                  {kycLoading ? "Enviando..." : "Enviar KYC"}
                                </Button>
                              </>
                            )}
                          </form>
                        )}
                      </div>
                    )}

                    {/* Segurança */}
                    {active === "seguranca" && (
                      <form onSubmit={onSubmitPassword} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-gray-300 flex items-center gap-2"><Lock className="w-4 h-4" />Senha Antiga</Label>
                            <Input
                              type="password"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              className="bg-gray-800/50 border-gray-700/50 text-white"
                              required
                              disabled={passwordLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300 flex items-center gap-2"><Lock className="w-4 h-4" />Nova Senha</Label>
                            <Input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="bg-gray-800/50 border-gray-700/50 text-white"
                              required
                              disabled={passwordLoading}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-gray-300 flex items-center gap-2"><Lock className="w-4 h-4" />Confirmar Nova Senha</Label>
                            <Input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="bg-gray-800/50 border-gray-700/50 text-white"
                              required
                              disabled={passwordLoading}
                            />
                          </div>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" disabled={passwordLoading}>
                          {passwordLoading ? "Alterando..." : (<><Save className="w-4 h-4 mr-2" />Alterar Senha</>)}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de confirmação */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-neutral-900 p-6 space-y-4">
            <h3 className="text-white text-lg font-semibold">Confirmar documento</h3>
            <p className="text-gray-300 text-sm">
              Após confirmar, o documento não poderá ser alterado. Confirma que os dados estão corretos?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="border-gray-700 text-gray-200" onClick={cancelarTaxId}>
                Cancelar
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={confirmarTaxId}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}

function UploadField({
  id,
  label,
  onChange,
}: {
  id: string;
  label: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-300">{label}</Label>
      <Input
        id={id}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        className="bg-neutral-900 border border-gray-800 text-white file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-neutral-800 file:text-gray-200"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <p className="text-xs text-gray-500">Formatos aceitos: PNG, JPG, PDF</p>
    </div>
  );
}
