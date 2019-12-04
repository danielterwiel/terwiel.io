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

const roleRadios = document.querySelectorAll('[name="role"]')
roleRadios.forEach(roleRadio => {
  roleRadio.addEventListener('change', event => {
    const submitButton = document.querySelector('#submit')
    const id = event.target.id
    if (id === 'recruiter') {
      submitButton.classList.add('form__submit-button--fade-out')
      submitButton.classList.remove('form__submit-button--fade-in')
    } else {
      submitButton.classList.add('form__submit-button--fade-in')
      submitButton.classList.remove('form__submit-button--fade-out')
    }
  })
})

