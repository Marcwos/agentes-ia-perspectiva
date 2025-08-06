from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.hackernews import HackerNewsTools
from agno.storage.sqlite import SqliteStorage

from core.config import settings

hackernews_agent = Agent(
    agent_id="hackernews_agent",
    name="Hackernews Team",
    model=Groq(id=settings.agents.model_id, api_key=settings.agents.groq_api_key),
    tools=[HackerNewsTools()],
    instructions=["Always include sources"],
    description="Hackernews Team is a group of hackernews agents that can answer questions about Hackernews.",
    storage=SqliteStorage(
        table_name=settings.agents.hackernews_agent_collection_name,
        db_file="tmp/agents.db"
    ),
    add_datetime_to_instructions=True,
    add_history_to_messages=True,
    num_history_responses=5,
    markdown=True,
)