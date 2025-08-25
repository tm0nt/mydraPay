"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, Award, TrendingUp, Target, Shield, Bell, Moon } from 'lucide-react';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: "Montenegro Silva",
    email: "montenegro@email.com",
    phone: "+55 11 99999-9999",
    location: "São Paulo, SP",
    bio: "Empreendedor digital focado em soluções financeiras inovadoras.",
    joinDate: "Janeiro 2024",
  });

  const [isEditing, setIsEditing] = useState(false);

  const stats = [
    {
      title: "Transações",
      value: "1.247",
      change: "+12%",
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      title: "Volume Total",
      value: "R$ 98.7K",
      change: "+23%",
      icon: Target,
      color: "text-purple-400",
    },
    {
      title: "Ranking",
      value: "#12",
      change: "+3",
      icon: Award,
      color: "text-yellow-400",
    },
  ];

  const achievements = [
    { title: "Primeiro PIX", description: "Recebeu seu primeiro pagamento", completed: true },
    { title: "Meta Mensal", description: "Atingiu R$ 50K em um mês", completed: true },
    { title: "Top 20", description: "Entrou no ranking dos top 20", completed: true },
    { title: "Automação Pro", description: "Configurou 5+ automatizações", completed: false },
  ];

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
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-800/50 rounded-xl">
                  <Moon className="h-5 w-5 text-gray-400" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-800/50 rounded-xl">
                  <Bell className="h-5 w-5 text-gray-400" />
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardContent className="p-6 text-center space-y-6">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-xl"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-white">{profileData.name}</h2>
                      <p className="text-gray-400">{profileData.email}</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Conta Verificada
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Perfil Completo</span>
                        <span className="text-white font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2 bg-gray-800" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800/50">
                      {stats.map((stat) => (
                        <div key={stat.title} className="text-center">
                          <div className={`text-lg font-bold ${stat.color}`}>
                            {stat.value}
                          </div>
                          <div className="text-xs text-gray-400">{stat.title}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="bg-gray-900/50 border-gray-800/50 mt-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Conquistas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          achievement.completed 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-800/50 text-gray-500'
                        }`}>
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{achievement.title}</p>
                          <p className="text-gray-400 text-xs">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Informações Pessoais</CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(!isEditing)}
                      className="border-gray-700/50 hover:bg-gray-800/50"
                    >
                      {isEditing ? "Cancelar" : "Editar"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nome Completo
                        </Label>
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                          className="bg-gray-800/50 border-gray-700/50 text-white disabled:opacity-60"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          className="bg-gray-800/50 border-gray-700/50 text-white disabled:opacity-60"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone
                        </Label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                          className="bg-gray-800/50 border-gray-700/50 text-white disabled:opacity-60"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Localização
                        </Label>
                        <Input
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                          disabled={!isEditing}
                          className="bg-gray-800/50 border-gray-700/50 text-white disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Bio</Label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700/50 text-white disabled:opacity-60 min-h-[100px]"
                        placeholder="Conte um pouco sobre você..."
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Membro desde {profileData.joinDate}</span>
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 pt-4 border-t border-gray-800/50">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </Button>
                        <Button variant="outline" className="border-gray-700/50 hover:bg-gray-800/50">
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Security Section */}
                <Card className="bg-gray-900/50 border-gray-800/50 mt-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div>
                        <p className="text-white font-medium">Autenticação de Dois Fatores</p>
                        <p className="text-gray-400 text-sm">Adicione uma camada extra de segurança</p>
                      </div>
                      <Button variant="outline" className="border-gray-700/50 hover:bg-gray-800/50">
                        Configurar
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div>
                        <p className="text-white font-medium">Alterar Senha</p>
                        <p className="text-gray-400 text-sm">Última alteração há 3 meses</p>
                      </div>
                      <Button variant="outline" className="border-gray-700/50 hover:bg-gray-800/50">
                        Alterar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
