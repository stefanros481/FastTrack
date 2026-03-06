TIMESTAMP := $(shell date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR := backups
TMP_DIR := $(BACKUP_DIR)/.tmp
ARCHIVE := $(BACKUP_DIR)/backup-$(TIMESTAMP).zip

.PHONY: help backup

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

backup: ## Export database backup to zip
	@mkdir -p $(TMP_DIR)
	@bun run scripts/backup-db.ts $(TMP_DIR) || { rm -rf $(TMP_DIR); echo "Export failed"; exit 1; }
	@cd $(TMP_DIR) && zip -q ../backup-$(TIMESTAMP).zip *.json || { cd ../.. && rm -rf $(TMP_DIR) && rm -f $(ARCHIVE); echo "Zip failed"; exit 1; }
	@rm -rf $(TMP_DIR)
	@echo "Backup saved to $(ARCHIVE)"

PID_FILE := .next/dev.pid

.PHONY: dev dev-stop

dev: ## Start dev server in background
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "Dev server already running (PID $$(cat $(PID_FILE)))"; \
	else \
		bun run dev & echo $$! > $(PID_FILE); \
		echo "Dev server started (PID $$!)"; \
	fi

dev-stop: ## Stop dev server
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		kill $$(cat $(PID_FILE)) && rm -f $(PID_FILE); \
		echo "Dev server stopped"; \
	else \
		echo "No dev server running"; \
		rm -f $(PID_FILE); \
	fi

.PHONY: test test-watch test-coverage

test: ## Run tests
	@bun run test

test-watch: ## Run tests in watch mode
	@bun run test:watch

test-coverage: ## Run tests with coverage
	@bun run test:coverage
