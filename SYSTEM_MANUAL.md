# ZENITHEDU - COLLEGE MANAGEMENT SYSTEM
## SYSTEM MANUAL
### Comprehensive Technical Documentation

---

**Version:** 1.0.0  
**Last Updated:** March 2026  
**Document Classification:** Technical Reference  
**Project Status:** Production Ready

---

# TABLE OF CONTENTS

| Section | Title | Page |
|---------|-------|------|
| | **Cover Page** | i |
| | **Declaration/Certificate** | ii |
| | **Acknowledgements** | iii |
| | **Abstract/Executive Summary** | iv |
| | **List of Figures** | vi |
| | **List of Tables** | vii |
| **1** | **Introduction** | 1 |
| **2** | **System Architecture** | 8 |
| **3** | **Installation and Setup** | 20 |
| **4** | **System Configuration** | 32 |
| **5** | **Database Design** | 42 |
| **6** | **API Documentation** | 54 |
| **7** | **System Administration** | 72 |
| **8** | **Troubleshooting and Maintenance** | 80 |
| | **Index** | 88 |

---

# COVER PAGE

## ZENITHEDU COLLEGE MANAGEMENT SYSTEM

### SYSTEM MANUAL

**A Comprehensive Technical Documentation for the ZenithEdu College Management System**

---

**Project Title:** ZenithEdu - Intelligent College Management System  
**Project Type:** Web Application with AI Integration  
**Development Period:** 2025-2026  

---

**Submitted By:**

[FILL IN: Student Name]  
[FILL IN: Student ID/Registration Number]  
[FILL IN: Department/Program]  
[FILL IN: University/Institution Name]  

---

**Under the Guidance of:**

[FILL IN: Guide/Supervisor Name]  
[FILL IN: Designation]  
[FILL IN: Department]  

---

**Academic Year:** 2025-2026

---

*This document contains proprietary and confidential information. Unauthorized copying, distribution, or disclosure is strictly prohibited.*

---

# DECLARATION/CERTIFICATE PAGE

## DECLARATION

I hereby declare that the project work entitled **"ZenithEdu - Intelligent College Management System"** submitted to [FILL IN: University/Institution Name] is a record of original and independent work carried out by me under the supervision of [FILL IN: Guide Name], [FILL IN: Designation], [FILL IN: Department].

This project work has not been submitted previously for the award of any degree or diploma in any other university or institution.

The results embodied in this project have not been submitted for the award of any other degree or diploma in any university or institution.

---

**[FILL IN: Student Name]**  
[FILL IN: Student ID]  
[FILL IN: Department]  
[FILL IN: University Name]  

Date: _______________  
Place: _______________

---

## CERTIFICATE

This is to certify that the project entitled **"ZenithEdu - Intelligent College Management System"** is a bonafide work done by **[FILL IN: Student Name]** bearing Registration No. **[FILL IN: Registration Number]** in partial fulfillment of the requirements for the award of **[FILL IN: Degree Name]** in **[FILL IN: Branch/Program]** during the academic year **[FILL IN: Academic Year]**.

---

**Internal Guide**  
[FILL IN: Internal Guide Name]  
[FILL IN: Designation]  
[FILL IN: Department]  

Signature: _______________

---

**External Examiner**  
[FILL IN: External Examiner Name]  
[FILL IN: Designation]  
[FILL IN: Institution]  

Signature: _______________

---

**Head of Department**  
[FILL IN: HOD Name]  
[FILL IN: Department]  

Signature: _______________

---

**Principal/Director**  
[FILL IN: Principal Name]  
[FILL IN: Institution Name]  

Signature: _______________

---

# ACKNOWLEDGEMENTS

I would like to express my sincere gratitude to all those who have contributed to the successful completion of this project.

First and foremost, I extend my heartfelt thanks to **[FILL IN: Guide Name]**, my project guide, for the invaluable guidance, continuous support, and constructive feedback throughout the development of this project. Your expertise and encouragement have been instrumental in shaping this system.

I am deeply grateful to **[FILL IN: HOD Name]**, Head of the Department of [FILL IN: Department], for providing the necessary facilities and resources for this project work.

I would like to thank **[FILL IN: Principal Name]**, Principal of [FILL IN: Institution Name], for creating an environment conducive to research and innovation.

I extend my appreciation to all the faculty members of the Department of [FILL IN: Department] for their encouragement and support.

I am thankful to my classmates and friends who provided valuable suggestions and helped me test the system during various development phases.

Finally, I would like to express my deepest gratitude to my family for their unwavering support, patience, and encouragement throughout my academic journey.

---

**[FILL IN: Student Name]**  
[FILL IN: Student ID]

---

# ABSTRACT / EXECUTIVE SUMMARY

## Abstract

**ZenithEdu** is a comprehensive, AI-powered College Management System designed to streamline and modernize educational institution administration. This web-based application integrates advanced technologies including React, Node.js, Express, Prisma ORM, and artificial intelligence capabilities to provide a unified platform for students, teachers, administrators, and parents.

### Key Highlights

- **System Type:** Full-Stack Web Application with AI Integration
- **Technology Stack:** React 19, TypeScript, Node.js, Express.js, SQLite/Prisma, Tailwind CSS, Framer Motion
- **AI Integration:** Google Gemini AI, Ollama for local AI processing
- **User Roles:** Admin, Teacher, Student, Parent
- **Core Modules:** Student Management, Academic Management, Library, Hostel, Transport, Fees, Attendance, Live Classes, AI Chat Assistant

### Problem Statement

Traditional college management systems often suffer from fragmented data, manual processes, lack of real-time analytics, and poor user experience. Educational institutions struggle with managing diverse operations efficiently while providing seamless communication between stakeholders.

### Solution

ZenithEdu addresses these challenges by providing:

1. **Unified Dashboard:** Role-based access with customized interfaces
2. **AI-Powered Assistance:** Intelligent chatbot for instant support and queries
3. **Real-time Analytics:** Comprehensive reporting and visualization
4. **Mobile-Responsive Design:** Access from any device, anywhere
5. **Integrated Modules:** Seamless data flow across all functional areas

### Technical Innovation

- **AI Chat Assistant:** Leverages Google Gemini API for natural language interactions
- **Teacher Analytics:** Advanced analytics dashboard for performance tracking
- **Real-time Features:** Live classes integration with Zoom/Google Meet
- **Modern Architecture:** Component-based React architecture with TypeScript

### Results

The system demonstrates significant improvements in administrative efficiency, user satisfaction, and data accessibility. Through comprehensive testing and validation, ZenithEdu proves to be a robust solution for modern educational institution management.

---

**Keywords:** College Management System, Educational Technology, React, Node.js, Prisma, AI Integration, Full-Stack Development, Web Application

---

# LIST OF FIGURES

| Figure No. | Title | Page |
|------------|-------|------|
| 2.1 | High-Level System Architecture Diagram | 10 |
| 2.2 | Component Architecture Diagram | 12 |
| 2.3 | Data Flow Diagram - Student Registration | 14 |
| 2.4 | Data Flow Diagram - Attendance Management | 15 |
| 2.5 | Technology Stack Overview | 16 |
| 2.6 | API Gateway and Microservices Architecture | 18 |
| 5.1 | Entity-Relationship Diagram - Complete Schema | 44 |
| 5.2 | User Entity Relationship | 46 |
| 5.3 | Student Management ER Diagram | 47 |
| 5.4 | Academic Module ER Diagram | 48 |
| 5.5 | Library Management ER Diagram | 49 |
| 5.6 | Hostel Management ER Diagram | 50 |
| 5.7 | Database Schema - Complete Overview | 51 |
| 6.1 | API Authentication Flow | 56 |
| 6.2 | Request/Response Cycle | 58 |
| 7.1 | System Monitoring Dashboard Structure | 74 |
| 7.2 | Backup and Recovery Workflow | 76 |
| 8.1 | Troubleshooting Decision Tree | 82 |

---

# LIST OF TABLES

| Table No. | Title | Page |
|-----------|-------|------|
| 3.1 | System Hardware Requirements | 22 |
| 3.2 | Software Requirements and Versions | 23 |
| 3.3 | Pre-Installation Checklist | 25 |
| 3.4 | Environment Variables Reference | 27 |
| 3.5 | Installation Troubleshooting Matrix | 30 |
| 4.1 | Configuration Files Overview | 33 |
| 4.2 | Environment Variables by Category | 35 |
| 4.3 | Security Configuration Settings | 38 |
| 5.1 | Database Table Summary | 45 |
| 5.2 | User Table Schema | 46 |
| 5.3 | Student Table Schema | 47 |
| 5.4 | Course and Academic Tables | 48 |
| 5.5 | Library Management Tables | 49 |
| 5.6 | Hostel Management Tables | 50 |
| 5.7 | Enumeration Types Reference | 52 |
| 6.1 | API Endpoints Summary | 55 |
| 6.2 | HTTP Status Codes Reference | 60 |
| 6.3 | Error Codes and Descriptions | 61 |
| 6.4 | Authentication Endpoints | 62 |
| 6.5 | Student API Endpoints | 63 |
| 6.6 | Teacher API Endpoints | 64 |
| 6.7 | Course API Endpoints | 65 |
| 6.8 | Library API Endpoints | 66 |
| 6.9 | Attendance API Endpoints | 67 |
| 6.10 | Assignment API Endpoints | 68 |
| 6.11 | Transport API Endpoints | 69 |
| 6.12 | Fee Management API Endpoints | 70 |
| 7.1 | User Role Permissions Matrix | 73 |
| 7.2 | System Monitoring Metrics | 74 |
| 7.3 | Backup Schedule Recommendations | 76 |
| 8.1 | Common Issues and Solutions | 81 |
| 8.2 | Error Log Interpretation Guide | 83 |
| 8.3 | Maintenance Schedule Template | 85 |

---

# CHAPTER 1: INTRODUCTION

## 1.1 Project Overview and Objectives

### 1.1.1 Background

Educational institutions in the modern era face unprecedented challenges in managing their operations efficiently. The complexity of managing student records, academic schedules, faculty information, library resources, hostel accommodations, transport logistics, and financial transactions has grown exponentially with increasing student populations and regulatory requirements.

Traditional paper-based systems and legacy software solutions no longer suffice for the dynamic needs of contemporary educational environments. Institutions require integrated, scalable, and user-friendly systems that can adapt to evolving educational paradigms while providing real-time access to critical information.

### 1.1.2 Project Introduction

**ZenithEdu** (College Management System) is a state-of-the-art, full-stack web application designed specifically for educational institutions. Built with modern technologies and incorporating artificial intelligence capabilities, ZenithEdu represents a paradigm shift in educational administration software.

The system is designed as a single-page application (SPA) with a React-based frontend and Node.js/Express backend, providing a seamless user experience while maintaining robust backend operations. The integration of AI-powered features, particularly the intelligent chat assistant, sets ZenithEdu apart from conventional management systems.

### 1.1.3 Project Objectives

The primary objectives of the ZenithEdu system are:

1. **Centralized Management:** Create a unified platform for managing all college operations including academics, administration, finance, and facilities.

2. **Role-Based Access Control:** Implement a comprehensive RBAC system supporting four user roles: Administrator, Teacher, Student, and Parent, each with customized interfaces and permissions.

3. **AI Integration:** Leverage artificial intelligence through Google Gemini API and local Ollama integration to provide intelligent assistance, automated insights, and natural language interactions.

4. **Real-Time Analytics:** Provide comprehensive dashboards and reporting tools for data-driven decision-making at institutional and individual levels.

5. **Mobile Responsiveness:** Ensure complete functionality across all device types and screen sizes through responsive design principles.

6. **Process Automation:** Automate routine administrative tasks such as attendance tracking, fee management, notice distribution, and report generation.

7. **Enhanced Communication:** Facilitate seamless communication between all stakeholders through integrated messaging, notifications, and live class platforms.

8. **Data Security:** Implement robust security measures including authentication, authorization, data encryption, and secure file handling.

### 1.1.4 Key Features Overview

ZenithEdu comprises the following major feature modules:

#### Student Management Module
- Comprehensive student profile management
- Enrollment and registration workflows
- Academic performance tracking
- Attendance monitoring
- Fee status management
- Document management

#### Teacher/Faculty Module
- Teacher profile and workload management
- Course assignment and scheduling
- Attendance marking capabilities
- Assignment creation and grading
- Performance analytics dashboard
- Appointment scheduling with students

#### Academic Management Module
- Course and curriculum management
- Class scheduling and timetable generation
- Live class integration (Zoom, Google Meet, Microsoft Teams)
- Assignment management system
- Grade recording and transcript generation

#### Library Management Module
- Book catalog and inventory management
- Book issue and return tracking
- Reading statistics and popular titles
- Digital resource management
- Overdue notifications

#### Hostel Management Module
- Room allocation and management
- Occupancy tracking
- Fee integration for accommodation
- Maintenance request tracking
- Room type categorization

#### Transport Management Module
- Bus route management
- Driver and vehicle information
- Real-time route status tracking
- Transport fee management
- Student transport assignments

#### Fee Management Module
- Comprehensive fee structure management
- Payment tracking and receipt generation
- Overdue fee notifications
- Financial reporting
- Multiple fee types support

#### Attendance System
- Daily attendance marking
- Subject-wise attendance tracking
- Automated absentee reports
- Attendance analytics and trends
- Late arrival tracking

#### AI Chat Assistant
- Natural language query processing
- Context-aware responses
- Integration with college knowledge base
- Support for multiple query types
- 24/7 availability for common queries

#### Teacher Analytics Dashboard
- Performance metrics visualization
- Course effectiveness analysis
- Student engagement tracking
- Comparative analytics
- Exportable reports

## 1.2 Scope and Limitations

### 1.2.1 System Scope

The scope of ZenithEdu encompasses the complete administrative and academic management lifecycle of an educational institution. The system is designed to be scalable and adaptable to various types of institutions including:

- Engineering Colleges
- Medical Colleges
- Arts and Science Colleges
- Business Schools
- Technical Institutes
- Multi-disciplinary Universities

#### In-Scope Components

1. **User Management:** Complete lifecycle management of users across all roles
2. **Academic Operations:** Course management, scheduling, examinations, grading
3. **Administrative Functions:** Notices, announcements, document management
4. **Financial Management:** Fee collection, tracking, reporting
5. **Infrastructure Management:** Library, hostel, transport facilities
6. **Communication:** Internal messaging, notifications, live classes
7. **Analytics and Reporting:** Comprehensive data analysis and visualization
8. **AI Integration:** Intelligent assistance and automated insights

### 1.2.2 Out of Scope

The following features are explicitly outside the current scope of ZenithEdu:

1. **Learning Management Content:** The system does not include content creation tools or learning management features like quiz builders, video hosting, or SCORM compliance.

2. **Biometric Integration:** Physical biometric devices (fingerprint, face recognition) for attendance are not included, though the system provides manual and digital attendance marking.

3. **Payment Gateway Integration:** While fee tracking is included, direct payment processing through external gateways is not implemented in the current version.

4. **Mobile Native Applications:** The system is web-responsive but does not include dedicated iOS or Android native applications.

5. **Multi-language Support:** Full internationalization beyond the current language context is planned for future releases.

6. **Offline Mode:** The application requires internet connectivity and does not support offline functionality with synchronization.

### 1.2.3 System Limitations

1. **Browser Compatibility:** While modern browsers are supported, legacy browsers (IE11 and below) are not supported.

