# Audit Checklist App

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-green.svg?style=flat-square)
![Maintenance](https://img.shields.io/badge/Maintained-Yes-green.svg?style=flat-square)

<img src="https://i.postimg.cc/Vv5hsBk5/Screenshot-2025-05-28-082337.png">  
  
A comprehensive web application for managing grooming audit checklists, tracking violations, and monitoring inspection progress across multiple sites.

## 🚀 Features

- **User Authentication**: Secure login system with JWT tokens
- **Site Management**: Add, view, and delete inspection sites
- **Violation Management**: Create and manage violation types with drag-and-drop ordering
- **Checklist Management**: Create inspection checklists with image uploads
- **Progress Tracking**: Mark violations as found/not found with notes
- **Status Management**: Mark checklists as completed
- **Advanced Filtering**: Filter by site, completion status, and search terms
- **Statistics Dashboard**: Overview of completion rates, violation rates, and overdue items
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
![Node.js](https://img.shields.io/badge/Node.js-v18.0+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.18+-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.0+-316192?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-9.0+-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

- **Node.js** with Express.js
- **PostgreSQL** (Neon Database)
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-4.4+-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.3+-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.5+-5A29E4?style=flat-square&logo=axios&logoColor=white)

- **React** with Vite
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hooks** for state management

## 📋 Prerequisites

![Node.js Required](https://img.shields.io/badge/Node.js-v14%2B%20Required-brightgreen?style=flat-square&logo=nodedotjs)
![npm Required](https://img.shields.io/badge/npm-Required-red?style=flat-square&logo=npm)
![PostgreSQL Required](https://img.shields.io/badge/PostgreSQL-Required-blue?style=flat-square&logo=postgresql)

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (or Neon account)

## 🔧 Installation

![Setup](https://img.shields.io/badge/Setup-Easy-green?style=flat-square)
![Time](https://img.shields.io/badge/Setup%20Time-5%20minutes-blue?style=flat-square)

### 1. Clone the repository
```bash
git clone <repository-url>
cd BASIC-GROOMING/Audit-Checklist-App
```

### 2. Backend Setup
```bash
cd "checklist app/api"
npm install
```

Create a `.env` file in the api directory:
```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:
```env
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
PORT=3001
JWT_SECRET=your-jwt-secret-key
```

### 3. Frontend Setup
```bash
cd "../src"
npm install
```

### 4. Database Setup
![Auto Setup](https://img.shields.io/badge/Database-Auto%20Setup-green?style=flat-square)

The application will automatically create the required tables on first run:
- `grm_sites` - Site management
- `grm_violations` - Violation types
- `grm_checklist` - Inspection checklists
- `grm_checklist_progress` - Progress tracking
- `grm_users` - User authentication

## 🚀 Running the Application

![Development](https://img.shields.io/badge/Environment-Development-yellow?style=flat-square)
![Port 3001](https://img.shields.io/badge/Backend-Port%203001-blue?style=flat-square)
![Port 5173](https://img.shields.io/badge/Frontend-Port%205173-green?style=flat-square)

### Start the Backend Server
```bash
cd "checklist app/api"
npm start
```
Server will run on `http://localhost:3001`

### Start the Frontend Development Server
```bash
cd "checklist app/src"
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📊 Database Schema

![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=flat-square&logo=postgresql)
![Tables](https://img.shields.io/badge/Tables-5-green?style=flat-square)

### Sites (`grm_sites`)
- `id` - Primary key
- `sites` - Site name
- `created_at` - Timestamp

### Violations (`grm_violations`)
- `id` - Primary key
- `violations` - Violation description
- `order_index` - For custom ordering
- `created_at` - Timestamp

### Checklists (`grm_checklist`)
- `id` - Primary key
- `name` - Checklist name
- `site` - Associated site
- `violations` - Array of violation IDs
- `img_url` - Image path
- `status` - Completion status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Progress (`grm_checklist_progress`)
- `id` - Primary key
- `checklist_id` - Foreign key to checklist
- `violation_id` - Foreign key to violation
- `is_checked` - Boolean for violation found
- `notes` - Additional notes
- `checked_at` - Timestamp when marked

### Users (`grm_users`)
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `role` - User role
- `created_at` - Registration timestamp

## 🔑 API Endpoints

![REST API](https://img.shields.io/badge/API-REST-orange?style=flat-square)
![JWT Protected](https://img.shields.io/badge/Auth-JWT%20Protected-red?style=flat-square)

### Authentication
- `POST /api/auth/login` - User login

### Sites
- `GET /api/sites` - Get all sites
- `POST /api/sites` - Create new site (protected)
- `DELETE /api/sites/:id` - Delete site (protected)

### Violations
- `GET /api/violations` - Get all violations
- `POST /api/violations` - Create violation (protected)
- `DELETE /api/violations/:id` - Delete violation (protected)
- `PUT /api/violations/order` - Update violation order (protected)

### Checklists
- `GET /api/checklists` - Get all checklists
- `GET /api/checklists/:id` - Get checklist by ID
- `POST /api/checklists` - Create checklist (protected)
- `PUT /api/checklists/:id` - Update checklist (protected)
- `DELETE /api/checklists/:id` - Delete checklist (protected)
- `PUT /api/checklists/:id/complete` - Mark as completed (protected)

### Progress
- `PUT /api/checklists/:checklistId/progress/:violationId` - Update progress (protected)
- `GET /api/checklists/:checklistId/progress` - Get progress
- `POST /api/checklists/:checklistId/reset` - Reset progress (protected)

## 🔒 Authentication

![JWT](https://img.shields.io/badge/Security-JWT%20Tokens-success?style=flat-square)

The application uses JWT tokens for authentication. Protected routes require a valid token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## 📁 Project Structure

![Structure](https://img.shields.io/badge/Structure-Organized-blue?style=flat-square)

```
BASIC-GROOMING/
└── Audit-Checklist-App/
    └── checklist app/
        ├── api/                 # Backend server
        │   ├── controller.js    # Route controllers
        │   ├── authController.js # Authentication logic
        │   ├── db.js           # Database connection
        │   ├── app.js          # Express app setup
        │   ├── auth-migrate.js # Auth table migration
        │   └── uploads/        # File uploads directory
        └── src/                # Frontend React app
            ├── components/     # React components
            ├── pages/         # Page components
            ├── services/      # API services
            └── main.jsx       # App entry point
```

## 🎯 Usage

![User Friendly](https://img.shields.io/badge/Interface-User%20Friendly-brightgreen?style=flat-square)

1. **Login**: Use the authentication system to access admin features
2. **Manage Sites**: Add locations where inspections will be conducted
3. **Setup Violations**: Define the types of violations to check for
4. **Create Checklists**: Create inspection checklists for specific sites
5. **Conduct Inspections**: Mark violations as found/not found with optional notes
6. **Track Progress**: Monitor completion rates and violation statistics
7. **Complete Inspections**: Mark checklists as completed when done

## 🔄 Features in Detail

![Features](https://img.shields.io/badge/Features-Rich-purple?style=flat-square)

### Violation Management
- Drag and drop to reorder violations
- Custom violation descriptions
- Bulk management capabilities

### Progress Tracking
- Real-time progress updates
- Notes for each violation
- Reset functionality for re-inspections

### Status Management
- Due date tracking (1 week after creation)
- Overdue indicators
- Completion status badges

### Filtering & Search
- Filter by site, completion status
- Sort by various criteria
- Search by name or site

## 🤝 Contributing

![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-green?style=flat-square)

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

This project is licensed under the MIT License.

## 🐛 Known Issues

![Issues](https://img.shields.io/badge/Known%20Issues-2-orange?style=flat-square)

- File upload size limited to 5MB
- Only image files supported for checklist attachments

---

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)
![Built for Auditing](https://img.shields.io/badge/Built%20for-%20Audits-blue?style=flat-square)
