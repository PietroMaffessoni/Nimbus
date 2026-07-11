"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Laptop, Moon, Sun } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Laptop },
];

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Guard de hidratação: o tema real só existe no cliente, então evitamos marcar
  // uma opção como selecionada no SSR antes do primeiro paint no client.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>Escolha como o Nimbus deve aparecer para você.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = mounted && theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-xl border border-border px-4 py-5 text-sm font-medium transition-colors hover:bg-accent",
                isActive && "border-primary bg-accent text-primary"
              )}
            >
              {isActive && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}
              <Icon className="h-5 w-5" />
              {option.label}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
