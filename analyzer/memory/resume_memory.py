from analyzer.memory.chroma_client import get_collection


def search_similar_resumes(query_embedding, top_k=5):

    collection = get_collection()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results