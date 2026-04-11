# Testing Guide

## Overview

The `feature-tests/` directory contains an **integration test suite** written in Python (pytest) that exercises all platform features against the live running services.

---

## Running the Tests

### Prerequisites

- Docker services must be running (`docker-compose up -d`)
- Python 3.11+ installed locally

### Install test dependencies

```bash
cd feature-tests
pip install -r requirements.txt
```

### Run all tests

```bash
pytest test_api.py -v
```

### Run a specific test class

```bash
pytest test_api.py::TestArticlesCRUD -v
pytest test_api.py::TestComments -v
```

### Run a specific test

```bash
pytest test_api.py::TestLogin::test_login_valid_credentials -v
```

---

## Test Coverage

### 1. Health (`TestHealth`)

| Test | Scenario |
|---|---|
| `test_bff_health` | BFF /health returns `{"status":"ok"}` |
| `test_data_service_reachable_via_articles` | Data service reachable via articles endpoint |

### 2. Registration (`TestRegistration`)

| Test | Scenario |
|---|---|
| `test_register_new_user_success` | New user registers successfully |
| `test_register_duplicate_email_fails` | Duplicate email returns 400 |
| `test_register_missing_fields` | Missing required fields returns 4xx |

### 3. Login (`TestLogin`)

| Test | Scenario |
|---|---|
| `test_login_valid_credentials` | Valid credentials return JWT + user info |
| `test_login_wrong_password` | Wrong password returns 401 |
| `test_login_nonexistent_user` | Unknown email returns 401 |

### 4. Public Articles (`TestArticlesPublicRead`)

| Test | Scenario |
|---|---|
| `test_get_all_published_articles` | Only Published articles returned publicly |
| `test_get_single_article_by_id` | Single article retrieved by ID |
| `test_get_nonexistent_article` | Non-existent ID returns 404 |

### 5. Article CRUD (`TestArticlesCRUD`)

| Test | Scenario |
|---|---|
| `test_create_draft_article` | Authenticated user creates a Draft |
| `test_create_published_article` | Authenticated user creates a Published article |
| `test_slug_auto_generated` | Slug is created from title if not provided |
| `test_draft_not_visible_in_public_articles` | Drafts hidden from public feed |
| `test_published_article_visible_in_public` | Published articles appear in public feed |
| `test_my_content_shows_own_articles` | my-content returns author's own articles |
| `test_my_content_includes_drafts` | my-content includes Draft articles |
| `test_my_content_includes_published` | my-content includes Published articles |
| `test_update_article_title` | PUT updates article title |
| `test_promote_draft_to_published` | PUT changes Draft → Published |
| `test_delete_article` | DELETE removes article; subsequent GET returns 404 |
| `test_update_nonexistent_article` | PUT on non-existent ID returns 404 |
| `test_delete_nonexistent_article` | DELETE on non-existent ID returns 404 |

### 6. Comments (`TestComments`)

| Test | Scenario |
|---|---|
| `test_get_comments_for_article` | GET returns list of comments |
| `test_post_anonymous_comment` | Anonymous comment accepted without auth |
| `test_post_authenticated_comment` | Authenticated comment attributed to user |
| `test_comment_persists` | Posted comment retrievable on next GET |
| `test_comment_has_required_fields` | Comment body has all required fields |

### 7. User Profile (`TestUserProfile`)

| Test | Scenario |
|---|---|
| `test_update_display_name` | PUT updates full name |
| `test_update_profile_picture_url` | PUT updates picture URL |
| `test_profile_update_without_auth_fails` | Unauthenticated update returns 401/403 |

### 8. Unauthenticated my-content (`TestMyContentUnauthenticated`)

| Test | Scenario |
|---|---|
| `test_my_content_without_auth_returns_empty` | No token → empty list (not error) |

---

## Test Design Notes

- **Isolated data**: Each test class creates its own users and articles via `register_and_login()` helper and randomised identifiers — tests never depend on pre-seeded data
- **Auto-cleanup**: Created articles are tracked and deleted in fixture teardown
- **Graceful skipping**: If a service is not reachable, tests `pytest.skip()` rather than fail — making it safe to run against a partially-started environment
- **No mocking**: Tests run against real live services to validate true end-to-end behaviour

---

## Known Limitations

- Google OAuth cannot be fully tested in this suite (requires a real browser and Google login)
- Profile image Base64 upload is not covered (file I/O outside test scope)
- Role-based access control (Admin vs Reader vs Creator) is deferred — currently all registered users share the same effective permissions in dev mode
