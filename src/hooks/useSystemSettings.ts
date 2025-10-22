import { useCallback, useEffect, useState } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export type SystemSettingItem = {
  Key: string;
  Value: string;
  Description?: string;
  IsPrivate?: boolean;
};

export const useSystemSettings = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [settings, setSettings] = useState<SystemSettingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await authenticatedFetch('/api/system/settings');
      const data = await resp.json();
      let list = data?.Result || data?.result || [];
      if (!Array.isArray(list) && list && typeof list === 'object') {
        list = Object.entries(list).map(([Key, Value]) => ({ Key, Value: String(Value) }));
      }
      setSettings(Array.isArray(list) ? list as SystemSettingItem[] : []);
    } catch (e) {
      setError('Không tải được cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  const updateSettings = useCallback(async (items: SystemSettingItem[]) => {
    const resp = await authenticatedFetch('/api/system/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Settings: items }),
    });
    return resp;
  }, [authenticatedFetch]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return { settings, loading, error, fetchSettings, updateSettings };
};


