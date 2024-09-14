# DOCKER
create_network:
	docker network create tia_network
	
run_container:
	docker run --network tia_network --name tia_psql -p 9898:5432 --env-file ".docker.env" -d postgres:16.2 

start_container:
	docker start tia_psql

create_db:
	docker exec tia_psql psql -U tiauser -c "create database tia;" 

exec_db:
	docker exec -it tia_psql psql -U tiauser