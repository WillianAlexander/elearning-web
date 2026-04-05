export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}
