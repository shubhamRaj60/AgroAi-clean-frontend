import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle

# 1. Dataset Load karo
data = pd.read_csv('model/Crop_recommendation.csv')

# 2. X = Input Features, y = Output Crop Name
X = data.drop('label', axis=1)
y = data['label']

# 3. Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train ML Model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# 5. Accuracy Check (optional)
accuracy = model.score(X_test, y_test)
print(f"Model Accuracy: {accuracy:.2f}")

# 6. Save Model to .pkl
with open('model/crop_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✅ Model trained and saved as crop_model.pkl")
