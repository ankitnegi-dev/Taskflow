'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { CheckSquare, Clock, TrendingUp, ListTodo } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!fetched) {
      fetchTasks();
      setFetched(true);
    }
  }, [fetchTasks, fetched]);

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  };

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-l-blue-500',
    },
    {
      label: 'To Do',
      value: stats.todo,
      icon: Clock,
      color: 'bg-slate-50 text-slate-600',
      border: 'border-l-slate-400',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
      border: 'border-l-amber-500',
    },
    {
      label: 'Completed',
      value: stats.done,
      icon: CheckSquare,
      color: 'bg-green-50 text-green-600',
      border: 'border-l-green-500',
    },
  ];

  return (
    <ProtectedLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your tasks today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`card p-5 border-l-4 ${border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Recent Tasks</h2>
          <a href="/tasks" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </a>
        </div>
        {tasks.length === 0 ? (
          <div className="text-center py-10">
            <CheckSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No tasks yet. Create your first task!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.status === 'DONE'
                        ? 'bg-green-500'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-blue-500'
                        : 'bg-slate-300'
                    }`}
                  />
                  <span className="text-sm font-medium text-slate-700">{task.title}</span>
                </div>
                <span
                  className={`badge text-xs ${
                    task.priority === 'HIGH'
                      ? 'bg-red-100 text-red-600'
                      : task.priority === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
