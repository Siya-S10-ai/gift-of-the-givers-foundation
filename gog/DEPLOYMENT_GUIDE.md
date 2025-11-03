# GOG (Gift of the Givers) - Full-Stack MVP Application

## Project Overview
A full-stack web application for humanitarian aid and disaster relief management.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: ASP.NET Core 9.0 Web API + Entity Framework Core
- **Database**: SQL Server (configured for Azure SQL Database)
- **Authentication**: ASP.NET Identity + JWT Bearer tokens
- **Storage**: Azure Blob Storage integration
- **Deployment**: Azure App Service + Azure Static Web Apps

## Project Status

### ✅ Completed Components

#### Backend (ASP.NET Core Web API)
1. **Database Models** (`backend/GOG.API/Models/`)
   - `ApplicationUser.cs` - Extends IdentityUser with custom fields
   - `IncidentReport.cs` - Incident reporting entity
   - `Task.cs` - Volunteer task management entity
   - `Donation.cs` - Donation tracking entity

2. **Database Context** (`backend/GOG.API/Data/`)
   - `ApplicationDbContext.cs` - EF Core DbContext with Identity integration
   - Configured relationships and constraints
   - Initial migration created

3. **Services** (`backend/GOG.API/Services/`)
   - `JwtService.cs` - JWT token generation
   - `BlobStorageService.cs` - Azure Blob Storage integration

4. **DTOs** (`backend/GOG.API/DTOs/`)
   - Auth DTOs (Login, Register, Profile)
   - Incident Report DTOs
   - Task DTOs
   - Donation DTOs

5. **API Controllers** (`backend/GOG.API/Controllers/`)
   - `AuthController.cs` - Registration, login, profile management
   - `IncidentReportsController.cs` - CRUD operations for incident reports
   - `TasksController.cs` - Task management with role-based access
   - `DonationsController.cs` - Donation tracking and statistics

6. **Configuration**
   - JWT authentication configured
   - CORS policy for React frontend
   - Role-based authorization (Admin, Reporter, Volunteer)
   - Swagger/OpenAPI documentation

#### Frontend (React + TypeScript)
1. **Project Structure**
   - TypeScript types defined (`frontend/src/types/`)
   - API service with Axios (`frontend/src/services/api.ts`)
   - Authentication context (`frontend/src/contexts/AuthContext.tsx`)

2. **Components**
   - `Layout.tsx` - Main layout with header, navigation, and footer

3. **Pages**
   - `Home.tsx` - Landing page with hero, about, and contact sections
   - `Login.tsx` - User login with email/password
   - `Register.tsx` - User registration with role selection
   - `ReporterDashboard.tsx` - Placeholder for reporter features
   - `VolunteerDashboard.tsx` - Placeholder for volunteer features
   - `AdminDashboard.tsx` - Placeholder for admin features
   - `Donations.tsx` - Placeholder for donation features

4. **Routing & Authentication**
   - Protected routes with role-based access control
   - Automatic redirection based on user role
   - JWT token management in localStorage

5. **Styling**
   - Tailwind CSS v3 configured
   - Responsive design components
   - Modern UI with gradient hero section

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend/GOG.API
```

2. Update connection strings in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Currently don't have SQL Server connection string.",
    "AzureStorage": "Currently don't have a database connection string."
  },
  "JwtSettings": {
    "SecretKey": "Your secure secret key (min 32 characters)",
    "Issuer": "GOG.API",
    "Audience": "GOG.Client",
    "ExpiryMinutes": "60"
  }
}
```

3. Apply database migrations:
```bash
dotnet ef database update
```

4. Run the API:
```bash
dotnet run
```

The API will be available at `https://localhost:7000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Create a `.env.local` file:
```
REACT_APP_API_URL=https://localhost:7000/api
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### Incident Reports
- `GET /api/incidentreports` - Get all reports
- `GET /api/incidentreports/{id}` - Get report by ID
- `POST /api/incidentreports` - Create new report (Reporter/Admin)
- `PUT /api/incidentreports/{id}` - Update report (Reporter/Admin)
- `DELETE /api/incidentreports/{id}` - Delete report (Reporter/Admin)

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create task (Admin only)
- `PUT /api/tasks/{id}` - Update task (Admin only)
- `POST /api/tasks/{id}/assign` - Assign task to volunteer (Volunteer)
- `POST /api/tasks/{id}/complete` - Mark task complete (Volunteer)
- `DELETE /api/tasks/{id}` - Delete task (Admin only)

### Donations
- `GET /api/donations` - Get all donations
- `GET /api/donations/{id}` - Get donation by ID
- `POST /api/donations` - Create donation
- `GET /api/donations/user/{userId}` - Get user donations
- `GET /api/donations/statistics` - Get donation statistics (Admin only)

## User Roles
- **Admin**: Full access to all features
- **Reporter**: Can create and manage incident reports
- **Volunteer**: Can view and complete assigned tasks

## Next Steps

### To Complete the MVP:

1. **Reporter Dashboard Enhancement**
   - Implement incident report submission form
   - Add image upload functionality
   - Display user's submitted reports
   - Implement report categories (Natural Disaster, Healthcare, Education, etc.)

2. **Volunteer Dashboard Enhancement**
   - Display available tasks
   - Implement task assignment functionality
   - Create contribution tracking table
   - Show task status and history

3. **Donation Page Enhancement**
   - Create donation category cards
   - Integrate payment provider (Stripe/PayFast)
   - Display donation campaigns
   - Show donation history for logged-in users

4. **Admin Dashboard Enhancement**
   - User management interface
   - Report review and approval
   - Task creation and assignment
   - Analytics and statistics

5. **Azure Deployment**
   - Configure Azure SQL Database
   - Set up Azure Blob Storage
   - Configure Azure Key Vault for secrets
   - Deploy backend to Azure App Service
   - Deploy frontend to Azure Static Web Apps

6. **Additional Features**
   - Email notifications
   - Profile picture upload
   - Search and filtering
   - Pagination for large datasets
   - Export reports to PDF

## Environment Variables

### Backend (.NET)
Configure in `appsettings.json` or Azure App Settings:
- `ConnectionStrings:DefaultConnection` - SQL Server connection string
- `ConnectionStrings:AzureStorage` - Azure Storage connection string
- `JwtSettings:SecretKey` - JWT secret key
- `JwtSettings:Issuer` - JWT issuer
- `JwtSettings:Audience` - JWT audience

### Frontend (React)
Configure in `.env.local`:
- `REACT_APP_API_URL` - Backend API base URL

## Security Notes
- JWT tokens expire after 60 minutes (configurable)
- Passwords require: min 6 chars, uppercase, lowercase, digit
- CORS configured to allow only specific origins
- Role-based authorization on all protected endpoints
- Image uploads validated and stored in Azure Blob Storage
- Sensitive data (secrets, keys) should be stored in Azure Key Vault

## Testing

### Backend
```bash
cd backend/GOG.API
dotnet test
```

### Frontend
```bash
cd frontend
npm test
```

## Build for Production

### Backend
```bash
cd backend/GOG.API
dotnet publish -c Release -o ./publish
```

### Frontend
```bash
cd frontend
npm run build
```

## Known Issues
- Frontend build requires Tailwind CSS v3 configuration
- Azure deployment configurations need to be created
- Payment integration is pending
- Email service not yet implemented

## Contributing
This is an MVP project. Future enhancements should maintain the existing architecture and follow the established patterns.

## License
[Your License Here]

## Contact
For questions or support, contact the project maintainer.
