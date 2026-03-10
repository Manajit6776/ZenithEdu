# ZenithEdu CMS - System Manual

## 1. System Overview

ZenithEdu CMS is a full-stack educational management system built with React, TypeScript, Node.js, and Prisma.

### Architecture
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Prisma ORM  
- **Database**: SQLite with Prisma schema
- **Authentication**: Role-based (Admin/Teacher/Student/Parent)

## 2. Core Features

### Academic Management
- Course creation and enrollment
- Assignment creation and submission
- Grade tracking and analytics
- Attendance monitoring

### Administrative Functions
- User management with role permissions
- Fee tracking and payments
- Notice board and communications
- Report generation

### Facility Management
- Hostel room allocation
- Transport route tracking
- Library catalog system
- Timetable scheduling

## 3. User Roles & Permissions

### Administrator
- Full system access
- User management
- System configuration
- Report generation

### Teacher  
- Course management
- Student grading
- Attendance tracking
- Assignment creation

### Student
- View enrolled courses
- Submit assignments
- Check grades
- Book appointments

### Parent
- Monitor child's progress
- Pay fees online
- View attendance
- Communicate with teachers

## 4. Database Schema

### Core Tables
- **users** - Authentication and profiles
- **students** - Student records and academics
- **courses** - Course catalog and enrollment
- **assignments** - Academic tasks and grading
- **notices** - System announcements
- **fee_records** - Financial tracking
- **hostel_rooms** - Accommodation management
- **bus_routes** - Transportation system

### Relationships
- Users → Students (1:1)
- Users → Courses (1:many)
- Students → Courses (many:many)
- Courses → Assignments (1:many)

## 5. Frontend Architecture

### Component Structure
```
src/
├── components/     # React components
├── contexts/      # React contexts (Auth, Theme, etc.)
├── hooks/         # Custom React hooks
├── services/      # API services
├── types/         # TypeScript definitions
└── utils/         # Helper functions
```

### Key Components
- **Dashboard** - Main interface
- **Navigation** - Role-based menu
- **Forms** - Data input components
- **Tables** - Data display components

## 6. Backend Architecture

### API Structure
```
src/
├── routes/        # Express route handlers
├── middleware/    # Authentication, validation
├── services/      # Business logic
├── models/        # Prisma models
└── utils/         # Helper functions
```

### Endpoints
- `/auth/*` - Authentication routes
- `/users/*` - User management
- `/courses/*` - Academic operations
- `/fees/*` - Financial operations
- `/notices/*` - Communication

## 7. Data Flow Diagram

```
User Interface (React)
       ↓ API Calls
Backend Services (Node.js)
       ↓ Database Operations
Prisma ORM
       ↓ Data Storage
SQLite Database
```

## 8. Security Features

### Authentication
- JWT token-based authentication
- Role-based access control
- Password hashing with bcrypt
- Session management

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Rate limiting

## 9. Deployment Architecture

### Development
- Local development with Vite dev server
- Hot module replacement
- TypeScript compilation

### Production
- Static file serving
- Environment-based configuration
- Database migrations
- Error handling and logging

## 10. Integration Points

### External Services
- Email service for notifications
- Payment gateway integration
- File storage service
- SMS service for alerts

### APIs Used
- React Router for navigation
- Framer Motion for animations
- Lucide React for icons
- Leaflet for maps (transport)

## 11. Performance Optimization

### Frontend
- Code splitting and lazy loading
- Component memoization
- Image optimization
- Bundle size optimization

### Backend
- Database indexing
- Query optimization
- Response caching
- Connection pooling

## 12. Monitoring & Maintenance

### Logging
- Application error tracking
- Performance metrics
- User activity logs
- System health checks

### Backup Strategy
- Daily database backups
- File system backups
- Redundancy planning
- Recovery procedures

---

*System Manual v2.0 - March 2026*
