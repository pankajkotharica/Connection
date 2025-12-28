import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Contact } from '../types';

const TABLE_NAME = 'contacts';

export const contactService = {
  // Get all contacts
  async getAll(): Promise<Contact[]> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file. See SETUP.md for instructions.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }

    // Transform database format to Contact format
    return data ? data.map(transformFromDB) : [];
  },

  // Get a single contact by ID
  async getById(id: string): Promise<Contact | null> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching contact:', error);
      throw error;
    }

    return data ? transformFromDB(data) : null;
  },

  // Create a new contact
  async create(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
    }

    const contactData = {
      name: contact.name,
      profession: contact.profession,
      contact_number: contact.contactNumber,
      area: contact.area,
      referred_by: contact.referredBy,
      notes: contact.notes || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([contactData])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      throw error;
    }

    return transformFromDB(data);
  },

  // Update an existing contact
  async update(id: string, updates: Partial<Contact>): Promise<Contact> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
    }

    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.profession !== undefined) updateData.profession = updates.profession;
    if (updates.contactNumber !== undefined) updateData.contact_number = updates.contactNumber;
    if (updates.area !== undefined) updateData.area = updates.area;
    if (updates.referredBy !== undefined) updateData.referred_by = updates.referredBy;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      throw error;
    }

    return transformFromDB(data);
  },

  // Delete a contact
  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },
};

// Transform database row to Contact interface
function transformFromDB(row: any): Contact {
  return {
    id: row.id,
    name: row.name,
    profession: row.profession,
    contactNumber: row.contact_number || '',
    area: row.area || '',
    referredBy: row.referred_by || '',
    notes: row.notes || undefined,
    createdAt: new Date(row.created_at).getTime(),
  };
}