2. **Concurrent Users:** The current SQLite configuration is suitable for small to medium institutions. Large institutions with thousands of concurrent users would require database migration to PostgreSQL or MySQL.

3. **File Upload Size:** Default file upload size is limited to 5MB per file for security and storage optimization.

4. **AI Response Time:** AI assistant response times depend on external API availability and network conditions.

5. **Real-time Updates:** While most operations are real-time, some analytics calculations are cached and updated periodically.

## 1.3 Document Conventions and Terminology

### 1.3.1 Document Conventions

This manual follows specific formatting conventions for clarity and consistency:

**Typography Conventions:**
- `Monospace font` indicates code, file paths, commands, or technical terms
- **Bold text** highlights important terms, warnings, or key concepts
- *Italic text* indicates emphasis or placeholder values
- [FILL IN: description] marks areas requiring project-specific customization

**Code Blocks:**
All code examples are presented in syntax-highlighted blocks:

```javascript
// Example code block
const example = "This demonstrates code formatting";
```

**Notes and Warnings:**

> **Note:** Informational notes provide additional context or helpful tips.

> **Warning:** Warning blocks indicate critical information that requires attention.

> **Caution:** Caution blocks highlight potential risks or issues.

### 1.3.2 Terminology and Definitions

The following terms are used throughout this document:

| Term | Definition |
|------|------------|
| **Admin/Administrator** | User with full system access and configuration privileges |
| **Teacher/Faculty** | Academic staff with course management and student interaction privileges |
| **Student** | Enrolled learner with access to academic and personal information |
| **Parent** | Guardian with view-only access to their child's academic progress |
| **CMS** | College Management System (ZenithEdu) |
| **API** | Application Programming Interface |
| **RBAC** | Role-Based Access Control |
| **ORM** | Object-Relational Mapping (Prisma) |
| **SPA** | Single Page Application |
| **AI Assistant** | Artificial Intelligence chatbot powered by Google Gemini |
| **Prisma** | Database toolkit and ORM used in the application |
| **React Context** | State management solution for React applications |
| **Component** | Reusable UI building block in React |
| **Endpoint** | URL where API services can be accessed |
| **Migration** | Database schema version control mechanism |
| **Seed Data** | Initial test data loaded into the database |
| **Environment Variable** | Configuration value stored outside the codebase |

### 1.3.3 Abbreviations and Acronyms

| Abbreviation | Full Form |
|--------------|-----------|
| HTTP | HyperText Transfer Protocol |
| HTTPS | HyperText Transfer Protocol Secure |
| REST | Representational State Transfer |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| SQL | Structured Query Language |
| ORM | Object-Relational Mapping |
| UI | User Interface |
| UX | User Experience |
| CRUD | Create, Read, Update, Delete |
| CORS | Cross-Origin Resource Sharing |
| XSS | Cross-Site Scripting |
| CSRF | Cross-Site Request Forgery |
| DOM | Document Object Model |
| SPA | Single Page Application |
| SSR | Server-Side Rendering |
| CSR | Client-Side Rendering |
| npm | Node Package Manager |
| CLI | Command Line Interface |
| IDE | Integrated Development Environment |
| OS | Operating System |
| CPU | Central Processing Unit |
| RAM | Random Access Memory |
| SSD | Solid State Drive |
| URL | Uniform Resource Locator |
| URI | Uniform Resource Identifier |
| CDN | Content Delivery Network |

## 1.4 Intended Audience for This Manual

### 1.4.1 Primary Audiences

This manual is designed for the following audience groups:

#### 1.4.1.1 System Administrators
**Technical Expertise Required:** Advanced

System administrators responsible for deploying, configuring, and maintaining the ZenithEdu infrastructure will find comprehensive installation procedures, configuration details, and troubleshooting guides in this manual.

**Recommended Reading:**
- Chapter 1 (Introduction)
- Chapter 2 (System Architecture)
- Chapter 3 (Installation and Setup)
- Chapter 4 (System Configuration)
- Chapter 7 (System Administration)
- Chapter 8 (Troubleshooting and Maintenance)

#### 1.4.1.2 Database Administrators
**Technical Expertise Required:** Advanced

Database administrators responsible for data integrity, backup, and optimization should focus on database design, migration procedures, and backup strategies.

**Recommended Reading:**
- Chapter 1 (Introduction)
- Chapter 5 (Database Design)
- Chapter 7 (System Administration - Backup and Restore)
- Chapter 8 (Troubleshooting and Maintenance)

#### 1.4.1.3 Backend Developers
**Technical Expertise Required:** Intermediate to Advanced

Developers extending or modifying the server-side functionality will need the API documentation, database schema details, and system architecture information.

**Recommended Reading:**
- Chapter 1 (Introduction)
- Chapter 2 (System Architecture)
- Chapter 5 (Database Design)
- Chapter 6 (API Documentation)
- Chapter 4 (System Configuration)

#### 1.4.1.4 Frontend Developers
**Technical Expertise Required:** Intermediate

Developers working on the user interface components will benefit from understanding the component architecture, API integration patterns, and state management approaches.

**Recommended Reading:**
- Chapter 1 (Introduction)
- Chapter 2 (System Architecture - Frontend Section)
- Chapter 6 (API Documentation)

#### 1.4.1.5 DevOps Engineers
**Technical Expertise Required:** Advanced

Engineers responsible for deployment automation, CI/CD pipelines, and infrastructure management will find installation and configuration procedures essential.

**Recommended Reading:**
- Chapter 2 (System Architecture)
- Chapter 3 (Installation and Setup)
- Chapter 4 (System Configuration)
- Chapter 7 (System Administration)
- Chapter 8 (Troubleshooting and Maintenance)

### 1.4.2 Secondary Audiences

#### 1.4.2.1 Project Managers
**Technical Expertise Required:** Basic to Intermediate

Project managers overseeing development or deployment will benefit from understanding system capabilities, architecture, and implementation requirements.

**Recommended Reading:**
- Chapter 1 (Introduction)
- Chapter 2 (System Architecture - Overview)

#### 1.4.2.2 Quality Assurance Engineers
**Technical Expertise Required:** Intermediate

QA engineers responsible for testing the system should understand the API endpoints, data flows, and configuration options.

**Recommended Reading:**
- Chapter 1 (Introduction)
- Chapter 6 (API Documentation)
- Chapter 8 (Troubleshooting and Maintenance)

#### 1.4.2.3 Technical Support Staff
**Technical Expertise Required:** Basic to Intermediate

Support staff assisting end-users will benefit from understanding common issues, error messages, and basic troubleshooting procedures.

**Recommended Reading:**
- Chapter 1 (Introduction)
- Chapter 7 (System Administration - User Management)
- Chapter 8 (Troubleshooting and Maintenance)

### 1.4.3 Prerequisites for Understanding This Manual

To fully comprehend the technical content of this manual, readers should possess:

1. **Fundamental Knowledge:**
   - Basic understanding of web application architecture
   - Familiarity with HTTP protocols and REST APIs
   - Understanding of relational database concepts

2. **Technical Skills (for Implementation):**
   - JavaScript/TypeScript programming
   - React framework fundamentals
   - Node.js and Express.js basics
   - SQL and database operations
   - Git version control

3. **System Administration Skills:**
   - Command line interface proficiency
   - Package management (npm)
   - Environment configuration
   - Basic networking concepts

4. **Recommended Tools:**
   - Code editor (VS Code recommended)
   - Modern web browser (Chrome, Firefox, Edge)
   - Terminal/Command prompt access
   - Database management tools (Prisma Studio, SQLite Browser)

---

*[End of Chapter 1]*

---

# CHAPTER 2: SYSTEM ARCHITECTURE

## 2.1 High-Level System Architecture Overview

### 2.1.1 Architecture Philosophy

ZenithEdu follows a modern three-tier architecture pattern that separates presentation, application processing, and data management functions. This separation of concerns enables maintainability, scalability, and independent development of system components.

### 2.1.2 Architecture Layers

The system consists of three primary layers:

#### 2.1.2.1 Presentation Layer (Frontend)
- **Technology:** React 19 with TypeScript
- **Responsibility:** User interface rendering, user interaction handling, state management
- **Deployment:** Static files served via Vite development server or production web server
- **Key Characteristics:** Single Page Application (SPA), component-based architecture, responsive design

#### 2.1.2.2 Application Layer (Backend)
- **Technology:** Node.js with Express.js
- **Responsibility:** Business logic implementation, API endpoints, authentication, data validation
- **Deployment:** Node.js server process (typically port 3001)
- **Key Characteristics:** RESTful API design, middleware-based request processing, modular route handlers

#### 2.1.2.3 Data Layer (Database)
- **Technology:** SQLite with Prisma ORM
- **Responsibility:** Data persistence, query processing, relationship management, transaction handling
- **Deployment:** File-based database (dev.db) with Prisma client abstraction
- **Key Characteristics:** Relational database with ACID compliance, ORM-based access, migration support

### 2.1.3 Architecture Diagram Description

**Figure 2.1: High-Level System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │    Web       │  │   Mobile     │  │   Tablet     │  │   Desktop    │   │
│  │   Browser    │  │   Browser    │  │   Browser    │  │   Browser    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
└─────────┼────────────────┼────────────────┼────────────────┼─────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                   │
                                   ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                │
│                      (React 19 + TypeScript SPA)                            │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        React Application                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │  Home    │ │Dashboard│ │ Students│ │ Teachers│ │ Library  │   │  │
│  │  │  Page    │ │ Component│ │ Component│ │ Component│ │ Component│   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  │                                                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  │                     State Management                             │  │
│  │  │  • AuthContext  • ThemeContext  • NotificationContext            │  │
│  │  │  • LanguageContext                                              │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼ API Calls (REST)
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                 │
│                       (Node.js + Express.js)                                │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Express Server                                  │  │
│  │                         (Port 3001)                                    │  │
│  │                                                                         │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │  │
│  │  │   Auth       │ │   Student    │ │   Teacher    │ │   Course     │  │  │
│  │  │   Routes     │ │   Routes     │ │   Routes     │ │   Routes     │  │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │  │
│  │                                                                         │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │  │
│  │  │   Library    │ │ Attendance   │ │  Transport   │ │    Fees      │  │  │
│  │  │   Routes     │ │   Routes     │ │   Routes     │ │   Routes     │  │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │  │
│  │                                                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        Middleware Layer                          │  │  │
│  │  │  • CORS  • Body Parser  • File Upload (Multer)  • Logging      │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼ Prisma Client
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                     │
│                           (SQLite + Prisma)                                 │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Prisma ORM                                      │  │
│  │                   (Database Abstraction)                               │  │
│  └───────────────────────────────┬───────────────────────────────────────┘  │
│                                   │                                         │
│  ┌────────────────────────────────┴────────────────────────────────────┐  │
│  │                        SQLite Database                                 │  │
│  │                          (dev.db file)                                 │  │
│  │                                                                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │  User    │ │ Student  │ │  Course  │ │   Book   │ │ Hostel   │   │  │
│  │  │  Table   │ │  Table   │ │  Table   │ │  Table   │ │  Room    │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  │                                                                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │  Bus     │ │   Fee    │ │ Attendance│ │ Assignment│ │ Submission│  │ │
│  │  │  Route   │ │  Record  │ │  Record  │ │  Record  │ │  Record  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼ External Services
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THIRD-PARTY INTEGRATIONS                            │
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                 │
│  │  Google Gemini  │ │    Ollama       │ │  Live Class     │                 │
│  │     AI API      │ │   (Local AI)    │ │   Platforms     │                 │
│  │                 │ │                 │ │ • Zoom          │                 │
│  │ • Chat Assistant│ │ • Local AI      │ │ • Google Meet   │                 │
│  │ • Smart Insights│ │ • Privacy       │ │ • MS Teams      │                 │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Component Breakdown and Descriptions

### 2.2.1 Frontend Component Architecture

The frontend follows a component-based architecture with clear separation of concerns:

#### 2.2.1.1 Page Components (Route-Level)

| Component | Purpose | Path |
|-----------|---------|------|
| `Home` | Landing page with system overview | `/` |
| `Dashboard` | Role-based main dashboard | `/dashboard` |
| `Students` | Student management interface | `/students` |
| `Teachers` | Teacher management interface | `/teachers` |
| `Attendance` | Attendance marking and tracking | `/attendance` |
| `StudentAttendance` | Student's personal attendance view | `/my-attendance` |
| `Notices` | Notice board and announcements | `/notices` |
| `Hostel` | Hostel room management | `/hostel` |
| `Academics` | Course and academic management | `/academics` |
| `Timetable` | Class schedule management | `/timetable` |
| `Library` | Library management system | `/library` |
| `Transport` | Bus route management | `/transport` |
| `Fees` | Fee management and tracking | `/fees` |
| `Classes` | Live class management | `/classes` |
| `Settings` | System configuration | `/settings` |
| `Appointments` | Student-teacher appointment scheduling | `/appointments` |
| `TeacherAnalytics` | Analytics dashboard for teachers | `/teacher-analytics` |
| `ChatAssistant` | AI-powered chat interface | `/chat` |
| `Login` | Authentication page | `/login` |
| `ProfileSettings` | User profile management | `/profile` |
| `SupportCenter` | Help and support interface | `/support` |
| `PrivacyPolicy` | Privacy information page | `/privacy` |
| `TermsOfService` | Terms and conditions page | `/terms` |
| `FeaturesPage` | System features showcase | `/features` |
| `ImpactPage` | System impact demonstration | `/impact` |
| `VisionPage` | Vision and mission page | `/vision` |

#### 2.2.1.2 Context Providers (State Management)

**Figure 2.2: Context Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                   Context Providers                     │
│                   (React Context API)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           AuthContext                           │   │
│  │  • Current user state                           │   │
│  │  • Login/logout functions                       │   │
│  │  • Role-based access                            │   │
│  │  • Authentication status                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           ThemeContext                          │   │
│  │  • Dark/light mode toggle                       │   │
│  │  • Theme preferences                            │   │
│  │  • CSS variable management                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           LanguageContext                       │   │
│  │  • Current language/locale                      │   │
│  │  • Translation functions                        │   │
│  │  • Regional settings                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           NotificationContext                   │   │
│  │  • Toast notifications                          │   │
│  │  • Alert messages                               │   │
│  │  • Notification queue                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2.2 Backend Component Architecture

#### 2.2.2.1 Express.js Route Handlers

The backend is organized into domain-specific route modules:

| Route Module | Base Path | Description |
|--------------|-----------|-------------|
| Authentication | `/api/auth/*` | Login, logout, session management |
| Users | `/api/users` | User CRUD operations |
| Teachers | `/api/teachers` | Teacher-specific endpoints |
| Students | `/api/students` | Student management API |
| Courses | `/api/courses` | Course and curriculum API |
| Library | `/api/books` | Book management endpoints |
| Transport | `/api/routes` | Bus route management |
| Fees | `/api/fees` | Fee record operations |
| Attendance | `/api/attendance` | Attendance marking and reporting |
| Assignments | `/api/assignments` | Assignment lifecycle management |
| Submissions | `/api/submissions` | Student submission handling |
| Notices | `/api/notices` | Notice board operations |
| Hostel | `/api/hostel` | Hostel room management |
| Live Classes | `/api/live-classes` | Live class scheduling |
| Appointments | `/api/appointments` | Appointment scheduling API |
| Timetable | `/api/timetable` | Schedule management |
| Analytics | `/api/analytics` | Reporting and statistics |
| System | `/api/system-stats` | System health and metrics |
| Uploads | `/api/upload-*` | File upload endpoints |
| Chat | `/api/chat` | AI assistant communication |

