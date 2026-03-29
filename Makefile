IMAGE_NAME = dm-sandbox
CONTAINER_NAME = dm-sandbox
PORT = 7000
DB_NAME = dm
DB_USER = dm
DB_PASSWORD = dm
DB_PORT = 5432

all: build

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):$(PORT) \
		-e SERVICE_NAME=dm \
		-e HOST=0.0.0.0 \
		-e PORT=$(PORT) \
		-e SSL_CERT_PATH=/app/certs/dm.crt \
		-e SSL_KEY_PATH=/app/certs/dm.key \
		-e SSL_CA_PATH=/app/certs/ca.crt \
		-e USER_SERVICE_HOST=user \
		-e USER_SERVICE_PORT=7000 \
		-e SOCIAL_SERVICE_HOST=social \
		-e SOCIAL_SERVICE_PORT=7000 \
		-e DATABASE_URL=postgresql://$(DB_USER):$(DB_PASSWORD)@localhost:$(DB_PORT)/$(DB_NAME)?schema=public \
		-e DB_NAME=$(DB_NAME) \
		-e DB_USER=$(DB_USER) \
		-e DB_PASSWORD=$(DB_PASSWORD) \
		$(IMAGE_NAME) \
		npm start

run-dev:
	docker run --rm -it \
		--name $(CONTAINER_NAME) \
		-p $(PORT):$(PORT) \
		-v "$(CURDIR)":/app \
		-w /app \
		-e SERVICE_NAME=dm \
		-e HOST=0.0.0.0 \
		-e PORT=$(PORT) \
		-e SSL_CERT_PATH=/app/dm.crt \
		-e SSL_KEY_PATH=/app/dm.key \
		-e SSL_CA_PATH=/app/ca.crt \
		-e USER_SERVICE_HOST=user \
		-e USER_SERVICE_PORT=7000 \
		-e SOCIAL_SERVICE_HOST=social \
		-e SOCIAL_SERVICE_PORT=7000 \
		-e DATABASE_URL=postgresql://$(DB_USER):$(DB_PASSWORD)@localhost:$(DB_PORT)/$(DB_NAME)?schema=public \
		-e DB_NAME=$(DB_NAME) \
		-e DB_USER=$(DB_USER) \
		-e DB_PASSWORD=$(DB_PASSWORD) \
		$(IMAGE_NAME) \
		npm run dev

logs:
	docker logs -f $(CONTAINER_NAME)

stop:
	docker stop $(CONTAINER_NAME)

rm:
	docker rm -f $(CONTAINER_NAME)

re: rm build run

.PHONY: all build run run-dev logs stop rm re