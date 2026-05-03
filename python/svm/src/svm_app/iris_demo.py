from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_iris
from sklearn.decomposition import PCA
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC

OUTPUT_DIR = Path("outputs/iris")
COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c"]


def plot_dataset_overview(X: np.ndarray, y: np.ndarray, target_names: np.ndarray) -> Path:
    figure, axes = plt.subplots(1, 2, figsize=(12, 5))

    for class_id, class_name in enumerate(target_names):
        class_mask = y == class_id
        axes[0].scatter(
            X[class_mask, 0],
            X[class_mask, 1],
            label=class_name,
            alpha=0.75,
            color=COLORS[class_id],
        )
        axes[1].scatter(
            X[class_mask, 2],
            X[class_mask, 3],
            label=class_name,
            alpha=0.75,
            color=COLORS[class_id],
        )

    axes[0].set_title("Dataset before training")
    axes[0].set_xlabel("Sepal length")
    axes[0].set_ylabel("Sepal width")

    axes[1].set_title("Alternative feature view")
    axes[1].set_xlabel("Petal length")
    axes[1].set_ylabel("Petal width")

    handles, labels = axes[0].get_legend_handles_labels()
    figure.legend(handles, labels, loc="upper center", ncol=3, frameon=False)
    figure.tight_layout(rect=(0, 0, 1, 0.93))

    output_path = OUTPUT_DIR / "dataset_overview.png"
    figure.savefig(output_path, dpi=160)
    plt.close(figure)
    return output_path


def plot_train_test_projection(
    X_train_2d: np.ndarray,
    X_test_2d: np.ndarray,
    y_train: np.ndarray,
    y_test: np.ndarray,
    target_names: np.ndarray,
) -> Path:
    figure, axes = plt.subplots(1, 2, figsize=(12, 5), sharex=True, sharey=True)

    for axis, features, labels, title, marker in [
        (axes[0], X_train_2d, y_train, "Training set in 2D (PCA)", "o"),
        (axes[1], X_test_2d, y_test, "Test set in 2D (PCA)", "^"),
    ]:
        for class_id, class_name in enumerate(target_names):
            class_mask = labels == class_id
            axis.scatter(
                features[class_mask, 0],
                features[class_mask, 1],
                label=class_name,
                alpha=0.8,
                color=COLORS[class_id],
                marker=marker,
                edgecolors="black",
                linewidths=0.4,
            )
        axis.set_title(title)
        axis.set_xlabel("PCA 1")
        axis.set_ylabel("PCA 2")

    handles, labels = axes[0].get_legend_handles_labels()
    figure.legend(handles, labels, loc="upper center", ncol=3, frameon=False)
    figure.tight_layout(rect=(0, 0, 1, 0.93))

    output_path = OUTPUT_DIR / "train_test_projection.png"
    figure.savefig(output_path, dpi=160)
    plt.close(figure)
    return output_path


def plot_decision_boundary(
    axis: plt.Axes,
    model: SVC,
    X: np.ndarray,
    y: np.ndarray,
    target_names: np.ndarray,
    title: str,
) -> None:
    x_min, x_max = X[:, 0].min() - 0.8, X[:, 0].max() + 0.8
    y_min, y_max = X[:, 1].min() - 0.8, X[:, 1].max() + 0.8

    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, 300),
        np.linspace(y_min, y_max, 300),
    )
    grid = np.c_[xx.ravel(), yy.ravel()]
    zz = model.predict(grid).reshape(xx.shape)

    axis.contourf(xx, yy, zz, alpha=0.22, levels=np.arange(-0.5, 3.5, 1), cmap="viridis")

    for class_id, class_name in enumerate(target_names):
        class_mask = y == class_id
        axis.scatter(
            X[class_mask, 0],
            X[class_mask, 1],
            label=class_name,
            alpha=0.85,
            color=COLORS[class_id],
            edgecolors="black",
            linewidths=0.4,
        )

    axis.scatter(
        model.support_vectors_[:, 0],
        model.support_vectors_[:, 1],
        s=120,
        facecolors="none",
        edgecolors="black",
        linewidths=1.2,
        label="support vectors",
    )

    axis.set_title(title)
    axis.set_xlabel("PCA 1")
    axis.set_ylabel("PCA 2")


