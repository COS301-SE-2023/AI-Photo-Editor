#!/bin/sh

os=$(uname)

if [ "$os" = "Darwin" ]; then
    echo "Running on macOS. Downloading Python build for macOS..."
    wget -O python.tar.gz "https://github.com/indygreg/python-build-standalone/releases/download/20230726/cpython-3.10.12+20230726-aarch64-apple-darwin-install_only.tar.gz"
elif [ "$os" = "Linux" ]; then
    echo "Running on Linux. Downloading Python build for Linux..."
    wget -O python.tar.gz "https://github.com/indygreg/python-build-standalone/releases/download/20230726/cpython-3.10.12+20230726-x86_64-unknown-linux-gnu-install_only.tar.gz"
else
    echo "Unsupported operating system: $os"
    exit 1
fi

extraction_dir="python"

echo "Finished downloading, extracting..."
mkdir -p python
tar -xzvf python.tar.gz python

echo "Checking Python version..."
version_output=$(python/bin/python3.10 --version 2>&1)

if [ $? -eq 0 ]; then
    echo "Python version check successful."
    echo "Output: $version_output"
else
    echo "Python version check failed."
    echo "Error: $version_output"
	exit 1
fi

echo "Installing langchain..."
version_output=$(python/bin/pip install langchain 2>&1)

echo "Installing openai..."
version_output=$(python/bin/pip install openai 2>&1)
