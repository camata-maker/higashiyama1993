/**
 * 同窓会ギャラリー写真アップロード用 GAS Web App
 * ─────────────────────────────────────────────
 * 保存先フォルダ（公開）：東山中14期生同窓会_ギャラリー写真
 *   https://drive.google.com/drive/folders/1vteMlHHeiE38MFAYcY_ZkuDDJEyatdPF
 * 保存先フォルダ（非公開）：東山中14期生同窓会_ギャラリー写真_非公開
 *   https://drive.google.com/drive/folders/1ntxOf1uNVN57IFx8AqDRIzk1vSdPr05U
 *   （どちらも wwscamata@gmail.com のマイドライブ内に作成済み）
 *
 * 「非公開にする」は写真を非公開フォルダへ移動するだけで、
 * 共有リンク自体は無効化されません（URLを直接知っていれば見られます）。
 * 公開ギャラリー（gallery/index.html）の一覧には出なくなります。
 *
 * 【デプロイ手順】
 * 1. https://script.google.com/ で新規プロジェクトを作成し、
 *    このファイルの内容を貼り付ける（wwscamata@gmail.com でログインした状態で）
 * 2. 「デプロイ」→「新しいデプロイ」
 *      種類：ウェブアプリ
 *      実行するユーザー：自分（Me）
 *      アクセスできるユーザー：全員（Anyone）
 *    でデプロイし、発行された /exec で終わるURLをコピーする
 * 3. gallery-upload.html・gallery/index.html 内の GAS_URL にそのURLを設定する
 * 4. コードを変更した場合は「新しいデプロイ」ではなく
 *    既存デプロイの「編集」→バージョン「新規」で再デプロイすること
 *    （URLを変えずに更新できる）
 */

const FOLDER_ID = '1vteMlHHeiE38MFAYcY_ZkuDDJEyatdPF';
const HIDDEN_FOLDER_ID = '1ntxOf1uNVN57IFx8AqDRIzk1vSdPr05U';
const SHARED_PASSWORD = 'kan2027';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.password !== SHARED_PASSWORD) {
      return json({ ok: false, error: 'パスワードが違います' });
    }

    if (body.action === 'list') {
      // 幹事用一覧：公開・非公開の両方を返す
      return json({ ok: true, files: listFiles(true) });
    }

    if (body.action === 'upload') {
      const f = body.file;
      if (!f || !f.data || !f.name) {
        return json({ ok: false, error: '画像データが不正です' });
      }
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const blob = Utilities.newBlob(
        Utilities.base64Decode(f.data),
        f.mimeType || 'image/jpeg',
        f.name
      );
      const file = folder.createFile(blob);
      // サムネイル表示のため「リンクを知っている全員が閲覧可」に設定
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return json({ ok: true, id: file.getId(), name: file.getName() });
    }

    if (body.action === 'setVisibility') {
      const file = DriveApp.getFileById(body.id);
      const pubFolder = DriveApp.getFolderById(FOLDER_ID);
      const hidFolder = DriveApp.getFolderById(HIDDEN_FOLDER_ID);
      if (body.public) {
        pubFolder.addFile(file);
        hidFolder.removeFile(file);
      } else {
        hidFolder.addFile(file);
        pubFolder.removeFile(file);
      }
      return json({ ok: true });
    }

    return json({ ok: false, error: '不明なリクエストです' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/* 公開ギャラリー用：パスワード不要の一覧取得（GET・公開分のみ） */
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'list') {
    return json({ ok: true, files: listFiles(false) });
  }
  return ContentService.createTextOutput('このURLは gallery/index.html・gallery-upload.html からご利用ください。');
}

function listFiles(includeHidden) {
  const out = collectFiles(FOLDER_ID, true);
  if (includeHidden) {
    Array.prototype.push.apply(out, collectFiles(HIDDEN_FOLDER_ID, false));
  }
  out.sort((a, b) => (a.uploaded < b.uploaded ? 1 : -1));
  return out;
}

function collectFiles(folderId, isPublic) {
  const folder = DriveApp.getFolderById(folderId);
  const it = folder.getFiles();
  const out = [];
  while (it.hasNext()) {
    const f = it.next();
    // Driveへ直接アップロードされた写真もサムネイルが表示できるよう、
    // 未設定であれば「リンクを知っている全員が閲覧可」に統一する
    try {
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
      // 共有設定を変更できない場合はスキップして続行
    }
    out.push({
      id: f.getId(),
      name: f.getName(),
      url: 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w400',
      uploaded: f.getDateCreated().toISOString(),
      isPublic: isPublic
    });
  }
  return out;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
