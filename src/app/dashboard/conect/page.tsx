'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { FiPlus, FiEdit, FiTrash2, FiX, FiSearch, FiFilter, FiUser, FiPhone, FiMail, FiCalendar, FiEye } from 'react-icons/fi'
import Layout from '@/components/Layout'

interface Contact {
  id: number
  name: string
  phone: string
  message: string
  created_at: string
  updated_at: string
}

interface FormData {
  name: string
  phone: string
  message: string
}

const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-all duration-300">
            <FiX size={28} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const ContactPopup = ({ contact, isOpen, onClose }: { contact: Contact | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !contact) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">Contact Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-all duration-300">
            <FiX size={28} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <FiUser className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-blue-600 font-medium">Name</p>
                <p className="text-gray-800 font-semibold">{contact.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <FiPhone className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-green-600 font-medium">Phone</p>
                <p className="text-gray-800 font-semibold">{contact.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <FiMail className="text-purple-600" size={20} />
              <div>
                <p className="text-sm text-purple-600 font-medium">Message/Email</p>
                <p className="text-gray-800 font-semibold">{contact.message}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Created:</span>
              <span className="text-gray-800 font-medium">
                {new Date(contact.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Updated:</span>
              <span className="text-gray-800 font-medium">
                {new Date(contact.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContactUsManagementPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    message: ''
  })

  const API_URL = '/api'

  // Fetch contacts from API
  const fetchContacts = async (page = 1) => {
    try {
      const response = await fetch(`${API_URL}/contact-us`)
      const data = await response.json()
      
      if (data.data) {
        setContacts(data.data)
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total,
          from: data.from,
          to: data.to
        })
        setCurrentPage(data.current_page)
        setLastPage(data.last_page)
      } else {
        toast.error('Failed to load contacts')
      }
    } catch (err) {
      console.error('Fetch contacts error:', err)
      toast.error('Error loading contacts')
    }
  }

  useEffect(() => {
    fetchContacts(currentPage)
  }, [currentPage])

  // CRUD Operations
  const createContact = async (payload: FormData): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/contact-us`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      
      if (data.status === 200 || data.success) {
        return true
      } else {
        toast.error(data.message || 'Failed to create contact')
        return false
      }
    } catch (err) {
      console.error('Create contact error:', err)
      toast.error('Error creating contact')
      return false
    }
  }

  const updateContact = async (id: number, payload: FormData): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/contact-us/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      
      if (data.status === 200 || data.success) {
        return true
      } else {
        if (data.errors) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.values(data.errors).forEach((arr: any) => 
            arr.forEach((e: string) => toast.error(e))
          )
        } else {
          toast.error(data.message || 'Failed to update contact')
        }
        return false
      }
    } catch (err) {
      console.error('Update contact error:', err)
      toast.error('Error updating contact')
      return false
    }
  }

  const deleteContact = async (id: number): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this contact?')) return false
    
    try {
      const res = await fetch(`${API_URL}/contact-us/${id}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      
      if (data.status === 200 || data.success) {
        toast.success('Contact deleted successfully! 🗑️')
        await fetchContacts(currentPage)
        return true
      } else {
        toast.error(data.message || 'Failed to delete contact')
        return false
      }
    } catch (err) {
      console.error('Delete contact error:', err)
      toast.error('Error deleting contact')
      return false
    }
  }

  // Modal Handlers
  const openAddModal = () => {
    setEditingContact(null)
    setFormData({
      name: '',
      phone: '',
      message: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      phone: contact.phone,
      message: contact.message
    })
    setIsModalOpen(true)
  }

  const openContactPopup = (contact: Contact) => {
    setSelectedContact(contact)
    setIsPopupOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingContact(null)
  }

  const closePopup = () => {
    setIsPopupOpen(false)
    setSelectedContact(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required')
      setIsSubmitting(false)
      return
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required')
      setIsSubmitting(false)
      return
    }
    if (!formData.message.trim()) {
      toast.error('Message is required')
      setIsSubmitting(false)
      return
    }

    let success = false
    
    if (editingContact) {
      success = await updateContact(editingContact.id, formData)
    } else {
      success = await createContact(formData)
    }

    setIsSubmitting(false)
    
    if (success) {
      toast.success(
        editingContact ? 'Contact updated successfully! ✨' : 'Contact created successfully! 🎉'
      )
      await fetchContacts(currentPage)
      closeModal()
    }
  }

  // Filtering
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <Layout>
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="light"
        />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Contact Us Management
            </h1>
            <p className="text-gray-600 text-lg">
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search contacts..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full bg-white border-2 border-gray-300 text-gray-800 pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
              />
            </div>
            
            {/* Add Button */}
           
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-6 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-4">Message/Email</div>
            <div className="col-span-2">Created Date</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          {/* Table Body */}
          {filteredContacts.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <FiSearch size={64} className="mb-4 text-gray-300" />
                <p className="text-2xl mb-2 font-light text-gray-400">No contacts found</p>
                <p className="text-gray-400">Try adjusting your search or add a new contact</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="grid grid-cols-12 gap-4 p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-800">{contact.name}</span>
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-2 text-gray-600">
                    <FiPhone size={16} />
                    {contact.phone}
                  </div>
                  
                  <div className="col-span-4 flex items-center gap-2 text-gray-600">
                    <FiMail size={16} />
                    <span className="truncate" title={contact.message}>
                      {contact.message}
                    </span>
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-2 text-gray-500 text-sm">
                    <FiCalendar size={16} />
                    {new Date(contact.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="col-span-1 flex items-center justify-center gap-2">
                    <button
                      onClick={() => openContactPopup(contact)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
                      title="View Details"
                    >
                      <FiEye size={16} />
                    </button>
                  
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
                      title="Delete Contact"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => fetchContacts(currentPage - 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700">
              Page {currentPage} of {lastPage}
            </span>
            <button
              disabled={currentPage === lastPage}
              onClick={() => fetchContacts(currentPage + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              Next
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          title={editingContact ? 'Edit Contact' : 'Add New Contact'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-gray-800 mb-2 text-lg font-semibold">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-800 mb-2 text-lg font-semibold">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="w-full bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500"
                required
              />
            </div>

            {/* Message/Email */}
            <div>
              <label className="block text-gray-800 mb-2 text-lg font-semibold">Message/Email *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter message or email address"
                rows={4}
                className="w-full bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 resize-none"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {editingContact ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  editingContact ? 'Update Contact' : 'Create Contact'
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Contact Details Popup */}
        <ContactPopup 
          contact={selectedContact}
          isOpen={isPopupOpen}
          onClose={closePopup}
        />
      </div>
    </Layout>
  )
}