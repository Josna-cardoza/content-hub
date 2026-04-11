# API Reference

All requests go through the **BFF** at `http://localhost:8000`. The BFF transparently forwards requests to the Data Service at `http://localhost:8080`.

## Base URL

```
http://localhost:8000
```

## Authentication

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained via:
- **Google OAuth** — Google ID token passed directly
- **Local login** — `/api/auth/login` returns a signed JWT

---

## Health

### `GET /health`
Returns BFF health status.

**Response `200`**
```json
{ "status": "ok", "layer": "python-bff" }
```

---

## Authentication Endpoints

### `POST /api/auth/register`
Register a new local user account.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "Jane Doe"
}
```

**Responses**
| Code | Description |
|---|---|
| `200` | `{ "message": "User registered successfully" }` |
| `400` | `"Email already exists"` |

---

### `POST /api/auth/login`
Authenticate with email and password.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response `200`**
```json
{
  "token": "<jwt>",
  "user": {
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "role": "Reader",
    "pictureUrl": ""
  }
}
```

**Responses**
| Code | Description |
|---|---|
| `200` | Token + user object |
| `401` | `"Invalid credentials"` |

---

## Articles

### `GET /api/articles`
Returns all **Published** articles. Public — no auth required.

**Response `200`** — Array of Article objects
```json
[
  {
    "id": 1,
    "title": "My Article",
    "summary": "Brief description",
    "content": "<p>HTML content</p>",
    "imageUrl": "https://...",
    "slug": "my-article-abc123",
    "status": "Published",
    "viewCount": 42,
    "createdAt": "2026-04-10T10:00:00Z",
    "updatedAt": "2026-04-10T10:00:00Z",
    "authorId": 1,
    "author": { "id": 1, "fullName": "Jane Doe", ... },
    "tags": [],
    "categories": []
  }
]
```

---

### `GET /api/articles/my-content`
Returns **all articles** authored by the authenticated user (Draft + Published).

**Auth:** Required

**Response `200`** — Array of Article objects (same shape as above)

---

### `GET /api/articles/{id}`
Returns a single article by ID.

**Response `200`** — Article object  
**Response `404`** — Article not found

---

### `POST /api/articles`
Create a new article.

**Auth:** Required

**Request Body**
```json
{
  "title": "My New Article",
  "summary": "A brief summary",
  "content": "<p>Rich HTML content</p>",
  "imageUrl": "https://...",
  "status": "Draft"
}
```
> `status` can be `"Draft"` or `"Published"`. `slug` is auto-generated if omitted.

**Responses**
| Code | Description |
|---|---|
| `201` | Created article object |
| `400` | Validation error |

---

### `PUT /api/articles/{id}`
Update an existing article.

**Auth:** Required (must be author or Admin)

**Request Body** — Same shape as POST, plus `"id"` field.

**Response `200`** — Updated article object  
**Response `404`** — Not found

---

### `DELETE /api/articles/{id}`
Delete an article.

**Auth:** Required (must be author or Admin)

**Response `204`** — No content  
**Response `404`** — Not found

---

## Comments

### `GET /api/comments/article/{articleId}`
Returns all comments for a given article.

**Response `200`**
```json
[
  {
    "id": 1,
    "content": "Great article!",
    "guestName": "Jane Doe",
    "createdAt": "2026-04-10T10:00:00Z",
    "articleId": 1,
    "userId": 2
  }
]
```

---

### `POST /api/comments`
Post a comment on an article.

**Auth:** Optional (if not provided, comment is posted as Anonymous)

**Request Body**
```json
{
  "articleId": 1,
  "content": "Great article!",
  "guestName": "Jane Doe"
}
```

**Response `201`** — Created comment object

---

## User Profile

### `GET /api/users/profile`
Get the authenticated user's profile.

**Auth:** Required

**Response `200`** — User object

---

### `PUT /api/users/profile`
Update the authenticated user's profile (name and picture).

**Auth:** Required

**Request Body**
```json
{
  "fullName": "Jane Smith",
  "pictureUrl": "data:image/jpeg;base64,..."
}
```

**Response `200`**
```json
{
  "email": "user@example.com",
  "fullName": "Jane Smith",
  "pictureUrl": "data:image/jpeg;base64,...",
  "role": "Reader"
}
```
