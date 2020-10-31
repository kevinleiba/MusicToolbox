// parameters
var xKeyMargin = 40;
var yKeyMargin = 20;
var xKeyStep = 60;
var wFactorBlackKey = 0.6;
var hFactorBlackKey = 0.7;

// <i> has offset 0
function displayNoteOnKeyboard(i, text, color)
{
    canvas = document.getElementById("canvas_keyboard");
    if (canvas.getContext) 
    {
        var ctx = canvas.getContext("2d");
        var yStep = (canvas.height - 2* yKeyMargin) / (nbStrings - 1);
        var radius = Math.min(xKeyStep, yStep) / 2 - 2;

        var notesBlackKeys = [1, 4, 6, 9, 11];

        // position
        var xFirstKey = xKeyMargin + xKeyStep / 2 - 1;
        var x = xFirstKey;
        if (i > 3)
        {
            for (noteValue = 4; noteValue <= i; noteValue++)
            {
                var noteValueRel = noteValue % 12;
                var noteValuePrev = (noteValue - 1) % 12;

                if (notesBlackKeys.includes(noteValueRel))
                    x += xKeyStep/2;
                else if (!notesBlackKeys.includes(noteValueRel) && notesBlackKeys.includes(noteValuePrev))
                    x += xKeyStep/2;
                else if (!notesBlackKeys.includes(noteValueRel) && !notesBlackKeys.includes(noteValuePrev))
                    x += xKeyStep;
            }
        }

        var y = (notesBlackKeys.includes(i % 12)) ? wFactorBlackKey * canvas.height - radius/2 - 5: 0.8 * canvas.height;
        if (x > canvas.width - xKeyStep)
            return;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();

        // text
        ctx.font = "18px Arial";
        ctx.fillStyle = "white";
        var xShift = (text.length == 2) ? -12 : -6;
        var yShift = 6;
        ctx.fillText(text, x + xShift, y + yShift); 
    }
}

function updateKeyboardFromTonality()
{
  // get selected note and scale/mode values
  var noteValue = getSelectedNoteValue();
  var scaleValues = getSelectedScaleValues();
  var charIntervals = getSelectedScaleCharIntervals();

  // update keyboard
  updateKeyboard(noteValue, scaleValues, charIntervals);
}

function updateKeyboard(noteValue, scaleValues, charIntervals)
{
    var canvas = document.getElementById("canvas_keyboard");

    // keyboard
    if (canvas.getContext) 
    {
        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";

        // clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // horizontal lines
        var yStep = (canvas.height - 2 * yKeyMargin);
        for (i = 0; i < 2; i++) 
        {
            var y = yKeyMargin + i*yStep;
            ctx.moveTo(xKeyMargin, y);
            ctx.lineTo(canvas.width - xKeyMargin, y);
            ctx.stroke();
        }

        // white keys
        for (x = xKeyMargin; x < canvas.width - xKeyMargin; x += xKeyStep) 
        {
            ctx.beginPath();
            ctx.moveTo(x, yKeyMargin);
            ctx.lineTo(x, canvas.height - yKeyMargin);
            ctx.stroke();
            ctx.closePath();
        }

        // black keys
        var indexBlackKeys = [1, 2, 4, 5, 6];
        var index = 0;
        for (x = xKeyMargin + xKeyStep; x < canvas.width - xKeyMargin; x += xKeyStep) 
        {
            index++;
            if (!indexBlackKeys.includes(index % 7))
                continue;

            ctx.beginPath();
            ctx.fillRect(x - 0.5*wFactorBlackKey*xKeyStep, yKeyMargin, wFactorBlackKey*xKeyStep, hFactorBlackKey*(canvas.height - 2*yKeyMargin));
            ctx.closePath();
        }
    }

    // display notes
    var scaleNotesValues = getScaleNotesValues(noteValue, scaleValues);
    for (i = 3; i <= 3 + 4*12; i++)
    {
        var currentNoteValue = (i % 12);
        if (!scaleNotesValues.includes(currentNoteValue))
            continue;

        // display note
        
        var currentNote = notesDict[currentNoteValue];

        var colorNote = colorNoteNormal;
        if (currentNoteValue == noteValue)
            colorNote = colorNoteTonic;

        var indexNote = scaleNotesValues.indexOf(currentNoteValue);
        if (charIntervals != null && charIntervals.includes(indexNote))
            colorNote = colorNoteChar; // characteristic note

        displayNoteOnKeyboard(i, currentNote, colorNote);
    }
}