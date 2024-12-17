# 📝 Document Conversational Chatbot - GTRAG

Welcome to the **GTRAG** project! This repository contains a full-stack application built using **FastAPI**, **Next.js**, and **PostgreSQL** that leverages **OpenAI's Assistant API** to enable interactive, document-based conversations. The application allows users to upload documents, and the chatbot will answer questions based on the content of the document.

## 🌟 Features

- **FastAPI**: A modern, fast (high-performance) web framework for building the API backend.
- **Next.js**: A powerful React framework for building the frontend and managing the chatbot interface.
- **PostgreSQL**: A reliable and scalable database to store user data, documents, and chat history.
- **OpenAI API**: Leverages OpenAI's GPT-based assistant for intelligent, contextual chatbot responses based on uploaded documents.
- **Document Parsing**: Extracts content from uploaded documents to generate context-aware responses.
- **Interactive Chat**: Real-time, dynamic conversation with the assistant powered by OpenAI.

## 🛠️ Tech Stack

| Technology  | Description                                           |
|-------------|-------------------------------------------------------|
| **FastAPI** | Backend API built with Python for handling requests   |
| **Next.js** | React framework for the frontend interface            |
| **PostgreSQL** | Database for persistent data storage               |
| **OpenAI API** | GPT-based assistant for generating chatbot responses |

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL 13+

### Running the Project

Once both the backend and frontend are running, you can upload documents and interact with the chatbot.

1. Open your browser and go to `http://localhost:3000`.
2. Upload a document (PDF, DOCX, etc.).
3. Start asking questions! The chatbot will analyze the document and respond contextually.

## 📁 Project Structure

```
document-chatbot/
│
├── app/                     # FastAPI backend
│   ├── api/                 # API routes
│   ├── models/              # Database models
│   ├── services/            # Business logic
│   └── main.py              # Entry point for FastAPI
│
├── frontend/                # Next.js frontend
│   ├── components/          # Reusable UI components
│   ├── pages/               # Next.js pages
│   └── styles/              # CSS/SCSS files
│
├── alembic/                 # Database migrations
├── tests/                   # Backend tests
├── requirements.txt         # Python dependencies
└── package.json             # Node.js dependencies
```

## 🙏 Acknowledgments

- Thanks to [OpenAI](https://openai.com/) for providing the GPT-based assistant API.
- Inspired by conversational AI and document analysis projects.

---

Enjoy building with **Document Conversational Chatbot**! Feel free to contribute, report bugs, or suggest features. 😊
