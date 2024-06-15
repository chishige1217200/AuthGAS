let spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
let sessionSheet = spreadSheet.getSheetByName('SESSION');

// 最新のデプロイURLを返却
function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

// HTML Templateを作成
function createHTMLTemplate(page) {
  let template = null;
  let status = '200';

  try {
    template = HtmlService.createTemplateFromFile(page);
  }
  catch {
    // 無効なパラメータで生成を試みた場合、404エラーとする
    page = '404';
    status = '404';
    template = HtmlService.createTemplateFromFile(page);
  }

  return [template, status];
}

// 指定の体裁で時刻取得
function getDateString(format) {
  let date = new Date();
  return Utilities.formatDate(date, "GMT+9", format).toString();
}

// ランダム文字列を返却
function getRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.:+";
  const result = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  return result;
}

function tokenTest() {
  console.log(getRandomString(16) + getDateString("yyyyMMddHHmmss"));
}

// GETメソッド処理
function doGet(e) {
  // GET時は必ずindex.htmlを返却
  let page = 'index';
  let name = 'ログイン画面';

  // HTML Templateを生成
  let [template, status] = createHTMLTemplate(page);

  // 最新のデプロイURLを返却
  template.deployURL = getAppUrl();

  // GET時のindex.htmlではエラーメッセージは出さない
  if (page === 'index') {
    template.errorMessage = '';
  }

  if (status !== '200') {
    name = 'エラー画面';
  }

  // HTML返却
  return template.evaluate().setTitle(name);
}

function doPost(e) {
  let page = e.parameter.page;
  let name = ''
  let sessionId = e.parameter.sessionId;
  if (!sessionId) {
    page = 'index';
    name = 'ログイン画面';
  }

  // HTML Templateを生成
  let [template, status] = createHTMLTemplate(page);

  // 最新のデプロイURLを返却
  template.deployURL = getAppUrl();

  // ログインできなかった場合
  if (!sessionId) {
    template.errorMessage = "⚠ユーザーIDまたはパスワードが間違っています。";
  }

  if (status !== '200') {
    name = 'エラー画面';
  }

  // HTML返却
  return template.evaluate().setTitle(name);
}
