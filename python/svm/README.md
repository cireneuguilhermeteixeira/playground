# SVM Example with uv

This is a minimal Python application that trains an SVM classifier on the Iris dataset.

## Run

```bash
uv sync
uv run svm-app
```

## What it does

- Loads the Iris dataset from `scikit-learn`
- Splits the data into training and test sets
- Trains an `SVC` model
- Prints accuracy and a few sample predictions
