"""
Data Loading and Preprocessing Module

This module handles:
- Auto MPG dataset download from UCI repository
- Data cleaning and preprocessing
- Train/test splitting
- Feature scaling
- Sliding window sequence creation for LSTM
- Scaler persistence using joblib
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import urllib.request


class AutoMPGDataLoader:
    """
    Loads and preprocesses the Auto MPG dataset.
    
    This class automates the process of downloading the Auto MPG dataset
    from the UCI Machine Learning Repository, cleaning it, and preparing
    it for deep learning models.
    """
    
    def __init__(self, data_dir="data"):
        """
        Initialize the data loader.
        
        Args:
            data_dir (str): Directory to store the dataset
        """
        self.data_dir = data_dir
        self.data_path = os.path.join(data_dir, "auto_mpg.csv")
        self.scaler = None
        self.scaler_path = os.path.join(data_dir, "scaler.pkl")
        
        os.makedirs(data_dir, exist_ok=True)
    
    def download_dataset(self):
        """
        Download the Auto MPG dataset from UCI repository if not already present.
        
        Returns:
            pd.DataFrame: Raw dataset before cleaning
        """
        if os.path.exists(self.data_path):
            print(f"Dataset already exists at {self.data_path}")
            return pd.read_csv(self.data_path)
        
        print("Downloading Auto MPG dataset from UCI repository...")
        url = "https://archive.ics.uci.edu/ml/machine-learning-databases/auto-mpg/auto-mpg.data"
        
        try:
            # Download dataset
            raw_path = os.path.join(self.data_dir, "auto_mpg_raw.data")
            urllib.request.urlretrieve(url, raw_path)
            print(f"Dataset downloaded successfully to {raw_path}")
            
            # Define column names
            column_names = [
                'mpg', 'cylinders', 'displacement', 'horsepower',
                'weight', 'acceleration', 'model_year', 'origin', 'car_name'
            ]
            
            # Read the raw data
            df = pd.read_csv(raw_path, sep='\s+', names=column_names, na_values='?')
            return df
            
        except Exception as e:
            print(f"Error downloading dataset: {e}")
            raise
    
    def clean_dataset(self, df):
        """
        Clean the Auto MPG dataset.
        
        Cleaning includes:
        - Handling missing values in horsepower
        - Converting horsepower to numeric
        - Dropping rows with NaN values
        - Removing non-numeric car_name column
        
        Args:
            df (pd.DataFrame): Raw dataset
            
        Returns:
            pd.DataFrame: Cleaned dataset
        """
        print("Cleaning dataset...")
        
        # Display dataset info before cleaning
        print(f"\nDataset shape before cleaning: {df.shape}")
        print(f"Missing values:\n{df.isnull().sum()}")
        
        # Convert horsepower to numeric (should already be numeric, but ensure)
        df['horsepower'] = pd.to_numeric(df['horsepower'], errors='coerce')
        
        # Drop rows with missing values
        df_clean = df.dropna()
        
        # Drop the car_name column if it exists (data may already be cleaned)
        if 'car_name' in df_clean.columns:
            df_clean = df_clean.drop('car_name', axis=1)
        
        print(f"Dataset shape after cleaning: {df_clean.shape}")
        print(f"\nDataset Info:")
        print(df_clean.info())
        print(f"\nDataset Statistics:")
        print(df_clean.describe())
        
        return df_clean
    
    def load_and_preprocess(self, test_size=0.2, random_state=42):
        """
        Load, clean, and preprocess the dataset.
        
        Args:
            test_size (float): Fraction of data to use for testing
            random_state (int): Random seed for reproducibility
            
        Returns:
            tuple: (X_train, X_test, y_train, y_test, feature_names)
        """
        # Download dataset
        df = self.download_dataset()
        
        # Clean dataset
        df_clean = self.clean_dataset(df)
        
        # Save cleaned dataset
        df_clean.to_csv(self.data_path, index=False)
        print(f"\nCleaned dataset saved to {self.data_path}")
        
        # Separate features and target
        X = df_clean.drop('mpg', axis=1)
        y = df_clean['mpg']
        
        feature_names = X.columns.tolist()
        
        # Train/test split (80/20)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        print(f"\nTrain/Test split (80/20):")
        print(f"X_train shape: {X_train.shape}")
        print(f"X_test shape: {X_test.shape}")
        print(f"y_train shape: {y_train.shape}")
        print(f"y_test shape: {y_test.shape}")
        
        # Scale features using StandardScaler
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Save scaler
        self.save_scaler()
        
        # Convert to numpy for model training
        X_train_scaled = np.array(X_train_scaled, dtype=np.float32)
        X_test_scaled = np.array(X_test_scaled, dtype=np.float32)
        y_train_arr = np.array(y_train.values, dtype=np.float32)
        y_test_arr = np.array(y_test.values, dtype=np.float32)
        
        print(f"Data scaling completed with StandardScaler")
        
        return X_train_scaled, X_test_scaled, y_train_arr, y_test_arr, feature_names
    
    def save_scaler(self, path=None):
        """
        Save the fitted scaler to a file using joblib.
        
        Args:
            path (str): Optional path to save scaler. Uses default if None.
        """
        if self.scaler is None:
            print("Scaler not fitted yet")
            return
        
        save_path = path or self.scaler_path
        joblib.dump(self.scaler, save_path)
        print(f"Scaler saved to {save_path}")
    
    def load_scaler(self, path=None):
        """
        Load a previously saved scaler.
        
        Args:
            path (str): Optional path to load scaler from. Uses default if None.
            
        Returns:
            StandardScaler: Loaded scaler object
        """
        load_path = path or self.scaler_path
        if not os.path.exists(load_path):
            print(f"Scaler file not found at {load_path}")
            return None
        
        self.scaler = joblib.load(load_path)
        print(f"Scaler loaded from {load_path}")
        return self.scaler
    
    def create_lstm_sequences(self, X, y, window_size=10):
        """
        Create sliding window sequences for LSTM model.
        
        Converts 2D data (samples, features) to 3D sequences (samples, window_size, features)
        by creating sliding windows of size window_size.
        
        This is crucial for LSTM as it requires temporal sequences. Each sequence consists
        of window_size consecutive samples, and the model predicts the target for the last sample.
        
        Args:
            X (np.ndarray): Feature matrix (samples, features)
            y (np.ndarray): Target vector (samples,)
            window_size (int): Number of timesteps in each sequence
            
        Returns:
            tuple: (X_sequences, y_sequences) with shapes
                   X_sequences: (num_sequences, window_size, features)
                   y_sequences: (num_sequences,)
        """
        X_sequences = []
        y_sequences = []
        
        for i in range(len(X) - window_size + 1):
            X_sequences.append(X[i:i + window_size])
            y_sequences.append(y[i + window_size - 1])
        
        X_sequences = np.array(X_sequences, dtype=np.float32)
        y_sequences = np.array(y_sequences, dtype=np.float32)
        
        print(f"\nLSTM sequences created:")
        print(f"X_sequences shape: {X_sequences.shape} (samples, window_size={window_size}, features)")
        print(f"y_sequences shape: {y_sequences.shape}")
        
        return X_sequences, y_sequences


def load_all_data(data_dir="data", test_size=0.2, random_state=42):
    """
    Convenience function to load all data in one call.
    
    Args:
        data_dir (str): Directory containing data
        test_size (float): Fraction of data for testing
        random_state (int): Random seed
        
    Returns:
        dict: Dictionary containing all data and metadata
    """
    loader = AutoMPGDataLoader(data_dir)
    X_train, X_test, y_train, y_test, feature_names = loader.load_and_preprocess(
        test_size=test_size, random_state=random_state
    )
    
    return {
        'X_train': X_train,
        'X_test': X_test,
        'y_train': y_train,
        'y_test': y_test,
        'feature_names': feature_names,
        'scaler': loader.scaler,
        'loader': loader
    }
