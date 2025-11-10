import { useEffect, useState } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage, debugApiResponse, retryRequest } from '../utils/apiHelpers';

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
      
      const response = await retryRequest(async () => {
        return await authenticatedFetch(`/api/categories?includeInactive=${includeInactive}&includeCount=false`);
      });
      
      const result = await safeJsonParse(response);
      
      // Debug logging
      debugApiResponse(result, 'Categories API');
      
      if (isSuccessfulResponse(result)) {
        const extracted = extractResult(result);
        if (!extracted) {
          throw new Error('No categories data received');
        }
        
        // Chuẩn hóa theo nhiều cấu trúc trả về
        let arr: any = [];
        if (Array.isArray(extracted?.Result)) arr = extracted.Result;
        else if (Array.isArray(extracted?.Data)) arr = extracted.Data;
        else if (Array.isArray(extracted?.data)) arr = extracted.data;
        else if (Array.isArray(extracted?.Items)) arr = extracted.Items;
        else if (Array.isArray(extracted)) arr = extracted;

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
      } else {
        throw new Error(extractMessage(result));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching categories:', {
        error: err,
        url: `/api/categories?includeInactive=${includeInactive}&includeCount=false`,
        timestamp: new Date().toISOString()
      });
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







