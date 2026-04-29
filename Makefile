DOCKER := docker
COMPOSE := $(DOCKER) compose

DEV_ENV := --env-file .env.dev
PROD_ENV := --env-file .env.prod

DEV_FILES := -f compose.yaml -f compose.dev.yaml
PROD_FILES := -f compose.yaml -f compose.prod.yaml

DEV := $(COMPOSE) $(DEV_ENV) $(DEV_FILES)
PROD := $(COMPOSE) $(PROD_ENV) $(PROD_FILES)

COMPOSE_ARGS = $(if $(ARGS),$(ARGS),$(filter-out $@,$(MAKECMDGOALS)))

CONFIRM ?= no

.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo "Usage:"
	@echo ""
	@echo "Dev:"
	@echo "  make dev                  Start dev stack in foreground"
	@echo "  make dev-d                Start dev stack in background"
	@echo "  make dev-build            Build dev stack"
	@echo "  make dev-down             Stop dev stack"
	@echo "  make dev-clean            Stop dev stack and remove dev volumes"
	@echo "  make dev-logs             Show dev logs"
	@echo "  make dev-ps               Show dev containers"
	@echo "  make debug                Start debug container"
	@echo ""
	@echo "Prod:"
	@echo "  make prod                 Start prod stack in background"
	@echo "  make prod-build           Build prod stack"
	@echo "  make prod-down            Stop prod stack"
	@echo "  make prod-clean           Stop prod stack and remove prod volumes"
	@echo "  make prod-logs            Show prod logs"
	@echo "  make prod-ps              Show prod containers"
	@echo ""
	@echo "Compose passthrough:"
	@echo "  make dc ARGS=\"<compose args>\""
	@echo "  make dcp ARGS=\"<compose args>\""
	@echo ""
	@echo "Examples:"
	@echo "  make dc ARGS=\"exec ws-test sh\""
	@echo "  make dc ARGS=\"logs -f realtime\""
	@echo "  make dc ARGS=\"ps\""
	@echo "  make dc ARGS=\"down\""
	@echo ""
	@echo "Secrets:"
	@echo "  make secrets-dev          Generate dev secrets"
	@echo "  make secrets-prod         Generate prod secrets"
	@echo "  make secrets              Generate dev and prod secrets"
	@echo ""
	@echo "Danger zone:"
	@echo "  make nuke-volumes CONFIRM=YES"
	@echo "      Remove ALL Docker containers and ALL Docker volumes"
	@echo ""
	@echo "  make nuke CONFIRM=YES"
	@echo "      Remove containers, volumes, unused networks, unused images and build cache"

# =============================================================================
# Compose passthrough
# =============================================================================

.PHONY: dc
dc:
	$(DEV) $(COMPOSE_ARGS)

.PHONY: dcp
dcp:
	$(PROD) $(COMPOSE_ARGS)

# =============================================================================
# Dev stack
# =============================================================================

.PHONY: dev
dev:
	$(DEV) up --build

.PHONY: dev-d
dev-d:
	$(DEV) up --build -d

.PHONY: dev-build
dev-build:
	$(DEV) build

.PHONY: dev-down
dev-down:
	$(DEV) down

.PHONY: dev-clean
dev-clean:
	$(DEV) down -v --remove-orphans

.PHONY: dev-logs
dev-logs:
	$(DEV) logs -f

.PHONY: dev-ps
dev-ps:
	$(DEV) ps

.PHONY: debug
debug:
	$(DEV) --profile debug up -d debug

# =============================================================================
# Prod stack
# =============================================================================

.PHONY: prod
prod:
	$(PROD) up --build -d

.PHONY: prod-build
prod-build:
	$(PROD) build

.PHONY: prod-down
prod-down:
	$(PROD) down

.PHONY: prod-clean
prod-clean:
	$(PROD) down -v --remove-orphans

.PHONY: prod-logs
prod-logs:
	$(PROD) logs -f

.PHONY: prod-ps
prod-ps:
	$(PROD) ps

# =============================================================================
# Secrets
# =============================================================================

.PHONY: secrets
secrets:
	./scripts/generate-secrets.sh all

.PHONY: secrets-dev
secrets-dev:
	./scripts/generate-secrets.sh dev

.PHONY: secrets-prod
secrets-prod:
	./scripts/generate-secrets.sh prod

# =============================================================================
# Dangerous cleanup
# =============================================================================

.PHONY: guard-nuke
guard-nuke:
	@test "$(CONFIRM)" = "YES" || ( \
		echo "Refus: cible destructive."; \
		echo "Relance avec CONFIRM=YES si tu veux vraiment tout supprimer."; \
		exit 1; \
	)

.PHONY: nuke-volumes
nuke-volumes: guard-nuke
	@echo "Removing ALL Docker containers..."
	@$(DOCKER) ps -aq | xargs -r $(DOCKER) rm -f
	@echo "Removing ALL Docker volumes..."
	@$(DOCKER) volume ls -q | xargs -r $(DOCKER) volume rm

.PHONY: nuke
nuke: guard-nuke
	@echo "Removing ALL Docker containers..."
	@$(DOCKER) ps -aq | xargs -r $(DOCKER) rm -f
	@echo "Pruning Docker system, including volumes..."
	@$(DOCKER) system prune -af --volumes
	@echo "Pruning Docker build cache..."
	-@$(DOCKER) builder prune -af

%:
	@: