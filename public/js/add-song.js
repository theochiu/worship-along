$( document ).ready(function() {
  var title = $("#title-input");
  var lyrics = $("#lyrics-input");

  $("#submit").click(function() {
    var submitConfirm = confirm("Are you sure you want to submit?");
    if (submitConfirm) {
      if (!title || !title.val()) {
        alert("Please Enter a Title");
        return;
      }

      if (!lyrics || !lyrics.val()) {
        alert ("Please Enter Lyrics");
        return;
      }

      var songTitle = title.val();
      var songLyrics = lyrics.val();
      $.get("/insert-song-into-db", {songTitle: songTitle, songLyrics: songLyrics}, function(data) {
        console.log(data);
        if (data.command === "INSERT") {
          alert("Song " + songTitle + " was added");
          title.val("");
          lyrics.val("");
        }
      });
    }
  });
});