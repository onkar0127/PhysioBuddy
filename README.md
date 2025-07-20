# PhysioBuddy

# 🛠️ Project Setup Guide

## 🔗 Prerequisites

- Python 3.10.11
- Node.js + npm installed
- Git installed

---

## ⚙️ Backend Setup (Django)

Navigate to the "backend" folder and create a virtual environment:

```bash
cd backend
py -3.10 -m venv .venv
.\.venv\Scripts\activate
```

To check python version:

```bash
py --version
```

The version shouuld be 3.10.(something) after activating env

Install backend dependencies (only after activating the virtual environment):

```bash
pip install -r requirements.txt
```

## Frontend Setup (React)
Navigate to the "frontend" folder:

```bash
cd ../frontend
```

Install frontend packages:

```bash
npm install
```

To run the React server:

```bash
npm run dev
```

To run the Django server, go to "backend" folder

```bash
py manage.py runserver
```