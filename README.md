# 🧬 DNA Steganography

A sophisticated full-stack application that encrypts secret messages and embeds them into DNA sequences within FASTA files. This project combines cryptography, biotechnology, and web technologies to create a unique steganographic system.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Pipeline Explanation](#pipeline-explanation)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [License](#license)

## 🎯 Overview

DNA Steganography is an advanced steganographic system that:
1. Takes a secret message as input
2. Encrypts it using Fernet encryption
3. Converts the encrypted data into a DNA sequence (A, C, G, T)
4. Embeds the DNA sequence into a FASTA file
5. Provides a decryption key for authorized recipients to recover the original message

This approach leverages the fact that DNA sequences are commonly stored and shared in FASTA files, making the hidden message inconspicuous.

## ✨ Features

- **Message Encryption**: Secure encryption using Fernet (symmetric encryption)
- **DNA Encoding**: Convert binary data into DNA nucleotide sequences
- **FASTA Integration**: Seamlessly embed encoded sequences into FASTA files
- **Message Decryption**: Recover original messages using encryption keys
- **Web Interface**: Modern, intuitive React-based UI
- **RESTful API**: FastAPI backend for encoding/decoding operations
- **File Upload/Download**: Handle FASTA file uploads and download encoded results

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Encryption**: cryptography (Fernet)
- **Server**: Uvicorn

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Dependencies
See `requirements.txt` and `frontend/package.json` for complete dependency lists.

## 🏗️ Project Architecture

```
dna-stego/
├── app/                          # Backend (FastAPI)
│   ├── main.py                  # FastAPI app initialization
│   ├── api/
│   │   └── routes.py            # API endpoints (/encrypt, /decrypt, /download)
│   ├── pipeline/
│   │   └── stego_pipeline.py    # Main encoding/decoding pipeline
│   ├── crypto/
│   │   └── encryption.py        # Fernet encryption/decryption
│   ├── dna/
│   │   └── dna_encoder.py       # Binary to DNA conversion
│   ├── decoder/
│   │   └── dna_decoder.py       # DNA to binary conversion
│   ├── fasta/
│   │   └── fasta_generator.py   # FASTA file generation/injection
│   ├── preprocessing/
│   │   ├── rearrange.py         # Text rearrangement
│   │   └── utf8_encoder.py      # UTF-8 encoding
│   └── auth/
│       └── auth.py              # Authentication utilities
├── frontend/                     # React application
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardHome.jsx
│   │   │   └── tools/
│   │   │       └── DnaStego.jsx # Main DNA steganography tool
│   │   ├── components/
│   │   │   ├── ui/              # UI components
│   │   │   └── layout/          # Layout components
│   │   ├── services/
│   │   │   └── api.js           # API client
│   │   └── context/
│   │       └── AuthContext.jsx  # Authentication context
│   └── vite.config.js           # Vite configuration
├── storage/
│   └── fasta_files/             # Uploaded FASTA files
└── tests/                       # Test files

```

## 🚀 Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dna-stego
   ```

2. **Create a Python virtual environment** (recommended)
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (if needed)
   Create a `.env.local` file with your API endpoint:
   ```
   VITE_API_URL=http://localhost:8000
   ```

## 📖 Usage

### Running the Application

1. **Start the backend server**
   ```bash
   python3 -m uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`
   API documentation: `http://localhost:8000/docs`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Using the Web Interface

1. **Navigate to the DNA Steganography tool**
2. **Choose Encrypt or Decrypt mode**
3. **For Encryption**:
   - Enter your secret message
   - Upload a FASTA file
   - Click "Encrypt"
   - Download the stego file and save the encryption key
4. **For Decryption**:
   - Paste the encryption key
   - Upload the stego FASTA file
   - Click "Decrypt"
   - View the recovered message

## 🔄 Pipeline Explanation

### Encoding Pipeline

```
Original Message
    ↓
Rearrange Text
    ↓
UTF-8 Encode
    ↓
Generate Encryption Key
    ↓
Encrypt with Fernet
    ↓
Binary Conversion (bytes → binary string)
    ↓
DNA Encoding (binary → ACGT sequence)
    ↓
FASTA Injection (embed in FASTA file)
    ↓
Stego File + Encryption Key
```

### Decoding Pipeline

```
Stego FASTA File + Encryption Key
    ↓
Extract DNA Sequence from FASTA
    ↓
Binary Conversion (DNA → binary string)
    ↓
Bytes Conversion (binary → bytes)
    ↓
Decrypt with Fernet
    ↓
Restore Text (reverse rearrangement)
    ↓
Original Message
```

### DNA Encoding Scheme

Binary to DNA mapping (2 bits → 1 nucleotide):
- `00` → G (Guanine)
- `01` → C (Cytosine)
- `10` → A (Adenine)
- `11` → T (Thymine)

## 🔌 API Endpoints

### POST `/api/encrypt`
Encrypts a message and embeds it into a FASTA file.

**Request:**
- `message` (form data): Secret message to encrypt
- `fasta_file` (file): Original FASTA file

**Response:**
```json
{
  "stego_file": "path/to/stego_file.fasta",
  "key": "encryption_key_string"
}
```

### POST `/api/decrypt`
Decrypts a message from a stego FASTA file.

**Request:**
- `key` (form data): Encryption key
- `stego_file` (file): FASTA file containing encrypted message

**Response:**
```json
{
  "message": "decrypted_message"
}
```

### GET `/api/download`
Downloads the generated stego FASTA file.

**Parameters:**
- `path` (query): Path to the file

**Response:** FASTA file download

## 📁 Project Structure Details

### Backend Modules

- **`api/routes.py`**: Defines FastAPI endpoints for encryption, decryption, and file downloads
- **`pipeline/stego_pipeline.py`**: Orchestrates the full encoding/decoding workflow
- **`crypto/encryption.py`**: Handles Fernet encryption and key generation
- **`dna/dna_encoder.py`**: Converts binary data to DNA sequences
- **`decoder/dna_decoder.py`**: Converts DNA sequences back to binary
- **`fasta/fasta_generator.py`**: Manages FASTA file operations and DNA injection
- **`preprocessing/`**: Text manipulation and UTF-8 encoding

### Frontend Components

- **`DnaStego.jsx`**: Main tool component with encrypt/decrypt tabs
- **`FileUpload.jsx`**: File upload UI component
- **`TextArea.jsx`**: Text input component
- **`ResultDisplay.jsx`**: Results display component
- **`api.js`**: API client for backend communication

## 🔐 Security Considerations

- Uses Fernet symmetric encryption (AES-128 in CBC mode)
- Encryption keys are cryptographically secure and randomly generated
- Messages are encrypted before DNA encoding
- FASTA injection makes the hidden data inconspicuous

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Joel John George

---

## 📝 Notes

- FASTA files are commonly used in bioinformatics for storing DNA/RNA sequences
- This project demonstrates the intersection of cryptography and biotechnology
- DNA steganography can be useful for covert data transmission in biological contexts
- The FASTA format makes this steganographic approach particularly elegant and practical

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

**Last Updated**: March 2026

For questions or issues, please open an issue in the repository.
