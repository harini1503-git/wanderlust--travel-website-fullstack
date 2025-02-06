(() => {
    'use strict'
  
    const forms = document.querySelectorAll('.needs-validation')
  
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })();

  const ratingInputs = document.querySelectorAll('input[name="review[ratings"]');
  ratingInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const ratingValue = e.target.value;
      console.log(`User rated: ${ratingValue} stars`);
      // You can send this value to your server or use it for further actions
    });
  });
  