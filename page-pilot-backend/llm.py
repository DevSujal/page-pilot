import os
from flask import Flask, request, jsonify
from langchain_groq import ChatGroq
from langchain.schema import SystemMessage
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.docstore.document import Document
import re

# Dictionary to hold per-session assistant instances.
assistant_sessions = {}


def initialize_assistant_for_session(session_id: str, page_content: str = None):
    """
    Initializes a new assistant instance for a given session.
    If the session already exists, returns the existing instance.
    Optionally uses the provided page_content as a Document in the vector store.
    """
    if session_id in assistant_sessions:
        # Already initialized for this session.
        return assistant_sessions[session_id]

    print(f"Initializing assistant for session: {session_id}")

    # 1. Initialize ChatGroq LLM.
    chat = ChatGroq(
        model="gemma2-9b-it",
        streaming=False,
    )

    # 2. Set up system instructions and conversation memory.
    system_message = SystemMessage(
        content=(
            """
            You are an AI assistant integrated into a Chrome browser extension that helps users understand webpage content and answer their questions. Your responses should be provided as clean, properly structured HTML that can be directly rendered in the extension's sidebar.

    RESPONSE FORMAT REQUIREMENTS:
    1. Always wrap your entire response in a <div> container with appropriate styling
    2. Use semantic HTML5 elements (nav, article, section, header, footer) where appropriate
    3. Include inline styles for consistent rendering
    4. Maintain proper hierarchy with headings (h1-h6)
    5. Ensure all code blocks are wrapped in <pre> and <code> tags
    6. Use appropriate spacing and padding for readability
    7. only use black box for codes rest can like normal html no need to give them background like anchor tag, div, p etc.

    STYLING GUIDELINES:
    - Use a clean, modern aesthetic suitable for a sidebar interface
    - Default font: system-ui, -apple-system, sans-serif
    - Note do not give any perticular background color and text-color
    - Maximum width: 100%
    - Padding: 16px
    - Line height: 1.5
    - Links: #0066cc
    - Code blocks: monospace font, border, heading
    - Margins between elements: 16px

    COMPONENT TEMPLATES:

    For text responses:
    ```html
    <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; padding: 16px;">
        <p style="margin: 0 0 16px 0;">Your text here</p>
    </div>
    ```

    For code snippets:
    ```html
    <pre style="background: black; padding: 16px; border-radius: 4px; overflow-x: auto; margin: 16px 0;">
        <code style="font-family: monospace;">Your code here</code>
    </pre>
    ```

    For lists:
    ```html
    <ul style="margin: 16px 0; padding-left: 24px;">
        <li style="margin: 8px 0;">List item</li>
    </ul>
    ```

    INTERACTION RULES:
    1. When referencing webpage content, highlight relevant sections using <mark> tags
    2. For interactive elements, use appropriate ARIA labels
    3. Ensure all links open in new tabs with target="_blank"
    4. Include hover states for interactive elements
    5. Maintain consistent spacing between different content blocks

    ERROR HANDLING:
    - If unable to generate proper HTML, provide a simple text response wrapped in paragraph tags
    - Include error messages in <div> with red text (#ff0000)
    - Always validate HTML structure before responding

    EXAMPLES:

    For a simple text response:
    ```html
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 16px;">
        <h2 style="margin: 0 0 16px 0; font-size: 1.5em;">Answer Summary</h2>
        <p style="margin: 0 0 16px 0;">This is the answer to your question.</p>
        <p style="margin: 0; color: #666;">Additional context if needed.</p>
    </div>
    ```

    For a response with multiple components:
    ```html
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 16px;">
        <section style="margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; font-size: 1.5em;">Main Answer</h2>
            <p style="margin: 0 0 16px 0;">Primary explanation here.</p>
            <pre style=" padding: 16px; border-radius: 4px; overflow-x: auto;">
                <code>Example code here</code>
            </pre>
        </section>
        <section style=" padding: 16px; border-radius: 4px;">
            <h3 style="margin: 0 0 12px 0; font-size: 1.2em;">Related Information</h3>
            <ul style="margin: 0; padding-left: 24px;">
                <li style="margin: 8px 0;">Additional point 1</li>
                <li style="margin: 8px 0;">Additional point 2</li>
            </ul>
        </section>
    </div>
    ```

    ACCESSIBILITY CONSIDERATIONS:
    1. Include proper ARIA labels and roles
    2. Maintain sufficient color contrast (WCAG 2.1 compliant)
    3. Ensure proper heading hierarchy
    4. Provide alt text for any images
    5. Make interactive elements keyboard accessible

    When generating responses:
    1. Start by understanding the user's question and webpage context
    2. Structure the response logically using appropriate HTML elements
    3. Apply consistent styling using the provided templates
    4. Ensure the response is complete and self-contained
    5. Validate the HTML structure before sending the response
            """
        )
    )

    memory = ConversationBufferMemory(memory_key="history", return_messages=True)
    conversation_chain = ConversationChain(llm=chat, memory=memory, verbose=False)
    # Initialize the conversation chain by sending the system prompt.
    _ = conversation_chain.predict(input=system_message.content)

    # 3. Set up the vector store (for retrieval-augmented generation).
    print(f"Setting up vector store and embeddings for session: {session_id}")

    # Start with an empty list of documents.
    sample_docs = []

    # If page content is provided, add it as a Document.
    if page_content:
        sample_docs.append(Document(page_content=page_content))
    else:
        sample_docs.append(Document(page_content="No page content provided."))

    # Add additional default documents.
    sample_docs.extend(
        [
            Document(
                page_content="This document explains HTML structure and proper usage of tags like <div> and <p>."
            ),
            Document(
                page_content="This document provides guidelines for styling a narrow side panel using inline CSS and predefined classes."
            ),
            Document(
                page_content="This document details how to perform safe HTML modifications and annotations for browser extensions."
            ),
        ]
    )

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001", google_api_key=os.environ["GOOGLE_API_KEY"]
    )

    vector_store = Chroma.from_documents(documents=sample_docs, embedding=embeddings)
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    # Bundle all components into a session instance.
    assistant_instance = {
        "chat": chat,
        "memory": memory,
        "conversation_chain": conversation_chain,
        "vector_store": vector_store,
        "retriever": retriever,
    }

    assistant_sessions[session_id] = assistant_instance
    print(f"Assistant for session '{session_id}' initialized successfully.")
    return assistant_instance


