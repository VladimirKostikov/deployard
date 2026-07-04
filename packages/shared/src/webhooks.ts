export type DeployWebhookAction = 'update_image' | 'create';

export interface DeployWebhookRequest {
  action?: DeployWebhookAction;
  namespace: string;
  deployment: string;
  image: string;
  replicas?: number;
  containerPort?: number;
  cluster?: string;
}

export interface DeployWebhookResult {
  ok: true;
  action: DeployWebhookAction;
  namespace: string;
  deployment: string;
  image: string;
}
