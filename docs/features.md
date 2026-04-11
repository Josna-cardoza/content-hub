# Features

A complete catalogue of all implemented features in ATKLHub.

---

## Authentication & Identity

### Local Registration & Login
- Users can register with **email, password, and full name**
- Passwords are hashed with **BCrypt** before storage
- On login, a signed **JWT** is returned (7-day expiry)
- The JWT is stored in `localStorage` and attached to all subsequent API requests

### Google OAuth Sign-In
- Users can sign in via the **Google OAuth 2.0** flow
- First sign-in automatically creates a user account
- Google profile picture is used as the default avatar

### User Roles
| Role | Permissions |
|---|---|
| `Reader` | Read articles, post comments |
| `Creator` | All Reader permissions + create/edit/delete own articles |
| `Admin` | Full access — manage all content and users |

---

## Article Management

### Create Article
- Authors access the article editor via **Dashboard → New Article**
- The editor supports rich WYSIWYG formatting (Bold, Italic, H1, H2, Lists, Block Quotes)
- Articles can be saved as **Draft** (private) or **Published** (public)
- A URL-friendly **slug** is auto-generated from the title

### Edit Article
- Authors can edit any of their articles from the **Dashboard → Edit** button
- The editor pre-loads existing content and formatting
- Authors can change status (Draft ↔ Published) on save

### Delete Article
- Authors can delete their articles from the **Dashboard → Delete** button
- A confirmation prompt prevents accidental deletion

### Full-Screen Editor
- A diagonal-arrow button in the toolbar expands the editor to full-screen focus mode
- An "Exit Full Screen" button returns to normal view

### Article Detail View
- Published articles are accessible at `/articles/:id`
- Renders HTML content (Bold, Headings, Lists) correctly
- Displays author name and publish date
- Includes a **Comment Section** below the article

---

## Dashboard

### Content Filtering
- The Creator Dashboard displays all articles authored by the logged-in user
- Three filter tabs:
  - **All Content** — shows all articles regardless of status
  - **Draft** — shows only unpublished drafts
  - **Published** — shows only published articles
- Each article card shows status badge (orange for Draft, green for Published)

---

## Comments

### Persistent Comments
- Any visitor can post a comment on any published article
- Authenticated users: comment is attributed to their account name
- Unauthenticated users: comment is attributed to "Anonymous" or a custom guest name provided
- Comments are stored in **PostgreSQL** and persist across sessions and restarts

---

## User Profile / Account

### Profile Management
- Users can update their **display name** from the Account settings page
- Users can **upload a profile photo** from their device (JPEG, PNG, etc.)
- The image is stored as a Base64 string in the database and displayed as an avatar

### Account Dropdown
- The username in the top navigation opens a dropdown containing:
  - **Dashboard** — link to creator dashboard
  - **Account** — link to profile settings
  - **Logout** — clears session and redirects to home

---

## Public Content Browsing

### Articles Listing
- The `/articles` page lists all published articles
- Articles are sorted newest-first
- Each card shows title, summary, author, date, and a link to the full article

### Home Page
- Landing page with a hero section and featured articles

### About Us & Contact Pages
- Static informational pages

---

## Platform & Infrastructure

### Containerisation
- All services run in **Docker containers** orchestrated with `docker-compose`
- Platform is fully self-contained — no external setup beyond Docker

### Data Persistence
- PostgreSQL data is stored in a **named Docker volume** (`postgres_data`) and survives container restarts

### Auto Seeding
- On first boot, the database is seeded with sample articles and an admin user for immediate exploration
