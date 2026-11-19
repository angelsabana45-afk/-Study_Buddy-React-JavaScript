# StudyBuddy – Student Study Planner

A React + JavaScript event-driven student planner. This version uses browser `localStorage`, so it does not require MySQL, a backend server, or an account. Tasks remain saved in the same browser on the same device.

## Features
- Dashboard with total, pending, completed, and overdue counts
- Add, edit, and delete study tasks
- Task title, subject/course, due date, priority, and notes
- Mark tasks completed or pending
- Filter by All tasks, Today, Upcoming, and Completed
- Search tasks by title, subject, or notes
- Filter by subject
- Progress bar and action notifications
- Responsive layout for desktop and mobile
- Saves task data in browser localStorage

## Requirements
- Windows 10/11
- Node.js LTS (includes npm)
- Visual Studio Code (recommended)
- Internet connection for the first dependency installation and optional Google Fonts

## Setup on Windows
1. Install Node.js LTS from https://nodejs.org/
2. Install Visual Studio Code from https://code.visualstudio.com/
3. Extract the `StudyBuddy` folder from the ZIP file.
4. Open Visual Studio Code.
5. Choose **File > Open Folder** and select the extracted `StudyBuddy` folder (the folder containing `package.json`).
6. In VS Code, choose **Terminal > New Terminal**.
7. Confirm the terminal is inside the project folder. If not, use `cd` to enter it.
8. Run:

   ```bash
   npm install
   npm run dev
   ```

9. Open the local address printed by Vite, usually `http://localhost:5173/`.
10. Keep the terminal open while using the application. Press `Ctrl + C` to stop the development server.

## Create a production build
Run:

```bash
npm run build
```

The optimized website files will be generated in the `dist` folder.

## Event-driven programming demonstrated
- `onClick`: navigation, add task, edit, delete, and completion buttons
- `onChange`: search box, subject filter, and form fields
- `onSubmit`: validates and saves the task form
- `useState`: updates tasks, filters, modal state, and notifications
- `useEffect`: saves task state to localStorage and clears notification timers
- `useMemo`: derives the filtered and sorted task list

## Data storage note
This starter project stores data only in the browser's localStorage. It is intended for a local classroom project/demo and a single browser profile. It does not include user accounts, cloud synchronization, or multi-user access. Clearing browser site data may remove saved tasks. Export important data separately if needed.

## Reset demo data
Open browser developer tools (F12) > Console and run:

```js
localStorage.removeItem('studybuddy.tasks.v1');
location.reload();
```
