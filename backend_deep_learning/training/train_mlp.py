"""
Multilayer Perceptron (MLP) Model Training Script

This script implements a feedforward neural network using the Keras API of TensorFlow.

Architecture:
- Input layer: 8 features (from Auto MPG dataset)
- Hidden layer 1: 64 neurons, ReLU activation
- Batch Normalization for stable training
- Dropout(0.3) for regularization
- Hidden layer 2: 32 neurons, ReLU activation
- Dropout(0.2) for regularization
- Hidden layer 3: 16 neurons, ReLU activation
- Output layer: 1 neuron (regression)

Key Concepts:
- Backpropagation: Gradients computed backward through layers for weight updates
- Batch Normalization: Normalizes activations to stabilize and accelerate training
- Dropout: Randomly deactivates neurons to prevent overfitting
- Early Stopping: Stops training when validation loss stops improving
- Learning Rate Decay: Reduces learning rate when validation loss plateaus
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


def build_mlp_model(input_size, learning_rate=0.001):
    """
    Build a Multilayer Perceptron regression model.
    
    Architecture follows a standard MLP design:
    Input -> Dense(64) -> BatchNorm -> Dropout -> Dense(32) -> Dropout -> Dense(16) -> Output
    
    The model uses:
    - ReLU activation for hidden layers (introduces non-linearity)
    - Linear activation for output (regression task)
    - Learning rate set to 0.001 for stable convergence
    
    Args:
        input_size (int): Number of input features
        learning_rate (float): Learning rate for Adam optimizer
        
    Returns:
        keras.Model: Compiled MLP model ready for training
    """
    model = keras.Sequential([
        # Input layer
        layers.Input(shape=(input_size,)),
        
        # Hidden layer 1: 64 neurons with ReLU activation
        # ReLU (Rectified Linear Unit) allows the network to learn non-linear relationships
        layers.Dense(64, activation='relu', kernel_regularizer=regularizers.l2(0.001)),
        
        # Batch Normalization: normalizes inputs to next layer
        # Benefits: faster training, higher learning rates, reduced internal covariate shift
        layers.BatchNormalization(),
        
        # Dropout: randomly deactivates 30% of neurons during training
        # Prevents co-adaptation of neurons and reduces overfitting
        layers.Dropout(0.3),
        
        # Hidden layer 2: 32 neurons
        layers.Dense(32, activation='relu', kernel_regularizer=regularizers.l2(0.001)),
        
        # Dropout: randomly deactivates 20% of neurons
        layers.Dropout(0.2),
        
        # Hidden layer 3: 16 neurons
        layers.Dense(16, activation='relu', kernel_regularizer=regularizers.l2(0.001)),
        
        # Output layer: 1 neuron with linear activation (regression)
        # Linear activation means no transformation: output = input
        layers.Dense(1)
    ])
    
    # Compile the model
    optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
    model.compile(
        optimizer=optimizer,
        loss='mse',  # Mean Squared Error loss for regression
        metrics=['mae']  # Monitor Mean Absolute Error during training
    )
    
    return model


def train_mlp_model(X_train, y_train, X_test, y_test, epochs=100, batch_size=32):
    """
    Train the MLP model with callbacks for early stopping and learning rate reduction.
    
    The training process:
    1. Forward pass: inputs -> network -> predictions
    2. Loss computation: compare predictions with ground truth
    3. Backpropagation: compute gradients for each layer
    4. Weight updates: adjust weights using Adam optimizer
    
    Callbacks:
    - EarlyStopping: stops training if validation loss doesn't improve for 15 epochs
    - ReduceLROnPlateau: reduces learning rate by 0.5 if loss plateaus
    
    Args:
        X_train (np.ndarray): Training features (samples, features)
        y_train (np.ndarray): Training targets (samples,)
        X_test (np.ndarray): Test features for validation
        y_test (np.ndarray): Test targets for validation
        epochs (int): Maximum number of training epochs
        batch_size (int): Number of samples per gradient update
        
    Returns:
        tuple: (trained_model, history)
    """
    print("\n" + "="*70)
    print("TRAINING MULTILAYER PERCEPTRON (MLP) MODEL")
    print("="*70)
    
    # Build model
    input_size = X_train.shape[1]
    model = build_mlp_model(input_size)
    
    # Display model architecture
    print("\nModel Architecture:")
    model.summary()
    
    # Define callbacks
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=15,  # Stop if no improvement for 15 epochs
        restore_best_weights=True,
        verbose=1
    )
    
    reduce_lr = keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,  # Multiply learning rate by 0.5
        patience=10,  # Wait 10 epochs before reducing
        min_lr=1e-6,
        verbose=1
    )
    
    # Train model
    print("\nStarting training...")
    start_time = time.time()
    
    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[early_stopping, reduce_lr],
        verbose=1
    )
    
    training_time = time.time() - start_time
    print(f"\nTraining completed in {training_time:.2f} seconds")
    
    return model, history, training_time


def evaluate_mlp_model(model, X_test, y_test, model_name="MLP"):
    """
    Evaluate MLP model on test set and compute metrics.
    
    Args:
        model: Trained Keras model
        X_test (np.ndarray): Test features
        y_test (np.ndarray): Test targets
        model_name (str): Name of model for logging
        
    Returns:
        dict: Dictionary of computed metrics
    """
    print("\nEvaluating model on test set...")
    
    # Make predictions
    y_pred = model.predict(X_test, verbose=0)
    y_pred = y_pred.flatten()
    
    # Compute metrics
    metrics = compute_regression_metrics(
        y_test, y_pred, 
        num_features=X_test.shape[1],
        model_name=model_name
    )
    
    # Print metrics
    print_metrics(metrics)
    
    return metrics, y_pred


def save_mlp_model(model, model_path="models/mlp_model.h5"):
    """
    Save trained MLP model to disk.
    
    Args:
        model: Trained Keras model
        model_path (str): Path to save model
    """
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    model.save(model_path)
    print(f"Model saved to {model_path}")


def main():
    """
    Main function to orchestrate MLP model training and evaluation.
    """
    # Configuration
    data_dir = "data"
    models_dir = "models"
    images_dir = "images/mlp"
    
    # Load and preprocess data
    print("\n" + "="*70)
    print("LOADING AND PREPROCESSING DATA")
    print("="*70)
    
    data_loader = AutoMPGDataLoader(data_dir)
    X_train, X_test, y_train, y_test, feature_names = data_loader.load_and_preprocess()
    
    print(f"\nFeatures: {feature_names}")
    print(f"Number of features: {X_train.shape[1]}")
    
    # Train model
    model, history, training_time = train_mlp_model(
        X_train, y_train, X_test, y_test,
        epochs=200,
        batch_size=32
    )
    
    # Evaluate model
    metrics, y_pred = evaluate_mlp_model(model, X_test, y_test, model_name="MLP")
    
    # Save model
    model_path = os.path.join(models_dir, "mlp_model.h5")
    save_mlp_model(model, model_path)
    
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
    plot_training_history(history_dict, 'MLP', images_dir)
    
    # Plot predictions vs actual
    print("Generating predictions vs actual plot...")
    plot_predictions_vs_actual(y_test, y_pred, 'MLP', images_dir)
    
    # Plot residuals
    print("Generating residual plots...")
    plot_residuals(y_test, y_pred, 'MLP', images_dir)
    
    # Plot error distribution
    print("Generating error distribution plot...")
    plot_error_distribution(y_test, y_pred, 'MLP', images_dir)
    
    print("\n" + "="*70)
    print("MLP MODEL TRAINING COMPLETED SUCCESSFULLY")
    print("="*70)
    print(f"Training time: {training_time:.2f} seconds")
    print(f"Model saved to: {model_path}")
    print(f"Images saved to: {images_dir}")
    print("="*70)
    
    return model, metrics, training_time


if __name__ == "__main__":
    model, metrics, training_time = main()
