# Team Chat

La API está en `backend/`.

```bash
cd backend
npm install
npm run start:dev
```

Docker Compose desde la raíz:

```bash
docker compose -p team-chat-api -f backend/docker-compose.yml up --build
```

En Railway, configura el Root Directory del servicio de la API como `/backend`.
El Dockerfile y las migraciones están dentro de esa carpeta.
