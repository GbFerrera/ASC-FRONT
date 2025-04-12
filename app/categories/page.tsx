"use client";

import * as React from "react";

import { Title } from "@/components/title";
import { SheetComponent } from "@/components/sheet";
import { InputWithLabel } from "@/components/inputWithLabel";
import { api } from "@/services/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Trash, FileDigit, FileText, Files, Plus } from "lucide-react";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Category {
  id: number;
  name: string;
  description: string;
  format_type: "digital" | "physical" | "both";
  created_at: string;
  updated_at: string;
}

export default function Page() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoryName, setCategoryName] = React.useState<string>("");
  const [categoryDescription, setCategoryDescription] = React.useState<string>("");
  const [categoryFormatType, setCategoryFormatType] = React.useState<"digital" | "physical" | "both">("both");
  
  const [editCategoryName, setEditCategoryName] = React.useState<string>("");
  const [editCategoryDescription, setEditCategoryDescription] = React.useState<string>("");
  const [editCategoryFormatType, setEditCategoryFormatType] = React.useState<"digital" | "physical" | "both">("both");

  // Buscar Categorias ao carregar a página
  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get<Category[]>("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast.error("Erro ao buscar categorias");
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName) {
      toast.info("O nome da categoria é obrigatório!");
      return;
    }

    try {
      await api.post("/categories", {
        name: categoryName,
        description: categoryDescription,
        format_type: categoryFormatType
      });

      toast.success("Categoria criada com sucesso!");

      // Atualizar lista de categorias após criação
      fetchCategories();

      // Resetar os campos do formulário
      setCategoryName("");
      setCategoryDescription("");
      setCategoryFormatType("both");
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      toast.error("Erro ao criar categoria");
    }
  };

  const handleEditCategory = async (category: Category) => {
    const updatedData: { name?: string; description?: string; format_type?: string } = {};

    // Verifique se o nome foi alterado
    if (editCategoryName) {
      updatedData.name = editCategoryName;
    } else {
      updatedData.name = category.name; // Se o nome não foi alterado, usa o valor atual
    }

    // Verifique se a descrição foi alterada
    if (editCategoryDescription) {
      updatedData.description = editCategoryDescription;
    } else {
      updatedData.description = category.description; // Se a descrição não foi alterada, usa o valor atual
    }
    
    // Sempre inclua o formato
    updatedData.format_type = editCategoryFormatType;

    try {
      await api.put(`/categories/${category.id}`, updatedData);

      toast.success("Categoria editada com sucesso!");

      fetchCategories();

      setEditCategoryName("");
      setEditCategoryDescription("");
      setEditCategoryFormatType("both");
    } catch (error) {
      console.error("Erro ao editar categoria:", error);
      toast.error("Erro ao editar categoria");
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await api.delete(`/categories/${categoryId}`);
  
      toast.success("Categoria deletada com sucesso!");
  
      // Atualizar lista de categorias após exclusão
      fetchCategories();
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      toast.error("Erro ao deletar categoria");
    }
  };

  return (
    <div className="w-full">
      <section className="flex justify-between w-full items-center mb-6">
        <Title description="Gerencie as categorias do sistema">Categorias</Title>

        <SheetComponent
          title="Detalhes da nova categoria"
          triggerContent={
            <>
              Nova categoria
            </>
          }
          onSubmit={handleCreateCategory}
        >
          <InputWithLabel
            label="Nome da categoria"
            placeholder="Ex: Tabelionatario"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />

          <InputWithLabel
            label="Descrição da categoria (opcional)"
            placeholder="Ex: Documentos de identificação pessoal"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
          />
          
          <div className="space-y-2">
            <Label>Formato disponível</Label>
            <RadioGroup 
              value={categoryFormatType} 
              onValueChange={(value: string) => setCategoryFormatType(value as "digital" | "physical" | "both")}
              className="flex flex-col space-y-2 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="digital" id="digital" />
                <Label htmlFor="digital" className="flex items-center cursor-pointer">
                  <FileDigit className="h-4 w-4 mr-2" /> Apenas Digital
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="physical" id="physical" />
                <Label htmlFor="physical" className="flex items-center cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" /> Apenas Física/PDF
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex items-center cursor-pointer">
                  <Files className="h-4 w-4 mr-2" /> Ambos formatos
                </Label>
              </div>
            </RadioGroup>
          </div>
        </SheetComponent>
      </section>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.length > 0 ? (
            categories.map(category => (
              <Card key={category.id} className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span>{category.name}</span>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-500 border-gray-200 hover:border-red-200">
                          <Trash size={16} /> Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza que deseja excluir a categoria ({category.name})?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Pense bem antes de agir! Essa ação é permanente e não
                            poderá ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-red-500 hover:bg-red-600 text-white">
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {category.description && (
                    <p className="text-gray-600 mb-3 text-sm">{category.description}</p>
                  )}
                  <div className="flex items-center text-sm bg-gray-50 p-2 rounded">
                    <span className="text-gray-700 mr-2">Formato:</span>
                    {category.format_type === "digital" && (
                      <span className="flex items-center text-blue-600">
                        <FileDigit className="h-4 w-4 mr-1" /> Apenas Digital
                      </span>
                    )}
                    {category.format_type === "physical" && (
                      <span className="flex items-center text-orange-600">
                        <FileText className="h-4 w-4 mr-1" /> Apenas Física/PDF
                      </span>
                    )}
                    {category.format_type === "both" && (
                      <span className="flex items-center text-green-600">
                        <Files className="h-4 w-4 mr-1" /> Ambos formatos
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <SheetComponent
                    title={`${category.name}`}
                    description={`Edite a categoria ${category.name}`}
                    triggerContent={
                      <>
                        Editar
                      </>
                    }
                    onSubmit={() => handleEditCategory(category)}
                  >
                    <InputWithLabel
                      label="Nome da categoria"
                      placeholder="Ex: Documentos Pessoais"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      defaultValue={category.name}
                    />

                    <InputWithLabel
                      label="Descrição da categoria (opcional)"
                      placeholder="Ex: Documentos de identificação pessoal"
                      value={editCategoryDescription}
                      onChange={(e) => setEditCategoryDescription(e.target.value)}
                      defaultValue={category.description}
                    />
                    
                    <div className="space-y-2">
                      <Label>Formato disponível</Label>
                      <RadioGroup 
                        defaultValue={category.format_type}
                        value={editCategoryFormatType} 
                        onValueChange={(value: string) => setEditCategoryFormatType(value as "digital" | "physical" | "both")}
                        className="flex flex-col space-y-2 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="digital" id={`digital-${category.id}`} />
                          <Label htmlFor={`digital-${category.id}`} className="flex items-center cursor-pointer">
                            <FileDigit className="h-4 w-4 mr-2" /> Apenas Digital
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="physical" id={`physical-${category.id}`} />
                          <Label htmlFor={`physical-${category.id}`} className="flex items-center cursor-pointer">
                            <FileText className="h-4 w-4 mr-2" /> Apenas Física/PDF
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id={`both-${category.id}`} />
                          <Label htmlFor={`both-${category.id}`} className="flex items-center cursor-pointer">
                            <Files className="h-4 w-4 mr-2" /> Ambos formatos
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </SheetComponent>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 col-span-3 text-center">Nenhuma categoria cadastrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}