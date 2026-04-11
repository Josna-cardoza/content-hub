"""
ATKLHub Feature Test Suite
==========================
Covers all platform features end-to-end via the BFF API (http://localhost:8000).

Run with:
    pip install -r requirements.txt
    pytest test_api.py -v

The suite automatically skips individual tests if the services are not running,
so it is safe to run partially. All destructive tests use isolated data and
clean up after themselves.
"""

import pytest
import requests
import time
import random
import string

BFF_URL = "http://localhost:8000"
DATA_URL = "http://localhost:8080"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def random_email():
    tag = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"testuser_{tag}@atklhub-test.com"


def random_str(n=8):
    return "".join(random.choices(string.ascii_lowercase, k=n))


def skip_if_down(url=BFF_URL):
    """Decorator-compatible check — raises pytest.skip if service unreachable."""
    try:
        requests.get(f"{url}/health", timeout=3)
    except requests.exceptions.ConnectionError:
        pytest.skip(f"Service at {url} is not running")


def register_and_login(email=None, password="TestPass123!", full_name="Test User"):
    """Register a new user and return (token, user_info)."""
    if email is None:
        email = random_email()
    reg = requests.post(f"{BFF_URL}/api/auth/register", json={
        "email": email,
        "password": password,
        "fullName": full_name,
    }, timeout=10)
    assert reg.status_code == 200, f"Register failed: {reg.text}"

    login = requests.post(f"{BFF_URL}/api/auth/login", json={
        "email": email,
        "password": password,
    }, timeout=10)
    assert login.status_code == 200, f"Login failed: {login.text}"
    data = login.json()
    return data["token"], data["user"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# 1. Health Checks
# ---------------------------------------------------------------------------

class TestHealth:
    def test_bff_health(self):
        """BFF returns healthy status."""
        skip_if_down()
        r = requests.get(f"{BFF_URL}/health")
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "ok"
        assert body["layer"] == "python-bff"

    def test_data_service_reachable_via_articles(self):
        """Data service is reachable (articles endpoint returns a list)."""
        skip_if_down()
        r = requests.get(f"{BFF_URL}/api/articles")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------------------------------------------------------------------------
# 2. Authentication — Registration
# ---------------------------------------------------------------------------

class TestRegistration:
    def test_register_new_user_success(self):
        """A new user can register with valid credentials."""
        skip_if_down()
        email = random_email()
        r = requests.post(f"{BFF_URL}/api/auth/register", json={
            "email": email,
            "password": "StrongPass1!",
            "fullName": "New User",
        })
        assert r.status_code == 200
        assert "registered" in r.json().get("message", "").lower()

    def test_register_duplicate_email_fails(self):
        """Registering with an existing email returns 400."""
        skip_if_down()
        email = random_email()
        payload = {"email": email, "password": "Abc123!", "fullName": "Dup"}
        requests.post(f"{BFF_URL}/api/auth/register", json=payload)
        r = requests.post(f"{BFF_URL}/api/auth/register", json=payload)
        assert r.status_code == 400

    def test_register_missing_fields(self):
        """Registration without required fields fails."""
        skip_if_down()
        r = requests.post(f"{BFF_URL}/api/auth/register", json={"email": random_email()})
        # Should return 4xx — not a 200
        assert r.status_code >= 400


# ---------------------------------------------------------------------------
# 3. Authentication — Login
# ---------------------------------------------------------------------------

class TestLogin:
    def test_login_valid_credentials(self):
        """Valid credentials return a JWT token and user info."""
        skip_if_down()
        email = random_email()
        password = "LoginTest99!"
        requests.post(f"{BFF_URL}/api/auth/register", json={
            "email": email, "password": password, "fullName": "Login Tester"
        })
        r = requests.post(f"{BFF_URL}/api/auth/login", json={
            "email": email, "password": password
        })
        assert r.status_code == 200
        body = r.json()
        assert "token" in body
        assert isinstance(body["token"], str)
        assert len(body["token"]) > 20
        assert "user" in body
        assert body["user"]["email"] == email

    def test_login_wrong_password(self):
        """Wrong password returns 401."""
        skip_if_down()
        email = random_email()
        requests.post(f"{BFF_URL}/api/auth/register", json={
            "email": email, "password": "CorrectPass1!", "fullName": "X"
        })
        r = requests.post(f"{BFF_URL}/api/auth/login", json={
            "email": email, "password": "WrongPass999!"
        })
        assert r.status_code == 401

    def test_login_nonexistent_user(self):
        """Login with unknown email returns 401."""
        skip_if_down()
        r = requests.post(f"{BFF_URL}/api/auth/login", json={
            "email": "nobody@nowhere.invalid", "password": "anything"
        })
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# 4. Articles — Public Read
# ---------------------------------------------------------------------------

class TestArticlesPublicRead:
    def test_get_all_published_articles(self):
        """GET /api/articles returns a list (only published)."""
        skip_if_down()
        r = requests.get(f"{BFF_URL}/api/articles")
        assert r.status_code == 200
        articles = r.json()
        assert isinstance(articles, list)
        # All returned articles must be Published
        for a in articles:
            assert a.get("status") == "Published", f"Draft article leaked: {a['title']}"

    def test_get_single_article_by_id(self):
        """GET /api/articles/:id returns a single article."""
        skip_if_down()
        articles = requests.get(f"{BFF_URL}/api/articles").json()
        if not articles:
            pytest.skip("No published articles exist")
        article_id = articles[0]["id"]
        r = requests.get(f"{BFF_URL}/api/articles/{article_id}")
        assert r.status_code == 200
        body = r.json()
        assert body["id"] == article_id
        assert "title" in body
        assert "content" in body

    def test_get_nonexistent_article(self):
        """GET /api/articles/99999 returns 404."""
        skip_if_down()
        r = requests.get(f"{BFF_URL}/api/articles/99999")
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# 5. Articles — Authenticated CRUD
# ---------------------------------------------------------------------------

class TestArticlesCRUD:
    @pytest.fixture(autouse=True)
    def setup(self):
        skip_if_down()
        self.token, self.user = register_and_login()
        self.headers = auth_headers(self.token)
        self.created_ids = []
        yield
        # Cleanup — delete any articles created during tests
        for aid in self.created_ids:
            requests.delete(f"{BFF_URL}/api/articles/{aid}", headers=self.headers)

    def _create_article(self, status="Draft", title=None):
        title = title or f"Test Article {random_str()}"
        r = requests.post(f"{BFF_URL}/api/articles", json={
            "title": title,
            "summary": "A test summary",
            "content": "<p>Test content body</p>",
            "imageUrl": "",
            "status": status,
        }, headers=self.headers)
        if r.status_code == 201:
            self.created_ids.append(r.json()["id"])
        return r

    def test_create_draft_article(self):
        """Authenticated user can create a Draft article."""
        r = self._create_article(status="Draft")
        assert r.status_code == 201
        body = r.json()
        assert body["status"] == "Draft"
        assert body["title"].startswith("Test Article")
        assert body["id"] > 0

    def test_create_published_article(self):
        """Authenticated user can create a Published article."""
        r = self._create_article(status="Published")
        assert r.status_code == 201
        assert r.json()["status"] == "Published"

    def test_slug_auto_generated(self):
        """A slug is automatically generated from the title."""
        r = self._create_article()
        assert r.status_code == 201
        slug = r.json().get("slug", "")
        assert len(slug) > 0, "Slug should be auto-generated"

    def test_draft_not_visible_in_public_articles(self):
        """A Draft article does not appear in GET /api/articles."""
        title = f"Draft Secret {random_str()}"
        self._create_article(status="Draft", title=title)
        public = requests.get(f"{BFF_URL}/api/articles").json()
        titles = [a["title"] for a in public]
        assert title not in titles, "Draft article should not be publicly visible"

    def test_published_article_visible_in_public(self):
        """A Published article appears in GET /api/articles."""
        title = f"Public Article {random_str()}"
        r = self._create_article(status="Published", title=title)
        assert r.status_code == 201
        article_id = r.json()["id"]
        public = requests.get(f"{BFF_URL}/api/articles").json()
        ids = [a["id"] for a in public]
        assert article_id in ids

    def test_my_content_shows_own_articles(self):
        """GET /api/articles/my-content returns the user's own articles."""
        r = self._create_article(status="Draft")
        assert r.status_code == 201
        mine = requests.get(f"{BFF_URL}/api/articles/my-content", headers=self.headers)
        assert mine.status_code == 200
        ids = [a["id"] for a in mine.json()]
        assert r.json()["id"] in ids

    def test_my_content_includes_drafts(self):
        """my-content returns Draft articles (not filtered out)."""
        r = self._create_article(status="Draft")
        mine = requests.get(f"{BFF_URL}/api/articles/my-content", headers=self.headers).json()
        statuses = [a["status"] for a in mine]
        assert "Draft" in statuses

    def test_my_content_includes_published(self):
        """my-content returns Published articles."""
        r = self._create_article(status="Published")
        mine = requests.get(f"{BFF_URL}/api/articles/my-content", headers=self.headers).json()
        statuses = [a["status"] for a in mine]
        assert "Published" in statuses

    def test_update_article_title(self):
        """PUT /api/articles/:id updates the article title."""
        r = self._create_article()
        article = r.json()
        new_title = f"Updated Title {random_str()}"
        updated = requests.put(f"{BFF_URL}/api/articles/{article['id']}", json={
            **article,
            "title": new_title,
        }, headers=self.headers)
        assert updated.status_code == 200
        assert updated.json()["title"] == new_title

    def test_promote_draft_to_published(self):
        """PUT can change a Draft article to Published."""
        r = self._create_article(status="Draft")
        article = r.json()
        updated = requests.put(f"{BFF_URL}/api/articles/{article['id']}", json={
            **article,
            "status": "Published",
        }, headers=self.headers)
        assert updated.status_code == 200
        assert updated.json()["status"] == "Published"

    def test_delete_article(self):
        """DELETE /api/articles/:id removes the article."""
        r = self._create_article()
        article_id = r.json()["id"]
        del_r = requests.delete(f"{BFF_URL}/api/articles/{article_id}", headers=self.headers)
        assert del_r.status_code in [200, 204]
        # Verify it's gone
        get_r = requests.get(f"{BFF_URL}/api/articles/{article_id}")
        assert get_r.status_code == 404
        # Remove from cleanup list since already deleted
        self.created_ids.remove(article_id)

    def test_update_nonexistent_article(self):
        """PUT on a non-existent article returns 404."""
        r = requests.put(f"{BFF_URL}/api/articles/99999", json={
            "id": 99999, "title": "Ghost", "summary": "", "content": "", "status": "Draft"
        }, headers=self.headers)
        assert r.status_code == 404

    def test_delete_nonexistent_article(self):
        """DELETE on a non-existent article returns 404."""
        r = requests.delete(f"{BFF_URL}/api/articles/99999", headers=self.headers)
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# 6. Comments
# ---------------------------------------------------------------------------

class TestComments:
    @pytest.fixture(autouse=True)
    def setup(self):
        skip_if_down()
        # Get or create a published article to comment on
        articles = requests.get(f"{BFF_URL}/api/articles").json()
        if articles:
            self.article_id = articles[0]["id"]
        else:
            # Create one as an authenticated user
            self.token, _ = register_and_login()
            r = requests.post(f"{BFF_URL}/api/articles", json={
                "title": "Comment Test Article",
                "summary": "For comments",
                "content": "<p>Content</p>",
                "status": "Published",
            }, headers=auth_headers(self.token))
            self.article_id = r.json()["id"]

    def test_get_comments_for_article(self):
        """GET /api/comments/article/:id returns a list."""
        r = requests.get(f"{BFF_URL}/api/comments/article/{self.article_id}")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_post_anonymous_comment(self):
        """Any user can post a comment without authentication."""
        r = requests.post(f"{BFF_URL}/api/comments", json={
            "articleId": self.article_id,
            "content": "This is an anonymous comment.",
            "guestName": "Anonymous",
        })
        assert r.status_code == 201
        body = r.json()
        assert body["content"] == "This is an anonymous comment."
        assert body["articleId"] == self.article_id

    def test_post_authenticated_comment(self):
        """Authenticated users post a comment attributed to their name."""
        token, user = register_and_login(full_name="Commenter McFace")
        r = requests.post(f"{BFF_URL}/api/comments", json={
            "articleId": self.article_id,
            "content": "Authenticated comment.",
            "guestName": user["fullName"],
        }, headers=auth_headers(token))
        assert r.status_code == 201
        body = r.json()
        assert body["content"] == "Authenticated comment."

    def test_comment_persists(self):
        """A posted comment is retrievable afterwards."""
        unique_content = f"Persistent comment {random_str()}"
        requests.post(f"{BFF_URL}/api/comments", json={
            "articleId": self.article_id,
            "content": unique_content,
            "guestName": "Tester",
        })
        r = requests.get(f"{BFF_URL}/api/comments/article/{self.article_id}")
        contents = [c["content"] for c in r.json()]
        assert unique_content in contents

    def test_comment_has_required_fields(self):
        """Posted comment contains id, content, guestName, createdAt."""
        r = requests.post(f"{BFF_URL}/api/comments", json={
            "articleId": self.article_id,
            "content": "Field check comment.",
            "guestName": "Field Checker",
        })
        assert r.status_code == 201
        body = r.json()
        assert "id" in body
        assert "content" in body
        assert "guestName" in body
        assert "createdAt" in body


# ---------------------------------------------------------------------------
# 7. User Profile
# ---------------------------------------------------------------------------

class TestUserProfile:
    @pytest.fixture(autouse=True)
    def setup(self):
        skip_if_down()
        self.token, self.user = register_and_login(full_name="Profile Tester")
        self.headers = auth_headers(self.token)

    def test_update_display_name(self):
        """PUT /api/users/profile updates the user's full name."""
        new_name = f"Updated Name {random_str()}"
        r = requests.put(f"{BFF_URL}/api/users/profile", json={
            "fullName": new_name,
            "pictureUrl": "",
        }, headers=self.headers)
        assert r.status_code == 200
        assert r.json()["fullName"] == new_name

    def test_update_profile_picture_url(self):
        """PUT /api/users/profile updates the picture URL."""
        r = requests.put(f"{BFF_URL}/api/users/profile", json={
            "fullName": "Profile Tester",
            "pictureUrl": "https://example.com/avatar.png",
        }, headers=self.headers)
        assert r.status_code == 200
        assert r.json()["pictureUrl"] == "https://example.com/avatar.png"

    def test_profile_update_without_auth_fails(self):
        """Unauthenticated profile update returns 401."""
        r = requests.put(f"{BFF_URL}/api/users/profile", json={
            "fullName": "Hacker",
            "pictureUrl": "",
        })
        assert r.status_code in [401, 403]


# ---------------------------------------------------------------------------
# 8. my-content without auth returns empty list (not error)
# ---------------------------------------------------------------------------

class TestMyContentUnauthenticated:
    def test_my_content_without_auth_returns_empty(self):
        """GET /api/articles/my-content without a token returns empty list."""
        skip_if_down()
        r = requests.get(f"{BFF_URL}/api/articles/my-content")
        assert r.status_code == 200
        assert r.json() == []
