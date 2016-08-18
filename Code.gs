function doGet(request) {
  
  return ContentService.createTextOutput("Only POST method can be used.");
}

function testGetFirstRow(){
  var doc = SpreadsheetApp.openById("1lzPkMYiiwgB4Bqfj4gbpnHMo2wgcypCkl3WEvRUDVqs"); //replace with your google spreadsheet id
  var sheet = doc.getSheetByName("SGTest");
  Logger.log("First empty row"+getFirstEmptyRow(sheet));
}


function getFirstEmptyRow(spr) {
  var column = spr.getRange('A:A');
  var values = column.getValues(); // get all data in one call
  var ct = 0;
  while ( values[ct][0] != "" ) {
    ct++;
  }
  return (ct);
}

function doPost(request){
  var jsonString = request.postData.getDataAsString();
  var action = request.parameters.action;
  var sheetName = request.parameters.sheetname;
  var jsonData = JSON.parse(request.postData.getDataAsString());
  if (action == 'post'){
    writeJsonAsRow(jsonData, sheetName);
    return ContentService.createTextOutput("Post success");
  }else if (action == 'get'){
    return serverGetRequest(jsonData, sheetName);
  }else if (action == 'update'){
    update(jsonData, sheetName);
    return ContentService.createTextOutput("Update success");
  }
}

function testWriteJsonAsRow(){
  writeJsonAsRow({"firstname":"John","lastname":"Doe","title":"SE"}, 'SGTest');
}

function writeJsonAsRow(jsonData, sheetName) { //{key1:val1, key2:val2, key3:val3}
  var doc = SpreadsheetApp.openById("1lzPkMYiiwgB4Bqfj4gbpnHMo2wgcypCkl3WEvRUDVqs"); //replace with your google spreadsheet id
  var sheet = doc.getSheetByName(sheetName);
  var header = [];
  var row = new Array();
  header.push('id');
  var firstEmptyRow = getFirstEmptyRow(sheet);
  Logger.log('first empty row ='+firstEmptyRow);
  row[0] = new Array();
  if (firstEmptyRow == 0){
    row[0][0] = firstEmptyRow+2;      
  }else{
    row[0][0] = firstEmptyRow+1;
  }
  var colIndex = 1;
  for (var k in jsonData){
    Logger.log(k + " = " + jsonData[k]);
    header.push(k);
    row[0][colIndex] = jsonData[k];
    colIndex++;
  }
  if (firstEmptyRow == 0){
    Logger.log("Adding header");
    sheet.appendRow(header);
    sheet.getRange(firstEmptyRow+2,1,1,row[0].length).setValues(row);
  }else{
    sheet.getRange(firstEmptyRow+1,1,1,row[0].length).setValues(row);
  }
  
}

function testGet(){
  var data = JSON.parse('[{"key": "firstname","val": "John","operation": "equals"}]');
  serverGetRequest(data, 'SGTest');
}

function serverGetRequest(jsonData, sheetName){ //[{key:colname,val:colval,operation:equals},{key:colname, val:colval,operation:notequals}]
  var doc = SpreadsheetApp.openById("1lzPkMYiiwgB4Bqfj4gbpnHMo2wgcypCkl3WEvRUDVqs"); ////replace with your google spreadsheet id
  var sheet = doc.getSheetByName(sheetName);
  var allData = readData_(doc, sheetName);
  var filteredData = [];
  var colNames = [];
  var colValues = [];
  var ops = [];
  Logger.log('jsondata length ='+jsonData.length);
  for (var i = 0; i < jsonData.length; i++){
    var element = jsonData[i];
    for (var k in element){ //  var j=0; j<element.length;j++
      var obj = element[k];
      Logger.log(k+"="+obj);
      if ("key" == k){
        colNames.push(obj);
      }else if ("val" == k){
        colValues.push(obj);
      }else if ("operation"== k){
        ops.push(obj);
      }
    }
  }
  var boolTemp = 0;
  var temp;
  for (var r = 0; r < allData.length; r++) {
    var row = allData[r];
    boolTemp = 0;
    temp = null;
    for (var e=0 ; e<ops.length ; e++){
      var op = ops[e];
      var name = colNames[e];
      var val = colValues[e];
      Logger.log("op="+op+" name="+name+" val="+val);
      if (op == "equals"){
        if (row[name] == val && (boolTemp == 0 || boolTemp == 1)){
          temp = row;
          boolTemp = 1;
        }else{
          temp = null;
          boolTemp = -1;
        }
      }else if (op == "notequals"){
        if (row[name] != val && (boolTemp == 0 || boolTemp == 1)){
          temp = row;
          boolTemp = 1;
        }else{
          temp = null;
          boolTemp = -1;
        }
      }
    }
    
    if (temp != null){
      Logger.log("Adding temp to filtered data");
      filteredData.push(temp);
    }
  }
  var result = JSON.stringify(filteredData);
  Logger.log("Result="+result);
  return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.JSON);
  
}

function testUpdate(){
  update({'id':2,'lastname':'Smith'},'SGTest');
}

function update(jsonData, sheetName){ //{"id"=2,"lastname":"kumar"}

  var doc = SpreadsheetApp.openById("1lzPkMYiiwgB4Bqfj4gbpnHMo2wgcypCkl3WEvRUDVqs");//replace with your google spreadsheet id
  var sheet = doc.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var header = data[0];
  
  for (var i=1; i<data.length;i++){
    var row = data[i];
    var found = false;
    for (var key in jsonData){
      if (key == header[0]){
        if (row[0] != jsonData[key]){
          continue;
        }else{
          found = true;
        }
      }
      if (found){
        for (var j=1;j<header.length;j++){
          if (key == header[j]){
            sheet.getRange(i+1, j+1).setValue(jsonData[key]);
          }
        }
      }
    }
  }
}


function readData_(ss, sheetname, properties) {
  
  if (typeof properties == "undefined") {
    properties = getHeaderRow_(ss, sheetname);
    properties = properties.map(function(p) { return p.replace(/\s+/g, '_'); });
  }
  
  var rows = getDataRows_(ss, sheetname);
  var data = [];
  for (var r = 0, l = rows.length; r < l; r++) {
    var row = rows[r];
    var record = {};
    for (var p in properties) {
      record[properties[p]] = convert_(row[p]);
    }
    data.push(record);
  }
  return data;
}


function convert_(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}


function getDataRows_(ss, sheetname) {
  
  var sh = ss.getSheetByName(sheetname);
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  
}


function getHeaderRow_(ss, sheetname) {
  
  var sh = ss.getSheetByName(sheetname);
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  
}
