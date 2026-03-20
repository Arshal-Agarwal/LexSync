User created -> User service creates user -> emits event using rabbuitMQ -> Auth user add user metadata

All services -> anything happens (any api call or errors) -> emit event using RabbitMQ -> Audit log service makes note in MySQL log db

All services -> api call -> logstash -> elasticsearch -> Syslog service