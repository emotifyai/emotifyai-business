import os
import requests

def get_anthropic_models(api_key: str):
    """
    Fetches all available models for the provided Anthropic API key
    and prints their Model ID and Name.
    """
    url = "https://api.anthropic.com/v1/models"
    
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",  # Required version header
        "content-type": "application/json"
    }
    
    # Store all retrieved models
    all_models = []
    params = {"limit": 20}  # Default page limit is 20
    
    print("Fetching models from Anthropic API...\n")
    
    while True:
        try:
            response = requests.get(url, headers=headers, params=params)
            
            # Catch HTTP errors (e.g., 401 Unauthorized, 403 Forbidden)
            response.raise_for_status()
            
            data = response.json()
            all_models.extend(data.get("data", []))
            
            # Check if there are more pages of models to fetch
            if data.get("has_more") and data.get("last_id"):
                params["after_id"] = data["last_id"]
            else:
                break
                
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")
            if response.status_code == 401:
                print("Error: Invalid API key or unauthorized access.")
            return None
        except Exception as err:
            print(f"An error occurred: {err}")
            return None

    # Print out the results cleanly
    if all_models:
        print(f"{'MODEL ID':<35} | {'MODEL NAME'}")
        print("-" * 70)
        for model in all_models:
            model_id = model.get("id", "N/A")
            model_name = model.get("display_name", "N/A")
            print(f"{model_id:<35} | {model_name}")
    else:
        print("No models found or unable to retrieve data.")

if __name__ == "__main__":
    # Replace with your actual key or set the ANTHROPIC_API_KEY environment variable
    # e.g., os.environ.get("ANTHROPIC_API_KEY", "your-key-here")
    API_KEY = os.environ.get("ANTHROPIC_API_KEY", "your_anthropic_api_key_here")
    
    if API_KEY == "your_anthropic_api_key_here":
        print("Please replace 'your_anthropic_api_key_here' with your real Anthropic API key.")
    else:
        get_anthropic_models(API_KEY)