/* jshint esversion: 6 */
/* eslint-disable no-console */
document.addEventListener('DOMContentLoaded', () => {
  let isScreenshotCaptured = false; // ✅ Prevents duplicate downloads
  let isEmailSent = false; // ✅ Prevents duplicate email submissions

  const submitButton = document.getElementById('submitBracket');

  // Players per sanctuary
  const sanctuaries = {
    arbs: ['Brumca', 'Erich', 'Mark'],
    mur: ['Mascha', 'Michal', 'Rocco', 'Ida'],
    arosa: ['Amelia', 'Meimo', 'Sam', 'Jamila'],
    pri: ['Mira', 'Tomi', 'Hana', 'Mali'],
    dom: ['Tyson', 'Frankie', 'Masha', 'Julia'],
    bel: ['Iva', 'Suzana', 'Jeta', 'Svetla']
  };

  const populateMatchOptions = (selectId, options) => {
    const select = document.getElementById(selectId);
    if (!select) return;

    const previousSelection = select.value;
    select.innerHTML = `<option value="">Select</option>` +
      options.map((name) => `<option value="${name}" ${name === previousSelection ? 'selected' : ''}>${name}</option>`).join('');
  };

  // ✅ Populate Round 1 Matches on Load
  Object.keys(sanctuaries).forEach((sanctuary) => {
    populateMatchOptions(`${sanctuary}_match1`, sanctuaries[sanctuary]);
    populateMatchOptions(`${sanctuary}_match2`, sanctuaries[sanctuary]);
  });

  // ✅ Function to update next rounds dynamically
  const updateNextRound = (previousMatches, nextRoundId) => {
    const selectedOptions = previousMatches.map((match) => match.value).filter(Boolean);
    const nextRound = document.getElementById(nextRoundId);
    if (!nextRound) return;

    const previousSelection = nextRound.value;
    nextRound.innerHTML = selectedOptions.length
      ? `<option value="">Select</option>` +
        selectedOptions.map((name) => `<option value="${name}" ${name === previousSelection ? 'selected' : ''}>${name}</option>`).join('')
      : '<option value="">Select</option>';
  };

  // Round 1 & 2 elements
  const round1Matches = Object.keys(sanctuaries).map((sanctuary) => [
    document.getElementById(`${sanctuary}_match1`),
    document.getElementById(`${sanctuary}_match2`)
  ]);

  const round2Matches = Object.keys(sanctuaries).map((sanctuary) => document.getElementById(`round2_${sanctuary}`));

  // Semi-Finals & Championship
  const semiLeft = document.getElementById('semi_left');
  const semiRight = document.getElementById('semi_right');
  const championship = document.getElementById('championship');

  // ✅ Preserve Semi-Finals Selection **Separately**
  const updateSemiFinals = () => {
    const leftWinners = ['arbs', 'mur', 'arosa']
      .map((sanctuary) => document.getElementById(`round2_${sanctuary}`).value)
      .filter(Boolean);

    const rightWinners = ['pri', 'dom', 'bel']
      .map((sanctuary) => document.getElementById(`round2_${sanctuary}`).value)
      .filter(Boolean);

    // Preserve previously selected values
    const previousLeftSelection = semiLeft.value;
    const previousRightSelection = semiRight.value;

    if (leftWinners.length) {
      semiLeft.innerHTML = `<option value="">Select</option>` +
        leftWinners.map((name) => `<option value="${name}" ${name === previousLeftSelection ? 'selected' : ''}>${name}</option>`).join('');
    }

    if (rightWinners.length) {
      semiRight.innerHTML = `<option value="">Select</option>` +
        rightWinners.map((name) => `<option value="${name}" ${name === previousRightSelection ? 'selected' : ''}>${name}</option>`).join('');
    }

    updateChampionship(); // Ensure Championship updates when Semi-Finals change
  };

  // Attach event listeners for Round 1 to Round 2
  round1Matches.forEach(([match1, match2], index) => {
    match1.addEventListener('change', () => updateNextRound([match1, match2], round2Matches[index].id));
    match2.addEventListener('change', () => updateNextRound([match1, match2], round2Matches[index].id));
  });

  round2Matches.forEach((round2) => round2.addEventListener('change', updateSemiFinals));

  // ✅ Preserve Championship Selection
  const updateChampionship = () => {
    const finalists = [semiLeft.value, semiRight.value].filter(Boolean);
    championship.innerHTML = `<option value="">Select</option>` +
      finalists.map((name) => `<option value="${name}">${name}</option>`).join('');
  };

  semiLeft.addEventListener('change', updateChampionship);
  semiRight.addEventListener('change', updateChampionship);

  // ✅ Ensure EmailJS is loaded
  emailjs.init('Pm9cHB9HYNYgiu_Bx');

  // ✅ Submit Bracket + Capture Screenshot After Email Sent
  submitButton.addEventListener('click', () => {
    if (isEmailSent) return; // ✅ Prevents duplicate emails
    isEmailSent = true; // ✅ Ensures only one email is sent

    console.log('✅ Submit button clicked!');
    submitButton.disabled = true; // ✅ Disable button to prevent multiple clicks

    const params = new URLSearchParams(window.location.search);
    const name = params.get('name') || 'Unknown';
    const email = params.get('email') || '';

    if (!email) {
      alert('No email found. Please register first.');
      submitButton.disabled = false; // Re-enable if failed
      isEmailSent = false; // Reset flag
      return;
    }

    const bracketSelections = {};
    document.querySelectorAll('select').forEach((select) => {
      bracketSelections[select.id] = select.value || 'Not Selected';
    });

    const emailParams = {
      user_name: name,
      user_email: email,
      reply_to: 'ksnyderfourpawsusa@gmail.com',
      bracket_data: JSON.stringify(bracketSelections, null, 2)
    };

    emailjs.send('service_87g0axd', 'template_6fjqswe', emailParams)
      .then((response) => {
        alert('✅ Bracket submitted successfully! Your bracket will now be downloaded.');
        console.log('✅ Success:', response);

        if (!isScreenshotCaptured) {
          isScreenshotCaptured = true;
          setTimeout(captureAndDownloadBracket, 1000);
        }
      })
      .catch((error) => {
        alert('❌ Error submitting bracket. Check the console.');
        console.error('❌ Error:', error);
        isEmailSent = false; // ✅ Reset flag if error occurs
        submitButton.disabled = false; // ✅ Re-enable button
      });
  });

  function captureAndDownloadBracket() {
    if (isScreenshotCaptured) return;
    isScreenshotCaptured = true;

    const bracketElement = document.getElementById('bracket-container');

    if (!bracketElement) {
      console.error("❌ Bracket container not found!");
      return;
    }

    html2canvas(bracketElement, { scale: 2 })
      .then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'MarchNapness_Bracket.png';
        link.click();
      })
      .catch((error) => {
        console.error('❌ Error capturing bracket:', error);
      });
  }
    // ✅ Reset Bracket Button Fix
