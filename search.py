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

if os.path.exists(DUMP_FILE):
    with open(DUMP_FILE, "rb") as f:
        vectorizer, sentences, metadata = pickle.load(f)
else:
    pdf_data = extract_text_from_pdfs()
    sentences = [entry[2] for entry in pdf_data]
    metadata = [(entry[0], entry[1]) for entry in pdf_data]

    vectorizer = TfidfVectorizer(tokenizer=tokenize_and_stem, stop_words="english")
    vectorizer.fit(sentences)

    with open(DUMP_FILE, "wb") as f:
        pickle.dump((vectorizer, sentences, metadata), f)

sentences_vector = vectorizer.transform(sentences)

def search(query):
    query_vector = vectorizer.transform([query])
    similarity = cosine_similarity(query_vector, sentences_vector)
    top_indices = (-similarity).argsort()[0][:10]
    results = [
        {"book": metadata[idx][0], "page": metadata[idx][1], "content": sentences[idx]}
        for idx in top_indices
    ]
    return json.dumps(results)

if __name__ == "__main__":
    query = sys.argv[1]
    print(search(query))
