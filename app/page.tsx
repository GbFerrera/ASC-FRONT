"use client";

import * as React from "react";

import { Title } from "@/components/title";
import { SheetComponent } from "@/components/sheet";
import { InputWithLabel } from "@/components/inputWithLabel";
import { SelectComponent } from "@/components/selectComponent";
import { api } from "@/services/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner'
import { Trash, Check } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface State {
  id: number;
  name: string;
  abbreviation: string;
}

interface Certificate {
  id: number;
  name: string;
  price: number;
  state_id: number;
  category_id?: number;
  category?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function Page() {
  const [states, setStates] = React.useState<State[]>([]);
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [selectedStates, setSelectedStates] = React.useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");
  const [certificateName, setCertificateName] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>("");
  const [showStatesList, setShowStatesList] = React.useState(false);

  const [editCertificateName, setEditCertificateName] = React.useState<string>("");
  const [editPrice, setEditPrice] = React.useState<string>("");
  const [editSelectedState, setEditSelectedState] = React.useState<string>("");
  const [editSelectedCategory, setEditSelectedCategory] = React.useState<string>("");

  // Buscar Estados, Certidões e Categorias ao carregar a página
  React.useEffect(() => {
    fetchStates();
    fetchCertificates();
    fetchCategories();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await api.get<State[]>("/states");
      setStates(response.data);
    } catch (error) {
      console.error("Erro ao buscar estados:", error);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await api.get<Certificate[]>("/certificates");
      console.log('Certificates from API:', response.data);
      setCertificates(response.data);
    } catch (error) {
      console.error("Erro ao buscar certidões:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get<Category[]>("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const handleStateChange = (stateId: string) => {
    setSelectedStates(prev => {
      if (prev.includes(stateId)) {
        return prev.filter(id => id !== stateId);
      } else {
        return [...prev, stateId];
      }
    });
  };

  const handleCreateCertificate = async () => {
    if (!certificateName || selectedStates.length === 0 || !price || !selectedCategory) {
      toast.info("Preencha todos os campos!");
      return;
    }

    try {
      await api.post("/certificates", {
        name: certificateName,
        state_ids: selectedStates.map(id => Number(id)),
        category_id: Number(selectedCategory),
        price: parseFloat(price.replace(",", ".")), // Convertendo para número
      });

      toast.success("Certidão criada com sucesso!");

      // Atualizar lista de certidões após criação
      fetchCertificates();

      // Resetar os campos do formulário
      setCertificateName("");
      setSelectedStates([]);
      setSelectedCategory("");
      setPrice("");
    } catch (error) {
      console.error("Erro ao criar certidão:", error);
      toast.error("Erro ao criar certidão");
    }
  };

  const handleEditCertificate = async (cert: Certificate) => {
    if (!editCertificateName && !editPrice && !editSelectedState && !editSelectedCategory) {
      toast.info("Nenhuma alteração detectada!");
      return;
    }

    try {
      const updatedData: {
        name?: string;
        price?: number;
        state_id?: number;
        category_id?: number;
      } = {};

      // Verifique se o nome foi alterado
      if (editCertificateName) {
        updatedData.name = editCertificateName;
      } else {
        updatedData.name = cert.name; // Se o nome não foi alterado, usa o valor atual
      }

      // Verifique se o preço foi alterado
      if (editPrice) {
        // Converte o preço de string para number e substitui vírgula por ponto
        updatedData.price = parseFloat(editPrice.replace(',', '.'));
      } else {
        updatedData.price = cert.price; // Se o preço não foi alterado, usa o valor atual
      }
      
      // Verifique se o estado foi alterado
      if (editSelectedState) {
        updatedData.state_id = parseInt(editSelectedState);
      } else {
        updatedData.state_id = cert.state_id;
      }
      
      // Verifique se a categoria foi alterada
      if (editSelectedCategory) {
        updatedData.category_id = parseInt(editSelectedCategory);
      } else {
        updatedData.category_id = cert.category_id;
      }

      await api.put(`/certificates/${cert.id}`, updatedData);

      toast.success("Certidão editada com sucesso!");

      fetchCertificates();

      setEditCertificateName("");
      setEditPrice("");
      setEditSelectedState("");
      setEditSelectedCategory("");
    } catch (error) {
      console.error("Erro ao editar certidão:", error);
      toast.error("Erro ao editar certidão");
    }
  };

  const handleDeleteCertificate = async (certificateId: number) => {

    console.log(certificateId)
    try {
      await api.delete(`/certificates/${certificateId}`);

      toast.success("Certidão deletada com sucesso!");

      // Atualizar lista de certidões após exclusão
      fetchCertificates();
    } catch (error) {
      console.error("Erro ao deletar certidão:", error);
      toast.error("Erro ao deletar certidão");
    }
  };


  return (
    <div className="w-full">
      <section className="flex justify-between w-full">
        <Title description="Gerencie as certidões por estado">Certidões</Title>

        <SheetComponent
          title="Detalhes da nova certidão"
          triggerContent="Nova certidão"
          onSubmit={handleCreateCertificate}
        >
          <InputWithLabel
            label="Nome da certidão que deseja cadastrar"
            placeholder="Ex: Casamento"
            value={certificateName}
            onChange={(e) => setCertificateName(e.target.value)}
          />

          <div className="w-full space-y-2">
            <Label className="font-bold">Estados</Label>
            <div 
              className="relative w-full border rounded-md p-2 cursor-pointer"
              onClick={() => setShowStatesList(!showStatesList)}
            >
              {selectedStates.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedStates.map(stateId => {
                    const state = states.find(s => s.id.toString() === stateId);
                    return state ? (
                      <span key={stateId} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                        {state.name} ({state.abbreviation})
                      </span>
                    ) : null;
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground">Selecione um ou mais estados</span>
              )}
            </div>

            {showStatesList && (
              <div className="border rounded-md mt-1 p-2 max-h-[200px] overflow-y-auto">
                {states.map(state => (
                  <div key={state.id} className="flex items-center space-x-2 py-1">
                    <Checkbox 
                      id={`state-${state.id}`} 
                      checked={selectedStates.includes(state.id.toString())}
                      onCheckedChange={() => handleStateChange(state.id.toString())}
                    />
                    <Label 
                      htmlFor={`state-${state.id}`}
                      className="cursor-pointer"
                    >
                      {state.name} ({state.abbreviation})
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SelectComponent
            options={categories.map((category) => ({
              value: category.id.toString(),
              label: category.name,
            }))}
            placeholder="Selecione uma categoria"
            label="Categorias"
            triggerWidth="full"
            onValueChange={setSelectedCategory}
            value={selectedCategory}
          />

          <InputWithLabel
            label="Digite o valor dessa certidão"
            placeholder="Ex: 129,90"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </SheetComponent>
      </section>

      <div className="mt-6">
        {states.map((state) => {
          const stateCertificates = certificates.filter(cert => cert.state_id === state.id);
          
          // If no certificates for this state, don't render the section
          if (stateCertificates.length === 0) return null;
          
          // Group certificates by category
          const certificatesByCategory: Record<number, Certificate[]> = {};
          
          // Initialize categories with empty arrays
          categories.forEach((category: Category) => {
            certificatesByCategory[category.id] = [];
          });
          
          // Group certificates into their categories
          stateCertificates.forEach((cert: Certificate) => {
            if (cert.category_id) {
              if (!certificatesByCategory[cert.category_id]) {
                certificatesByCategory[cert.category_id] = [];
              }
              certificatesByCategory[cert.category_id].push(cert);
            }
          });
          
          return (
            <div key={state.id} className="mb-10">
              <h2 className="text-2xl font-semibold mb-6 pb-2 border-b">{state.name} ({state.abbreviation})</h2>
              
              {/* Render each category that has certificates */}
              {Object.entries(certificatesByCategory).map(([categoryId, certs]: [string, Certificate[]]) => {
                // Skip empty categories
                if (certs.length === 0) return null;
                
                const category = categories.find(cat => cat.id === parseInt(categoryId));
                if (!category) return null;
                
                return (
                  <div key={categoryId} className="mb-8">
                    <h3 className="text-xl font-medium mb-4 text-[#236F5D]">{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {certs.map(cert => (
                        <Card key={cert.id} className="border border-gray-200 hover:shadow-md transition-all duration-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between items-start">
                              <div className="flex flex-col space-y-1">
                                <h3 className="text-lg font-medium">{cert.name}</h3>
                              </div>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-500 border-gray-200 hover:border-red-200">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza que deseja excluir a certidão ({cert.name})?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Pense bem antes de agir! Essa ação é permanente e não
                                      poderá ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCertificate(cert.id)} className="bg-red-500 hover:bg-red-600 text-white">
                                      Confirmar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-gray-700 font-medium">Preço: R$ {cert.price.toFixed(2).replace('.', ',')}</p>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <SheetComponent
                              title={`${cert.name}`}
                              description={`Edite a certidão ${cert.name}`}
                              triggerContent={
                                <>
                                  Editar
                                </>
                              }
                              onSubmit={() => handleEditCertificate(cert)}
                            >
                              <InputWithLabel
                                label="Nome da certidão"
                                placeholder="Ex: Certidão de Nascimento"
                                value={editCertificateName}
                                onChange={(e) => setEditCertificateName(e.target.value)}
                                defaultValue={cert.name}
                              />

                              <SelectComponent
                                options={states.map((state) => ({
                                  value: state.id.toString(),
                                  label: state.name,
                                }))}
                                placeholder="Selecione um estado"
                                label="Estados"
                                triggerWidth="full"
                                onValueChange={setEditSelectedState}
                                value={editSelectedState || cert.state_id.toString()}
                              />

                              <SelectComponent
                                options={categories.map((category) => ({
                                  value: category.id.toString(),
                                  label: category.name,
                                }))}
                                placeholder="Selecione uma categoria"
                                label="Categorias"
                                triggerWidth="full"
                                onValueChange={setEditSelectedCategory}
                                value={editSelectedCategory || (cert.category_id ? cert.category_id.toString() : '')}
                              />

                              <InputWithLabel
                                label="Digite o valor dessa certidão"
                                placeholder="Ex: 129,90"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                defaultValue={cert.price.toString().replace('.', ',')}
                              />
                            </SheetComponent>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
