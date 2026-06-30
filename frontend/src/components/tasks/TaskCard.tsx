'use client';

import { Task } from '@/types';
import { Pencil, Trash2, Calendar, Flag } from 'lucide-react';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  TODO: { label: 'To Do', className: 'bg-slate-100 text-slate-600' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  DONE: { label: 'Done', className: 'bg-green-100 text-green-700' },
};

const priorityConfig = {
  LOW: { label: 'Low', className: 'text-slate-400' },
  MEDIUM: { label: 'Medium', className: 'text-amber-500' },
  HIGH: { label: 'High', className: 'text-red-500' },
};

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge ${status.className}`}>{status.label}</span>
          </div>
          <h3 className="font-semibold text-slate-800 truncate mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className={`flex items-center gap-1 text-xs font-medium ${priority.className}`}>
          <Flag className="w-3 h-3" />
          {priority.label}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="w-3 h-3" />
          {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
