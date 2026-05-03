from svm_app.iris_demo import main as iris_main
from svm_app.rbf_demo import main as rbf_main


def main() -> None:
    iris_main()
    print()
    print("=" * 60)
    print()
    rbf_main()


if __name__ == "__main__":
    main()
