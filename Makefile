.DEFAULT_GOAL := help
SHELL := /usr/bin/env bash -euo pipefail
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

# ---------------------
# ENVIRONMENT VARIABLES
# ---------------------
# DEV_ENV := pnpm dotenv -e .env -e .env.local --
# TEST_ENV :=pnpm dotenv -e .env.test --


## Developer Commands

## Run Tests
.PHONY: test
test: docker-dependencies
	pnpm test

## Format the repo
.PHONY: format
format:
	pnpm prettier --write --list-different .

## Run just the docker depdendencies
docker-dependencies:
	docker compose -f $(ROOT_DIR)/docker-compose.yaml up --detach


## Repo Setup

## Install from fresh clone
.PHONY: install
install: setup-precommit
	pnpm install
	pnpm run precompile

.PHONY: pre-commit
setup-precommit:
	brew install pre-commit
	pre-commit install --install-hooks
	# pre-push needs to be instlaled seperately
	pre-commit install --hook-type pre-push






# # https://gist.github.com/prwhite/8168133#gistcomment-2278355
# # https://gist.github.com/prwhite/8168133#gistcomment-2749866
.PHONY: help
help:
	@printf "Usage\n\n";

	@awk '{ \
			if ($$0 ~ /^.PHONY: [a-zA-Z\-_0-9]+$$/) { \
				helpCommand = substr($$0, index($$0, ":") + 2); \
				if (helpMessage) { \
					printf "\033[36m%-30s\033[0m %s\n", \
						helpCommand, helpMessage; \
					helpMessage = ""; \
				} \
			} else if ($$0 ~ /^[a-zA-Z\-_0-9.]+:/) { \
				helpCommand = substr($$0, 0, index($$0, ":")); \
				if (helpMessage) { \
					printf "\033[36m%-30s\033[0m %s\n", \
						helpCommand, helpMessage; \
					helpMessage = ""; \
				} \
			} else if ($$0 ~ /^##/) { \
				if (helpMessage) { \
					helpMessage = helpMessage"\n                               "substr($$0, 3); \
				} else { \
					helpMessage = substr($$0, 3); \
				} \
			} else { \
				if (helpMessage) { \
					print "\n                     "helpMessage"\n" \
				} \
				helpMessage = ""; \
			} \
		}' \
		$(MAKEFILE_LIST)
