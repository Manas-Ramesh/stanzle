# Stanzle Game Makefile
# Professional build and development commands

.PHONY: help install dev test clean build deploy

# Default target
help:
	@echo "Stanzle Game - Available Commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development server"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make build      - Build for production"
	@echo "  make deploy     - Deploy to production"

# Install dependencies
install:
	@echo "Installing dependencies..."
	python3 -m venv venv
	. venv/bin/activate && pip install -r requirements.txt
	@echo "Dependencies installed successfully!"

# Development server
dev:
	@echo "Starting development server..."
	. venv/bin/activate && python3 src/backend/app.py

# Run tests
test:
	@echo "Running tests..."
	. venv/bin/activate && pytest tests/ -v

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf build/
	rm -rf dist/
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	@echo "Clean complete!"

# Build for production
build: clean
	@echo "Building for production..."
	. venv/bin/activate && python3 -m pip install --upgrade pip
	. venv/bin/activate && pip install -r requirements.txt
	@echo "Build complete!"

# Deploy to production
deploy: build
	@echo "Deploying to production..."
	@echo "Deployment commands would go here..."
	@echo "Deploy complete!"

# Quick start (install + dev)
quickstart: install dev
