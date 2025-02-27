import logging
from typing import List, Optional, Dict, Any
from openai import OpenAI
from google import genai
from ..models.visitor import ChatMessage

class LLMService:
    def __init__(self, openai_api_key: str, gemini_api_key: str):
        self.openai_client = OpenAI(api_key=openai_api_key)
        self.gemini_client = genai.Client(api_key=gemini_api_key)

    def call_gemini_flash(self, prompt: str, model: str = "gemini-2.0-flash") -> str:
        try:
            response = self.gemini_client.models.generate_content(
                model=model,
                contents=[prompt]
            )
            return response.text
        except Exception as e:
            logging.error(f"Error calling Gemini API: {str(e)}")
            raise e

    def call_gemini_with_history(self, history: List[ChatMessage], prompt: str, model: str = "gemini-2.0-flash") -> str:
        try:
            chat = self.gemini_client.chats.create(model=model)
            for msg in history:
                chat.send_message(msg.content)
            response = chat.send_message(prompt)
            return response.text
        except Exception as e:
            logging.error(f"Error calling Gemini API with history: {str(e)}")
            raise e

    def call_openai_llm(self, messages: List[Dict[str, Any]], model: str = "gpt-4o-mini") -> str:
        try:
            completion = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                store=True
            )
            return completion.choices[0].message.content
        except Exception as e:
            logging.error(f"Error calling OpenAI API: {str(e)}")
            raise e