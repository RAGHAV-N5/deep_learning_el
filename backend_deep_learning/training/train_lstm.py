"""
Long Short-Term Memory (LSTM) Model Training Script

This script implements a recurrent neural network using LSTM cells.

Key Concepts:

LSTM Architecture:
- Specialized RNN cells with memory mechanisms
- Each LSTM cell has: input gate, forget gate, output gate, cell state
- Can capture long-term dependencies in sequential data
- More effective than vanilla RNNs for longer sequences

Flow:
LSTM(64, return_sequences=True) -> Dropout -> LSTM(32) -> Dense(16) -> Output

return_sequences=True: returns full sequence, allowing stacking multiple LSTMs
return_sequences=False: returns only final output

Sequence Creation:
- Sliding window of size 10
- Each sequence: 10 consecutive samples with 8 features each
- Shapes: (samples, 10, 8) for 3D tensor input
- Model predicts MPG for the last sample in the window

Training Process:
- Backpropagation Through Time (BPTT): unrolls network through time
- Gradients computed across all timesteps
- Vanishing/exploding gradient problem solved by LSTM gates
"""

import os
import sys
import time
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, regularizers
import matplotlib.pyplot as plt

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.data_loader import AutoMPGDataLoader
from utils.metrics import compute_regression_metrics, print_metrics
from utils.plotting import (
    plot_training_history,
    plot_predictions_vs_actual,
    plot_residuals,
    plot_error_distribution
)


def build_lstm_model(input_shape, learning_rate=0.001):
    """
    Build LSTM regression model for sequence prediction.
    
    The model uses:
    - Stacked LSTM layers: 64 units -> 32 units
    - LSTM cells maintain state across timesteps, enabling learning of temporal patterns
    - First LSTM returns sequences (return_sequences=True) to feed to second LSTM
    - Second LSTM returns single vector for dense connection
    - Dropout after first LSTM to prevent overfitting
    
    Args:
        input_shape (tuple): Shape of input sequences (window_size, num_features)
        learning_rate (float): Learning rate for Adam optimizer
        
    Returns:
        keras.Model: Compiled LSTM model
    """
    model = keras.Sequential([
        # Input layer
        layers.Input(shape=input_shape),
        
        # LSTM layer 1: 64 units
        # return_sequences=True: output shape (batch, window_size, 64)
        # This allows the next LSTM to process the sequence step by step
        layers.LSTM(64, return_sequences=True, activation='relu',
                   kernel_regularizer=regularizers.l2(0.001)),
        
        # Dropout: prevents co-adaptation of LSTM cells
        layers.Dropout(0.3),
        
        # LSTM layer 2: 32 units
        # return_sequences=False: output shape (batch, 32)
        # Only returns the final hidden state for use in downstream layers
        layers.LSTM(32, activation='relu',
                   kernel_regularizer=regularizers.l2(0.001)),
        
        # Dense layer: 16 units
        layers.Dense(16, activation='relu'),
        
        # Output layer: 1 unit for regression
        layers.Dense(1)
    ])
    
    # Compile model
    optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
    model.compile(
        optimizer=optimizer,
        loss='mse',
        metrics=['mae']
    )
    
    return model


def create_lstm_sequences(X_train, y_train, X_test, y_test, window_size=10):
    """
    Create 3D sequences for LSTM model.
    
    Converts 2D data (samples, features) to 3D sequences (samples, window_size, features)
    using a sliding window approach.
    
    For example, if we have 392 training samples with 8 features:
    - Original shape: (392, 8)
    - With window_size=10, we create sequences where each sequence contains
      10 consecutive samples
    - Output shape: (383, 10, 8) - sliding window loses window_size-1 samples
    
    Args:
        X_train, y_train: Training data
        X_test, y_test: Test data
        window_size (int): Number of timesteps in each sequence
        
    Returns:
        tuple: (X_train_seq, y_train_seq, X_test_seq, y_test_seq)
    """
    print("\nCreating LSTM sequences with sliding window...")
    print(f"Window size: {window_size} timesteps")
    
    # Create training sequences
    X_train_seq = []
    y_train_seq = []
    
    for i in range(len(X_train) - window_size + 1):
        X_train_seq.append(X_train[i:i + window_size])
        y_train_seq.append(y_train[i + window_size - 1])
    
    X_train_seq = np.array(X_train_seq, dtype=np.float32)
    y_train_seq = np.array(y_train_seq, dtype=np.float32)
    
    # Create test sequences
    X_test_seq = []
    y_test_seq = []
    
    for i in range(len(X_test) - window_size + 1):
        X_test_seq.append(X_test[i:i + window_size])
        y_test_seq.append(y_test[i + window_size - 1])
    
    X_test_seq = np.array(X_test_seq, dtype=np.float32)
    y_test_seq = np.array(y_test_seq, dtype=np.float32)
    
    print(f"Training sequences shape: {X_train_seq.shape}")
    print(f"Training targets shape: {y_train_seq.shape}")
    print(f"Test sequences shape: {X_test_seq.shape}")
    print(f"Test targets shape: {y_test_seq.shape}")
    
    return X_train_seq, y_train_seq, X_test_seq, y_test_seq


