function validateForm(event) {
  event.preventDefault();

  debugger

  // TODO: this does not work

  alert();
  var name = document.form.contact.name.value;
  var email = document.form.contact.email.value;
  var role = document.form.contact.role.value;
  var message = document.form.contact.message.value;

  if (role === "recruiter") {
    event.preventDefault();
    alert(
      "My apologies, nothing personal, but I'd rather pro-actively look for a job myself"
    );
  }

  if (!name || !email || !message) {
    event.preventDefault();
  }
}