#### 2.2.2.2 Middleware Stack

The Express.js application uses the following middleware configuration:

```javascript
// Request processing pipeline
1. Request Logging Middleware    // Logs all incoming requests
2. CORS Middleware              // Handles cross-origin requests
3. JSON Body Parser             // Parses JSON request bodies
4. URL-Encoded Body Parser      // Parses form data
5. Static File Serving          // Serves uploaded files
6. Route Handlers               // Domain-specific route processing
7. Error Handling Middleware    // Global error handling
```

## 2.3 Technology Stack Justification

### 2.3.1 Frontend Technologies

#### 2.3.1.1 React 19

**Selection Rationale:**
React 19 provides the latest improvements in the React ecosystem, including enhanced performance optimizations, improved concurrent rendering, and better developer experience.

**Key Benefits:**
- Component-based architecture promoting reusability
- Virtual DOM for efficient rendering
- Rich ecosystem of libraries and tools
- Excellent TypeScript support
- Strong community and documentation

**Implementation Notes:**
- Functional components with hooks pattern
- React Router v7 for client-side routing
- Strict Mode enabled for development

#### 2.3.1.2 TypeScript 5.8

**Selection Rationale:**
TypeScript provides static typing, improving code quality, developer productivity, and reducing runtime errors.

**Key Benefits:**
- Type safety and compile-time error detection
- Enhanced IDE support with IntelliSense
- Self-documenting code through type definitions
- Easier refactoring and maintenance
- Better collaboration in team environments

**Configuration:**
- Strict mode enabled
- Target: ES2020
- Module resolution: bundler mode

#### 2.3.1.3 Vite 6.2

**Selection Rationale:**
Vite offers significantly faster development server startup and hot module replacement compared to traditional bundlers.

**Key Benefits:**
- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ES modules support
- Rich plugin ecosystem
- Excellent TypeScript integration

#### 2.3.1.4 Tailwind CSS 3.4

**Selection Rationale:**
Tailwind CSS provides utility-first CSS framework enabling rapid UI development with consistent design systems.

**Key Benefits:**
- Utility-first approach for rapid development
- Highly customizable configuration
- Built-in responsive design utilities
- PurgeCSS integration for minimal CSS output
- Dark mode support

**Configuration Highlights:**
- Custom color palette matching institutional branding
- Extended spacing and typography scales
- Custom animations and transitions
- Plugin integration (tailwind-merge, clsx)

#### 2.3.1.5 Framer Motion 12.34

**Selection Rationale:**
Framer Motion provides declarative animation library for React, enabling sophisticated UI animations with minimal code.

**Key Benefits:**
- Declarative animation syntax
- Gesture support (drag, hover, tap)
- Layout animations
- AnimatePresence for enter/exit animations
- Excellent performance

#### 2.3.1.6 Recharts 3.7

**Selection Rationale:**
Recharts provides composable charting library built on React components for data visualization.

**Key Benefits:**
- React-native component architecture
- Responsive charts
- Multiple chart types (line, bar, pie, area, etc.)
- Customizable styling
- Animation support

#### 2.3.1.7 Lucide React 0.562

**Selection Rationale:**
Lucide provides a comprehensive, consistent icon library with React integration.

**Key Benefits:**
- 1000+ icons covering all common use cases
- Consistent design language
- Tree-shakeable imports
- Customizable size, color, and stroke width
- Active maintenance and updates

### 2.3.2 Backend Technologies

#### 2.3.2.1 Node.js 20+

**Selection Rationale:**
Node.js provides a JavaScript runtime for server-side execution, enabling full-stack JavaScript development.

**Key Benefits:**
- Single language across stack (JavaScript/TypeScript)
- Non-blocking I/O for high concurrency
- V8 engine for fast execution
- Massive npm ecosystem
- Excellent for I/O-bound applications

#### 2.3.2.2 Express.js 5.2

**Selection Rationale:**
Express.js is the de facto standard for Node.js web applications, providing minimalist, flexible framework.

**Key Benefits:**
- Minimal and flexible framework
- Robust routing system
- Middleware architecture
- Large community and documentation
- Easy to learn and extend

#### 2.3.2.3 Prisma 6.19

**Selection Rationale:**
Prisma provides next-generation ORM with type-safe database access and excellent developer experience.

**Key Benefits:**
- Type-safe database queries
- Declarative schema definition
- Auto-generated database migrations
- Prisma Studio for data visualization
- Excellent query performance
- Multi-database support

**Prisma Schema Features Used:**
- Data model definitions
- Enum types for constrained values
- Relation definitions with referential integrity
- Default values and constraints
- Index definitions

#### 2.3.2.4 SQLite (via Prisma)

**Selection Rationale:**
SQLite provides serverless, zero-configuration database suitable for small to medium deployments.

**Key Benefits:**
- Zero configuration required
- Single file database for easy backup
- ACID compliance
- Excellent read performance
- Suitable for development and small production deployments

**Scalability Note:** For large institutions, migration to PostgreSQL or MySQL is supported through Prisma's multi-database capabilities.

#### 2.3.2.5 Multer 2.0

**Selection Rationale:**
Multer provides middleware for handling multipart/form-data, specifically for file uploads.

**Key Benefits:**
- Express.js integration
- Multiple storage options (disk, memory)
- File filtering and validation
- Size limits enforcement
- Multiple file upload support

### 2.3.3 AI Integration Technologies

#### 2.3.3.1 Google GenAI (@google/genai) 1.34

**Selection Rationale:**
Google's GenAI SDK provides access to Gemini models for advanced AI capabilities.

**Key Benefits:**
- Access to state-of-the-art Gemini models
- Natural language understanding
- Context-aware responses
- Streaming response support
- Multimodal capabilities (future expansion)

#### 2.3.3.2 Ollama 0.6

**Selection Rationale:**
Ollama enables local AI model execution, providing privacy and offline capabilities.

**Key Benefits:**
- Local AI processing (no data leaving premises)
- Reduced latency for common queries
- Works without internet connectivity
- Customizable with various open-source models
- Cost-effective for high-volume usage

### 2.3.4 Additional Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| react-router-dom | 7.11 | Client-side routing |
| react-hot-toast | 2.6 | Toast notifications |
| date-fns | 4.1 | Date manipulation and formatting |
| clsx | 2.1 | Conditional class name construction |
| tailwind-merge | 3.4 | Tailwind class deduplication |
| cors | 2.8 | Cross-origin resource sharing |
| concurrently | 9.2 | Running multiple commands |

## 2.4 System Dependencies and Integrations

### 2.4.1 External Service Dependencies

#### 2.4.1.1 Google Gemini API

**Integration Type:** AI Chat Assistant
**API Version:** Gemini 1.5 Pro/Flash
**Authentication:** API Key (GEMINI_API_KEY)
**Data Privacy:** User queries sent to Google AI services
**Fallback:** Local Ollama processing

**Integration Points:**
- Chat assistant component
- Smart insights generation
- Content suggestions (future)

#### 2.4.1.2 Ollama Local AI

**Integration Type:** Local AI Processing
**Default Model:** Llama 3.1 or compatible
**Authentication:** None (local service)
**Data Privacy:** 100% local processing
**Fallback:** Google Gemini API

**Integration Points:**
- Offline chat capabilities
- Privacy-sensitive queries
- Cost reduction for high-volume usage

#### 2.4.1.3 Live Class Platforms

**Supported Platforms:**
- Zoom
- Google Meet
- Microsoft Teams
- Custom platforms

**Integration Type:** URL/link management
**Authentication:** Meeting links provided by instructors
**Data Privacy:** External platform privacy policies apply

**Integration Points:**
- Live class scheduling
- Meeting link storage
- Platform status tracking

### 2.4.2 Internal Dependencies

#### 2.4.2.1 Frontend Dependencies

```
Core Dependencies:
├── react ^19.2.3
├── react-dom ^19.2.3
├── react-router-dom ^7.11.0
├── @types/react ^19.2.14
├── @types/react-dom ^19.2.3

State & Context:
├── Built-in React Context API

Styling:
├── tailwindcss ^3.4.19
├── postcss ^8.5.6
├── autoprefixer ^10.4.23
├── clsx ^2.1.1
├── tailwind-merge ^3.4.0

UI Components:
├── lucide-react ^0.562.0
├── framer-motion ^12.34.0
├── recharts ^3.7.0
├── react-hot-toast ^2.6.0

Maps:
├── leaflet ^1.9.4
├── react-leaflet ^5.0.0
├── @types/leaflet ^1.9.21

AI Integration:
├── @google/genai ^1.34.0
├── ollama ^0.6.3

Utilities:
├── date-fns ^4.1.0
```

#### 2.4.2.2 Backend Dependencies

```
Core Framework:
├── express ^5.2.1
├── node (built-in)

Database:
├── @prisma/client ^6.19.1
├── prisma ^6.19.1

File Handling:
├── multer ^2.0.2

Utilities:
├── cors ^2.8.5
├── concurrently ^9.2.1 (dev)

Type Support:
├── @types/node ^22.14.0
```

## 2.5 Data Flow Diagrams

### 2.5.1 Student Registration Data Flow

**Figure 2.3: Data Flow Diagram - Student Registration**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Student    │     │   Frontend   │     │   Backend    │     │   Database   │
│   (User)     │────▶│   (React)    │────▶│   (Express)  │────▶│   (SQLite)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │                     │
       │ 1. Fill Form        │                     │                     │
       │────────────────────▶│                     │                     │
       │                     │                     │                     │
       │                     │ 2. Validate Input   │                     │
       │                     │ (Client-side)       │                     │
       │                     │                     │                     │
       │                     │ 3. POST /api/students│                     │
       │                     │────────────────────▶│                     │
       │                     │                     │                     │
       │                     │                     │ 4. Validate Data    │
       │                     │                     │ (Server-side)       │
       │                     │                     │                     │
       │                     │                     │ 5. Check Email      │
       │                     │                     │    Uniqueness       │
       │                     │                     │────────────────────▶│
       │                     │                     │                     │
       │                     │                     │ 6. Return Exists?   │
       │                     │                     │◀────────────────────│
       │                     │                     │                     │
       │                     │                     │ 7. Generate CUID    │
       │                     │                     │                     │
       │                     │                     │ 8. Create Record    │
       │                     │                     │────────────────────▶│
       │                     │                     │                     │
       │                     │                     │ 9. Return Success   │
       │                     │                     │◀────────────────────│
       │                     │                     │                     │
       │                     │ 10. Show Success    │                     │
       │                     │◀────────────────────│                     │
       │                     │                     │                     │
       │ 11. Confirmation    │                     │                     │
       │◀────────────────────│                     │                     │
       │                     │                     │                     │
```

**Process Description:**
1. User fills registration form with student details
2. Client-side validation checks required fields and formats
3. Frontend sends POST request to `/api/students`
4. Server validates incoming data against schema
5. Server checks email uniqueness constraint
6. Database returns existence status
7. Server generates unique CUID identifier
8. Prisma creates student record with related user record
9. Database returns created record
10. Frontend displays success notification
11. User receives confirmation

### 2.5.2 Attendance Management Data Flow

**Figure 2.4: Data Flow Diagram - Attendance Management**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Teacher    │     │   Frontend   │     │   Backend    │     │   Database   │
│   (User)     │────▶│   (React)    │────▶│   (Express)  │────▶│   (SQLite)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

Flow A: Marking Attendance
─────────────────────────────────────────────────────────────────────────────

1. Select Date/Subject    
│────────────────────────▶│
                          │
2. Fetch Student List
│                         │────────────────────────▶│
                                                    │
                          │                         │ 3. Query Students
                          │                         │    by Course
                          │                         │────────────────────────▶│
                                                    │                         │
                          │                         │ 4. Return Student List  │
                          │                         │◀────────────────────────│
                          │                         │
                          │ 5. Display Student List │
                          │◀────────────────────────│
                          │
6. Mark Present/Absent
│────────────────────────▶│
                          │ 7. Batch POST /api/attendance/bulk
                          │────────────────────────▶│
                                                    │
                          │                         │ 8. Validate Entries
                          │                         │
                          │                         │ 9. Create Attendance
                          │                         │    Records (Transaction)
                          │                         │────────────────────────▶│
                                                    │                         │
                          │                         │ 10. Update Student    │
                          │                         │     Attendance Stats  │
                          │                         │────────────────────────▶│
                                                    │                         │
                          │                         │ 11. Commit Transaction│
                          │                         │◀────────────────────────│
                          │                         │
                          │ 12. Return Success      │
                          │◀────────────────────────│
                          │
13. Confirmation Toast
│◀────────────────────────│

Flow B: Viewing Attendance Reports
─────────────────────────────────────────────────────────────────────────────

1. Request Report
│────────────────────────▶│
                          │ 2. GET /api/attendance/report
                          │    ?studentId=&startDate=&endDate=
                          │────────────────────────▶│
                                                    │
                          │                         │ 3. Query Attendance
                          │                         │    Records
                          │                         │────────────────────────▶│
                                                    │                         │
                          │                         │ 4. Aggregate Data     │
                          │                         │◀────────────────────────│
                          │                         │
                          │                         │ 5. Calculate Stats
                          │                         │    - Total Days
                          │                         │    - Present %
                          │                         │    - Absent Count
                          │                         │
                          │ 6. Return JSON Report   │
                          │◀────────────────────────│
                          │
7. Render Charts/Table
│◀────────────────────────│
```

**Process Description:**

**Flow A - Marking Attendance:**
1. Teacher selects date and subject for attendance
2. Frontend fetches enrolled students for the course
3. Server queries students with course relation
4. Database returns filtered student list
5. Frontend displays attendance grid with student names
6. Teacher marks present/absent for each student
7. Frontend sends batch attendance records
8. Server validates all entries
9. Server creates attendance records in transaction
10. Server updates student attendance statistics
11. Database commits transaction
12. Server returns success confirmation
13. Teacher sees confirmation notification

**Flow B - Viewing Reports:**
1. User requests attendance report with filters
2. Frontend sends GET request with query parameters
3. Server queries attendance records with filters
4. Database returns matching records
5. Server aggregates data and calculates statistics
6. Server returns formatted JSON report
7. Frontend renders charts and tables

---

*[End of Chapter 2 - Continue to Chapter 3: Installation and Setup]*

---

# CHAPTER 3: INSTALLATION AND SETUP

## 3.1 System Requirements

### 3.1.1 Hardware Requirements

**Table 3.1: System Hardware Requirements**

| Component | Development | Production (Small) | Production (Medium) |
|-----------|-------------|-------------------|---------------------|
| **CPU** | Intel i3/AMD Ryzen 3 (Dual Core) | Intel i5/AMD Ryzen 5 (Quad Core) | Intel i7/AMD Ryzen 7 (8+ Cores) |
| **Clock Speed** | 2.0 GHz minimum | 2.5 GHz or higher | 3.0 GHz or higher |
| **RAM** | 4 GB minimum | 8 GB recommended | 16 GB or more |
| **Storage** | 10 GB free space | 50 GB SSD recommended | 100+ GB SSD |
| **Network** | Broadband connection | Stable internet | High-availability network |

**Detailed Hardware Specifications:**