document.getElementById('resetBracket').addEventListener('click', () => {
    console.log('🔄 Reset button clicked! Resetting all selections...');

    // ✅ Reset all dropdowns to "Select"
    document.querySelectorAll('select').forEach(select => {
        select.value = ''; // Reset selection to default
    });

    // ✅ Repopulate Round 1 dropdowns
    Object.keys(sanctuaries).forEach(sanctuary => {
        populateMatchOptions(`${sanctuary}_match1`, sanctuaries[sanctuary]);
        populateMatchOptions(`${sanctuary}_match2`, sanctuaries[sanctuary]);
    });

    // ✅ Clear later rounds (Round 2, Semi-finals, Championship)
    [...round2Matches, semiLeft, semiRight, championship].forEach(dropdown => {
        dropdown.innerHTML = '<option value="">Select</option>'; // Reset dropdown options
    });

    // ✅ Re-enable the Submit button if disabled
    submitButton.disabled = false;
    isEmailSent = false; // ✅ Reset email flag
    isScreenshotCaptured = false; // ✅ Reset screenshot flag

    console.log('✅ Bracket has been fully reset.');
});
});


// ✅ Add Snackbar Function Here (Outside document.addEventListener)
function showSnackbar() {
    var x = document.getElementById("snackbar");
    var button = document.querySelector("button"); // Selects the button

    // ✅ Dynamically position the snackbar above the button
    var buttonRect = button.getBoundingClientRect();
    x.style.top = (buttonRect.top - 60) + "px"; // Moves the snackbar above button
    x.className = "show";

    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 6000);
}
}
