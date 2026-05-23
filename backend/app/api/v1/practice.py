from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PracticeOption(BaseModel):
    key: Literal["A", "B", "C", "D"]
    value: str


class DiagnosticQuestion(BaseModel):
    id: int
    type: str
    selected_answer: str
    material: list[str]
    question: str
    options: list[PracticeOption]


class MockDiagnosticResponse(BaseModel):
    current_index: int
    total_count: int
    questions: list[DiagnosticQuestion]


@router.get("/mock-diagnostic", response_model=MockDiagnosticResponse)
def read_mock_diagnostic() -> MockDiagnosticResponse:
    return MockDiagnosticResponse(
        current_index=3,
        total_count=10,
        questions=[
            DiagnosticQuestion(
                id=1,
                type="增长量",
                selected_answer="C",
                material=[
                    "2023 年，某市规模以上工业增加值为 2,860 亿元，"
                    "比上年增长 8.6%。其中，新兴型增加值为 2,410 亿元，"
                    "比上年增长 9.3%。",
                    "2022 年，该市规模以上工业增加值为 2,635 亿元。"
                ],
                question="2023 年该市规模以上工业增加值比上年增加了多少亿元？",
                options=[
                    PracticeOption(key="A", value="185.5"),
                    PracticeOption(key="B", value="201.0"),
                    PracticeOption(key="C", value="225.5"),
                    PracticeOption(key="D", value="246.6")
                ]
            ),
            DiagnosticQuestion(
                id=2,
                type="比重",
                selected_answer="B",
                material=[
                    "2023 年，某地区一般公共预算收入 1,240 亿元，"
                    "其中税收收入 910 亿元。",
                    "同年，该地区非税收入同比下降 4.8%。"
                ],
                question="2023 年该地区税收收入占一般公共预算收入的比重约为多少？",
                options=[
                    PracticeOption(key="A", value="68.2%"),
                    PracticeOption(key="B", value="73.4%"),
                    PracticeOption(key="C", value="78.8%"),
                    PracticeOption(key="D", value="82.1%")
                ]
            ),
            DiagnosticQuestion(
                id=3,
                type="平均数",
                selected_answer="A",
                material=[
                    "2023 年，某市完成快递业务量 18.6 亿件，"
                    "同比增长 12.4%；快递业务收入 156.2 亿元。",
                    "其中同城业务收入占比为 18.5%。"
                ],
                question="2023 年该市平均每件快递业务收入约为多少元？",
                options=[
                    PracticeOption(key="A", value="8.4"),
                    PracticeOption(key="B", value="9.6"),
                    PracticeOption(key="C", value="10.8"),
                    PracticeOption(key="D", value="12.1")
                ]
            )
        ]
    )
