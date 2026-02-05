export interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  assets: GitHubAsset[];
  html_url: string;
}

export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'unknown';
