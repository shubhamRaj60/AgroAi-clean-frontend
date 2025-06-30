import sys
import os
import numpy as np
import pickle

# ✅ Get the absolute directory of this file
base_dir = os.path.dirname(os.path.abspath(__file__))

# ✅ Use absolute path to the model file
model_path = os.path.join(base_dir, 'crop_model.pkl')

# ✅ Load the model
with open(model_path, 'rb') as f:
    model = pickle.load(f)

# ✅ Get values from command-line arguments
N = float(sys.argv[1])
P = float(sys.argv[2])
K = float(sys.argv[3])
temperature = float(sys.argv[4])
humidity = float(sys.argv[5])
ph = float(sys.argv[6])
rainfall = float(sys.argv[7])

# ✅ Prepare input
input_data = np.array([[N, P, K, temperature, humidity, ph, rainfall]])

# ✅ Predict crop
prediction = model.predict(input_data)
print(prediction[0])
