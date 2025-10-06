'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Building2, CreditCard, FileText, Check, X } from 'lucide-react';
import { useParties, Party } from '@/hooks/useParties';

interface PartyAutoCompleteProps {
  value?: Party | null;
  onChange: (party: Party | null) => void;
  type?: 'customer' | 'supplier' | 'all';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
}

const PartyAutoComplete: React.FC<PartyAutoCompleteProps> = ({
  value,
  onChange,
  type = 'all',
  placeholder = 'Search for party...',
  className = '',
  disabled = false,
  required = false,
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { parties, loading, getPartiesByType } = useParties({
    search: searchTerm,
    isActive: true,
  });

  // Filter parties based on type
  const filteredParties = type === 'all' 
    ? parties 
    : getPartiesByType(type as Party['partyType']);

  // Filter by search term
  const searchResults = filteredParties.filter(party =>
    party.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (party.phone && party.phone.includes(searchTerm))
  );

  useEffect(() => {
    if (value) {
      setSearchTerm(value.partyName);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    setHighlightedIndex(0);

    // If input is cleared, clear the selected party
    if (!term.trim()) {
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handlePartySelect = (party: Party) => {
    onChange(party);
    setSearchTerm(party.partyName);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[highlightedIndex]) {
          handlePartySelect(searchResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSelection = () => {
    onChange(null);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const getPartyIcon = (partyType: Party['partyType']) => {
    switch (partyType) {
      case 'customer':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'supplier':
        return <Building2 className="h-4 w-4 text-green-600" />;
      case 'sundry_debtor':
      case 'sundry_creditor':
        return <CreditCard className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPartyTypeColor = (partyType: Party['partyType']) => {
    switch (partyType) {
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'supplier':
        return 'bg-green-100 text-green-800';
      case 'sundry_debtor':
        return 'bg-purple-100 text-purple-800';
      case 'sundry_creditor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        
        {value && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading parties...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No parties found</p>
                {searchTerm && (
                  <p className="text-sm mt-1">
                    Try searching with a different term
                  </p>
                )}
              </div>
            ) : (
              <div className="py-1">
                {searchResults.map((party, index) => (
                  <motion.div
                    key={party.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                      index === highlightedIndex ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handlePartySelect(party)}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getPartyIcon(party.partyType)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {party.partyName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPartyTypeColor(party.partyType)}`}>
                            {party.partyType.replace('_', ' ').charAt(0).toUpperCase() + party.partyType.replace('_', ' ').slice(1)}
                          </span>
                          {party.email && (
                            <span className="text-xs text-gray-500 truncate">
                              {party.email}
                            </span>
                          )}
                        </div>
                        {party.phone && (
                          <p className="text-xs text-gray-500 mt-1">
                            {party.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {value?.id === party.id && (
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartyAutoComplete;
