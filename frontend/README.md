# CSIT Quiz Portal 🎓

A comprehensive quiz management system for the Department of Computer Science & IT, built with modern web technologies. This application provides a complete solution for creating, managing, and taking quizzes with advanced features like topic-based quiz generation.

## ✨ Features

### 🔐 Authentication & Authorization
- **Dual Role System**: Separate interfaces for administrators and students
- **Demo Credentials**: 
  - Admin: `admin@csit.edu`
  - Student: `student@csit.edu`
- **Session Management**: Persistent login state

### 👨‍💼 Admin Features
- **Dashboard**: Comprehensive analytics and overview
- **Quiz Management**: Create, edit, and delete quizzes
- **Question Bank**: Manage questions across multiple topics
- **Topic-Based Quiz Generation**: 🆕 Randomly generate quizzes from selected topics
- **Analytics**: Track student performance and quiz statistics

### 👨‍🎓 Student Features
- **Dashboard**: View available quizzes and personal statistics
- **Quiz Interface**: Interactive quiz-taking experience with timer
- **Performance Analytics**: Track progress and view detailed results
- **Responsive Design**: Optimized for all devices

### 🎯 Quiz Generation System
- **Multi-Topic Selection**: Choose from Programming, DBMS, Networks, AI, and Cybersecurity
- **Smart Question Pool**: 100+ questions across all topics (20 per topic)
- **Random Selection**: Automatically pick specified number of questions from chosen topics
- **Flexible Quiz Creation**: Switch between manual selection and auto-generation

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

### Installation
```bash
# Clone the repository
git clone https://github.com/Supl3x/CSIT-Quiz.git

# Navigate to project directory
cd project

# Install dependencies
npm install
```

### Development
```bash
# Start development server
npm run dev

# Open your browser and visit
# http://localhost:5173
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📁 Project Structure
```
src/
├── components/
│   ├── admin/           # Admin panel components
│   │   ├── AdminDashboard.jsx
│   │   ├── QuizForm.jsx         # 🆕 Enhanced with topic generation
│   │   ├── QuizManager.jsx
│   │   ├── QuestionForm.jsx
│   │   └── QuestionManager.jsx
│   ├── student/         # Student panel components
│   │   ├── StudentDashboard.jsx
│   │   ├── QuizInterface.jsx    # 🆕 Updated for predefined questions
│   │   └── StudentAnalytics.jsx
│   ├── auth/           # Authentication components
│   │   └── LoginPage.jsx
│   └── common/         # Shared components
│       ├── Header.jsx
│       └── LoadingSpinner.jsx
├── contexts/           # React Context providers
│   ├── AuthContext.jsx
│   ├── QuizContext.jsx         # 🆕 Enhanced with generation methods
│   └── ThemeContext.jsx
├── App.jsx            # Main application component
└── main.jsx          # Application entry point
```

## 🎨 Tech Stack
- **Frontend**: React 18 with JSX
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Persistence**: LocalStorage
- **Code Quality**: ESLint

## 🔄 Recent Updates
- ✅ **Topic-Based Quiz Generation**: Create quizzes by selecting topics and auto-generating questions
- ✅ **Enhanced Question Pool**: 100+ comprehensive questions across 5 major topics
- ✅ **Improved UI/UX**: Better typography and responsive design
- ✅ **Smart Quiz Structure**: Quizzes now store specific question selections

## 🎯 Usage Guide

### For Administrators
1. **Login** with admin credentials
2. **Manage Questions**: Add questions to different topics
3. **Create Quizzes**: 
   - Traditional: Manually select questions
   - 🆕 **Auto-Generate**: Select topics and let the system pick questions randomly
4. **Monitor Performance**: View analytics and student progress

### For Students
1. **Login** with student credentials
2. **Browse Quizzes**: View available active quizzes
3. **Take Quizzes**: Complete timed assessments
4. **View Results**: Check performance and analytics

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer
**Supl3x** - *CSIT Internship Project*

---

*Built with ❤️ for the Department of Computer Science & IT*
