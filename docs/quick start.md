# Start MySQL (only needed once per machine restart - i am using docker cuz i dont have XAMPP)
- if you using docker also, run this first (just for first time):
docker run --name vafis-mysql -e MYSQL_ROOT_PASSWORD= -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -e MYSQL_DATABASE=vafis -p 3306:3306 -d mysql:8
- then run this:
docker start vafis-mysql

# populate the database
- run this first:
1. npm run db:seed   
2. npm run db:seed-users
    
- then run this:
npm run db:migrate 

# Start the backend server (one terminal)
npm run dev:server

# Start the frontend (another terminal)
npm run dev:client

# 
Use the Docker exec command to open a MySQL shell inside the container:
docker exec -it vafis-mysql mysql -u root vafis

Once inside the MySQL shell, run:
SHOW TABLES;

To see a table's structure:
DESCRIBE guides;

To exit the MySQL shell:
EXIT