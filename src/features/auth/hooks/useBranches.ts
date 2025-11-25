import { useQuery } from '@tanstack/react-query';
import branchesConfig from '@/config/config.json';

export interface Branch {
  id: string;
  name: string;
  code?: string;
}

export const useBranches = () => {
  return useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async (): Promise<Branch[]> => {
      // Config dosyasından şubeleri oku
      return branchesConfig.branches as Branch[];
    },
    staleTime: Infinity, // Config dosyası değişmediği için cache süresiz
  });
};

