"""
FastAPI Application for Fuel Consumption Prediction

This application provides REST API endpoints for predicting fuel consumption (MPG)
using the best trained deep learning model.

Endpoints:
- GET /: Health check
- POST /predict: Single vehicle prediction
- POST /predict-batch: Batch predictions
- GET /health: Detailed health information

The application:
1. Loads the best trained model
2. Loads the fitted scaler for feature normalization
3. Validates input data
4. Makes predictions
5. Returns results with confidence information
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np
import tensorflow as tf
import joblib
import os
import sys
from datetime import datetime

# Add utils to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(
    title="Fuel Consumption Prediction API",
    description="Deep Learning based prediction system for vehicle fuel consumption",
    version="1.0.0"
)


class VehicleFeatures(BaseModel):
    """
    Input schema for vehicle features.
    
    All features must be numeric and normalized appropriately.
    """
    cylinders: float = Field(..., ge=3, le=8, description="Number of cylinders (3-8)")
    displacement: float = Field(..., gt=0, description="Engine displacement in cubic inches")
    horsepower: float = Field(..., gt=0, description="Horsepower")
    weight: float = Field(..., gt=0, description="Vehicle weight in pounds")
    acceleration: float = Field(..., gt=0, description="Acceleration time 0-60 mph in seconds")
    model_year: int = Field(..., ge=70, le=82, description="Model year (70s-82)")
    origin: int = Field(..., ge=1, le=3, description="Origin (1=USA, 2=Europe, 3=Japan)")


class PredictionResponse(BaseModel):
    """Output schema for predictions."""
    predicted_mpg: float = Field(..., description="Predicted fuel consumption (MPG)")
    prediction_confidence: str = Field(..., description="Confidence level of prediction")
    model_used: str = Field(..., description="Model architecture used")
    input_features: dict = Field(..., description="Echoed input features")
    timestamp: str = Field(..., description="Prediction timestamp")


class BatchPredictionResponse(BaseModel):
    """Output schema for batch predictions."""
    predictions: List[PredictionResponse]
    total_requests: int
    successful_predictions: int


# Global variables for models
model = None
scaler = None
feature_names = None
FEATURE_ORDER = ['cylinders', 'displacement', 'horsepower', 'weight', 
                 'acceleration', 'model_year', 'origin']


def load_model_and_scaler():
    """
    Load the best trained model and scaler from disk.
    
    The model should be trained and saved using one of the training scripts.
    Currently attempts to load MLP model (can be changed to best performing model).
    
    Returns:
        tuple: (model, scaler) or (None, None) if loading fails
    """
    global model, scaler
    
    try:
        model_path = "models/mlp_model.h5"
        scaler_path = "data/scaler.pkl"
        
        if not os.path.exists(model_path):
            print(f"Model not found at {model_path}")
            print("Run training scripts first: python training/train_mlp.py")
            return None, None
        
        if not os.path.exists(scaler_path):
            print(f"Scaler not found at {scaler_path}")
            print("Run training scripts first: python training/train_mlp.py")
            return None, None
        
        # Load model
        model = tf.keras.models.load_model(model_path)
        print(f"✓ Model loaded from {model_path}")
        
        # Load scaler
        scaler = joblib.load(scaler_path)
        print(f"✓ Scaler loaded from {scaler_path}")
        
        return model, scaler
        
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None


@app.on_event("startup")
def startup_event():
    """Load model and scaler when application starts."""
    global model, scaler
    model, scaler = load_model_and_scaler()
    if model is None or scaler is None:
        print("⚠ Warning: Model or scaler could not be loaded")
    else:
        print("✓ Application ready for predictions")


@app.get("/")
def read_root():
    """Health check endpoint."""
    model_available = model is not None and scaler is not None
    return {
        "status": "healthy" if model_available else "error",
        "service": "Fuel Consumption Prediction API",
        "version": "1.0.0",
        "model_loaded": model_available
    }


@app.get("/health")
def health_check():
    """Detailed health check with model information."""
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model": "Multilayer Perceptron (MLP)",
        "features": FEATURE_ORDER,
        "num_features": len(FEATURE_ORDER),
        "model_status": "ready for predictions"
    }


def validate_and_prepare_features(features: VehicleFeatures) -> np.ndarray:
    """
    Validate and prepare features for prediction.
    
    Args:
        features: VehicleFeatures object with input data
        
    Returns:
        np.ndarray: Scaled features ready for model prediction
        
    Raises:
        ValueError: If input validation fails
    """
    try:
        # Create feature array in correct order
        feature_values = [
            features.cylinders,
            features.displacement,
            features.horsepower,
            features.weight,
            features.acceleration,
            features.model_year,
            features.origin
        ]
        
        # Convert to numpy array
        X = np.array([feature_values], dtype=np.float32)
        
        # Scale features using loaded scaler
        if scaler is None:
            raise ValueError("Scaler not loaded")
        
        X_scaled = scaler.transform(X)
        
        return X_scaled
        
    except Exception as e:
        raise ValueError(f"Feature preparation failed: {str(e)}")


def get_prediction_confidence(predicted_mpg: float) -> str:
    """
    Determine confidence level based on predicted value.
    
    MPG for this dataset typically ranges 9-47.
    Out-of-range predictions get lower confidence.
    
    Args:
        predicted_mpg: Model's predicted MPG value
        
    Returns:
        str: Confidence level (High, Medium, Low)
    """
    if 15 <= predicted_mpg <= 35:
        return "High"
    elif 10 <= predicted_mpg <= 40:
        return "Medium"
    else:
        return "Low"


@app.post("/predict", response_model=PredictionResponse)
def predict(features: VehicleFeatures):
    """
    Make a single fuel consumption prediction.
    
    Accepts vehicle features and returns predicted MPG (fuel consumption).
    
    Args:
        features: VehicleFeatures with cylinders, displacement, horsepower, etc.
        
    Returns:
        PredictionResponse: Predicted MPG with confidence and metadata
    """
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run training scripts first.")
    
    try:
        # Prepare features
        X_scaled = validate_and_prepare_features(features)
        
        # Make prediction
        prediction = model.predict(X_scaled, verbose=0)
        predicted_mpg = float(prediction[0, 0])
        
        # Ensure non-negative prediction
        predicted_mpg = max(predicted_mpg, 0)
        
        # Determine confidence
        confidence = get_prediction_confidence(predicted_mpg)
        
        return PredictionResponse(
            predicted_mpg=round(predicted_mpg, 2),
            prediction_confidence=confidence,
            model_used="Multilayer Perceptron (MLP)",
            input_features=features.dict(),
            timestamp=datetime.now().isoformat()
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict-batch", response_model=BatchPredictionResponse)
def predict_batch(features_list: List[VehicleFeatures]):
    """
    Make batch fuel consumption predictions.
    
    Processes multiple vehicles at once. Useful for bulk predictions.
    
    Args:
        features_list: List of VehicleFeatures for multiple vehicles
        
    Returns:
        BatchPredictionResponse: List of predictions with summary
    """
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if len(features_list) == 0:
        raise HTTPException(status_code=400, detail="Empty features list")
    
    if len(features_list) > 1000:
        raise HTTPException(status_code=400, detail="Batch size exceeds limit (1000)")
    
    predictions = []
    successful = 0
    
    for features in features_list:
        try:
            X_scaled = validate_and_prepare_features(features)
            prediction = model.predict(X_scaled, verbose=0)
            predicted_mpg = float(prediction[0, 0])
            predicted_mpg = max(predicted_mpg, 0)
            confidence = get_prediction_confidence(predicted_mpg)
            
            predictions.append(PredictionResponse(
                predicted_mpg=round(predicted_mpg, 2),
                prediction_confidence=confidence,
                model_used="Multilayer Perceptron (MLP)",
                input_features=features.dict(),
                timestamp=datetime.now().isoformat()
            ))
            successful += 1
            
        except Exception as e:
            # Skip failed predictions, continue with others
            print(f"Prediction failed for one sample: {str(e)}")
    
    return BatchPredictionResponse(
        predictions=predictions,
        total_requests=len(features_list),
        successful_predictions=successful
    )


@app.get("/api/info")
def api_info():
    """Get information about the API and model."""
    return {
        "service_name": "Fuel Consumption Prediction API",
        "version": "1.0.0",
        "description": "Deep Learning based prediction system using MLP",
        "endpoints": {
            "GET /": "Health check",
            "GET /health": "Detailed health information",
            "POST /predict": "Single vehicle prediction",
            "POST /predict-batch": "Batch predictions (up to 1000)",
            "GET /api/info": "API information"
        },
        "required_features": FEATURE_ORDER,
        "model_type": "Multilayer Perceptron",
        "target_variable": "MPG (Miles Per Gallon)",
        "typical_range": "9-47 MPG"
    }


if __name__ == "__main__":
    import uvicorn
    
    print("""
    ╔═══════════════════════════════════════════════════════════════════╗
    ║    Fuel Consumption Prediction API - Deep Learning Backend        ║
    ╚════════════════════════════════════════════════════════════════════╝
    
    Starting FastAPI server...
    
    API Documentation:
    - Swagger UI: http://localhost:8000/docs
    - ReDoc: http://localhost:8000/redoc
    
    Endpoints:
    - Health: GET http://localhost:8000/health
    - Prediction: POST http://localhost:8000/predict
    - Batch: POST http://localhost:8000/predict-batch
    """)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
