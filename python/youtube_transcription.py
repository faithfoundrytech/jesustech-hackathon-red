import re
from youtube_transcript_api import YouTubeTranscriptApi
from langchain.schema import Document
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS


sys.path.insert(1, './src')
print(sys.path.insert(1, '../src/'))

load_dotenv()

GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY")

if not GEMINI_API_KEY:
  GEMINI_API_KEY = getpass.getpass("Enter you Google Gemini API key: ")



def load_model():
  """
  Func loads the model and embeddings
  """
  model = ChatGoogleGenerativeAI(
      model="models/gemini-1.5-pro-001",
      google_api_key=GEMINI_API_KEY,
      temperature=0.4,
      convert_system_message_to_human=True
  )
  embeddings = GoogleGenerativeAIEmbeddings(
      # model="models/embedding-004",
      model="models/text-embedding-004",
      google_api_key=GEMINI_API_KEY
  )
  return model, embeddings


def create_vector_store(docs: List[Document], embeddings, chunk_size: int = 10000, chunk_overlap: int = 200):
  """
  Create vector store from documents
  """
  text_splitter = RecursiveCharacterTextSplitter(
      chunk_size=chunk_size,
      chunk_overlap=chunk_overlap
  )
  splits = text_splitter.split_documents(docs)

  return FAISS.from_documents(splits, embeddings).as_retriever(search_kwargs={"k": 5})




PROMPT_TEMPLATE = """
  Use the following pieces of context to answer the question at the end.
  If you don't know the answer, just say that you don't know, don't try to make up an answer.

  {context}

  Question: {question}
  Answer:"""


# Assuming transcript already fetched
# Example: fetched_transcript = [{"text": "some text"}, {"text": "another text"}]

def transcripts_to_documents(transcript_chunks: list) -> list:
    """
    Convert YouTube transcript list into LangChain Document format
    """
    documents = []
    for chunk in transcript_chunks:
        # text = chunk.get("text", "")
        if chunk.strip():
            documents.append(Document(page_content=chunk))
    return documents


def get_qa_chain_from_transcripts(transcript_chunks: list):

    try:
        documents = transcripts_to_documents(transcript_chunks)
        if not documents:
            raise ValueError("Transcript content is empty.")

        llm, embeddings = load_model()
        retriever = create_vector_store(documents, embeddings)

        prompt = PromptTemplate(
            template=PROMPT_TEMPLATE,
            input_variables=["context", "question"]
        )

        return RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )
    except Exception as e:
        print(f"Error setting up QA from transcript: {e}")
        return None


def query_system(query: str, qa_chain):
  if not qa_chain:
    return "System not initialized properly"

  try:
    result = qa_chain({"query": query})
    if not result["result"] or "don't know" in result["result"].lower():
      return "The answer could not be found in the provided documents"
    return f"Answer: {result['result']}\nSources: {[s.metadata['source'] for s in result['source_documents']]}"
  except Exception as e:
    return f"Error processing query: {e}"


def extract_youtube_code(url: str) -> str:
    
    regex_patterns = [
        r"(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([^&]+)",      
        r"(?:https?://)?(?:www\.)?youtu\.be/([^?&]+)",                  
        r"(?:https?://)?(?:www\.)?youtube\.com/embed/([^?&]+)",         
    ]

    for pattern in regex_patterns:
        match = re.match(pattern, url)
        if match:
            return match.group(1)

    raise ValueError("Invalid YouTube URL format")

url = input("Enter a YouTube video URL: ")
video_id = extract_youtube_code(url)

# if __name__ == "__main__":
#     url = input("Enter a YouTube video URL: ")
#     try:
#         video_id = extract_youtube_code(url)
#         print(f"Extracted video code: {video_id}")
#     except ValueError as e:
#         print(e)




ytt_api = YouTubeTranscriptApi()
fetched_transcript = ytt_api.fetch(video_id)


# get_content_chain([fetched_transcript])

raw_transcript = " ".join([snippet.text for snippet in fetched_transcript])
cleaned_transcript = re.sub(r'\s+', ' ', raw_transcript)  
cleaned_transcript = re.sub(r'\s+([?.!,])', r'\1', cleaned_transcript)  

print(cleaned_transcript.strip())


# for snippet in fetched_transcript:
#     print(snippet.text)

qa_chain = get_qa_chain_from_transcripts(cleaned_transcript)

# 4. Ask questions
query = "what is the context about"
print(query_system(query, qa_chain))