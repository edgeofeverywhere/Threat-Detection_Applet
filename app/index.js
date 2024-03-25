import { initJsPsych } from 'jspsych';
import 'jspsych/css/jspsych.css';
import './styles/grid.css';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import JsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response';
import 'ndarray';
import 'ndarray-ops';
import gaussian from 'gaussian'; 

const imageLocations = [];

// initialize first:
const jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.get().localSave('csv', 'results.csv');
    }
});

// !HELPERS BELOW!
function generateNoisyGreyscaleImage(width, height) {
    var image = new Array(height).fill(null).map(() => new Array(width).fill(0));

    // new greyscale image array
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            image[y][x] = Math.floor(Math.random() * 256); // random value between 0 and 255 (since rgb values have a max of 255!)
        }
    }

    // distribution parameters
    var distribution = gaussian(0, 30); // we will play around with this 
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            var noise = Math.round(distribution.ppf(Math.random())); // generates the dist
            image[y][x] = Math.max(0, Math.min(255, image[y][x] + noise));
        }
    }

    return image;
}

function imageDataUrl(image) {
  const width = image[0].length;
  const height = image.length;

  // makes a canvas element to display the mask
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  // now draw the image
  var imageData = context.createImageData(width, height);
  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
          const value = image[y][x];
          // set each image channel
          imageData.data[(y * width + x) * 4] = value; // Red channel
          imageData.data[(y * width + x) * 4 + 1] = value; // Green channel
          imageData.data[(y * width + x) * 4 + 2] = value; // Blue channel
          imageData.data[(y * width + x) * 4 + 3] = 255; // Alpha channel (opaque)
      }
  }
  context.putImageData(imageData, 0, 0);

  // return embedded
  return canvas.toDataURL('image/png');
}

// set this to the size of the mask as on the participants' screen - use same css
const width = 338;
const height = 254;

