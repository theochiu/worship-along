/**
 * Created by daviding on 5/2/17.
 */
$( document ).ready(function() {

  var $overlay = $(".room-popover-overlay");
  var $overlayText = $("#roomNameInput")
  var $roomPopover = $(".room-popover");


  // checks if room is already set
  var roomName = localStorage.getItem("worship_along_session_id");
  if (!roomName) {
    $overlay.addClass("revealed");
    $roomPopover.text("Enter room name");
  } else {
    $roomPopover.text("Room: " + roomName);
  }

  // reveal overlay when they click on room number
  $(".room-popover").click(function(){
    $overlay.addClass("revealed");
    if (roomName) {
      $overlayText.val(roomName);
    }
  });

  // updates users room in local storage
  function submitRoomName() {
    var newRoomName = $overlayText.val();
    if (newRoomName) {
      $overlay.removeClass("revealed");
      console.log(newRoomName);
      localStorage.setItem('worship_along_session_id', newRoomName);
      $roomPopover.text("Room: " + newRoomName);
      roomName = newRoomName;
    } else {
      $overlayText.effect("shake", {times: 2, distance: 5});
    }
  }

  // update room when user clicks submit
  $(".overlay-submit").click(function(){
    submitRoomName();
  });

  // update room with user clicks enter
  $overlayText.keypress(function(event){
    if (event.key === "Enter") {
      submitRoomName();
    }
  });
});