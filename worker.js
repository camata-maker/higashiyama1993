export default {
  async fetch(request, env) {
    const auth = request.headers.get('Authorization');

    if (auth) {
      const [scheme, encoded] = auth.split(' ');
      if (scheme === 'Basic' && encoded) {
        const decoded = atob(encoded);
        const password = decoded.split(':')[1];
        if (password === '1993') {
          return env.ASSETS.fetch(request);
        }
      }
    }

    return new Response('認証が必要です', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="東山中学校 同窓会"',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  },
};
