import string
import nltk
from nltk.tokenize import TreebankWordTokenizer
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

PUNCTUATION_TABLE = str.maketrans({x : None for x in string.punctuation})

def tokenizeAndStem(s):
    tokenizedWords = TreebankWordTokenizer().tokenize(s.translate(PUNCTUATION_TABLE))
    tokenizedAndStemmedWords = [PorterStemmer().stem(token) for token in tokenizedWords]
    return tokenizedAndStemmedWords

with open("enwiki-latest-all-titles-in-ns0", "r", encoding="utf-8") as file:
    sentences = file.read().splitlines()

sentences = [title.lower() for title in sentences]

vectorizer = TfidfVectorizer(tokenizer=tokenizeAndStem, stop_words="english")
vectorizer.fit(sentences)

sentencesVector = vectorizer.transform(sentences)

searchQuery = input("Enter a string : ")
searchQueryVector = vectorizer.transform([searchQuery])

similarity = cosine_similarity(searchQueryVector, sentencesVector)

ranks = (-similarity).argsort(axis=None)
mostRelevantDoc = sentences[ranks[0]]

print(mostRelevantDoc)



