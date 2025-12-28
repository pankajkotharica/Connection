
import React, { useState, useEffect, useMemo } from 'react';
import { Contact } from './types';
import { Button } from './components/Button';
import { ContactCard } from './components/ContactCard';
import { contactService } from './services/contactService';
import { Plus, Search, X, Phone, MapPin, Users, Briefcase, ArrowLeft, User } from 'lucide-react';

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    profession: '',
    contactNumber: '',
    area: '',
    referredBy: '',
  });

  // Load contacts from Supabase
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setIsLoadingContacts(true);
        const data = await contactService.getAll();
        setContacts(data);
      } catch (error) {
        console.error('Failed to load contacts:', error);
        alert('Failed to load contacts. Please check your Supabase connection.');
      } finally {
        setIsLoadingContacts(false);
      }
    };

    loadContacts();
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.profession) return;

    try {
      const newContact = await contactService.create({
        name: formData.name,
        profession: formData.profession,
        contactNumber: formData.contactNumber || '',
        area: formData.area || '',
        referredBy: formData.referredBy || '',
      });

      setContacts(prev => [newContact, ...prev]);
      setIsFormOpen(false);
      setFormData({ name: '', profession: '', contactNumber: '', area: '', referredBy: '' });
    } catch (error) {
      console.error('Failed to create contact:', error);
      alert('Failed to create contact. Please try again.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Delete this contact?')) return;

    try {
      await contactService.delete(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      setSelectedContact(null);
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert('Failed to delete contact. Please try again.');
    }
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return contacts;

    return contacts.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.profession.toLowerCase().includes(query) ||
      c.area.toLowerCase().includes(query) ||
      c.referredBy.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Nexus</h1>
          </div>
          
          <div className="flex-1 max-w-xl flex items-center space-x-4">
            <div className="relative flex-1 hidden md:block group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name, profession, area or referral..." 
                className="w-full pl-10 pr-10 py-2 bg-gray-100 border-transparent focus:bg-white border focus:border-indigo-500 rounded-full text-sm outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="shrink-0 !bg-red-600 hover:!bg-red-700">
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Add Person</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {selectedContact ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setSelectedContact(null)}
              className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to list
            </button>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-4xl font-bold mb-4 shadow-inner">
                    {selectedContact.name.charAt(0)}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedContact.name}</h2>
                  <p className="text-gray-500 font-medium text-lg mt-2">{selectedContact.profession}</p>
                </div>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-indigo-500 mr-4 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Contact</p>
                      <p className="text-gray-900 text-lg">{selectedContact.contactNumber || 'No number added'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-indigo-500 mr-4 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Location</p>
                      <p className="text-gray-900 text-lg">{selectedContact.area || 'No area specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-indigo-500 mr-4 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Referral</p>
                      <p className="text-gray-900 text-lg">Met via <span className="font-semibold">{selectedContact.referredBy}</span></p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="danger" 
                  className="w-full"
                  onClick={() => handleDeleteContact(selectedContact.id)}
                >
                  Delete Connection
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Your Connections</h2>
                <p className="text-gray-500 mt-1">Manage the people you meet and grow your network.</p>
              </div>
              <div className="md:hidden w-full">
                <div className="relative group">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" />
                  <input 
                    type="text" 
                    placeholder="Search name, job, area or referral..." 
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl text-sm outline-none transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isLoadingContacts ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-gray-300 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Loading contacts...</h3>
                <p className="text-gray-500">Fetching your connections from the database.</p>
              </div>
            ) : filteredContacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {filteredContacts.map(contact => (
                  <ContactCard 
                    key={contact.id} 
                    contact={contact} 
                    onClick={handleContactClick}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {searchQuery ? "No results found" : "No connections found"}
                </h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                  {searchQuery 
                    ? `No matches for "${searchQuery}" in your contacts.` 
                    : "Start building your professional network by adding your first contact."}
                </p>
                {searchQuery ? (
                  <Button variant="secondary" onClick={() => setSearchQuery('')}>Clear Search</Button>
                ) : (
                  <Button size="lg" onClick={() => setIsFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Someone New
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Contact Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="px-8 py-6 border-b flex items-center justify-between bg-indigo-50/50">
              <h3 className="text-xl font-bold text-gray-900">New Connection</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddContact} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Full Name *</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      required
                      type="text" 
                      placeholder="Jane Doe"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Profession *</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        required
                        type="text" 
                        placeholder="Engineer"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                        value={formData.profession}
                        onChange={e => setFormData(prev => ({...prev, profession: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Contact No.</label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="tel" 
                        placeholder="+1 234..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                        value={formData.contactNumber}
                        onChange={e => setFormData(prev => ({...prev, contactNumber: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Living Area</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Manhattan, NY"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                      value={formData.area}
                      onChange={e => setFormData(prev => ({...prev, area: e.target.value}))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Who introduced you?</label>
                  <div className="relative group">
                    <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Common friend, Mike..."
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                      value={formData.referredBy}
                      onChange={e => setFormData(prev => ({...prev, referredBy: e.target.value}))}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-[2]">Save Connection</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
