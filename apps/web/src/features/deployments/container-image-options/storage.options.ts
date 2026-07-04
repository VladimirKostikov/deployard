import { ContainerImageOption } from './types';

export const storageImageOptions: ContainerImageOption[] = [
  { name: 'Garage', image: 'dxflrs/garage:v1.0.1', category: 'Storage', icon: 'garage', defaultPort: 3900 },
  { name: 'LakeFS', image: 'treeverse/lakefs:1.42.0', category: 'Storage', icon: 'lakefs', defaultPort: 8000 },
  { name: 'MinIO', image: 'minio/minio:RELEASE.2024-11-07T00-52-20Z', category: 'Storage', icon: 'minio', defaultPort: 9000 },
  { name: 'SeaweedFS', image: 'chrislusf/seaweedfs:3.79', category: 'Storage', icon: 'seaweedfs', defaultPort: 9333 },
];
