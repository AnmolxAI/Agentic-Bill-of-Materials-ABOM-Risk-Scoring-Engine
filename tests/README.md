# Test Cases for ABOM Risk Scoring Engine

This directory contains 5 comprehensive test cases that validate the risk scoring engine across different risk scenarios and UART tiers.

**Note on Calibration:** The tier thresholds, formula weights, and scalar values used in these test cases are for illustration purposes. A calibration process with domain experts would refine these based on empirical risk data and regulatory alignment across jurisdictions. The UART scheme is designed to be harmonized across different regulatory frameworks to ensure consistent tier outcomes.

## Test Cases Overview

### Test Case 1: Minimal Risk (Tier 0)
**File:** `test_case_1_minimal_risk.json`

**Scenario:** System with no tools, human-in-the-loop, and no persistence.

**Expected Results:**
- Agency: 1 (No tools)
- Autonomy: 1 (HITL)
- Persistence: 0 (None/ephemeral)
- Risk Score: ~1.0 (R = 1 × 1 × e^0 = 1)
- **UART Tier: 0** (Minimal Risk)

**Purpose:** Validates the lowest risk scenario and ensures the scoring system correctly identifies minimal risk systems.

---

### Test Case 2: Low Risk (Tier 1)
**File:** `test_case_2_low_risk.json`

**Scenario:** System with read-only tools, human-on-the-loop, and session-only memory.

**Expected Results:**
- Agency: 2 (Read-only tools)
- Autonomy: 2 (HOTL)
- Persistence: 1 (Session-only)
- Risk Score: ~10.87 (R = 2 × 2 × e^1 = 4 × 2.718 ≈ 10.87)
- **UART Tier: 1** (Low Risk)

**Purpose:** Tests read-only tool detection and session-level persistence scoring.

---

### Test Case 3: Moderate Risk (Tier 2)
**File:** `test_case_3_moderate_risk.json`

**Scenario:** System with state-changing tools, human-out-of-the-loop, and session-only persistence.

**Expected Results:**
- Agency: 4 (State-changing tools)
- Autonomy: 3 (HOOTL)
- Persistence: 1 (Session-only)
- Risk Score: ~32.6 (R = 4 × 3 × e^1 = 12 × 2.718 ≈ 32.6)
- **UART Tier: 2** (Moderate Risk)

**Purpose:** Validates state-changing tool detection and demonstrates how high agency/autonomy with limited persistence results in moderate risk.

---

### Test Case 4: High Risk (Tier 3)
**File:** `test_case_4_high_risk.json`

**Scenario:** System with state-changing tools, human-out-of-the-loop, and long-term persistence (using old JSON format).

**Expected Results:**
- Agency: 4 (State-changing tools)
- Autonomy: 3 (HOOTL)
- Persistence: 2 (Cross-session/long-term)
- Risk Score: ~88.6 (R = 4 × 3 × e^2 = 12 × 7.389 ≈ 88.6)
- **UART Tier: 3** (High Risk)

**Purpose:** Tests the old JSON format (string autonomy_leash, array tools) and validates high-risk scenario with maximum persistence.

---

### Test Case 5: Critical Risk (Tier 3 - Maximum)
**File:** `test_case_5_critical_risk.json`

**Scenario:** System with multiple state-changing tools, human-out-of-the-loop, and permanent persistence (using new JSON format).

**Expected Results:**
- Agency: 4 (State-changing tools)
- Autonomy: 3 (HOOTL)
- Persistence: 2 (Permanent/long-term)
- Risk Score: ~88.6 (R = 4 × 3 × e^2 = 12 × 7.389 ≈ 88.6)
- **UART Tier: 3** (High Risk)

**Purpose:** Tests the new JSON format (object autonomy_leash, object array tools) and represents the highest achievable risk score with current formula. Note: With current scoring system (max A=4, U=3, P=2), Tier 4 (R ≥ 100) is not achievable.

---

## Running the Tests

### Prerequisites
1. Backend server must be running on `http://localhost:8000`
2. Python 3.8+ with `requests` library installed

### Install Test Dependencies
```bash
pip install requests
```

### Run All Tests
```bash
cd tests
python test_runner.py
```

### Run Individual Test via API
You can also test individual cases using curl:

```bash
# Test Case 1
curl -X POST http://localhost:8000/api/calculate-risk \
  -F "file=@test_case_1_minimal_risk.json"

# Test Case 2
curl -X POST http://localhost:8000/api/calculate-risk \
  -F "file=@test_case_2_low_risk.json"

# Test Case 3
curl -X POST http://localhost:8000/api/calculate-risk \
  -F "file=@test_case_3_moderate_risk.json"

# Test Case 4
curl -X POST http://localhost:8000/api/calculate-risk \
  -F "file=@test_case_4_high_risk.json"

# Test Case 5
curl -X POST http://localhost:8000/api/calculate-risk \
  -F "file=@test_case_5_critical_risk.json"
```

## Test Coverage

These test cases cover:

1. **All UART Tiers:** 0, 1, 2, 3 (Tier 4 not achievable with current formula)
2. **All Agency Levels:** 1 (no tools), 2 (read-only), 4 (state-changing)
3. **All Autonomy Levels:** 1 (HITL), 2 (HOTL), 3 (HOOTL)
4. **All Persistence Levels:** 0 (none), 1 (session), 2 (long-term)
5. **Both JSON Formats:** Old format (strings/arrays) and new format (objects)
6. **Edge Cases:** Empty tools array, different retention values

## Expected Test Results Summary

| Test Case | Agency | Autonomy | Persistence | Score | Tier |
|-----------|--------|----------|-------------|-------|------|
| 1 (Minimal) | 1 | 1 | 0 | ~1.0 | 0 |
| 2 (Low) | 2 | 2 | 1 | ~10.87 | 1 |
| 3 (Moderate) | 4 | 3 | 1 | ~32.6 | 2 |
| 4 (High) | 4 | 3 | 2 | ~88.6 | 3 |
| 5 (Critical) | 4 | 3 | 2 | ~88.6 | 3 |

## Notes

- Test Case 4 uses the old JSON format to ensure backward compatibility
- Test Case 5 uses the new JSON format to validate new schema support
- The maximum achievable score with current formula is ~88.6 (Tier 3)
- All test cases include complete ABOM structure with model_core and scaffolding_inventory for realism

