export default {
  async fetch(request, env) {
    const auth = request.headers.get('Authorization') || '';

    if (auth.startsWith('Basic ')) {
      try {
        const decoded = atob(auth.slice(6));
        const colon = decoded.indexOf(':');
        const password = colon >= 0 ? decoded.slice(colon + 1) : decoded;
        if (password === '1993') {
          return env.ASSETS.fetch(request);
        }
      } catch (e) {}
    }

    return new Response('認証が必要です', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Higashiyama 1993"',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  },
};
