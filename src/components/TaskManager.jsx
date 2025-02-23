import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const API_URL = 'https://task-manager-bn-e4t4.onrender.com/tasks';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Pending'
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        taskId: null,
    });

    const handleInputBlur = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            setError('Failed to load tasks. Please try again later.');
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const url = currentTask ? `${API_URL}/${currentTask._id}` : API_URL;
            const method = currentTask ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save task');

            setIsModalOpen(false);
            setCurrentTask(null);
            setFormData({ title: '', description: '', priority: 'Medium', status: 'Pending' });
            fetchTasks();
        } catch (err) {
            setError('Failed to save task. Please try again.');
            console.error('Error saving task:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleteConfirmation({ isOpen: true, taskId: id });
    };

    const confirmDelete = async () => {
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${deleteConfirmation.taskId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete task');
            fetchTasks();
        } catch (err) {
            setError('Failed to delete task. Please try again.');
            console.error('Error deleting task:', err);
        } finally {
            setDeleteConfirmation({ isOpen: false, taskId: null });
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, taskId: null });
    };

    const getPriorityStyles = (priority) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
        switch (priority) {
            case 'High': return `${baseClasses} bg-red-100 text-red-800`;
            case 'Medium': return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'Low': return `${baseClasses} bg-green-100 text-green-800`;
            default: return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const getStatusStyles = (status) => {
        return `${status === 'Completed' ?
            'bg-green-100 text-green-800' :
            'bg-yellow-100 text-yellow-800'} px-3 py-1 rounded-full text-xs font-semibold`;
    };

    const Modal = ({ children }) => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                {children}
            </div>
        </div>
    );

    const DeleteConfirmationModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <h2 className="text-xl font-bold mb-4">Delete Task</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={cancelDelete}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={confirmDelete}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
                    <Button
                        onClick={() => {
                            setCurrentTask(null);
                            setFormData({ title: '', description: '', priority: 'Medium', status: 'Pending' });
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Task
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <div className="text-sm font-medium">{error}</div>
                    </Alert>
                )}

                {loading && <div className="text-center py-4">Loading...</div>}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <Card key={task._id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-semibold line-clamp-1">{task.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(task.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setCurrentTask(task);
                                                setFormData(task);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(task._id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18"></path>
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 mb-4 line-clamp-3">{task.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className={getPriorityStyles(task.priority)}>
                                            {task.priority}
                                        </span>
                                        <span className={getStatusStyles(task.status)}>
                                            {task.status}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed">
                            <p className="text-gray-500">No tasks found. Click "Add Task" to create one.</p>
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <Modal>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{currentTask ? 'Edit Task' : 'Add New Task'}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <Input
                                    type="text"
                                    name="title"
                                    defaultValue={formData.title}
                                    onBlur={handleInputBlur}
                                    className="w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <Textarea
                                    name="description"
                                    defaultValue={formData.description}
                                    onBlur={handleInputBlur}
                                    className="w-full"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    name="priority"
                                    defaultValue={formData.priority}
                                    onBlur={handleInputBlur}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    defaultValue={formData.status}
                                    onBlur={handleInputBlur}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                    {currentTask ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {deleteConfirmation.isOpen && <DeleteConfirmationModal />}
            </div>
        </div>
    );
};

export default TaskManager;