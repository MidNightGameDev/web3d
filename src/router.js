/* Route config — used by app.js directly via react-router-dom <Routes>.
   This file is kept as a reference / central place you can extend later. */

export const routes = [
  { path: '/', label: 'Home' },
  { path: '/login', label: 'Login' },
  { path: '/projects', label: 'Projects' },
  { path: '/projects/:id', label: 'Project Detail' },
  { path: '/editor/:projectId/:sceneId', label: 'Editor' },
  { path: '/register', label: 'Register' },
];
