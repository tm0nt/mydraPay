"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  Palette,
  Database,
  Trash2,
  Download,
  Upload,
  Key,
  Code,
  Webhook,
  Globe2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Plus,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Credential, AllowedIp, WebhookUser, UserSettings, WebhookEvent } from "@prisma/client";
import { useUserStore } from "@/stores/useProfileStore";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "api";

  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [apiKeyVisible, setApiKeyVisible] = useState<boolean>(false);
  const [secretKeyVisible, setSecretKeyVisible] = useState<boolean>(false);

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [allowedIps, setAllowedIps] = useState<AllowedIp[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookUser[]>([]);

  const [newIp, setNewIp] = useState<{ cidr: string; note?: string }>({ cidr: "", note: "" });
  const [newWebhook, setNewWebhook] = useState<{ url: string; events: WebhookEvent[] }>({ url: "", events: [] });

  // Estados para forms novos
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileData, setProfileData] = useState<{ name?: string; phone?: string; taxId?: string }>({});
  const [kycFiles, setKycFiles] = useState<{ fileFront?: File; fileBack?: File; selfie?: File; type?: string }>({});

  // Carregar dados do store
  const { data: userData, fetchProfile } = useUserStore();

  // Estados de loading
  const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/user");
      if (!response.ok) throw new Error("Erro ao carregar dados");
      const data = await response.json();
      setSettings(data.settings);
      setCredential(data.credential);
      setAllowedIps(data.allowedIps);
      setWebhooks(data.webhooks);
    } catch (error) {
      toast.error("Erro ao carregar configurações");
    }
  };

  const updateSetting = async (updatedSettings: Partial<UserSettings>) => {
    try {
      const response = await fetch("/api/settings/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      if (!response.ok) throw new Error("Erro ao atualizar");
      toast.success("Configurações atualizadas");
      fetchSettings();
    } catch (error) {
      toast.error("Erro ao atualizar configurações");
    }
  };

  const addIp = async () => {
    if (!newIp.cidr.trim()) {
      toast.error("O campo CIDR é obrigatório");
      return;
    }

    try {
      const response = await fetch("/api/settings/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addIp", ...newIp }),
      });
      if (!response.ok) throw new Error("Erro ao adicionar IP");
      toast.success("IP adicionado");
      setNewIp({ cidr: "", note: "" });
      fetchSettings();
    } catch (error) {
      toast.error("Erro ao adicionar IP");
    }
  };

  const deleteIp = async (ipId: string) => {
    setIsDeleting(prev => ({ ...prev, [`ip-${ipId}`]: true }));
    
    try {
      const response = await fetch("/api/settings/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteIp", ipId }),
      });
      if (!response.ok) throw new Error("Erro ao deletar IP");
      toast.success("IP removido");
      fetchSettings();
    } catch (error) {
      toast.error("Erro ao deletar IP");
    } finally {
      setIsDeleting(prev => ({ ...prev, [`ip-${ipId}`]: false }));
    }
  };

  const addWebhook = async () => {
    if (!newWebhook.url.trim()) {
      toast.error("A URL do webhook é obrigatória");
      return;
    }
    if (newWebhook.events.length === 0) {
      toast.error("Selecione pelo menos um evento");
      return;
    }

    try {
      const response = await fetch("/api/settings/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addWebhook", ...newWebhook }),
      });
      if (!response.ok) throw new Error("Erro ao adicionar webhook");
      toast.success("Webhook adicionado");
      setNewWebhook({ url: "", events: [] });
      fetchSettings();
    } catch (error) {
      toast.error("Erro ao adicionar webhook");
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    setIsDeleting(prev => ({ ...prev, [`webhook-${webhookId}`]: true }));
    
    try {
      const response = await fetch("/api/settings/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteWebhook", webhookId }),
      });
      if (!response.ok) throw new Error("Erro ao deletar webhook");
      toast.success("Webhook removido");
      fetchSettings();
    } catch (error) {
      toast.error("Erro ao deletar webhook");
    } finally {
      setIsDeleting(prev => ({ ...prev, [`webhook-${webhookId}`]: false }));
    }
  };

  const deleteCredential = async () => {
    if (!confirm("Tem certeza que deseja deletar a credencial API? Esta ação é irreversível.")) {
      return;
    }

    setIsDeleting(prev => ({ ...prev, credential: true }));
    
    try {
      const response = await fetch("/api/settings/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteCredential" }),
      });
      if (!response.ok) throw new Error("Erro ao deletar credencial");
      toast.success("Credencial removida");
      fetchSettings();
    } catch (error) {
      toast.error("Erro ao deletar credencial");
    } finally {
      setIsDeleting(prev => ({ ...prev, credential: false }));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado para a área de transferência");
    } catch (err) {
      toast.error("Erro ao copiar");
    }
  };

  const availableEvents: WebhookEvent[] = ["PAYMENT_CREATED", "PAYMENT_PAID", "WITHDRAWAL_REQUESTED", "WITHDRAWAL_PAID"];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-black">
        <div className="fixed left-0 top-0 h-screen w-64 z-50 flex-shrink-0">
          <AppSidebar />
        </div>
        
        <main className="flex-1 ml-64 overflow-auto">
          <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-10 w-10 hover:bg-gray-800/50 transition-all duration-300 rounded-xl border border-gray-800/50 bg-gray-900/50" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações</h1>
                  <p className="text-gray-400">Personalize sua experiência na plataforma</p>
                </div>
              </div>
            </header>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="api" className="space-y-6">
                {/* Layout Desktop: Credenciais | IPs (lado a lado) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Credenciais da API */}
                  <Card className="bg-gray-900/50 border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Key className="w-5 h-5 text-yellow-400" />
                        Credenciais da API
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {credential ? (
                        <>
                          <div className="space-y-2">
                            <Label className="text-gray-300">Public Key</Label>
                            <div className="flex gap-2">
                              <Input
                                type={apiKeyVisible ? "text" : "password"}
                                value={credential.publicKey}
                                readOnly
                                className="bg-gray-800/50 border-gray-700/50 text-white font-mono"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setApiKeyVisible(!apiKeyVisible)}
                                className="border-purple-700/50 hover:bg-purple-800/50 text-purple-400 hover:text-purple-300"
                              >
                                {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(credential.publicKey)}
                                className="border-purple-700/50 hover:bg-purple-800/50 text-purple-400 hover:text-purple-300"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-300">Secret Key</Label>
                            <div className="flex gap-2">
                              <Input
                                type={secretKeyVisible ? "text" : "password"}
                                value={credential.secretKey}
                                readOnly
                                className="bg-gray-800/50 border-gray-700/50 text-white font-mono"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSecretKeyVisible(!secretKeyVisible)}
                                className="border-purple-700/50 hover:bg-purple-800/50 text-purple-400 hover:text-purple-300"
                              >
                                {secretKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(credential.secretKey)}
                                className="border-purple-700/50 hover:bg-purple-800/50 text-purple-400 hover:text-purple-300"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-4">Nenhuma credencial encontrada</p>
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Gerar Credencial
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* IPs Liberados */}
                  <Card className="bg-gray-900/50 border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe2 className="w-5 h-5 text-blue-400" />
                        IPs Liberados
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {allowedIps.map((ip) => (
                          <div key={ip.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl">
                            <div className="flex-1">
                              <p className="text-white font-medium">{ip.cidr}</p>
                              <p className="text-gray-400 text-sm">{ip.note || "Sem nota"}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteIp(ip.id)}
                              disabled={isDeleting[`ip-${ip.id}`]}
                            >
                              {isDeleting[`ip-${ip.id}`] ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-800/50">
                        <Label className="text-gray-300">Adicionar Novo IP</Label>
                        <div className="space-y-2">
                          <Input
                            placeholder="CIDR (ex: 192.168.1.0/24)"
                            value={newIp.cidr}
                            onChange={(e) => setNewIp({ ...newIp, cidr: e.target.value })}
                            className="bg-gray-800/50 border-gray-700/50 text-white"
                          />
                          <Input
                            placeholder="Nota (opcional)"
                            value={newIp.note ?? ""}
                            onChange={(e) => setNewIp({ ...newIp, note: e.target.value })}
                            className="bg-gray-800/50 border-gray-700/50 text-white"
                          />
                          <Button 
                            onClick={addIp} 
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar IP
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Webhooks - Abaixo ocupando toda largura */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Webhook className="w-5 h-5 text-orange-400" />
                      Webhooks Cadastrados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {webhooks.map((webhook) => (
                        <div key={webhook.id} className="p-4 bg-gray-800/30 rounded-xl space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-medium break-all">{webhook.url}</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {webhook.events.map((event) => (
                                  <Badge key={event} className="bg-purple-500/20 text-purple-400 text-xs">
                                    {event}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteWebhook(webhook.id)}
                              disabled={isDeleting[`webhook-${webhook.id}`]}
                              className="ml-3"
                            >
                              {isDeleting[`webhook-${webhook.id}`] ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-6 border-t border-gray-800/50">
                      <div className="lg:col-span-2 space-y-3">
                        <Label className="text-gray-300">Adicionar Novo Webhook</Label>
                        <Input
                          placeholder="URL do Webhook"
                          value={newWebhook.url}
                          onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                          className="bg-gray-800/50 border-gray-700/50 text-white"
                        />
                        
                        <div className="space-y-2">
                          <Label className="text-gray-300">Selecione eventos</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {availableEvents.map((event) => (
                              <label key={event} className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-700/50">
                                <input
                                  type="checkbox"
                                  checked={newWebhook.events.includes(event)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewWebhook(prev => ({ ...prev, events: [...prev.events, event] }));
                                    } else {
                                      setNewWebhook(prev => ({ ...prev, events: prev.events.filter(e => e !== event) }));
                                    }
                                  }}
                                  className="text-purple-600"
                                />
                                <span className="text-gray-300 text-sm">{event}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {newWebhook.events.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-gray-300">Eventos selecionados:</Label>
                            <div className="flex flex-wrap gap-2">
                              {newWebhook.events.map((event) => (
                                <Badge key={event} className="bg-purple-500/20 text-purple-400 text-xs flex items-center gap-1">
                                  {event}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setNewWebhook(prev => ({
                                        ...prev,
                                        events: prev.events.filter(e => e !== event),
                                      }))
                                    }
                                    className="ml-1 hover:text-purple-200"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-end">
                        <Button 
                          onClick={addWebhook} 
                          className="bg-purple-600 hover:bg-purple-700 h-12"
                          disabled={!newWebhook.url.trim() || newWebhook.events.length === 0}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Webhook
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
