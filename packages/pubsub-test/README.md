# To execute pubsub test
1. Change module name to the module your want in **/config/host-config.js**
Ex: const currentModule = moduleConst.NATS; /* .REDIS .KAFKA */
3. docker-compose up -> run all redis/nats/kafka server
   docker-compose -f docker-compose-redis.yml up -> run redis server
   docker-compose -f docker-compose-nats.yml up -> run nats server
   docker-compose -f docker-compose-kafka.yml up -> run kafka server
4. npm test
