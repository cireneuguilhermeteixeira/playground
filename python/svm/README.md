# SVM Example with uv

Simple SVM example in Python using `uv`, with both text and visual output.

## Run

```bash
uv sync
uv run svm-app
```

## What it does

- Loads the Iris dataset from `scikit-learn`
- Shows what the dataset looks like before training
- Splits the data into training and test sets
- Reduces the data to 2 dimensions with PCA for visualization
- Trains `SVC` models with different settings
- Saves plots into `outputs/`

## Generated files

- `outputs/dataset_overview.png`: original dataset distribution
- `outputs/train_test_projection.png`: 2D projection for train and test samples
- `outputs/svm_boundary_adjustments.png`: decision boundary being adjusted
