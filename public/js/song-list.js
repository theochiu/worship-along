const NAV_BAR_OFFSET = 40;

/**
 * Created by daviding on 5/2/17.
 */

$(document).bind("mobileinit", function(){
  $.event.special.swipe.horizontalDistanceThreshold = 5;
  $.event.special.swipe.verticalDistanceThreshold = 5;
});

$( document ).ready(function() {
  var $songList = $(".song-title");
  var prevExpandedSongID = null;

  $(".song-title").click(function(event) {
    var session = localStorage.getItem('worship_along_session_id');
    var newSongId = event.target.dataset.id;
    var newSongName = event.target.dataset.title;
    $.get("/choose-song", {sessionId: session, songId: newSongId}, function() {
      $(".selected").removeClass("selected");
      $("#" + newSongId).find(".song-title").addClass("selected");
      $.snackbar({content: "Selected song: \"" + newSongName + "\""});
    });
  });

  // show initially selected song if one exists for this session
  function getInitialSong() {
    var session = localStorage.getItem('worship_along_session_id');
    $.get("/get-song-for-session", {sessionId: session}, function(data) {
      var songObject = data.rows[0];
      $(".selected").removeClass("selected");
      $("#" + songObject.id).find(".song-title").addClass("selected");
    });
  }

  // add keyup for search bar
  $(".song-search").keyup(function(event) {
    var input = $(this).val();
    hideSongListSections(input);
    filterSongList(input);
  });

  // hides all the section headers
  function hideSongListSections(inputString) {
    if (inputString) {
      $(".letter-section").addClass("letter-section-hidden");
      $(".alphabet-nav-letter").addClass("letter-section-hidden");
    } else {
      $(".letter-section").removeClass("letter-section-hidden");
      $(".alphabet-nav-letter").removeClass("letter-section-hidden");
    }
  }

  // filter song list by given string
  function filterSongList(filterString) {
    $songList.each(function(index, element) {
      var $elem = $(element);
      var $songContainer = $("#" + $elem.data("id"));

      if ($elem.text().toLowerCase().indexOf(filterString.toLowerCase()) > -1) {
        $songContainer.removeClass("song-hidden");
      } else {
        $songContainer.addClass("song-hidden");
      }
    });
  }

  // add click for arrows to expand lyrics
  $(".song-arrow").click(function(event) {
    var lyricId = event.target.dataset.id;
    var $this = $(this);

    // open expanded
    var $song = $("#" + lyricId);
    $song.find(".song-lyrics").slideToggle();
    $this.hasClass("expanded") ? $this.removeClass("expanded") : $this.addClass("expanded");

    // close previously expanded
    if (prevExpandedSongID !== lyricId) {
      var $prevSong = $("#" + prevExpandedSongID);
      $prevSong.find(".song-lyrics").slideToggle();
      $prevSong.find(".song-arrow").removeClass("expanded");
      prevExpandedSongID = lyricId;
    } else if (!prevExpandedSongID) {
      prevExpandedSongID = lyricId;
    } else {
      prevExpandedSongID = null;
    }

    // stop parent click from happening
    event.stopPropagation();
  });

  // add hover for alphabet navigation
  $(".alphabet-nav-letter").bind('touchstart mousedown', function(event) {
    var letter = event.target.dataset.letter;
    var position = $("#"+letter).offset().top - NAV_BAR_OFFSET;
    $('html,body').animate({scrollTop: position}, 'slow');
  });

  $(".alphabet-nav").bind('touchstart', function(event) {
    event.preventDefault();
  });

  getInitialSong();

});