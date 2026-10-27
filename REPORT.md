# Assignment 2 System Architecture Note

## 1. Data Relationships & Schema Modeling
Our application uses Prisma ORM to map relational models to the database. We defined four core entities with tight relationships and referential integrity:

- **Users and Roles**: A `User` is linked to a specific `Role` (Admin, Member, Guest) via a many-to-one relationship. This enforces centralized role-management and prevents hardcoded roles from proliferating.
- **Users and Transactions**: A one-to-many relationship exists between `User` and `Transaction`. Deleting a user safely cascades to delete their associated transactions (`onDelete: Cascade`), ensuring no orphaned financial data remains in the database.
- **Audit Logs**: Every critical lifecycle event (user creation, login, email dispatch) triggers an `AuditLog`. The audit log references the `User` (`onDelete: SetNull`) ensuring that if a user is deleted, the log remains intact for compliance purposes, simply nullifying the direct user link while keeping the action history.

## 2. Authorization Flow via Middleware Proxy
Security is enforced before requests even hit the route handlers:

1. **Request Interception**: The Next.js Edge Middleware intercepts all incoming requests to the `/api/*` routes using a matcher.
2. **Session Verification**: The middleware parses the incoming request for authorization tokens (simulated via cookies or specific `x-simulate-role` headers).
3. **Role-Based Access Control (RBAC)**: A predefined map of routes to roles is verified. For instance, the `/api/transaction` route requires either an `Admin` or `Member` role. `Guest` roles will receive a `403 Forbidden` response.
4. **Context Propagation**: Valid requests are forwarded to the underlying Next.js API Route Handlers. The validated role is explicitly attached to the `x-user-role` header to ensure the Route Handler trusts the incoming authorization state.

## 3. Transactional Lifecycle & Email Dispatch
To ensure users are properly notified of system events, we implemented a seamless transactional webhook system.

1. **Mutation**: A POST request to `/api/transaction` triggers Prisma to securely create a financial transaction in the database.
2. **React Email Template**: A modular `@react-email/components` template (`TransactionalEmail.tsx`) dynamically receives the transaction payload (amount, status, username). This allows for developer-friendly, styling-consistent, and responsive HTML email construction using standard React components.
3. **Resend API Integration**: The HTML output is directly piped into the Resend API. The transmission is captured and an `AuditLog` is created recording the `emailSent` boolean and metadata.
4. **Webhook Ingestion**: A dedicated public route `POST /api/webhook/resend/route.ts` is configured to listen to Resend's delivery webhooks. When an event like `email.delivered` or `email.bounced` hits the server, it instantly records the metadata into the `AuditLog`, creating a closed-loop verifiable notification system.
