from fastapi.testclient import TestClient

from app.main import app


def test_read_mock_diagnostic() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/practice/mock-diagnostic")

    assert response.status_code == 200
    data = response.json()
    assert data["current_index"] == 3
    assert data["total_count"] == 10
    assert len(data["questions"]) == 3
    assert data["questions"][0]["type"] == "增长量"
    assert data["questions"][0]["selected_answer"] == "C"
