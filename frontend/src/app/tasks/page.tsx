'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, SlidersHorizontal, Loader2, RefreshCw } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import TaskCard from '@/components/tasks/TaskCard';
import TaskModal from '@/components/tasks/TaskModal';
import { useTaskStore } from '@/store/taskStore';
import { getErrorMessage } from '@/lib/api';
import { Task, CreateTaskPayload } from '@/types';

export default function TasksPage() {
  const { tasks, meta, filters, isLoading, fetchTasks, createTask, updateTask, deleteTask, setFilters } =
    useTaskStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, filters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchInput, page: 1 });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, setFilters]);

  const handleCreate = useCallback(
    async (data: CreateTaskPayload) => {
      try {
        await createTask(data);
        toast.success('Task created!');
        fetchTasks();
      } catch (err) {
        toast.error(getErrorMessage(err));
        throw err;
      }
    },
    [createTask, fetchTasks]
  );

  const handleUpdate = useCallback(
    async (data: CreateTaskPayload) => {
      if (!editingTask) return;
      try {
        await updateTask(editingTask.id, data);
        toast.success('Task updated!');
        fetchTasks();
      } catch (err) {
        toast.error(getErrorMessage(err));
        throw err;
      }
    },
    [editingTask, updateTask, fetchTasks]
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <ProtectedLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {meta ? `${meta.total} task${meta.total !== 1 ? 's' : ''} total` : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-9"
            placeholder="Search tasks..."
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ status: e.target.value as Task['status'] | '', page: 1 })}
          className="input-field w-auto min-w-[130px]"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => setFilters({ priority: e.target.value as Task['priority'] | '', page: 1 })}
          className="input-field w-auto min-w-[130px]"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {/* Sort */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
          }}
          className="input-field w-auto min-w-[160px]"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
        </select>

        <button
          onClick={() => fetchTasks()}
          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20">
          <SlidersHorizontal className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No tasks found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or create a new task.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t) => { setEditingTask(t); setModalOpen(true); }}
              onDelete={(id) => setConfirmDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            disabled={!meta.hasPrevPage}
            onClick={() => setFilters({ page: filters.page! - 1 })}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            disabled={!meta.hasNextPage}
            onClick={() => setFilters({ page: filters.page! + 1 })}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSubmit={editingTask ? handleUpdate : handleCreate}
        />
      )}

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Task?</h3>
            <p className="text-slate-500 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="btn-danger flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
