from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship, declarative_base
from pydantic import BaseModel, Field

# SQLAlchemy Base
Base = declarative_base()

# SQLAlchemy Models
class Sermon(Base):
    __tablename__ = "sermons"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)  # The actual content or reference
    content_type = Column(String(50), nullable=False)  # 'youtube', 'pdf', 'text'
    source_url = Column(String(255), nullable=True)  # Optional URL source
    custom_prompt = Column(Text, nullable=True)  # Custom instructions
    created_at = Column(DateTime, default=datetime.utcnow)
    games = relationship("Game", back_populates="sermon")

class Game(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    sermon_id = Column(Integer, ForeignKey("sermons.id"))
    theme = Column(String(255), nullable=False)
    main_topics = Column(JSON, nullable=True)
    game_structure = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    sermon = relationship("Sermon", back_populates="games")
    questions = relationship("Question", back_populates="game")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"))
    text = Column(Text, nullable=False)  # This is likely named 'text' instead of 'question'
    correct_answer = Column(JSON, nullable=False)
    question_type = Column(String(50), nullable=False)
    options = Column(JSON, nullable=True)  # For multiple-choice options
    hints = Column(JSON, nullable=True)
    learning_points = Column(JSON, nullable=True)
    difficulty = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    game = relationship("Game", back_populates="questions")

# Pydantic Models (for API)
class SermonBase(BaseModel):
    title: str
    content: str
    source_type: str
    source_url: Optional[str] = None
    
    class Config:
        from_attributes = True  # Changed from orm_mode to from_attributes in Pydantic v2

class SermonCreate(SermonBase):
    pass

class SermonResponse(SermonBase):
    id: int
    created_at: datetime

class QuestionBase(BaseModel):
    question_text: str
    correct_answer: str
    question_type: str
    options: List[str]
    hints: Optional[List[str]] = None
    learning_points: Optional[List[str]] = None
    
    class Config:
        from_attributes = True

class QuestionCreate(QuestionBase):
    game_id: int

class QuestionResponse(QuestionBase):
    id: int
    game_id: int
    created_at: datetime

class GameBase(BaseModel):
    sermon_id: int
    theme: str
    main_topics: List[str]
    game_structure: Dict[str, Any]
    
    class Config:
        from_attributes = True

class GameCreate(GameBase):
    pass

class GameResponse(GameBase):
    id: int
    created_at: datetime
    questions: List[QuestionResponse]

class ProcessSermonRequest(BaseModel):
    content_type: str  # youtube, pdf, text
    content: str
    custom_prompt: Optional[str] = None

class ProcessSermonResponse(BaseModel):
    success: bool
    game_plan: Optional[Dict[str, Any]] = None
    questions: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None