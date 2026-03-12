# Deep Learning Fuel Consumption Prediction System

A comprehensive deep learning project implementing three advanced neural network architectures for predicting vehicle fuel consumption (MPG).

## 📋 Project Overview

This project demonstrates a complete deep learning pipeline following an academic curriculum:

- **Neural Networks**: Feedforward multi-layer perceptrons
- **Multilayer Perceptron (MLP)**: Feature-based regression model
- **LSTM Networks**: Sequential pattern modeling for temporal dependencies
- **Autoencoders**: Unsupervised feature learning and dimensionality reduction
- **Regularization**: Dropout, Batch Normalization, L2 Regularization
- **Optimization**: Adam optimizer, Early Stopping, Learning Rate Decay
- **Comprehensive Evaluation**: 8+ metrics with extensive visualization

## 📁 Project Structure

```
backend_deep_learning/
├── data/                          # Dataset directory
│   ├── auto_mpg.csv              # Cleaned dataset
│   └── scaler.pkl                # Fitted StandardScaler
│
├── notebooks/                     # Jupyter notebooks for exploration
│   ├── 01_EDA.ipynb              # Exploratory Data Analysis
│   ├── 02_MLP_Model.ipynb        # MLP model training & concepts
│   ├── 03_LSTM_Model.ipynb       # LSTM model & temporal dependencies
│   ├── 04_Autoencoder.ipynb      # Denoising autoencoder & latent space
│   └── 05_Model_Comparison.ipynb # Compare all 3 models
│
├── models/                        # Trained model files
│   ├── mlp_model.h5              # Trained MLP model
│   ├── lstm_model.h5             # Trained LSTM model
│   ├── autoencoder_model.h5      # Trained autoencoder
│   ├── encoder_model.h5          # Encoder for latent feature extraction
│   └── mlp_latent_model.h5       # MLP trained on latent features
│
├── training/                      # Training scripts
│   ├── train_mlp.py              # MLP training
│   ├── train_lstm.py             # LSTM training
│   └── train_autoencoder.py      # Autoencoder training
│
├── utils/                         # Utility modules
│   ├── data_loader.py            # [Data loading & preprocessing](utils/data_loader.py)
│   ├── metrics.py                # [Evaluation metrics](utils/metrics.py)
│   └── plotting.py               # [Visualization functions](utils/plotting.py)
│
├── images/                        # Generated visualizations
│   ├── eda/                       # EDA plots
│   ├── mlp/                       # MLP training results
│   ├── lstm/                      # LSTM training results
│   ├── autoencoder/               # Autoencoder visualizations
│   └── comparison/                # Model comparison plots
│
├── app.py                         # FastAPI application for predictions
├── requirements.txt               # Python dependencies
└── README.md                      # This file
```

## 🚀 Quick Start

### 1. Installation

```bash
# Clone/navigate to the project directory
cd backend_deep_learning

# Install dependencies
pip install -r requirements.txt
```

### 2. Train Models

```bash
# Train MLP model
python training/train_mlp.py

# Train LSTM model
python training/train_lstm.py

# Train Autoencoder
python training/train_autoencoder.py
```

### 3. Run Jupyter Notebooks

```bash
# Start Jupyter
jupyter notebook notebooks/

# Open notebooks in order:
# 01_EDA.ipynb → 02_MLP_Model.ipynb → 03_LSTM_Model.ipynb → 04_Autoencoder.ipynb → 05_Model_Comparison.ipynb
```

### 4. Launch API Application

```bash
python app.py

# API docs available at:
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

## 📊 Dataset: Auto MPG

**Source**: UCI Machine Learning Repository  
**URL**: https://archive.ics.uci.edu/ml/machine-learning-databases/auto-mpg/auto-mpg.data

### Features (8 input variables):

- **cylinders**: Number of cylinders (3-8)
- **displacement**: Engine displacement (cubic inches)
- **horsepower**: Horsepower of the engine
- **weight**: Vehicle weight (pounds)
- **acceleration**: Time to accelerate 0-60 mph (seconds)
- **model_year**: Model year (70-82, representing 1970-1982)
- **origin**: Origin (1=USA, 2=Europe, 3=Japan)

### Target Variable:

- **mpg**: Miles per gallon (fuel consumption) - continuous value (9-47)

### Data Preprocessing:

- Automatic download from UCI repository
- Missing value handling (horsepower)
- Feature scaling using StandardScaler
- 80/20 train-test split
- ~392 samples after cleaning

## 🧠 Model Architectures

### 1. Multilayer Perceptron (MLP)

**Architecture**:

```
Input (8 features)
  ↓
