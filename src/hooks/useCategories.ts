import { useEffect, useState } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';

export type Category = {
  id: number;
  name: string;
  description?: string;
  parentId?: number | null;
  orderIndex?: number;
  isActive?: boolean;
  children?: Category[];
};

export const useCategories = (includeInactive = false) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const resp = await authenticatedFetch(`/api/categories?includeInactive=${includeInactive}&includeCount=false`);
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data?.message || 'Failed to fetch categories');
      }

      // Chuẩn hóa theo nhiều cấu trúc trả về
      let arr: any = [];
      if (Array.isArray(data?.Result?.Result)) arr = data.Result.Result;
      else if (Array.isArray(data?.Result)) arr = data.Result;
      else if (Array.isArray(data?.Data)) arr = data.Data;
      else if (Array.isArray(data?.data)) arr = data.data;
      else if (Array.isArray(data?.Result?.Items)) arr = data.Result.Items;
      else if (Array.isArray(data?.Items)) arr = data.Items;

      // Map về dạng chuẩn Category[]
      const mapNode = (n: any): Category => ({
        id: n.id ?? n.Id,
        name: n.name ?? n.Name,
        description: n.description ?? n.Description,
        parentId: n.parentId ?? n.ParentId ?? null,
        isActive: n.isActive ?? n.IsActive,
        orderIndex: n.orderIndex ?? n.OrderIndex,
        children: Array.isArray(n.children ?? n.InverseParent)
          ? (n.children ?? n.InverseParent).map(mapNode)
          : [],
      });

      setCategories(Array.isArray(arr) ? arr.map(mapNode) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [includeInactive]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};





