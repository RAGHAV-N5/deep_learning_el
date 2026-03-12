"""
Denoising Autoencoder Model Training Script

This script implements an autoencoder - an unsupervised neural network that learns
to reconstruct its input by passing it through a bottleneck (latent space).

Autoencoder Architecture:

ENCODER (compresses information):
- Input (8 features)
- Dense(64) + ReLU
- Dense(32) + ReLU
- Dense(16) + ReLU -> LATENT SPACE (16 dimensions)

DECODER (reconstructs from latent space):
- Dense(32) + ReLU
- Dense(64) + ReLU
- Output(8) (reconstruct input)

Key Concepts:

1. Denoising: Gaussian noise added to input, model learns to remove it
   - Improves robustness
   - Prevents copying input directly
   
2. Latent Space: 16-dimensional compressed representation
   - Dimensionality reduction
   - Feature extraction
   - Captures essential data structure
   
3. Loss: Reconstruction MSE
   - Measures how well latent space can reconstruct original
   - Lower loss = better compression and reconstruction
   
4. Two-Phase Training:
   - Phase 1: Train autoencoder to minimize reconstruction loss
   - Phase 2: Extract latent features and train MLP on them
   - Phase 2 demonstrates that latent features are useful for prediction
"""

import os
import sys
import time
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import matplotlib.pyplot as plt

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.data_loader import AutoMPGDataLoader
from utils.metrics import compute_regression_metrics, print_metrics
from utils.plotting import (
    plot_reconstruction_loss,
    plot_latent_space_pca,
    plot_training_history
)


def add_gaussian_noise(x, stddev=0.1):
    """
    Add Gaussian noise to input for denoising autoencoder.
    
    Args:
        x (np.ndarray): Input data
        stddev (float): Standard deviation of Gaussian noise
        
    Returns:
        np.ndarray: Input with added noise
    """
    noise = np.random.normal(0, stddev, x.shape)
    return x + noise


def build_autoencoder_model(input_size, latent_size=16, learning_rate=0.001):
    """
    Build a denoising autoencoder model.
    
    The autoencoder learns to:
    1. Compress input through encoder to latent space
    2. Reconstruct input from latent space through decoder
    3. Minimize reconstruction loss
    
    Args:
        input_size (int): Number of input features (8)
        latent_size (int): Dimension of latent space (16)
        learning_rate (float): Learning rate for optimizer
        
    Returns:
        tuple: (full_autoencoder, encoder)
    """
    # Encoder: compresses input to latent space
    encoder_inputs = layers.Input(shape=(input_size,))
    
    encoder = keras.Sequential([
        layers.Dense(64, activation='relu', input_shape=(input_size,)),
        layers.Dense(32, activation='relu'),
        layers.Dense(latent_size, activation='relu', name='latent_space')
    ], name='encoder')
    
    # Decoder: reconstructs input from latent space
    decoder = keras.Sequential([
        layers.Dense(32, activation='relu', input_shape=(latent_size,)),
        layers.Dense(64, activation='relu'),
        layers.Dense(input_size)  # Linear activation for reconstruction
    ], name='decoder')
    
    # Full autoencoder: encoder + decoder
    autoencoder = keras.Sequential([encoder, decoder], name='autoencoder')
    
    # Compile
    optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
    autoencoder.compile(
        optimizer=optimizer,
        loss='mse',  # Reconstruction loss
        metrics=['mae']
    )
    
    return autoencoder, encoder


def train_autoencoder(X_train, X_test, epochs=100, batch_size=32, noise_stddev=0.1):
    """
    Train the denoising autoencoder.
    
    Training Process:
    1. Add Gaussian noise to inputs
    2. Feed noisy inputs to autoencoder
    3. Autoencoder learns to reconstruct clean inputs
    4. Backpropagation minimizes reconstruction loss
    
    Args:
        X_train, X_test: Training and test features
        epochs (int): Number of epochs
        batch_size (int): Batch size
        noise_stddev (float): Standard deviation of noise
        
    Returns:
        tuple: (autoencoder, encoder, history, training_time)
    """
    print("\n" + "="*70)
    print("TRAINING DENOISING AUTOENCODER")
    print("="*70)
    
    # Build model
    input_size = X_train.shape[1]
    autoencoder, encoder = build_autoencoder_model(input_size)
    
    print("\nAutoencoder Architecture:")
    autoencoder.summary()
    
    # Add noise to training and test data
    print(f"\nAdding Gaussian noise (stddev={noise_stddev}) to inputs...")
    X_train_noisy = add_gaussian_noise(X_train, stddev=noise_stddev)
    X_test_noisy = add_gaussian_noise(X_test, stddev=noise_stddev)
    
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
    
    # Train: reconstruct clean inputs from noisy inputs
    print("\nStarting training...")
    start_time = time.time()
    
    history = autoencoder.fit(
        X_train_noisy, X_train,  # Input noisy, output clean
        validation_data=(X_test_noisy, X_test),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[early_stopping, reduce_lr],
        verbose=1
    )
    
    training_time = time.time() - start_time
    print(f"\nTraining completed in {training_time:.2f} seconds")
    
    return autoencoder, encoder, history, training_time


