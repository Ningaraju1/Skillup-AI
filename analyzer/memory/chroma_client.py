import chromadb

_client = None


def get_client():
    global _client

    if _client is None:
        _client = chromadb.PersistentClient(path="chroma_db")

    return _client


def get_collection():
    client = get_client()

    return client.get_or_create_collection(
        name="resume_vectors"
    )