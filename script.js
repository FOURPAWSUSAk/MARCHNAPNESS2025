/* jshint esversion: 6 */
/* eslint-disable no-console */
document.addEventListener('DOMContentLoaded', () => {
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
        select.innerHTML = ''; // Clear existing options
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select';
        select.appendChild(defaultOption);

        options.forEach((name) => {
            const safeName = escapeHTML(name);
            const option = document.createElement('option');
            option.value = safeName;
            option.textContent = safeName;
            if (safeName === previousSelection) {
                option.selected = true;
            }
            select.appendChild(option);
        });
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
        nextRound.innerHTML = ''; // Clear existing options

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select';
        nextRound.appendChild(defaultOption);

        if (selectedOptions.length) {
            selectedOptions.forEach((name) => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (name === previousSelection) {
                    option.selected = true;
                }
                nextRound.appendChild(option);
            });
        }
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

        semiLeft.innerHTML = '';
        const leftDefault = document.createElement('option');
        leftDefault.value = '';
        leftDefault.textContent = 'Select';
        semiLeft.appendChild(leftDefault);

        leftWinners.forEach((name) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            semiLeft.appendChild(option);
        });

        semiRight.innerHTML = '';
        const rightDefault = document.createElement('option');
        rightDefault.value = '';
        rightDefault.textContent = 'Select';
        semiRight.appendChild(rightDefault);

        rightWinners.forEach((name) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            semiRight.appendChild(option);
        });

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
        championship.innerHTML = '';
        const champDefault = document.createElement('option');
        champDefault.value = '';
        champDefault.textContent = 'Select';
        championship.appendChild(champDefault);

        finalists.forEach((name) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            championship.appendChild(option);
        });
    }

    if (typeof emailjs !== "undefined") {
        emailjs.init('Pm9cHB9HYNYgiu_Bx');
    } else {
        console.error('❌ EmailJS is not loaded.');
    }
});