#### Development Environment
- **Minimum:** Any modern computer capable of running Node.js
- **Recommended:** 
  - Processor: Intel Core i5 or equivalent
  - Memory: 8 GB RAM
  - Storage: SSD with 20 GB free space
  - Display: 1920x1080 resolution for optimal UI development

#### Production Environment (Small Institution: <500 users)
- **Server Specifications:**
  - Processor: Intel Xeon E3 or AMD EPYC (4 cores)
  - Memory: 8 GB RAM
  - Storage: 50 GB SSD
  - Bandwidth: 10 Mbps dedicated
  - Backup Storage: 100 GB external or cloud

#### Production Environment (Medium Institution: 500-2000 users)
- **Server Specifications:**
  - Processor: Intel Xeon E5 or AMD EPYC (8+ cores)
  - Memory: 16 GB RAM
  - Storage: 100 GB SSD RAID 1
  - Bandwidth: 50 Mbps dedicated
  - Backup Storage: 500 GB with automated backup
  - **Note:** Consider migrating from SQLite to PostgreSQL for this scale

#### Production Environment (Large Institution: >2000 users)
- **Architecture:** Load-balanced multi-server setup
- **Application Servers:** 2+ nodes (8 cores, 16 GB RAM each)
- **Database Server:** Dedicated PostgreSQL/MySQL server
- **File Storage:** Distributed storage or cloud (AWS S3, Azure Blob)
- **CDN:** Recommended for static assets

### 3.1.2 Software Requirements

**Table 3.2: Software Requirements and Versions**

| Software | Minimum Version | Recommended Version | Purpose |
|----------|----------------|---------------------|---------|
| **Operating System** | | | |
| Windows | Windows 10 | Windows 11 / Server 2019+ | Development/Production |
| macOS | macOS 11 (Big Sur) | macOS 14 (Sonoma) | Development |
| Linux | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS | Production |
| **Runtime Environment** | | | |
| Node.js | v18.0.0 | v20.x LTS | JavaScript runtime |
| npm | v9.0.0 | v10.x | Package manager |
| **Database** | | | |
| SQLite | 3.35.0+ | 3.40.0+ | Default database |
| PostgreSQL | 13.0 | 15.x | Scalable alternative |
| **Development Tools** | | | |
| Git | 2.30.0 | 2.40.0+ | Version control |
| VS Code | 1.70.0 | 1.80.0+ | IDE (recommended) |
| PowerShell | 5.1 | 7.x | Script execution |

#### Operating System-Specific Notes

**Windows:**
- Windows 10 version 1903 or later required for WSL2 (if using Linux subsystem)
- PowerShell execution policy may need adjustment for scripts
- Windows Defender exclusions recommended for development folders

**macOS:**
- Xcode Command Line Tools required (`xcode-select --install`)
- Homebrew recommended for package management
- Rosetta 2 required for Apple Silicon Macs with some dependencies

**Linux (Ubuntu/Debian):**
- Build essentials required: `sudo apt-get install build-essential`
- libsqlite3-dev for SQLite operations
- Python 3.8+ for node-gyp native modules

### 3.1.3 Browser Requirements

**Supported Browsers:**

| Browser | Minimum Version | Recommended | Notes |
|---------|----------------|-------------|-------|
| Google Chrome | 100 | Latest | Full feature support |
| Mozilla Firefox | 100 | Latest | Full feature support |
| Microsoft Edge | 100 | Latest | Full feature support |
| Safari | 15 | 16+ | macOS/iOS only |
| Opera | 86 | Latest | Chromium-based |

**Unsupported Browsers:**
- Internet Explorer 11 and below (not supported)
- Legacy Edge (EdgeHTML-based)
- Mobile browsers older than 2 years

**Browser Feature Requirements:**
- ES2020 JavaScript support
- CSS Grid and Flexbox
- Web Storage API (localStorage, sessionStorage)
- Fetch API
- Async/Await support

## 3.2 Pre-Installation Checklist

**Table 3.3: Pre-Installation Checklist**

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Hardware requirements verified | [ ] | Confirm against Table 3.1 |
| 2 | Operating system updated | [ ] | Latest security patches |
| 3 | Node.js installed and verified | [ ] | Run `node --version` |
| 4 | npm installed and verified | [ ] | Run `npm --version` |
| 5 | Git installed and configured | [ ] | Run `git --version` |
| 6 | Code editor installed | [ ] | VS Code recommended |
| 7 | Terminal/CLI access confirmed | [ ] | PowerShell, Bash, or Zsh |
| 8 | Internet connection available | [ ] | Required for package download |
| 9 | Firewall ports identified | [ ] | Ports 5173, 3001 default |
| 10 | Backup storage allocated | [ ] | For database and uploads |
| 11 | Domain/subdomain prepared | [ ] | For production deployment |
| 12 | SSL certificate ready | [ ] | For HTTPS (production) |
| 13 | Email service configured | [ ] | For notifications (optional) |
| 14 | AI API keys obtained | [ ] | Gemini API key |

### 3.2.1 Environment Verification Commands

Before proceeding with installation, verify your environment:

```bash
# Check Node.js version
node --version
# Expected output: v18.x.x or higher

# Check npm version
npm --version
# Expected output: 9.x.x or higher

# Check Git version
git --version
# Expected output: 2.30.x or higher

# Verify system architecture
node -p "process.arch"
# Expected: x64 or arm64

# Check available ports (Windows)
netstat -an | findstr "5173"
netstat -an | findstr "3001"

# Check available ports (macOS/Linux)
lsof -i :5173
lsof -i :3001
```

## 3.3 Step-by-Step Installation Procedures

### 3.3.1 Development Environment Setup

#### Step 1: Repository Clone

```bash
# Navigate to your desired installation directory
cd C:\Users\[USERNAME]\Projects

# Clone the repository
git clone https://github.com/[username]/ZenithEdu-cms.git

# Navigate into the project directory
cd ZenithEdu-cms
```

> **Note:** If using a ZIP download instead of git, extract the archive and navigate to the extracted folder.

#### Step 2: Dependency Installation

```bash
# Install all project dependencies
npm install

# Verify installation
npm list
```

> **Expected Output:** All dependencies listed in package.json should install without errors.

> **Troubleshooting:** If you encounter permission errors on macOS/Linux, try:
> ```bash
> sudo npm install --unsafe-perm
> ```

#### Step 3: Environment Configuration

```bash
# Check if .env file exists
ls .env

# If not present, create from example
copy .env.example .env    # Windows
cp .env.example .env      # macOS/Linux
```

**Configure environment variables (see Chapter 4 for details):**

```env
# .env file content
DATABASE_URL="file:./prisma/dev.db"
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3001
```

#### Step 4: Database Initialization

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with initial data (optional)
npx prisma db seed
```

> **Expected Output:**
> - Prisma client generated successfully
> - Migration applied
> - Database created at `prisma/dev.db`

#### Step 5: Verify Installation

```bash
# Test the backend API
npm run server

# In a new terminal, test the frontend
npm run dev
```

**Verification Checklist:**
- [ ] Backend starts without errors (Port 3001)
- [ ] Frontend compiles successfully (Port 5173)
- [ ] API test endpoint accessible: http://localhost:3001/api/test
- [ ] Frontend accessible: http://localhost:5173

### 3.3.2 Production Environment Setup

#### Prerequisites for Production

1. **Server Access:** SSH or direct access to production server
2. **Domain Name:** Registered and configured domain
3. **SSL Certificate:** For HTTPS (Let's Encrypt recommended)
4. **Process Manager:** PM2 or systemd for service management
5. **Reverse Proxy:** Nginx or Apache (recommended)

#### Production Installation Steps

**Step 1: Server Preparation**

```bash
# Update system packages (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**Step 2: Application Deployment**

```bash
# Create application directory
sudo mkdir -p /var/www/zenithedu
cd /var/www/zenithedu

# Clone repository (or upload files)
sudo git clone https://github.com/[username]/ZenithEdu-cms.git .

# Set proper ownership
sudo chown -R www-data:www-data /var/www/zenithedu

# Install dependencies (production only)
npm ci --only=production
```

**Step 3: Environment Configuration**

```bash
# Create production environment file
sudo nano /var/www/zenithedu/.env
```

**Production .env content:**

```env
NODE_ENV=production
DATABASE_URL="file:./prisma/prod.db"
GEMINI_API_KEY="your_production_gemini_api_key"
PORT=3001
CORS_ORIGIN="https://yourdomain.com"
```

**Step 4: Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Run production migration
npx prisma migrate deploy
```

**Step 5: Build Frontend**

```bash
# Build production assets
npm run build

# Verify build output
ls -la dist/
```

**Step 6: Process Management with PM2**

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create ecosystem file
sudo nano /var/www/zenithedu/ecosystem.config.js
```

**ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: 'zenithedu-backend',
      script: './server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

```bash
# Create logs directory
mkdir -p /var/www/zenithedu/logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd
```

**Step 7: Nginx Configuration**

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/zenithedu
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    # Frontend static files
    location / {
        root /var/www/zenithedu/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads/ {
        alias /var/www/zenithedu/public/uploads/;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/zenithedu /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 3.4 Environment Configuration

### 3.4.1 Environment Variables Reference

**Table 3.4: Environment Variables Reference**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | development | Application environment mode |
| `DATABASE_URL` | Yes | file:./prisma/dev.db | Database connection string |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key for AI features |
| `PORT` | No | 3001 | Backend server port |
| `CORS_ORIGIN` | No | * | Allowed CORS origins (production) |
| `UPLOAD_DIR` | No | ./public/uploads | File upload directory |
| `MAX_FILE_SIZE` | No | 5242880 | Maximum upload size (bytes) |
| `JWT_SECRET` | Recommended | auto-generated | Secret for session signing |
| `LOG_LEVEL` | No | info | Logging verbosity (debug/info/warn/error) |
| `RATE_LIMIT_WINDOW` | No | 900000 | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | No | 100 | Max requests per window |

### 3.4.2 Configuration by Environment

#### Development Configuration (.env)

```env
# Development Environment
NODE_ENV=development
DATABASE_URL="file:./prisma/dev.db"
GEMINI_API_KEY="your_development_gemini_api_key"
PORT=3001
CORS_ORIGIN="*"
LOG_LEVEL=debug
```

#### Staging Configuration (.env.staging)

```env
# Staging Environment
NODE_ENV=staging
DATABASE_URL="file:./prisma/staging.db"
GEMINI_API_KEY="your_staging_gemini_api_key"
PORT=3001
CORS_ORIGIN="https://staging.yourdomain.com"
LOG_LEVEL=info
RATE_LIMIT_MAX=200
```

#### Production Configuration (.env.production)

```env
# Production Environment
NODE_ENV=production
DATABASE_URL="file:./prisma/prod.db"
GEMINI_API_KEY="your_production_gemini_api_key"
PORT=3001
CORS_ORIGIN="https://yourdomain.com"
LOG_LEVEL=warn
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=10485760
```

## 3.5 Database Setup and Initialization

### 3.5.1 Database Schema Migration

**Initial Migration:**

```bash
# Development - interactive migration
npx prisma migrate dev --name initial_setup

# Production - deploy existing migrations
npx prisma migrate deploy
```

**Creating New Migrations:**

```bash
# After modifying schema.prisma
npx prisma migrate dev --name descriptive_migration_name
```

### 3.5.2 Database Seeding

**Seed Data Configuration:**

The project includes a seed script at `prisma/seed.ts` that populates the database with:
- Sample users (Admin, Teacher, Student roles)
- Sample courses and academic data
- Sample library books
- Sample hostel rooms
- Sample bus routes
- Sample notices

```bash
# Execute seed script
npx prisma db seed

# Reset database with seed
npx prisma migrate reset
```

### 3.5.3 Database Verification

```bash
# Open Prisma Studio for visual inspection
npx prisma studio

# Expected: Studio opens at http://localhost:5555
```

**Verification Queries:**

```sql
-- Verify tables created
.tables

-- Count records in key tables
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM courses;
```

## 3.6 Troubleshooting Installation Issues

**Table 3.5: Installation Troubleshooting Matrix**

| Issue | Cause | Solution |
|-------|-------|----------|
| `npm install` fails with EACCES | Permission denied | Run with proper permissions or fix npm ownership |
| `npx prisma generate` fails | Prisma not installed | Run `npm install` first |
| Port 3001 already in use | Another service using port | Change PORT in .env or kill existing process |
| Port 5173 already in use | Another Vite instance | Change port or kill existing process |
| Database connection error | Invalid DATABASE_URL | Verify path and file permissions |
| Gemini API errors | Invalid/missing API key | Check GEMINI_API_KEY in .env |
| Build fails | TypeScript errors | Run `npx tsc --noEmit` to check errors |
| CORS errors in browser | CORS_ORIGIN misconfigured | Set correct origin in .env |
| File upload fails | Missing uploads directory | Create `public/uploads` folder |
| Module not found errors | Incomplete npm install | Delete node_modules and reinstall |

### 3.6.1 Common Installation Problems

**Problem 1: Node.js Version Mismatch**

```bash
# Error: This requires Node.js version >= 18.0.0

# Solution: Install correct Node.js version using nvm
# Windows:
nvm install 20
nvm use 20

# macOS/Linux:
nvm install 20
nvm use 20
```

**Problem 2: Permission Denied on Windows**

```powershell
# Error: Cannot execute script due to execution policy

# Solution: Adjust PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or bypass for current session
powershell -ExecutionPolicy Bypass -File script.ps1
```

**Problem 3: Prisma Migration Lock Issues**

```bash
# Error: Migration already in progress or locked

# Solution: Reset migration state
npx prisma migrate resolve --rolled-back migration_name
npx prisma migrate dev
```

**Problem 4: Missing Native Modules**

```bash
# Error: Cannot find module 'sqlite3' or similar

# Solution: Rebuild native modules
npm rebuild

# Or force platform-specific install
npm install --platform=win32 --arch=x64
```

### 3.6.2 Verification After Installation

**Post-Installation Test Script:**

```bash
#!/bin/bash
# save as test-installation.sh

echo "ZenithEdu Installation Verification"
echo "===================================="

# Check Node.js
echo -n "Node.js version: "
node --version

# Check npm
echo -n "npm version: "
npm --version

# Check Prisma
echo -n "Prisma version: "
npx prisma --version

# Check environment file
if [ -f .env ]; then
    echo "Environment file: OK"
else
    echo "Environment file: MISSING"
fi

# Test backend
echo "Testing backend..."
curl -s http://localhost:3001/api/test > /dev/null && echo "Backend: RUNNING" || echo "Backend: NOT RUNNING"

echo "===================================="
echo "Verification complete"
```

---

*[End of Chapter 3 - Continue to Chapter 4: System Configuration]*

---

# CHAPTER 4: SYSTEM CONFIGURATION

## 4.1 Configuration File Structures

### 4.1.1 Configuration Files Overview

**Table 4.1: Configuration Files Overview**

| File | Purpose | Location | Format |
|------|---------|----------|--------|
| `.env` | Environment variables | Root directory | Key-value pairs |
| `package.json` | Project dependencies and scripts | Root directory | JSON |
| `tsconfig.json` | TypeScript compiler options | Root directory | JSON |
| `vite.config.ts` | Vite build configuration | Root directory | TypeScript |
| `tailwind.config.js` | Tailwind CSS customization | Root directory | JavaScript |
| `postcss.config.js` | PostCSS plugins | Root directory | JavaScript |
| `prisma/schema.prisma` | Database schema | prisma/ | Prisma DSL |
| `server.js` | Express server configuration | Root directory | JavaScript |

### 4.1.2 Environment Variables Configuration

**Table 4.2: Environment Variables by Category**

#### Application Settings
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Runtime environment | `development`, `production` |
| `PORT` | Backend server port | `3001` |
| `HOST` | Server bind address | `0.0.0.0`, `127.0.0.1` |

#### Database Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Prisma connection string | `file:./prisma/dev.db` |

#### AI Integration
| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `OLLAMA_HOST` | Ollama server URL | `http://localhost:11434` |

#### Security Settings
| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed origins | `https://yourdomain.com` |
| `JWT_SECRET` | Session signing key | `your-secret-key-here` |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

#### File Upload Settings
| Variable | Description | Example |
|----------|-------------|---------|
| `UPLOAD_DIR` | Upload storage path | `./public/uploads` |
| `MAX_FILE_SIZE` | Max file size (bytes) | `5242880` (5MB) |
| `ALLOWED_FILE_TYPES` | Permitted MIME types | `image/jpeg,image/png` |

#### Logging Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging verbosity | `debug`, `info`, `warn`, `error` |
| `LOG_FILE` | Log output file | `./logs/app.log` |

### 4.1.3 TypeScript Configuration

**tsconfig.json Structure:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["components/*"]
    }
  },
  "include": ["src", "components", "lib"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4.1.4 Vite Configuration

**vite.config.ts Structure:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './components'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion'],
        },
      },
    },
  },
});
```

### 4.1.5 Tailwind CSS Configuration

**tailwind.config.js Structure:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

## 4.2 Environment Variables

### 4.2.1 Environment Variable Hierarchy

ZenithEdu follows this priority order for environment variables:

1. **Process Environment** (highest priority)
2. **.env.local** (local overrides)
3. **.env.{NODE_ENV}** (environment-specific)
4. **.env** (default values)

### 4.2.2 Development Environment Variables

```env
# .env.development
NODE_ENV=development
DATABASE_URL="file:./prisma/dev.db"
GEMINI_API_KEY="your_development_api_key"
PORT=3001
CORS_ORIGIN="*"
LOG_LEVEL=debug
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880
JWT_SECRET="dev-secret-key-change-in-production"
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000
```

### 4.2.3 Production Environment Variables

```env
# .env.production
NODE_ENV=production
DATABASE_URL="file:./prisma/prod.db"
GEMINI_API_KEY="your_production_api_key"
PORT=3001
HOST=127.0.0.1
CORS_ORIGIN="https://yourdomain.com"
LOG_LEVEL=warn
UPLOAD_DIR="/var/www/zenithedu/public/uploads"
MAX_FILE_SIZE=10485760
JWT_SECRET="secure-random-string-min-32-chars"
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"
```

## 4.3 API Keys and Credentials Setup

### 4.3.1 Google Gemini API Configuration

**Obtaining API Key:**

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with Google account
3. Navigate to API Keys section
4. Click "Create API Key"
5. Copy the generated key

**Configuration:**

```env
# .env
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

