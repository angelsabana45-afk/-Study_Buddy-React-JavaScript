import React from "react";
import { useEffect, useMemo, useState } from 'react';
import {

  BookOpen, CalendarDays, CheckCircle2, Circle, Clock3, LayoutDashboard,
  ListTodo, Plus, Search, Trash2, Pencil, X, Flag, GraduationCap,
  ChevronDown, CalendarCheck, AlertCircle
} from 'lucide-react';

const STORAGE_KEY = 'studybuddy.tasks.v1';
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const seedTasks = [
  { id: crypto.randomUUID(), title: 'Review Event-Driven Programming', subject: 'Web Development', dueDate: todayISO(), priority: 'High', notes: 'Review React events: onClick, onChange, and onSubmit.', completed: false, createdAt: Date.now() },
  { id: crypto.randomUUID(), title: 'Finish database exercises', subject: 'Database Management', dueDate: '', priority: 'Medium', notes: 'Complete the SQL practice questions.', completed: false, createdAt: Date.now()-1000 },
  { id: crypto.randomUUID(), title: 'Read system architecture notes', subject: 'System Architecture', dueDate: '', priority: 'Low', notes: '', completed: true, createdAt: Date.now()-2000 }
];

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedTasks;
  } catch {
    return seedTasks;
  }
}

