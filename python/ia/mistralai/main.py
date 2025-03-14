import pandas as pd
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model
from datasets import Dataset

# 🔥 Carregar modelo base Mistral 7B
MODEL_NAME = "mistralai/Mistral-7B-v0.1"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto"
)

# ⚙️ Configuração LoRA para economizar memória
lora_config = LoraConfig(
    r=16,  # Rank da adaptação
    lora_alpha=32,
    lora_dropout=0.05,
    task_type="CAUSAL_LM"
)
model = get_peft_model(model, lora_config)

# 🎬 Carregar os CSVs
movies_df = pd.read_csv("./ml-latest-small/movies.csv")
ratings_df = pd.read_csv("./ml-latest-small/ratings.csv")

# 🔄 Criar dataset de treinamento (Formato Pergunta-Resposta)
training_data = []

# Criar exemplos de perguntas e respostas para treinar o Mistral
for index, row in ratings_df.iterrows():
    user_id = row["userId"]
    movie_id = row["movieId"]
    rating = row["rating"]

    movie_info = movies_df[movies_df["movieId"] == movie_id]
    if movie_info.empty:
        continue

    title = movie_info.iloc[0]["title"]
    genres = movie_info.iloc[0]["genres"]

    question = f"Qual a nota que o usuário {user_id} deu para o filme {title}?"
    answer = f"O usuário {user_id} deu nota {rating} para o filme {title}."

    training_data.append({"question": question, "answer": answer})

# Criar dataset do Hugging Face
dataset = Dataset.from_pandas(pd.DataFrame(training_data))

# Tokenizar dados
def tokenize_function(examples):
    return tokenizer(
        examples["question"] + " " + examples["answer"],
        padding="max_length",
        truncation=True,
        max_length=512
    )

tokenized_dataset = dataset.map(tokenize_function, batched=True)

# 🔥 Configuração do treinamento
training_args = TrainingArguments(
    output_dir="./mistral_finetuned",
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    optim="adamw_torch",
    logging_dir="./logs",
    save_strategy="epoch",
    evaluation_strategy="epoch",
    num_train_epochs=2,
    save_total_limit=2
)

# Criar trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset
)

# 🚀 Treinar modelo
trainer.train()

# 📌 Salvar modelo treinado
model.save_pretrained("./mistral_trained")
tokenizer.save_pretrained("./mistral_trained")

print("✅ Modelo treinado e salvo!")

# 🔄 Função para responder perguntas complexas
def answer_question(question):
    inputs = tokenizer(question, return_tensors="pt").to("cuda")
    output = model.generate(**inputs, max_length=100)
    return tokenizer.decode(output[0], skip_special_tokens=True)

# 📌 Loop para perguntas livres
while True:
    user_question = input("\n📝 Faça sua pergunta (ou digite 'sair' para encerrar): ")
    if user_question.lower() == "sair":
        print("👋 Até mais!")
        break
    
    response = answer_question(user_question)
    print(f"\n🤖 Resposta: {response}")
