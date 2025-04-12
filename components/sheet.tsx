import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CirclePlus } from "lucide-react";

interface SheetComponentProps {
  triggerContent: ReactNode; // Conteúdo personalizado do botão de abertura
  title: ReactNode; // Título do cabeçalho do Sheet
  description?: ReactNode; // Descrição do cabeçalho (opcional)
  children: ReactNode; // Conteúdo dinâmico dentro do Sheet
  onSubmit?: () => void; // Função executada ao salvar (opcional)
  footerActions?: ReactNode; // Ações do rodapé (opcional)
}

export function SheetComponent({
  triggerContent,
  title,
  description,
  children,
  onSubmit,
  footerActions,
}: SheetComponentProps) {
  return (
    <Sheet>
      {/* Botão de abertura do Sheet */}
      <SheetTrigger asChild>
        <Button className="bg-[#236F5D] hover:bg-[#1a5346] text-white">{triggerContent} <CirclePlus /></Button>
      </SheetTrigger>

      {/* Conteúdo do Sheet */}
      <SheetContent className="h-full overflow-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="grid gap-4 py-4">{children}</div>

        {/* Rodapé com botões de ação */}
        <SheetFooter className="flex justify-end gap-2">
          {footerActions}
          {onSubmit && (
            <SheetClose asChild>
              <Button className="bg-[#236F5D] hover:bg-[#1a5346] text-white" onClick={onSubmit} variant="default">
                Salvar
              </Button>
            </SheetClose>
          )}
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
