# Data Models

## Entity Relationship Diagram

```
┌──────────────────────┐         ┌──────────────────────────┐
│        User          │         │         Article           │
├──────────────────────┤         ├──────────────────────────┤
│ Id (PK)              │◄────────┤ AuthorId (FK → User.Id)  │
│ Email (unique)       │  1:many │ Id (PK)                  │
│ FullName             │         │ Title                    │
│ GoogleId (unique)    │         │ Content (HTML)           │
│ PasswordHash (null)  │         │ Summary                  │
│ PictureUrl           │         │ ImageUrl                 │
│ Role                 │         │ Slug (unique)            │
│ Preferences          │         │ Status (Draft|Published) │
│ LastLoginAt          │         │ ViewCount                │
└──────────────────────┘         │ CreatedAt                │
                                 │ UpdatedAt                │
                                 └────────────┬─────────────┘
                                              │ many:many
                      ┌───────────────────────┼────────────────────┐
                      ▼                                            ▼
          ┌───────────────────┐                     ┌──────────────────────┐
          │        Tag        │                     │       Category       │
          ├───────────────────┤                     ├──────────────────────┤
          │ Id (PK)           │                     │ Id (PK)              │
          │ Name              │                     │ Name                 │
          └───────────────────┘                     │ Description          │
                                                     └──────────────────────┘

┌──────────────────────┐
│       Comment        │
├──────────────────────┤
│ Id (PK)              │
│ Content              │
│ GuestName            │
│ CreatedAt            │
│ ArticleId (FK)       │
│ UserId (FK, null)    │──── nullable (anonymous comments)
└──────────────────────┘
```

---

## User

| Column | Type | Constraints | Description |
|---|---|---|---|
| `Id` | `int` | PK, auto-increment | Primary key |
| `Email` | `string` | Unique, required | User email address |
| `FullName` | `string` | required | Display name |
| `GoogleId` | `string` | Unique | Google OAuth subject ID |
| `PasswordHash` | `string?` | Nullable | BCrypt hash for local auth users |
| `PictureUrl` | `string` | — | Profile photo (URL or Base64) |
| `Role` | `string` | — | `Reader`, `Creator`, or `Admin` |
| `Preferences` | `string` | — | JSON string (reserved for future use) |
| `LastLoginAt` | `DateTime` | — | Timestamp of last successful login |

---

## Article

| Column | Type | Constraints | Description |
|---|---|---|---|
| `Id` | `int` | PK, auto-increment | Primary key |
| `Title` | `string` | required | Article title |
| `Content` | `string` | required | HTML-encoded article body |
| `Summary` | `string` | — | Short description for cards/SEO |
| `ImageUrl` | `string` | — | Featured image URL |
| `Slug` | `string` | — | URL-friendly identifier (auto-generated) |
| `Status` | `string` | — | `Draft` or `Published` |
| `ViewCount` | `int` | default `0` | Page view counter |
| `CreatedAt` | `DateTime` | — | Creation timestamp (UTC) |
| `UpdatedAt` | `DateTime` | — | Last update timestamp (UTC) |
| `AuthorId` | `int?` | FK → `User.Id` | Article author |

---

## Comment

| Column | Type | Constraints | Description |
|---|---|---|---|
| `Id` | `int` | PK, auto-increment | Primary key |
| `Content` | `string` | required | Comment text |
| `GuestName` | `string` | default `"Anonymous"` | Displayed author name |
| `CreatedAt` | `DateTime` | — | Creation timestamp (UTC) |
| `ArticleId` | `int` | FK → `Article.Id`, required | Parent article |
| `UserId` | `int?` | FK → `User.Id`, nullable | Null for anonymous comments |

---

## Tag

| Column | Type | Description |
|---|---|---|
| `Id` | `int` | Primary key |
| `Name` | `string` | Tag label (e.g. "Technology") |

Many-to-many with `Article` via `ArticleTag` join table.

---

## Category

| Column | Type | Description |
|---|---|---|
| `Id` | `int` | Primary key |
| `Name` | `string` | Category name |
| `Description` | `string` | Category description |

Many-to-many with `Article` via `ArticleCategory` join table.