def extract_latent_features(encoder, X):
    """
    Extract latent space representations from encoder.
    
    Args:
        encoder: Trained encoder model
        X (np.ndarray): Input features
        
    Returns:
        np.ndarray: Latent space representations
    """
    latent_features = encoder.predict(X, verbose=0)
    print(f"Latent features shape: {latent_features.shape}")
    return latent_features


def build_mlp_on_latent(latent_size, learning_rate=0.001):
    """
    Build MLP model for regression on latent features.
    
    This demonstrates that the latent space captures useful information
    for predicting MPG.
    
    Args:
        latent_size (int): Dimension of latent features (16)
        learning_rate (float): Learning rate
        
    Returns:
        keras.Model: Compiled MLP model
    """
    model = keras.Sequential([
        layers.Input(shape=(latent_size,)),
        layers.Dense(32, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        layers.Dense(16, activation='relu'),
        layers.Dropout(0.1),
        layers.Dense(1)
    ])
    
    optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
    model.compile(
        optimizer=optimizer,
        loss='mse',
        metrics=['mae']
    )
    
    return model


def train_mlp_on_latent(latent_train, y_train, latent_test, y_test,
                        epochs=100, batch_size=32):
    """
    Train MLP on latent features extracted from autoencoder.
    
    This phase proves that the unsupervised latent representation
    contains predictive information.
    
    Args:
        latent_train, latent_test: Latent features
        y_train, y_test: Target values
        epochs (int): Number of epochs
        batch_size (int): Batch size
        
    Returns:
        tuple: (model, history, training_time)
    """
    print("\n" + "="*70)
    print("TRAINING MLP ON LATENT FEATURES")
    print("="*70)
    
    latent_size = latent_train.shape[1]
    model = build_mlp_on_latent(latent_size)
    
    print("\nMLP Architecture:")
    model.summary()
    
    # Callbacks
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
    
    # Train
    print("\nStarting training...")
    start_time = time.time()
    
    history = model.fit(
        latent_train, y_train,
        validation_data=(latent_test, y_test),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[early_stopping, reduce_lr],
        verbose=1
    )
    
    training_time = time.time() - start_time
    print(f"\nTraining completed in {training_time:.2f} seconds")
    
    return model, history, training_time


def evaluate_models(autoencoder, encoder, mlp_model, X_test, latent_test, y_test):
    """
    Evaluate both autoencoder and MLP on latent features.
    
    Args:
        autoencoder: Trained autoencoder
        encoder: Trained encoder
        mlp_model: MLP trained on latent features
        X_test: Test features
        latent_test: Test latent features
        y_test: Test targets
        
    Returns:
        tuple: (autoencoder_metrics, mlp_metrics, reconstructions, predictions)
    """
    print("\n" + "="*70)
    print("EVALUATING MODELS")
    print("="*70)
    
    # Evaluate autoencoder reconstruction
    print("\nEvaluating Autoencoder (Reconstruction)...")
    reconstructions = autoencoder.predict(X_test, verbose=0)
    reconstruction_mse = np.mean((X_test - reconstructions) ** 2)
    reconstruction_mae = np.mean(np.abs(X_test - reconstructions))
    
    print(f"Reconstruction MSE: {reconstruction_mse:.6f}")
    print(f"Reconstruction MAE: {reconstruction_mae:.6f}")
    
    # Evaluate MLP on latent features
    print("\nEvaluating MLP on Latent Features...")
    predictions = mlp_model.predict(latent_test, verbose=0).flatten()
    
    mlp_metrics = compute_regression_metrics(
        y_test, predictions,
        num_features=latent_test.shape[1],
        model_name="MLP-on-Latent"
    )
    print_metrics(mlp_metrics)
    
    return reconstruction_mse, reconstruction_mae, predictions


def save_models(autoencoder, encoder, mlp_model,
                autoencoder_path="models/autoencoder_model.h5",
                encoder_path="models/encoder_model.h5",
                mlp_path="models/mlp_latent_model.h5"):
    """
    Save all trained models.
    
    Args:
        autoencoder, encoder, mlp_model: Trained models
        autoencoder_path: Path for autoencoder
        encoder_path: Path for encoder
        mlp_path: Path for MLP
    """
    os.makedirs(os.path.dirname(autoencoder_path), exist_ok=True)
    
    autoencoder.save(autoencoder_path)
    print(f"Autoencoder saved to {autoencoder_path}")
    
    encoder.save(encoder_path)
    print(f"Encoder saved to {encoder_path}")
    
    mlp_model.save(mlp_path)
    print(f"MLP model saved to {mlp_path}")


def main():
    """
    Main function for autoencoder training and evaluation.
    """
    # Configuration
    data_dir = "data"
    models_dir = "models"
    images_dir = "images/autoencoder"
    
    # Load data
    print("\n" + "="*70)
    print("LOADING AND PREPROCESSING DATA")
    print("="*70)
    
    data_loader = AutoMPGDataLoader(data_dir)
    X_train, X_test, y_train, y_test, feature_names = data_loader.load_and_preprocess()
    
    print(f"Features: {feature_names}")
    print(f"Number of features: {X_train.shape[1]}")
    
    # Train autoencoder
    autoencoder, encoder, ae_history, ae_training_time = train_autoencoder(
        X_train, X_test,
        epochs=200,
        batch_size=32,
        noise_stddev=0.1
    )
    
    # Extract latent features
    print("\n" + "="*70)
    print("EXTRACTING LATENT FEATURES")
    print("="*70)
    
    latent_train = extract_latent_features(encoder, X_train)
    latent_test = extract_latent_features(encoder, X_test)
    
    # Train MLP on latent features
    mlp_model, mlp_history, mlp_training_time = train_mlp_on_latent(
        latent_train, y_train, latent_test, y_test,
        epochs=200,
        batch_size=32
    )
    
    # Evaluate models
    ae_mse, ae_mae, predictions = evaluate_models(
        autoencoder, encoder, mlp_model, X_test, latent_test, y_test
    )
    
    # Save models
    print("\n" + "="*70)
    print("SAVING MODELS")
    print("="*70)
    
    save_models(autoencoder, encoder, mlp_model,
                os.path.join(models_dir, "autoencoder_model.h5"),
                os.path.join(models_dir, "encoder_model.h5"),
                os.path.join(models_dir, "mlp_latent_model.h5"))
    
    # Create visualizations
    print("\n" + "="*70)
    print("GENERATING VISUALIZATIONS")
    print("="*70)
    
    os.makedirs(images_dir, exist_ok=True)
    
    # Plot autoencoder reconstruction loss
    print("\nGenerating reconstruction loss plot...")
    ae_history_dict = {
        'loss': ae_history.history['loss'],
        'val_loss': ae_history.history.get('val_loss', []),
        'mae': ae_history.history.get('mae', []),
        'val_mae': ae_history.history.get('val_mae', [])
    }
    plot_reconstruction_loss(ae_history_dict, 'Autoencoder', images_dir)
    
    # Plot latent space PCA
    print("Generating latent space PCA plot...")
    plot_latent_space_pca(latent_test, 'Autoencoder', images_dir)
    
    # Plot MLP training history
    print("Generating MLP training history plot...")
    mlp_history_dict = {
        'loss': mlp_history.history['loss'],
        'val_loss': mlp_history.history.get('val_loss', []),
        'mae': mlp_history.history.get('mae', []),
        'val_mae': mlp_history.history.get('val_mae', [])
    }
    plot_training_history(mlp_history_dict, 'MLP-on-Latent', images_dir)
    
    print("\n" + "="*70)
    print("AUTOENCODER TRAINING COMPLETED SUCCESSFULLY")
    print("="*70)
    print(f"Autoencoder training time: {ae_training_time:.2f} seconds")
    print(f"MLP on latent training time: {mlp_training_time:.2f} seconds")
    print(f"Models saved to: {models_dir}")
    print(f"Images saved to: {images_dir}")
    print("="*70)
    
    return autoencoder, encoder, mlp_model, ae_training_time, mlp_training_time


if __name__ == "__main__":
    autoencoder, encoder, mlp_model, ae_time, mlp_time = main()