function generateImagePaths(currentTrialType) {
    
    function randomDirection() {
        const randomDirectionInt = jsPsych.randomization.randomInt(0, 1);
        const randomDirection = randomDirectionInt === 0 ? 'Normal' : 'Reverse';
        return randomDirection;
    }

    function distractortrng() {
        const distractortrng = jsPsych.randomization.randomInt(1, 100);
        return distractortrng;
    }

    function targetrngBird() {
        const targetrngBird = jsPsych.randomization.randomInt(1, 40);
        return targetrngBird;
    }

    function targetrngGun() {
        const targetrngGun = jsPsych.randomization.randomInt(1, 40);
        return targetrngGun;
    }

    function targetrngPhone() {
        const targetrngPhone = jsPsych.randomization.randomInt(1, 31);
        return targetrngPhone;
    }

    function targetrngSpider() {
        const targetrngSpider = jsPsych.randomization.randomInt(1, 30);
        return targetrngSpider;
    }

    function innerforscopeRNG() {
        randomDirection();
        distractortrng();
    }
    // call them all/state them once!
    const randomDir = randomDirection();
    const targetRngBird = targetrngBird();
    const targetRngGun = targetrngGun();
    const targetRngPhone = targetrngPhone();
    const targetRngSpider = targetrngSpider();

    // switch and cases
    switch (currentTrialType) {
        case 'Ontogenetic_Distractor_Threat_target':
            imageLocations.push(`/img/Guns_White_${randomDir}/Gun${targetRngGun}.bmp`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();        
                innerforscopeRNG();
                imageLocations.push(`/img/Guns_White_${randomDir}/Stapler${distractorTrng}.bmp`);
            }
            break;
        case 'Ontogenetic_Distractor_Nonthreat_target':
            imageLocations.push(`/img/Guns_White_${randomDir}/Phone${targetRngPhone}.bmp`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Guns_White_${randomDir}/Stapler${distractorTrng}.bmp`);
            }
            break;
        case 'Phylogenetic_Distractor_Nonthreat_target':
            imageLocations.push(`/img/Spiders_White_${randomDir}/b${targetRngBird}.bmp`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Spiders_White_${randomDir}/bf${distractorTrng}.bmp`);
            }
            break;
        case 'Phylogenetic_Distractor_Threat_target':
            imageLocations.push(`/img/Spiders_White_${randomDir}/s${targetRngSpider}.bmp`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Spiders_White_${randomDir}/bf${distractorTrng}.bmp`);
            }
            break;
        case 'Ontogenetic_Distractor_notarget':
            for (let i = 0; i < 9; i++) {
                let imageLocations;
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Guns_White_${randomDir}/Stapler${distractorTrng}.bmp`);
            }
            break;
        case 'Phylogenetic_Distractor_notarget':
            for (let i = 0; i < 9; i++) {
                let imageLocations;
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Spiders_White_${randomDir}/bf${distractorTrng}.bmp`);
            }
            break;
        default:
            console.error('Unknown trial type:', currentTrialType);
            break;
    }

    return imageLocations;
}

const target_location = 0

function randomizeTargetLocation() {
    const randomizeTargetLocation = jsPsych.randomization.randomInt(0, 9);
    return randomizeTargetLocation, target_location;
}

// SET NUMBER OF INSTANCES of each TYPE of Trial below
const trialTypeDefs = {
arrayNames: ['Ontogenetic_Distractor_Threat_target', 'Ontogenetic_Distractor_Nonthreat_target', 'Phylogenetic_Distractor_Nonthreat_target', 'Phylogenetic_Distractor_Threat_target','Ontogenetic_Distractor_notarget', 'Phylogenetic_Distractor_notarget'],
arrayNums: [25, 25, 25, 25, 5, 5]
}

const experimental_trajectory = jsPsych.randomization.repeat(trialTypeDefs.arrayNames, trialTypeDefs.arrayNums);
console.log(experimental_trajectory) // delete after testing

let ticker = 0;
let currentTrialType = experimental_trajectory[ticker];

function getNextTrialType() {
    const nextTrialType = experimental_trajectory[ticker];
    ticker = (ticker + 1) % experimental_trajectory.length;
    currentTrialType = nextTrialType;
}

// choose which types of images to get based off of the trial type
function assembleGridImageLocations(currentTrialType) {
    let target_location = 'N/A';

    // switchie
    switch (currentTrialType) {
        case 'Ontogenetic_Distractor_Threat_target':
        case 'Ontogenetic_Distractor_Nonthreat_target':
        case 'Phylogenetic_Distractor_Threat_target':
        case 'Phylogenetic_Distractor_Nonthreat_target':
            target_location = randomizeTargetLocation();
            let imageLocations = generateImagePaths(currentTrialType);
            
            // manipulate the array according to the randomized target location
            const targetImage = imageLocations.shift();
            imageLocations.splice(target_location - 1, 0, targetImage); // inject the target object back into array
            console.log(`your chosen pics are ${imageLocations}`); // debug only
            break;

        case 'Ontogenetic_Distractor_notarget':
        case 'Phylogenetic_Distractor_notarget':
            imageLocations = generateImagePaths(currentTrialType);
            console.log(`your chosen pics are ${imageLocations}`); // debug only 
            break;

        default:
            console.error('Unknown trial type:', currentTrialType); // should never trigger
            break;
    }
}
    function addGridItem(imageLocations) {
        const gridContainer = document.getElementById('grid-container');
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridItem.style.backgroundImage = `url(${imageLocations})`;
        gridItem.innerText = position; // debug only
        gridContainer.appendChild(gridItem);
        console.log(`added grid item ${imageLocations}`); // debug only
    }

    function assembleGridArray(imageLocations) {
        const gridContainer = document.getElementById('grid-container');
        console.log(`the contents of gridcontainer are: ${gridContainer}`) // debug only

        // get screen stuff
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const gridSize = Math.min(screenWidth, screenHeight);
        console.log(`we got ur screen size bb: ${screenWidth} x ${screenHeight}`) // debug only

        // set grid size
        gridContainer.style.width = `${gridSize}px`; // terminates here usually-- even when in DOM wrapper 
        gridContainer.style.height = `${gridSize}px`;

        // add grid items to the grid container using the provided imagePaths, ideally
        imageLocations.forEach((imageLocation, index) => {
            addGridItem(imageLocation, index + 1); // Adding 1 to index to start position from 1
        });
    }


    // !EXPERIMENT TIMELINE BELOW!

    const timeline = [];

    const instructions = {
        type: htmlKeyboardResponse,
        stimulus: `
            <p>ignore this text it's not signifying anything rn since we are still building.
            </p>
            <div style='width: 100px;'>
            </div>
        `,
        post_trial_gap: 2000
    };

    const experimental_grid = {
        type: htmlKeyboardResponse,
        on_start: function() {
            document.addEventListener('DOMContentLoaded', function() { // removing this listener means it terminates prematurely owing to the element being null, but the below functions don't ever activate at all if this is left intact 
            assembleGridImageLocations(currentTrialType); // recommend working some way to implement another listener or use existing to make this work
            assembleGridArray(imageLocations);
        })}, 
        choices: ['q', 'p', 'space'],
        stimulus: `
        <div id="grid-container">
        <!-- Grid items will be dynamically added here -->
    </div>    `,    // I defined this twice since neither on the stimulus or on the HTML did document.getElementID work properly.
        data: {
            task: currentTrialType,
            reaction_time: 'rt',
            target_location: target_location
        },
        post_trial_gap: 10
        // also add an on_finish property with a function that appends the "correct" response for a given a trial type to the .data object!!
    };

    // below is not a fixation or anything - we will rename this 
    // when the css implementation is finished and have an actual fixation cross
    const fixation = {
        type: JsPsychImageKeyboardResponse,
        stimulus: '',
        choices: ['q', 'p', 'space'],
        data: {
            task: 'response',
            correct_response: 'p' // vestigial - this does not apply here
        },
        on_start: function(trial) {
            getNextTrialType();
            console.log(`upcoming trial is ${currentTrialType}`); // debug only
            const noisyGreyscaleImage = generateNoisyGreyscaleImage(width, height);
            const imageUrl = imageDataUrl(noisyGreyscaleImage);
            trial.stimulus = imageUrl;
        },
        on_finish: function(data) {
            data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response); // vestigial - this does not apply here
        }
    };


    const debrief_block = {
        type: htmlKeyboardResponse,
        on_start: function () {
            jsPsych.data.get().localSave('csv', `results.csv`);
        },
        stimulus: function() {
            var trials = jsPsych.data.get().filter({task: 'response'});
            var correct_trials = trials.filter({correct: true});
            var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
            var rt = Math.round(correct_trials.select('rt').mean());

            return `<p>You responded correctly on ${accuracy}% of the trials.</p>
                <p>Your average response time was ${rt}ms.</p>
                <p>Press any key to complete the experiment.</p>`;
        },
    };

    const test_procedure = {
        timeline: [fixation, experimental_grid],
        randomize_order: true,
        repetitions: 15
    };

    timeline.push(instructions);
    timeline.push(test_procedure);
    timeline.push(debrief_block);

    jsPsych.run(timeline);
    ;