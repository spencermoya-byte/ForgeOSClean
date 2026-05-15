import { useForm as useReactHookForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny } from "zod";

export const useForm = (schema: ZodTypeAny) => {
  return useReactHookForm<any>({
    resolver: zodResolver(schema as any),
  });
};

export default useForm;