**Verification:**

```bash
# Test API key
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### 4.3.2 Ollama Local AI Setup

**Installation:**

```bash
# macOS
brew install ollama

# Windows (PowerShell)
winget install Ollama.Ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

**Pull Required Models:**

```bash
# Pull Llama 3.1 model
ollama pull llama3.1

# Verify installation
ollama list
```

**Configuration:**

```env
# .env
OLLAMA_HOST="http://localhost:11434"
OLLAMA_MODEL="llama3.1"
```

**Starting Ollama:**

```bash
# Start Ollama service
ollama serve

# Test in separate terminal
ollama run llama3.1
```

## 4.4 Third-Party Service Integration

### 4.4.1 Email Service Configuration (Optional)

**SendGrid Integration:**

```env
# .env
SENDGRID_API_KEY="SG.xxx"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_ENABLED=true
```

### 4.4.2 Cloud Storage Configuration (Optional)

**AWS S3 Integration:**

```env
# .env
S3_BUCKET="zenithedu-uploads"
S3_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
USE_S3_STORAGE=false
```

### 4.4.3 Backup Service Configuration (Optional)

**Automated Backup Settings:**

```env
# .env
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
BACKUP_DESTINATION="s3://bucket/backups"
```

## 4.5 Security Configurations

**Table 4.3: Security Configuration Settings**

| Setting | Description | Recommended Value |
|---------|-------------|-------------------|
| `CORS_ORIGIN` | Allowed request origins | Specific domain, not `*` |
| `RATE_LIMIT_MAX` | Max requests per window | 100 (production) |
| `JWT_SECRET` | Session signing secret | 32+ random characters |
| `MAX_FILE_SIZE` | Maximum upload size | 5-10 MB |
| `ALLOWED_FILE_TYPES` | Permitted MIME types | Strict whitelist |
| `LOG_LEVEL` | Logging verbosity | `warn` in production |
| `X_FRAME_OPTIONS` | Clickjacking protection | `SAMEORIGIN` |
| `X_CONTENT_TYPE_OPTIONS` | MIME sniffing protection | `nosniff` |

### 4.5.1 Security Headers Configuration

**Express.js Security Headers:**

```javascript
// server.js - Security middleware
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (customize as needed)
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://generativelanguage.googleapis.com"
  );
  
  next();
});
```

### 4.5.2 File Upload Security

**Multer Security Configuration:**

```javascript
// server.js - Secure file upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Strict file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 1
  }
});
```

### 4.5.3 Rate Limiting Implementation

```javascript
// server.js - Rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);
```

---

*[End of Chapter 4 - Continue to Chapter 5: Database Design]*

---

# CHAPTER 5: DATABASE DESIGN

## 5.1 Entity-Relationship Overview

### 5.1.1 Database Architecture

ZenithEdu utilizes a relational database architecture managed through Prisma ORM. The database design follows normalization principles to minimize redundancy while maintaining referential integrity across all entities.

### 5.1.2 Database Technology

- **Primary Database:** SQLite (file-based, suitable for small-medium deployments)
- **ORM:** Prisma 6.19
- **Schema Management:** Prisma migrations
- **Alternative:** PostgreSQL (for large-scale deployments)

### 5.1.3 ER Diagram Overview

**Figure 5.1: Entity-Relationship Diagram - Complete Schema**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ZENITHEDU DATABASE SCHEMA                                │
│                    Entity-Relationship Overview                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐                                                               │
│  │    User      │◄─────────────────────────────────────────────────────┐        │
│  │──────────────│                                                      │        │
│  │ id (PK)      │                                                      │        │
│  │ name         │                                                      │        │
│  │ email (UQ)   │                                                      │        │
│  │ role         │                                                      │        │
│  │ avatar       │                                                      │        │
│  │ department   │                                                      │        │
│  │ createdAt    │                                                      │        │
│  └──────┬───────┘                                                      │        │
│         │ 1:1                                                          │        │
│         ▼                                                              │        │
│  ┌──────────────┐      1:N      ┌──────────────┐      N:M     ┌──────┴──────┐│
│  │   Student    │◄───────────────│ CourseStudent│──────────────►│    Course   ││
│  │──────────────│               │──────────────│               │─────────────││
│  │ id (PK)      │               │ id (PK)      │               │ id (PK)     ││
│  │ rollNo (UQ)  │               │ courseId(FK) │               │ name        ││
│  │ userId (FK)  │               │ studentId(FK)│               │ code (UQ)   ││
│  │ department   │               │ enrolledAt   │               │ instructorId││
│  │ cgpa         │               └──────────────┘               │ credits     ││
│  │ attendance   │                                               │ progress    ││
│  └──────┬───────┘                                               └─────────────┘│
│         │                                                                        │
│         │ 1:N                                                                    │
│         ▼                                                                        │
│  ┌──────────────┐      1:N      ┌──────────────┐      N:1     ┌──────────────┐  │
│  │  Attendance  │◄──────────────│    Course    │              │    User      │  │
│  │──────────────│               │ (instructor) │              │ (Teacher)    │  │
│  │ id (PK)      │               └──────────────┘              └──────────────┘  │
│  │ studentId(FK)│                                                                 │
│  │ date         │      1:N      ┌──────────────┐      1:N     ┌──────────────┐  │
│  │ status       │──────────────►│  Assignment  │────────────►│  Submission  │  │
│  │ subject      │               │──────────────│               │──────────────│  │
│  └──────────────┘               │ id (PK)      │               │ id (PK)      │  │
│                                 │ teacherId(FK)│               │ assignmentId │  │
│  ┌──────────────┐               │ courseCode   │               │ studentId(FK)│  │
│  │  FeeRecord   │               │ dueDate      │               │ score        │  │
│  │──────────────│               │ maxScore     │               │ status       │  │
│  │ id (PK)      │               └──────────────┘               └──────────────┘  │
│  │ studentId(FK)│                                                                 │
│  │ amount       │      1:N      ┌──────────────┐                                  │
│  │ status       │──────────────►│   Notice     │                                  │
│  └──────────────┘               │──────────────│                                  │
│                                 │ id (PK)      │                                  │
│  ┌──────────────┐               │ authorId(FK) │                                  │
│  │ HostelRoom   │               │ priority     │                                  │
│  │──────────────│               └──────────────┘                                  │
│  │ id (PK)      │                                                                 │
│  │ number (UQ)  │                                                                 │
│  │ type         │                                                                 │
│  │ capacity     │                                                                 │
│  │ occupied     │      1:N      ┌──────────────┐                                  │
│  └──────────────┘               │   BusRoute   │                                  │
│                                 │──────────────│                                  │
│  ┌──────────────┐               │ id (PK)      │                                  │
│  │     Book     │               │ routeNumber  │                                  │
│  │──────────────│               │ destination  │                                  │
│  │ id (PK)      │               └──────────────┘                                  │
│  │ title        │                                                                 │
│  │ author       │      1:N      ┌──────────────┐                                  │
│  │ status       │               │  LiveClass   │                                  │
│  └──────────────┘               │──────────────│                                  │
│                                 │ id (PK)      │                                  │
│  ┌──────────────┐               │ platform     │                                  │
│  │ Appointment  │               │ meetingLink  │                                  │
│  │──────────────│               └──────────────┘                                  │
│  │ id (PK)      │                                                                 │
│  │ studentId    │                                                                 │
│  │ teacherId    │                                                                 │
│  │ status       │                                                                 │
│  └──────────────┘                                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Table 5.1: Database Table Summary**

| Table Name | Purpose | Primary Key | Record Count (Typical) |
|------------|---------|-------------|----------------------|
| `users` | User accounts and authentication | `id` (CUID) | 50-500 |
| `students` | Student academic records | `id` (CUID) | 100-5000 |
| `courses` | Course catalog and details | `id` (CUID) | 20-200 |
| `course_students` | Enrollment junction table | `id` (CUID) | 1000-10000 |
| `assignments` | Academic assignments | `id` (CUID) | 100-1000 |
| `submissions` | Student assignment submissions | `id` (CUID) | 500-5000 |
| `attendance` | Daily attendance records | `id` (CUID) | 10000-100000 |
| `books` | Library book inventory | `id` (CUID) | 500-5000 |
| `hostel_rooms` | Hostel room inventory | `id` (CUID) | 50-500 |
| `bus_routes` | Transportation routes | `id` (CUID) | 5-50 |
| `fee_records` | Fee payment records | `id` (CUID) | 1000-10000 |
| `live_classes` | Online class schedules | `id` (CUID) | 50-500 |
| `notices` | System announcements | `id` (CUID) | 50-200 |
| `appointments` | Student-teacher meetings | `id` (CUID) | 100-1000 |
| `timetable` | Class schedules | `id` (CUID) | 200-1000 |
| `time_slots` | Available appointment slots | `id` (CUID) | 500-2000 |

## 5.2 Table Schema Details

### 5.2.1 User Table Schema

**Table 5.2: User Table Schema**

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | String | PK, CUID | Unique user identifier |
| `name` | String | NOT NULL | User's full name |
| `email` | String | UQ, NOT NULL | Email address (unique) |
| `role` | Enum | NOT NULL | UserRole: Admin, Teacher, Student, Parent |
| `avatar` | String | NOT NULL | Profile picture URL |
| `department` | String | Nullable | Department/division |
| `specialization` | String | Nullable | Area of expertise |
| `experience` | Int | Nullable, Default 0 | Years of experience |
| `createdAt` | DateTime | Default now() | Account creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

**Prisma Schema Definition:**

```prisma
model User {
  id             String       @id @default(cuid())
  name           String
  email          String       @unique
  role           UserRole
  avatar         String
  department     String?      @default("")
  specialization String?      @default("")
  experience     Int?         @default(0)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  assignments    Assignment[]
  courses        Course[]
  notices        Notice[]
  student        Student?

  @@map("users")
}
```

**Relationships:**
- One-to-One with `Student` (via `student.userId`)
- One-to-Many with `Assignment` (as teacher)
- One-to-Many with `Course` (as instructor)
- One-to-Many with `Notice` (as author)

### 5.2.2 Student Table Schema

**Table 5.3: Student Table Schema**

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | String | PK, CUID | Unique student identifier |
| `name` | String | NOT NULL | Student's full name |
| `rollNo` | String | UQ, NOT NULL | Roll number (unique) |
| `department` | String | NOT NULL | Academic department |
| `attendance` | Float | Default 0 | Attendance percentage |
| `presentDays` | Int | Default 0 | Total present days |
| `absentDays` | Int | Default 0 | Total absent days |
| `lateDays` | Int | Default 0 | Total late arrivals |
| `cgpa` | Float | Default 0 | Cumulative GPA |
| `feesStatus` | Enum | Default Pending | Payment status |
| `status` | Enum | Default Active | Enrollment status |
| `userId` | String | UQ, FK | Link to users table |
| `overallAssignmentScore` | Float | Default 0 | Aggregate assignment score |
| `createdAt` | DateTime | Default now() | Enrollment date |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

**Prisma Schema Definition:**

```prisma
model Student {
  id                     String          @id @default(cuid())
  name                   String
  rollNo                 String          @unique
  department             String
  attendance             Float           @default(0)
  presentDays            Int             @default(0)
  absentDays             Int             @default(0)
  lateDays               Int             @default(0)
  cgpa                   Float           @default(0)
  feesStatus             FeesStatus      @default(Pending)
  status                 StudentStatus   @default(Active)
  userId                 String          @unique
  overallAssignmentScore Float           @default(0)
  createdAt              DateTime        @default(now())
  updatedAt              DateTime        @updatedAt
  attendanceRecords      Attendance[]
  courses                CourseStudent[]
  feeRecords             FeeRecord[]
  user                   User            @relation(fields: [userId], references: [id])
  submissions            Submission[]

  @@map("students")
}
```

**Relationships:**
- One-to-One with `User`
- One-to-Many with `Attendance`
- Many-to-Many with `Course` (via `CourseStudent`)
- One-to-Many with `FeeRecord`
- One-to-Many with `Submission`

### 5.2.3 Course and Academic Tables

**Table 5.4: Course and Academic Tables**

#### Course Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Course identifier |
| `name` | String | NOT NULL | Course name |
| `code` | String | UQ, NOT NULL | Course code (e.g., CS101) |
| `instructor` | String | NOT NULL | Instructor name display |
| `credits` | Int | NOT NULL | Credit hours |
| `progress` | Float | Default 0 | Course completion % |
| `instructorId` | String | FK | Link to users table |
| `createdAt` | DateTime | Default now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Update timestamp |

