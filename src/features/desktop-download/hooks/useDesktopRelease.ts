import { useQuery } from '@tanstack/react-query';
import type { GitHubRelease, GitHubAsset, OperatingSystem } from '../types/desktop-download.types';

const GITHUB_API_URL = 'https://api.github.com/repos/ponchovillalobos/maity-desktop/releases/latest';

export function detectOS(): OperatingSystem {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('win')) {
    return 'windows';
  }
  if (userAgent.includes('mac')) {
    return 'macos';
  }
  if (userAgent.includes('linux')) {
    return 'linux';
  }
  return 'unknown';
}

export function getAssetForOS(assets: GitHubAsset[], os: OperatingSystem): GitHubAsset | null {
  if (os === 'windows') {
    // Prefer .msi over .exe for Windows
    const msi = assets.find(a => a.name.endsWith('.msi'));
    if (msi) return msi;
    const exe = assets.find(a => a.name.endsWith('.exe') && !a.name.includes('setup'));
    if (exe) return exe;
    return assets.find(a => a.name.endsWith('.exe')) || null;
  }

  if (os === 'macos') {
    // Prefer .dmg for macOS
    const dmg = assets.find(a => a.name.endsWith('.dmg'));
    if (dmg) return dmg;
    return assets.find(a => a.name.endsWith('.app.tar.gz')) || null;
  }

  if (os === 'linux') {
    // Prefer AppImage for Linux
    const appImage = assets.find(a => a.name.endsWith('.AppImage'));
    if (appImage) return appImage;
    const deb = assets.find(a => a.name.endsWith('.deb'));
    if (deb) return deb;
    return assets.find(a => a.name.endsWith('.tar.gz') && !a.name.includes('.app')) || null;
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function fetchLatestRelease(): Promise<GitHubRelease> {
  const response = await fetch(GITHUB_API_URL, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch release: ${response.status}`);
  }

  return response.json();
}

export function useDesktopRelease() {
  const detectedOS = detectOS();

  const query = useQuery({
    queryKey: ['desktop-release'],
    queryFn: fetchLatestRelease,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const recommendedAsset = query.data
    ? getAssetForOS(query.data.assets, detectedOS)
    : null;

  const windowsAsset = query.data
    ? getAssetForOS(query.data.assets, 'windows')
    : null;

  const macosAsset = query.data
    ? getAssetForOS(query.data.assets, 'macos')
    : null;

  return {
    release: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    detectedOS,
    recommendedAsset,
    windowsAsset,
    macosAsset,
  };
}
