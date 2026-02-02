from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import json
import math
from typing import Dict, Any, Tuple, Optional
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

# Tier 4 threshold per EU AI Act (10^25 FLOPs)
SYSTEMIC_RISK_FLOPS_THRESHOLD = 1e25

# Capability flags that automatically trigger Tier 4
TIER_4_CAPABILITY_FLAGS = [
    "self-replication", "self_replication", "autonomous_replication",
    "cbrn", "cbrn_access", "bioweapon", "chemical_weapon", "nuclear",
    "autonomous_weapons", "critical_infrastructure_control"
]


def extract_flops(model_core: Dict[str, Any]) -> Optional[float]:
    """Extract training FLOPs from model_core section."""
    flops = model_core.get("training_flops") or model_core.get("flops")
    if flops is None:
        return None
    
    # Handle string or numeric format
    if isinstance(flops, str):
        try:
            return float(flops)
        except ValueError:
            return None
    return float(flops)


def check_tier4_capability_flags(agency_profile: Dict[str, Any]) -> bool:
    """Check if any capability flags automatically trigger Tier 4."""
    capability_flags = agency_profile.get("capability_flags", [])
    if isinstance(capability_flags, list):
        for flag in capability_flags:
            if isinstance(flag, str) and flag.lower() in TIER_4_CAPABILITY_FLAGS:
                return True
    
    # Also check tools for dangerous capabilities
    tools = agency_profile.get("tools", [])
    for tool in tools:
        tool_name = ""
        if isinstance(tool, dict):
            tool_name = tool.get("name", "").lower()
        elif isinstance(tool, str):
            tool_name = tool.lower()
        
        for flag in TIER_4_CAPABILITY_FLAGS:
            if flag.replace("_", "").replace("-", "") in tool_name.replace("_", "").replace("-", ""):
                return True
    
    return False


def calculate_agency_score(agency_profile: Dict[str, Any]) -> int:
    """
    Calculate agency score based on tools.
    Extended scale per paper:
    - 1: No tools
    - 2: Read-only tools  
    - 4: State-changing tools
    - 6: Critical/dangerous capabilities (CBRN, self-replication)
    """
    tools = agency_profile.get("tools", [])
    
    if not tools or len(tools) == 0:
        return 1  # No tools
    
    has_state_changing = False
    has_critical_capability = False
    
    # Handle both formats: array of strings or array of objects
    for tool in tools:
        tool_name = ""
        permission = ""
        
        if isinstance(tool, dict):
            tool_name = tool.get("name", "").lower()
            permission = tool.get("permission", "").lower()
            if permission in ["write", "exec", "delete", "modify", "create", "update", "remove"]:
                has_state_changing = True
        elif isinstance(tool, str):
            tool_name = tool.lower()
            state_changing_keywords = ["write", "exec", "delete", "modify", "create", "update", "remove"]
            if any(keyword in tool_name for keyword in state_changing_keywords):
                has_state_changing = True
        
        # Check for critical capabilities
        critical_keywords = ["replicat", "cbrn", "bioweapon", "nuclear", "weapon", "critical_infra"]
        if any(keyword in tool_name for keyword in critical_keywords):
            has_critical_capability = True
    
    # Also check scope field
    scope = agency_profile.get("scope", "").lower()
    if "state-changing" in scope or "state changing" in scope:
        has_state_changing = True
    if "critical" in scope or "dangerous" in scope:
        has_critical_capability = True
    
    if has_critical_capability:
        return 6  # Critical/dangerous capabilities
    elif has_state_changing:
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


def calculate_scaffolding_modifier(scaffolding: Dict[str, Any]) -> float:
    """
    Calculate scaffolding modifier based on safety controls.
    Returns a multiplier (0.7-1.0) that reduces risk when safety controls present.
    """
    modifier = 1.0
    
    # MCP usage with proper controls reduces risk
    mcp_used = scaffolding.get("mcp_used") or scaffolding.get("orchestrator", "").lower() == "mcp"
    if mcp_used:
        modifier *= 0.9  # 10% risk reduction for MCP
    
    # Sandboxing reduces risk
    sandboxed = scaffolding.get("sandboxed", False)
    sandbox_type = scaffolding.get("sandbox_type", "").lower()
    if sandboxed or sandbox_type in ["ephemeral", "isolated", "container", "vm"]:
        modifier *= 0.85  # 15% risk reduction for sandboxing
    
    # Circuit breakers reduce risk
    has_circuit_breaker = scaffolding.get("circuit_breaker", False) or scaffolding.get("kill_switch", False)
    if has_circuit_breaker:
        modifier *= 0.9  # 10% risk reduction for circuit breakers
    
    # Minimum modifier of 0.7 (max 30% reduction)
    return max(modifier, 0.7)