#### CourseStudent (Junction) Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Record identifier |
| `courseId` | String | FK | Reference to course |
| `studentId` | String | FK | Reference to student |
| `enrolledAt` | DateTime | Default now() | Enrollment timestamp |
| **Unique Constraint** | (`courseId`, `studentId`) | | |

**Prisma Schema Definition:**

```prisma
model Course {
  id             String          @id @default(cuid())
  name           String
  code           String          @unique
  instructor     String
  credits        Int
  progress       Float           @default(0)
  instructorId   String
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  students       CourseStudent[]
  instructorUser User            @relation(fields: [instructorId], references: [id])

  @@map("courses")
}

model CourseStudent {
  id         String   @id @default(cuid())
  courseId   String
  studentId  String
  enrolledAt DateTime @default(now())
  student    Student  @relation(fields: [studentId], references: [id])
  course     Course   @relation(fields: [courseId], references: [id])

  @@unique([courseId, studentId])
  @@map("course_students")
}
```

### 5.2.4 Library Management Tables

**Table 5.5: Library Management Tables**

#### Book Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Book identifier |
| `title` | String | NOT NULL | Book title |
| `author` | String | NOT NULL | Author name |
| `category` | String | NOT NULL | Book category |
| `status` | Enum | Default Available | Availability status |
| `coverUrl` | String | NOT NULL | Book cover image URL |
| `rating` | Float | Nullable | Average rating |
| `views` | Int | Default 0 | View count |
| `createdAt` | DateTime | Default now() | Addition timestamp |
| `updatedAt` | DateTime | Auto-updated | Update timestamp |

**Prisma Schema Definition:**

```prisma
model Book {
  id        String     @id @default(cuid())
  title     String
  author    String
  category  String
  status    BookStatus @default(Available)
  coverUrl  String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  rating    Float?     @default(0)
  views     Int?       @default(0)

  @@map("books")
}
```

### 5.2.5 Hostel Management Tables

**Table 5.6: Hostel Management Tables**

#### HostelRoom Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Room identifier |
| `number` | String | UQ, NOT NULL | Room number |
| `type` | Enum | Default Single | Room type |
| `capacity` | Int | NOT NULL | Max occupants |
| `occupied` | Int | Default 0 | Current occupants |
| `floor` | Int | NOT NULL | Floor number |
| `status` | Enum | Default Available | Room status |
| `fee` | Float | NOT NULL | Monthly fee |
| `createdAt` | DateTime | Default now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Update timestamp |

**Prisma Schema Definition:**

```prisma
model HostelRoom {
  id        String     @id @default(cuid())
  number    String     @unique
  type      RoomType   @default(Single)
  capacity  Int
  occupied  Int        @default(0)
  floor     Int
  status    RoomStatus @default(Available)
  fee       Float
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@map("hostel_rooms")
}
```

## 5.3 Relationships and Constraints

### 5.3.1 Referential Integrity

All foreign key relationships enforce referential integrity:

```prisma
// Example: Student-User relationship
model Student {
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Cascade Behaviors:**
- `onDelete: Cascade` - Deleting parent deletes child
- `onDelete: SetNull` - Sets FK to null when parent deleted
- `onDelete: Restrict` - Prevents parent deletion if children exist

### 5.3.2 Unique Constraints

| Table | Constraint | Purpose |
|-------|------------|---------|
| `users` | `email` | Prevent duplicate accounts |
| `students` | `rollNo` | Unique student identification |
| `students` | `userId` | One-to-one with users |
| `courses` | `code` | Unique course codes |
| `course_students` | (`courseId`, `studentId`) | Prevent duplicate enrollments |
| `hostel_rooms` | `number` | Unique room numbers |
| `bus_routes` | `routeNumber` | Unique route identifiers |
| `fee_records` | `invoiceId` | Unique invoice numbers |

### 5.3.3 Check Constraints (Application-Level)

```javascript
// server.js - Validation examples
// Attendance percentage must be 0-100
if (attendance < 0 || attendance > 100) {
  throw new Error('Attendance must be between 0 and 100');
}

// CGPA must be 0-10
if (cgpa < 0 || cgpa > 10) {
  throw new Error('CGPA must be between 0 and 10');
}

// Room occupancy cannot exceed capacity
if (occupied > capacity) {
  throw new Error('Occupancy cannot exceed capacity');
}
```

## 5.4 Enumeration Types

**Table 5.7: Enumeration Types Reference**

### UserRole Enum
```prisma
enum UserRole {
  Admin      // Full system access
  Teacher    // Academic management
  Student    // Learning access
  Parent     // View-only child access
}
```

### StudentStatus Enum
```prisma
enum StudentStatus {
  Active     // Currently enrolled
  Inactive   // Not currently enrolled
}
```

### FeesStatus Enum
```prisma
enum FeesStatus {
  Paid       // Payment completed
  Pending    // Payment awaited
  Overdue    // Payment past due
}
```

### Priority Enum
```prisma
enum Priority {
  High       // Urgent notice
  Medium     // Standard notice
  Low        // Informational
}
```

### BookStatus Enum
```prisma
enum BookStatus {
  Available  // Ready for issue
  Issued     // Currently borrowed
  Reserved   // Reserved for pickup
}
```

### RoomType Enum
```prisma
enum RoomType {
  Single     // One occupant
  Double     // Two occupants
  Shared     // Multiple occupants
}
```

### RoomStatus Enum
```prisma
enum RoomStatus {
  Available  // Ready for allocation
  Full       // At capacity
  Maintenance // Under repair
}
```

### RouteStatus Enum
```prisma
enum RouteStatus {
  OnTime     // Running on schedule
  Delayed    // Behind schedule
  Departed   // Already left
}
```

### ClassStatus Enum
```prisma
enum ClassStatus {
  Live       // Currently active
  Upcoming   // Scheduled future
  Ended      // Completed
}
```

### Platform Enum
```prisma
enum Platform {
  Zoom
  GoogleMeet
  MicrosoftTeams
  Other
}
```

### AttendanceStatus Enum
```prisma
enum AttendanceStatus {
  Present
  Absent
  Late
}
```

### AssignmentType Enum
```prisma
enum AssignmentType {
  Homework
  Quiz
  Project
  Exam
  Lab
}
```

### AssignmentStatus Enum
```prisma
enum AssignmentStatus {
  Draft      // Not yet published
  Published  // Active for submission
  Closed     // No longer accepting
}
```

### SubmissionStatus Enum
```prisma
enum SubmissionStatus {
  Draft      // Work in progress
  Submitted  // Turned in
  Graded     // Evaluated
  Returned   // Sent back to student
}
```

### AppointmentStatus Enum
```prisma
enum AppointmentStatus {
  Pending    // Awaiting approval
  Approved   // Confirmed
  Rejected   // Declined
  Completed  // Finished
  Cancelled  // Called off
}
```

## 5.5 Indexing Strategy

### 5.5.1 Automatic Indexes (Prisma)

Prisma automatically creates indexes for:
- Primary keys (always indexed)
- Unique constraints (always indexed)
- Foreign keys (indexed by default)

### 5.5.2 Performance Indexes

```prisma
// Additional indexes for performance
model Attendance {
  id        String   @id @default(cuid())
  studentId String
  date      DateTime
  
  // Composite index for date-range queries
  @@index([studentId, date])
  
  // Index for monthly reports
  @@index([date])
}

model FeeRecord {
  id        String   @id @default(cuid())
  studentId String
  dueDate   DateTime
  status    FeesStatus
  
  // Index for overdue queries
  @@index([status, dueDate])
}
```

## 5.6 Backup and Recovery Procedures

### 5.6.1 Database Backup

**SQLite File Backup:**

```bash
# Create backup directory
mkdir -p backups

# SQLite backup (file copy)
cp prisma/dev.db backups/dev-$(date +%Y%m%d-%H%M%S).db

# Or use SQLite's backup command
sqlite3 prisma/dev.db ".backup backups/dev-backup.db"
```

**Automated Backup Script:**

```bash
#!/bin/bash
# save as backup-db.sh

BACKUP_DIR="./backups"
DB_FILE="./prisma/dev.db"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dev-$DATE.db"

# Create backup
mkdir -p $BACKUP_DIR
cp $DB_FILE $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "*.db.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### 5.6.2 Database Recovery

```bash
# Restore from backup
cp backups/dev-20250311-120000.db prisma/dev.db

# Restart application
npm run server
```

### 5.6.3 Prisma Migration Recovery

```bash
# Reset migrations (development only)
npx prisma migrate reset

# Resolve failed migration
npx prisma migrate resolve --rolled-back migration_name

# Deploy pending migrations
npx prisma migrate deploy
```

---

*[End of Chapter 5 - Continue to Chapter 6: API Documentation]*

---

# CHAPTER 6: API DOCUMENTATION

## 6.1 API Overview

### 6.1.1 API Architecture

ZenithEdu exposes a RESTful API built on Express.js that follows standard HTTP conventions and JSON data exchange formats. The API is organized around resources (users, students, courses, etc.) with predictable URL patterns.

**API Base URL:**
- Development: `http://localhost:3001/api`
- Production: `https://yourdomain.com/api`

### 6.1.2 API Versioning

Current API Version: **v1** (implicit)

All endpoints are prefixed with `/api/`. Future versions may be introduced with `/api/v2/` prefix while maintaining backward compatibility.

### 6.1.3 API Endpoints Summary

**Table 6.1: API Endpoints Summary**

| Category | Base Path | Methods | Description |
|----------|-----------|---------|-------------|
| System | `/api/test` | GET | Health check |
| System | `/api/system-stats` | GET | System statistics |
| Users | `/api/users` | GET, POST, PUT, DELETE | User management |
| Teachers | `/api/teachers` | GET | Teacher listing |
| Students | `/api/students` | GET, POST, PUT, DELETE | Student management |
| Courses | `/api/courses` | GET, POST, PUT, DELETE | Course management |
| Library | `/api/books` | GET, POST, PUT, DELETE | Book management |
| Transport | `/api/routes` | GET, POST, PUT, DELETE | Bus routes |
| Fees | `/api/fees` | GET, POST, PUT, DELETE | Fee records |
| Attendance | `/api/attendance` | GET, POST | Attendance tracking |
| Assignments | `/api/assignments` | GET, POST, PUT, DELETE | Assignment management |
| Submissions | `/api/submissions` | GET, POST, PUT | Student submissions |
| Notices | `/api/notices` | GET, POST, PUT, DELETE | Notice board |
| Hostel | `/api/hostel` | GET, POST, PUT, DELETE | Hostel rooms |
| Live Classes | `/api/live-classes` | GET, POST, PUT, DELETE | Online classes |
| Appointments | `/api/appointments` | GET, POST, PUT, DELETE | Scheduling |
| Timetable | `/api/timetable` | GET, POST, PUT, DELETE | Class schedules |
| Uploads | `/api/upload-*` | POST | File uploads |
| Chat | `/api/chat` | POST | AI assistant |

## 6.2 Authentication and Authorization

### 6.2.1 Authentication Flow

**Figure 6.1: API Authentication Flow**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Client    │────▶│   Frontend   │────▶│   Backend    │────▶│   Database   │
│  Application │     │   (React)    │     │   (Express)  │     │   (Prisma)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │                     │
       │ 1. Login Request    │                     │                     │
       │────────────────────▶│                     │                     │
       │                     │                     │                     │
       │                     │ 2. POST /api/auth/login                     │
       │                     │────────────────────▶│                     │
       │                     │                     │                     │
       │                     │                     │ 3. Validate           │
       │                     │                     │    Credentials        │
       │                     │                     │────────────────────▶│
       │                     │                     │                     │
       │                     │                     │ 4. Return User Data │
       │                     │                     │◀────────────────────│
       │                     │                     │                     │
       │                     │ 5. Generate         │                     │
       │                     │    Session/Token    │                     │
       │                     │                     │                     │
       │                     │ 6. Return Token     │                     │
       │                     │◀────────────────────│                     │
       │                     │                     │                     │
       │ 7. Store Token      │                     │                     │
       │    (localStorage/   │                     │                     │
       │     Context)        │                     │                     │
       │◀────────────────────│                     │                     │
       │                     │                     │                     │
       │                     │                     │                     │
       │ 8. Authenticated    │                     │                     │
       │    Request + Token  │                     │                     │
       │────────────────────▶│                     │                     │
       │                     │ 9. Verify Token     │                     │
       │                     │────────────────────▶│                     │
       │                     │                     │                     │
       │                     │                     │ 10. Validate         │
       │                     │                     │     Session          │
       │                     │                     │────────────────────▶│
       │                     │                     │                     │
       │                     │                     │ 11. Return Auth OK  │
       │                     │                     │◀────────────────────│
       │                     │                     │                     │
       │                     │ 12. Process Request │                     │
       │                     │◀────────────────────│                     │
       │                     │                     │                     │
       │ 13. Return Data     │                     │                     │
       │◀────────────────────│                     │                     │
```

### 6.2.2 Session-Based Authentication

ZenithEdu currently uses session-based authentication with the following implementation:

```javascript
// Authentication middleware example (server.js)
const authenticateUser = (req, res, next) => {
  // Session validation logic
  const sessionToken = req.headers.authorization || req.session.token;
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Validate token against stored sessions
  // Implementation depends on session store
  
  next();
};
```

### 6.2.3 Role-Based Access Control

**Table 6.4: User Role Permissions Matrix**

| Endpoint | Admin | Teacher | Student | Parent |
|----------|-------|---------|---------|--------|
| `POST /api/users` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/users` | ✅ | ❌ | ❌ | ❌ |
| `PUT /api/users/:id` | ✅ | Own only | Own only | Own only |
| `DELETE /api/users/:id` | ✅ | ❌ | ❌ | ❌ |
| `POST /api/students` | ✅ | ✅ | ❌ | ❌ |
| `GET /api/students` | ✅ | ✅ | Own only | Own child only |
| `PUT /api/students/:id` | ✅ | ✅ | Own only | ❌ |
| `POST /api/courses` | ✅ | ✅ | ❌ | ❌ |
| `GET /api/courses` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/assignments` | ✅ | ✅ | ❌ | ❌ |
| `GET /api/assignments` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/attendance` | ✅ | ✅ | ❌ | ❌ |
| `GET /api/attendance` | ✅ | ✅ | Own only | Own child only |
| `POST /api/fees` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/fees` | ✅ | ✅ | Own only | Own child only |

## 6.3 Request/Response Formats

### 6.3.1 Standard Request Format

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (when authenticated)
```

**Request Body Structure:**
```json
{
  "fieldName": "value",
  "numericField": 123,
  "booleanField": true,
  "arrayField": ["item1", "item2"],
  "objectField": {
    "nestedKey": "nestedValue"
  }
}
```

