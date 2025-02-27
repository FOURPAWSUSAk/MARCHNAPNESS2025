document.addEventListener("DOMContentLoaded", function () {
    // Players per sanctuary
    const sanctuaries = {
        arbs: ["Brumca", "Erich", "Mark"],
        mur: ["Mascha", "Michal", "Rocco", "Ida"],
        arosa: ["Amelia", "Meimo", "Sam", "Jamila"],
        pri: ["Mira", "Tomi", "Hana", "Mali"],
        dom: ["Tyson", "Frankie", "Masha", "Julia"],
        bel: ["Iva", "Suzana", "Jeta", "Svetla"]
    };

    function populateMatchOptions(selectId, options) {
        const select = document.getElementById(selectId);
        select.innerHTML = `<option value="">Select</option>` +
            options.map(name => `<option value="${name}">${name}</option>`).join("");
    }

    function clearDropdown(selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = `<option value="">Select</option>`;
    }

    function updateNextRound(previousMatches, nextRoundId) {
        const selectedOptions = previousMatches.map(match => match.value).filter(v => v);
        const nextRound = document.getElementById(nextRoundId);
        
        nextRound.innerHTML = `<option value="">Select</option>` +
            selectedOptions.map(name => `<option value="${name}">${name}</option>`).join("");
    }

    // Initialize first round
    Object.keys(sanctuaries).forEach(sanctuary => {
        populateMatchOptions(`${sanctuary}_match1`, sanctuaries[sanctuary]);
        populateMatchOptions(`${sanctuary}_match2`, sanctuaries[sanctuary]);
    });

    // Get all elements
    const round1Matches = ["arbs", "mur", "arosa", "pri", "dom", "bel"].map(sanctuary => [
        document.getElementById(`${sanctuary}_match1`),
        document.getElementById(`${sanctuary}_match2`)
    ]);

    const round2Matches = ["arbs", "mur", "arosa", "pri", "dom", "bel"].map(sanctuary =>
        document.getElementById(`round2_${sanctuary}`)
    );

    const semiLeft = document.getElementById("semi_left");
    const semiRight = document.getElementById("semi_right");
    const championship = document.getElementById("championship");

    // Clear initial states
    round2Matches.forEach(match => clearDropdown(match.id));
    clearDropdown("semi_left");
    clearDropdown("semi_right");
    clearDropdown("championship");

    // Add event listeners
    round1Matches.forEach(([match1, match2], index) => {
        match1.addEventListener("change", () => updateNextRound([match1, match2], round2Matches[index].id));
        match2.addEventListener("change", () => updateNextRound([match1, match2], round2Matches[index].id));
    });

    function updateSemiFinals(side) {
        const sanctuaryGroup = side === 'left' ? ["arbs", "mur", "arosa"] : ["pri", "dom", "bel"];
        const winners = sanctuaryGroup
            .map(sanctuary => document.getElementById(`round2_${sanctuary}`).value)
            .filter(v => v);
        
        const semiElement = side === 'left' ? semiLeft : semiRight;
        const currentValue = semiElement.value;
        
        semiElement.innerHTML = `<option value="">Select</option>` + 
            winners.map(name => `<option value="${name}">${name}</option>`).join("");
        
        if (currentValue && winners.includes(currentValue)) {
            semiElement.value = currentValue;
        }
        
        updateChampionship();
    }

    round2Matches.forEach(round2 => {
        round2.addEventListener("change", () => {
            const side = ["arbs", "mur", "arosa"].includes(round2.id.split('_')[1]) ? 'left' : 'right';
            updateSemiFinals(side);
        });
    });

    function updateChampionship() {
        const currentValue = championship.value;
        const finalists = [semiLeft.value, semiRight.value].filter(v => v);
        
        championship.innerHTML = `<option value="">Select</option>` + 
            finalists.map(name => `<option value="${name}">${name}</option>`).join("");
        
        if (currentValue && finalists.includes(currentValue)) {
            championship.value = currentValue;
        }
    }

    semiLeft.addEventListener("change", updateChampionship);
    semiRight.addEventListener("change", updateChampionship);

    // Submit and Email functionality
    document.getElementById("submitBracket").addEventListener("click", async () => {
        const params = new URLSearchParams(window.location.search);
        const name = params.get("name") || "Unknown";
        const userEmail = params.get("email") || "";

        if (!userEmail) {
            alert("No email found. Please register first.");
            return;
        }

        try {
            // Capture the bracket image
            const canvas = await html2canvas(document.getElementById("bracket-container"), { 
                scale: 2,
                backgroundColor: null
            });
            
            // Convert canvas to base64 image
            const bracketImage = canvas.toDataURL("image/png");

            // Get all selections
            const bracketSelections = {};
            document.querySelectorAll("select").forEach((select) => {
                bracketSelections[select.id] = select.value || "Not Selected";
            });

            // Send email using EmailJS
            const emailParams = {
                user_name: name,
                user_email: userEmail,
                bracket_data: JSON.stringify(bracketSelections, null, 2),
                bracket_image: bracketImage,
                reply_to: "ksnyderfourpawsusa@gmail.com"
            };

            await emailjs.send("service_87g0axd", "template_6fjqswe", emailParams);

            // Download the bracket image
            const link = document.createElement("a");
            link.href = bracketImage;
            link.download = `MarchNapness_Bracket_${name}.png`;
            link.click();

            alert("✅ Bracket submitted successfully! Check your email for confirmation.");

        } catch (error) {
            console.error("Error:", error);
            alert("❌ Error submitting bracket. Please try again.");
        }
    });
});
