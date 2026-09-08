import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Hugging Face automatically exposes HF_TOKEN inside Space environments.
# For local dev, you can define it in your .env file.
HF_TOKEN = os.getenv("HF_TOKEN")
API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"


def get_embedding(text: str):
    """
    Retrieves a 384-dimensional embedding vector.
    Fast non-blocking lookup: tries Hugging Face API with 1.5s timeout.
    Falls back to zero vector if unauthenticated or offline to prevent blocking web requests.
    """
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"

    try:
        response = requests.post(API_URL, headers=headers, json={"inputs": text}, timeout=1.5)
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                if isinstance(result[0], list):
                    return result[0]
                return result
    except Exception:
        pass

    # Fast non-blocking fallback: Return 384-dimensional zero vector
    return [0.0] * 384