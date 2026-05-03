# SVM Example with uv

Simple SVM example in Python using `uv`, with both text and visual output.

## Run

```bash
uv sync
uv run svm-iris
uv run svm-rbf
```

## What it does

- Loads the Iris dataset from `scikit-learn`
- Shows what the dataset looks like before training
- Splits the data into training and test sets
- Reduces the data to 2 dimensions with PCA for visualization
- Trains `SVC` models with different settings
- Adds a nonlinear example where an RBF kernel is needed
- Illustrates a lifted 3D view for the nonlinear case
- Saves plots into `outputs/`

You can still run both together with:

```bash
uv run svm-app
```

## Generated files

Iris example:
- `outputs/iris/dataset_overview.png`: original dataset distribution
- `outputs/iris/train_test_projection.png`: 2D projection for train and test samples
- `outputs/iris/svm_boundary_adjustments.png`: decision boundary being adjusted

RBF example:
- `outputs/rbf/rbf_kernel_comparison.png`: linear vs RBF on a nonlinear dataset
- `outputs/rbf/rbf_lifted_view.png`: 3D lifted view used to explain the nonlinear separation
