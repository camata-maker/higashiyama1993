/**
 * 東山中学校 同窓会 出欠フォーム
 * Google Apps Script — スプレッドシートに追記
 *
 * 【設定手順】
 * 1. Google スプレッドシートを新規作成
 * 2. 拡張機能 → Apps Script を開く
 * 3. このコードを貼り付けて保存
 * 4. デプロイ → 新しいデプロイ → 種類:ウェブアプリ
 *    ・次のユーザーとして実行: 自分
 *    ・アクセスできるユーザー: 全員
 * 5. デプロイ → URLをコピー
 * 6. index.html の GAS_URL = '...' にそのURLを貼り付け
 */

const SHEET_NAME = '回答';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let sheet   = ss.getSheetByName(SHEET_NAME);

    // シートが無ければ作成してヘッダーを追加
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'タイムスタンプ', '氏名', '出欠', '電話番号', '現住所', 'メッセージ'
      ]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.timestamp,
      data.name,
      data.attendance,
      data.phone   || '',
      data.address || '',
      data.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
