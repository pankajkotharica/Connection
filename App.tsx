
import React, { useState, useEffect, useMemo } from 'react';
import { Contact } from './types';
import { Button } from './components/Button';
import { ContactCard } from './components/ContactCard';
import { Login } from './components/Login';
import { contactService } from './services/contactService';
import { authService, User } from './services/authService';
import { Plus, Search, X, Phone, MapPin, Users, Briefcase, ArrowLeft, User as UserIcon, Mail, Calendar, ChevronDown, Filter, Trash2, LogOut, Edit2, Save, Shield, Download } from 'lucide-react';

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
  const [isEditingBhagCode, setIsEditingBhagCode] = useState(false);
  const [editingBhagCode, setEditingBhagCode] = useState<string>('');
  const [editingBhagCodeId, setEditingBhagCodeId] = useState<string | null>(null);
  const [isEditingCodes, setIsEditingCodes] = useState(false);
  const [editingNagarCode, setEditingNagarCode] = useState<string>('');
  const [editingBastiCode, setEditingBastiCode] = useState<string>('');
  const [editingCodesId, setEditingCodesId] = useState<string | null>(null);
  const [editingTableNagarCode, setEditingTableNagarCode] = useState<string>('');
  const [editingTableBastiCode, setEditingTableBastiCode] = useState<string>('');

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

  // Auto-set BHAG code for non-admin users when form opens
  useEffect(() => {
    if (isFormOpen && currentUser && !currentUser.isAdmin && currentUser.bhagCode) {
      setFormData(prev => ({ ...prev, bhagCode: currentUser.bhagCode || '' }));
    } else if (isFormOpen && currentUser?.isAdmin) {
      setFormData(prev => ({ ...prev, bhagCode: '' }));
    }
  }, [isFormOpen, currentUser]);

  // Load contacts from Supabase (filtered by user's BHAG code if not admin)
  useEffect(() => {
    const loadContacts = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoadingContacts(true);
        const data = await contactService.getAll(currentUser.bhagCode, currentUser.isAdmin);
        setContacts(data);
      } catch (error) {
        console.error('Failed to load contacts:', error);
        alert('Failed to load contacts. Please check your Supabase connection.');
      } finally {
        setIsLoadingContacts(false);
      }
    };

    if (isAuthenticated && currentUser) {
      loadContacts();
    }
  }, [isAuthenticated, currentUser]);

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

      // Only add to list if user is admin or contact's BHAG matches user's BHAG
      if (currentUser && (currentUser.isAdmin || newContact.bhagCode === currentUser.bhagCode)) {
        setContacts(prev => [newContact, ...prev]);
      } else {
        // Reload contacts from server to ensure consistency
        const data = await contactService.getAll(currentUser?.bhagCode || null, currentUser?.isAdmin || false);
        setContacts(data);
      }
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
    setIsEditingBhagCode(false);
    setIsEditingCodes(false);
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

  // Helper function to check if age matches query (supports ranges like "25-30" or "25 to 30")
  const matchesAgeSearch = (age: number | undefined, query: string): boolean => {
    if (!age) return false;
    const q = query.trim();
    if (!q) return true;

    // Check for range patterns: "25-30", "25 - 30", "25 to 30", "25 TO 30"
    const rangePattern = /^(\d+)\s*(?:-|to|TO)\s*(\d+)$/i;
    const rangeMatch = q.match(rangePattern);
    
    if (rangeMatch) {
      const minAge = parseInt(rangeMatch[1], 10);
      const maxAge = parseInt(rangeMatch[2], 10);
      return age >= minAge && age <= maxAge;
    }

    // Check for single age match
    const singleAge = parseInt(q, 10);
    if (!isNaN(singleAge)) {
      return age === singleAge;
    }

    // Fallback to string includes for partial matches
    return age.toString().includes(q);
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
        matchesAgeSearch(contact.age, query) ||
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
          return matchesAgeSearch(contact.age, query);
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

  // Export filtered contacts to Excel (CSV format)
  const handleExportToExcel = () => {
    if (filteredContacts.length === 0) {
      alert('No data to export.');
      return;
    }

    // Define CSV headers
    const headers = [
      'Member ID',
      'Registration Date',
      'First Name',
      'Last Name',
      'Gender',
      'Address',
      'City',
      'BHAG Code',
      'Email',
      'Phone',
      'Age',
      'Occupation',
      'Nagar Code',
      'Basti Code',
      'Activation',
      'Activation Date',
      'Remark',
      'Referred By'
    ];

    // Convert contacts to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...filteredContacts.map(contact => {
        // Helper function to escape CSV values
        const escapeCSV = (value: any): string => {
          if (value === null || value === undefined) return '';
          const str = String(value);
          // If value contains comma, quote, or newline, wrap in quotes and escape quotes
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        return [
          escapeCSV(contact.memberId),
          escapeCSV(contact.regDate),
          escapeCSV(contact.firstName),
          escapeCSV(contact.lastName),
          escapeCSV(contact.gender),
          escapeCSV(contact.address),
          escapeCSV(contact.city),
          escapeCSV(contact.bhagCode),
          escapeCSV(contact.email),
          escapeCSV(contact.phone),
          escapeCSV(contact.age),
          escapeCSV(contact.occupation),
          escapeCSV(contact.nagarCode),
          escapeCSV(contact.bastiCode),
          escapeCSV(contact.activation),
          escapeCSV(contact.activationDt),
          escapeCSV(contact.remark),
          escapeCSV(contact.referredBy)
        ].join(',');
      })
    ];

    // Create CSV content
    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8 support
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `JOIN_RSS_Members_${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  };

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
                <p className="text-xs text-gray-500">
                  {currentUser.isAdmin ? (
                    <>ADMIN | {currentUser.username}</>
                  ) : (
                    <>BHAG: {currentUser.bhagCode} | {currentUser.username}</>
                  )}
                </p>
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
                        </p>
                      </div>
                    </div>
                  )}
                  {/* BHAG Code - Editable by Admin - Prominent Display */}
                  <div className={`flex items-start ${currentUser?.isAdmin ? 'bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 sm:p-5' : ''}`}>
                    <div className={`${currentUser?.isAdmin ? 'bg-indigo-100' : ''} rounded-lg p-2 mr-3 sm:mr-4 shrink-0`}>
                      <Shield className={`w-5 h-5 ${currentUser?.isAdmin ? 'text-indigo-600' : 'text-indigo-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <p className={`${currentUser?.isAdmin ? 'text-indigo-900' : 'text-gray-400'} uppercase font-bold tracking-wider text-sm`}>
                            BHAG Code
                          </p>
                          {currentUser?.isAdmin && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                              Admin Editable
                            </span>
                          )}
                        </div>
                        {currentUser?.isAdmin && !isEditingBhagCode && (
                          <button
                            onClick={() => {
                              setIsEditingBhagCode(true);
                              setEditingBhagCode(selectedContact.bhagCode || '');
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                      {currentUser?.isAdmin && isEditingBhagCode ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <select
                              className="w-full px-4 py-3 bg-white border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base appearance-none pr-10 shadow-sm"
                              value={editingBhagCode}
                              onChange={(e) => setEditingBhagCode(e.target.value)}
                            >
                              <option value="">Select BHAG Code</option>
                              <option value="MOHITE">MOHITE</option>
                              <option value="ITWARI">ITWARI</option>
                              <option value="LALGANJ">LALGANJ</option>
                              <option value="BINAKI">BINAKI</option>
                              <option value="SADAR">SADAR</option>
                              <option value="GITTIKHADAN">GITTIKHADAN</option>
                              <option value="DHARAMPETH">DHARAMPETH</option>
                              <option value="TRIMURTI">TRIMURTI</option>
                              <option value="SOMALWADA">SOMALWADA</option>
                              <option value="AJNI">AJNI</option>
                              <option value="AYODHYA">AYODHYA</option>
                              <option value="NANDANVAN">NANDANVAN</option>
                              <option value="RAMTEK VIBHAG">RAMTEK VIBHAG</option>
                              <option value="OTHER">OTHER</option>
                            </select>
                            <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  await contactService.update(selectedContact.id, { bhagCode: editingBhagCode });
                                  const updatedContact = { ...selectedContact, bhagCode: editingBhagCode };
                                  setSelectedContact(updatedContact);
                                  setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));
                                  setIsEditingBhagCode(false);
                                  // Reload contacts if needed for filtering
                                  if (currentUser && !currentUser.isAdmin) {
                                    const data = await contactService.getAll(currentUser.bhagCode, currentUser.isAdmin);
                                    setContacts(data);
                                  }
                                } catch (error) {
                                  console.error('Failed to update BHAG code:', error);
                                  alert('Failed to update BHAG code. Please try again.');
                                }
                              }}
                              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                            >
                              <Save className="w-4 h-4" />
                              <span>Save Changes</span>
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingBhagCode(false);
                                setEditingBhagCode(selectedContact.bhagCode || '');
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className={`${currentUser?.isAdmin ? 'text-indigo-900' : 'text-gray-900'} text-lg sm:text-xl font-semibold break-words`}>
                            {selectedContact.bhagCode || (
                              <span className="text-gray-400 italic">Not assigned - Click Edit to assign</span>
                            )}
                          </p>
                          {currentUser?.isAdmin && selectedContact.bhagCode && (
                            <p className="text-xs text-indigo-600 mt-1">Click Edit to change BHAG assignment</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Nagar Code and Basti Code - Editable by BHAG users (non-admin) */}
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-indigo-500 mr-3 sm:mr-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Codes</p>
                        {currentUser && !currentUser.isAdmin && !isEditingCodes && (
                          <button
                            onClick={() => {
                              setIsEditingCodes(true);
                              setEditingNagarCode(selectedContact.nagarCode || '');
                              setEditingBastiCode(selectedContact.bastiCode || '');
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      {currentUser && !currentUser.isAdmin && isEditingCodes ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1 font-medium">Nagar Code</label>
                              <input
                                type="text"
                                placeholder="N001"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                                value={editingNagarCode}
                                onChange={(e) => setEditingNagarCode(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1 font-medium">Basti Code</label>
                              <input
                                type="text"
                                placeholder="B001"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base"
                                value={editingBastiCode}
                                onChange={(e) => setEditingBastiCode(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  await contactService.update(selectedContact.id, { 
                                    nagarCode: editingNagarCode,
                                    bastiCode: editingBastiCode
                                  });
                                  const updatedContact = { 
                                    ...selectedContact, 
                                    nagarCode: editingNagarCode,
                                    bastiCode: editingBastiCode
                                  };
                                  setSelectedContact(updatedContact);
                                  setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));
                                  setIsEditingCodes(false);
                                } catch (error) {
                                  console.error('Failed to update codes:', error);
                                  alert('Failed to update codes. Please try again.');
                                }
                              }}
                              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingCodes(false);
                                setEditingNagarCode(selectedContact.nagarCode || '');
                                setEditingBastiCode(selectedContact.bastiCode || '');
                              }}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900 text-base sm:text-lg break-words">
                          {selectedContact.nagarCode || selectedContact.bastiCode ? (
                            <>
                              {selectedContact.nagarCode && `Nagar: ${selectedContact.nagarCode}`}
                              {selectedContact.nagarCode && selectedContact.bastiCode && ' | '}
                              {selectedContact.bastiCode && `Basti: ${selectedContact.bastiCode}`}
                            </>
                          ) : (
                            'Not assigned'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
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
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">Your Connections</h2>
                  <p className="text-gray-500 mt-1">Manage the people you meet and grow your network.</p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={handleExportToExcel}
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium min-h-[44px]"
                    aria-label="Download Excel"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Excel</span>
                  </button>
                </div>
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
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Member ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          BHAG Code {currentUser?.isAdmin && <Shield className="inline-block w-3 h-3 text-indigo-600 ml-1" />}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Address</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">City</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Occupation</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nagar</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Basti</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContacts.map(contact => (
                        <tr 
                          key={contact.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleContactClick(contact)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {contact.memberId || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.firstName && contact.lastName 
                                ? `${contact.firstName} ${contact.lastName}`
                                : contact.name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {contact.phone || contact.contactNumber || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {contact.email || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {currentUser?.isAdmin && editingBhagCodeId === contact.id ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  className="px-2 py-1.5 text-sm border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                  value={editingBhagCode}
                                  onChange={(e) => setEditingBhagCode(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                >
                                  <option value="">Select BHAG</option>
                                  <option value="MOHITE">MOHITE</option>
                                  <option value="ITWARI">ITWARI</option>
                                  <option value="LALGANJ">LALGANJ</option>
                                  <option value="BINAKI">BINAKI</option>
                                  <option value="SADAR">SADAR</option>
                                  <option value="GITTIKHADAN">GITTIKHADAN</option>
                                  <option value="DHARAMPETH">DHARAMPETH</option>
                                  <option value="TRIMURTI">TRIMURTI</option>
                                  <option value="SOMALWADA">SOMALWADA</option>
                                  <option value="AJNI">AJNI</option>
                                  <option value="AYODHYA">AYODHYA</option>
                                  <option value="NANDANVAN">NANDANVAN</option>
                                  <option value="RAMTEK VIBHAG">RAMTEK VIBHAG</option>
                                  <option value="OTHER">OTHER</option>
                                </select>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await contactService.update(contact.id, { bhagCode: editingBhagCode });
                                      const updatedContact = { ...contact, bhagCode: editingBhagCode };
                                      setContacts(prev => prev.map(c => c.id === contact.id ? updatedContact : c));
                                      setEditingBhagCodeId(null);
                                      setEditingBhagCode('');
                                    } catch (error) {
                                      console.error('Failed to update BHAG code:', error);
                                      alert('Failed to update BHAG code. Please try again.');
                                    }
                                  }}
                                  className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingBhagCodeId(null);
                                    setEditingBhagCode('');
                                  }}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="flex items-center space-x-2 group"
                                onDoubleClick={(e) => {
                                  if (currentUser?.isAdmin) {
                                    e.stopPropagation();
                                    setEditingBhagCodeId(contact.id);
                                    setEditingBhagCode(contact.bhagCode || '');
                                  }
                                }}
                              >
                                <span className={`text-sm font-medium ${
                                  contact.bhagCode 
                                    ? 'text-gray-900' 
                                    : 'text-orange-600 font-semibold'
                                }`}>
                                  {contact.bhagCode || 'No BHAG'}
                                </span>
                                {currentUser?.isAdmin && (
                                  <Edit2 
                                    className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingBhagCodeId(contact.id);
                                      setEditingBhagCode(contact.bhagCode || '');
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={contact.address || undefined}>
                              {contact.address || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {contact.city || contact.area || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {contact.occupation || contact.profession || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {currentUser && !currentUser.isAdmin && editingCodesId === contact.id ? (
                              <input
                                type="text"
                                placeholder="N001"
                                className="w-20 px-2 py-1.5 text-sm border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                value={editingTableNagarCode}
                                onChange={(e) => setEditingTableNagarCode(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            ) : (
                              <div 
                                className="flex items-center space-x-2 group"
                                onDoubleClick={(e) => {
                                  if (currentUser && !currentUser.isAdmin) {
                                    e.stopPropagation();
                                    setEditingCodesId(contact.id);
                                    setEditingTableNagarCode(contact.nagarCode || '');
                                    setEditingTableBastiCode(contact.bastiCode || '');
                                  }
                                }}
                              >
                                <span className="text-sm text-gray-900">
                                  {contact.nagarCode || '-'}
                                </span>
                                {currentUser && !currentUser.isAdmin && (
                                  <Edit2 
                                    className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCodesId(contact.id);
                                      setEditingTableNagarCode(contact.nagarCode || '');
                                      setEditingTableBastiCode(contact.bastiCode || '');
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {currentUser && !currentUser.isAdmin && editingCodesId === contact.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  placeholder="B001"
                                  className="w-20 px-2 py-1.5 text-sm border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                  value={editingTableBastiCode}
                                  onChange={(e) => setEditingTableBastiCode(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await contactService.update(contact.id, { 
                                        nagarCode: editingTableNagarCode,
                                        bastiCode: editingTableBastiCode
                                      });
                                      const updatedContact = { 
                                        ...contact, 
                                        nagarCode: editingTableNagarCode,
                                        bastiCode: editingTableBastiCode
                                      };
                                      setContacts(prev => prev.map(c => c.id === contact.id ? updatedContact : c));
                                      setEditingCodesId(null);
                                      setEditingTableNagarCode('');
                                      setEditingTableBastiCode('');
                                    } catch (error) {
                                      console.error('Failed to update codes:', error);
                                      alert('Failed to update codes. Please try again.');
                                    }
                                  }}
                                  className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCodesId(null);
                                    setEditingTableNagarCode('');
                                    setEditingTableBastiCode('');
                                  }}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="flex items-center space-x-2 group"
                                onDoubleClick={(e) => {
                                  if (currentUser && !currentUser.isAdmin) {
                                    e.stopPropagation();
                                    setEditingCodesId(contact.id);
                                    setEditingTableNagarCode(contact.nagarCode || '');
                                    setEditingTableBastiCode(contact.bastiCode || '');
                                  }
                                }}
                              >
                                <span className="text-sm text-gray-900">
                                  {contact.bastiCode || '-'}
                                </span>
                                {currentUser && !currentUser.isAdmin && (
                                  <Edit2 
                                    className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCodesId(contact.id);
                                      setEditingTableNagarCode(contact.nagarCode || '');
                                      setEditingTableBastiCode(contact.bastiCode || '');
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactClick(contact);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                    <div className="flex items-center justify-between mb-2">
                      <label className={`block text-sm font-bold ${currentUser?.isAdmin ? 'text-indigo-700' : 'text-gray-700'} mb-0 uppercase tracking-wider`}>
                        BHAG Code {currentUser?.isAdmin && <span className="text-xs normal-case text-indigo-600">(Admin: Select Any)</span>}
                      </label>
                      {currentUser?.isAdmin && (
                        <Shield className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <div className={`relative group ${currentUser?.isAdmin ? 'bg-indigo-50 rounded-lg p-1' : ''}`}>
                      <select
                        className={`w-full px-4 py-3.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-base appearance-none pr-10 ${
                          currentUser?.isAdmin 
                            ? 'bg-white border-2 border-indigo-300' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        value={formData.bhagCode || (currentUser && !currentUser.isAdmin ? currentUser.bhagCode || '' : '')}
                        onChange={e => setFormData(prev => ({...prev, bhagCode: e.target.value}))}
                        disabled={currentUser && !currentUser.isAdmin}
                      >
                        {currentUser?.isAdmin ? (
                          <>
                            <option value="">Select BHAG Code (Admin can assign any)</option>
                            <option value="MOHITE">MOHITE</option>
                            <option value="ITWARI">ITWARI</option>
                            <option value="LALGANJ">LALGANJ</option>
                            <option value="BINAKI">BINAKI</option>
                            <option value="SADAR">SADAR</option>
                            <option value="GITTIKHADAN">GITTIKHADAN</option>
                            <option value="DHARAMPETH">DHARAMPETH</option>
                            <option value="TRIMURTI">TRIMURTI</option>
                            <option value="SOMALWADA">SOMALWADA</option>
                            <option value="AJNI">AJNI</option>
                            <option value="AYODHYA">AYODHYA</option>
                            <option value="NANDANVAN">NANDANVAN</option>
                            <option value="RAMTEK VIBHAG">RAMTEK VIBHAG</option>
                            <option value="OTHER">OTHER</option>
                          </>
                        ) : (
                          <>
                            <option value={currentUser?.bhagCode || ''}>
                              {currentUser?.bhagCode || 'Not assigned'}
                            </option>
                          </>
                        )}
                      </select>
                      <ChevronDown className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${currentUser?.isAdmin ? 'text-indigo-500' : 'text-gray-400'}`} />
                    </div>
                    {currentUser && !currentUser.isAdmin && (
                      <p className="text-xs text-gray-500 mt-1">BHAG Code is assigned by admin</p>
                    )}
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
