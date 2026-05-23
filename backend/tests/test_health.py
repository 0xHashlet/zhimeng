from fastapi.testclient import TestClient

from app.main import app


def test_read_health() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "织梦考公助手 API",
        "version": "0.1.0",
        "environment": "local"
    }
