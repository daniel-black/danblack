// CloudFront Function (cloudfront-js-2.0), viewer-request.
// Redirects www → apex, and maps directory-style URLs to index.html
// since defaultRootObject only applies at "/".
function handler(event) {
  var request = event.request;
  var host = request.headers.host && request.headers.host.value;

  if (host && host.indexOf('www.') === 0) {
    var qs = Object.keys(request.querystring)
      .map(function (k) {
        var v = request.querystring[k];
        return v.value ? k + '=' + v.value : k;
      })
      .join('&');
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://' + host.slice(4) + request.uri + (qs ? '?' + qs : '') },
      },
    };
  }

  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (uri.lastIndexOf('.') <= uri.lastIndexOf('/')) {
    request.uri = uri + '/index.html';
  }
  return request;
}