function formatDate(value) {
  if (!value) return 'No due date';
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function isOverdue(task) {
  return !task.completed && task.dueDate && task.dueDate < todayISO();
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [view, setView] = useState('all');
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All subjects');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState('');

  // Event-driven persistence: whenever task state changes, save it to browser storage.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Side effect for brief action feedback.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const overdueCount = tasks.filter(isOverdue).length;
  const subjects = ['All subjects', ...new Set(tasks.map(t => t.subject).filter(Boolean).sort())];

  const visibleTasks = useMemo(() => tasks.filter(task => {
    const matchesView =
      view === 'all' ||
      (view === 'today' && task.dueDate === todayISO() && !task.completed) ||
      (view === 'upcoming' && task.dueDate > todayISO() && !task.completed) ||
      (view === 'completed' && task.completed);
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || `${task.title} ${task.subject} ${task.notes}`.toLowerCase().includes(term);
    const matchesSubject = subjectFilter === 'All subjects' || task.subject === subjectFilter;
    return matchesView && matchesQuery && matchesSubject;
  }).sort((a,b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  }), [tasks, view, query, subjectFilter]);

  function notify(message) { setToast(message); }
  function openNewTask() { setEditingId(null); setModalOpen(true); }
  function openEditTask(task) { setEditingId(task.id); setModalOpen(true); }
  function saveTask(data) {
    if (editingId) {
      setTasks(current => current.map(t => t.id === editingId ? { ...t, ...data } : t));
      notify('Task updated successfully.');
    } else {
      setTasks(current => [{ ...data, id: crypto.randomUUID(), completed: false, createdAt: Date.now() }, ...current]);
      notify('New task added to your planner.');
    }
    setModalOpen(false);
    setEditingId(null);
  }
  function toggleTask(id) {
    setTasks(current => current.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const task = tasks.find(t => t.id === id);
    notify(task?.completed ? 'Task moved back to pending.' : 'Great work! Task completed.');
  }
  function deleteTask(id) {
    if (!window.confirm('Delete this task? This action cannot be undone.')) return;
    setTasks(current => current.filter(t => t.id !== id));
    notify('Task deleted.');
  }
  function clearCompleted() {
    if (!tasks.some(t => t.completed)) return;
    if (!window.confirm('Remove all completed tasks?')) return;
    setTasks(current => current.filter(t => !t.completed));
    notify('Completed tasks cleared.');
  }

  const activeTask = editingId ? tasks.find(t => t.id === editingId) : null;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon"><GraduationCap size={25}/></div><div><b>StudyBuddy</b><span>STUDENT PLANNER</span></div></div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          <button className={view==='all'?'nav-item active':'nav-item'} onClick={()=>setView('all')}><LayoutDashboard size={18}/>All tasks<span>{tasks.length}</span></button>
          <button className={view==='today'?'nav-item active':'nav-item'} onClick={()=>setView('today')}><CalendarDays size={18}/>Today</button>
          <button className={view==='upcoming'?'nav-item active':'nav-item'} onClick={()=>setView('upcoming')}><Clock3 size={18}/>Upcoming</button>
          <button className={view==='completed'?'nav-item active':'nav-item'} onClick={()=>setView('completed')}><CheckCircle2 size={18}/>Completed<span>{completedCount}</span></button>
        </nav>
        <div className="sidebar-tip"><div className="tip-icon"><BookOpen size={18}/></div><b>Small steps add up.</b><p>Plan your study time, stay consistent, and celebrate every completed task.</p></div>
        <div className="sidebar-footer">Study smarter, one task at a time.</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><div className="eyebrow">YOUR PERSONAL STUDY SPACE</div><h1>{view==='all'?'My Study Planner':view==='today'?'Today’s Tasks':view==='upcoming'?'Upcoming Tasks':'Completed Tasks'}</h1><p className="date-line">{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p></div>
          <button className="primary-btn" onClick={openNewTask}><Plus size={18}/> Add a task</button>
        </header>

        <section className="stats-grid">
          <StatCard icon={<ListTodo size={19}/>} label="Total tasks" value={tasks.length} tone="blue" sub="All your study activities"/>
          <StatCard icon={<Clock3 size={19}/>} label="Pending" value={pendingCount} tone="orange" sub="Still to be completed"/>
          <StatCard icon={<CheckCircle2 size={19}/>} label="Completed" value={completedCount} tone="green" sub="Tasks you have finished"/>
          <StatCard icon={<AlertCircle size={19}/>} label="Overdue" value={overdueCount} tone="red" sub="Past due and unfinished"/>
        </section>

        <section className="progress-panel">
          <div className="progress-copy"><div><span className="eyebrow">YOUR PROGRESS</span><h2>Keep moving forward</h2></div><strong>{tasks.length ? Math.round(completedCount/tasks.length*100) : 0}%</strong></div>
          <div className="progress-track"><div className="progress-fill" style={{width:`${tasks.length ? completedCount/tasks.length*100 : 0}%`}}/></div>
          <p>{completedCount} of {tasks.length} tasks completed. Every bit of progress counts!</p>
        </section>

        <section className="tasks-section">
          <div className="section-heading"><div><h2>Study tasks</h2><p>Organize assignments, reviews, and deadlines.</p></div>{view==='completed'&&<button className="text-btn" onClick={clearCompleted}>Clear completed</button>}</div>
          <div className="toolbar">
            <div className="search-box"><Search size={17}/><input aria-label="Search tasks" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks or subjects..."/></div>
            <div className="select-wrap"><select aria-label="Filter by subject" value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}>{subjects.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={15}/></div>
          </div>

          {visibleTasks.length ? <div className="task-list">{visibleTasks.map(task=><TaskCard key={task.id} task={task} onToggle={()=>toggleTask(task.id)} onEdit={()=>openEditTask(task)} onDelete={()=>deleteTask(task.id)}/>)}</div> :
            <div className="empty-state"><div className="empty-icon"><CalendarCheck size={28}/></div><h3>No tasks found</h3><p>{query||subjectFilter!=='All subjects'?'Try changing your search or filter.':'Add a study task to get your planner started.'}</p>{!query&&<button className="primary-btn" onClick={openNewTask}><Plus size={17}/> Add your first task</button>}</div>}
        </section>
        <footer className="main-footer">Made for focused learning <span>•</span> Your tasks are saved in this browser.</footer>
      </main>

      {modalOpen && <TaskModal task={activeTask} onClose={()=>setModalOpen(false)} onSave={saveTask}/>}
      {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
    </div>
  );
}

function StatCard({icon,label,value,tone,sub}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div>;
}

function TaskCard({task,onToggle,onEdit,onDelete}) {
  return <article className={`task-card ${task.completed?'is-complete':''}`}>
    <button className={`check-button ${task.completed?'checked':''}`} aria-label={task.completed?'Mark as pending':'Mark as complete'} onClick={onToggle}>{task.completed?<CheckCircle2 size={22}/>:<Circle size={22}/>}</button>
    <div className="task-main"><div className="task-title-row"><h3>{task.title}</h3>{isOverdue(task)&&<span className="pill overdue">Overdue</span>}</div><div className="task-meta"><span className="subject-tag">{task.subject||'General'}</span><span><CalendarDays size={14}/>{formatDate(task.dueDate)}</span><span className={`priority ${task.priority.toLowerCase()}`}><Flag size={13}/>{task.priority}</span></div>{task.notes&&<p className="task-notes">{task.notes}</p>}</div>
    <div className="task-actions"><button title="Edit task" aria-label="Edit task" onClick={onEdit}><Pencil size={16}/></button><button title="Delete task" aria-label="Delete task" onClick={onDelete}><Trash2 size={16}/></button></div>
  </article>;
}

function TaskModal({task,onClose,onSave}) {
  const [title,setTitle]=useState(task?.title||'');
  const [subject,setSubject]=useState(task?.subject||'');
  const [dueDate,setDueDate]=useState(task?.dueDate||'');
  const [priority,setPriority]=useState(task?.priority||'Medium');
  const [notes,setNotes]=useState(task?.notes||'');
  const [error,setError]=useState('');

  function handleSubmit(e) {
    e.preventDefault(); // Prevent the browser's default page reload on form submission.
    if (!title.trim()) { setError('Please enter a task title.'); return; }
    onSave({title:title.trim(),subject:subject.trim()||'General',dueDate,priority,notes:notes.trim()});
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-header"><div><span className="eyebrow">{task?'UPDATE YOUR PLAN':'MAKE A STUDY PLAN'}</span><h2 id="modal-title">{task?'Edit task':'Add a new task'}</h2></div><button className="close-btn" onClick={onClose} aria-label="Close"><X size={20}/></button></div>
      <form onSubmit={handleSubmit}>
        <label>Task title <span className="required">*</span><input autoFocus value={title} onChange={e=>{setTitle(e.target.value);setError('');}} placeholder="e.g. Review JavaScript events"/></label>
        {error&&<p className="form-error">{error}</p>}
        <label>Subject or course<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Web Development"/></label>
        <div className="form-row"><label>Due date<input type="date" min={todayISO()} value={dueDate} onChange={e=>setDueDate(e.target.value)}/></label><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></label></div>
        <label>Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} rows="3" placeholder="Add instructions or details (optional)"/></label>
        <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button type="submit" className="primary-btn">{task?'Save changes':'Add task'}</button></div>
      </form>
    </section>
  </div>;
}
