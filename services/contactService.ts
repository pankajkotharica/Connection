import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Contact } from '../types';

const TABLE_NAME = 'members';

export const contactService = {
  // Get all contacts (filtered by BHAG code if user is not admin)
  async getAll(bhagCode?: string | null, isAdmin?: boolean): Promise<Contact[]> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file. See SETUP.md for instructions.');
    }

    let query = supabase
      .from(TABLE_NAME)
      .select('*');

    // Filter by BHAG code if user is not admin
    if (!isAdmin && bhagCode) {
      query = query.eq('bhag_code', bhagCode);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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

    // Generate a simple member_id if not provided (using timestamp)
    const memberId = contact.memberId || `M${Date.now()}`;
    
    // Format reg_date
    const regDate = contact.regDate || new Date().toISOString().split('T')[0];

    // Combine referredBy and notes into remark
    let remark = contact.remark || '';
    if (contact.referredBy && !remark.includes('Referred by:')) {
      remark = `Referred by: ${contact.referredBy}${remark ? ` | ${remark}` : ''}`;
    }
    if (contact.notes && !remark.includes(contact.notes)) {
      remark = remark ? `${remark} | ${contact.notes}` : contact.notes;
    }

    const memberData = {
      member_id: memberId,
      reg_date: regDate,
      first_name: contact.firstName || '',
      last_name: contact.lastName || '',
      gender: contact.gender || null,
      email: contact.email || null,
      phone: contact.phone || contact.contactNumber || null,
      age: contact.age || null,
      address: contact.address || null,
      city: contact.city || contact.area || '',
      bhag_code: contact.bhagCode || null,
      occupation: contact.occupation || contact.profession || '',
      nagar_code: contact.nagarCode || null,
      basti_code: contact.bastiCode || null,
      activation: contact.activation || 'Pending',
      activation_dt: contact.activationDt || null,
      remark: remark || null,
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
    
    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
    if (updates.gender !== undefined) updateData.gender = updates.gender;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.contactNumber !== undefined) updateData.phone = updates.contactNumber;
    if (updates.age !== undefined) updateData.age = updates.age;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.area !== undefined) updateData.city = updates.area;
    if (updates.bhagCode !== undefined) updateData.bhag_code = updates.bhagCode;
    if (updates.occupation !== undefined) updateData.occupation = updates.occupation;
    if (updates.profession !== undefined) updateData.occupation = updates.profession;
    if (updates.nagarCode !== undefined) updateData.nagar_code = updates.nagarCode;
    if (updates.bastiCode !== undefined) updateData.basti_code = updates.bastiCode;
    if (updates.activation !== undefined) {
      updateData.activation = updates.activation;
      if (updates.activation === 'Contacted') {
        updateData.activation_dt = new Date().toISOString().slice(0, 16).replace('T', ' ');
      }
    }
    if (updates.remark !== undefined) updateData.remark = updates.remark;
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
  let remark = row.remark || '';
  if (remark) {
    const referredMatch = remark.match(/Referred by: ([^|]+)/);
    if (referredMatch) {
      referredBy = referredMatch[1].trim();
      notes = remark.replace(/Referred by: [^|]+\s*\|\s*/, '').trim();
      // If notes still contains the referredBy part, use it as remark
      if (!notes) {
        notes = remark.replace(/Referred by: [^|]+/, '').replace(/\s*\|\s*/, '').trim();
      }
    } else {
      notes = remark;
    }
  }

  return {
    id: String(row.id), // Convert number id to string
    memberId: row.member_id,
    regDate: row.reg_date,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    gender: row.gender,
    email: row.email,
    phone: row.phone || '',
    age: row.age,
    address: row.address,
    city: row.city || '',
    bhagCode: row.bhag_code,
    occupation: row.occupation || '',
    nagarCode: row.nagar_code,
    bastiCode: row.basti_code,
    activation: row.activation || 'Pending',
    activationDt: row.activation_dt,
    remark: remark,
    referredBy: referredBy,
    notes: notes || undefined,
    createdAt: new Date(row.created_at).getTime(),
    // Legacy fields for backward compatibility
    name: fullName,
    profession: row.occupation || '',
    contactNumber: row.phone || '',
    area: row.city || '',
  };
}

