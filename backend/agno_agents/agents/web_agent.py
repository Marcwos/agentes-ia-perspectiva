from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.storage.sqlite import SqliteStorage

from core.config import settings

web_agent = Agent(
    agent_id="web_agent",
    name="Marcwos Agent",
    model=Groq(id=settings.agents.model_id, api_key=settings.agents.groq_api_key),
    tools=[DuckDuckGoTools()],
    instructions=["Always include sources"],
    description="Web Agent is a knowledgeable agent that can answer questions about the web.",
    storage=SqliteStorage(
        table_name=settings.agents.web_agent_collection_name,
        db_file="tmp/agents.db"
    ),
    add_datetime_to_instructions=True,
    add_history_to_messages=True,
    num_history_responses=5,
    markdown=True,
)