def calculate_risk_score(agency: int, autonomy: int, persistence: int, scaffolding_modifier: float = 1.0) -> float:
    """Calculate risk score: R = A × U × e^P × scaffolding_modifier"""
    base_score = agency * autonomy * math.exp(persistence)
    return base_score * scaffolding_modifier


def determine_uart_tier(risk_score: float) -> int:
    """
    Determine UART tier based on risk score.
    Thresholds per paper: Tier 0 (R=0), Tier 1 (0<R<5), Tier 2 (5≤R<20), Tier 3 (20≤R<50), Tier 4 (R≥50)
    """
    if risk_score == 0:
        return 0
    elif risk_score < 5:
        return 1
    elif risk_score < 20:
        return 2
    elif risk_score < 50:
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
        model_core = abom_data.get("model_core", {})
        agency_profile = abom_data.get("agency_profile", {})
        autonomy_leash = abom_data.get("autonomy_leash", "")
        persistence_layer = abom_data.get("persistence_layer", {})
        scaffolding = abom_data.get("scaffolding_inventory", {})
        
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
        scaffolding_mod = calculate_scaffolding_modifier(scaffolding)
        
        # Calculate risk score with scaffolding modifier
        risk_score = calculate_risk_score(agency, autonomy, persistence, scaffolding_mod)
        
        # Determine tier (before overrides)
        tier = determine_uart_tier(risk_score)
        
        # Check for Tier 4 overrides
        tier_4_reasons = []
        
        # Check FLOPs threshold (EU AI Act systemic risk: ≥10^25)
        flops = extract_flops(model_core)
        if flops is not None and flops >= SYSTEMIC_RISK_FLOPS_THRESHOLD:
            tier = 4
            tier_4_reasons.append(f"Training FLOPs ({flops:.2e}) exceeds systemic risk threshold (1e25)")
        
        # Check capability flags
        if check_tier4_capability_flags(agency_profile):
            tier = 4
            tier_4_reasons.append("Contains Tier 4 capability flags (e.g., self-replication, CBRN)")
        
        # Prepare response
        result = {
            "agency": agency,
            "autonomy": autonomy,
            "persistence": persistence,
            "scaffolding_modifier": round(scaffolding_mod, 3),
            "score": round(risk_score, 2),
            "tier": tier,
            "tier_4_overrides": tier_4_reasons if tier_4_reasons else None
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
        model_core = abom_data.get("model_core", {})
        agency_profile = abom_data.get("agency_profile", {})
        autonomy_leash = abom_data.get("autonomy_leash", "")
        persistence_layer = abom_data.get("persistence_layer", {})
        scaffolding = abom_data.get("scaffolding_inventory", {})
        
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
        scaffolding_mod = calculate_scaffolding_modifier(scaffolding)
        
        # Calculate risk score with scaffolding modifier
        risk_score = calculate_risk_score(agency, autonomy, persistence, scaffolding_mod)
        
        # Determine tier (before overrides)
        tier = determine_uart_tier(risk_score)
        
        # Check for Tier 4 overrides
        tier_4_reasons = []
        
        # Check FLOPs threshold
        flops = extract_flops(model_core)
        if flops is not None and flops >= SYSTEMIC_RISK_FLOPS_THRESHOLD:
            tier = 4
            tier_4_reasons.append(f"Training FLOPs ({flops:.2e}) exceeds systemic risk threshold (1e25)")
        
        # Check capability flags
        if check_tier4_capability_flags(agency_profile):
            tier = 4
            tier_4_reasons.append("Contains Tier 4 capability flags (e.g., self-replication, CBRN)")
        
        # Create comprehensive report
        report = {
            "abom_input": abom_data,
            "risk_assessment": {
                "agency": agency,
                "autonomy": autonomy,
                "persistence": persistence,
                "scaffolding_modifier": round(scaffolding_mod, 3),
                "score": round(risk_score, 2),
                "tier": tier,
                "tier_description": f"UART Tier {tier}",
                "tier_4_overrides": tier_4_reasons if tier_4_reasons else None
            },
            "formula": "R = A × U × e^P × scaffolding_modifier",
            "tier_thresholds": {
                "Tier 0": "R < 10",
                "Tier 1": "10 ≤ R < 25",
                "Tier 2": "25 ≤ R < 50",
                "Tier 3": "50 ≤ R < 100",
                "Tier 4": "R ≥ 100 OR FLOPs ≥ 1e25 OR critical capability flags"
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

