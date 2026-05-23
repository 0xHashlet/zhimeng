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
                    "按可比价格计算，比上年增长 8.6%。分行业看，装备制造业"
                    "增加值为 1,120 亿元，同比增长 10.4%；高技术制造业增加值"
                    "为 760 亿元，同比增长 12.1%。",
                    "全年该市新兴产业增加值为 2,410 亿元，同比增长 9.3%，"
                    "占规模以上工业增加值的比重比上年提高 0.6 个百分点。"
                    "其中，新能源设备制造业、电子信息制造业分别增长 15.8% 和 11.2%。",
                    "2022 年，该市规模以上工业增加值为 2,635 亿元。受市场需求"
                    "恢复和重点项目投产带动，2023 年下半年规模以上工业增加值"
                    "增速较上半年提高 1.4 个百分点。"
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
                    "2023 年，某地区一般公共预算收入 1,240 亿元，同比增长 6.7%。"
                    "其中，税收收入 910 亿元，同比增长 8.9%；非税收入 330 亿元，"
                    "同比下降 4.8%。",
                    "分税种看，增值税收入 382 亿元，同比增长 12.5%；企业所得税"
                    "收入 176 亿元，同比增长 5.6%；个人所得税收入 94 亿元，"
                    "同比增长 3.2%。三项收入合计占税收收入的比重超过七成。",
                    "从支出看，该地区一般公共预算支出 1,486 亿元，同比增长 5.1%。"
                    "其中，教育、社会保障和就业、卫生健康支出分别为 286 亿元、"
                    "244 亿元和 168 亿元。"
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
                    "2023 年，某市邮政行业寄递业务量累计完成 21.4 亿件，"
                    "同比增长 11.8%。其中，快递业务量完成 18.6 亿件，"
                    "同比增长 12.4%；邮政普遍服务业务量完成 2.8 亿件，"
                    "同比增长 7.9%。",
                    "全年快递业务收入 156.2 亿元，同比增长 9.6%。按业务类型分，"
                    "同城业务收入占比为 18.5%，异地业务收入占比为 68.7%，"
                    "国际及港澳台业务收入占比为 12.8%。",
                    "从月度走势看，四季度快递业务量占全年比重为 29.3%，"
                    "较三季度提高 3.1 个百分点。受电商促销活动影响，"
                    "11 月快递业务量达到全年峰值。"
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
