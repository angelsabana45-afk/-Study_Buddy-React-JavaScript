
import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  CheckCircle2,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  Clock3,
  Flag,
  BookOpen,
  Trash2,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  GraduationCap,
  Sparkles,
  CircleCheck,
  Circle,
  CalendarCheck,
  Target,
  LogOut,
  Save,
} from "lucide-react";

const TASKS_KEY = "studybuddy.tasks.v1";
const SETTINGS_KEY = "studybuddy.settings.v1";

const todayISO = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const seedTasks = [
  {
    id: 1,
    title: "Complete React assignment",
    subject: "Web Development",
    description: "Finish the React activity and test the application.",
    dueDate: todayISO(),
    priority: "High",
    completed: false,
  },
  {
    id: 2,
    title: "Review database lessons",
    subject: "Database Management",
    description: "Study MongoDB queries and database operations.",
    dueDate: todayISO(),
    priority: "Medium",
    completed: false,
  },
  {
    id: 3,
    title: "Prepare for networking quiz",
    subject: "Networking",
    description: "Review the networking and MikroTik topics.",
    dueDate: todayISO(),
    priority: "Low",
    completed: true,
  },
];

function loadTasks() {
  try {
    const saved = localStorage.getItem(TASKS_KEY);
    return saved ? JSON.parse(saved) : seedTasks;
  } catch {
    return seedTasks;
  }
}