Dense(64) + ReLU
  ↓
BatchNormalization
  ↓
Dropout(0.3)
  ↓
Dense(32) + ReLU
  ↓
Dropout(0.2)
  ↓
Dense(16) + ReLU
  ↓
Dense(1, linear) - Output (MPG prediction)
```

**Key Concepts**:

- **Backpropagation**: Chain rule for gradient computation across layers
- **ReLU Activation**: Introduces non-linearity, f(x) = max(0, x)
- **Batch Normalization**: Stabilizes training, accelerates convergence
- **Dropout**: Stochastic regularization to prevent overfitting
- **L2 Regularization**: Weight decay for generalization

**Hyperparameters**:

- Optimizer: Adam (lr=0.001)
- Loss: Mean Squared Error (MSE)
- Epochs: 200 (with early stopping)
- Batch Size: 32
- Callbacks: EarlyStopping, ReduceLROnPlateau

### 2. Long Short-Term Memory (LSTM)

**Architecture**:

```
Input (383 sequences, 10 timesteps, 8 features)
  ↓
LSTM(64, return_sequences=True)
  ↓
Dropout(0.3)
  ↓
LSTM(32, return_sequences=False)
  ↓
Dense(16) + ReLU
  ↓
Dense(1, linear) - Output
```

**Key Concepts**:

- **LSTM Cells**: Memory mechanisms with forget/input/output gates
- **Cell State**: Internal memory preserved across timesteps
- **Sequence Processing**: Input shaped as (samples, timesteps, features)
- **Backpropagation Through Time (BPTT)**: Gradients flow backward in time
- **Return Sequences**: Controls whether full sequence or final state is output
- **Sliding Window**: 10-sample windows capture temporal dependencies

**LSTM Gate Equations**:

```
f_t = σ(W_f · [h_{t-1}, x_t] + b_f)        # Forget gate
i_t = σ(W_i · [h_{t-1}, x_t] + b_i)        # Input gate
C̃_t = tanh(W_c · [h_{t-1}, x_t] + b_c)    # Candidate values
C_t = f_t * C_{t-1} + i_t * C̃_t            # New cell state
o_t = σ(W_o · [h_{t-1}, x_t] + b_o)        # Output gate
h_t = o_t * tanh(C_t)                       # Hidden state
```

**Advantages**:

- Captures temporal dependencies across 10 timesteps
- Solves vanishing gradient problem of vanilla RNNs
- Memory mechanisms enable long-term pattern learning
- Better than MLP for sequential data

### 3. Denoising Autoencoder

**Architecture**:

**Encoder** (Compression):

```
Input (8 features)
  ↓
Dense(64) + ReLU
  ↓
Dense(32) + ReLU
  ↓
Dense(16) + ReLU → LATENT SPACE
```

**Decoder** (Reconstruction):

```
Latent (16 dimensions)
  ↓
Dense(32) + ReLU
  ↓
Dense(64) + ReLU
  ↓
Dense(8, linear) → Reconstructed Output
```

**Key Concepts**:

- **Unsupervised Learning**: No labels needed for training
- **Denoising**: Add Gaussian noise → model learns to remove it
- **Bottleneck**: Forces compression to 16 dimensions
- **Reconstruction Loss**: MSE between input and reconstructed output
- **Latent Features**: 16-dimensional compressed representation

**Training Phases**:

1. **Phase 1 - Autoencoder (Unsupervised)**:
   - Add Gaussian noise to inputs: x_noisy = x + N(0, 0.1)
   - Train to reconstruct clean inputs
   - Loss: mean((x_clean - x_reconstructed)²)

2. **Phase 2 - MLP on Latent Features (Supervised)**:
   - Extract latent features using encoder
   - Train MLP: latent_features → MPG prediction
   - Demonstrates latent space contains predictive information

**Advantages**:

- Dimensionality reduction (8 → 16 latent dimensions)
- Learned feature extraction without supervision
- Robustness through denoising
- Regularization via bottleneck compression
- Can leverage unlabeled data

## 📈 Evaluation Metrics

### 1. **RMSE** (Root Mean Squared Error)

```
RMSE = √(mean((y_true - y_pred)²))
```

- Interpretation: Average prediction error in MPG
- Sensitive to large errors
- Lower is better
- Units: same as target variable (MPG)

### 2. **MAE** (Mean Absolute Error)

```
MAE = mean(|y_true - y_pred|)
```

- Interpretation: Average absolute error
- More robust to outliers than RMSE
- Lower is better
- Units: same as target variable (MPG)

### 3. **MSE** (Mean Squared Error)

```
MSE = mean((y_true - y_pred)²)
```

- Interpretation: Average squared error
- Penalizes large errors heavily
- Lower is better
- Used as loss function

### 4. **R² Score** (Coefficient of Determination)

```
R² = 1 - (SS_res / SS_tot)
     where SS_res = Σ(y_true - y_pred)²
           SS_tot = Σ(y_true - mean(y_true))²
