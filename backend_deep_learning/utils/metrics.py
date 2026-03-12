"""
Metrics Computation Module

This module provides comprehensive evaluation metrics for regression models:
- MSE (Mean Squared Error)
- RMSE (Root Mean Squared Error)
- MAE (Mean Absolute Error)
- R² Score
- Adjusted R²
- MAPE (Mean Absolute Percentage Error)
- Explained Variance
- Median Absolute Error

All metrics are computed and returned as a dictionary for easy logging and comparison.
"""

import numpy as np
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score,
    explained_variance_score,
    median_absolute_error
)


def compute_regression_metrics(y_true, y_pred, num_features=None, model_name="Model"):
    """
    Compute comprehensive regression metrics.
    
    This function calculates multiple regression evaluation metrics to provide
    a thorough assessment of model performance. Metrics include both traditional
    and advanced measures to evaluate prediction accuracy and variance explained.
    
    Args:
        y_true (np.ndarray): True target values
        y_pred (np.ndarray): Predicted target values
        num_features (int): Number of features for adjusted R² calculation
        model_name (str): Name of the model for reference
        
    Returns:
        dict: Dictionary containing all computed metrics with their values
    """
    metrics = {}
    
    # Ensure inputs are numpy arrays
    y_true = np.array(y_true).flatten()
    y_pred = np.array(y_pred).flatten()
    
    metrics['model_name'] = model_name
    
    # Mean Squared Error (MSE)
    # Measures average of squared differences between predicted and true values
    # Lower is better
    mse = mean_squared_error(y_true, y_pred)
    metrics['MSE'] = mse
    
    # Root Mean Squared Error (RMSE)
    # Square root of MSE, in same units as target variable
    # More interpretable than MSE
    rmse = np.sqrt(mse)
    metrics['RMSE'] = rmse
    
    # Mean Absolute Error (MAE)
    # Average absolute difference between predicted and true values
    # Robust to outliers compared to MSE
    mae = mean_absolute_error(y_true, y_pred)
    metrics['MAE'] = mae
    
    # R² Score (Coefficient of Determination)
    # Proportion of variance in y explained by the model
    # Range: (-∞, 1]. 1 = perfect, 0 = baseline, negative = worse than baseline
    r2 = r2_score(y_true, y_pred)
    metrics['R2'] = r2
    
    # Adjusted R²
    # R² adjusted for number of features to penalize overfitting
    # More reliable when comparing models with different numbers of features
    if num_features is not None:
        n = len(y_true)
        adjusted_r2 = 1 - (1 - r2) * (n - 1) / (n - num_features - 1)
        metrics['Adjusted_R2'] = adjusted_r2
    
    # Mean Absolute Percentage Error (MAPE)
    # Average percentage difference between predicted and true values
    # Good for scale-independent comparison
    # Avoid division by zero
    mask = y_true != 0
    if mask.sum() > 0:
        mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
        metrics['MAPE'] = mape
    else:
        metrics['MAPE'] = np.nan
    
    # Explained Variance Score
    # How much of the variance in y is explained by the model
    # Similar to R² but calculated differently
    ev = explained_variance_score(y_true, y_pred)
    metrics['Explained_Variance'] = ev
    
    # Median Absolute Error
    # Median of absolute errors, robust to outliers
    med_ae = median_absolute_error(y_true, y_pred)
    metrics['Median_Absolute_Error'] = med_ae
    
    # Additional useful metrics
    
    # Residuals
    residuals = y_true - y_pred
    metrics['Mean_Residual'] = np.mean(residuals)
    metrics['Std_Residual'] = np.std(residuals)
    metrics['Min_Residual'] = np.min(residuals)
    metrics['Max_Residual'] = np.max(residuals)
    
    return metrics


def print_metrics(metrics, decimal_places=4):
    """
    Pretty print metrics dictionary.
    
    Args:
        metrics (dict): Dictionary of metrics from compute_regression_metrics()
        decimal_places (int): Number of decimal places to display
    """
    print("\n" + "="*60)
    print(f"EVALUATION METRICS - {metrics['model_name']}")
    print("="*60)
    
    # Exclude model name from printing
    for key, value in metrics.items():
        if key != 'model_name':
            if isinstance(value, (int, float)):
                print(f"{key:.<40} {value:>10.{decimal_places}f}")
            else:
                print(f"{key:.<40} {str(value):>10}")
    
    print("="*60 + "\n")


def compare_models_metrics(metrics_list):
    """
    Create a comparison of metrics across multiple models.
    
    Args:
        metrics_list (list): List of metric dictionaries from compute_regression_metrics()
        
    Returns:
        dict: Dictionary suitable for converting to DataFrame for comparison
    """
    comparison = {}
    
    # Get all metric keys (excluding model_name)
    all_keys = set()
    for metrics in metrics_list:
        all_keys.update(k for k in metrics.keys() if k != 'model_name')
    
    # Build comparison dictionary
    for key in sorted(all_keys):
        comparison[key] = {}
        for metrics in metrics_list:
            model_name = metrics.get('model_name', 'Unknown')
            comparison[key][model_name] = metrics.get(key, np.nan)
    
    return comparison


def calculate_best_model(metrics_list, primary_metric='RMSE'):
    """
    Determine the best model based on a primary metric.
    
    Args:
        metrics_list (list): List of metric dictionaries
        primary_metric (str): Metric to use for ranking (default: 'RMSE')
        
    Returns:
        tuple: (best_model_name, best_metrics_dict)
    """
    valid_metrics = [m for m in metrics_list if primary_metric in m]
    
    if not valid_metrics:
        print(f"Warning: Primary metric '{primary_metric}' not found in any model metrics")
        return None, None
    
    # For RMSE, MAE, MSE: lower is better
    if primary_metric in ['RMSE', 'MAE', 'MSE', 'MAPE', 'Median_Absolute_Error']:
        best = min(valid_metrics, key=lambda x: x[primary_metric])
    # For R2, Adjusted_R2, Explained_Variance: higher is better
    else:
        best = max(valid_metrics, key=lambda x: x.get(primary_metric, -np.inf))
    
    return best['model_name'], best


def get_metrics_summary(metrics):
    """
    Get a concise summary of key metrics.
    
    Args:
        metrics (dict): Metrics dictionary
        
    Returns:
        dict: Summary of key metrics
    """
    summary = {
        'Model': metrics.get('model_name', 'Unknown'),
        'RMSE': metrics.get('RMSE', np.nan),
        'MAE': metrics.get('MAE', np.nan),
        'R²': metrics.get('R2', np.nan),
        'MAPE': metrics.get('MAPE', np.nan)
    }
    return summary
