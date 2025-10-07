'use client';

import React, { useState, useEffect } from 'react';
import CreateEmployeeModal from './CreateEmployeeModal';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Employee } from '@/types';
import { formatCurrency, formatDate, getRoleDisplayName } from '@/lib/utils';
import { config } from '@/lib/config';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('Fetching employees...');
      
      const token = localStorage.getItem(config.tokenKey);
      console.log('Token exists:', !!token);
      
      // For now, we'll use the users from the auth API as employees
      // In a real application, you might have a separate employees endpoint
      const response = await fetch(`${config.apiUrl}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success && result.data) {
          // Transform the user data to match Employee interface
          const transformedEmployees = result.data.map((user: any) => ({
            id: user.id,
            firstName: user.fullName.split(' ')[0] || '',
            lastName: user.fullName.split(' ').slice(1).join(' ') || '',
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            phoneNumber: 'N/A', // Field removed from backend
            department: user.department,
            position: user.position, // Now comes from backend
            role: user.role,
            salary: 50000, // Default salary since it's not in the user model
            address: user.address,
            emergencyContact: 'Not specified',
            emergencyPhone: 'Not specified',
            joiningDate: new Date(user.createdAt),
            isActive: user.isActive,
            employeeId: `EMP-${user.id.slice(-6).toUpperCase()}`
          }));
          
          console.log('Transformed employees:', transformedEmployees);
          setEmployees(transformedEmployees);
        }
      } else {
        console.error('Failed to fetch employees, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        // Use mock data as fallback
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Use mock data as fallback
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || employee.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      const response = await fetch(`${config.apiUrl}/auth/users/${employeeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(config.tokenKey)}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
        setShowDeleteConfirm(false);
        setEmployeeToDelete(null);
        console.log('Employee deleted successfully');
      } else {
        console.error('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleUpdateEmployee = async (updatedData: any) => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(`${config.apiUrl}/auth/users/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(config.tokenKey)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Update the employee in the local state
          setEmployees(prev => prev.map(emp => 
            emp.id === selectedEmployee.id 
              ? {
                  ...emp,
                  firstName: result.data.fullName.split(' ')[0] || '',
                  lastName: result.data.fullName.split(' ').slice(1).join(' ') || '',
                  fullName: result.data.fullName,
                  email: result.data.email,
                  username: result.data.username,
                  department: result.data.department,
                  position: result.data.position,
                  role: result.data.role,
                  address: result.data.address,
                  isActive: result.data.isActive
                }
              : emp
          ));
          setShowEditModal(false);
          setSelectedEmployee(null);
          console.log('Employee updated successfully');
        }
      } else {
        console.error('Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeactivateEmployee = async (employeeId: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/auth/users/${employeeId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(config.tokenKey)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (response.ok) {
        setEmployees(prev => prev.map(emp => 
          emp.id === employeeId ? { ...emp, isActive: false } : emp
        ));
      } else {
        console.error('Failed to deactivate employee');
      }
    } catch (error) {
      console.error('Error deactivating employee:', error);
    }
  };

  const handleActivateEmployee = async (employeeId: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/auth/users/${employeeId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(config.tokenKey)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: true }),
      });

      if (response.ok) {
        setEmployees(prev => prev.map(emp => 
          emp.id === employeeId ? { ...emp, isActive: true } : emp
        ));
      } else {
        console.error('Failed to activate employee');
      }
    } catch (error) {
      console.error('Error activating employee:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their access</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              <p className="text-gray-600">Total Employees</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(emp => emp.isActive).length}
              </p>
              <p className="text-gray-600">Active</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(emp => !emp.isActive).length}
              </p>
              <p className="text-gray-600">Inactive</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(employees.reduce((sum, emp) => sum + emp.salary, 0))}
              </p>
              <p className="text-gray-600">Total Payroll</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
              />
            </div>
          </div>
          
          <div className="sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Administrator</option>
                <option value="MANAGERIAL">Managerial</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="SALES_REPRESENTATIVE">Sales Representative</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Employees ({filteredEmployees.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total loaded: {employees.length} | Filtered: {filteredEmployees.length} | Loading: {loading ? 'Yes' : 'No'}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{employee.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getRoleDisplayName(employee.role)}</div>
                    <div className="text-sm text-gray-500">{employee.department}</div>
                    <div className="text-sm text-gray-500">{employee.position}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {employee.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {employee.phoneNumber}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(employee.salary)}</div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(employee.joiningDate)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Employee"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Employee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      {employee.isActive ? (
                        <button
                          onClick={() => handleDeactivateEmployee(employee.id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Deactivate Employee"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateEmployee(employee.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Activate Employee"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading employees...</p>
            </div>
          )}
          
          {!loading && filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or add a new employee.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Employee Details Modal (simplified for now) */}
      {showEmployeeDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Employee Details</h2>
                <button
                  onClick={() => setShowEmployeeDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployee.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployee.lastName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmployee.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmployee.phoneNumber}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployee.position}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmployee.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployee.emergencyContact}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployee.emergencyPhone}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEmployeeDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Edit Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && employeeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEmployeeToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{employeeToDelete.fullName}</strong>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEmployeeToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEmployee}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <CreateEmployeeModal 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          onSuccess={(updatedData) => {
            handleUpdateEmployee(updatedData);
          }}
          editMode={true}
          initialData={{
            fullName: selectedEmployee.fullName,
            email: selectedEmployee.email,
            username: selectedEmployee.username,
            address: selectedEmployee.address,
            department: selectedEmployee.department,
            position: selectedEmployee.position,
            role: selectedEmployee.role
          }}
        />
      )}

      {/* Create Employee Modal */}
      <CreateEmployeeModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchEmployees(); // Refresh the employee list
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}



