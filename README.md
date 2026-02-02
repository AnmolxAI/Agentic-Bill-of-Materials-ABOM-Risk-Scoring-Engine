# ABOM Risk Scoring Engine

The Agentic Bill of Materials (ABOM) Risk Scoring Engine is a prototype tool for evaluating the inherent risk of agentic AI systems based on their declared architecture, autonomy, and memory characteristics. It implements a standardized scoring function and classifies systems into governance tiers under the Unified Agentic Risk Tiering (UART) framework.

A lightweight, browser-accessible proof-of-concept web application for calculating risk scores from Agentic Bill of Materials (ABOM) JSON files. The tool automatically parses ABOM fields, calculates a composite risk score using a mathematical formula, and classifies systems into UART governance tiers (0-4).

## Problem Statement

AI systems are transitioning from simple generators to autonomous agents that can use tools, retain memory, and act independently. Traditional safety approaches that focus only on outputs such as bias or hallucination do not account for the structural risks posed by these systems. The critical concern is no longer just what a model says, but what it can do, how it does it, and how long it remembers.

## Role in Governance

The ABOM Risk Scoring Engine helps address this gap by assessing the internal architecture of agentic AI systems. It uses a standardized Agentic Bill of Materials (ABOM) to extract key attributes such as agency, autonomy, and persistence. These inputs are used to calculate a risk score and assign a governance tier. This enables both regulators and AI developers to evaluate and manage agent risk before deployment, in alignment with frameworks like the EU AI Act.

## Features

- Parse and validate ABOM.json manifests
- Compute Risk Score using the formula: R = A × U × exp(P)
- Map scores to UART Tier levels (0–4)
- Return structured output with explanation of each factor
- Designed as a proof-of-concept aligned with the EU AI Act
- Drag-and-drop or file picker to upload `ABOM.json`
- Real-time risk score computation and UART tier display
- Robust JSON validation with user-friendly error messages
- Clean, academic-style layout (light background, black text)
- Responsive design for small screens
- Download comprehensive risk assessment report (JSON)

## Architecture

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Python + FastAPI
- **Input Format:** JSON ABOM schema
- **Deployment:** Works locally, no external database or model inference required

## Risk Scoring Formula

The risk score is calculated using:

```
R = A × U × e^P
```

Where:
- **A (Agency):** 1 = No tools, 2 = Read-only tools, 4 = State-changing tools
- **U (Autonomy):** 1 = HITL, 2 = HOTL, 3 = HOOTL
- **P (Persistence):** 0 = None/ephemeral, 1 = Session-only, 2 = Cross-session/long-term

## UART Tier Classification

- **Tier 0:** R < 10 (Minimal Risk)
- **Tier 1:** 10 ≤ R < 25 (Low Risk)
- **Tier 2:** 25 ≤ R < 50 (Moderate Risk)
- **Tier 3:** 50 ≤ R < 100 (High Risk)
- **Tier 4:** R ≥ 100 (Critical Risk)

## Installation

### Prerequisites

- Python 3.8+
- Node.js 16+ and npm

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. Start both the backend and frontend servers (see Installation above)
2. Open `http://localhost:3000` in your browser
3. Upload an `ABOM.json` file using drag-and-drop or the file picker
4. View the calculated risk score, UART tier, and field breakdown
5. Download a comprehensive JSON report if needed

## Input Format

The engine accepts a JSON file structured as follows:

```json
{
  "model_core": {
    "architecture": "Transformer",
    "flops": 1.5e23
  },
  "agency_profile": {
    "tools": [
      {"name": "Email", "permission": "write"},
      {"name": "Filesystem", "permission": "read"}
    ]
  },
  "autonomy_leash": {
    "mode": "HOOTL"
  },
  "persistence_layer": {
    "memory_type": "vector-db",
    "retention": "long"
  },
  "scaffolding_inventory": {
    "mcp_used": true,
    "sandbox_type": "ephemeral"
  }
}
```

## Example ABOM.json

See `example_ABOM.json` in the root directory for a sample input file. The engine also supports simplified formats:

```json
{
  "model_core": {
    "architecture": "Transformer",
    "parameters": "7.2e10",
    "training_flops": "1.1e25"
  },
  "agency_profile": {
    "tools": ["search", "write_file", "exec_code"],
    "scope": "state-changing"
  },
  "autonomy_leash": "HOOTL",
  "persistence_layer": {
    "memory_type": "long-term",
    "retention": "cross-session"
  },
  "scaffolding_inventory": {
    "orchestrator": "MCP",
    "sandboxed": true
  }
}
```

## API Endpoints

### POST `/api/calculate-risk`
Upload an ABOM JSON file and receive risk assessment results.

**Request:** Multipart form data with `file` field containing the JSON file

**Response:**
```json
{
  "agency": 4,
  "autonomy": 3,
  "persistence": 2,
  "score": 88.6,
  "tier": 3
}
```

### POST `/api/download-report`
Generate and download a comprehensive risk assessment report.

**Request:** Multipart form data with `file` field containing the JSON file

**Response:** JSON file download with complete assessment details

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   └── ResultsDisplay.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── tests/                   # Test cases and test runner
│   ├── test_case_*.json     # 5 test cases covering all risk tiers
│   ├── test_runner.py       # Automated test runner
│   ├── requirements.txt     # Test dependencies
│   └── README.md            # Test documentation
├── example_ABOM.json        # Sample input file
└── README.md
```

## Testing

The project includes 5 comprehensive test cases that validate the risk scoring engine across different scenarios:

1. **Test Case 1:** Minimal Risk (Tier 0) - No tools, HITL, no persistence
2. **Test Case 2:** Low Risk (Tier 1) - Read-only tools, HOTL, session persistence
3. **Test Case 3:** Moderate Risk (Tier 2) - State-changing tools, HOOTL, session persistence
4. **Test Case 4:** High Risk (Tier 3) - State-changing tools, HOOTL, long-term persistence (old format)
5. **Test Case 5:** Critical Risk (Tier 3) - Multiple state-changing tools, HOOTL, permanent persistence (new format)

### Running Tests

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

2. In a new terminal, run the test suite:
```bash
cd tests
pip install -r requirements.txt
python test_runner.py
```

The test runner will validate all 5 test cases and report pass/fail status. See `tests/README.md` for detailed test documentation.

## Development

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

**Backend:**
The backend can be run with any ASGI server. For production, consider using:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## License

MIT License - see LICENSE file for details