def plot_svm_boundary_adjustments(
    X_train_2d: np.ndarray,
    y_train: np.ndarray,
    target_names: np.ndarray,
) -> tuple[Path, list[dict[str, float | str]]]:
    configurations = [
        {"kernel": "linear", "C": 0.3},
        {"kernel": "linear", "C": 1.0},
        {"kernel": "linear", "C": 8.0},
        {"kernel": "rbf", "C": 1.0},
    ]

    figure, axes = plt.subplots(2, 2, figsize=(12, 10), sharex=True, sharey=True)
    summaries: list[dict[str, float | str]] = []

    for axis, config in zip(axes.flat, configurations):
        model = SVC(kernel=str(config["kernel"]), C=float(config["C"]), gamma="scale")
        model.fit(X_train_2d, y_train)
        accuracy = model.score(X_train_2d, y_train)
        support_count = len(model.support_vectors_)

        plot_decision_boundary(
            axis,
            model,
            X_train_2d,
            y_train,
            target_names,
            title=(
                f"kernel={config['kernel']} | C={config['C']}\n"
                f"train acc={accuracy:.2%} | support vectors={support_count}"
            ),
        )
        summaries.append(
            {
                "kernel": str(config["kernel"]),
                "C": float(config["C"]),
                "train_accuracy": accuracy,
                "support_vectors": support_count,
            }
        )

    handles, labels = axes[0, 0].get_legend_handles_labels()
    figure.legend(handles, labels, loc="upper center", ncol=4, frameon=False)
    figure.suptitle("Decision boundary being adjusted", fontsize=14)
    figure.tight_layout(rect=(0, 0, 1, 0.95))

    output_path = OUTPUT_DIR / "svm_boundary_adjustments.png"
    figure.savefig(output_path, dpi=160)
    plt.close(figure)
    return output_path, summaries


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    iris = load_iris()
    X_train, X_test, y_train, y_test = train_test_split(
        iris.data,
        iris.target,
        test_size=0.2,
        random_state=42,
        stratify=iris.target,
    )

    pca = PCA(n_components=2, random_state=42)
    X_train_2d = pca.fit_transform(X_train)
    X_test_2d = pca.transform(X_test)

    model = SVC(kernel="linear", C=1.0)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    overview_path = plot_dataset_overview(iris.data, iris.target, iris.target_names)
    projection_path = plot_train_test_projection(
        X_train_2d,
        X_test_2d,
        y_train,
        y_test,
        iris.target_names,
    )
    boundary_path, tuning_summaries = plot_svm_boundary_adjustments(
        X_train_2d,
        y_train,
        iris.target_names,
    )

    print("Iris SVM example")
    print(f"Dataset: Iris ({len(iris.data)} samples, {iris.data.shape[1]} features)")
    print("Classes:", ", ".join(iris.target_names))
    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")
    print(f"Base model: kernel=linear, C=1.0 | test accuracy={accuracy:.2%}")
    print()
    print("Generated visual files:")
    print(f"- {overview_path}")
    print(f"- {projection_path}")
    print(f"- {boundary_path}")
    print()
    print("2D decision boundary adjustments:")

    for summary in tuning_summaries:
        print(
            "- "
            f"kernel={summary['kernel']}, "
            f"C={summary['C']}, "
            f"train acc={summary['train_accuracy']:.2%}, "
            f"support vectors={summary['support_vectors']}"
        )

    print()
    print("Sample predictions:")
    for features, predicted, actual in zip(X_test[:5], predictions[:5], y_test[:5]):
        predicted_name = iris.target_names[predicted]
        actual_name = iris.target_names[actual]
        print(
            f"features={features.tolist()} -> predicted={predicted_name}, actual={actual_name}"
        )


if __name__ == "__main__":
    main()
