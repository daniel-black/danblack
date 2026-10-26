// CloudFront Function (cloudfront-js-2.0), viewer request.
//   - Old URLs from the previous site 301 to their new homes.
//   - Extensionless paths without a trailing slash 301 to the slash version (the canonical URL).
//   - Directory URLs map to their index.html, since defaultRootObject only applies at "/".
//   - www 301s to the apex domain.
const REDIRECTS = {
  '/blog/variable-duty-cycle-square-wave': '/writing/variable-duty-cycle-square-wave/',
};

function querystring(request) {
  const qs = Object.keys(request.querystring)
    .map((k) => {
      const v = request.querystring[k];
      return v.value ? `${k}=${v.value}` : k;
    })
    .join('&');
  return qs ? `?${qs}` : '';
}

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: location } },
  };
}

function handler(event) {
  const request = event.request;
  const host = request.headers.host && request.headers.host.value;
  const uri = request.uri;

  if (host && host.startsWith('www.')) {
    return redirect(`https://${host.slice(4)}${uri}${querystring(request)}`);
  }

  const legacy = REDIRECTS[uri.replace(/\/$/, '')];
  if (legacy) return redirect(legacy + querystring(request));

  const hasExtension = uri.lastIndexOf('.') > uri.lastIndexOf('/');
  if (!hasExtension && !uri.endsWith('/')) return redirect(`${uri}/${querystring(request)}`);

  if (uri.endsWith('/')) request.uri = `${uri}index.html`;
  return request;
}
