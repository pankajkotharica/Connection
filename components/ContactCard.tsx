
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
      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {contact.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{contact.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Briefcase className="w-3 h-3 mr-1" />
              {contact.profession}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2 text-gray-400" />
          {contact.contactNumber}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          {contact.area}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-400 mr-1">via</span> {contact.referredBy}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-[10px] uppercase tracking-wider text-gray-400 font-bold">
        <Calendar className="w-3 h-3 mr-1" />
        Added {new Date(contact.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};