### 6.3.2 Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data object or array
  },
  "message": "Operation completed successfully",
  "timestamp": "2026-03-11T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "details": {
      // Additional error context
    }
  },
  "timestamp": "2026-03-11T10:30:00.000Z"
}
```

### 6.3.3 HTTP Status Codes Reference

**Table 6.2: HTTP Status Codes Reference**

| Status Code | Meaning | Usage Context |
|-------------|---------|---------------|
| 200 OK | Successful GET, PUT, DELETE | Standard success response |
| 201 Created | Successful POST | New resource created |
| 204 No Content | Successful with no body | Delete operations |
| 400 Bad Request | Invalid request format | Validation errors |
| 401 Unauthorized | Authentication required | Missing/invalid token |
| 403 Forbidden | Insufficient permissions | Valid token, no access |
| 404 Not Found | Resource doesn't exist | Invalid ID/URL |
| 409 Conflict | Resource already exists | Duplicate entries |
| 422 Unprocessable | Semantic errors | Invalid data values |
| 500 Internal Error | Server error | Unexpected failures |
| 503 Service Unavailable | Temporarily unavailable | Maintenance/overload |

### 6.3.4 Error Codes and Descriptions

**Table 6.3: Error Codes and Descriptions**

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication token missing |
| `AUTH_INVALID` | 401 | Invalid or expired token |
| `PERMISSION_DENIED` | 403 | User lacks required role |
| `USER_NOT_FOUND` | 404 | User ID does not exist |
| `STUDENT_NOT_FOUND` | 404 | Student ID does not exist |
| `COURSE_NOT_FOUND` | 404 | Course ID/code not found |
| `DUPLICATE_EMAIL` | 409 | Email already registered |
| `DUPLICATE_ROLLNO` | 409 | Roll number already exists |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `FILE_TOO_LARGE` | 422 | Upload exceeds size limit |
| `INVALID_FILE_TYPE` | 422 | Unsupported file format |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## 6.4 API Endpoint Documentation

### 6.4.1 System Endpoints

#### GET /api/test
**Purpose:** Health check endpoint

**Response:**
```json
{
  "message": "API is working!",
  "timestamp": "2026-03-11T10:30:00.000Z"
}
```

#### GET /api/system-stats
**Purpose:** Retrieve system statistics for dashboard

**Response:**
```json
{
  "students": 124,
  "courses": 15,
  "liveClasses": 6,
  "books": 450,
  "teachers": 12,
  "avgAttendance": 94
}
```

### 6.4.2 User Management Endpoints

**Table 6.4: Authentication Endpoints**

#### GET /api/users
**Purpose:** List all users

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | Filter by role (Admin, Teacher, Student, Parent) |
| `department` | string | Filter by department |
| `search` | string | Search by name or email |

**Response:**
```json
[
  {
    "id": "clrq1234567890abcdef",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "Teacher",
    "avatar": "/uploads/avatar-123.jpg",
    "department": "Computer Science",
    "specialization": "AI/ML",
    "experience": 8,
    "createdAt": "2026-01-15T08:30:00.000Z"
  }
]
```

#### POST /api/users
**Purpose:** Create new user

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "Student",
  "avatar": "https://ui-avatars.com/api/?name=Jane+Doe",
  "department": "Electronics",
  "specialization": "VLSI Design"
}
```

**Response:**
```json
{
  "id": "clrq0987654321fedcba",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "Student",
  "createdAt": "2026-03-11T10:30:00.000Z"
}
```

### 6.4.3 Student Management Endpoints

**Table 6.5: Student API Endpoints**

#### GET /api/students
**Purpose:** List all students with filtering

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `department` | string | Filter by department |
| `status` | string | Filter by status (Active, Inactive) |
| `cgpa_min` | float | Minimum CGPA filter |
| `attendance_min` | float | Minimum attendance % |

**Response:**
```json
[
  {
    "id": "clrqstudent123456",
    "name": "Alice Johnson",
    "rollNo": "CS2024001",
    "department": "Computer Science",
    "attendance": 92.5,
    "cgpa": 8.75,
    "feesStatus": "Paid",
    "status": "Active",
    "userId": "clrquser123456"
  }
]
```

#### POST /api/students
**Purpose:** Enroll new student

**Request Body:**
```json
{
  "name": "Bob Williams",
  "rollNo": "EC2024002",
  "department": "Electronics",
  "email": "bob@example.com",
  "role": "Student"
}
```

### 6.4.4 Course Management Endpoints

**Table 6.6: Course API Endpoints**

#### GET /api/courses
**Purpose:** List all courses

**Response:**
```json
[
  {
    "id": "clrqcourse123456",
    "name": "Database Management Systems",
    "code": "CS301",
    "instructor": "Dr. Sarah Chen",
    "credits": 4,
    "progress": 65,
    "instructorId": "clrqteacher123456"
  }
]
```

#### POST /api/courses
**Purpose:** Create new course

**Request Body:**
```json
{
  "name": "Machine Learning Fundamentals",
  "code": "CS401",
  "instructor": "Dr. Sarah Chen",
  "credits": 3,
  "instructorId": "clrqteacher123456"
}
```

### 6.4.5 Library Management Endpoints

**Table 6.7: Library API Endpoints**

#### GET /api/books
**Purpose:** List all books with filters

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `status` | string | Filter by availability |
| `search` | string | Search title or author |

**Response:**
```json
[
  {
    "id": "clrqbook123456",
    "title": "Introduction to Algorithms",
    "author": "CLRS",
    "category": "Computer Science",
    "status": "Available",
    "coverUrl": "/uploads/book-cover-123.jpg",
    "rating": 4.8,
    "views": 1250
  }
]
```

#### POST /api/books
**Purpose:** Add new book to library

**Request Body:**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Software Engineering",
  "coverUrl": "https://example.com/clean-code.jpg"
}
```

### 6.4.6 Attendance Endpoints

**Table 6.8: Attendance API Endpoints**

#### GET /api/attendance
**Purpose:** Retrieve attendance records

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `studentId` | string | Filter by student |
| `date` | string | Filter by date (YYYY-MM-DD) |
| `subject` | string | Filter by subject |
| `startDate` | string | Date range start |
| `endDate` | string | Date range end |

**Response:**
```json
[
  {
    "id": "clrqatt123456",
    "studentId": "clrqstudent123",
    "studentName": "Alice Johnson",
    "date": "2026-03-10T00:00:00.000Z",
    "status": "Present",
    "subject": "Database Systems",
    "markedBy": "Dr. Sarah Chen"
  }
]
```

#### POST /api/attendance
**Purpose:** Mark attendance

**Request Body:**
```json
{
  "studentId": "clrqstudent123",
  "date": "2026-03-11",
  "status": "Present",
  "subject": "Database Systems",
  "markedByTeacher": "Dr. Sarah Chen"
}
```

### 6.4.7 Assignment Endpoints

**Table 6.9: Assignment API Endpoints**

#### GET /api/assignments
**Purpose:** List assignments

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `teacherId` | string | Filter by creator |
| `courseCode` | string | Filter by course |
| `status` | string | Filter by status |

**Response:**
```json
[
  {
    "id": "clrqassign123456",
    "title": "Normalization Exercise",
    "description": "Solve problems 1-10 from Chapter 3",
    "subject": "Database Systems",
    "courseCode": "CS301",
    "dueDate": "2026-03-20T23:59:00.000Z",
    "maxScore": 100,
    "type": "Homework",
    "status": "Published",
    "teacherId": "clrqteacher123456"
  }
]
```

#### POST /api/assignments
**Purpose:** Create new assignment

**Request Body:**
```json
{
  "title": "SQL Query Practice",
  "description": "Write queries for the given scenarios",
  "subject": "Database Systems",
  "courseCode": "CS301",
  "dueDate": "2026-03-25T23:59:00Z",
  "maxScore": 50,
  "type": "Homework",
  "teacherId": "clrqteacher123456"
}
```

### 6.4.8 Transport Endpoints

**Table 6.10: Transport API Endpoints**

#### GET /api/routes
**Purpose:** List all bus routes

**Response:**
```json
[
  {
    "id": "clrqroute123456",
    "routeNumber": "R01",
    "destination": "City Center",
    "driver": "Mr. Johnson",
    "departureTime": "07:30",
    "status": "OnTime"
  }
]
```

#### POST /api/routes
**Purpose:** Add new bus route

**Request Body:**
```json
{
  "routeNumber": "R05",
  "destination": "North Campus",
  "driver": "Mr. Smith",
  "departureTime": "08:00",
  "status": "OnTime"
}
```

### 6.4.9 Fee Management Endpoints

**Table 6.11: Fee Management API Endpoints**

#### GET /api/fees
**Purpose:** List fee records

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `studentId` | string | Filter by student |
| `status` | string | Filter by payment status |
| `type` | string | Filter by fee type |

**Response:**
```json
[
  {
    "id": "clrqfee123456",
    "type": "Tuition",
    "amount": 50000,
    "dueDate": "2026-01-15T00:00:00.000Z",
    "status": "Paid",
    "invoiceId": "INV-2026-001",
    "studentId": "clrqstudent123"
  }
]
```

## 6.5 Sample API Calls with Examples

### 6.5.1 Complete User Creation Example

**Request:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Michael Brown",
    "email": "michael.brown@university.edu",
    "role": "Teacher",
    "avatar": "https://ui-avatars.com/api/?name=Michael+Brown",
    "department": "Computer Science",
    "specialization": "Artificial Intelligence",
    "experience": 10
  }'
```

**Response:**
```json
{
  "id": "clrq9876543210abcdef",
  "name": "Dr. Michael Brown",
  "email": "michael.brown@university.edu",
  "role": "Teacher",
  "avatar": "https://ui-avatars.com/api/?name=Michael+Brown",
  "department": "Computer Science",
  "specialization": "Artificial Intelligence",
  "experience": 10,
  "createdAt": "2026-03-11T10:45:30.000Z",
  "updatedAt": "2026-03-11T10:45:30.000Z"
}
```

### 6.5.2 Attendance Marking Example

**Request:**
```bash
curl -X POST http://localhost:3001/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "clrqstudent123",
    "studentName": "Alice Johnson",
    "date": "2026-03-11",
    "status": "Present",
    "subject": "Database Systems",
    "markedBy": "teacher123",
    "markedByTeacher": "Dr. Sarah Chen"
  }'
```

**Response:**
```json
{
  "id": "clrqatt789012",
  "studentId": "clrqstudent123",
  "studentName": "Alice Johnson",
  "date": "2026-03-11T00:00:00.000Z",
  "status": "Present",
  "subject": "Database Systems",
  "markedBy": "teacher123",
  "markedByTeacher": "Dr. Sarah Chen",
  "createdAt": "2026-03-11T10:45:30.000Z"
}
```

### 6.5.3 File Upload Example

**Request:**
```bash
curl -X POST http://localhost:3001/api/upload-assignment-file \
  -F "file=@assignment.pdf"
```

**Response:**
```json
{
  "success": true,
  "url": "/uploads/file-1710158730000-123456789.pdf"
}
```

### 6.5.4 Chat Assistant Example

**Request:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the library hours?",
    "context": "library_hours"
  }'
```

**Response:**
```json
{
  "response": "The library is open from 8:00 AM to 10:00 PM on weekdays, and 9:00 AM to 6:00 PM on weekends.",
  "source": "gemini",
  "timestamp": "2026-03-11T10:45:30.000Z"
}
```

## 6.6 Error Handling

### 6.6.1 Error Response Structure

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email address is already registered",
    "field": "email",
    "details": {
      "existingUser": "user@example.com"
    }
  },
  "timestamp": "2026-03-11T10:45:30.000Z",
  "requestId": "req-1234567890"
}
```

### 6.6.2 Common Error Scenarios

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "errors": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      },
      {
        "field": "credits",
        "message": "Must be between 1 and 6"
      }
    ]
  }
}
```

**Not Found Error:**
```json
{
  "success": false,
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Student with ID 'clrqinvalid123' not found",
    "resource": "student",
    "id": "clrqinvalid123"
  }
}
```

---

*[End of Chapter 6 - Continue to Chapter 7: System Administration]*

---

# CHAPTER 7: SYSTEM ADMINISTRATION

## 7.1 User Management Procedures

### 7.1.1 Creating User Accounts

**Table 7.1: User Role Permissions Matrix**

| Action | Admin | Teacher | Notes |
|--------|-------|---------|-------|
| Create Admin | ✅ | ❌ | Requires highest privileges |
| Create Teacher | ✅ | ❌ | Admin only |
| Create Student | ✅ | ✅ | Teachers can create in their dept |
| Create Parent | ✅ | ❌ | Linked to student records |
| Edit Any User | ✅ | ❌ | Full system access |
| Edit Own Profile | ✅ | ✅ | All users can edit own |
| Delete Users | ✅ | ❌ | Admin only |

### 7.1.2 Account Creation Workflow

```
1. Admin/Teacher logs into system
   ↓
2. Navigate to Users → Add New User
   ↓
3. Fill required information:
   - Name (required)
   - Email (required, unique)
   - Role (required)
   - Department (optional)
   - Specialization (for teachers)
   ↓
4. System validates email uniqueness
   ↓
5. If role=Student:
   - Auto-generate Roll Number
   - Create linked Student record
   ↓
6. Send welcome notification
   ↓
7. User account active
```

### 7.1.3 Bulk User Import

**CSV Format for Import:**
```csv
name,email,role,department,specialization,experience
"Dr. Smith","smith@edu.edu","Teacher","CS","AI",8
"Alice Johnson","alice@edu.edu","Student","CS","",0
"Bob Williams","bob@edu.edu","Student","EC","",0
```

**Import Command:**
```bash
# Using Prisma seed script
npx prisma db seed -- --import-users users.csv
```

## 7.2 System Monitoring and Logging

### 7.2.1 Monitoring Dashboard

**Figure 7.1: System Monitoring Dashboard Structure**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM MONITORING DASHBOARD                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Active Users │  │ API Requests │  │ Error Rate   │         │
│  │     24       │  │   1,234      │  │    0.5%      │         │
│  │  ↑ 12%       │  │  ↑ 8%        │  │  ↓ 50%       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                   Database Metrics                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │ DB Size    │  │ Table Rows │  │ Connections│        │  │
│  │  │ 45.2 MB    │  │ 12,450     │  │ 5 active   │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                   Recent Error Logs                      │  │
│  │  [2026-03-11 10:30:15] ERROR: Database timeout         │  │
│  │  [2026-03-11 10:25:42] WARN: Slow query detected         │  │
│  │  [2026-03-11 10:20:01] INFO: Backup completed           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2.2 Key Metrics to Monitor

**Table 7.2: System Monitoring Metrics**

| Metric | Warning Threshold | Critical Threshold | Action |
|--------|------------------|-------------------|--------|
| API Response Time | >500ms | >2000ms | Check database load |
| Error Rate | >1% | >5% | Review error logs |
| Database Size | >500MB | >1GB | Plan archival/architecture |
| Concurrent Users | >100 | >200 | Scale infrastructure |
| Memory Usage | >70% | >90% | Restart services |
| Disk Space | >80% | >95% | Clean logs/backups |

### 7.2.3 Log Configuration

**Log Levels:**
- `ERROR`: Critical failures requiring immediate attention
- `WARN`: Non-critical issues, unusual patterns
- `INFO`: Normal operational events
- `DEBUG`: Detailed debugging information

**Log Rotation:**
```javascript
// server.js - Log rotation configuration
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const transport = new DailyRotateFile({
  filename: './logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    transport,
    new winston.transports.Console()
  ]
});
```

## 7.3 Performance Optimization

### 7.3.1 Database Optimization

**Query Optimization Tips:**
1. Use selective queries with `where` clauses
2. Include pagination for large result sets
3. Use `select` to limit returned fields
4. Add database indexes for frequently queried fields

**Example Optimized Query:**
```javascript
// Good: Selective query with pagination
const students = await prisma.student.findMany({
  where: {
    department: 'Computer Science',
    status: 'Active'
  },
  select: {
    id: true,
    name: true,
    rollNo: true,
    cgpa: true
  },
  take: 50,    // Limit results
  skip: 0      // Pagination offset
});

