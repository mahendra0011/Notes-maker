import openai

# Initialize the OpenAI client
openai.api_key = "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"

def chat_with_ai(prompt):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"An error occurred: {str(e)}"

def main():
    print("Welcome to the OpenAI Chat! (Type 'quit' to exit)")
    
    while True:
        user_input = input("\nYou: ")
        
        if user_input.lower() == 'quit':
            print("Goodbye!")
            break
            
        response = chat_with_ai(user_input)
        print(f"\nAI: {response}")

if __name__ == "__main__":
    main()