"""
Plotting and Visualization Module

This module provides comprehensive visualization functions for:
- Training history plots (loss, MAE)
- Predictions vs actual plots
- Residual analysis
- Error distributions
- Model comparison plots
- PCA visualization of latent space

All plots are automatically saved with high DPI (300) and proper formatting.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA


# Set style for better-looking plots
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)
plt.rcParams['font.size'] = 10


def ensure_dir(path):
    """
    Ensure directory exists, create if needed.
    
    Args:
        path (str): Directory path
    """
    os.makedirs(path, exist_ok=True)


def plot_training_history(history, model_name, save_dir):
    """
    Plot training and validation loss and MAE over epochs.
    
    The training history is from a Keras model.fit() call and shows
    how the model's loss decreased during training.
    
    Args:
        history: Keras training history object (or dict with keys)
        model_name (str): Name of model for plot title
        save_dir (str): Directory to save plot
    """
    ensure_dir(save_dir)
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Loss plot
    if isinstance(history, dict):
        epochs = range(1, len(history['loss']) + 1)
        axes[0].plot(epochs, history['loss'], 'b-', linewidth=2, label='Training Loss')
        if 'val_loss' in history:
            axes[0].plot(epochs, history['val_loss'], 'r-', linewidth=2, label='Validation Loss')
    else:
        epochs = range(1, len(history.history['loss']) + 1)
        axes[0].plot(epochs, history.history['loss'], 'b-', linewidth=2, label='Training Loss')
        if 'val_loss' in history.history:
            axes[0].plot(epochs, history.history['val_loss'], 'r-', linewidth=2, label='Validation Loss')
    
    axes[0].set_xlabel('Epoch', fontsize=11, fontweight='bold')
    axes[0].set_ylabel('Loss (MSE)', fontsize=11, fontweight='bold')
    axes[0].set_title(f'{model_name} - Training Loss', fontsize=12, fontweight='bold')
    axes[0].legend(fontsize=10)
    axes[0].grid(True, alpha=0.3)
    
    # MAE plot
    if isinstance(history, dict):
        if 'mae' in history:
            axes[1].plot(epochs, history['mae'], 'g-', linewidth=2, label='Training MAE')
            if 'val_mae' in history:
                axes[1].plot(epochs, history['val_mae'], 'orange', linewidth=2, label='Validation MAE')
    else:
        if 'mae' in history.history:
            axes[1].plot(epochs, history.history['mae'], 'g-', linewidth=2, label='Training MAE')
            if 'val_mae' in history.history:
                axes[1].plot(epochs, history.history['val_mae'], 'orange', linewidth=2, label='Validation MAE')
    
    axes[1].set_xlabel('Epoch', fontsize=11, fontweight='bold')
    axes[1].set_ylabel('MAE', fontsize=11, fontweight='bold')
    axes[1].set_title(f'{model_name} - Training MAE', fontsize=12, fontweight='bold')
    axes[1].legend(fontsize=10)
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    save_path = os.path.join(save_dir, f'{model_name}_training_history.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Saved: {save_path}")
    plt.close()


def plot_predictions_vs_actual(y_actual, y_predicted, model_name, save_dir):
    """
    Create scatter plot of predicted vs actual values.
    
    This visualization shows the model's prediction accuracy. Points near the
    diagonal line y=x indicate good predictions. Deviations from the diagonal
    show systematic over/under prediction.
    
    Args:
        y_actual (np.ndarray): True target values
        y_predicted (np.ndarray): Predicted values
        model_name (str): Name of model
        save_dir (str): Directory to save plot
    """
    ensure_dir(save_dir)
    
    y_actual = np.array(y_actual).flatten()
    y_predicted = np.array(y_predicted).flatten()
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Scatter plot
    ax.scatter(y_actual, y_predicted, alpha=0.6, s=50, edgecolors='k', linewidth=0.5)
    
    # Perfect prediction line
    min_val = min(y_actual.min(), y_predicted.min())
    max_val = max(y_actual.max(), y_predicted.max())
    ax.plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, label='Perfect Prediction')
    
    ax.set_xlabel('Actual MPG', fontsize=11, fontweight='bold')
    ax.set_ylabel('Predicted MPG', fontsize=11, fontweight='bold')
    ax.set_title(f'{model_name} - Predicted vs Actual', fontsize=12, fontweight='bold')
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    save_path = os.path.join(save_dir, f'{model_name}_predictions_vs_actual.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Saved: {save_path}")
    plt.close()


def plot_residuals(y_actual, y_predicted, model_name, save_dir):
    """
    Create residual plot for model evaluation.
    
    Residuals are the differences between actual and predicted values.
    A good model should have residuals randomly distributed around zero
    without any patterns.
    
    Args:
        y_actual (np.ndarray): True target values
        y_predicted (np.ndarray): Predicted values
        model_name (str): Name of model
        save_dir (str): Directory to save plot
    """
    ensure_dir(save_dir)
    
    y_actual = np.array(y_actual).flatten()
    y_predicted = np.array(y_predicted).flatten()
    residuals = y_actual - y_predicted
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Residuals scatter plot
    axes[0].scatter(y_predicted, residuals, alpha=0.6, s=50, edgecolors='k', linewidth=0.5)
    axes[0].axhline(y=0, color='r', linestyle='--', linewidth=2)
    axes[0].set_xlabel('Predicted Values', fontsize=11, fontweight='bold')
    axes[0].set_ylabel('Residuals', fontsize=11, fontweight='bold')
    axes[0].set_title(f'{model_name} - Residual Plot', fontsize=12, fontweight='bold')
    axes[0].grid(True, alpha=0.3)
    
    # Residuals distribution (histogram)
    axes[1].hist(residuals, bins=30, color='skyblue', edgecolor='black', alpha=0.7)
    axes[1].axvline(x=0, color='r', linestyle='--', linewidth=2, label='Zero Error')
    axes[1].set_xlabel('Residual Value', fontsize=11, fontweight='bold')
    axes[1].set_ylabel('Frequency', fontsize=11, fontweight='bold')
    axes[1].set_title(f'{model_name} - Residual Distribution', fontsize=12, fontweight='bold')
    axes[1].legend(fontsize=10)
    axes[1].grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    save_path = os.path.join(save_dir, f'{model_name}_residuals.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Saved: {save_path}")
    plt.close()


def plot_error_distribution(y_actual, y_predicted, model_name, save_dir):
    """
    Plot histogram of prediction errors.
    
    Shows the distribution of errors (|actual - predicted|) across all predictions.
    A good model should have most errors concentrated near zero.
    
    Args:
        y_actual (np.ndarray): True target values
        y_predicted (np.ndarray): Predicted values
        model_name (str): Name of model
        save_dir (str): Directory to save plot
    """
    ensure_dir(save_dir)
    
    y_actual = np.array(y_actual).flatten()
    y_predicted = np.array(y_predicted).flatten()
    errors = np.abs(y_actual - y_predicted)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    ax.hist(errors, bins=30, color='coral', edgecolor='black', alpha=0.7)
    ax.axvline(x=np.mean(errors), color='red', linestyle='--', linewidth=2, label=f'Mean Error: {np.mean(errors):.2f}')
    ax.axvline(x=np.median(errors), color='green', linestyle='--', linewidth=2, label=f'Median Error: {np.median(errors):.2f}')
    
    ax.set_xlabel('Absolute Error (|y_true - y_pred|)', fontsize=11, fontweight='bold')
    ax.set_ylabel('Frequency', fontsize=11, fontweight='bold')
    ax.set_title(f'{model_name} - Error Distribution', fontsize=12, fontweight='bold')
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    save_path = os.path.join(save_dir, f'{model_name}_error_distribution.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Saved: {save_path}")
    plt.close()


def plot_reconstruction_loss(history, model_name, save_dir):
    """
    Plot reconstruction loss for autoencoder.
    
    Args:
        history: Keras training history for autoencoder
        model_name (str): Name of model
        save_dir (str): Directory to save plot
    """
    ensure_dir(save_dir)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    if isinstance(history, dict):
        epochs = range(1, len(history['loss']) + 1)
        ax.plot(epochs, history['loss'], 'b-', linewidth=2, label='Training Loss')
        if 'val_loss' in history:
            ax.plot(epochs, history['val_loss'], 'r-', linewidth=2, label='Validation Loss')
    else:
        epochs = range(1, len(history.history['loss']) + 1)
        ax.plot(epochs, history.history['loss'], 'b-', linewidth=2, label='Training Loss')
        if 'val_loss' in history.history:
            ax.plot(epochs, history.history['val_loss'], 'r-', linewidth=2, label='Validation Loss')
    
    ax.set_xlabel('Epoch', fontsize=11, fontweight='bold')
    ax.set_ylabel('Reconstruction Loss (MSE)', fontsize=11, fontweight='bold')
    ax.set_title(f'{model_name} - Reconstruction Loss', fontsize=12, fontweight='bold')
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    save_path = os.path.join(save_dir, f'{model_name}_reconstruction_loss.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Saved: {save_path}")
    plt.close()


def plot_latent_space_pca(latent_features, model_name, save_dir):
    """
    Visualize latent space using PCA projection to 2D.
    
    Principal Component Analysis reduces the latent space to 2D for visualization,
    showing how the autoencoder has learned to represent the data.
    
    Args:
        latent_features (np.ndarray): Latent space representations
        model_name (str): Name of model
        save_dir (str): Directory to save plot
    """
    ensure_dir(save_dir)
    
    if latent_features.shape[1] <= 2:
        # Already 2D or less, no need for PCA
        if latent_features.shape[1] == 1:
            print(f"Latent space is 1D, cannot create 2D PCA plot")
            return
        pca_features = latent_features
    else:
        # Apply PCA to reduce to 2D
        pca = PCA(n_components=2)
        pca_features = pca.fit_transform(latent_features)
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Color points by index for visualization
    scatter = ax.scatter(pca_features[:, 0], pca_features[:, 1], 
                        c=np.arange(len(pca_features)), cmap='viridis', 
                        alpha=0.6, s=50, edgecolors='k', linewidth=0.5)
    
    ax.set_xlabel(f'PC1', fontsize=11, fontweight='bold')
    ax.set_ylabel(f'PC2', fontsize=11, fontweight='bold')
    ax.set_title(f'{model_name} - Latent Space (PCA)', fontsize=12, fontweight='bold')
    ax.grid(True, alpha=0.3)
    
    cbar = plt.colorbar(scatter, ax=ax)
    cbar.set_label('Sample Index', fontsize=10)
    
    plt.tight_layout()
    save_path = os.path.join(save_dir, f'{model_name}_latent_space_pca.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Saved: {save_path}")
    plt.close()


def plot_models_comparison_rmse(models_data, save_dir):
    """
    Create bar chart comparing RMSE across models.
    
    Args:
        models_data (dict): Dictionary with model names as keys and RMSE values
        save_dir (str): Directory to save plot
    """
    ensure_dir(save_dir)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    models = list(models_data.keys())
    rmse_values = list(models_data.values())
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']
    
    bars = ax.bar(models, rmse_values, color=colors[:len(models)], edgecolor='black', linewidth=1.5, alpha=0.8)
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.4f}',
                ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    ax.set_ylabel('RMSE', fontsize=11, fontweight='bold')
    ax.set_title('Model Comparison - RMSE', fontsize=12, fontweight='bold')
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    save_path = os.path.join(save_dir, 'models_comparison_rmse.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Saved: {save_path}")
    plt.close()


def plot_metrics_heatmap(metrics_df, save_dir):
    """
    Create heatmap of metrics across models.
    
    Args:
        metrics_df (pd.DataFrame): DataFrame with models as index and metrics as columns
        save_dir (str): Directory to save plot
    """
    ensure_dir(save_dir)
    
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Normalize metrics for better visualization (0-1 scale where possible)
    metrics_normalized = metrics_df.copy()
    
    # For metrics where higher is better, keep as is
    # For metrics where lower is better, invert
    for col in metrics_normalized.columns:
        if col in ['RMSE', 'MAE', 'MSE', 'MAPE', 'Median_Absolute_Error']:
            # Lower is better - invert so higher is better in heatmap
            metrics_normalized[col] = 1 / (1 + metrics_normalized[col])
    
    sns.heatmap(metrics_normalized, annot=True, fmt='.4f', cmap='RdYlGn', 
                cbar_kws={'label': 'Normalized Score'}, ax=ax, linewidths=1, linecolor='black')
    
    ax.set_title('Model Metrics Comparison (Normalized)', fontsize=12, fontweight='bold')
    ax.set_xlabel('Metrics', fontsize=11, fontweight='bold')
    ax.set_ylabel('Models', fontsize=11, fontweight='bold')
    
    plt.tight_layout()
    save_path = os.path.join(save_dir, 'metrics_heatmap.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Saved: {save_path}")
    plt.close()


def plot_training_time_comparison(training_times, save_dir):
    """
    Create bar chart comparing training times across models.
    
    Args:
        training_times (dict): Dictionary with model names and training times in seconds
        save_dir (str): Directory to save plot
    """
    ensure_dir(save_dir)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    models = list(training_times.keys())
    times = list(training_times.values())
    colors = ['#FFB6C1', '#98FB98', '#87CEEB']
    
    bars = ax.bar(models, times, color=colors[:len(models)], edgecolor='black', linewidth=1.5, alpha=0.8)
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.2f}s',
                ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    ax.set_ylabel('Training Time (seconds)', fontsize=11, fontweight='bold')
    ax.set_title('Model Comparison - Training Time', fontsize=12, fontweight='bold')
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    save_path = os.path.join(save_dir, 'training_time_comparison.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Saved: {save_path}")
    plt.close()
