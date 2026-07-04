import { composeK8sSecretName, isLocalClusterImage } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';
import { ComposeK8sServicePlan } from '../../compose/compose-plan.types';
import { buildProbesFromCompose } from '../../compose/healthcheck-probes';

export function buildComposeDeploymentBody(
  namespace: string,
  plan: ComposeK8sServicePlan,
  projectName: string,
): k8s.V1Deployment {
  const resourceName = plan.resourceName;
  const secretName = composeK8sSecretName(projectName, plan.name);
  const probes = buildProbesFromCompose(plan.image, plan.containerPort, plan.healthcheck);
  const envFrom =
    Object.keys(plan.environment).length > 0 ? [{ secretRef: { name: secretName } }] : undefined;
  const imagePullPolicy = isLocalClusterImage(plan.image) || plan.localImage ? 'Never' : 'IfNotPresent';
  const nginxConfigMapName = plan.nginxConfigMapName;
  const volumeMounts = [
    ...plan.volumeMounts.map((entry) => ({
      name: entry.name,
      mountPath: entry.mountPath,
    })),
    ...(nginxConfigMapName
      ? [
          {
            name: 'nginx-config',
            mountPath: '/etc/nginx/conf.d/default.conf',
            subPath: 'default.conf',
          },
        ]
      : []),
  ];
  const volumes = [
    ...plan.volumeMounts.map((entry) => ({
      name: entry.name,
      persistentVolumeClaim: {
        claimName: entry.name,
      },
    })),
    ...(nginxConfigMapName
      ? [
          {
            name: 'nginx-config',
            configMap: {
              name: nginxConfigMapName,
            },
          },
        ]
      : []),
  ];

  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: resourceName,
      namespace,
      labels: {
        'app.kubernetes.io/name': resourceName,
        'app.kubernetes.io/part-of': projectName,
      },
    },
    spec: {
      replicas: plan.replicas,
      selector: {
        matchLabels: {
          'app.kubernetes.io/name': resourceName,
        },
      },
      template: {
        metadata: {
          labels: {
            'app.kubernetes.io/name': resourceName,
            'app.kubernetes.io/part-of': projectName,
          },
        },
        spec: {
          containers: [
            {
              name: plan.name,
              image: plan.image,
              imagePullPolicy,
              ports: [{ containerPort: plan.containerPort }],
              envFrom,
              volumeMounts,
              ...probes,
            },
          ],
          volumes,
        },
      },
    },
  };
}
