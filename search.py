import string
import nltk
from nltk.tokenize import TreebankWordTokenizer
from nltk.stem.porter import PorterStemmer

PUNCTUATION_TABLE = str.maketrans({x : None for x in string.punctuation})

def tokenizeAndStem(s):
    tokenizedWords = TreebankWordTokenizer().tokenize(s.translate(PUNCTUATION_TABLE))
    tokenizedAndStemmedWords = [PorterStemmer().stem(token) for token in tokenizedWords]
    return tokenizedAndStemmedWords

sentences = [
    "The cat sat on the windowsill.",
    "She enjoys walking in the park.",
    "A scientist discovered a new planet.",
    "The boy ran across the street.",
    "An old man told a fascinating story.",
    "The astronaut floated in space.",
    "A mysterious stranger appeared at the door.",
    "The bird sang a beautiful song.",
    "The detective solved the case.",
    "A magician performed an incredible trick.",
    "The robot learned to dance.",
    "A traveler explored the ancient ruins.",
    "The professor gave an inspiring lecture.",
    "A dog barked loudly in the distance.",
    "The artist painted a stunning portrait.",
    "She baked a delicious cake.",
    "The car sped down the highway.",
    "A young girl found a lost puppy.",
    "The sun set behind the mountains.",
    "A fisherman caught a huge fish.",
    "The musician played a soothing melody.",
    "The baby laughed for the first time.",
    "An owl hooted in the night.",
    "The storm knocked out the power.",
    "A butterfly landed on the flower.",
    "The chef prepared a gourmet meal.",
    "A knight rode into battle.",
    "The library was completely silent.",
    "A cat chased a mouse through the house.",
    "The train arrived at the station.",
    "She wrote a letter to her friend.",
    "A scientist mixed strange chemicals.",
    "The pilot flew through heavy clouds.",
    "An eagle soared high in the sky.",
    "The runner crossed the finish line.",
    "A child built a sandcastle on the beach.",
    "The clock struck midnight.",
    "The dolphin jumped out of the water.",
    "A man climbed the tall mountain.",
    "The sunflowers swayed in the wind.",
    "A fox sneaked into the garden.",
    "The teacher explained a difficult concept.",
    "The puppy wagged its tail happily.",
    "A farmer harvested golden wheat.",
    "The actress won an award for her role.",
    "A squirrel stored nuts for winter.",
    "The knight rescued the princess.",
    "A spaceship landed on the moon.",
    "The fisherman sailed out to sea.",
    "The gardener planted colorful flowers.",
    "A student studied for the final exam.",
    "The storm clouds gathered in the sky.",
    "A bird built a nest in the tree.",
    "The panda chewed on bamboo.",
    "A child played with a toy train.",
    "The waves crashed against the rocks.",
    "A rabbit hopped through the field.",
    "The clock ticked loudly in the quiet room.",
    "The fire crackled in the fireplace.",
    "A deer drank from the clear stream.",
    "The astronaut waved from the spaceship.",
    "A pirate searched for hidden treasure.",
    "The old bridge creaked underfoot.",
    "A little boy blew bubbles in the air.",
    "The kitten chased a ball of yarn.",
    "A baker kneaded dough for bread.",
    "The wind howled through the trees.",
    "A butterfly fluttered in the garden.",
    "The detective searched for clues.",
    "A painter mixed vibrant colors on a palette.",
    "The mechanic fixed the broken engine.",
    "A writer typed a new chapter of their novel.",
    "The skier glided down the snowy slope.",
    "A scientist observed bacteria under a microscope.",
    "The baby took its first steps.",
    "A whale surfaced in the open ocean.",
    "The chef carefully decorated the cake.",
    "A soldier marched in perfect formation.",
    "The violinist played a haunting tune.",
    "A wolf howled at the full moon.",
    "The athlete trained for the big race.",
    "A street performer juggled flaming torches.",
    "The clock tower chimed at noon.",
    "A swimmer dived into the cool water.",
    "The dog fetched the stick.",
    "A little girl hugged her teddy bear.",
    "The lanterns floated into the night sky.",
    "A crow pecked at some breadcrumbs.",
    "The boy skipped rocks across the lake.",
    "A train rumbled through the tunnel.",
    "The elephant sprayed water from its trunk.",
    "A fisherman mended his fishing net.",
    "The parrot repeated the words it heard.",
    "A firefighter rushed to put out the fire.",
    "The puppy chewed on a slipper.",
    "A runner tied their shoelaces tightly.",
    "The teacher wrote on the chalkboard.",
    "A monkey swung from tree to tree.",
    "The artist sketched a beautiful landscape.",
    "A group of hikers reached the summit.",
    "The ice cream melted in the hot sun."
]


print(tokenizeAndStem(sentences[0]))

searchQuery = input("Enter a string : ")

print(tokenizeAndStem(searchQuery))