def train_lstm_model(X_train_seq, y_train_seq, X_test_seq, y_test_seq,
                     epochs=100, batch_size=32):
    """
    Train LSTM model using Backpropagation Through Time (BPTT).
    
    BPTT Process:
    1. Forward pass through all timesteps in sequence
    2. Compute loss at final timestep
    3. Backward pass through all timesteps
    4. Gradient updates propagated across time dimension
    
    Args:
        X_train_seq, y_train_seq: Training sequences and targets
        X_test_seq, y_test_seq: Test sequences and targets
        epochs (int): Number of training epochs
        batch_size (int): Batch size for training
        
    Returns:
        tuple: (trained_model, history, training_time)
    """
    print("\n" + "="*70)
    print("TRAINING LSTM MODEL")
    print("="*70)
    
    # Build model
    input_shape = (X_train_seq.shape[1], X_train_seq.shape[2])
    model = build_lstm_model(input_shape)
    
    # Display model architecture
    print("\nModel Architecture:")
    model.summary()
    
    # Define callbacks
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=15,
        restore_best_weights=True,
        verbose=1
    )
    
    reduce_lr = keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=10,
        min_lr=1e-6,
        verbose=1
    )
    
    # Train model
    print("\nStarting training...")
    start_time = time.time()
    
    history = model.fit(
        X_train_seq, y_train_seq,
        validation_data=(X_test_seq, y_test_seq),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[early_stopping, reduce_lr],
        verbose=1
    )
    
    training_time = time.time() - start_time
    print(f"\nTraining completed in {training_time:.2f} seconds")
    
    return model, history, training_time


def evaluate_lstm_model(model, X_test_seq, y_test_seq, model_name="LSTM"):
    """
    Evaluate LSTM model and compute metrics.
    
    Args:
        model: Trained LSTM model
        X_test_seq: Test sequences
        y_test_seq: Test targets
        model_name (str): Name for logging
        
    Returns:
        tuple: (metrics_dict, predictions)
    """
    print("\nEvaluating model...")
    
    # Make predictions
    y_pred = model.predict(X_test_seq, verbose=0)
    y_pred = y_pred.flatten()
    
    # Compute metrics
    metrics = compute_regression_metrics(
        y_test_seq, y_pred,
        num_features=X_test_seq.shape[2],
        model_name=model_name
    )
    
    # Print metrics
    print_metrics(metrics)
    
    return metrics, y_pred


def save_lstm_model(model, model_path="models/lstm_model.h5"):
    """
    Save trained LSTM model.
    
    Args:
        model: Trained model
        model_path (str): Path to save
    """
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    model.save(model_path)
    print(f"Model saved to {model_path}")


def main():
    """
    Main function for LSTM training and evaluation.
    """
    # Configuration
    data_dir = "data"
    models_dir = "models"
    images_dir = "images/lstm"
    window_size = 10
    
    # Load data
    print("\n" + "="*70)
    print("LOADING AND PREPROCESSING DATA")
    print("="*70)
    
    data_loader = AutoMPGDataLoader(data_dir)
    X_train, X_test, y_train, y_test, feature_names = data_loader.load_and_preprocess()
    
    print(f"Features: {feature_names}")
    print(f"Number of features: {X_train.shape[1]}")
    
    # Create sequences
    X_train_seq, y_train_seq, X_test_seq, y_test_seq = create_lstm_sequences(
        X_train, y_train, X_test, y_test, window_size=window_size
    )
    
    # Train model
    model, history, training_time = train_lstm_model(
        X_train_seq, y_train_seq, X_test_seq, y_test_seq,
        epochs=200,
        batch_size=32
    )
    
    # Evaluate model
    metrics, y_pred = evaluate_lstm_model(model, X_test_seq, y_test_seq, model_name="LSTM")
    
    # Save model
    model_path = os.path.join(models_dir, "lstm_model.h5")
    save_lstm_model(model, model_path)
    
    # Create visualizations
    print("\n" + "="*70)
    print("GENERATING VISUALIZATIONS")
    print("="*70)
    
    os.makedirs(images_dir, exist_ok=True)
    
    # Plot training history
    print("\nGenerating training history plots...")
    history_dict = {
        'loss': history.history['loss'],
        'val_loss': history.history.get('val_loss', []),
        'mae': history.history.get('mae', []),
        'val_mae': history.history.get('val_mae', [])
    }
    plot_training_history(history_dict, 'LSTM', images_dir)
    
    # Plot predictions vs actual
    print("Generating predictions vs actual plot...")
    plot_predictions_vs_actual(y_test_seq, y_pred, 'LSTM', images_dir)
    
    # Plot residuals
    print("Generating residual plots...")
    plot_residuals(y_test_seq, y_pred, 'LSTM', images_dir)
    
    # Plot error distribution
    print("Generating error distribution plot...")
    plot_error_distribution(y_test_seq, y_pred, 'LSTM', images_dir)
    
    print("\n" + "="*70)
    print("LSTM MODEL TRAINING COMPLETED SUCCESSFULLY")
    print("="*70)
    print(f"Training time: {training_time:.2f} seconds")
    print(f"Model saved to: {model_path}")
    print(f"Images saved to: {images_dir}")
    print("="*70)
    
    return model, metrics, training_time


if __name__ == "__main__":
    model, metrics, training_time = main()
