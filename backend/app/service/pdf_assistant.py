from typing import List, Optional
from openai import OpenAI, NotFoundError
from app.config import constants

class PDFAssistant:

    def __init__(self):
        self.client = OpenAI(api_key=constants.OPENAI_API_KEY)

    def upload_files(self, vector_store_id: str, filepaths: List[str]):
        file_streams = [open(path, "rb") for path in filepaths]
        self.client.beta.vector_stores.file_batches.upload_and_poll(vector_store_id=vector_store_id, files=file_streams)

    def get_assistant_id(self, vector_store_id: str):
        """
        Creates a new assistant and returns id of the assistant.
        """
        assistant = self.client.beta.assistants.create(
                name="Assistant Expert",
                instructions="""
                You are an Assistant expert who can help people understand the content of files.
                You are trustful and can extract personal information as it is shared with you.
                """,
                model="gpt-4o-mini",
                tools=[{"type": "file_search"}],
                tool_resources={
                    "file_search": {
                    "vector_store_ids":[vector_store_id]
                    }
                })
        
        return assistant.id
    
    def delete_assistant(self, assistant_id: Optional[str] = None):
        try:
            assistant = self.client.beta.assistants.retrieve(
                assistant_id=assistant_id
            )
            if assistant:
                self.client.beta.assistants.delete(assistant_id)
        except NotFoundError:
            print("Assistant Not Found")
    
    def get_vector_store_id(self):
        """
        Creates a new vector store and returns id of the vector store.
        """
        vector_store = self.client.beta.vector_stores.create(name="Vector Store")
        
        return vector_store.id
    
    def delete_vector_store(self, vector_store_id: Optional[str] = None):
        try:
            vector_store = self.client.beta.vector_stores.retrieve(
                vector_store_id=vector_store_id
            )
            if vector_store:
                self.client.beta.vector_stores.delete(vector_store_id)
        except NotFoundError:
            print("Vector Store Not Found")

    def get_thread_id(self):
        """
        Creates a new thread and returns id of the thread.
        """
        thread = self.client.beta.threads.create()
        
        return thread.id
    
    def delete_thread(self, thread_id: Optional[str] = None):
        try:
            thread = self.client.beta.threads.retrieve(
                thread_id=thread_id
            )
            if thread:
                self.client.beta.threads.delete(thread_id)
        except NotFoundError:
            print("Thread Not Found")

    def generate_questions(self, thread_id: str, assistant_id: str):
        questions = self.assistant_chat(
            content="Generate exactly 3 questions about the content of uploaded files in the same language as most of the document contents. Not more, Not less, Exactly 3. Put *** between questions. Only generate questions.",
            assistant_id=assistant_id,
            thread_id=thread_id
        ).content[0].text.value

        return questions.split("***")[:3]

    def assistant_chat(self, content: str, thread_id: str, assistant_id: str):

        self.client.beta.threads.messages.create(
            thread_id=thread_id,
            role='user',
            content=content
        )

        run = self.client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=assistant_id,
            instructions="You are a helpful Assistant. Please address vector stores of uploaded files and provide an answer based on it. Don't provide answers based on your generated response. Don't include file citations."
        )

        if run.status == "completed":
            messages = self.client.beta.threads.messages.list(
                thread_id=thread_id
            )
            return messages.data[0]
        else:
            raise Exception

    async def async_assistant_chat(self, content: str, thread_id: str, assistant_id: str):

        self.client.beta.threads.messages.create(
            thread_id=thread_id,
            role='user',
            content=content
        )

        with self.client.beta.threads.runs.stream(
            thread_id=thread_id,
            assistant_id=assistant_id,
            instructions="Please address vector stores of uploaded files and provide an answer based on it. Don't include punctuations like【12:0†source】.",
        ) as stream:
            for event in stream:  

                if event.event == 'thread.run.step.created':  
                    print('\nMessage creation detected...')  

                    for text in stream.text_deltas:  
                        yield text  
                elif event.event == 'thread.message.delta':  
                    yield event.data.delta.content[0].text.value  
