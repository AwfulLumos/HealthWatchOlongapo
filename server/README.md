# HealthWatch Olongapo - Backend API

REST API backend for the HealthWatch Olongapo Healthcare Management System.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js 5
- **Database:** MySQL (via Prisma ORM)
- **Authentication:** JWT (Access + Refresh tokens)
- **Validation:** Zod

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── src/
│   ├── config/            # Configuration & database setup
│   ├── controllers/       # Request handlers
│   ├── middlewares/       # Auth, validation, error handling
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Helper functions
│   ├── validators/        # Zod validation schemas
│   ├── app.ts             # Express app setup
│   └── index.ts           # Entry point
├── .env.example           # Environment variables template
├── package.json
└── tsconfig.json
```

## Getting Started

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Setup MySQL Database

Create the database in MySQL Workbench:
```sql
CREATE DATABASE healthwatch_olongapo;
```

### 4. Run Migrations

```bash
npm run db:migrate
```

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | User login |
| POST | /auth/register | Register new user |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | User logout |
| GET | /auth/profile | Get current user |
| POST | /auth/change-password | Change password |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /patients | List all patients |
| GET | /patients/:id | Get patient details |
| POST | /patients | Create patient |
| PATCH | /patients/:id | Update patient |
| DELETE | /patients/:id | Delete patient |

### Staff
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /staff | List all staff |
| GET | /staff/:id | Get staff details |
| POST | /staff | Create staff (Admin) |
| PATCH | /staff/:id | Update staff (Admin) |
| DELETE | /staff/:id | Delete staff (Admin) |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /appointments | List appointments |
| GET | /appointments/:id | Get appointment |
| POST | /appointments | Create appointment |
| PATCH | /appointments/:id | Update appointment |
| DELETE | /appointments/:id | Delete appointment |

### Consultations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /consultations | List consultations |
| GET | /consultations/:id | Get consultation |
| POST | /consultations | Create consultation |
| PATCH | /consultations/:id | Update consultation |
| DELETE | /consultations/:id | Delete consultation |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /prescriptions | List prescriptions |
| GET | /prescriptions/:id | Get prescription |
| POST | /prescriptions | Create prescription |
| PATCH | /prescriptions/:id | Update prescription |
| DELETE | /prescriptions/:id | Delete prescription |

### Vital Signs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /vital-signs | List vital signs |
| GET | /vital-signs/:id | Get vital signs |
| GET | /vital-signs/patient/:patientId/latest | Get latest for patient |
| POST | /vital-signs | Record vital signs |
| PATCH | /vital-signs/:id | Update vital signs |
| DELETE | /vital-signs/:id | Delete vital signs |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard/stats | Get dashboard statistics |
| GET | /dashboard/upcoming-appointments | Get upcoming appointments |
| GET | /dashboard/recent-patients | Get recent patients |
| GET | /dashboard/consultations-by-month | Monthly consultation data |
| GET | /dashboard/top-diagnoses | Top diagnoses |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema changes |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Default Credentials (after seeding)

- **Admin:** username: `admin`, password: `admin123`
- **Doctor:** username: `dr.santos`, password: `doctor123`
