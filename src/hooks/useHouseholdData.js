import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useHouseholdData = () => {
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [activeDog, setActiveDog] = useState(null);
  const [entries, setEntries] = useState([]);
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [user, setUser] = useState(null);

  // Load household data when user is authenticated
  useEffect(() => {
    loadUserAndHousehold();
    
    // Set up real-time subscription for entries
    const entriesSubscription = supabase
      .channel('puppy_entries_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'puppy_entries' }, 
        () => {
          loadEntries();
        }
      )
      .subscribe();

    // Set up real-time subscription for dogs
    const dogsSubscription = supabase
      .channel('puppies_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'puppies' }, 
        () => {
          loadDogs();
        }
      )
      .subscribe();

    return () => {
      entriesSubscription.unsubscribe();
      dogsSubscription.unsubscribe();
    };
  }, []);

  // Load entries when active dog changes
  useEffect(() => {
    if (activeDog) {
      loadEntries();
    }
  }, [activeDog?.id]);

  const loadUserAndHousehold = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Get user's household
      const { data: householdData, error: householdError } = await supabase
        .from('household_members')
        .select(`
          household_id,
          role,
          households (
            id,
            name,
            invite_code,
            created_by,
            created_at
          )
        `)
        .eq('user_id', currentUser.id)
        .single();

      if (householdError) {
        console.error('Error loading household:', householdError);
        setLoading(false);
        return;
      }

      setHousehold(householdData.households);
      
      // Load dogs and members for this household
      await loadDogs(householdData.households.id);
      await loadHouseholdMembers(householdData.households.id);
      
    } catch (error) {
      console.error('Error loading user and household:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDogs = async (householdId = household?.id) => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('puppies')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setDogs(data || []);
      
      // Set active dog if none selected or if the selected dog is not in the list
      if (data && data.length > 0) {
        if (!activeDog || !data.find(dog => dog.id === activeDog.id)) {
          setActiveDog(data[0]);
        }
      } else {
        setActiveDog(null);
      }
    } catch (error) {
      console.error('Error loading dogs:', error);
    }
  };

  const loadHouseholdMembers = async (householdId = household?.id) => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          user_id,
          role,
          joined_at,
          user_profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('household_id', householdId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setHouseholdMembers(data || []);
    } catch (error) {
      console.error('Error loading household members:', error);
    }
  };

  const loadEntries = async (dogId = activeDog?.id) => {
    if (!dogId) return;

    try {
      const { data, error } = await supabase
        .from('puppy_entries')
        .select(`
          *,
          user_profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('puppy_id', dogId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const addDog = async (dogData) => {
    if (!household?.id) return { error: 'No household found' };

    try {
      const { data, error } = await supabase
        .from('puppies')
        .insert([{
          ...dogData,
          household_id: household.id,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setDogs(prev => [...prev, data]);
      
      // Set as active dog if it's the first one
      if (dogs.length === 0) {
        setActiveDog(data);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error adding dog:', error);
      return { data: null, error };
    }
  };

  const updateDog = async (dogId, updates) => {
    try {
      const { data, error } = await supabase
        .from('puppies')
        .update(updates)
        .eq('id', dogId)
        .select()
        .single();

      if (error) throw error;

      setDogs(prev => prev.map(dog => 
        dog.id === dogId ? { ...dog, ...data } : dog
      ));

      if (activeDog?.id === dogId) {
        setActiveDog(prev => ({ ...prev, ...data }));
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error updating dog:', error);
      return { data: null, error };
    }
  };

  const deleteDog = async (dogId) => {
    try {
      const { error } = await supabase
        .from('puppies')
        .delete()
        .eq('id', dogId);

      if (error) throw error;

      setDogs(prev => prev.filter(dog => dog.id !== dogId));
      
      // Switch active dog if we deleted the active one
      if (activeDog?.id === dogId) {
        const remainingDogs = dogs.filter(dog => dog.id !== dogId);
        setActiveDog(remainingDogs.length > 0 ? remainingDogs[0] : null);
      }

      return { error: null };
    } catch (error) {
      console.error('Error deleting dog:', error);
      return { error };
    }
  };

  const addEntry = async (entryData) => {
    if (!activeDog?.id) return { error: 'No active dog selected' };

    try {
      const { data, error } = await supabase
        .from('puppy_entries')
        .insert([{
          ...entryData,
          puppy_id: activeDog.id,
          user_id: user?.id
        }])
        .select(`
          *,
          user_profiles (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setEntries(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding entry:', error);
      return { data: null, error };
    }
  };

  const updateEntry = async (entryId, updates) => {
    try {
      const { data, error } = await supabase
        .from('puppy_entries')
        .update(updates)
        .eq('id', entryId)
        .select(`
          *,
          user_profiles (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? data : entry
      ));

      return { data, error: null };
    } catch (error) {
      console.error('Error updating entry:', error);
      return { data: null, error };
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      const { error } = await supabase
        .from('puppy_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      return { error: null };
    } catch (error) {
      console.error('Error deleting entry:', error);
      return { error };
    }
  };

  const updateHousehold = async (updates) => {
    if (!household?.id) return { error: 'No household found' };

    try {
      const { data, error } = await supabase
        .from('households')
        .update(updates)
        .eq('id', household.id)
        .select()
        .single();

      if (error) throw error;

      setHousehold(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating household:', error);
      return { data: null, error };
    }
  };

  const joinHouseholdByInvite = async (inviteCode, displayName) => {
    try {
      const { data, error } = await supabase.rpc('join_household_by_invite', {
        invite_code_param: inviteCode,
        user_display_name: displayName
      });

      if (error) throw error;

      // Reload household data after joining
      await loadUserAndHousehold();
      
      return { data, error: null };
    } catch (error) {
      console.error('Error joining household:', error);
      return { data: null, error };
    }
  };

  const removeMember = async (userId) => {
    if (!household?.id) return { error: 'No household found' };

    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', household.id)
        .eq('user_id', userId);

      if (error) throw error;

      setHouseholdMembers(prev => prev.filter(member => member.user_id !== userId));
      return { error: null };
    } catch (error) {
      console.error('Error removing member:', error);
      return { error };
    }
  };

  const generateNewInviteCode = async () => {
    if (!household?.id) return { error: 'No household found' };

    try {
      // Generate new random invite code
      const newInviteCode = Math.random().toString(36).substring(2, 10);
      
      const { data, error } = await supabase
        .from('households')
        .update({ invite_code: newInviteCode })
        .eq('id', household.id)
        .select()
        .single();

      if (error) throw error;

      setHousehold(data);
      return { data: data.invite_code, error: null };
    } catch (error) {
      console.error('Error generating new invite code:', error);
      return { data: null, error };
    }
  };

  // Helper functions for UI
  const getInviteLink = () => {
    if (!household?.invite_code) return '';
    return `${window.location.origin}/join/${household.invite_code}`;
  };

  const switchDog = (dog) => {
    setActiveDog(dog);
  };

  const exportHouseholdData = async () => {
    try {
      // Get all dogs and their entries
      const allDogsData = await Promise.all(
        dogs.map(async (dog) => {
          const { data: dogEntries } = await supabase
            .from('puppy_entries')
            .select(`
              *,
              user_profiles (
                display_name
              )
            `)
            .eq('puppy_id', dog.id)
            .order('created_at', { ascending: false });

          return {
            dog,
            entries: dogEntries || []
          };
        })
      );

      const exportData = {
        household,
        members: householdMembers,
        dogs: allDogsData,
        exportedAt: new Date().toISOString()
      };

      return { data: exportData, error: null };
    } catch (error) {
      console.error('Error exporting household data:', error);
      return { data: null, error };
    }
  };

  return {
    // State
    loading,
    household,
    dogs,
    activeDog,
    entries,
    householdMembers,
    user,

    // Actions
    switchDog,
    addDog,
    updateDog,
    deleteDog,
    addEntry,
    updateEntry,
    deleteEntry,
    updateHousehold,
    joinHouseholdByInvite,
    removeMember,
    generateNewInviteCode,
    exportHouseholdData,

    // Helpers
    getInviteLink,
    refreshData: loadUserAndHousehold
  };
}; 