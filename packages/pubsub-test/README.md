# To execute pubsub test
1. Change module name to the module your want in **/config/host-config.js**
Ex: const currentModule = moduleConst.NATS; /* .REDIS .KAFKA */
2. cd docker/
3. docker-compose up
4. npm test
