// app/settings/page.tsx
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
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Credential, AllowedIp, WebhookUser, UserSettings, WebhookEvent } from "@prisma/client";

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

  useEffect(() => {
    fetchSettings();
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado para a área de transferência");
    } catch (err) {
      toast.error("Erro ao copiar");
    }
  };

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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações</h1>
                  <p className="text-gray-400">Personalize sua experiência na plataforma</p>
                </div>
              </div>
            </header>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>

              <TabsContent value="api" className="space-y-6">
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
                      <p className="text-gray-400">Nenhuma credencial encontrada.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Seções de IPs e Webhooks lado a lado no desktop, full width no mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* IPs Liberados */}
                  <Card className="bg-gray-900/50 border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe2 className="w-5 h-5 text-blue-400" />
                        IPs Liberados
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {allowedIps.map((ip) => (
                        <div key={ip.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                          <div>
                            <p className="text-white font-medium">{ip.cidr}</p>
                            <p className="text-gray-400 text-sm">{ip.note}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-700/50 hover:bg-purple-800/50 text-purple-400 hover:text-purple-300 bg-transparent"
                          >
                            Editar
                          </Button>
                        </div>
                      ))}

                      <div className="space-y-2">
                        <Label>Adicionar Novo IP</Label>
                        <Input
                          placeholder="CIDR (ex: 192.168.1.0/24)"
                          value={newIp.cidr}
                          onChange={(e) => setNewIp({ ...newIp, cidr: e.target.value })}
                        />
                        <Input
                          placeholder="Nota (opcional)"
                          value={newIp.note ?? ""}
                          onChange={(e) => setNewIp({ ...newIp, note: e.target.value })}
                        />
                        <Button onClick={addIp} className="w-full bg-purple-600 hover:bg-purple-700">
                          Adicionar IP
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Webhooks */}
                  <Card className="bg-gray-900/50 border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Webhook className="w-5 h-5 text-orange-400" />
                        Webhooks Cadastrados
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {webhooks.map((webhook) => (
                        <div key={webhook.id} className="p-4 bg-gray-800/30 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium">{webhook.url}</h4>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-700/50 hover:bg-purple-800/50 text-purple-400 hover:text-purple-300 bg-transparent"
                            >
                              Editar
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {webhook.events.map((event) => (
                              <Badge key={event} className="bg-purple-500/20 text-purple-400 text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="space-y-2">
                        <Label>Adicionar Novo Webhook</Label>
                        <Input
                          placeholder="URL do Webhook"
                          value={newWebhook.url}
                          onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                        />
                        {/* Exemplo de multi-select simples; use um componente multi-select real se disponível */}
                        <Select
                          onValueChange={(value: WebhookEvent) =>
                            setNewWebhook((prev) => ({ ...prev, events: [...prev.events, value] }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione eventos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PAYMENT_CREATED">Pagamento Criado</SelectItem>
                            <SelectItem value="PAYMENT_PAID">Pagamento Pago</SelectItem>
                            <SelectItem value="WITHDRAWAL_REQUESTED">Saque Solicitado</SelectItem>
                            <SelectItem value="WITHDRAWAL_PAID">Saque Pago</SelectItem>
                            {/* Adicione outros eventos do enum WebhookEvent */}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2">
                          {newWebhook.events.map((event, index) => (
                            <Badge key={index} className="bg-purple-500/20 text-purple-400 text-xs">
                              {event}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setNewWebhook((prev) => ({
                                    ...prev,
                                    events: prev.events.filter((e) => e !== event),
                                  }))
                                }
                                className="text-purple-400 hover:text-purple-300"
                              >
                                x
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <Button onClick={addWebhook} className="w-full bg-purple-600 hover:bg-purple-700">
                          Adicionar Webhook
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
