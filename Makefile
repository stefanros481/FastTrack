TIMESTAMP := $(shell date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR := backups
TMP_DIR := $(BACKUP_DIR)/.tmp
ARCHIVE := $(BACKUP_DIR)/backup-$(TIMESTAMP).zip

.PHONY: backup

backup:
	@mkdir -p $(TMP_DIR)
	@bun run scripts/backup-db.ts $(TMP_DIR) || { rm -rf $(TMP_DIR); echo "Export failed"; exit 1; }
	@cd $(TMP_DIR) && zip -q ../backup-$(TIMESTAMP).zip *.json || { cd ../.. && rm -rf $(TMP_DIR) && rm -f $(ARCHIVE); echo "Zip failed"; exit 1; }
	@rm -rf $(TMP_DIR)
	@echo "Backup saved to $(ARCHIVE)"

.PHONY: test test-watch test-coverage

test:
	@bun run test

test-watch:
	@bun run test:watch

test-coverage:
	@bun run test:coverage
