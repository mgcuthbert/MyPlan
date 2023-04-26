export function getDomElement(id: string): HTMLElement {
  return document.getElementById(id)!;
}

export function getHostName(url: string): string {
  return new URL(url).hostname;
}
