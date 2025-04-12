from models import Base
from sqlalchemy import create_engine
import os

# Remove existing database if it exists
if os.path.exists('sermon_games.db'):
    print("Removing existing database...")
    os.remove('sermon_games.db')

# Create new database with updated schema
print("Creating new database...")
engine = create_engine('sqlite:///sermon_games.db')
Base.metadata.create_all(engine)

print("Database rebuilt successfully!")
