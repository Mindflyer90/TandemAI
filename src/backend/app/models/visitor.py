from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = datetime.now()

class ChatHistory(BaseModel):
    user_id: str
    messages: List[ChatMessage] = [] 