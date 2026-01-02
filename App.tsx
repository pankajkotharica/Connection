
import React, { useState, useEffect, useMemo } from 'react';
import { Contact } from './types';
import { Button } from './components/Button';
import { ContactCard } from './components/ContactCard';
import { Login } from './components/Login';
import { contactService } from './services/contactService';
import { authService, User } from './services/authService';
import { Plus, Search, X, Phone, MapPin, Users, Briefcase, ArrowLeft, User as UserIcon, Mail, Calendar, ChevronDown, Filter, Trash2, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchFields, setSearchFields] = useState<Array<{id: string, field: string, query: string}>>([
    { id: '1', field: 'all', query: '' }
  ]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setContacts([]);
    setSelectedContact(null);
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phone: '',
    age: undefined,
    address: '',
    city: '',
    bhagCode: '',
    occupation: '',
    nagarCode: '',
    bastiCode: '',
    activation: 'Pending',
    remark: '',
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
    if (!formData.firstName || !formData.lastName || !formData.occupation || !formData.phone || !formData.city) return;

    try {
      const newContact = await contactService.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        age: formData.age,
        address: formData.address,
        city: formData.city,
        bhagCode: formData.bhagCode,
        occupation: formData.occupation,
        nagarCode: formData.nagarCode,
        bastiCode: formData.bastiCode,
        activation: formData.activation || 'Pending',
        remark: formData.remark,
        referredBy: formData.referredBy,
      });

      setContacts(prev => [newContact, ...prev]);
      setIsFormOpen(false);
      // Reset form
      setFormData({ 
        firstName: '', lastName: '', gender: '', email: '', phone: '', 
        age: undefined, address: '', city: '', bhagCode: '', occupation: '',
        nagarCode: '', bastiCode: '', activation: 'Pending', remark: '', referredBy: ''
      });
    } catch (error) {
      console.error('Failed to create member:', error);
      alert('Failed to create member. Please try again.');
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

  // Add a new search field
  const addSearchField = () => {
    const newId = Date.now().toString();
    setSearchFields(prev => [...prev, { id: newId, field: 'all', query: '' }]);
  };

  // Remove a search field
  const removeSearchField = (id: string) => {
    if (searchFields.length > 1) {
      setSearchFields(prev => prev.filter(sf => sf.id !== id));
    }
  };

  // Update a specific search field
  const updateSearchField = (id: string, updates: Partial<{field: string, query: string}>) => {
    setSearchFields(prev => prev.map(sf => 
      sf.id === id ? { ...sf, ...updates } : sf
    ));
  };

  // Get field label for placeholder
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      'all': 'All Fields',
      'memberId': 'Member ID',
      'bhagCode': 'BHAG Code',
      'nagarCode': 'Nagar Code',
      'bastiCode': 'Basti Code',
      'referredBy': 'Referred By',
      'regDate': 'Registration Date',
    };
    return labels[field] || field.charAt(0).toUpperCase() + field.slice(1);
  };

  // Helper function to check if a contact matches a single search criteria
  const matchesSearch = (contact: Contact, field: string, query: string): boolean => {
    const q = query.toLowerCase().trim();
    if (!q) return true; // Empty query matches all

    const fullName = (c: Contact) => `${c.firstName || ''} ${c.lastName || ''}`.trim().toLowerCase();

    if (field === 'all') {
      // Search in all fields
      return (
        fullName(contact).includes(q) ||
        (contact.firstName || '').toLowerCase().includes(q) ||
        (contact.lastName || '').toLowerCase().includes(q) ||
        (contact.memberId || '').toLowerCase().includes(q) ||
        (contact.occupation || contact.profession || '').toLowerCase().includes(q) ||
        (contact.city || contact.area || '').toLowerCase().includes(q) ||
        (contact.referredBy || '').toLowerCase().includes(q) ||
        (contact.phone || contact.contactNumber || '').toLowerCase().includes(q) ||
        (contact.email || '').toLowerCase().includes(q) ||
        (contact.gender || '').toLowerCase().includes(q) ||
        (contact.address || '').toLowerCase().includes(q) ||
        (contact.bhagCode || '').toLowerCase().includes(q) ||
        (contact.nagarCode || '').toLowerCase().includes(q) ||
        (contact.bastiCode || '').toLowerCase().includes(q) ||
        (contact.activation || '').toLowerCase().includes(q) ||
        (contact.remark || contact.notes || '').toLowerCase().includes(q) ||
        (contact.age?.toString() || '').includes(q) ||
        (contact.regDate || '').toLowerCase().includes(q)
      );
    } else {
      // Search in specific field
      switch (field) {
        case 'name':
          return fullName(contact).includes(q) || 
                 (contact.firstName || '').toLowerCase().includes(q) ||
                 (contact.lastName || '').toLowerCase().includes(q);
        case 'memberId':
          return (contact.memberId || '').toLowerCase().includes(q);
        case 'phone':
          return (contact.phone || contact.contactNumber || '').toLowerCase().includes(q);
        case 'email':
          return (contact.email || '').toLowerCase().includes(q);
        case 'occupation':
          return (contact.occupation || contact.profession || '').toLowerCase().includes(q);
        case 'city':
          return (contact.city || contact.area || '').toLowerCase().includes(q);
        case 'address':
          return (contact.address || '').toLowerCase().includes(q);
        case 'bhagCode':
          return (contact.bhagCode || '').toLowerCase().includes(q);
        case 'nagarCode':
          return (contact.nagarCode || '').toLowerCase().includes(q);
        case 'bastiCode':
          return (contact.bastiCode || '').toLowerCase().includes(q);
        case 'gender':
          return (contact.gender || '').toLowerCase().includes(q);
        case 'age':
          return (contact.age?.toString() || '').includes(q);
        case 'activation':
          return (contact.activation || '').toLowerCase().includes(q);
        case 'referredBy':
          return (contact.referredBy || '').toLowerCase().includes(q);
        case 'remark':
          return (contact.remark || contact.notes || '').toLowerCase().includes(q);
        case 'regDate':
          return (contact.regDate || '').toLowerCase().includes(q);
        default:
          return true;
      }
    }
  };

  const filteredContacts = useMemo(() => {
    // Filter contacts - all search criteria must match (AND logic)
    return contacts.filter(contact => {
      return searchFields.every(search => matchesSearch(contact, search.field, search.query));
    });
  }, [contacts, searchFields]);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm safe-area-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
              <img src="/logo.svg" alt="JOIN RSS Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">JOIN RSS</h1>
              {currentUser && (
                <p className="text-xs text-gray-500">BHAG: {currentUser.bhagCode} | {currentUser.username}</p>
              )}
            </div>
          </div>
          
          <div className="flex-1 max-w-4xl flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-2">
            {/* Multiple Search Fields */}
            <div className="flex-1 hidden md:flex flex-col space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {searchFields.map((searchField, index) => (
                <div key={searchField.id} className="flex items-center space-x-2">
                  {/* Search Field Selector */}
                  <div className="relative">
                    <select
                      value={searchField.field}
                      onChange={(e) => updateSearchField(searchField.id, { field: e.target.value })}
                      className="appearance-none bg-gray-100 hover:bg-gray-200 border-transparent focus:bg-white border focus:border-indigo-500 rounded-full px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 outline-none transition-all cursor-pointer min-w-[120px]"
                    >
                      <option value="all">All Fields</option>
                      <option value="name">Name</option>
                      <option value="memberId">Member ID</option>
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="occupation">Occupation</option>
                      <option value="city">City</option>
                      <option value="address">Address</option>
                      <option value="bhagCode">BHAG Code</option>
                      <option value="nagarCode">Nagar Code</option>
                      <option value="bastiCode">Basti Code</option>
                      <option value="gender">Gender</option>
                      <option value="age">Age</option>
                      <option value="activation">Activation</option>
                      <option value="referredBy">Referred By</option>
                      <option value="remark">Remark</option>
                      <option value="regDate">Reg Date</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  
                  {/* Search Input */}
                  <div className="relative flex-1 group">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder={searchField.field === 'all' 
                        ? "Search in all fields..." 
                        : `Search by ${getFieldLabel(searchField.field)}...`}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border-transparent focus:bg-white border focus:border-indigo-500 rounded-full text-base outline-none transition-all"
                      value={searchField.query}
                      onChange={(e) => updateSearchField(searchField.id, { query: e.target.value })}
                    />
                    {searchField.query && (
                      <button 
                        onClick={() => updateSearchField(searchField.id, { query: '' })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  {searchFields.length > 1 && (
                    <button
                      onClick={() => removeSearchField(searchField.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                      aria-label="Remove search field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Add Button (only on last item) */}
                  {index === searchFields.length - 1 && (
                    <button
                      onClick={addSearchField}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
                      aria-label="Add search field"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={() => setIsFormOpen(true)} className="shrink-0 !bg-red-600 hover:!bg-red-700 min-h-[44px] px-4 sm:px-4">
                <Plus className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Person</span>
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="secondary" 
                className="shrink-0 min-h-[44px] px-4 sm:px-4"
                title="Logout"
              >
                <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {selectedContact ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setSelectedContact(null)}
              className="flex items-center text-sm sm:text-base font-medium text-indigo-600 hover:text-indigo-700 transition-colors min-h-[44px] mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to list
            </button>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 shadow-sm">
                <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 shadow-inner">
                    {(selectedContact.firstName || selectedContact.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {selectedContact.firstName && selectedContact.lastName 
                      ? `${selectedContact.firstName} ${selectedContact.lastName}`
                      : selectedContact.name || 'Unknown'}
                  </h2>
                  <p className="text-gray-500 font-medium text-base sm:text-lg mt-2">
                    {selectedContact.occupation || selectedContact.profession || 'No occupation'}
                  </p>
                </div>
                
                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                  {(selectedContact.phone || selectedContact.contactNumber) && (
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-indigo-500 mr-3 sm:mr-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Phone</p>
                        <p className="text-gray-900 text-base sm:text-lg break-words">{selectedContact.phone || selectedContact.contactNumber}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.email && (
                    <div className="flex items-start">
                      <UserIcon className="w-5 h-5 text-indigo-500 mr-3 sm:mr-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Email</p>
                        <p className="text-gray-900 text-base sm:text-lg break-words">{selectedContact.email}</p>
                      </div>
                    </div>
                  )}
                  {(selectedContact.city || selectedContact.area) && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-indigo-500 mr-3 sm:mr-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Location</p>
                        <p className="text-gray-900 text-base sm:text-lg break-words">
                          {selectedContact.address && `${selectedContact.address}, `}
                          {selectedContact.city || selectedContact.area}
                          {selectedContact.bhagCode && ` (BHAG: ${selectedContact.bhagCode})`}
                        </p>
                      </div>
                    </div>
                  )}
                  {(selectedContact.nagarCode || selectedContact.bastiCode) && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-indigo-500 mr-3 sm:mr-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Codes</p>
                        <p className="text-gray-900 text-base sm:text-lg break-words">
                          {selectedContact.nagarCode && `Nagar: ${selectedContact.nagarCode}`}
                          {selectedContact.nagarCode && selectedContact.bastiCode && ' | '}
                          {selectedContact.bastiCode && `Basti: ${selectedContact.bastiCode}`}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedContact.gender && (
                    <div className="flex items-start">
                      <UserIcon className="w-5 h-5 text-indigo-500 mr-3 sm:mr-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Gender</p>
                        <p className="text-gray-900 text-base sm:text-lg break-words">{selectedContact.gender}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.age && (
                    <div className="flex items-start">
                      <UserIcon className="w-5 h-5 text-indigo-500 mr-3 sm:mr-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Age</p>
                        <p className="text-gray-900 text-base sm:text-lg break-words">{selectedContact.age} years</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.activation && (
                    <div className="flex items-start">
                      <Briefcase className="w-5 h-5 text-indigo-500 mr-3 sm:mr-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Activation Status</p>
                        <p className="text-gray-900 text-base sm:text-lg break-words">{selectedContact.activation}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.referredBy && (
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-indigo-500 mr-3 sm:mr-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Referral</p>
                        <p className="text-gray-900 text-base sm:text-lg break-words">Met via <span className="font-semibold">{selectedContact.referredBy}</span></p>
                      </div>
                    </div>
                  )}
                  {(selectedContact.remark || selectedContact.notes) && (
                    <div className="flex items-start">
                      <Briefcase className="w-5 h-5 text-indigo-500 mr-3 sm:mr-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Remarks</p>
                        <p className="text-gray-900 text-base sm:text-lg break-words">{selectedContact.remark || selectedContact.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="danger" 
                  className="w-full min-h-[44px] text-base"
                  onClick={() => handleDeleteContact(selectedContact.id)}
                >
                  Delete Member
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
              <div className="md:hidden w-full space-y-3">
                {/* Multiple Mobile Search Fields */}
                {searchFields.map((searchField, index) => (
                  <div key={searchField.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {/* Mobile Search Field Selector */}
                      <div className="relative flex-1">
                        <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                          value={searchField.field}
                          onChange={(e) => updateSearchField(searchField.id, { field: e.target.value })}
                          className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl text-base outline-none transition-all shadow-sm appearance-none"
                        >
                          <option value="all">All Fields</option>
                          <option value="name">Name</option>
                          <option value="memberId">Member ID</option>
                          <option value="phone">Phone</option>
                          <option value="email">Email</option>
                          <option value="occupation">Occupation</option>
                          <option value="city">City</option>
                          <option value="address">Address</option>
                          <option value="bhagCode">BHAG Code</option>
                          <option value="nagarCode">Nagar Code</option>
                          <option value="bastiCode">Basti Code</option>
                          <option value="gender">Gender</option>
                          <option value="age">Age</option>
                          <option value="activation">Activation</option>
                          <option value="referredBy">Referred By</option>
                          <option value="remark">Remark</option>
                          <option value="regDate">Reg Date</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                      
                      {/* Remove Button */}
                      {searchFields.length > 1 && (
                        <button
                          onClick={() => removeSearchField(searchField.id)}
                          className="p-3 text-gray-400 hover:text-red-600 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="Remove search field"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      
                      {/* Add Button (only on last item) */}
                      {index === searchFields.length - 1 && (
                        <button
                          onClick={addSearchField}
                          className="p-3 text-gray-400 hover:text-indigo-600 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="Add search field"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    {/* Mobile Search Input */}
                    <div className="relative group">
                      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" />
                      <input 
                        type="text" 
                        placeholder={searchField.field === 'all' 
                          ? "Search in all fields..." 
                          : `Search by ${getFieldLabel(searchField.field)}...`}
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl text-base outline-none transition-all shadow-sm"
                        value={searchField.query}
                        onChange={(e) => updateSearchField(searchField.id, { query: e.target.value })}
                      />
                      {searchField.query && (
                        <button 
                          onClick={() => updateSearchField(searchField.id, { query: '' })}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="Clear search"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isLoadingContacts ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 animate-pulse" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Loading contacts...</h3>
                <p className="text-sm sm:text-base text-gray-500">Fetching your connections from the database.</p>
              </div>
            ) : filteredContacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {filteredContacts.map(contact => (
                  <ContactCard 
                    key={contact.id} 
                    contact={contact} 
                    onClick={handleContactClick}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {searchFields.some(sf => sf.query.trim()) ? "No results found" : "No connections found"}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-xs mx-auto">
                  {searchFields.some(sf => sf.query.trim())
                    ? "No matches found for your search criteria." 
                    : "Start building your professional network by adding your first contact."}
                </p>
                {searchFields.some(sf => sf.query.trim()) ? (
                  <Button 
                    variant="secondary" 
                    className="min-h-[44px] text-base" 
                    onClick={() => setSearchFields([{ id: '1', field: 'all', query: '' }])}
                  >
                    Clear Search
                  </Button>
                ) : (
                  <Button size="lg" className="min-h-[48px] text-base" onClick={() => setIsFormOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" />
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b flex items-center justify-between bg-indigo-50/50 sticky top-0 bg-white z-10">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Add New Member</h3>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 sm:p-2 hover:bg-white rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddContact} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">First Name *</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <input 
                        required
                        type="text" 
                        placeholder="John"
                        className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                        value={formData.firstName || ''}
                        onChange={e => setFormData(prev => ({...prev, firstName: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Last Name *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Doe"
                      className="w-full px-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                      value={formData.lastName || ''}
                      onChange={e => setFormData(prev => ({...prev, lastName: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Gender, Age, Email */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Gender</label>
                    <select 
                      className="w-full px-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                      value={formData.gender || ''}
                      onChange={e => setFormData(prev => ({...prev, gender: e.target.value}))}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Age</label>
                    <input 
                      type="number" 
                      placeholder="25"
                      min="1"
                      max="120"
                      className="w-full px-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                      value={formData.age || ''}
                      onChange={e => setFormData(prev => ({...prev, age: e.target.value ? parseInt(e.target.value) : undefined}))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full px-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                      value={formData.email || ''}
                      onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Phone and Occupation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Phone *</label>
                    <div className="relative group">
                      <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <input 
                        required
                        type="tel" 
                        placeholder="+1 234..."
                        className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                        value={formData.phone || ''}
                        onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Occupation *</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <input 
                        required
                        type="text" 
                        placeholder="Engineer"
                        className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                        value={formData.occupation || ''}
                        onChange={e => setFormData(prev => ({...prev, occupation: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Address</label>
                  <textarea 
                    rows={2}
                    placeholder="Street address"
                    className="w-full px-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base resize-none"
                    value={formData.address || ''}
                    onChange={e => setFormData(prev => ({...prev, address: e.target.value}))}
                  />
                </div>

                {/* City and BHAG */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">City *</label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <input 
                        required
                        type="text" 
                        placeholder="Nagpur"
                        className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                        value={formData.city || ''}
                        onChange={e => setFormData(prev => ({...prev, city: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">BHAG Code</label>
                    <input 
                      type="text" 
                      placeholder="B01"
                      className="w-full px-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                      value={formData.bhagCode || ''}
                      onChange={e => setFormData(prev => ({...prev, bhagCode: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Nagar Code and Basti Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nagar Code</label>
                    <input 
                      type="text" 
                      placeholder="N001"
                      className="w-full px-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                      value={formData.nagarCode || ''}
                      onChange={e => setFormData(prev => ({...prev, nagarCode: e.target.value}))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Basti Code</label>
                    <input 
                      type="text" 
                      placeholder="B001"
                      className="w-full px-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                      value={formData.bastiCode || ''}
                      onChange={e => setFormData(prev => ({...prev, bastiCode: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Activation Status */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Activation Status</label>
                  <select 
                    className="w-full px-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                    value={formData.activation || 'Pending'}
                    onChange={e => setFormData(prev => ({...prev, activation: e.target.value}))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Referral */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Who introduced you?</label>
                  <div className="relative group">
                    <Users className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                    <input 
                      type="text" 
                      placeholder="Common friend, Mike..."
                      className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                      value={formData.referredBy || ''}
                      onChange={e => setFormData(prev => ({...prev, referredBy: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Remark/Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Remark / Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Additional notes..."
                    className="w-full px-4 py-3.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base resize-none"
                    value={formData.remark || ''}
                    onChange={e => setFormData(prev => ({...prev, remark: e.target.value}))}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2 sm:pb-0">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1 min-h-[48px] text-base" 
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-[2] min-h-[48px] text-base"
                >
                  Save Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
