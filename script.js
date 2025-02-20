/* jshint esversion: 6 */
/* eslint-disable no-console */
document.addEventListener('DOMContentLoaded', () => {
  // Players per sanctuary
  const sanctuaries = {
    arbs: ['Brumca', 'Erich', 'Mark'],
    mur: ['Mascha', 'Michal', 'Rocco', 'Ida'],
    arosa: ['Amelia', 'Meimo', 'Sam', 'Jamila'],
    pri: ['Mira', 'Tomi', 'Hana', 'Mali'],
    dom: ['Tyson', 'Frankie', 'Masha', 'Julia'],
    bel: ['Iva', 'Suzana', 'Jeta', 'Svetla']
  }

  const populateMatchOptions = (selectId, options) => {
    const select = document.getElementById(selectId)
    const previousSelection = select.value
    select.innerHTML = `<option value="">Select</option>${
      options.map((name) => `<option value="${name}" ${name === previousSelection ? 'selected' : ''}>${name}</option>`).join('')}`
  }

  const clearDropdown = (selectId) => {
    document.getElementById(selectId).innerHTML = '<option value="">Select</option>'
  }

  const updateNextRound = (previousMatches, nextRoundId) => {
    const selectedOptions = previousMatches.map((match) => match.value).filter(Boolean)
    const nextRound = document.getElementById(nextRoundId)
    const previousSelection = nextRound.value

    nextRound.innerHTML = selectedOptions.length
      ? `<option value="">Select</option>${selectedOptions.map((name) => `<option value="${name}" ${name === previousSelection ? 'selected' : ''}>${name}</option>`).join('')}`
      : '<option value="">Select</option>'
  }

  // Populate Round 1 Matches
  Object.keys(sanctuaries).forEach((sanctuary) => {
    populateMatchOptions(`${sanctuary}_match1`, sanctuaries[sanctuary])
    populateMatchOptions(`${sanctuary}_match2`, sanctuaries[sanctuary])
  })

  // Round 1 elements
  const round1Matches = Object.keys(sanctuaries).map((sanctuary) => [
    document.getElementById(`${sanctuary}_match1`),
    document.getElementById(`${sanctuary}_match2`)
  ])

  // Round 2 elements
  const round2Matches = Object.keys(sanctuaries).map((sanctuary) => document.getElementById(`round2_${sanctuary}`))

  // Semi-Finals & Championship
  const semiLeft = document.getElementById('semi_left')
  const semiRight = document.getElementById('semi_right')
  const championship = document.getElementById('championship');

  // Clear all dropdowns after Round 1
  [...round2Matches, semiLeft, semiRight, championship].forEach((dropdown) => clearDropdown(dropdown.id))

  // Attach event listeners for Round 1 to Round 2
  round1Matches.forEach(([match1, match2], index) => {
    match1.addEventListener('change', () => updateNextRound([match1, match2], round2Matches[index].id))
    match2.addEventListener('change', () => updateNextRound([match1, match2], round2Matches[index].id))
  })

  // ✅ Fix: Preserve Semi-Finals Selection
  const updateSemiFinals = () => {
    const leftWinners = ['arbs', 'mur', 'arosa'].map((sanctuary) => document.getElementById(`round2_${sanctuary}`).value).filter(Boolean)
    const rightWinners = ['pri', 'dom', 'bel'].map((sanctuary) => document.getElementById(`round2_${sanctuary}`).value).filter(Boolean)

    const previousLeftSelection = semiLeft.value
    const previousRightSelection = semiRight.value

    semiLeft.innerHTML = `<option value="">Select</option>${leftWinners.map((name) => `<option value="${name}" ${name === previousLeftSelection ? 'selected' : ''}>${name}</option>`).join('')}`
    semiRight.innerHTML = `<option value="">Select</option>${rightWinners.map((name) => `<option value="${name}" ${name === previousRightSelection ? 'selected' : ''}>${name}</option>`).join('')}`

    updateChampionship() // Ensure Championship updates when Semi-Finals change
  }

  round2Matches.forEach((round2) => round2.addEventListener('change', updateSemiFinals))

  // ✅ Fix: Preserve Championship Selection
  const updateChampionship = () => {
    const finalists = [semiLeft.value, semiRight.value].filter(Boolean)
    const previousChampionshipSelection = championship.value

    championship.innerHTML = `<option value="">Select</option>${finalists.map((name) => `<option value="${name}" ${name === previousChampionshipSelection ? 'selected' : ''}>${name}</option>`).join('')}`
  }

  semiLeft.addEventListener('change', updateChampionship)
  semiRight.addEventListener('change', updateChampionship)

  // ✅ Reset Button Functionality
  const resetAllSelections = () => {
    document.querySelectorAll('select').forEach((select) => {
      select.value = '' // Reset selection to default
    })

    // Reset dropdown options
    Object.keys(sanctuaries).forEach((sanctuary) => {
      populateMatchOptions(`${sanctuary}_match1`, sanctuaries[sanctuary])
      populateMatchOptions(`${sanctuary}_match2`, sanctuaries[sanctuary])
    });

    // Clear later rounds
    [...round2Matches, semiLeft, semiRight, championship].forEach((dropdown) => clearDropdown(dropdown.id))

    console.log('Reset button clicked! All selections cleared.')
  }

  // Select the Reset button and attach event listener
  const resetButton = document.querySelector('.bracket-buttons button:nth-child(2)')
  resetButton.addEventListener('click', resetAllSelections)
})
// Ensure EmailJS is loaded
document.addEventListener('DOMContentLoaded', () => {
  emailjs.init('Pm9cHB9HYNYgiu_Bx') // Replace with your actual EmailJS User ID

  // Ensure Submit Button Works
  document.getElementById('submitBracket').addEventListener('click', () => {
    console.log('✅ Submit button clicked!')

    // Get user info from URL
    const params = new URLSearchParams(window.location.search)
    const name = params.get('name') || 'Unknown'
    const email = params.get('email') || ''

    if (!email) {
      alert('No email found. Please register first.')
      return
    }

    // Collect Bracket Selections
    const bracketSelections = {}
    document.querySelectorAll('select').forEach((select) => {
      bracketSelections[select.id] = select.value || 'Not Selected'
    })

    console.log(typeof emailjs)
    // Email Parameters
    const emailParams = {
      user_name: name,
      user_email: email,
      bracket_data: JSON.stringify(bracketSelections, null, 2),
      cc_email: 'ksnyderfourpawsusa@gmail.com'
    }

    // Send via EmailJS
    emailjs.send('service_87g0axd', 'template_6fjqswe', emailParams)
      .then((response) => {
        alert('✅ Bracket submitted successfully!')
        console.log('✅ Success:', response)
      })
      .catch((error) => {
        alert('❌ Error submitting bracket. Check the console.')
        console.error('❌ Error:', error)
      })
  })
})
