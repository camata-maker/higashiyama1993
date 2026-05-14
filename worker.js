const AUTH_COOKIE = 'auth1993';
const PASSWORD = '1993';

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>東山中学校 同窓会</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#1a1008;font-family:'Hiragino Mincho ProN',serif;}
  .box{background:rgba(253,250,245,.06);border:1px solid rgba(180,140,80,.3);
    padding:2.5rem 3rem;border-radius:4px;text-align:center;width:280px;}
  h1{color:rgba(255,242,200,.85);font-size:1rem;letter-spacing:.3em;margin:0 0 .4rem;}
  p{color:rgba(255,242,200,.45);font-size:.7rem;letter-spacing:.2em;margin:0 0 2rem;}
  input{width:100%;box-sizing:border-box;padding:.7rem;background:rgba(255,255,255,.05);
    border:1px solid rgba(180,140,80,.4);border-radius:2px;color:#fff;
    font-size:1.4rem;text-align:center;letter-spacing:.3em;outline:none;}
  input:focus{border-color:rgba(200,160,80,.8);}
  button{margin-top:1rem;width:100%;padding:.7rem;background:rgba(180,140,60,.25);
    border:1px solid rgba(180,140,60,.5);border-radius:2px;color:rgba(255,242,200,.85);
    font-size:.85rem;letter-spacing:.2em;cursor:pointer;}
  button:hover{background:rgba(180,140,60,.4);}
  .err{color:rgba(220,100,100,.8);font-size:.75rem;margin-top:.8rem;letter-spacing:.1em;}
</style>
</head>
<body>
<div class="box">
  <h1>東山中学校 同窓会</h1>
  <p>パスワードを入力してください</p>
  <form method="POST" action="/__auth">
    <input type="password" name="pw" placeholder="_ _ _ _" autofocus>
    <button type="submit">入 る</button>
    ERRMSG
  </form>
</div>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cookie = request.headers.get('Cookie') || '';
    const authed = cookie.includes(`${AUTH_COOKIE}=ok`);

    // 認証済み → アセット配信
    if (authed) {
      return env.ASSETS.fetch(request);
    }

    // POST: パスワード確認
    if (request.method === 'POST' && url.pathname === '/__auth') {
      const body = await request.text();
      const pw = new URLSearchParams(body).get('pw') || '';
      if (pw === PASSWORD) {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/',
            'Set-Cookie': `${AUTH_COOKIE}=ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
          },
        });
      }
      return new Response(
        LOGIN_HTML.replace('ERRMSG', '<p class="err">パスワードが違います</p>'),
        { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // 未認証 → ログインページ
    return new Response(
      LOGIN_HTML.replace('ERRMSG', ''),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  },
};
