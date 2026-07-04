import { ContainerImageOption } from './types';

export const devtoolsImageOptions: ContainerImageOption[] = [
  { name: 'Airflow', image: 'apache/airflow:2.10.3', category: 'DevTools', icon: 'apacheairflow', defaultPort: 8080 },
  { name: 'Artifactory OSS', image: 'releases-docker.jfrog.io/jfrog/artifactory-oss:7.98.9', category: 'DevTools', icon: 'jfrog', defaultPort: 8081 },
  { name: 'Code-Server', image: 'codercom/code-server:4.96.1', category: 'DevTools', icon: 'visualstudiocode', defaultPort: 8080 },
  { name: 'Confluence', image: 'atlassian/confluence:9.1.0', category: 'DevTools', icon: 'confluence', defaultPort: 8090 },
  { name: 'Docker Registry', image: 'registry:2.8', category: 'DevTools', icon: 'docker', defaultPort: 5000 },
  { name: 'GitLab Runner', image: 'gitlab/gitlab-runner:v17.6.0', category: 'DevTools', icon: 'gitlab', defaultPort: 9252 },
  { name: 'Harbor', image: 'goharbor/harbor-core:v2.11.0', category: 'DevTools', icon: 'harbor', defaultPort: 8080 },
  { name: 'Jira', image: 'atlassian/jira-software:10.3.0', category: 'DevTools', icon: 'jira', defaultPort: 8080 },
  { name: 'JupyterHub', image: 'jupyterhub/jupyterhub:5.2.1', category: 'DevTools', icon: 'jupyter', defaultPort: 8000 },
  { name: 'MLflow', image: 'ghcr.io/mlflow/mlflow:v2.18.0', category: 'DevTools', icon: 'mlflow', defaultPort: 5000 },
  { name: 'MkDocs', image: 'squidfunk/mkdocs-material:9.5.47', category: 'DevTools', icon: 'materialformkdocs', defaultPort: 8000 },
  { name: 'Nexus IQ', image: 'sonatype/nexus-iq-server:188', category: 'DevTools', icon: 'sonatype', defaultPort: 8070 },
  { name: 'Swagger UI', image: 'swaggerapi/swagger-ui:v5.18.2', category: 'DevTools', icon: 'swagger', defaultPort: 8080 },
  { name: 'TeamCity', image: 'jetbrains/teamcity-server:2024.07.3', category: 'DevTools', icon: 'teamcity', defaultPort: 8111 },
  { name: 'Tekton Dashboard', image: 'gcr.io/tekton-releases/dashboard/v0.53.0', category: 'DevTools', icon: 'tekton', defaultPort: 9097 },
  { name: 'YouTrack', image: 'jetbrains/youtrack:2024.3.55417', category: 'DevTools', icon: 'youtrack', defaultPort: 8080 },
];
