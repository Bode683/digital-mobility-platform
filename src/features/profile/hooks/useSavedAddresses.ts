import { useApi } from '@/context/ApiContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SavedAddress } from '../types';

/**
 * Hook for managing saved addresses
 */
export function useSavedAddresses() {
  const { supabase } = useApi();
  const queryClient = useQueryClient();

  // Fetch saved addresses
  const {
    data: addresses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['savedAddresses'],
    queryFn: async (): Promise<SavedAddress[]> => {
      const { data, error } = await supabase
        .from('saved_addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Add a new address
  const addAddress = useMutation({
    mutationFn: async (newAddress: Omit<SavedAddress, 'id'>) => {
      const { data, error } = await supabase
        .from('saved_addresses')
        .insert(newAddress)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAddresses'] });
    },
  });

  // Update an existing address
  const updateAddress = useMutation({
    mutationFn: async ({ id, ...updates }: SavedAddress) => {
      const { data, error } = await supabase
        .from('saved_addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAddresses'] });
    },
  });

  // Delete an address
  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAddresses'] });
    },
  });

  return {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
  };
}
