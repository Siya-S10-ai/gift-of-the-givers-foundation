# GOG - Gift of the Givers

A full-stack MVP web application for disaster incident reporting, volunteer management, and donation collection.
<i>To login to the Volunteer Dashboard, simply use any email address plus this password "**J@5f!tP7#zQrM4w**".</i>

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: C# ASP.NET Core Web API with Entity Framework Core
- **Database**: Azure SQL Database
- **Authentication**: ASP.NET Identity + JWT authentication
- **Deployment**: Azure App Service + Azure Static Web Apps
- **Storage**: Azure Blob Storage for media files
- **Secrets**: Azure Key Vault

## Project Structure

```
gog/
├── backend/          # ASP.NET Core Web API
├── frontend/         # React application
└── README.md
```

## Features

### Epic 1: User Authentication
- User registration with role-based access (Reporter, Volunteer, Admin)
- JWT-based authentication
- Role-based dashboard routing

### Epic 2: Disaster Incident Reporting
- Reporter dashboard with incident submission
- Image upload to Azure Blob Storage
- Multiple disaster categories

### Epic 3: Volunteer Management
- Volunteer registration and task assignment
- Contribution tracking
- Task management system

### Epic 4: Donation Management
- Secure payment processing
- Multiple donation categories
- Transaction tracking

## Getting Started

### Backend Setup
1. Navigate to `backend/GOG.API/` directory
2. Run `dotnet restore`
3. Update connection string in `appsettings.json`
4. Run `dotnet ef database update`
5. Run `dotnet run`

#### On a seperate terminal do:

### Frontend Setup
1. Navigate to `frontend/` directory
2. Run `npm install`
3. Update API base URL in configuration
4. Run `npm start`

## Database Schema

The application uses Entity Framework Core with the following entities:
- ApplicationUser (inherits from IdentityUser)
- IncidentReport
- Task
- Donation

## Deployment

The application is designed for deployment on Azure:
- Backend: Azure App Service
- Frontend: Azure Static Web Apps
- Database: Azure SQL Database
- Storage: Azure Blob Storage
- Secrets: Azure Key Vault
