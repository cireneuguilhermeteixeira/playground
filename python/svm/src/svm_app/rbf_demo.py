from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import make_circles
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC

OUTPUT_DIR = Path("outputs/rbf")


def plot_binary_decision_boundary(
    axis: plt.Axes,
    model: SVC,
    X: np.ndarray,
    y: np.ndarray,
    title: str,
) -> None:
    x_min, x_max = X[:, 0].min() - 0.4, X[:, 0].max() + 0.4
    y_min, y_max = X[:, 1].min() - 0.4, X[:, 1].max() + 0.4

    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, 400),
        np.linspace(y_min, y_max, 400),
    )
    grid = np.c_[xx.ravel(), yy.ravel()]
    decision = model.decision_function(grid).reshape(xx.shape)

    axis.contourf(xx, yy, decision > 0, alpha=0.18, levels=[-1, 0, 1], cmap="coolwarm")
    axis.contour(xx, yy, decision, levels=[0], colors="black", linewidths=2)
    axis.contour(xx, yy, decision, levels=[-1, 1], colors="gray", linewidths=1, linestyles="--")

    for class_id, class_name, color in [
        (0, "outer ring", "#1f77b4"),
        (1, "inner ring", "#d62728"),
    ]:
        class_mask = y == class_id
        axis.scatter(
            X[class_mask, 0],
            X[class_mask, 1],
            label=class_name,
            color=color,
            alpha=0.8,
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
    axis.set_xlabel("x1")
    axis.set_ylabel("x2")


def plot_rbf_kernel_comparison() -> tuple[np.ndarray, np.ndarray, Path, list[dict[str, float | str]]]:
    X, y = make_circles(n_samples=240, factor=0.42, noise=0.07, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y,
    )

    models = [
        ("linear", SVC(kernel="linear", C=1.0)),
        ("rbf", SVC(kernel="rbf", C=1.0, gamma="scale")),
    ]

    figure, axes = plt.subplots(1, 2, figsize=(12, 5), sharex=True, sharey=True)
    summaries: list[dict[str, float | str]] = []

    for axis, (name, model) in zip(axes, models):
        model.fit(X_train, y_train)
        train_accuracy = model.score(X_train, y_train)
        test_accuracy = model.score(X_test, y_test)
        support_count = len(model.support_vectors_)

        plot_binary_decision_boundary(
            axis,
            model,
            X_train,
            y_train,
            (
                f"{name.upper()} kernel in 2D\n"
                f"train acc={train_accuracy:.2%} | test acc={test_accuracy:.2%}"
            ),
        )
        summaries.append(
            {
                "kernel": name,
                "train_accuracy": train_accuracy,
                "test_accuracy": test_accuracy,
                "support_vectors": support_count,
            }
        )

    handles, labels = axes[0].get_legend_handles_labels()
    figure.legend(handles, labels, loc="upper center", ncol=3, frameon=False)
    figure.suptitle("Nonlinear dataset: linear vs RBF kernel", fontsize=14)
    figure.tight_layout(rect=(0, 0, 1, 0.93))

    output_path = OUTPUT_DIR / "rbf_kernel_comparison.png"
    figure.savefig(output_path, dpi=160)
    plt.close(figure)
    return X_train, y_train, output_path, summaries


def plot_rbf_lifted_view(X: np.ndarray, y: np.ndarray) -> Path:
    lifted_z = X[:, 0] ** 2 + X[:, 1] ** 2

    figure = plt.figure(figsize=(11, 5))
    axis_2d = figure.add_subplot(1, 2, 1)
    axis_3d = figure.add_subplot(1, 2, 2, projection="3d")

    for class_id, class_name, color in [
        (0, "outer ring", "#1f77b4"),
        (1, "inner ring", "#d62728"),
    ]:
        class_mask = y == class_id
        axis_2d.scatter(
            X[class_mask, 0],
            X[class_mask, 1],
            label=class_name,
            color=color,
            alpha=0.8,
            edgecolors="black",
            linewidths=0.4,
        )
        axis_3d.scatter(
            X[class_mask, 0],
            X[class_mask, 1],
            lifted_z[class_mask],
            label=class_name,
            color=color,
            alpha=0.8,
            edgecolors="black",
            linewidths=0.3,
        )

    axis_2d.set_title("Original nonlinear dataset in 2D")
    axis_2d.set_xlabel("x1")
    axis_2d.set_ylabel("x2")

    axis_3d.set_title("Illustrative lifted view: z = x1^2 + x2^2")
    axis_3d.set_xlabel("x1")
    axis_3d.set_ylabel("x2")
    axis_3d.set_zlabel("radial lift")
    axis_3d.view_init(elev=22, azim=-55)

    handles, labels = axis_2d.get_legend_handles_labels()
    figure.legend(handles, labels, loc="upper center", ncol=2, frameon=False)
    figure.suptitle("Why a higher-dimensional view helps the RBF intuition", fontsize=14)
    figure.tight_layout(rect=(0, 0, 1, 0.93))

    output_path = OUTPUT_DIR / "rbf_lifted_view.png"
    figure.savefig(output_path, dpi=160)
    plt.close(figure)
    return output_path


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    X_train, y_train, comparison_path, summaries = plot_rbf_kernel_comparison()
    lifted_path = plot_rbf_lifted_view(X_train, y_train)

    print("RBF SVM example")
    print("Dataset: concentric circles (synthetic nonlinear data)")
    print()
    print("Generated visual files:")
    print(f"- {comparison_path}")
    print(f"- {lifted_path}")
    print()
    print("Kernel comparison:")
    for summary in summaries:
        print(
            "- "
            f"kernel={summary['kernel']}, "
            f"train acc={summary['train_accuracy']:.2%}, "
            f"test acc={summary['test_accuracy']:.2%}, "
            f"support vectors={summary['support_vectors']}"
        )

    print()
    print("Note: the 3D lift is an illustrative radial transform, not the exact RBF feature map.")


if __name__ == "__main__":
    main()