function formatDate(date) {
  if (!date) return "No due date";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(task) {
  return !task.completed && task.dueDate && task.dueDate < todayISO();
}

function getInitials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
        name: "Student",
        email: "",
        reminders: true,
        dailyGoal: 5,
      };
    } catch {
      return { name: "Student", email: "", reminders: true, dailyGoal: 5 };
    }
  });

  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: todayISO(),
    priority: "Medium",
  });

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const overdueTasks = activeTasks.filter(isOverdue);
  const todayTasks = activeTasks.filter((task) => task.dueDate === todayISO());
  const completionRate = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (page === "Completed") {
      result = result.filter((task) => task.completed);
    } else if (page === "My Tasks") {
      result = result.filter((task) => !task.completed);
    } else if (page === "Calendar") {
      result = result.filter((task) => task.dueDate === selectedDate);
    }

    if (filter === "Pending") {
      result = result.filter((task) => !task.completed);
    } else if (filter === "Completed") {
      result = result.filter((task) => task.completed);
    } else if (filter === "High Priority") {
      result = result.filter((task) => task.priority === "High");
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((task) =>
        `${task.title} ${task.subject} ${task.description}`
          .toLowerCase()
          .includes(term)
      );
    }

    return result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.dueDate || "").localeCompare(b.dueDate || "");
    });
  }, [tasks, page, filter, search, selectedDate]);

  function openAddModal() {
    setEditingId(null);
    setForm({
      title: "",
      subject: "",
      description: "",
      dueDate: todayISO(),
      priority: "Medium",
    });
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      subject: task.subject,
      description: task.description || "",
      dueDate: task.dueDate || todayISO(),
      priority: task.priority || "Medium",
    });
    setModalOpen(true);
  }

  function saveTask(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setToast("Please enter a task title.");
      return;
    }

    if (editingId !== null) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingId ? { ...task, ...form } : task
        )
      );
      setToast("Task updated successfully.");
    } else {
      setTasks((current) => [
        {
          id: Date.now(),
          ...form,
          completed: false,
        },
        ...current,
      ]);
      setToast("New task added successfully.");
    }

    setModalOpen(false);
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    setToast("Task status updated.");
  }

  function deleteTask(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setTasks((current) => current.filter((task) => task.id !== id));
    setToast("Task deleted.");
  }

  function changePage(nextPage) {
    setPage(nextPage);
    setFilter("All");
    setSearch("");
    setMobileMenu(false);
  }

  function saveSettings(event) {
    event.preventDefault();
    setToast("Your settings have been saved.");
  }

  const navigation = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "My Tasks", icon: ListTodo },
    { label: "Calendar", icon: CalendarDays },
    { label: "Completed", icon: CheckCircle2 },
    { label: "Analytics", icon: BarChart3 },
  ];

  const notifications = [
    ...overdueTasks.map((task) => ({
      id: task.id,
      title: task.title,
      message: "This task is overdue.",
      type: "overdue",
    })),
    ...todayTasks.map((task) => ({
      id: task.id,
      title: task.title,
      message: "This task is due today.",
      type: "today",
    })),
  ];

  return (
    <div className="app-shell">
      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><GraduationCap size={25} /></div>
          <div>
            <h2>StudyBuddy</h2>
            <span>STUDENT WORKSPACE</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenu(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${page === label ? "active" : ""}`}
              onClick={() => changePage(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === "My Tasks" && (
                <span className="nav-count">{activeTasks.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-section-label settings-label">PREFERENCES</div>
        <button
          className={`nav-item ${page === "Settings" ? "active" : ""}`}
          onClick={() => changePage("Settings")}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-promo">
            <div className="promo-icon"><Sparkles size={19} /></div>
            <h4>Stay on track!</h4>
            <p>Small steps every day lead to big achievements.</p>
            <div className="promo-progress">
              <span style={{ width: `${completionRate}%` }} />
            </div>
            <small>{completionRate}% of tasks completed</small>
          </div>

          <div className="profile-row">
            <div className="avatar">{getInitials(settings.name || "Student")}</div>
            <div className="profile-info">
              <strong>{settings.name || "Student"}</strong>
              <span>Student Account</span>
            </div>
            <LogOut size={17} className="profile-icon" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileMenu(true)}>
              <Menu size={22} />
            </button>
            <div>
              <span className="breadcrumb">Workspace /</span>
              <strong>{page}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="topbar-date">
              <CalendarDays size={17} />
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <div className="notification-wrapper">
              <button
                className="icon-button notification-button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                aria-label="Notifications"
              >
                <Bell size={19} />
                {notifications.length > 0 && <span className="notification-dot" />}
              </button>

              {notificationOpen && (
                <div className="notification-popover">
                  <div className="popover-heading">
                    <strong>Notifications</strong>
                    <span>{notifications.length} alerts</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="empty-notifications">You're all caught up!</p>
                  ) : (
                    notifications.slice(0, 6).map((item) => (
                      <div className="notification-item" key={`${item.type}-${item.id}`}>
                        <div className={`notification-icon ${item.type}`}>
                          <Clock3 size={17} />
                        </div>
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="top-avatar">{getInitials(settings.name || "Student")}</div>
          </div>
        </header>

        <div className="page-container">
          {page === "Dashboard" && (
            <>
              <section className="welcome-banner">
                <div className="welcome-content">
                  <span className="welcome-tag"><Sparkles size={14} /> YOUR PERSONAL STUDY SPACE</span>
                  <h1>Welcome back, {settings.name || "Student"}! <span>👋</span></h1>
                  <p>Stay organized, manage your workload, and make every study session count.</p>
                  <button className="primary-button welcome-button" onClick={openAddModal}>
                    <Plus size={18} /> Add New Task
                  </button>
                </div>
                <div className="welcome-art">
                  <div className="art-circle">
                    <BookOpen size={66} strokeWidth={1.3} />
                    <Sparkles className="art-sparkle" size={23} />
                  </div>
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <h2>Your Overview</h2>
                  <p>Here's what's happening with your studies.</p>
                </div>
              </div>

              <section className="stats-grid">
                <StatCard icon={ListTodo} label="Total Tasks" value={tasks.length} detail="All your activities" color="blue" />
                <StatCard icon={Clock3} label="Pending Tasks" value={activeTasks.length} detail="Waiting to be completed" color="orange" />
                <StatCard icon={CheckCircle2} label="Completed" value={completedTasks.length} detail="Tasks you've finished" color="green" />
                <StatCard icon={AlertIcon} label="Overdue Tasks" value={overdueTasks.length} detail="Need your attention" color="red" />
              </section>

              <div className="dashboard-grid">
                <section className="content-card task-overview-card">
                  <div className="card-heading">
                    <div>
                      <h3>Recent Tasks</h3>
                      <p>Keep an eye on your upcoming activities.</p>
                    </div>
                    <button className="text-button" onClick={() => changePage("My Tasks")}>
                      View all <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="task-list">
                    {tasks.length === 0 ? (
                      <EmptyState message="No tasks yet. Add your first task!" />
                    ) : (
                      [...tasks]
                        .sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1))
                        .slice(0, 5)
                        .map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onEdit={openEditModal}
                            onDelete={deleteTask}
                          />
                        ))
                    )}
                  </div>
                </section>

                <section className="content-card progress-card">
                  <div className="card-heading">
                    <div>
                      <h3>Overall Progress</h3>
                      <p>Your productivity at a glance.</p>
                    </div>
                  </div>
                  <div className="progress-circle-wrap">
                    <div
                      className="progress-circle"
                      style={{ "--progress": `${completionRate}%` }}
                    >
                      <div className="progress-circle-inner">
                        <strong>{completionRate}%</strong>
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="progress-legend">
                    <div><span className="legend-dot completed-dot" /> Completed <strong>{completedTasks.length}</strong></div>
                    <div><span className="legend-dot pending-dot" /> Pending <strong>{activeTasks.length}</strong></div>
                  </div>
                  <div className="goal-box">
                    <Target size={19} />
                    <div>
                      <strong>Keep going!</strong>
                      <p>Every completed task brings you closer to your goals.</p>
                    </div>
                  </div>
                </section>
              </div>

              <section className="content-card today-card">
                <div className="card-heading">
                  <div>
                    <h3>Today's Schedule</h3>
                    <p>Tasks that are due today.</p>
                  </div>
                  <span className="today-badge">{todayTasks.length} due today</span>
                </div>
                {todayTasks.length === 0 ? (
                  <EmptyState message="You have no pending tasks due today. Great job!" />
                ) : (
                  <div className="today-task-grid">
                    {todayTasks.map((task) => (
                      <div className="today-task" key={task.id}>
                        <div className="today-task-icon"><CalendarCheck size={19} /></div>
                        <div>
                          <strong>{task.title}</strong>
                          <span>{task.subject || "General"} · {task.priority} priority</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {(page === "My Tasks" || page === "Completed") && (
            <section className="page-section">
              <div className="page-title-row">
                <div>
                  <span className="eyebrow">TASK MANAGEMENT</span>
                  <h1>{page}</h1>
                  <p>{page === "Completed" ? "Review the tasks you've successfully finished." : "Organize your assignments, activities, and deadlines."}</p>
                </div>
                {page === "My Tasks" && (
                  <button className="primary-button" onClick={openAddModal}>
                    <Plus size={18} /> Add Task
                  </button>
                )}
              </div>

              <div className="content-card task-manager-card">
                <div className="task-toolbar">
                  <div className="search-box">
                    <Search size={18} />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search tasks or subjects..."
                    />
                  </div>
                  <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                    <option value="All">All tasks</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="High Priority">High priority</option>
                  </select>
                </div>

                <div className="task-table-heading">
                  <span>TASK DETAILS</span>
                  <span>SUBJECT</span>
                  <span>DUE DATE</span>
                  <span>PRIORITY</span>
                  <span>STATUS</span>
                  <span>ACTIONS</span>
                </div>

                {filteredTasks.length === 0 ? (
                  <EmptyState message="No matching tasks found." />
                ) : (
                  filteredTasks.map((task) => (
                    <TaskTableRow
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onEdit={openEditModal}
                      onDelete={deleteTask}
                    />
                  ))
                )}
              </div>
            </section>
          )}

          {page === "Calendar" && (
            <section className="page-section">
              <div className="page-title-row">
                <div>
                  <span className="eyebrow">SCHEDULE PLANNER</span>
                  <h1>Calendar</h1>
                  <p>Plan your deadlines and keep track of important dates.</p>
                </div>
                <button className="primary-button" onClick={openAddModal}>
                  <Plus size={18} /> Add Task
                </button>
              </div>

              <div className="calendar-layout">
                <div className="content-card calendar-card">
                  <div className="calendar-header">
                    <div>
                      <h3>{calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
                      <p>Select a date to see its tasks.</p>
                    </div>
                    <div className="calendar-controls">
                      <button className="icon-button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
                        <ChevronLeft size={19} />
                      </button>
                      <button className="icon-button" onClick={() => setCalendarMonth(new Date())}>Today</button>
                      <button className="icon-button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>
                        <ChevronRight size={19} />
                      </button>
                    </div>
                  </div>

                  <CalendarGrid
                    month={calendarMonth}
                    selectedDate={selectedDate}
                    tasks={tasks}
                    onSelect={setSelectedDate}
                  />
                </div>

                <div className="content-card selected-day-card">
                  <span className="eyebrow">SELECTED DATE</span>
                  <h3>{formatDate(selectedDate)}</h3>
                  <p>Tasks scheduled for this date.</p>
                  <div className="selected-day-list">
                    {tasks.filter((task) => task.dueDate === selectedDate).length === 0 ? (
                      <EmptyState message="No tasks scheduled for this date." />
                    ) : (
                      tasks.filter((task) => task.dueDate === selectedDate).map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          onEdit={openEditModal}
                          onDelete={deleteTask}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {page === "Analytics" && (
            <section className="page-section">
              <div className="page-title-row">
                <div>
                  <span className="eyebrow">PERFORMANCE INSIGHTS</span>
                  <h1>Analytics</h1>
                  <p>Understand your progress and productivity.</p>
                </div>
              </div>

              <div className="stats-grid analytics-stats">
                <StatCard icon={ListTodo} label="Total Tasks" value={tasks.length} detail="Tasks created" color="blue" />
                <StatCard icon={CheckCircle2} label="Completion Rate" value={`${completionRate}%`} detail="Overall performance" color="green" />
                <StatCard icon={Clock3} label="Pending" value={activeTasks.length} detail="Tasks remaining" color="orange" />
                <StatCard icon={Flag} label="Overdue" value={overdueTasks.length} detail="Past due date" color="red" />
              </div>

              <div className="analytics-grid">
                <section className="content-card">
                  <div className="card-heading">
                    <div>
                      <h3>Task Completion</h3>
                      <p>Completed compared to pending tasks.</p>
                    </div>
                  </div>
                  <div className="analytics-bar">
                    <div className="analytics-bar-completed" style={{ width: `${completionRate}%` }} />
                  </div>
                  <div className="analytics-legend">
                    <span><i className="legend-dot completed-dot" /> Completed: {completedTasks.length}</span>
                    <span><i className="legend-dot pending-dot" /> Pending: {activeTasks.length}</span>
                  </div>
                </section>

                <section className="content-card">
                  <div className="card-heading">
                    <div>
                      <h3>Priority Breakdown</h3>
                      <p>Tasks grouped by priority level.</p>
                    </div>
                  </div>
                  {["High", "Medium", "Low"].map((priority) => {
                    const count = tasks.filter((task) => task.priority === priority).length;
                    const percentage = tasks.length ? Math.round((count / tasks.length) * 100) : 0;
                    return (
                      <div className="priority-analytics" key={priority}>
                        <div><span>{priority} Priority</span><strong>{count}</strong></div>
                        <div className="mini-progress"><span className={`priority-${priority.toLowerCase()}`} style={{ width: `${percentage}%` }} /></div>
                      </div>
                    );
                  })}
                </section>
              </div>
            </section>
          )}

          {page === "Settings" && (
            <section className="page-section">
              <div className="page-title-row">
                <div>
                  <span className="eyebrow">PERSONALIZE YOUR SPACE</span>
                  <h1>Settings</h1>
                  <p>Manage your profile and StudyBuddy preferences.</p>
                </div>
              </div>

              <form className="content-card settings-card" onSubmit={saveSettings}>
                <div className="settings-section-heading">
                  <div className="settings-icon"><GraduationCap size={21} /></div>
                  <div>
                    <h3>Profile Information</h3>
                    <p>Update your student account details.</p>
                  </div>
                </div>
                <div className="settings-fields">
                  <label>
                    Full Name
                    <input
                      value={settings.name}
                      onChange={(event) => setSettings({ ...settings, name: event.target.value })}
                      placeholder="Enter your name"
                    />
                  </label>
                  <label>
                    Email Address
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(event) => setSettings({ ...settings, email: event.target.value })}
                      placeholder="Enter your email"
                    />
                  </label>
                </div>
                <div className="settings-divider" />
                <div className="settings-section-heading">
                  <div className="settings-icon"><Bell size={21} /></div>
                  <div>
                    <h3>Study Preferences</h3>
                    <p>Customize how you use your workspace.</p>
                  </div>
                </div>
                <label className="settings-toggle">
                  <div>
                    <strong>Task reminders</strong>
                    <p>Show due date alerts inside StudyBuddy.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reminders}
                    onChange={(event) => setSettings({ ...settings, reminders: event.target.checked })}
                  />
                </label>
                <label className="settings-fields single-field">
                  <span>Daily task goal</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.dailyGoal}
                    onChange={(event) => setSettings({ ...settings, dailyGoal: Number(event.target.value) })}
                  />
                </label>
                <div className="settings-actions">
                  <button type="submit" className="primary-button">
                    <Save size={17} /> Save Changes
                  </button>
                </div>
              </form>
            </section>
          )}

          <footer className="app-footer">
            <span>© {new Date().getFullYear()} StudyBuddy</span>
            <span>Made for better learning, one task at a time.</span>
          </footer>
        </div>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModalOpen(false);
        }}>
          <form className="task-modal" onSubmit={saveTask}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">TASK MANAGEMENT</span>
                <h2>{editingId !== null ? "Edit Task" : "Create New Task"}</h2>
                <p>Fill in the details of your study activity.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <label>
              Task Title *
              <input
                required
                autoFocus
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="e.g. Complete React assignment"
              />
            </label>
            <label>
              Subject
              <input
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                placeholder="e.g. Web Development"
              />
            </label>
            <label>
              Description
              <textarea
                rows="3"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Add some details about this task..."
              />
            </label>
            <div className="modal-fields-row">
              <label>
                Due Date
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                />
              </label>
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button">
                <Save size={17} /> {editingId !== null ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast-message"><CircleCheck size={18} /> {toast}</div>}
    </div>
  );
}

function AlertIcon({ size = 20 }) {
  return <Flag size={size} />;
}

function StatCard({ icon: Icon, label, value, detail, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon size={21} /></div>
      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><BookOpen size={24} /></div>
      <strong>Nothing here yet</strong>
      <p>{message}</p>
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete }) {
  return (
    <div className={`task-row ${task.completed ? "task-is-complete" : ""}`}>
      <button
        className={`task-check ${task.completed ? "checked" : ""}`}
        onClick={() => onToggle(task.id)}
        aria-label="Toggle task completion"
      >
        {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>
      <div className="task-row-info">
        <strong>{task.title}</strong>
        <span>{task.subject || "General"} · {formatDate(task.dueDate)}</span>
      </div>
      <span className={`priority-badge ${task.priority?.toLowerCase() || "medium"}`}>
        {task.priority || "Medium"}
      </span>
      <div className="task-row-actions">
        <button onClick={() => onEdit(task)} aria-label="Edit task"><Pencil size={16} /></button>
        <button onClick={() => onDelete(task.id)} aria-label="Delete task"><Trash2 size={16} /></button>
      </div>
    </div>
  );
}

function TaskTableRow({ task, onToggle, onEdit, onDelete }) {
  return (
    <div className="task-table-row">
      <div className="table-task-title">
        <button
          className={`task-check ${task.completed ? "checked" : ""}`}
          onClick={() => onToggle(task.id)}
        >
          {task.completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
        </button>
        <div>
          <strong className={task.completed ? "completed-title" : ""}>{task.title}</strong>
          {task.description && <small>{task.description}</small>}
        </div>
      </div>
      <span className="table-subject">{task.subject || "General"}</span>
      <span className={isOverdue(task) ? "overdue-date" : "table-date"}>{formatDate(task.dueDate)}</span>
      <span><span className={`priority-badge ${task.priority?.toLowerCase() || "medium"}`}>{task.priority || "Medium"}</span></span>
      <span><span className={`status-badge ${task.completed ? "status-completed" : "status-pending"}`}>{task.completed ? "Completed" : "Pending"}</span></span>
      <div className="table-actions">
        <button onClick={() => onEdit(task)} aria-label="Edit task"><Pencil size={16} /></button>
        <button onClick={() => onDelete(task.id)} aria-label="Delete task"><Trash2 size={16} /></button>
      </div>
    </div>
  );
}

function CalendarGrid({ month, selectedDate, tasks, onSelect }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1
  );

  return (
    <div className="calendar-grid">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div className="calendar-weekday" key={day}>{day}</div>
      ))}
      {days.map((day, index) => {
        if (!day) return <div className="calendar-empty" key={`empty-${index}`} />;
        const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const hasTasks = tasks.some((task) => task.dueDate === date);
        const isToday = date === todayISO();
        return (
          <button
            key={date}
            className={`calendar-day ${selectedDate === date ? "selected" : ""} ${isToday ? "is-today" : ""}`}
            onClick={() => onSelect(date)}
          >
            <span>{day}</span>
            {hasTasks && <i />}
          </button>
        );
      })}
    </div>
  );
}
