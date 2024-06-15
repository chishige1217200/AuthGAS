let spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
let sessionSheet = spreadSheet.getSheetByName('SESSION');

// 最新のデプロイURLを返却
function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

// HTML Templateを作成
function createHTMLTemplate(page) {
  let template = null;

  try {
    template = HtmlService.createTemplateFromFile(page);
  }
  catch {
    // 無効なパラメータで生成を試みた場合、404エラーとする
    page = '404';
    template = HtmlService.createTemplateFromFile(page);
  }

  return template;
}

// GETメソッド処理
function doGet(e) {
  // GET時は必ずindex.htmlを返却
  let page = 'index';

  // HTML Templateを生成
  let template = createHTMLTemplate(page);

  // 最新のデプロイURLを返却
  template.deployURL = getAppUrl();

  // GET時のindex.htmlではエラーメッセージは出さない
  if (page === 'index') {
    template.errorMessage = '';
  }

  // HTML返却
  return template.evaluate();
}

function doPost(e) {
  let page = e.parameter.page;
  let sessionId = e.parameter.sessionId;
  if (!sessionId) {
    page = 'index';
  }

  // HTML Templateを生成
  let template = createHTMLTemplate(page);

  // 最新のデプロイURLを返却
  template.deployURL = getAppUrl();

  // ログインできなかった場合
  if (!sessionId) {
    template.errorMessage = "⚠ユーザーIDまたはパスワードが間違っています。";
  }

  // HTML返却
  return template.evaluate();
}
