// parameters
let tuning = [7, 0, 5, 10, 2, 7];
let nbStrings = tuning.length;
let xFretMargin = 40;
let yFretMargin = 20;
let xFretStep = 60;

// colors
const colorFretsStrings = "lightgrey";
const colorFretsOctave = "dimgrey";
const colorNoteTonic = "firebrick";
const colorNoteNormal = "dimgrey";
const colorNoteChar = "dodgerblue";
const colorHintFret = "whitesmoke";

function getCaseNoteValue(i, j)
{
    return ((tuning[i - 1] + j) % 12);
}

// <i> has offset 1
function displayNoteOnFretboard(i, j, text, color)
{
    canvas = document.getElementById("canvas_guitar");
    if (canvas.getContext) 
    {
        let ctx = canvas.getContext("2d");
        const yStep = (canvas.height - 2* yFretMargin) / (nbStrings - 1);
        const radius = Math.min(xFretStep, yStep) / 2 - 2;

        if ( i > nbStrings)
            return;

        // position
        let x = xFretMargin + (j - 1) * xFretStep + xFretStep / 2 - 1;
        if (j == 0)
            x = xFretMargin + (j - 1) * 40 + 40 / 2 - 1;
        let y = yFretMargin + (nbStrings - i) * yStep - 1;
        if (x > canvas.width - xFretMargin)
            return;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();

        // text
        const lang = getSelectedCulture();
        let xShift = 0;
        let yShift = 0;
        switch (lang)
        {
            case "fr":
                ctx.font = "14px Arial";
                xShift = -9 - 2*(text.length - 2);
                yShift = 4; //6;
                break;

            case "int":
            default:
                ctx.font = "18px Arial";
                xShift = (text.length == 2) ? -12 : -6;
                yShift = 6;
                break;
        }
        ctx.fillStyle = "white";
        ctx.fillText(text, x + xShift, y + yShift); 
    }
}

function updateFretboardFromTonality()
{
  // get selected note and scale/mode values
  const noteValue = getSelectedNoteValue();
  const scaleValues = getSelectedScaleValues();
  const charIntervals = getSelectedScaleCharIntervals();

  // update fretboard
  updateFretboard(noteValue, scaleValues, charIntervals);
}

function updateFretboard(noteValue, scaleValues, charIntervals)
{
    let canvas = document.getElementById("canvas_guitar");

    // fretboard
    if (canvas.getContext) 
    {
        let ctx = canvas.getContext("2d");
        ctx.strokeStyle = colorFretsStrings;

        // clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // fill background
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.closePath();

        // hint frets
        const hintFrets = [0, 3, 5, 7, 9];
        let indexFret = 0;
        for (x = xFretMargin; x < canvas.width - xFretMargin; x += xFretStep) 
        {
            indexFret++;

            if (!hintFrets.includes(indexFret % 12))
                continue;

            // fill hint fret
            ctx.beginPath();
            ctx.strokeStyle = ((indexFret % 12) == 0) ? colorFretsOctave : colorFretsStrings;
            ctx.fillStyle = colorHintFret;
            ctx.fillRect(x, yFretMargin, xFretStep, canvas.height - 2*yFretMargin);
            ctx.closePath();
        }

        // horizontal lines (strings)
        let yStep = (canvas.height - 2 * yFretMargin) / (nbStrings - 1);
        for (i = 0; i < nbStrings; i++) 
        {
            let y = yFretMargin + i*yStep;
            ctx.moveTo(xFretMargin, y);
            ctx.lineTo(canvas.width - xFretMargin, y);
            ctx.stroke();
        }

        // vertical lines
        indexFret = 0;
        for (x = xFretMargin; x < canvas.width - xFretMargin; x += xFretStep) 
        {
            let isFretOctave = ((indexFret == 0) || ((indexFret + 1) % 12) == 0);

            ctx.beginPath();
            ctx.strokeStyle = isFretOctave ? colorFretsOctave : colorFretsStrings;
            ctx.moveTo(x, yFretMargin);
            ctx.lineTo(x, canvas.height - yFretMargin);
            ctx.stroke();
            ctx.closePath();

            indexFret++;
        }
    }

    // display notes
    const scaleNotesValues = getScaleNotesValues(noteValue, scaleValues);
    for (i = 1; i <= nbStrings; i++)
    {
        for (j = 0; j <3*12; j++)
        {
            const currentNoteValue = getCaseNoteValue(i, j);
            if (!scaleNotesValues.includes(currentNoteValue))
                continue;

            // display note

            const currentNote = getNoteName(currentNoteValue);

            let colorNote = colorNoteNormal;
            if (currentNoteValue == noteValue)
                colorNote = colorNoteTonic;

                const indexNote = scaleNotesValues.indexOf(currentNoteValue);
            if (charIntervals != null && charIntervals.includes(indexNote))
                colorNote = colorNoteChar; // characteristic note

            displayNoteOnFretboard(i, j, currentNote, colorNote);
        }
    }
}

function saveFretboardImage()
{
    let canvasImage = document.getElementById('canvas_guitar').toDataURL('image/png');
    const noteSelectedText = getSelectorText("note");
    let scaleSelectedText = getSelectorText("scale");
    scaleSelectedText = scaleSelectedText.replaceAll(" / ", ' ');
    scaleSelectedText = scaleSelectedText.replaceAll(' ', '_');
    scaleSelectedText = scaleSelectedText.replaceAll('♭', 'b');

    // this can be used to download any image from webpage to local disk
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = getString("fretboard") + '-' + noteSelectedText + '-' + scaleSelectedText + '.png';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove()
      };

    xhr.open('GET', canvasImage); // This is to download the canvas Image
    xhr.send();
}