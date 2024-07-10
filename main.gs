function sendReminder() {

  const headers = {
    'Authorization': TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  var spreadSheet = SpreadsheetApp.openByUrl(SpreadsheetApp.getActiveSpreadsheet().getUrl());
  var sheet = spreadSheet.getSheets()[0];
  var rangeValues = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();

  for (var i in rangeValues) {
    var receiverName = sheet.getRange(2 + Number(i), 1).getValue()
    var phoneNumber = sheet.getRange(2 + Number(i), 2).getValue()
    var agenda = sheet.getRange(2 + Number(i), 3).getValue()
    var date = sheet.getRange(2 + Number(i), 4).getValue()
    var time = sheet.getRange(2 + Number(i), 5).getValue()
    var place = sheet.getRange(2 + Number(i), 6).getValue()
    var message = sheet.getRange(2 + Number(i), 7).getValue()
    var result = sheet.getRange(Number(i) + 2, 8);
    var remark = sheet.getRange(Number(i) + 2, 9);

    var todayDate = Utilities.formatDate(new Date(), 'GMT+7', "dd MMMM yyyy");
    
    var trainingDate = new Date(date);
    
    var reminderDate = new Date(trainingDate - (1 * 24 * 60 * 60 * 1000));
    var formattedReminderDate = Utilities.formatDate(reminderDate, 'GMT+7', "dd MMMM yyyy");
    
    try {
      Logger.log("masuk try")
      x = compareDates(todayDate, formattedReminderDate)
      Logger.log(x);
      if (x == 0 && (result.isBlank() || result.getValue() === 'GAGAL DIKIRIM')) {
        Logger.log("masuk if & sent API")
        
        const payload = {
          target: String(phoneNumber),
          message:
            '*_Ini adalah pesan otomatis, mohon untuk tidak membalas._*\r\n\r\n' +
            'Kepada ' + receiverName + ',\r\n' +
            'Ini adalah pengingat acara di Gampong Ulee Paya :\r\n\r\n' +
            '---------------------------------------------------------' + '\r\n' +
            '*'+ agenda +'*' + '\r\n' +
            '*Tanggal* : ' + formatIndonesianDate(trainingDate) + ', pukul ' + time +'\r\n' +
            '*Lokasi* : ' + place + '\r\n' +
            '*Pesan* : ' + message + '\r\n\r\n' +
            'Mohon untuk datang tepat waktu.' + '\r\n' +
            '---------------------------------------------------------'
        };

        var options = {
          'method': 'post',
          'contentType': 'application/json',
          'headers': headers,
          'payload': JSON.stringify(payload),
        };

        var res = UrlFetchApp.fetch('https://api.fonnte.com/send', options);
        result.setValue('BERHASIL TERKIRIM').setBackground('#b7e1cd');
        remark.setValue('Sent on ' + new Date());

        Logger.log(res);
      }
    } catch (err) {
      Logger.log("masuk catch")
      Logger.log(err);
      result.setValue('GAGAL DIKIRIM').setBackground('#ea4335');
      remark.setValue(String(err).replace('\n', ''));
    }
  }
}


// Helper Function
function compareDates(date1, date2) {
  if (date1 === date2) {
    return 0;
  } else if (date1 < date2) {
    return -1;
  } else {
    return 1;
  }
}

function formatIndonesianDate(date) {
  var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  var dayName = days[date.getDay()];
  var day = date.getDate();
  var monthName = months[date.getMonth()];
  var year = date.getFullYear();

  return dayName + ', ' + day + ' ' + monthName + ' ' + year;
}