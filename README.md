# 🤖 BlueBot - AI Coding Assistant

A modern, full-stack AI coding assistant powered by Google Gemini, built with FastAPI and React. BlueBot provides intelligent programming assistance with support for 20+ programming languages and a beautiful, responsive chat interface.

![BlueBot Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![Gemini](https://img.shields.io/badge/Gemini-2.5--Flash-orange)

## ✨ Features

### 🎯 **Core Functionality**
- **AI-Powered Coding Assistant**: Expert programming and technology guidance
- **Multi-Language Support**: 20+ programming languages including Python, JavaScript, Java, C++, Rust, and more
- **Real-time Streaming**: Smooth text streaming for enhanced user experience
- **Markdown Rendering**: Beautiful code formatting with syntax highlighting
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 🎨 **User Interface**
- **Modern Chat Interface**: Clean, professional design with smooth animations
- **Language Selector**: Dropdown with programming language icons and names
- **Auto-scroll**: Automatic scrolling to latest messages
- **Custom Scrollbars**: Styled scrollbars for better user experience
- **Loading States**: Visual feedback during API requests
- **Error Handling**: Graceful error messages and recovery

### 🔧 **Technical Features**
- **RESTful API**: FastAPI backend with comprehensive error handling
- **CORS Support**: Cross-origin resource sharing enabled
- **Environment Configuration**: Secure API key management
- **Health Monitoring**: Built-in health check and test endpoints
- **Logging**: Comprehensive request and error logging

## 🏗️ Architecture

```
Chatbot-FastAPI/
├── api/                    # FastAPI Backend
│   ├── main.py            # Main API server with Gemini integration
│   └── __init__.py        # Python package initialization
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Styling and responsive design
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Node.js dependencies
│   └── vite.config.js     # Vite configuration with proxy
├── venv/                  # Python virtual environment
└── .gitignore            # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Chatbot-FastAPI
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn python-dotenv google-genai
```

#### Configure Environment Variables
Create a `.env` file in the `api/` directory:
```bash
# api/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Start the Backend Server
```bash
cd api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd frontend
npm install
```

#### Start the Development Server
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

## 📚 API Documentation

### Endpoints

#### `POST /chat`
Send a message to the AI assistant.

**Request Body:**
```json
{
  "user_message": "How do I create a Python function?",
  "language": "Python"
}
```

**Response:**
```json
{
  "response": "Here's how to create a Python function:\n\n```python\ndef greet(name):\n    return f\"Hello, {name}!\"\n```"
}
```

#### `GET /health`
Check the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "gemini_client_ready": true,
  "api_key_configured": true
}
```

#### `GET /test`
Test the API key and basic functionality.

**Response:**
```json
{
  "api_key_status": "API key found: AIzaSyC...",
  "client_ready": true,
  "test_response": "Hello",
  "environment_vars": {
    "GEMINI_API_KEY": "Set",
    "GOOGLE_API_KEY": "Not set",
    "GOOGLE_GENAI_API_KEY": "Not set"
  }
}
```

## 🎨 Supported Programming Languages

| Language | Icon | Code |
|----------|------|------|
| Python | 🐍 | `Python` |
| JavaScript | 🟨 | `JavaScript` |
| TypeScript | 🔷 | `TypeScript` |
| Java | ☕ | `Java` |
| C++ | ⚡ | `C++` |
| C# | 💜 | `C#` |
| Go | 🔵 | `Go` |
| Rust | 🦀 | `Rust` |
| PHP | 🐘 | `PHP` |
| Ruby | 💎 | `Ruby` |
| Swift | 🍎 | `Swift` |
| Kotlin | 🟠 | `Kotlin` |
| Scala | 🔴 | `Scala` |
| R | 📊 | `R` |
| MATLAB | 🧮 | `MATLAB` |
| SQL | 🗄️ | `SQL` |
| HTML | 🌐 | `HTML` |
| CSS | 🎨 | `CSS` |
| Bash | 💻 | `Bash` |
| PowerShell | 🔧 | `PowerShell` |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `GOOGLE_API_KEY` | Alternative API key name | No |
| `GOOGLE_GENAI_API_KEY` | Alternative API key name | No |

### Frontend Configuration

The frontend is configured with Vite and includes:
- **Proxy Configuration**: Automatic routing of `/chat` requests to the backend
- **Hot Reload**: Instant updates during development
- **Build Optimization**: Optimized production builds

## 🛠️ Development

### Project Structure

#### Backend (`api/`)
- **FastAPI Application**: Modern, fast web framework
- **Gemini Integration**: Google's latest AI model
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed request and error logging
- **CORS**: Cross-origin resource sharing

#### Frontend (`frontend/`)
- **React 19**: Latest React with hooks
- **Vite**: Fast build tool and dev server
- **React Markdown**: Markdown rendering for code blocks
- **Responsive CSS**: Mobile-first design approach
- **Custom Components**: Reusable UI components

### Key Features Implementation

#### Streaming Response
```javascript
const streamResponse = (fullText) => {
  setStreamedText("");
  let i = 0;
  const interval = setInterval(() => {
    setStreamedText(fullText.slice(0, i));
    i++;
    if (i > fullText.length) {
      clearInterval(interval);
      setMessages((msgs) => [...msgs, { sender: "bot", text: fullText }]);
      setStreamedText("");
      setLoading(false);
    }
  }, 5);
};
```

#### Language Selection
```javascript
const languages = [
  { code: "Python", name: "Python", icon: "🐍" },
  { code: "JavaScript", name: "JavaScript", icon: "🟨" },
  // ... more languages
];
```

## 🚀 Deployment

### Production Build

#### Frontend
```bash
cd frontend
npm run build
```

#### Backend
```bash
cd api
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile for backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🐛 Troubleshooting

### Common Issues

#### 1. API Key Not Found
**Error**: `API key not found`
**Solution**: Ensure your `.env` file exists in the `api/` directory with the correct API key.

#### 2. CORS Errors
**Error**: Cross-origin request blocked
**Solution**: CORS is already configured in the backend. Check that both servers are running.

#### 3. Request Hanging
**Error**: Request times out or hangs
**Solution**: 
- Check your internet connection
- Verify the API key is valid
- Check the `/health` endpoint for backend status

#### 4. Frontend Not Loading
**Error**: Cannot access frontend
**Solution**: 
- Ensure `npm run dev` is running
- Check that port 5173 is available
- Verify all dependencies are installed

### Debug Endpoints

- **Health Check**: `GET http://localhost:8000/health`
- **API Test**: `GET http://localhost:8000/test`
- **Frontend**: `http://localhost:5173`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Abdullah Malik** - Full Stack Developer & Automation Engineer

- **Portfolio**: [abdullahmalik.dev](https://abdullahmalik.dev)
- **LinkedIn**: [abdullah-malik-dev](https://www.linkedin.com/in/abdullah-malik-dev/)
- **GitHub**: [abdullahmalik](https://github.com/abdullahmalik)

## 🙏 Acknowledgments

- **Google Gemini**: For providing the AI capabilities
- **FastAPI**: For the excellent web framework
- **React**: For the powerful frontend library
- **Vite**: For the fast build tool

---

**Made with ❤️ by Abdullah Malik**

*Your AI companion for intelligent conversations and problem-solving! 🚀*
