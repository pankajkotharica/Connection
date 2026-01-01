import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Contact } from '../types';

const TABLE_NAME = 'members';

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
      .eq('id', parseInt(id))
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

  // Create a new contact (member)
  async create(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
    }

    // Split name into first_name and last_name
    const nameParts = contact.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Generate a simple member_id if not provided (using timestamp)
    const memberId = `M${Date.now()}`;

    const memberData = {
      member_id: memberId,
      first_name: firstName,
      last_name: lastName,
      occupation: contact.profession, // profession -> occupation
      phone: contact.contactNumber || null, // contactNumber -> phone
      city: contact.area || null, // area -> city
      remark: contact.referredBy ? `Referred by: ${contact.referredBy}${contact.notes ? ` | ${contact.notes}` : ''}` : (contact.notes || null), // referredBy and notes -> remark
      activation: 'Pending',
      nagar_code: null,
      basti_code: null,
      activation_dt: null,
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([memberData])
      .select()
      .single();

    if (error) {
      console.error('Error creating member:', error);
      throw error;
    }

    return transformFromDB(data);
  },

  // Update an existing contact (member)
  async update(id: string, updates: Partial<Contact>): Promise<Contact> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
    }

    const updateData: any = {};
    
    if (updates.name !== undefined) {
      // Split name into first_name and last_name
      const nameParts = updates.name.trim().split(/\s+/);
      updateData.first_name = nameParts[0] || '';
      updateData.last_name = nameParts.slice(1).join(' ') || '';
    }
    if (updates.profession !== undefined) updateData.occupation = updates.profession;
    if (updates.contactNumber !== undefined) updateData.phone = updates.contactNumber;
    if (updates.area !== undefined) updateData.city = updates.area;
    if (updates.referredBy !== undefined || updates.notes !== undefined) {
      // Combine referredBy and notes into remark
      const remarkParts = [];
      if (updates.referredBy) remarkParts.push(`Referred by: ${updates.referredBy}`);
      if (updates.notes) remarkParts.push(updates.notes);
      updateData.remark = remarkParts.join(' | ') || null;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('Error updating member:', error);
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
      .eq('id', parseInt(id));

    if (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },
};

// Transform database row (member) to Contact interface
function transformFromDB(row: any): Contact {
  // Combine first_name and last_name into name
  const fullName = [row.first_name, row.last_name].filter(Boolean).join(' ') || 'Unknown';
  
  // Extract referredBy and notes from remark field
  let referredBy = '';
  let notes = '';
  if (row.remark) {
    const referredMatch = row.remark.match(/Referred by: ([^|]+)/);
    if (referredMatch) {
      referredBy = referredMatch[1].trim();
      notes = row.remark.replace(/Referred by: [^|]+\s*\|\s*/, '').trim();
    } else {
      notes = row.remark;
    }
  }

  return {
    id: String(row.id), // Convert number id to string
    name: fullName,
    profession: row.occupation || '',
    contactNumber: row.phone || '',
    area: row.city || '',
    referredBy: referredBy,
    notes: notes || undefined,
    createdAt: new Date(row.created_at).getTime(),
  };
}

