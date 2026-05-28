# 1. Start MySQL (only needed once per machine restart)
docker start vafis-mysql

# 2. Start the backend server (one terminal)
npm run dev:server

# 3. Start the frontend (another terminal)
npm run dev:client