// Bad: Fetching all records with all fields
const students = await prisma.student.findMany();
```

### 7.3.2 Frontend Optimization

**Code Splitting:**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'framer-motion', 'recharts'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  }
});
```

**Lazy Loading:**
```javascript
// Lazy load heavy components
const TeacherAnalytics = lazy(() => import('./components/TeacherAnalytics'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <TeacherAnalytics />
</Suspense>
```

## 7.4 Backup and Restore Procedures

### 7.4.1 Backup Strategy

**Table 7.3: Backup Schedule Recommendations**

| Data Type | Frequency | Retention | Storage Location |
|-----------|-----------|-----------|------------------|
| Database | Daily | 30 days | Local + Cloud |
| User Uploads | Weekly | 90 days | Cloud (S3) |
| System Config | On change | 10 versions | Git + Cloud |
| Logs | Real-time | 14 days | Local compressed |

**Figure 7.2: Backup and Recovery Workflow**

```
┌─────────────────────────────────────────────────────────────────┐
│                     BACKUP WORKFLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐             │
│  │ Database │──────▶│  Backup  │──────▶│ Compress │             │
│  │  (dev.db)│      │  Copy    │      │  (gzip)  │             │
│  └──────────┘      └──────────┘      └────┬─────┘             │
│                                            │                   │
│                                            ▼                   │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐             │
│  │  Local   │◀─────│  Verify  │◀─────│  Store   │             │
│  │ Storage  │      │ Integrity│      │  Backup  │             │
│  └────┬─────┘      └──────────┘      └────┬─────┘             │
│       │                                    │                   │
│       │         ┌──────────┐               │                   │
│       └────────▶│   Copy   │◀──────────────┘                   │
│                 │  to S3   │                                   │
│                 └──────────┘                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4.2 Automated Backup Script

```bash
#!/bin/bash
# /scripts/backup.sh

# Configuration
DB_PATH="./prisma/dev.db"
BACKUP_DIR="./backups"
S3_BUCKET="s3://zenithedu-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="zenithedu_${DATE}"

# Create backup
mkdir -p $BACKUP_DIR
cp $DB_PATH "$BACKUP_DIR/${BACKUP_NAME}.db"

# Compress
gzip "$BACKUP_DIR/${BACKUP_NAME}.db"

# Upload to S3 (if configured)
if command -v aws &> /dev/null; then
    aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.db.gz" $S3_BUCKET/
fi

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "zenithedu_*.db.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_NAME}.db.gz"
```

### 7.4.3 Recovery Procedures

**Database Recovery:**
```bash
# 1. Stop application
pm2 stop zenithedu

# 2. Backup current database (if any)
cp prisma/dev.db prisma/dev.db.corrupted

# 3. Restore from backup
cp backups/zenithedu_20260311_120000.db.gz ./
gunzip zenithedu_20260311_120000.db.gz
mv zenithedu_20260311_120000.db prisma/dev.db

# 4. Restart application
pm2 start zenithedu

# 5. Verify restoration
curl http://localhost:3001/api/system-stats
```

### 7.4.4 Disaster Recovery Plan

**Recovery Time Objectives (RTO):**
- Minor issues: 15 minutes
- Database corruption: 1 hour
- Server failure: 4 hours

**Recovery Point Objectives (RPO):**
- Maximum data loss: 24 hours (last backup)

## 7.5 Security Best Practices

### 7.5.1 Access Control

1. **Principle of Least Privilege:**
   - Grant minimum necessary permissions
   - Regularly audit user roles
   - Remove unused accounts

2. **Password Policies:**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers
   - Regular password rotation (90 days)
   - No reuse of last 5 passwords

3. **Session Management:**
   - Session timeout: 30 minutes idle
   - Maximum session duration: 8 hours
   - Force logout on password change

### 7.5.2 Data Protection

1. **Sensitive Data Handling:**
   - Encrypt email addresses at rest
   - Hash sensitive identifiers
   - Mask data in logs

2. **File Upload Security:**
   - Validate file types strictly
   - Scan for malware (if possible)
   - Store outside web root
   - Use random filenames

3. **API Security:**
   - Rate limiting per IP
   - CORS configuration
   - Input validation
   - SQL injection prevention (Prisma ORM)

### 7.5.3 Regular Security Tasks

**Daily:**
- [ ] Review error logs for suspicious activity
- [ ] Check failed login attempts

**Weekly:**
- [ ] Review user access permissions
- [ ] Verify backup integrity

**Monthly:**
- [ ] Security patch updates
- [ ] Password policy compliance check
- [ ] Access audit report

---

*[End of Chapter 7 - Continue to Chapter 8: Troubleshooting and Maintenance]*

---

# CHAPTER 8: TROUBLESHOOTING AND MAINTENANCE

## 8.1 Common Issues and Solutions

### 8.1.1 Troubleshooting Matrix

**Table 8.1: Common Issues and Solutions**

| Issue | Symptoms | Cause | Solution |
|-------|----------|-------|----------|
| Application won't start | Error on `npm run dev` | Port conflict | Change port in .env |
| Database connection failed | Prisma errors | Wrong DATABASE_URL | Verify path |
| AI Chat not responding | Timeout errors | Invalid Gemini key | Check API key |
| File upload fails | 500 error on upload | Missing uploads dir | Create directory |
| Login not working | Redirect loop | Session config | Clear localStorage |
| Slow page load | >5s load time | Large bundle | Enable code splitting |
| CORS errors | Console errors | Wrong CORS_ORIGIN | Update .env |
| Build fails | TypeScript errors | Type mismatches | Fix type errors |
| 404 on refresh | Page not found | SPA routing | Check Nginx config |
| Data not syncing | Stale data | Cache issues | Hard refresh |

### 8.1.2 Issue Resolution Flowchart

**Figure 8.1: Troubleshooting Decision Tree**

```
                    ┌─────────────────┐
                    │  Issue Reported │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Check Logs      │
                    │ (server/client) │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌──────────┐   ┌──────────┐   ┌──────────┐
      │  Error   │   │ Warning  │   │   Info   │
      │  Found   │   │  Found   │   │   Only   │
      └────┬─────┘   └────┬─────┘   └────┬─────┘
           │              │              │
           ▼              ▼              ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │ Search error │ │ Review warn  │ │ Check config │
   │ in manual/   │ │ for patterns │ │ vs expected  │
   │ Google       │ │              │ │              │
   └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
          │                │                │
          └────────────────┴────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Apply Fix       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Test Solution   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
      ┌──────────┐                  ┌──────────┐
      │  Fixed   │                  │  Failed  │
      └────┬─────┘                  └────┬─────┘
           │                             │
           ▼                             ▼
   ┌──────────────┐             ┌──────────────┐
   │ Document     │             │ Escalate to  │
   │ solution     │             │ senior dev   │
   └──────────────┘             └──────────────┘
```

## 8.2 Error Logs Interpretation

### 8.2.1 Backend Error Log Format

**Table 8.2: Error Log Interpretation Guide**

| Log Component | Example | Meaning |
|--------------|---------|---------|
| Timestamp | `2026-03-11T10:30:15.123Z` | When error occurred |
| Level | `ERROR`, `WARN`, `INFO` | Severity level |
| Source | `server.js:245` | File and line number |
| Error Type | `PrismaClientKnownRequestError` | Error classification |
| Message | `Unique constraint failed` | Human-readable description |
| Context | `{ userId: "abc123" }` | Additional context |

### 8.2.2 Common Error Patterns

**Prisma Database Errors:**
```
PrismaClientKnownRequestError: 
  Unique constraint failed on the fields: (`email`)
  
→ Solution: Check for duplicate email in request
```

**File Upload Errors:**
```
MulterError: File too large
  limit: 5242880
  
→ Solution: Reduce file size or increase MAX_FILE_SIZE
```

**API Connection Errors:**
```
FetchError: request to http://localhost:3001/api/test failed
  reason: connect ECONNREFUSED 127.0.0.1:3001
  
→ Solution: Backend server not running, start with `npm run server`
```

## 8.3 System Health Checks

### 8.3.1 Health Check Endpoints

**API Health Check:**
```bash
curl http://localhost:3001/api/test
# Expected: { "message": "API is working!", "timestamp": "..." }
```

**Database Health Check:**
```bash
# Check Prisma connection
npx prisma db execute --stdin <<EOF
SELECT COUNT(*) FROM users;
EOF
```

**Frontend Build Check:**
```bash
npm run build
# Should complete without errors
```

### 8.3.2 Automated Health Monitoring

```javascript
// health-check.js
const fetch = require('node-fetch');

async function healthCheck() {
  const checks = {
    api: false,
    database: false,
    disk: false
  };
  
  // API Check
  try {
    const response = await fetch('http://localhost:3001/api/test');
    checks.api = response.ok;
  } catch (e) {
    console.error('API check failed:', e.message);
  }
  
  // Database Check (via API)
  try {
    const response = await fetch('http://localhost:3001/api/system-stats');
    checks.database = response.ok;
  } catch (e) {
    console.error('Database check failed:', e.message);
  }
  
  // Disk Space Check
  const { execSync } = require('child_process');
  try {
    const diskUsage = execSync('df -h .').toString();
    checks.disk = !diskUsage.includes('100%');
  } catch (e) {
    console.error('Disk check failed:', e.message);
  }
  
  // Report
  console.log('Health Check Results:', checks);
  
  if (Object.values(checks).some(v => !v)) {
    console.error('Some health checks failed!');
    process.exit(1);
  }
}

healthCheck();
```

## 8.4 Maintenance Schedules

### 8.4.1 Maintenance Schedule Template

**Table 8.3: Maintenance Schedule Template**

| Task | Frequency | Duration | Downtime | Responsible |
|------|-----------|----------|----------|-------------|
| Database backup | Daily | 5 min | None | Automated |
| Log rotation | Daily | 1 min | None | Automated |
| Security patches | Weekly | 30 min | 5 min | SysAdmin |
| Dependency updates | Monthly | 1 hour | 15 min | Developer |
| Database optimization | Monthly | 2 hours | 30 min | DBA |
| Full system backup | Weekly | 30 min | None | Automated |
| Performance review | Quarterly | 4 hours | None | Team |
| Disaster recovery test | Semi-annual | 4 hours | 1 hour | Team |

### 8.4.2 Maintenance Window Procedures

**Pre-Maintenance:**
1. Send notification to users (24 hours prior)
2. Create complete system backup
3. Prepare rollback plan
4. Verify maintenance scripts

**During Maintenance:**
1. Enable maintenance mode
2. Stop application services
3. Execute maintenance tasks
4. Verify each step

**Post-Maintenance:**
1. Run health checks
2. Monitor for 1 hour
3. Send completion notification
4. Document any issues

## 8.5 Update and Upgrade Procedures

### 8.5.1 Dependency Updates

**Check for Updates:**
```bash
# Check outdated packages
npm outdated

# Update minor versions
npm update

# Update major version (specific package)
npm install react@latest
```

**Safe Update Process:**
```bash
# 1. Create branch
git checkout -b dependency-updates

# 2. Update dependencies
npm update

# 3. Run tests
npm test

# 4. Build verification
npm run build

# 5. Manual testing
npm run dev

# 6. Merge if successful
git checkout main
git merge dependency-updates
```

### 8.5.2 Database Migration Updates

```bash
# Pull latest changes
git pull origin main

# Check for new migrations
git diff HEAD~1 -- prisma/migrations/

# Apply migrations
npx prisma migrate deploy

# Verify database state
npx prisma studio
```

### 8.5.3 Rollback Procedures

**Code Rollback:**
```bash
# Using Git
git revert HEAD  # Undo last commit
git reset --hard HEAD~1  # Remove last commit

# Redeploy previous version
git checkout v1.0.0
npm run build
pm2 restart zenithedu
```

**Database Rollback:**
```bash
# Restore from backup
cp backups/dev-20260311-120000.db prisma/dev.db

# Or reset migrations
npx prisma migrate reset --force
```

---

*[End of Chapter 8 - System Manual Complete]*

---

# INDEX

## A
- **Admin Role** - Full system access user role, page 73
- **API Documentation** - Chapter 6, page 54
- **API Keys** - Configuration, page 35
- **Architecture** - System design, page 8
- **Attendance** - Module and API, pages 47, 67
- **Authentication** - Flow and implementation, page 56

## B
- **Backup Procedures** - Database backup and recovery, page 76
- **Backup Schedule** - Recommended schedule, page 76
- **Browser Requirements** - Supported browsers, page 23
- **Bus Routes** - Transport module, page 50

## C
- **Chat Assistant** - AI integration, page 42
- **Configuration** - System configuration, page 32
- **Course Management** - Academic module, page 48
- **CORS** - Cross-origin configuration, page 35

## D
- **Database** - Design and schema, page 42
- **Database Backup** - Procedures, page 76
- **Data Flow** - Diagrams and processes, page 14
- **Dependencies** - Technology stack, page 16

## E
- **Environment Variables** - Configuration, page 35
- **Error Codes** - API error reference, page 61
- **Error Handling** - Troubleshooting, page 69
- **Express.js** - Backend framework, page 16

## F
- **Fee Management** - Module and API, pages 48, 70
- **File Upload** - Security and configuration, page 39
- **Frontend** - Architecture and components, page 12

## G
- **Gemini API** - Google AI integration, page 36
- **Getting Started** - Installation, page 20

## H
- **Hardware Requirements** - System requirements, page 22
- **Health Checks** - Monitoring procedures, page 84
- **Hostel Management** - Module and schema, page 50
- **HTTP Status Codes** - API reference, page 60

## I
- **Installation** - Setup procedures, page 20
- **Indexes** - Database optimization, page 52

## L
- **Library Management** - Module and API, pages 49, 66
- **Live Classes** - Online class module, page 42
- **Logging** - System monitoring, page 74

## M
- **Maintenance** - Procedures and schedules, page 85
- **Monitoring** - System health, page 74
- **Multer** - File upload middleware, page 16

## N
- **Node.js** - Runtime requirements, page 23
- **Notices** - Communication module, page 42

## O
- **Ollama** - Local AI setup, page 37

## P
- **Permissions** - Role-based access, page 73
- **Prisma** - ORM and database, page 16
- **Production** - Deployment setup, page 26

## R
- **Rate Limiting** - API security, page 40
- **React** - Frontend framework, page 12
- **Requirements** - System requirements, page 22
- **REST API** - Architecture, page 54
- **Roles** - User roles, page 73

## S
- **Schema** - Database design, page 42
- **Security** - Configuration and best practices, pages 38, 78
- **Server.js** - Backend configuration, page 33
- **Setup** - Installation procedures, page 20
- **SQLite** - Database engine, page 16
- **Student Management** - Module and API, pages 47, 63
- **System Architecture** - Chapter 2, page 8

## T
- **Tailwind CSS** - Styling framework, page 16
- **Teacher Analytics** - Dashboard feature, page 42
- **Technology Stack** - Components and justification, page 16
- **Timetable** - Scheduling module, page 42
- **Transport** - Bus route management, page 50
- **Troubleshooting** - Common issues, page 81
- **TypeScript** - Language and configuration, page 16

## U
- **User Management** - Procedures and API, pages 72, 62
- **User Roles** - Permissions matrix, page 73

## V
- **Vite** - Build tool, page 16

---

**Document Version:** 1.0.0  
**Last Updated:** March 2026  
**Total Pages:** 88  
**Classification:** Technical Reference Manual  

---

*End of System Manual*


