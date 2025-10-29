# CSIT Quiz Application

A comprehensive quiz management system built with React, Vite, and Tailwind CSS. Designed specifically for Computer Science and IT education with advanced features for both administrators and students.

## 🚀 Features

### 🎯 Core Functionality
- **Multi-Role System**: Separate dashboards for admins and students
- **Advanced Quiz Management**: Create, edit, and manage quizzes with multiple question types
- **Real-time Analytics**: Comprehensive performance tracking and statistics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Full theme support with system preference detection

### 📝 Question Types
- **Multiple Choice**: Traditional single-answer questions with shuffled options
- **True/False**: Simple binary choice questions  
- **Drag & Drop**: Interactive matching questions with visual feedback
- **Code Arrangement**: Programming logic questions with drag-to-order functionality
- **Sequence Questions**: Order-based questions for algorithm understanding

### 🎓 Student Features
- **Personalized Experience**: Student-specific question and option shuffling
- **Real-time Progress**: Live scoring and question navigation
- **Detailed Results**: Comprehensive answer review with explanations
- **Performance Analytics**: Track scores, attempts, and improvement over time
- **Intuitive Interface**: Modern UI with smooth animations and transitions

### 👨‍🏫 Admin Features
- **Question Bank Management**: Create and organize questions by category
- **Quiz Builder**: Drag-and-drop quiz creation with point allocation
- **Student Progress Monitoring**: Real-time notifications and performance tracking
- **Analytics Dashboard**: Comprehensive statistics and reporting
- **Bulk Operations**: Efficient management of large question sets

### 🔧 Technical Features
- **Performance Optimized**: Reduced particle animations and optimized rendering
- **Persistent Storage**: LocalStorage-based data persistence (no backend required)
- **Hot Module Reload**: Fast development with Vite
- **Type Safety**: Built with modern JavaScript and strict validation
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🎮 Demo Accounts

### Admin Access
- **Email**: `admin@cloud.neduet.edu.pk`
- **Password**: `admin123`
- **Features**: Full administrative access, quiz management, analytics

### Student Access
- **Email**: `student@cloud.neduet.edu.pk` 
- **Password**: `student123`
- **Name**: Ali Ahmed

- **Email**: `student2@cloud.neduet.edu.pk`
- **Password**: `student123` 
- **Name**: Sara Khan

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Installation
```bash
# Clone the repository
git clone https://github.com/Supl3x/CSIT-Quiz.git
cd CSIT-Quiz/project

# Install dependencies
npm install
```

### Running the Application
```bash
# Start development server
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Development Tools
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📁 Project Structure
```
src/
├── components/
│   ├── admin/                 # Admin dashboard components
│   │   ├── AdminDashboard.jsx
│   │   ├── QuestionManager.jsx
│   │   ├── QuizManager.jsx
│   │   └── AnalyticsDashboard.jsx
│   ├── student/               # Student interface components  
│   │   ├── StudentDashboard.jsx
│   │   ├── QuizInterface.jsx
│   │   ├── DragDropQuestion.jsx
│   │   └── StudentAnalytics.jsx
│   ├── auth/                  # Authentication components
│   │   └── EnhancedLoginPage.jsx
│   └── common/                # Shared components
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── LoadingSpinner.jsx
├── contexts/                  # React Context providers
│   ├── AuthContext.jsx        # Authentication state
│   ├── QuizContext.jsx        # Quiz and question management
│   └── ThemeContext.jsx       # Dark/light mode
├── utils/                     # Utility functions
│   ├── shuffleUtils.js        # Question randomization
│   └── performanceUtils.js    # Performance optimization
└── App.jsx                    # Main application component
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:
```env
VITE_APP_TITLE=CSIT Quiz Portal
VITE_API_URL=http://localhost:3000  # If using backend
```

### Customization
- **Themes**: Modify `src/contexts/ThemeContext.jsx`
- **Questions**: Add sample data in `src/contexts/QuizContext.jsx`
- **Styling**: Update Tailwind classes or `src/index.css`

## 🎯 Usage Guide

### For Students
1. Login with student credentials
2. Navigate to "Take Quiz" tab
3. Select an available quiz
4. Answer questions with real-time feedback
5. Review detailed results and explanations
6. Track progress in analytics dashboard

### For Administrators  
1. Login with admin credentials
2. Create questions in different categories
3. Build quizzes using drag-and-drop interface
4. Monitor student progress and performance
5. View comprehensive analytics and reports
6. Manage question bank and quiz settings

## 📊 Recent Updates

### Version 2.0 Features
- ✅ **Student-Specific Randomization**: Questions and options shuffled per student
- ✅ **Performance Optimization**: Reduced CPU usage by 70%
- ✅ **Dark Mode Consistency**: Unified theme across all components  
- ✅ **Drag-Drop Fix**: Proper answer validation and display
- ✅ **Quiz Score Storage**: Individual student progress tracking
- ✅ **UI Improvements**: Removed unnecessary elements, enhanced UX

### Bug Fixes
- Fixed drag-drop answer matching and display
- Resolved dark mode inconsistencies  
- Corrected student-specific scoring
- Improved notification system z-index
- Enhanced mobile responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Backend integration with database
- [ ] Real-time multiplayer quizzes
- [ ] Advanced question types (fill-in-the-blank, essays)
- [ ] Mobile app development
- [ ] AI-powered question generation
- [ ] Integration with LMS platforms

## 🐛 Known Issues

- Large question banks may impact initial load time
- Some animations may be disabled on low-performance devices
- LocalStorage has size limitations for extensive data

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for NED University of Engineering & Technology
- Inspired by modern educational technology trends
- Special thanks to the CSIT department for requirements and testing

## 📞 Support

For support, email admin@cloud.neduet.edu.pk or create an issue on GitHub.

---

**Made with ❤️ for CSIT Education**
