let spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
let sessionSheet = spreadSheet.getSheetByName('SESSION');

// 最新のデプロイURLを返す
function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

// HTML Templateを作成
function createHTMLTemplate(page) {
  let template = null;
  let status = '200'; // OK

  try {
    template = HtmlService.createTemplateFromFile(page);
  }
  catch {
    // 無効なパラメータで生成を試みた場合、404エラーとする
    page = '404';
    status = '404'; // NOT FOUND
    template = HtmlService.createTemplateFromFile(page);
  }

  return [template, status];
}

// 指定の体裁で時刻取得
function getDateString(format) {
  let date = new Date();
  return Utilities.formatDate(date, 'GMT+9', format).toString();
}

// ランダム文字列を返す
function getRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.:+';
  const result = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  return result;
}

// 30文字のトークンを返す
function createToken() {
  return getRandomString(16) + getDateString('yyyyMMddHHmmss');
}

// SESSIONシートの値を返す
function getSessionValues() {
  return sessionSheet.getRange(2, 1, sessionSheet.getLastRow() - 1, 4).getValues();
}

// ヘッダー行は無視した行数を渡す
function updateTokenByRowCount(token, rowCount) {
  sessionSheet.getRange(rowCount + 1, 4).setValue(token);
}

// ログイン機能を提供
// クライアントにトークンを返す
function login(userId, password) {
  let sessions = getSessionValues();
  let rowCount = 0;
  let token = 'dummy'; // 失敗時はダミートークンが返却される

  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i][0] === userId && sessions[i][2] === password) {
      rowCount = i + 1; // 行数補正
      break;
    }
  }

  // 一致するユーザーが見つかったとき
  if (rowCount !== 0) {
    // トークン生成
    token = createToken();
    // トークン更新
    updateTokenByRowCount(token, rowCount);
  }

  // トークンを返却
  return token;
}

// トークンが有効か確認する
function checkToken(token) {
  let sessions = getSessionValues();
  let result = false;

  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i][3] === token) {
      result = true;
      break;
    }
  }

  return result;
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
  let token = e.parameter.token;

  if (!checkToken(token)) {
    page = 'index';
    name = 'ログイン画面';
  }
  else {
    console.log("トークンは有効です");
    page = 'menu';
    name = 'メニュー画面';
  }

  // HTML Templateを生成
  let [template, status] = createHTMLTemplate(page);

  // 最新のデプロイURLを返却
  template.deployURL = getAppUrl();

  // ログインできなかった場合
  if (!checkToken(token)) {
    template.errorMessage = '⚠ユーザーIDまたはパスワードが間違っています。';
  }

  if (status !== '200') {
    name = 'エラー画面';
  }

  // HTML返却
  return template.evaluate().setTitle(name);
}
