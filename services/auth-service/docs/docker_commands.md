docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=lexsync \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16

