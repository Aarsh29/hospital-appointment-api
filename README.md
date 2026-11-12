# Hospital Appointment API

Typed Prisma CRUD functions for patients, doctors, and appointments. The Prisma
schema maps the existing PostgreSQL `patients`, `doctors`, and `appointments`
tables without changing their names or column types.

## Setup

1. Create a PostgreSQL database named `hospital_api` and create the three
   tables using the SQL in the assignment.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL
   connection string. `.env` is ignored by Git.
3. Install dependencies and generate the Prisma Client:

   ```sh
   npm install
   npm run generate
   ```

4. Seed the two doctors, two patients, and two appointments:

   ```sh
   npm run db:seed
   ```

   Seeding resets all records in the `appointments`, `patients`, and `doctors`
   tables, then inserts the same fixtures in one transaction. It is repeatable,
   reports the resulting table counts, and rolls back if any step fails. It
   refuses to run when `NODE_ENV=production` or the database name is not
   `hospital_api`; use it only with a disposable development database.
5. Run the CRUD exercise and type check:

   ```sh
   npm run test:crud
   npm run typecheck
   ```

The test script creates uniquely named records, exercises every CRUD function,
and removes its test data.
