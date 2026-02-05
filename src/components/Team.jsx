import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';

// QueryClient Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Mock Database
const database = {
  employees: [
    { id: 1, name: 'Ravi Kumar', email: 'ravi@company.com', department: 'IT', salary: 50000, status: 'Active' },
    { id: 2, name: 'Priya Sharma', email: 'priya@company.com', department: 'HR', salary: 45000, status: 'Active' },
    { id: 3, name: 'Arjun Reddy', email: 'arjun@company.com', department: 'Sales', salary: 55000, status: 'Active' },
    { id: 4, name: 'Sneha Patel', email: 'sneha@company.com', department: 'IT', salary: 52000, status: 'Active' },
    { id: 5, name: 'Karthik Rao', email: 'karthik@company.com', department: 'Finance', salary: 48000, status: 'Inactive' },
    { id: 6, name: 'Meera Shah', email: 'meera@company.com', department: 'IT', salary: 60000, status: 'Active' },
    { id: 7, name: 'Vijay Singh', email: 'vijay@company.com', department: 'Sales', salary: 47000, status: 'Active' },
    { id: 8, name: 'Divya Iyer', email: 'divya@company.com', department: 'HR', salary: 46000, status: 'Active' },
    { id: 9, name: 'Rahul Verma', email: 'rahul@company.com', department: 'IT', salary: 58000, status: 'Active' },
    { id: 10, name: 'Anjali Nair', email: 'anjali@company.com', department: 'Finance', salary: 51000, status: 'Active' },
  ],

  getEmployees: async ({ search = '', department = '', page = 1, limit = 5, sortBy = 'id', sortOrder = 'asc' }) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    let filtered = [...database.employees];

    if (search) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.department.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (department) {
      filtered = filtered.filter(emp => emp.department === department);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === 'asc' 
          ? aVal - bVal
          : bVal - aVal;
      }
    });

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      employees: paginated,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  },

  getEmployee: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const employee = database.employees.find(emp => emp.id === parseInt(id));
    if (!employee) throw new Error('Employee not found');
    return employee;
  },

  createEmployee: async (newEmployee) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const employee = {
      id: Math.max(...database.employees.map(e => e.id)) + 1,
      ...newEmployee,
      status: 'Active',
    };
    database.employees.push(employee);
    return employee;
  },

  updateEmployee: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = database.employees.findIndex(emp => emp.id === id);
    if (index === -1) throw new Error('Employee not found');
    database.employees[index] = { ...database.employees[index], ...updates };
    return database.employees[index];
  },

  deleteEmployee: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = database.employees.findIndex(emp => emp.id === id);
    if (index === -1) throw new Error('Employee not found');
    const deleted = database.employees.splice(index, 1);
    return deleted[0];
  },

  bulkDelete: async (ids) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    database.employees = database.employees.filter(emp => !ids.includes(emp.id));
    return { deleted: ids.length };
  },
};

// Employee Table Component
function EmployeeTable() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['employees', { search, department, page, sortBy, sortOrder }],
    queryFn: () => database.getEmployees({ search, department, page, limit: 5, sortBy, sortOrder }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => database.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      alert('✅ Employee deleted successfully!');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => database.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setSelectedIds([]);
      alert('✅ Selected employees deleted!');
    },
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(data?.employees.map(emp => emp.id) || []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      alert('Please select employees to delete');
      return;
    }
    if (confirm(`Delete ${selectedIds.length} selected employees?`)) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getDepartmentBadgeClass = (dept) => {
    const classes = {
      IT: 'bg-blue-100 text-blue-800',
      HR: 'bg-pink-100 text-pink-800',
      Sales: 'bg-green-100 text-green-800',
      Finance: 'bg-yellow-100 text-yellow-800',
    };
    return classes[dept] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Employee Management System</h2>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, department..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 min-w-[250px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
        />

        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="">All Departments</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
          <option value="Finance">Finance</option>
        </select>

        <button
          onClick={() => setEditingId('new')}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all shadow-md"
        >
           Add Employee
        </button>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isLoading}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
             Delete Selected ({selectedIds.length})
          </button>
        )}

        <button
          onClick={() => refetch()}
          className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
        >
         Refresh
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-purple-600 font-semibold">Loading employees...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
          ❌ Error: {error.message}
        </div>
      )}

      {/* Table */}
      {!isLoading && data && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-purple-500 to-indigo-600">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === data.employees.length && data.employees.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </th>
                  <th
                    onClick={() => handleSort('id')}
                    className="px-6 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10 select-none"
                  >
                    ID {getSortIcon('id')}
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10 select-none"
                  >
                    Name {getSortIcon('name')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Email
                  </th>
                  <th
                    onClick={() => handleSort('department')}
                    className="px-6 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10 select-none"
                  >
                    Department {getSortIcon('department')}
                  </th>
                  <th
                    onClick={() => handleSort('salary')}
                    className="px-6 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10 select-none"
                  >
                    Salary {getSortIcon('salary')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 text-lg">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  data.employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedIds.includes(emp.id) ? 'bg-purple-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(emp.id)}
                          onChange={() => handleSelectOne(emp.id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{emp.id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{emp.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getDepartmentBadgeClass(emp.department)}`}>
                          {emp.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ₹{emp.salary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            emp.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(emp.id)}
                            className="py-2 px-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            &#128393;
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            disabled={deleteMutation.isLoading}
                            className="py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            &#128465;
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="text-sm text-gray-600">
              Showing {data.employees.length} of {data.total} employees
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                 Previous
              </button>
              <span className="text-sm font-semibold text-purple-600">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit/Add Modal */}
      {editingId && (
        <EmployeeForm
          employeeId={editingId === 'new' ? null : editingId}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}

// Employee Form Component
function EmployeeForm({ employeeId, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'IT',
    salary: '',
  });

  const isEdit = employeeId !== null;

  const { data: employee, isLoading: fetchLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => database.getEmployee(employeeId),
    enabled: isEdit,
    onSuccess: (data) => {
      setFormData({
        name: data.name,
        email: data.email,
        department: data.department,
        salary: data.salary,
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => database.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      alert('✅ Employee created successfully!');
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => database.updateEmployee(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      alert('✅ Employee updated successfully!');
      onClose();
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.salary) {
      alert('Please fill all fields!');
      return;
    }

    const data = {
      ...formData,
      salary: parseFloat(formData.salary),
    };

    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  if (fetchLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-xl p-8" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading employee data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? '✏️ Edit Employee' : ' Add New Employee'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter employee name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="employee@company.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all cursor-pointer"
              required
            >
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Salary (₹) *
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="50000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              min="0"
              step="1000"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all shadow-md"
            >
              {isSubmitting ? '⏳ Saving...' : isEdit ? '💾 Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main App Component
function MainApp() {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Table */}
        <EmployeeTable />
      </div>
    </div>
  );
}

// Root Component
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}