```

- Interpretation: Proportion of variance explained
- Range: (-∞, 1]
- R² = 1: Perfect prediction
- R² = 0: Predicts mean value (baseline)
- R² < 0: Worse than baseline
- Higher is better

### 5. **MAPE** (Mean Absolute Percentage Error)

```
MAPE = mean(|y_true - y_pred| / |y_true|) × 100%
```

- Interpretation: Average percentage error
- Scale-independent
- Good for interpretability
- Lower is better

### 6. **Explained Variance**

```
Explained Variance = 1 - (Var(y_true - y_pred) / Var(y_true))
```

- Similar to R² but calculated differently
- Measures variance captured by model
- Higher is better

### 7. **Median Absolute Error**

```
Median Absolute Error = median(|y_true - y_pred|)
```

- More robust to outliers than MAE
- Lower is better

### 8. **Adjusted R²**

```
Adjusted R² = 1 - (1 - R²) × (n - 1) / (n - p - 1)
              where n = number of samples
                    p = number of features
```

- R² adjusted for number of features
- Penalizes overfitting
- More reliable for model comparison
- Higher is better

## 💡 Key Deep Learning Concepts Demonstrated

### Backpropagation

Forward pass computes predictions:

```
h₁ = W₁·x + b₁
a₁ = ReLU(h₁)
h₂ = W₂·a₁ + b₂
y_pred = h₂
```

Backward pass computes gradients:

```
∂L/∂W₂ = ∂L/∂y_pred · ∂y_pred/∂W₂
∂L/∂W₁ = ∂L/∂y_pred · ∂y_pred/∂a₁ · ∂a₁/∂h₁ · ∂h₁/∂W₁
```

Weight updates:

```
W_new = W_old - lr·∂L/∂W
```

### Regularization Techniques

1. **Dropout**: Randomly deactivate neurons (p=0.3, 0.2)
2. **L2 Regularization**: Add λ·Σ(w²) to loss
3. **Early Stopping**: Stop when validation loss plateaus
4. **Learning Rate Decay**: Reduce LR when loss plateaus
5. **Batch Normalization**: Normalize layer inputs
6. **Bottleneck (Autoencoder)**: Forced compression

### Optimization

- **Adam Optimizer**: Adaptive learning rates for each parameter
- **Learning Rate**: 0.001 (can decay to 1e-6)
- **Batch Size**: 32 (balance between gradient noise and computation)
- **Momentum**: Built into Adam optimizer

## 🔧 Configuration & Hyperparameters

### Training Configuration

```python
# MLP
epochs = 200
batch_size = 32
learning_rate = 0.001
dropout_rates = [0.3, 0.2, 0.0]
l2_regularization = 0.001
early_stopping_patience = 15
reduce_lr_patience = 10

# LSTM
sequence_window_size = 10
lstm_units = [64, 32]
dense_units = [16]
early_stopping_patience = 15

# Autoencoder
noise_stddev = 0.1
encoder_units = [64, 32, 16]
decoder_units = [32, 64]
latent_dimension = 16
```

### Data Configuration

```python
train_test_split = 0.8 / 0.2
scaler = StandardScaler()
random_state = 42
```

## 📝 Usage Examples

### Python API Usage

```python
import numpy as np
from tensorflow.keras.models import load_model
import joblib

# Load model and scaler
model = load_model('models/mlp_model.h5')
scaler = joblib.load('data/scaler.pkl')

# Prepare input
features = np.array([[
    4,      # cylinders
    122,    # displacement
    88,     # horsepower
    2500,   # weight
    8.5,    # acceleration
    80,     # model_year
    1       # origin
]])

# Scale features
features_scaled = scaler.transform(features)

