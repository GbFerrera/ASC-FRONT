import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface InputWithLabelProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; // Texto da label
  labelClassName?: string; // Classes adicionais para estilizar a label
  inputClassName?: string; // Classes adicionais para estilizar o input
  id?: string; // ID do input para conectar com a label
  icon?: React.ReactNode; // Ícone para exibir no input
}

export const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ label, labelClassName, inputClassName, id, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full mb-2">
        <Label
          htmlFor={id}
          className={cn("text-sm font-bold", labelClassName)}
        >
          {label}
        </Label>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pr-10",
              inputClassName
            )}
            {...props}
          />
          {icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

InputWithLabel.displayName = "InputWithLabel";
