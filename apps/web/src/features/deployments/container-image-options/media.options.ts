import { ContainerImageOption } from './types';

export const mediaImageOptions: ContainerImageOption[] = [
  { name: 'Emby', image: 'emby/embyserver:4.9.0.31', category: 'Media', icon: 'emby', defaultPort: 8096 },
  { name: 'Jellyfin', image: 'jellyfin/jellyfin:10.10.3', category: 'Media', icon: 'jellyfin', defaultPort: 8096 },
  { name: 'Plex', image: 'plexinc/pms-docker:1.41.3.9314-a0bfb8370', category: 'Media', icon: 'plex', defaultPort: 32400 },
  { name: 'Radarr', image: 'lscr.io/linuxserver/radarr:5.16.0', category: 'Media', icon: 'radarr', defaultPort: 7878 },
  { name: 'Sonarr', image: 'lscr.io/linuxserver/sonarr:4.0.11', category: 'Media', icon: 'sonarr', defaultPort: 8989 },
  { name: 'Transmission', image: 'lscr.io/linuxserver/transmission:4.0.6', category: 'Media', icon: 'transmission', defaultPort: 9091 },
];
