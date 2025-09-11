# CSIT Quiz Application

A full-featured quiz management system for CSIT, built with React, TypeScript, Vite, and Tailwind CSS.

## Features
- Admin and Student dashboards
- Quiz and question management (CRUD)
- Student quiz interface and analytics
- LocalStorage-based persistence (no backend required)
- Responsive and modern UI

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Installation
```bash
npm install
```

### Running the App
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Project Structure
- `src/components/admin/` — Admin panel components
- `src/components/student/` — Student panel components
- `src/contexts/` — React Contexts for Auth and Quiz state
- `src/App.tsx` — Main app logic and routing

## License
MIT
