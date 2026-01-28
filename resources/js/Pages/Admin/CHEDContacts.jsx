import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { IoCall, IoMail, IoLocation, IoPencilOutline, IoTrashOutline, IoAdd, IoArrowUp, IoArrowDown, IoCheckmarkCircle } from 'react-icons/io5';
import AGGridViewer from '../../Components/Common/AGGridViewer';
import IconButton from '../../Components/Common/IconButton';
import StatusBadge from '../../Components/Widgets/StatusBadge';
import ConfirmationModal from '../../Components/Common/ConfirmationModal';
import AddressSearchInput from '../../Components/Forms/AddressSearchInput';
import axios from 'axios';

const CHEDContacts = ({ contacts = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [localContacts, setLocalContacts] = useState([...contacts].sort((a, b) => a.order - b.order));
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Sync local state when contacts prop changes (after add/edit/delete)
  useEffect(() => {
    if (!hasOrderChanges) {
      setLocalContacts([...contacts].sort((a, b) => a.order - b.order));
    }
  }, [contacts, hasOrderChanges]);

  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    name: '',
    address: '',
    phone: '',
    email: '',
    is_active: true,
  });

  const sortedContacts = [...localContacts].sort((a, b) => a.order - b.order);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode && editingContact) {
      put(`/admin/ched-contacts/${editingContact.id}`, {
        onSuccess: () => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingContact(null);
          reset();
        },
      });
    } else {
      post('/admin/ched-contacts', {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
      });
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setIsEditMode(true);
    setData({
      name: contact.name,
      address: contact.address || '',
      phone: contact.phone || '',
      email: contact.email || '',
      is_active: contact.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    destroy(`/admin/ched-contacts/${deleteConfirm.id}`, {
      onSuccess: () => {
        setDeleteConfirm(null);
      },
    });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingContact(null);
    reset();
    setIsModalOpen(true);
  };

  const moveContact = (contactId, direction) => {
    const sortedContacts = [...localContacts].sort((a, b) => a.order - b.order);
    const currentIndex = sortedContacts.findIndex(c => c.id === contactId);
    
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sortedContacts.length) return;

    // Swap the contacts
    [sortedContacts[currentIndex], sortedContacts[targetIndex]] = 
      [sortedContacts[targetIndex], sortedContacts[currentIndex]];

    // Update order values based on new position
    const reorderedContacts = sortedContacts.map((contact, idx) => ({
      ...contact,
      order: idx + 1
    }));

    setLocalContacts(reorderedContacts);
    setHasOrderChanges(true);
  };

  const saveOrderChanges = async () => {
    setSavingOrder(true);
    try {
      const reorderedContacts = localContacts.map(contact => ({
        id: contact.id,
        order: contact.order
      }));

      await axios.post('/admin/ched-contacts/reorder', {
        contacts: reorderedContacts
      });

      setHasOrderChanges(false);
      router.reload({ only: ['contacts'] });
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order changes. Please try again.');
    } finally {
      setSavingOrder(false);
    }
  };

  const cancelOrderChanges = () => {
    setLocalContacts([...contacts].sort((a, b) => a.order - b.order));
    setHasOrderChanges(false);
  };

  const columnDefs = [
    {
      field: 'reorder',
      headerName: 'Reorder',
      width: 120,
      pinned: 'left',
      sortable: false,
      filter: false,
      cellClass: 'text-center',
      cellRenderer: (params) => {
        const row = params.data;
        const sortedContacts = [...localContacts].sort((a, b) => a.order - b.order);
        const currentIndex = sortedContacts.findIndex(c => c.id === row.id);
        const isFirst = currentIndex === 0;
        const isLast = currentIndex === sortedContacts.length - 1;
        
        return (
          <div className="flex items-center justify-center gap-1">
            <IconButton
              variant="blue"
              onClick={() => moveContact(row.id, 'up')}
              disabled={isFirst}
              title="Move up"
            >
              <IoArrowUp size={16} />
            </IconButton>
            <IconButton
              variant="blue"
              onClick={() => moveContact(row.id, 'down')}
              disabled={isLast}
              title="Move down"
            >
              <IoArrowDown size={16} />
            </IconButton>
          </div>
        );
      }
    },
    {
      field: 'order',
      headerName: 'Order',
      width: 100,
      cellClass: 'text-center',
      cellRenderer: (params) => (
        <div className="flex justify-center">
          <span className="font-medium text-gray-900 dark:text-white">{params.value}</span>
        </div>
      )
    },
    {
      field: 'name',
      headerName: 'Office Name',
      flex: 1,
      minWidth: 200,
      cellRenderer: (params) => (
        <span className="font-medium text-gray-900 dark:text-white">{params.value}</span>
      )
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1,
      minWidth: 250,
      cellRenderer: (params) => (
        <span className="text-gray-600 dark:text-gray-400">{params.value || 'N/A'}</span>
      )
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      cellRenderer: (params) => (
        <span className="text-gray-600 dark:text-gray-400">{params.value || 'N/A'}</span>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      cellRenderer: (params) => (
        <span className="text-gray-600 dark:text-gray-400">{params.value || 'N/A'}</span>
      )
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 120,
      cellClass: 'text-center',
      cellRenderer: (params) => (
        <div className="flex justify-center">
          <StatusBadge
            color={params.value ? 'green' : 'red'}
            label={params.value ? 'Active' : 'Inactive'}
          />
        </div>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellClass: 'text-center',
      cellRenderer: (params) => {
        const row = params.data;
        return (
          <div className="flex items-center justify-center gap-2">
            <IconButton
              variant="blue"
              onClick={() => handleEdit(row)}
              title="Edit Contact"
            >
              <IoPencilOutline size={18} />
            </IconButton>
            <IconButton
              variant="red"
              onClick={() => setDeleteConfirm(row)}
              title="Delete Contact"
            >
              <IoTrashOutline size={18} />
            </IconButton>
          </div>
        );
      }
    }
  ];

  return (
    <AdminLayout title="CHED Contacts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              CHED Contact Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage CHED contact information displayed to HEI users
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <IoAdd size={20} />
            Add New Contact
          </button>
        </div>

        {/* Order Change Actions */}
        {hasOrderChanges && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IoCheckmarkCircle className="text-blue-600 dark:text-blue-400" size={20} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  You have unsaved order changes
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={cancelOrderChanges}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveOrderChanges}
                  disabled={savingOrder}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {savingOrder ? 'Saving...' : 'Save Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        <AGGridViewer
          rowData={sortedContacts}
          columnDefs={columnDefs}
          height="700px"
          quickFilterPlaceholder="Search by name, email, or phone..."
          paginationPageSize={25}
          paginationPageSizeSelector={[25, 50, 100]}
        />

        {/* Add/Edit Contact Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
                onClick={() => setIsModalOpen(false)}
              ></div>

              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {isEditMode ? 'Edit CHED Contact' : 'Add New CHED Contact'}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <IoCall className="text-gray-400" />
                            Office Name *
                          </label>
                          <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., CHED Regional Office IX"
                            required
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <IoLocation className="text-gray-400" />
                            Address
                          </label>
                          <AddressSearchInput
                            value={data.address}
                            onChange={(value) => setData('address', value)}
                            error={errors.address}
                            placeholder="Start typing to search for an address..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <IoCall className="text-gray-400" />
                              Phone Number
                            </label>
                            <input
                              type="text"
                              value={data.phone}
                              onChange={(e) => setData('phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder="(082) 123-4567"
                            />
                            {errors.phone && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                            )}
                          </div>

                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <IoMail className="text-gray-400" />
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={data.email}
                              onChange={(e) => setData('email', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder="region9@ched.gov.ph"
                            />
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                            )}
                          </div>
                        </div>

                        {isEditMode && (
                          <div>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Active (visible to HEI users)
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {processing ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Contact' : 'Create Contact')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete CHED Contact"
          message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          processing={processing}
        />
      </div>
    </AdminLayout>
  );
};

export default CHEDContacts;
