$( document ).ready(function() {

  checkIfUserIsAdmin();

  function checkIfUserIsAdmin () {
    $.get("/check-if-admin", function(isAdmin) {
      if (!isAdmin) {
        checkPassword();
      }
    });
  }

  function checkPassword() {
    var userEnteredPassword = prompt("You must be an Admin to manage songs. Enter the password:");
    $.get("/check-password", {userEnteredPassword: userEnteredPassword}, function(userPasswordIsCorrect) {
      if (!userPasswordIsCorrect) {
        checkPassword();
      }
    });
  }
});