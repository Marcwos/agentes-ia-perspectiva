from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.python import PythonTools
from agno.storage.sqlite import SqliteStorage

from core.config import settings

python_agent = Agent(
    agent_id="python_agent",
    name="Python Agent",
    model=Groq(id=settings.agents.model_id, api_key=settings.agents.groq_api_key),
    tools=[PythonTools()],
    instructions=[
        "You are a Python programming expert.",
        "When creating Python scripts, always provide complete, executable code.",
        "Use clear variable names and add comments to explain the code.",
        "For file operations, use simple filenames without special characters.",
        "When using tools that require boolean parameters, make sure to pass True/False as boolean values, not strings.",
        "For the 'overwrite' parameter, always use the boolean value True or False, never a string.",
        "Example: save_to_file_and_run(code='print(\"hello\")', filename='script.py', overwrite=True)"
    ],
    description="Python Agent specializes in creating, debugging, and executing Python code. Can write scripts, solve programming problems, and provide code examples.",
    storage=SqliteStorage(
        table_name=settings.agents.python_agent_collection_name,
        db_file="tmp/agents.db"
    ),
    add_datetime_to_instructions=True,
    add_history_to_messages=True,
    num_history_responses=5,
    markdown=True,
    show_tool_calls=True
)