def retrieve_context_for_session(session_instance, query: str) -> str:
    """
    Retrieves relevant context from the session's vector store.
    """
    retriever = session_instance["retriever"]
    docs = retriever.get_relevant_documents(query)
    context = "\n".join([doc.page_content for doc in docs])
    return context


def get_assistant_answer_for_session(session_id: str, query: str) -> str:
    """
    Retrieves (or initializes) the assistant for the session and
    uses it to generate an answer for the provided query.
    """
    session_instance = assistant_sessions.get(session_id)
    if not session_instance:
        # If session isn't initialized, return an error.
        raise ValueError("Session not initialized. Please call /initialize first.")
    context = retrieve_context_for_session(session_instance, query)
    conversation_chain = session_instance["conversation_chain"]
    combined_input = f"Context: {context}\nUser Query: {query}"
    response = conversation_chain.predict(input=combined_input)
    return response


# -----------------------------
# Flask API Endpoints
# -----------------------------
app = Flask(__name__)


@app.route("/initialize", methods=["POST"])
def initialize():
    """
    Expects JSON:
      { "session_id": "unique-session-identifier", "page_content": "HTML content of the page" }
    Initializes the assistant for that session with the provided page content.
    """
    data = request.get_json()
    session_id = data.get("session_id")
    page_content = data.get("page_content")  # Page content provided by the extension.
    if not session_id:
        return jsonify({"error": "No session_id provided."}), 400
    try:
        initialize_assistant_for_session(session_id, page_content)
        return (
            jsonify({"status": f"Assistant initialized for session '{session_id}'."}),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/query", methods=["POST"])
def query():
    """
    Expects JSON:
      { "session_id": "unique-session-identifier", "query": "User query text" }
    Returns the assistant's answer based on the session-specific context.
    """
    data = request.get_json()
    session_id = data.get("session_id")
    query_text = data.get("query")
    if not session_id:
        return jsonify({"error": "No session_id provided."}), 400
    if not query_text:
        return jsonify({"error": "No query provided."}), 400
    try:
        answer = get_assistant_answer_for_session(session_id, query_text)
        return jsonify({"answer": answer}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
