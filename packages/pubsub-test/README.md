# PubSub Test

The purpose of this module is to test various PubSub implementation under redis, nats, kafka,...

## Configuration

To change the target implementation (i.e. redis/nats/kafka/...) please update file:



# How To Execute Tests

1. Change module name to the module your want in **/config/host-config.js**
Ex: const currentModule = moduleConst.NATS; /* .REDIS .KAFKA */
3. docker-compose up -> run all redis/nats/kafka server
   docker-compose -f docker-compose-redis.yml up -> run redis server
   docker-compose -f docker-compose-nats.yml up -> run nats server
   docker-compose -f docker-compose-kafka.yml up -> run kafka server
4. npm test

# To see all current topic of kafka on docker by command line:
1. docker ps
2. docker exec -it <zookeeper-container-id> bash
3. cd bin
4. ./zkCli.sh
5. ls /brokers/topics
