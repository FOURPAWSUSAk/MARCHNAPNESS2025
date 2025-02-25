/* jshint esversion: 6 */
/* eslint-disable no-console */
document.addEventListener('DOMContentLoaded', () => {
    let isScreenshotCaptured = false;
    let isEmailSent = false;

    const submitButton = document.getElementById('submitBracket');

    const sanctuaries = {
        arbs: ["Brumca", "Erich", "Mark"],
        mur: ["Mascha", "Michal", "Rocco", "Ida"],        
        arosa: ["Amelia", "Meimo", "Sam", "Jamila"],        
        pri: ["Mira", "Tomi", "Hana", "Mali"],        
        dom: ["Tyson", "Frankie", "Masha", "Julia"],        
        bel: ["Iva", "Suzana", "Jeta", "Svetla"],    
    };

    const escapeHTML = (str) => {
        return String(str).replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#39;");
    };

    const populateMatchOptions = (selectId, options) => {
        const select = document.getElementById(selectId);
        if (!select) return;

        const previousSelection = escapeHTML(select.value);
        select.innerHTML = `<option value=\"\">Select</option>` +
            options.map((name) => {
                const safeName = escapeHTML(name);
                return `<option value=\"${safeName}\" ${safeName === previousSelection ? 'selected' : ''}>${safeName}</option>`;
            }).join('');
    };

    Object.keys(sanctuaries).forEach((sanctuary) => {
        populateMatchOptions(`${escapeHTML(sanctuary)}_match1`, sanctuaries[sanctuary]);
        populateMatchOptions(`${escapeHTML(sanctuary)}_match2`, sanctuaries[sanctuary]);
    });

    const updateNextRound = (previousMatches, nextRoundId) => {
        const selectedOptions = previousMatches.map((match) => escapeHTML(match.value)).filter(Boolean);
        const nextRound = document.getElementById(nextRoundId);
        if (!nextRound) return;

        const previousSelection = escapeHTML(nextRound.value);
        nextRound.innerHTML = selectedOptions.length
            ? `<option value=\"\">Select</option>` +
            selectedOptions.map((name) => `<option value=\"${name}\" ${name === previousSelection ? 'selected' : ''}>${name}</option>`).join('')
            : '<option value=\"\">Select</option>';
    };

    const round1Matches = Object.keys(sanctuaries).map((sanctuary) => [
        document.getElementById(`${escapeHTML(sanctuary)}_match1`),
        document.getElementById(`${escapeHTML(sanctuary)}_match2`)
    ]);
    const round2Matches = Object.keys(sanctuaries).map((sanctuary) => document.getElementById(`round2_${escapeHTML(sanctuary)}`));

    const semiLeft = document.getElementById('semi_left');
    const semiRight = document.getElementById('semi_right');
    const championship = document.getElementById('championship');

    const updateSemiFinals = () => {
        const leftWinners = ['arbs', 'mur', 'arosa']
            .map((sanctuary) => escapeHTML(document.getElementById(`round2_${sanctuary}`).value))
            .filter(Boolean);

        const rightWinners = ['pri', 'dom', 'bel']
            .map((sanctuary) => escapeHTML(document.getElementById(`round2_${sanctuary}`).value))
            .filter(Boolean);

        semiLeft.innerHTML = `<option value=\"\">Select</option>` +
            leftWinners.map((name) => `<option value=\"${name}\">${name}</option>`).join('');

        semiRight.innerHTML = `<option value=\"\">Select</option>` +
            rightWinners.map((name) => `<option value=\"${name}\">${name}</option>`).join('');

        updateChampionship();
    };

    round1Matches.forEach(([match1, match2], index) => {
        match1.addEventListener('change', () => updateNextRound([match1, match2], round2Matches[index].id));
        match2.addEventListener('change', () => updateNextRound([match1, match2], round2Matches[index].id));
    });

    round2Matches.forEach((round2) => round2.addEventListener('change', updateSemiFinals));
    semiLeft.addEventListener('change', updateChampionship);
    semiRight.addEventListener('change', updateChampionship);

    function updateChampionship() {
        const finalists = [escapeHTML(semiLeft.value), escapeHTML(semiRight.value)].filter(Boolean);
        championship.innerHTML = `<option value=\"\">Select</option>` +
            finalists.map((name) => `<option value=\"${name}\">${name}</option>`).join('');
    }

    if (typeof emailjs !== "undefined") {
        emailjs.init('Pm9cHB9HYNYgiu_Bx');
    } else {
        console.error('❌ EmailJS is not loaded.');
    }
});
