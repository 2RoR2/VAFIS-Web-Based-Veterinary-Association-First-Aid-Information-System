# Start MySQL (only needed once per machine restart - i am using docker cuz i dont have XAMPP)
- if you using docker also, run this first (just for first time):
docker run --name vafis-mysql -e MYSQL_ROOT_PASSWORD= -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -e MYSQL_DATABASE=vafis -p 3306:3306 -d mysql:8
- then run this:
docker start vafis-mysql

# run the database first
- run this first:
npm run db:migrate   
- then run this:
npm run db:seed 

# Start the backend server (one terminal)
npm run dev:server

# Start the frontend (another terminal)
npm run dev:client