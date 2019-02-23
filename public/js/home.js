function getSong() {
  var session = localStorage.getItem('worship_along_session_id');
  $.get("/get-song-for-session", {sessionId: session}, function(data) {
    var songObject = data.rows[0];
    $("#song-area").html("<h1>" + songObject.name + "</h1>" + convertLineBreakToHtml(songObject.lyrics));
  });
}

// converts the \r\n in a
// block of text into html <br /> tag
function convertLineBreakToHtml(text) {
  return text.replace(/\\r\\n|\\r|\\n/g, '<br />');
}

$( document ).ready(function() {
  $("#refreshButton").click(function(){
    getSong();
    $.snackbar({content: "Song is up to date!"});
  });

  // refresh songs every 5 seconds
  setInterval(getSong, 5000);

  getSong();
});