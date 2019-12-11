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
