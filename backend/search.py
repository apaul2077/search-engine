import warnings
warnings.filterwarnings("ignore")  # Suppress warnings

import os
import pickle
import sys
import json
from pathlib import Path
from pypdf import PdfReader
from nltk.tokenize import TreebankWordTokenizer
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

PDF_FOLDER = "books"
DUMP_FILE = "vectorized_model.pkl"

tokenizer = TreebankWordTokenizer()
stemmer = PorterStemmer()

def tokenize_and_stem(text):
    words = tokenizer.tokenize(text)
    return [stemmer.stem(word) for word in words]

def extract_text_from_pdfs():
    pdf_data = []
    for file in Path(PDF_FOLDER).glob("*.pdf"):
        with open(file, "rb") as pdf_file:
            reader = PdfReader(pdf_file)
            for page_num in range(len(reader.pages)):
                text = reader.pages[page_num].extract_text()
                if text:
                    pdf_data.append((file.name, page_num + 1, text.lower()))
    return pdf_data

def build_model():
    pdf_data = extract_text_from_pdfs()
    if not pdf_data:
        return None, None, None
    sentences = [entry[2] for entry in pdf_data]
    metadata = [(entry[0], entry[1]) for entry in pdf_data]
    vectorizer = TfidfVectorizer(tokenizer=tokenize_and_stem, stop_words="english")
    vectorizer.fit(sentences)
    with open(DUMP_FILE, "wb") as f:
        pickle.dump((vectorizer, sentences, metadata), f)
    return vectorizer, sentences, metadata

if os.path.exists(DUMP_FILE):
    with open(DUMP_FILE, "rb") as f:
        vectorizer, sentences, metadata = pickle.load(f)
else:
    vectorizer, sentences, metadata = build_model()

if vectorizer and sentences:
    sentences_vector = vectorizer.transform(sentences)
else:
    sentences_vector = None

def search(query):
    if sentences_vector is None:
        return json.dumps({"error": "No documents available for search."})

    query_vector = vectorizer.transform([query])
    similarity = cosine_similarity(query_vector, sentences_vector)
    top_indices = (-similarity).argsort()[0][:50]

    query_words = re.findall(r'\w+', query.lower())
    stemmed_query_words = set(stemmer.stem(word) for word in query_words)

    results = []

    for idx in top_indices:
        sentence = sentences[idx]
        sentence_lower = sentence.lower()

        matches = []
        for match in re.finditer(r'\w+', sentence_lower):
            original_word = match.group()
            stemmed_word = stemmer.stem(original_word)

            if stemmed_word in stemmed_query_words:
                matches.append([match.start(), match.end()])

        results.append({
            "book": metadata[idx][0],
            "page": metadata[idx][1],
            "content": sentence,
            "matches": matches
        })

    return json.dumps(results)

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No command provided"}))
        else:
            command = sys.argv[1]
            if command.lower() == "__update__model__":
                vectorizer, sentences, metadata = build_model()
                if vectorizer is None:
                    print(json.dumps({"error": "No PDFs found to build the model."}))
                else:
                    sentences_vector = vectorizer.transform(sentences)
                    print(json.dumps({"msg": "Vector space model updated successfully."}))
            else:
                query = command
                output = search(query)
                print(output)
    except Exception as e:
        print(json.dumps({"error": "Exception occurred", "detail": str(e)}))


