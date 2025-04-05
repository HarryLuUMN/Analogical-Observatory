
#%%
import sys
print(sys.executable)


#%%
from transformers import AutoTokenizer, AutoModel
import torch
import json

model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

def get_embedding(word):
    inputs = tokenizer(word, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().tolist()

with open('./inputs/sample.txt') as f:
    words = [line.strip() for line in f]

embeddings = {}
for word in words:
    try:
        embeddings[word] = get_embedding(word)
    except:
        print(f"Failed: {word}")

with open("./outputs/word_vectors.json", "w") as f:
    json.dump(embeddings, f, indent=2)

print("Saved word_vectors.json")

# %%