# Make prediction
prediction = model.predict(features_scaled)
mpg = prediction[0, 0]  # Extract scalar value

print(f"Predicted MPG: {mpg:.2f}")
```

### FastAPI Usage

```bash
# Health check
curl http://localhost:8000/health

# Single prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cylinders": 4,
    "displacement": 122,
    "horsepower": 88,
    "weight": 2500,
    "acceleration": 8.5,
    "model_year": 80,
    "origin": 1
  }'

# Batch prediction
curl -X POST http://localhost:8000/predict-batch \
  -H "Content-Type: application/json" \
  -d '[
    {
      "cylinders": 4,
      "displacement": 122,
      "horsepower": 88,
      "weight": 2500,
      "acceleration": 8.5,
      "model_year": 80,
      "origin": 1
    },
    {
      "cylinders": 8,
      "displacement": 350,
      "horsepower": 165,
      "weight": 4000,
      "acceleration": 10.5,
      "model_year": 70,
      "origin": 1
    }
  ]'
```

## 📊 Results & Performance

Each model training generates:

1. **Training Logs**: Loss/MAE curves showing convergence
2. **Metrics**: RMSE, MAE, R², MAPE, etc.
3. **Visualizations**:
   - Loss curves (training vs validation)
   - Predictions vs actual scatter plots
   - Residual plots
   - Error distributions
   - Heatmaps for metric comparison

## 🎯 Model Selection Guide

| Scenario             | Best Model  | Reason                                    |
| -------------------- | ----------- | ----------------------------------------- |
| **Speed Critical**   | MLP         | Fastest training, simplest architecture   |
| **Best Accuracy**    | ?           | Whichever has lowest RMSE (compare all 3) |
| **Sequential Data**  | LSTM        | Models temporal patterns                  |
| **Feature Learning** | Autoencoder | Unsupervised dimensionality reduction     |
| **Production**       | MLP or LSTM | Good balance of speed/accuracy            |
| **Ensemble**         | All 3       | Average predictions for robustness        |

## 🔬 Academic Concepts Covered

### Neural Networks

- Perceptron theory
- Multi-layer architecture
- Activation functions (ReLU, sigmoid, tanh, linear)
- Layer connections and weights

### Optimization

- Gradient descent variants
- Adam optimizer with adaptive learning rates
- Momentum and velocity
- Learning rate scheduling

### Regularization

- Overfitting and generalization
- Dropout and stochastic regularization
- L1/L2 weight decay
- Batch normalization
- Early stopping

### Recurrent Networks

- RNN fundamentals
- Vanishing/exploding gradient problem
- LSTM cells and gates
- Backpropagation Through Time (BPTT)
- Sequence processing

### Unsupervised Learning

- Autoencoders and reconstruction
- Denoising autoencoders
- Dimensionality reduction
- Latent space learning
- Feature extraction

### Evaluation & Metrics

- Regression metrics (MAE, RMSE, R²)
- Model selection and comparison
- Hyperparameter tuning
- Cross-validation concepts

## 🛠️ Development & Extension

### To Add New Models

1. Create training script in `training/`
2. Follow naming convention: `train_[model_name].py`
3. Implement metrics computation
4. Add visualizations to `utils/plotting.py`
5. Create notebook in `notebooks/`

### To Deploy

1. Train best model
2. Run `app.py`
3. Use FastAPI docs for testing
4. Containerize with Docker
5. Deploy to cloud (AWS, GCP, Azure)

### To Improve Performance

1. Hyperparameter tuning (grid search)
2. Data augmentation
3. Ensemble methods
4. Feature engineering
5. Transfer learning (if applicable)
6. Cross-validation for robust evaluation

## 📚 References & Resources

### Deep Learning Frameworks

- **TensorFlow**: https://www.tensorflow.org/
- **Keras API**: https://keras.io/

### Datasets

- **UCI ML Repository**: https://archive.ics.uci.edu/ml/
- **Auto MPG**: https://archive.ics.uci.edu/ml/machine-learning-databases/auto-mpg/

### Learning Resources

- Christopher Colah's LSTM Blog Post
- Goodfellow, Bengio, Courville - Deep Learning Book
- Stanford CS231n Course Notes
- Andrew Ng's Machine Learning Specialization

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Created as a comprehensive deep learning educational project demonstrating professional-grade ML engineering practices.

---

**Last Updated**: March 2026  
**Framework Version**: TensorFlow 2.13.0  
**Python Version**: 3.8+
