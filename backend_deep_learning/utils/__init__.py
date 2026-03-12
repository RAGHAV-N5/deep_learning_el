"""
Utils package for Deep Learning Fuel Consumption Prediction System

Modules:
- data_loader: Download, clean, and preprocess Auto MPG dataset
- metrics: Compute comprehensive regression evaluation metrics
- plotting: Visualize training history and model performance
"""

__version__ = "1.0.0"
__author__ = "Deep Learning Engineer"

from .data_loader import AutoMPGDataLoader, load_all_data
from .metrics import compute_regression_metrics, print_metrics, compare_models_metrics
from .plotting import (
    plot_training_history,
    plot_predictions_vs_actual,
    plot_residuals,
    plot_error_distribution,
    plot_reconstruction_loss,
    plot_latent_space_pca,
    plot_models_comparison_rmse,
    plot_metrics_heatmap,
    plot_training_time_comparison
)

__all__ = [
    'AutoMPGDataLoader',
    'load_all_data',
    'compute_regression_metrics',
    'print_metrics',
    'compare_models_metrics',
    'plot_training_history',
    'plot_predictions_vs_actual',
    'plot_residuals',
    'plot_error_distribution',
    'plot_reconstruction_loss',
    'plot_latent_space_pca',
    'plot_models_comparison_rmse',
    'plot_metrics_heatmap',
    'plot_training_time_comparison'
]
