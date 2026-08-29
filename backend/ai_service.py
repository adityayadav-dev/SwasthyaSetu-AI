import os
import json
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Using JSON output format if supported, else standard prompt instruction
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

def generate_emergency_alerts(context_data: str) -> list:
    """
    Analyzes the network state (inventory, beds, staff) and generates a list of alerts.
    Returns a list of dicts: [{'type': 'CRITICAL'|'HIGH'|'MEDIUM', 'msg': '...', 'time': 'Just now'}]
    """
    if not model:
        # Fallback Mock Mode
        return [
            { "type": "CRITICAL", "msg": "Mock AI: Paracetamol stockout predicted at PHC Ramnagar within 3 days.", "time": "Just now" },
            { "type": "HIGH", "msg": "Mock AI: Staff attendance critically low (65%) at PHC Bhor.", "time": "Just now" },
            { "type": "MEDIUM", "msg": "Mock AI: Bed occupancy nearing capacity (88%) at District Hospital Pune.", "time": "Just now" }
        ]

    prompt = f"""
    Act as a public health monitoring AI. Analyze the following live data from our PHC network and identify the 3-4 most critical issues.
    Return ONLY a valid JSON array of objects. Do not include markdown formatting or backticks.
    Each object must have the following keys:
    - "type": either "CRITICAL", "HIGH", or "MEDIUM"
    - "msg": a concise, 1-sentence description of the problem
    - "time": the string "Just now"
    
    Live Network Data:
    {context_data}
    """
    try:
        response = model.generate_content(prompt)
        # Parse the JSON string
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        alerts = json.loads(text.strip())
        return alerts
    except Exception as e:
        print(f"AI Generation failed: {e}")
        return [
            { "type": "CRITICAL", "msg": "AI System Error: Unable to generate live alerts.", "time": "Just now" }
        ]
