# Authentication

ATKLHub supports two authentication strategies that coexist seamlessly.

---

## 1. Google OAuth 2.0

### Flow

```
Browser
  → User clicks "Sign in with Google"
  → Google OAuth consent screen
  → Google returns ID Token (JWT signed by Google)
  → Frontend decodes token with jwtDecode() to extract profile
  → Frontend sends Google ID Token as Bearer in all API requests
  → Data Service validates token via Google's public keys (OIDC discovery)
  → OnTokenValidated: user record upserted in DB, role claim attached
```

### Configuration

The Google Client ID is set in `docker-compose.yml`:

```yaml
environment:
  - GOOGLE_CLIENT_ID=<your-google-client-id>
```

The `google-auth.json` file (obtained from Google Cloud Console) is placed in `/data-service/`.

### User Sync on First Login

When a Google-authenticated user hits any protected endpoint for the first time, the Data Service automatically:
1. Extracts `sub` (Google ID), `email`, `name`, `picture` from claims
2. Creates a new `User` record in PostgreSQL
3. Assigns the default role (`Reader` in production; `Admin` during development)

---

## 2. Local JWT Authentication

### Flow

```
Browser
  → User submits email + password to POST /api/auth/login
  → Data Service verifies BCrypt password hash
  → Data Service issues a signed JWT (7-day expiry)
  → Frontend stores token in localStorage
  → All subsequent requests attach Authorization: Bearer <token>
  → Data Service validates token signature using shared JWT_SECRET
  → OnTokenValidated: user role loaded from DB and added to claims
```

### Token Claims (Local)

| Claim | Value |
|---|---|
| `sub` / `NameIdentifier` | `user.Id` (database integer ID) |
| `email` | User email |
| `name` | Full name |
| `role` | `Reader` / `Creator` / `Admin` |
| `auth_type` | `"local"` |
| `iss` | `"atklhub-local-service"` |
| `aud` | `"atklhub-frontend"` |

### Registration

```
POST /api/auth/register
{
  "email": "...",
  "password": "...",
  "fullName": "..."
}
```

Password is hashed with BCrypt (work factor 11) before storage. Plain-text passwords are never persisted.

---

## Token Validation (Data Service)

The Data Service accepts **both** Google and local JWTs in the same `Authorization: Bearer` header. The `TokenValidationParameters` are configured to:

- Accept issuers: `https://accounts.google.com`, `accounts.google.com`, `atklhub-local-service`
- Accept audiences: `<google-client-id>`, `atklhub-frontend`
- Validate lifetime (expiry)

The `OnTokenValidated` event handler:
1. Extracts the user identifier from claims
2. Loads the user's role from the database
3. Injects the `ClaimTypes.Role` claim so `[Authorize(Roles="...")]` works correctly

---

## Security Notes

- JWT secret (`JWT_SECRET`) should be set as an environment variable in production, not hardcoded
- Profile images are currently stored as Base64 strings — plan to migrate to object storage (Azure Blob / S3)
- All passwords are hashed with BCrypt — never stored in plain text
- The default role during development is `Admin` to facilitate testing — **revert to `Reader` before production deployment**
