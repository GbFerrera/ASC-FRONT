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
import { ReactNode } from "react"

interface DeleteAlertDialogProps {
  onDelete: () => void;
  buttonText?: string;
  title?: string;
  description?: string;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
  icon?: ReactNode;
}

export function DeleteAlertDialog({ 
  onDelete, 
  buttonText = "Excluir",
  title = "Você tem certeza?",
  description = "Esta ação não pode ser desfeita. Isso excluirá permanentemente este item do sistema.",
  variant = "destructive",
  icon
}: DeleteAlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2">
          {icon}
          {buttonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
