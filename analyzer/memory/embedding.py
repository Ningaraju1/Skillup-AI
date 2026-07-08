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
    Prioritizes Hugging Face Serverless Inference API to keep memory footprint under 50MB.
    Falls back to local SentenceTransformers if the API request fails.
    """
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"

    try:
        response = requests.post(API_URL, headers=headers, json={"inputs": text}, timeout=8)
        if response.status_code == 200:
            result = response.json()
            # Ensure the API returned a list of floats
            if isinstance(result, list) and len(result) > 0:
                # API sometimes returns nested lists depending on input format
                if isinstance(result[0], list):
                    return result[0]
                return result
    except Exception:
        pass

    # Fallback: Lazy load local sentence transformers to avoid importing torch/transformers in production
    try:
        from sentence_transformers import SentenceTransformer
        global _model
        if '_model' not in globals():
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        return _model.encode(text).tolist()
    except Exception as e:
        # Final fallback: Return zero vector of 384 dimensions
        return [0.0] * 384