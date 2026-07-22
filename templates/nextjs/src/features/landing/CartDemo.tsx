"use client";

import { MinusIcon, PlusIcon, ShirtIcon, Trash2Icon } from "lucide-react";

import { useCounterStore } from "@/stores";

import { Button } from "@/components/ui/button";

/**
 * Demonstrates global client state with Zustand via a mini cart UI.
 */
export function CartDemo() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-background/50 p-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShirtIcon className="size-6" />
        </div>
        <div className="flex flex-1 flex-col">
          <h5 className="font-medium text-foreground">Cotton T-Shirt</h5>
          <p className="text-sm text-muted-foreground">White / XL</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-semibold text-foreground">{count * 350}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Decrement" onClick={decrement} disabled={count === 0}>
            <MinusIcon className="size-4" />
          </Button>
          <span className="w-6 text-center font-medium tabular-nums">{count}</span>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Increment" onClick={increment}>
            <PlusIcon className="size-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive gap-1.5 h-8 px-2" onClick={reset} disabled={count === 0}>
          <Trash2Icon className="size-3.5" />
          <span className="text-xs">Clear</span>
        </Button>
      </div>
    </div>
  );
}
