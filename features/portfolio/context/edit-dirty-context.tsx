"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { EditStepValue } from "@/features/portfolio/constants/edit-steps";

type DirtySources = Partial<Record<EditStepValue, Set<string>>>;

type EditDirtyContextValue = {
  isStepDirty: (step: EditStepValue) => boolean;
  setSourceDirty: (
    step: EditStepValue,
    sourceId: string,
    isDirty: boolean
  ) => void;
};

const EditDirtyContext = createContext<EditDirtyContextValue | null>(null);

export function EditDirtyProvider({ children }: { children: ReactNode }) {
  const [dirtySources, setDirtySources] = useState<DirtySources>({});

  const setSourceDirty = useCallback(
    (step: EditStepValue, sourceId: string, isDirty: boolean) => {
      setDirtySources((prev) => {
        const nextSources = new Set(prev[step] ?? []);
        if (isDirty) {
          nextSources.add(sourceId);
        } else {
          nextSources.delete(sourceId);
        }

        const next: DirtySources = { ...prev };
        if (nextSources.size > 0) {
          next[step] = nextSources;
        } else {
          delete next[step];
        }
        return next;
      });
    },
    []
  );

  const isStepDirty = useCallback(
    (step: EditStepValue) => (dirtySources[step]?.size ?? 0) > 0,
    [dirtySources]
  );

  const value = useMemo(
    () => ({ isStepDirty, setSourceDirty }),
    [isStepDirty, setSourceDirty]
  );

  return (
    <EditDirtyContext.Provider value={value}>{children}</EditDirtyContext.Provider>
  );
}

const noopEditDirtyContext: EditDirtyContextValue = {
  isStepDirty: () => false,
  setSourceDirty: () => {},
};

export function useEditDirty() {
  const context = useContext(EditDirtyContext);
  return context ?? noopEditDirtyContext;
}

export function useEditStepDirty(
  step: EditStepValue,
  isDirty: boolean,
  sourceId = "default"
) {
  const { setSourceDirty } = useEditDirty();

  useEffect(() => {
    setSourceDirty(step, sourceId, isDirty);
  }, [step, sourceId, isDirty, setSourceDirty]);
}
