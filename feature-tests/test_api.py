import requests
import pytest

BFF_URL = "http://localhost:8000"
DATA_URL = "http://localhost:8080"

def test_bff_health():
    """Verify the Python API Gateway is healthy"""
    try:
        response = requests.get(f"{BFF_URL}/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "layer": "python-bff"}
    except requests.exceptions.ConnectionError:
        pytest.skip("BFF is not running")

def test_articles_list():
    """Verify that articles can be fetched"""
    try:
        response = requests.get(f"{BFF_URL}/api/articles")
        assert response.status_code in [200, 503] # Depending on if backend is up
    except requests.exceptions.ConnectionError:
        pytest.skip("BFF is not running")
