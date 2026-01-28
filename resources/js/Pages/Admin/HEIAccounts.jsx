import React, { useState, useMemo } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import ConfirmationModal from '../../Components/Common/ConfirmationModal';
import { AGGridViewer } from '@/Components/Common';
import { useForm } from '@inertiajs/react';
import { IoEye, IoEyeOff, IoPencil, IoTrash } from 'react-icons/io5';
import AddressSearchInput from '../../Components/Forms/AddressSearchInput';
import IconButton from '../../Components/Common/IconButton';
import StatusBadge from '../../Components/Widgets/StatusBadge';

const HEIAccounts = ({ heis = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingHEI, setEditingHEI] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    uii: '',
    name: '',
    type: '',
    code: '',
    email: '',
    address: '',
    established_at: '2000-01-01',
    password: '',
    password_confirmation: '',
    is_active: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode && editingHEI) {
      put(`/admin/heis/${editingHEI.id}`, {
        onSuccess: () => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingHEI(null);
          reset();
        },
      });
    } else {
      post('/admin/heis', {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
      });
    }
  };

  const handleEdit = (hei) => {
    setEditingHEI(hei);
    setIsEditMode(true);
    setData({
      uii: hei.uii,
      name: hei.name,
      type: hei.type,
      code: hei.code,
      email: hei.email,
      address: hei.address || '',
      established_at: hei.established_at || '2000-01-01',
      password: '',
      password_confirmation: '',
      is_active: hei.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    destroy(`/admin/heis/${deleteConfirm.id}`, {
      onSuccess: () => {
        setDeleteConfirm(null);
      },
    });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingHEI(null);
    reset();
    setIsModalOpen(true);
  };

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'UII',
      field: 'uii',
      width: 120,
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: '500' },
    },
    {
      headerName: 'Institution Name',
      field: 'name',
      width: 350,
      filter: 'agTextColumnFilter',
      flex: 1,
    },
    {
      headerName: 'Type',
      field: 'type',
      width: 120,
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'HEI Code',
      field: 'code',
      width: 130,
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Email',
      field: 'email',
      width: 280,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Status',
      field: 'is_active',
      width: 120,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        const isActive = params.value;
        return (
          <StatusBadge 
            color={isActive ? 'green' : 'red'}
            label={isActive ? 'Active' : 'Inactive'}
          />
        );
      },
      cellStyle: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      },
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 140,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const hei = params.data;
        
        return (
          <div className="flex items-center justify-center gap-1.5 h-full">
            <IconButton
              data-action="edit"
              data-hei-id={hei.id}
              variant="blue"
              title="Edit HEI"
            >
              <IoPencil size={16} />
            </IconButton>
            <IconButton
              data-action="delete"
              data-hei-id={hei.id}
              variant="red"
              title="Delete HEI"
            >
              <IoTrash size={16} />
            </IconButton>
          </div>
        );
      },
    },
  ], []);

  // Handle button clicks in AG Grid
  const onCellClicked = (params) => {
    const target = params.event.target;
    const button = target.closest('button');
    
    if (!button) return;
    
    const action = button.getAttribute('data-action');
    const heiId = button.getAttribute('data-hei-id');
    
    if (!action || !heiId) return;
    
    const hei = heis.find(h => h.id === parseInt(heiId));
    
    if (action === 'edit') {
      handleEdit(hei);
    } else if (action === 'delete') {
      setDeleteConfirm(hei);
    }
  };

  return (
    <AdminLayout title="HEI Accounts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              HEI Account Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage all Higher Education Institution accounts
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Add New HEI
          </button>
        </div>

        {/* AG Grid Viewer */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <AGGridViewer
            rowData={heis}
            columnDefs={columnDefs}
            height="calc(100vh - 280px)"
            paginationPageSize={50}
            paginationPageSizeSelector={[25, 50, 100, 200]}
            enableQuickFilter={true}
            quickFilterPlaceholder="Search HEIs by name, code, email, type..."
            gridOptions={{
              onCellClicked: onCellClicked,
            }}
          />
        </div>

        {/* Add/Edit HEI Modal */}
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
                        {isEditMode ? 'Edit HEI Account' : 'Add New HEI Account'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            UII
                          </label>
                          <input
                            type="text"
                            value={data.uii}
                            onChange={(e) => {
                              const value = e.target.value.slice(0, 6);
                              setData('uii', value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="09001a"
                            maxLength="8"
                            required
                          />
                          {errors.uii && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.uii}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name of HEI
                          </label>
                          <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Type
                          </label>
                          <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="Private">Private</option>
                            <option value="SUC">SUC</option>
                            <option value="LUC">LUC</option>
                          </select>
                          {errors.type && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            HEI Code
                          </label>
                          <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          />
                          {errors.code && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Established Date
                          </label>
                          <input
                            type="date"
                            value={data.established_at}
                            onChange={(e) => setData('established_at', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                          {errors.established_at && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.established_at}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Address
                          </label>
                          <AddressSearchInput
                            value={data.address}
                            onChange={(value) => setData('address', value)}
                            error={errors.address}
                          />
                        </div>

                        {isEditMode && (
                          <div className="md:col-span-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Active
                              </span>
                            </label>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={data.password}
                              onChange={(e) => setData('password', e.target.value)}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder={isEditMode ? "Leave blank to keep current password" : "password"}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
                            >
                              {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {isEditMode
                              ? "If left blank, current password will be kept"
                              : "If left blank, it'll default to \"password\""}
                          </p>
                          {errors.password && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={data.password_confirmation}
                              onChange={(e) => setData('password_confirmation', e.target.value)}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder={isEditMode ? "Leave blank to keep current password" : "Confirm password"}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
                            >
                              {showConfirmPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                            </button>
                          </div>
                          {errors.password_confirmation && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {processing ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update HEI' : 'Create HEI')}
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
          title="Delete HEI Account"
          message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will also delete all associated user accounts. This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          processing={processing}
        />
      </div>
    </AdminLayout>
  );
};

export default HEIAccounts;
