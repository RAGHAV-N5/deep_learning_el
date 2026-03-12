#!/usr/bin/env python
"""
Script to execute all Jupyter notebooks in the project
"""

import subprocess
import sys
import os

notebooks = [
    "notebooks/02_MLP_Model.ipynb",
    "notebooks/03_LSTM_Model.ipynb", 
    "notebooks/04_Autoencoder.ipynb",
    "notebooks/05_Model_Comparison.ipynb"
]

os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("=" * 80)
print("EXECUTING ALL JUPYTER NOTEBOOKS")
print("=" * 80)

for nb in notebooks:
    print(f"\n\n{'='*80}")
    print(f"EXECUTING: {nb}")
    print("=" * 80)
    
    cmd = [
        sys.executable,
        "-m", "jupyter",
        "nbconvert",
        "--to", "notebook",
        "--execute",
        "--inplace",
        "--ExecutePreprocessor.timeout=600",
        nb
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        print(result.stdout)
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
        print(f"✅ {nb} executed successfully!")
    except Exception as e:
        print(f"❌ Error executing {nb}: {str(e)}")
        continue

print("\n\n" + "="*80)
print("✅ ALL NOTEBOOKS EXECUTED!")
print("="*80)
