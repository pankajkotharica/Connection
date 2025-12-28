
import React from 'react';
import { Contact } from '../types';
import { User, Briefcase, Phone, MapPin, Users, Calendar } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onClick }) => {
  return (
    <div 
      onClick={() => onClick(contact)}
      className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group active:bg-gray-50"
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex items-center min-w-0 flex-1">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base sm:text-lg mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
            {contact.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 leading-tight text-base sm:text-lg truncate">{contact.name}</h3>
            <div className="flex items-center text-sm sm:text-base text-gray-500 mt-1">
              <Briefcase className="w-3.5 h-3.5 sm:w-3 sm:h-3 mr-1.5 shrink-0" />
              <span className="truncate">{contact.profession}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 sm:space-y-2.5">
        {contact.contactNumber && (
          <div className="flex items-center text-sm sm:text-base text-gray-600 min-w-0">
            <Phone className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <span className="truncate">{contact.contactNumber}</span>
          </div>
        )}
        {contact.area && (
          <div className="flex items-center text-sm sm:text-base text-gray-600 min-w-0">
            <MapPin className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <span className="truncate">{contact.area}</span>
          </div>
        )}
        {contact.referredBy && (
          <div className="flex items-center text-sm sm:text-base text-gray-600 min-w-0">
            <Users className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <span className="text-gray-400 mr-1 shrink-0">via</span>
            <span className="truncate">{contact.referredBy}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex items-center text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 font-bold">
        <Calendar className="w-3 h-3 mr-1 shrink-0" />
        <span>Added {new Date(contact.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
