.PHONY: install dev build lint test test-integration test-e2e
.PHONY: install-tools doctor
.PHONY: cluster-up cluster-down seed-demo demo-build demo-load demo-up demo-down
.PHONY: docker-build docker-up docker-down docker-logs docker-postgres-up

COMPOSE_FILE    := deploy/docker/compose.yml
COMPOSE_DOCKER_SOCK := deploy/docker/compose.docker-sock.yml
DOCKER_SOCKET_ENABLED ?= true
COMPOSE         := docker compose --env-file .env -f $(COMPOSE_FILE)

CLUSTER_NAME    ?= dpd-local
KUBE_CONTEXT    ?= $(shell kubectl config current-context 2>/dev/null)

KIND_CONFIG     := examples/kubernetes/kind-config.yaml
DEMO_K8S_DIR    := demo/demo-shop/kubernetes
DEMO_API_IMAGE  := demo-shop-api:local
DEMO_WEB_IMAGE  := demo-shop-web:local
.PHONY: helm-lint helm-install helm-uninstall kind-load-images
.PHONY: deploy-image

HELM_CHART       := deploy/helm/dpd
HELM_RELEASE     ?= dpd


install:
	pnpm install

dev:
	pnpm run dev

build:
	pnpm run build

build-app:
	pnpm --filter @dpd/shared build
	pnpm --filter @dpd/api --filter @dpd/web run build

lint:
	pnpm run lint

test:
	pnpm run test

test-integration:
	API_BASE_URL=http://localhost:3000/api pnpm --filter @dpd/integration-tests test

test-e2e:
	E2E_BASE_URL=http://localhost:5173 pnpm --filter @dpd/e2e test


install-tools:
	@command -v kind    >/dev/null 2>&1 || brew install kind
	@command -v kubectl >/dev/null 2>&1 || brew install kubectl

doctor:
	@echo "docker:  $$(command -v docker >/dev/null && docker info >/dev/null 2>&1 && echo OK || echo MISSING)"
	@echo "kubectl: $$(command -v kubectl >/dev/null && echo OK || echo MISSING)"
	@echo "kind:    $$(command -v kind >/dev/null && echo OK || echo MISSING)"
	@echo "context: $$(kubectl config current-context 2>/dev/null || echo NONE)"
	@echo "cluster: $$(kubectl cluster-info 2>/dev/null | head -1 || echo UNAVAILABLE)"


cluster-up: install-tools
	@docker info >/dev/null 2>&1 || (echo "Docker is not running. Start Docker Desktop first." && exit 1)
	kind create cluster \
		--name $(CLUSTER_NAME) \
		--config $(KIND_CONFIG) \
		2>/dev/null || true
	kubectl cluster-info --context kind-$(CLUSTER_NAME)
	kubectl config use-context kind-$(CLUSTER_NAME)

cluster-down:
	kind delete cluster --name $(CLUSTER_NAME)

seed-demo: demo-load
	@test -n "$(KUBE_CONTEXT)" || (echo "No kubectl context. Run: make cluster-up" && exit 1)
	kubectl apply \
		--context $(KUBE_CONTEXT) \
		--filename $(DEMO_K8S_DIR)/secret.yaml
	kubectl apply \
		--context $(KUBE_CONTEXT) \
		--filename $(DEMO_K8S_DIR)/
	kubectl rollout status deployment/demo-db --context $(KUBE_CONTEXT) --timeout=120s
	kubectl rollout status deployment/demo-api --context $(KUBE_CONTEXT) --timeout=180s
	kubectl rollout status deployment/demo-web --context $(KUBE_CONTEXT) --timeout=120s

demo-build:
	docker build -t $(DEMO_API_IMAGE) -f demo/demo-shop/docker/api.Dockerfile demo/demo-shop
	docker build -t $(DEMO_WEB_IMAGE) -f demo/demo-shop/docker/web.Dockerfile demo/demo-shop

demo-load: demo-build
	kind load docker-image $(DEMO_API_IMAGE) --name $(CLUSTER_NAME)
	kind load docker-image $(DEMO_WEB_IMAGE) --name $(CLUSTER_NAME)

demo-up:
	docker compose -f demo/demo-shop/compose.yml up --build -d

demo-down:
	docker compose -f demo/demo-shop/compose.yml down


docker-postgres-up:
	$(COMPOSE) up --detach postgres

docker-build:
	$(COMPOSE) build

docker-up:
ifeq ($(DOCKER_SOCKET_ENABLED),true)
	$(COMPOSE) -f $(COMPOSE_DOCKER_SOCK) up --build -d
else
	$(COMPOSE) up --build -d
endif

docker-down:
	$(COMPOSE) down

docker-logs:
	$(COMPOSE) logs --follow


kind-load-images:
	kind load docker-image docker-api:latest --name $(CLUSTER_NAME)
	kind load docker-image docker-web:latest --name $(CLUSTER_NAME)

helm-lint:
	helm lint $(HELM_CHART)

helm-install: kind-load-images
	helm upgrade --install $(HELM_RELEASE) $(HELM_CHART) \
		--namespace dpd \
		--create-namespace \
		--wait

helm-uninstall:
	helm uninstall $(HELM_RELEASE) --namespace dpd

deploy-image:
	@test -n "$(IMAGE)" || (echo "Usage: make deploy-image NAMESPACE=default DEPLOYMENT=demo-api IMAGE=demo-shop-api:local-v2" && exit 1)
	DEPLOY_WEBHOOK_URL=$${DEPLOY_WEBHOOK_URL:-http://localhost:18480/api} \
	DEPLOY_WEBHOOK_SECRET=$${DEPLOY_WEBHOOK_SECRET:-dev-deploy-webhook-secret} \
	DEPLOY_CLUSTER=$(CLUSTER) \
	./scripts/deploy/apply-image.sh \
		--namespace $(NAMESPACE) \
		--deployment $(DEPLOYMENT) \
		--image $(IMAGE) \
		$(if $(CLUSTER),--cluster $(CLUSTER),)
