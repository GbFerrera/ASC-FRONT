import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface MultiSelectComponentProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  placeholder?: string;
  label?: string;
  labelGroup?: string;
  triggerWidth?: string;
  onValueChange: (values: string[]) => void;
  values: string[];
}

export function MultiSelectComponent({
  options,
  placeholder = "Selecione opções",
  label,
  labelGroup,
  triggerWidth = "w-full",
  onValueChange,
  values,
}: MultiSelectComponentProps) {
  const [open, setOpen] = React.useState(false);
  const [localValues, setLocalValues] = React.useState<string[]>(values || []);

  // Sincroniza os valores locais com os valores externos quando eles mudam
  React.useEffect(() => {
    setLocalValues(values || []);
  }, [values]);

  const handleSelect = (currentValue: string) => {
    const newValues = localValues.includes(currentValue)
      ? localValues.filter((value) => value !== currentValue)
      : [...localValues, currentValue];
    
    setLocalValues(newValues);
    onValueChange(newValues);
  };

  const handleRemove = (valueToRemove: string) => {
    const newValues = localValues.filter((value) => value !== valueToRemove);
    setLocalValues(newValues);
    onValueChange(newValues);
  };

  const selectedLabels = localValues.map(
    (value) => options.find((option) => option.value === value)?.label || value
  );

  return (
    <div className="w-full">
      <Label className="font-bold">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`${triggerWidth} justify-between h-auto min-h-10 py-2`}
            onClick={() => setOpen(!open)}
          >
            <div className="flex flex-wrap gap-1 text-left">
              {selectedLabels.length > 0 ? (
                selectedLabels.map((selectedLabel, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="mr-1 mb-1"
                  >
                    {selectedLabel}
                    <button
                      type="button"
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRemove(localValues[index]);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(localValues[index]);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
          <Command className="w-full">
            <CommandInput placeholder="Pesquisar estado..." />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(value) => {
                      handleSelect(option.value);
                    }}
                    className="cursor-pointer flex items-center"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-shrink-0 mr-2">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            localValues.includes(option.value)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </div>
                      {option.icon && <span>{option.icon}</span>}
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
