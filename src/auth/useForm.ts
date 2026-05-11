import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const useCustomForm = <T extends z.ZodTypeAny>(schema: T) => {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
  });
};

export default useCustomForm;
