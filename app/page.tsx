"use client";

import * as React from "react";

import { Title } from "@/components/title";
import { SheetComponent } from "@/components/sheet";
import { InputWithLabel } from "@/components/inputWithLabel";
import { SelectComponent } from "@/components/selectComponent";
import { api } from "@/services/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner'
import { Trash } from "lucide-react"

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

interface State {
  id: number;
  name: string;
  abbreviation: string;
}

interface Certificate {
  id: number;
  certificate_name: string;
  price: number;
  state_id: number;
}

export default function Page() {
  const [states, setStates] = React.useState<State[]>([]);
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [selectedState, setSelectedState] = React.useState<string>("");
  const [certificateName, setCertificateName] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>("");

  const [editCertificateName, setEditCertificateName] = React.useState<string>("");
  const [editPrice, setEditPrice] = React.useState<string>("");

  // Buscar Estados e Certidões ao carregar a página
  React.useEffect(() => {
    fetchStates();
    fetchCertificates();
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
      setCertificates(response.data);
    } catch (error) {
      console.error("Erro ao buscar certidões:", error);
    }
  };

  const handleCreateCertificate = async () => {
    if (!certificateName || !selectedState || !price) {
      toast.info("Preencha todos os campos!");
      return;
    }


    try {
      await api.post("/certificates", {
        name: certificateName,
        state_id: Number(selectedState),
        price: parseFloat(price.replace(",", ".")), // Convertendo para número
      });

      toast.success("Certidão criada com sucesso!");

      // Atualizar lista de certidões após criação
      fetchCertificates();

      // Resetar os campos do formulário
      setCertificateName("");
      setSelectedState("");
      setPrice("");
    } catch (error) {
      console.error("Erro ao criar certidão:", error);
      toast.error("Erro ao criar certidão");
    }
  };

  const handleEditCertificate = async (certificate: Certificate) => {
    const updatedData: { name?: string; price?: number } = {};

    // Verifique se o nome foi alterado
    if (editCertificateName) {
      updatedData.name = editCertificateName;
    } else {
      updatedData.name = certificate.certificate_name; // Se o nome não foi alterado, usa o valor atual
    }

    // Verifique se o preço foi alterado
    if (editPrice) {
      updatedData.price = parseFloat(editPrice.replace(",", "."));
    } else {
      updatedData.price = certificate.price; // Se o preço não foi alterado, usa o valor atual
    }

    try {
      await api.put(`/certificates/${certificate.id}`, {
        ...updatedData,
        state_id: certificate.state_id, // Enviar sempre o state_id atual
      });

      toast.success("Certidão editada com sucesso!");

      fetchCertificates();

      setEditCertificateName("");
      setEditPrice("");
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

          <SelectComponent
            options={states.map((state) => ({
              value: state.id.toString(),
              label: `${state.name} (${state.abbreviation})`,
            }))}
            placeholder="Selecione um estado"
            label="Estados"
            triggerWidth="full"
            onValueChange={setSelectedState}
            value={selectedState}
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
        {states.map((state) => (
          <div key={state.id} className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{state.name} ({state.abbreviation})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certificates.filter(cert => cert.state_id === state.id).length > 0 ? (
                certificates
                  .filter(cert => cert.state_id === state.id)
                  .map(cert => (
                    <Card key={cert.id}>
                      <CardHeader >
                        <CardTitle className="flex justify-between items-center">
                          {cert.certificate_name}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline">Exluir <Trash /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza que deseja excluir a certidão ({cert.certificate_name})
                                  ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Pense bem antes de agir! Essa ação é permanente e não
                                  poderá ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={()=> handleDeleteCertificate(cert.id)}>Confirmar <Trash /></AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                        </CardTitle>



                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">Preço: R$ {cert.price.toFixed(2)}</p>
                      </CardContent>
                      <CardFooter>

                        <SheetComponent
                          title={`${cert.certificate_name}`}
                          description={`edite a certidão ${cert.certificate_name}`}
                          triggerContent="Editar"
                          onSubmit={() => handleEditCertificate(cert)}
                        >
                          <InputWithLabel
                            label="Qual o novo nome que deseja?"
                            placeholder="Ex: Casamento"
                            value={editCertificateName}
                            onChange={(e) => setEditCertificateName(e.target.value)}
                          />

                          <InputWithLabel
                            label="Digite o novo valor dessa certidão"
                            placeholder="Ex: 129,90"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                          />
                        </SheetComponent>
                      </CardFooter>
                    </Card>
                  ))
              ) : (
                <p className="text-gray-500">Nenhuma certidão cadastrada para este estado.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
