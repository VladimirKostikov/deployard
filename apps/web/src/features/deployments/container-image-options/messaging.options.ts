import { ContainerImageOption } from './types';

export const messagingImageOptions: ContainerImageOption[] = [
  { name: 'ActiveMQ', image: 'apache/activemq-classic:6.1.4', category: 'Messaging', icon: 'apache', defaultPort: 61616 },
  { name: 'Beanstalkd', image: 'schickling/beanstalkd:latest', category: 'Messaging', icon: 'beanstalk', defaultPort: 11300 },
  { name: 'EMQX', image: 'emqx/emqx:5.8.0', category: 'Messaging', icon: 'emqx', defaultPort: 1883 },
  { name: 'Kafka', image: 'confluentinc/cp-kafka:7.7.0', category: 'Messaging', icon: 'apachekafka', defaultPort: 9092 },
  { name: 'Mosquitto', image: 'eclipse-mosquitto:2.0', category: 'Messaging', icon: 'eclipsemqtt', defaultPort: 1883 },
  { name: 'NATS', image: 'nats:2.10-alpine', category: 'Messaging', icon: 'natsdotio', defaultPort: 4222 },
  { name: 'NSQ', image: 'nsqio/nsq:v1.3.0', category: 'Messaging', icon: 'nsq', defaultPort: 4150 },
  { name: 'Pulsar', image: 'apachepulsar/pulsar:3.3.2', category: 'Messaging', icon: 'apachepulsar', defaultPort: 6650 },
  { name: 'RabbitMQ', image: 'rabbitmq:4.0-management-alpine', category: 'Messaging', icon: 'rabbitmq', defaultPort: 5672 },
  { name: 'Redpanda', image: 'docker.redpanda.com/redpandadata/redpanda:v24.2.4', category: 'Messaging', icon: 'redpanda', defaultPort: 9092 },
  { name: 'VerneMQ', image: 'vernemq/vernemq:2.0.1', category: 'Messaging', icon: 'vernemq', defaultPort: 1883 },
  { name: 'ZeroMQ', image: 'zeromq/zeromq:4.3.5', category: 'Messaging', icon: 'zeromq', defaultPort: 5555 },
];
