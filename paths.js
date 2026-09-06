import { basePath } from './site-config.js';

// Keep navigation and assets inside the deployment, including project Pages URLs.
export function sitePath(value = '') {
  const input = String(value);
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(input)) return input;
  const pathname = '/' + input.replace(/^\.\//, '').replace(/^\/+/, '');
  if (basePath && (pathname === basePath || pathname.startsWith(basePath + '/'))) return pathname;
  return basePath + pathname;
}
