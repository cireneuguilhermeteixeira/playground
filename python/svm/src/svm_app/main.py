from sklearn.datasets import load_iris
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC


def main() -> None:
    iris = load_iris()
    X_train, X_test, y_train, y_test = train_test_split(
        iris.data,
        iris.target,
        test_size=0.2,
        random_state=42,
        stratify=iris.target,
    )

    model = SVC(kernel="linear", C=1.0)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    print("SVM example application")
    print(f"Dataset: Iris ({len(iris.data)} samples)")
    print(f"Test accuracy: {accuracy:.2%}")
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
