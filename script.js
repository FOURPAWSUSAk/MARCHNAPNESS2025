/* jshint esversion: 6 */
/* eslint-disable no-console */
document.addEventListener('DOMContentLoaded', () => {
    let isScreenshotCaptured = false;
    let isEmailSent = false;

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

    // ✅ Attach event listeners for Round 1 to Round 2
    const round1Matches = Object.keys(sanctuaries).map((sanctuary) => [
        document.getElementById(`${sanctuary}_match1`),
        document.getElementById(`${sanctuary}_match2`)
    ]);
    const round2Matches = Object.keys(sanctuaries).map((sanctuary) => document.getElementById(`round2_${sanctuary}`));

    // ✅ Semi-Finals & Championship
    const semiLeft = document.getElementById('semi_left');
    const semiRight = document.getElementById('semi_right');
    const championship = document.getElementById('championship');

    // ✅ Preserve Semi-Finals Selection
    const updateSemiFinals = () => {
        const leftWinners = ['arbs', 'mur', 'arosa']
            .map((sanctuary) => document.getElementById(`round2_${sanctuary}`).value)
            .filter(Boolean);

        const rightWinners = ['pri', 'dom', 'bel']
            .map((sanctuary) => document.getElementById(`round2_${sanctuary}`).value)
            .filter(Boolean);

        const previousLeftSelection = semiLeft.value;
        const previousRightSelection = semiRight.value;

        semiLeft.innerHTML = `<option value="">Select</option>` +
            leftWinners.map((name) => `<option value="${name}" ${name === previousLeftSelection ? 'selected' : ''}>${name}</option>`).join('');

        semiRight.innerHTML = `<option value="">Select</option>` +
            rightWinners.map((name) => `<option value="${name}" ${name === previousRightSelection ? 'selected' : ''}>${name}</option>`).join('');

        updateChampionship();
    };

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
        if (isEmailSent) return;
        isEmailSent = true;

        console.log('✅ Submit button clicked!');
        submitButton.disabled = true;

        const params = new URLSearchParams(window.location.search);
        const name = params.get('name') || 'Unknown';
        const email = params.get('email') || '';

        if (!email) {
            alert('No email found. Please register first.');
            submitButton.disabled = false;
            isEmailSent = false;
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
                isEmailSent = false;
                submitButton.disabled = false;
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
    // ✅ Snackbar Fix
   function showSnackbar() {
    var snackbar = document.getElementById("snackbar");
    snackbar.classList.add("show");

    // Hide after 6 seconds
    setTimeout(function() {
        snackbar.classList.remove("show");
    }, 6000);
}
});