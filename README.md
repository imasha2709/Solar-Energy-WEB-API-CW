# COBSCCOMP251P-083

# SLSEA Real-Time Solar Generation Data API

A RESTful Web API developed for the Sri Lanka Sustainable Energy Authority (SLSEA) to manage and retrieve solar energy generation data across provinces, districts, grid substations, and solar installations in Sri Lanka.

The API provides structured access to solar installation information and generation readings, supporting the monitoring and analysis of solar energy production.

## Features

- **RESTful API:** Provides HTTP endpoints for accessing and managing solar generation data.
- **Geographical Hierarchy:** Organises solar installations by province, district, and grid substation.
- **Generation Monitoring:** Stores and retrieves solar generation readings at 15-minute intervals.
- **Database Management:** Uses PostgreSQL with Prisma ORM for database access.
- **Authentication and Authorisation:** Supports protected API operations where required.
- **Data Validation:** Validates incoming requests to maintain data integrity.
- **API Documentation:** Provides interactive API documentation through Swagger UI.
- **Error Handling:** Returns appropriate HTTP status codes and structured error responses.
- **Deployment:** Designed for public access through a deployed HTTPS endpoint.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| TypeScript | Type-safe application development |
| PostgreSQL | Relational database |
| Prisma ORM | Database access and schema management |
| Swagger / OpenAPI | API documentation |
| JWT | Token-based authentication, where implemented |
| dotenv | Environment variable management |

## Deployment and Database Hosting

The Solar Generation Data API is deployed on **Vercel** and is designed to communicate with a PostgreSQL database through **Prisma ORM**.

- **API Hosting:** Vercel
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Database Management:** Prisma Console, where applicable

The deployed API uses environment variables to connect securely to the database. Database credentials and other sensitive configuration values are not included in the source code.

**Live API URL:** `https://solar-energy-web-api-cw.vercel.app`

**API Documentation:** `https://solar-energy-web-api-cw.vercel.app/api-docs`

## System Architecture

The application follows a layered backend architecture.

```text
Client Application
        |
        | HTTPS / REST / JSON
        v
Express API
        |
        v
Authentication and Authorisation
        |
        v
Controllers and Business Logic
        |
        v
Prisma ORM
        |
        v
PostgreSQL Database
```

Authentication and authorisation checks are applied to protected operations before the request proceeds to the relevant controller and business logic.

## Database Structure

The database contains the following main entities:

- **User:** Stores user account information and authentication-related data.
- **Province:** Represents the provinces of Sri Lanka.
- **District:** Represents districts belonging to provinces.
- **GridSubstation:** Represents grid substations within districts.
- **SolarInstallation:** Stores information about solar energy installations associated with grid substations.
- **GenerationReading:** Stores generation measurements recorded for solar installations.

### Entity Relationships

```text
Province
   |
   | 1 : Many
   v
District
   |
   | 1 : Many
   v
GridSubstation
   |
   | 1 : Many
   v
SolarInstallation
   |
   | 1 : Many
   v
GenerationReading

User
```

The geographical entities follow a hierarchical relationship, while each solar installation can have multiple generation readings over time. The `User` entity supports user-related functionality independently of the geographical hierarchy.

## Prerequisites

Before running the project locally, ensure you have installed:

- Node.js and npm
- PostgreSQL, either locally or through a hosted database provider
- Git
- A code editor such as Visual Studio Code

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/imasha2709/Solar-Energy-WEB-API-CW.git
cd Solar-Energy-WEB-API-CW
```


### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and configure the required environment variables.

```env
DATABASE_URL="POSTGRESQL_CONNECTION_STRING"
JWT_SECRET="SECRET_KEY"
PORT=3000
```

Use the actual variable names expected by the application. this project used a separate Prisma configuration file or additional environment variables, configure those as required.


### 4. Configure the database


Validate the Prisma schema:

```bash
npx prisma validate
```

Apply database migrations:

```bash
npx prisma migrate deploy
```

For local development, if your project uses Prisma migrations, you can create and apply a development migration using:

```bash
npx prisma migrate dev
```

### 5. Generate the Prisma Client

```bash
npx prisma generate
```

### 6. Seed the database



```bash
npx prisma db seed
```


### 7. Start the development server


```bash
npm run build
npm run dev
```

## API Documentation

The API uses Swagger/OpenAPI to document available endpoints, request parameters, response formats, and authentication requirements.

When running locally, the documentation may be available at:

```text
http://localhost:3000/api-docs
```

The actual Swagger URL depends on the route configured in the application.

**Live API Documentation:** `https://solar-energy-web-api-cw.vercel.app/api-docs`

**Base API URL:** `https://solar-energy-web-api-cw.vercel.app`

## API Endpoints

The exact routes depend on the implementation. The API is designed to provide resources for:

| Resource | Purpose |
|---|---|
| Provinces | Retrieve province information |
| Districts | Retrieve districts and their associated provinces |
| Grid Substations | Retrieve grid substation information |
| Solar Installations | Retrieve solar installation details |
| Generation Readings | Retrieve solar generation measurements |
| Users | Support user and authentication-related operations |

Refer to the Swagger documentation for the implemented endpoint paths, HTTP methods, request formats, and response examples.

## Testing

The API can be tested using Swagger UI, Postman, or another HTTP client.

Testing should cover:

- Successful retrieval of valid resources.
- Correct handling of invalid request parameters.
- Validation of required request fields.
- Authentication and authorisation for protected routes.
- Appropriate handling of missing records.
- Database relationships and referential integrity.
- Generation-reading retrieval and date/time filtering, where implemented.
- Error responses and HTTP status codes.
- Availability of the deployed HTTPS endpoint.

## Deployment

The application is intended to be deployed to a public hosting platform with a hosted PostgreSQL database.

Before submission, verify that:

1. The API is accessible through HTTPS.
2. The deployed application connects to the correct hosted PostgreSQL database.
3. Database migrations have been applied.
4. Seed data is available in the deployed database.
5. The API endpoints return the expected responses.
6. Swagger documentation is publicly accessible if required.
7. Environment variables and database credentials are configured securely.

**Live deployment:** https://solar-energy-web-api-cw.vercel.app.

## Environment Variables

The following variables are examples and should match the application's actual configuration.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL database connection string |
| `JWT_SECRET` | Secret used for JWT signing, if JWT authentication is implemented |
| `PORT` | Port used by the application, if configurable |

Never publish real credentials or production connection strings.

## Project Purpose

This project was developed as part of the Web API coursework to demonstrate RESTful API development, relational database design, ORM integration, API documentation, authentication, data validation, and deployment practices in the context of solar energy generation monitoring in Sri Lanka.

## Author

Developed as part of the SLSEA Real-Time Solar Generation Data API coursework.

