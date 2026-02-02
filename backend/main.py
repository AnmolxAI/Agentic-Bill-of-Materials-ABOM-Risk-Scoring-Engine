from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import json
import math
from typing import Dict, Any
import io

app = FastAPI(title="ABOM Risk Scoring Engine")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def calculate_agency_score(agency_profile: Dict[str, Any]) -> int:
    """Calculate agency score based on tools."""
    tools = agency_profile.get("tools", [])
    
    if not tools or len(tools) == 0:
        return 1  # No tools
    
    has_state_changing = False
    
    # Handle both formats: array of strings or array of objects
    for tool in tools:
        if isinstance(tool, dict):
            # New format: {"name": "Email", "permission": "write"}
            permission = tool.get("permission", "").lower()
            if permission in ["write", "exec", "delete", "modify", "create", "update", "remove"]:
                has_state_changing = True
                break
        elif isinstance(tool, str):
            # Old format: ["search", "write_file", "exec_code"]
            state_changing_keywords = ["write", "exec", "delete", "modify", "create", "update", "remove"]
            if any(keyword in tool.lower() for keyword in state_changing_keywords):
                has_state_changing = True
                break
    
    # Also check scope field
    scope = agency_profile.get("scope", "").lower()
    if "state-changing" in scope or "state changing" in scope:
        has_state_changing = True
    
    if has_state_changing:
        return 4  # State-changing tools
    else:
        return 2  # Read-only tools


def calculate_autonomy_score(autonomy_leash: Any) -> int:
    """Calculate autonomy score based on leash type."""
    # Handle both formats: string or object with "mode" field
    if isinstance(autonomy_leash, dict):
        leash = autonomy_leash.get("mode", "").upper()
    elif isinstance(autonomy_leash, str):
        leash = autonomy_leash.upper()
    else:
        leash = ""
    
    if leash == "HITL":
        return 1
    elif leash == "HOTL":
        return 2
    elif leash == "HOOTL":
        return 3
    else:
        # Default to most restrictive if unknown
        return 1


def calculate_persistence_score(persistence_layer: Dict[str, Any]) -> int:
    """Calculate persistence score based on memory type and retention."""
    memory_type = persistence_layer.get("memory_type", "").lower()
    retention = persistence_layer.get("retention", "").lower()
    
    # Check for no persistence
    if not memory_type or memory_type in ["none", "ephemeral", "temporary"]:
        return 0
    
    # Check for session-only
    if retention in ["session", "session-only", "temporary", "short"]:
        return 1
    
    # Check for cross-session or long-term
    if retention in ["cross-session", "cross_session", "long-term", "long_term", "long", "permanent"]:
        return 2
    
    # Default based on memory_type
    if memory_type in ["long-term", "long_term", "long", "persistent", "vector-db", "vector_db"]:
        return 2
    elif memory_type in ["session", "temporary", "ephemeral"]:
        return 1
    else:
        return 0


def calculate_risk_score(agency: int, autonomy: int, persistence: int) -> float:
    """Calculate risk score: R = A × U × e^P"""
    return agency * autonomy * math.exp(persistence)


def determine_uart_tier(risk_score: float) -> int:
    """Determine UART tier based on risk score."""
    if risk_score < 10:
        return 0
    elif risk_score < 25:
        return 1
    elif risk_score < 50:
        return 2
    elif risk_score < 100:
        return 3
    else:
        return 4


@app.post("/api/calculate-risk")
async def calculate_risk(file: UploadFile = File(...)):
    """Calculate risk score from uploaded ABOM JSON file."""
    try:
        # Read file content
        contents = await file.read()
        
        # Parse JSON
        try:
            abom_data = json.loads(contents.decode('utf-8'))
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
        
        # Extract required fields
        agency_profile = abom_data.get("agency_profile", {})
        autonomy_leash = abom_data.get("autonomy_leash", "")
        persistence_layer = abom_data.get("persistence_layer", {})
        
        # Validate required fields
        if not agency_profile:
            raise HTTPException(status_code=400, detail="Missing 'agency_profile' field")
        if autonomy_leash is None or (isinstance(autonomy_leash, str) and not autonomy_leash):
            raise HTTPException(status_code=400, detail="Missing 'autonomy_leash' field")
        if not persistence_layer:
            raise HTTPException(status_code=400, detail="Missing 'persistence_layer' field")
        
        # Calculate scores
        agency = calculate_agency_score(agency_profile)
        autonomy = calculate_autonomy_score(autonomy_leash)
        persistence = calculate_persistence_score(persistence_layer)
        
        # Calculate risk score
        risk_score = calculate_risk_score(agency, autonomy, persistence)
        
        # Determine tier
        tier = determine_uart_tier(risk_score)
        
        # Prepare response
        result = {
            "agency": agency,
            "autonomy": autonomy,
            "persistence": persistence,
            "score": round(risk_score, 2),
            "tier": tier
        }
        
        return JSONResponse(content=result)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.post("/api/download-report")
async def download_report(file: UploadFile = File(...)):
    """Generate and download risk assessment report as JSON."""
    try:
        # Read file content
        contents = await file.read()
        
        # Parse JSON
        try:
            abom_data = json.loads(contents.decode('utf-8'))
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
        
        # Extract required fields
        agency_profile = abom_data.get("agency_profile", {})
        autonomy_leash = abom_data.get("autonomy_leash", "")
        persistence_layer = abom_data.get("persistence_layer", {})
        
        # Validate required fields
        if not agency_profile:
            raise HTTPException(status_code=400, detail="Missing 'agency_profile' field")
        if autonomy_leash is None or (isinstance(autonomy_leash, str) and not autonomy_leash):
            raise HTTPException(status_code=400, detail="Missing 'autonomy_leash' field")
        if not persistence_layer:
            raise HTTPException(status_code=400, detail="Missing 'persistence_layer' field")
        
        # Calculate scores
        agency = calculate_agency_score(agency_profile)
        autonomy = calculate_autonomy_score(autonomy_leash)
        persistence = calculate_persistence_score(persistence_layer)
        
        # Calculate risk score
        risk_score = calculate_risk_score(agency, autonomy, persistence)
        
        # Determine tier
        tier = determine_uart_tier(risk_score)
        
        # Create comprehensive report
        report = {
            "abom_input": abom_data,
            "risk_assessment": {
                "agency": agency,
                "autonomy": autonomy,
                "persistence": persistence,
                "score": round(risk_score, 2),
                "tier": tier,
                "tier_description": f"UART Tier {tier}"
            },
            "formula": "R = A × U × e^P",
            "tier_thresholds": {
                "Tier 0": "R < 10",
                "Tier 1": "10 ≤ R < 25",
                "Tier 2": "25 ≤ R < 50",
                "Tier 3": "50 ≤ R < 100",
                "Tier 4": "R ≥ 100"
            }
        }
        
        # Create JSON file in memory
        report_json = json.dumps(report, indent=2)
        report_bytes = report_json.encode('utf-8')
        
        # Return as downloadable file
        return JSONResponse(
            content=report,
            headers={
                "Content-Disposition": "attachment; filename=abom_risk_report.json"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "ABOM Risk Scoring Engine API", "status": "running"}

