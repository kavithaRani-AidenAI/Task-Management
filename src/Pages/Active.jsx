import React, { useState, useEffect } from 'react';

const Active = () => {
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveEmployees();
  }, []);

  const fetchActiveEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch all employees
      const empResponse = await fetch('http://localhost:5000/api/employees');
      const employees = await empResponse.json();
      
      // Fetch all tasks
      const tasksResponse = await fetch('http://localhost:5000/api/tasks');
      const allTasks = await tasksResponse.json();
      
      // Process employees to include their tasks and check active status
      const employeesWithTasks = employees.map(employee => {
        // Get all tasks assigned to this employee
        const employeeTasks = allTasks.filter(task => 
          task.emp_code === employee.emp_code
        );
        
        // Check if all tasks are completed
        const allTasksCompleted = employeeTasks.length > 0 && 
          employeeTasks.every(task => task.status === 'Completed');
        
        return {
          ...employee,
          tasks: employeeTasks,
          isActive: allTasksCompleted
        };
      });
      
      // Filter to only show active employees
      const activeEmployeesList = employeesWithTasks.filter(emp => emp.isActive);
      
      setActiveEmployees(activeEmployeesList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch active employees. Please try again later.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading active employees...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="task-list-container">
      <h2>Active Employees</h2>
      <p style={{ marginBottom: '15px', color: '#666' }}>Employees who have completed all their tasks</p>
      
      {activeEmployees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          <p>No active employees found</p>
          <p style={{ fontSize: '0.9em', marginTop: '5px' }}>Active employees are those who have completed all their assigned tasks.</p>
        </div>
      ) : (
        <table className="task-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activeEmployees.map((employee, index) => (
              <tr key={employee.emp_code}>
                <td>{index + 1}</td>
                <td>{employee.name}</td>
                <td>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    fontSize: '0.85em',
                    fontWeight: '500',
                    display: 'inline-block',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}>
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Active;
