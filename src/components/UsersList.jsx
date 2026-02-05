import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Mock API - Real API laga work chestundi
const mockAPI = {
  users: [
    { id: 1, name: 'Ravi Kumar', email: 'ravi@example.com', role: 'Developer' },
    { id: 2, name: 'Priya Sharma', email: 'priya@example.com', role: 'Designer' },
    { id: 3, name: 'Arjun Reddy', email: 'arjun@example.com', role: 'Manager' },
    { id: 4, name: 'Sneha Patel', email: 'sneha@example.com', role: 'Developer' },
    { id: 5, name: 'Karthik Rao', email: 'karthik@example.com', role: 'Tester' },
  ],
  
  getUsers: async (page = 1, limit = 3) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Network delay simulate
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      users: mockAPI.users.slice(start, end),
      hasMore: end < mockAPI.users.length,
      total: mockAPI.users.length,
      page,
    };
  },

  getUserById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockAPI.users.find(u => u.id === parseInt(id));
    if (!user) throw new Error('User not found');
    return user;
  },

  createUser: async (newUser) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = {
      id: Math.max(...mockAPI.users.map(u => u.id)) + 1,
      ...newUser,
    };
    mockAPI.users.push(user);
    return user;
  },

  updateUser: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockAPI.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    mockAPI.users[index] = { ...mockAPI.users[index], ...updates };
    return mockAPI.users[index];
  },

  deleteUser: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAPI.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    mockAPI.users.splice(index, 1);
    return { success: true };
  },

  searchUsers: async (query) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockAPI.users.filter(u => 
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    );
  },
};

// QueryClient Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// 1. Simple Users List Component
function UsersList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await mockAPI.getUsers(1, 10);
      return result.users;
    },
  });

  if (isLoading) return <div className="loading">⏳ Loading users...</div>;
  if (error) return <div className="error">❌ Error: {error.message}</div>;

  return (
    <div className="section">
      <h2>All Users</h2>
      <button onClick={() => refetch()} className="btn-secondary">Refresh</button>
      <div className="users-grid">
        {data?.map(user => (
          <div key={user.id} className="user-card">
            <h3>{user.name}</h3>
            <p>📧 {user.email}</p>
            <span className="badge">{user.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Add User Component with Mutation
function AddUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');

  const mutation = useMutation({
    mutationFn: (newUser) => mockAPI.createUser(newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setName('');
      setEmail('');
      alert('✅ User created successfully!');
    },
    onError: (error) => {
      alert('❌ Error: ' + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Please fill all fields!');
      return;
    }
    mutation.mutate({ name, email, role });
  };

  return (
    <div className="section mt-5">
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
          <option>Developer</option>
          <option>Designer</option>
          <option>Manager</option>
          <option>Tester</option>
        </select>
        <button type="submit" disabled={mutation.isLoading} className="btn-primary">
          {mutation.isLoading ? '⏳ Creating...' : 'Create User'}
        </button>
      </form>
      {mutation.isSuccess && <div className="success">✅ User added!</div>}
    </div>
  );
}

// 3. Edit User Component
function EditUser({ userId, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => mockAPI.getUserById(userId),
    enabled: !!userId,
    onSuccess: (data) => {
      setName(data.name);
      setEmail(data.email);
      setRole(data.role);
    },
  });

  const mutation = useMutation({
    mutationFn: (updates) => mockAPI.updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      alert('✅ User updated!');
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name, email, role });
  };

  if (isLoading) return <div className="loading">Loading user data...</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>✏️ Edit User</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
            <option>Developer</option>
            <option>Designer</option>
            <option>Manager</option>
            <option>Tester</option>
          </select>
          <div className="button-group">
            <button type="submit" disabled={mutation.isLoading} className="btn-primary">
              {mutation.isLoading ? 'Updating...' : 'Update'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. Delete User with Optimistic Update
function UserWithDelete({ user }) {
  const mutation = useMutation({
    mutationFn: (id) => mockAPI.deleteUser(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData(['users']);
      
      // Optimistic update
      queryClient.setQueryData(['users'], (old) => 
        old?.filter(u => u.id !== deletedId)
      );
      
      return { previousUsers };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(['users'], context.previousUsers);
      alert('Error deleting user!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span className="badge">{user.role}</span>
      <button 
        onClick={() => {
          if (confirm(`Delete ${user.name}?`)) {
            mutation.mutate(user.id);
          }
        }}
        className="btn-danger"
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? '⏳' : '🗑️'} Delete
      </button>
    </div>
  );
}

// 5. Paginated Users
function PaginatedUsers() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isPreviousData } = useQuery({
    queryKey: ['users-paginated', page],
    queryFn: () => mockAPI.getUsers(page, 2),
    keepPreviousData: true,
  });

  return (
    <div className="section">
      <h2>Paginated Users</h2>
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="users-grid">
            {data?.users.map(user => (
              <div key={user.id} className="user-card">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button
              onClick={() => setPage(old => Math.max(old - 1, 1))}
              disabled={page === 1}
              className="btn-secondary"
            >
              ⬅️ Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage(old => old + 1)}
              disabled={isPreviousData || !data?.hasMore}
              className="btn-secondary"
            >
              Next ➡️
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// 6. Search Users
function SearchUsers() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users-search', searchQuery],
    queryFn: () => mockAPI.searchUsers(searchQuery),
    enabled: searchQuery.length > 0,
  });

  return (
    <div className="section mb-5">
      <h2>Search Users</h2>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
      />
      {isLoading && <div className="loading">Searching...</div>}
      {data && (
        <div className="users-grid">
          {data.length === 0 ? (
            <p>No users found</p>
          ) : (
            data.map(user => (
              <div key={user.id} className="user-card">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Main App Component
function MainApp() {
  const [showUsers, setShowUsers] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);

  return (
    <div className="app">
      <div className="container">
        <AddUser />
        
        <div className="tabs">
          <button onClick={() => setShowUsers(true)} className={showUsers ? 'tab-active' : 'tab'}>
            All Users
          </button>
          <button onClick={() => setShowUsers(false)} className={!showUsers ? 'tab-active' : 'tab'}>
            Paginated
          </button>
        </div>

        {showUsers ? <UsersList /> : <PaginatedUsers />}
        
        <SearchUsers />
        
        {editingUserId && (
          <EditUser userId={editingUserId} onClose={() => setEditingUserId(null)} />
        )}
      </div>
    </div>
  );
}

// Root Component
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
      <ReactQueryDevtools initialIsOpen={false} />
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          // padding: 20px;
        }

        .app {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          background: white;
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .header h1 {
          color: #667eea;
          margin-bottom: 10px;
        }

        .header p {
          color: #666;
        }

        .container {
          display: grid;
          gap: 20px;
        }

        .section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .section h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .form {
          display: grid;
          gap: 15px;
        }

        .input {
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          margin-top: 10px;
        }

        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .user-card {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }

        .user-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }

        .user-card h3 {
          color: #333;
          margin-bottom: 8px;
          font-size: 1.2rem;
        }

        .user-card p {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 10px;
        }

        .badge {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 1.2rem;
          color: #667eea;
        }

        .error {
          background: #fee;
          color: #c33;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #c33;
        }

        .success {
          background: #efe;
          color: #3c3;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #3c3;
          margin-top: 15px;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .tab {
          padding: 10px 20px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tab-active {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 15px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .users-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </QueryClientProvider>
  );
}