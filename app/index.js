import { initJsPsych } from 'jspsych';
import 'jspsych/css/jspsych.css';
import './styles/grid.css';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import 'ndarray';
import 'ndarray-ops';
import gaussian from 'gaussian'; 
import PreloadPlugin from '@jspsych/plugin-preload';

// globals 
let imageLocations = [];
let isMask = false;
let correctJudgement = '';
let loadedImagesCount = 0;
let isPractice = true;
let stimulusDuration = 3000;
let backmaskDuration = 150;
let numofBreaks = 1;
let currentBlockDef = [];
let feedback = '';
let blockorder = [];
let practicelocation = 0;
let pressedornot = false;
let alreadyAnswered = false;
let experimental_trajectory = [];

//!! MASK DRAWING MATH !!
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

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
  context.putImageData(imageData, 0, 50);
  // returns embedded
  return canvas.toDataURL('image/png');
}

// !! MASK RENDER SETTINGS !! 
const maskImages = [];
const width = 338;
const height = 210;
for (let i = 0; i < 50; i++) {
    const noisyGreyscaleImage = generateNoisyGreyscaleImage(width, height);
    const RenderedMasks = imageDataUrl(noisyGreyscaleImage);
    maskImages.push(RenderedMasks);
}

// !! JSPSYCH INITIALIZE !!
const jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.get().localSave('csv', 'results.csv');
    }
});

// !! MAIN EXPERIMENT HELPERS !!
function generateImagePaths(currentTrialType) {
    imageLocations = [];
    loadedImagesCount = 0;
    correctJudgement = judgements(currentTrialType);
    if (isMask === true) {
        for (let i = 0; i < 9; i++) {    
        // shuffle wuffle!
            shuffleArray(maskImages);
            imageLocations.push(maskImages.slice(0, 1));
            }
        return imageLocations;
    } else {
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
        const targetrngBird = jsPsych.randomization.randomInt(1, 30);
        return targetrngBird;
    }

    function targetrngGun() {
        const targetrngGun = jsPsych.randomization.randomInt(1, 40);
        return targetrngGun;
    }

    function targetrngPhone() {
        const targetrngPhone = jsPsych.randomization.randomInt(1, 30);
        return targetrngPhone;
    }

    function targetrngSpider() {
        const targetrngSpider = jsPsych.randomization.randomInt(1, 30);
        return targetrngSpider;
    }

    function targetrngKitten() {
        const targetrngKitten = jsPsych.randomization.randomInt(1, 42);
        return targetrngKitten;
    }

    function targetrngKnife() {
        const targetrngKnife = jsPsych.randomization.randomInt(1, 12);
        return targetrngKnife;
    }

    function targetrngRulers() {
        const targetrngRulers = jsPsych.randomization.randomInt(1, 12);
        return targetrngRulers;
    }

    function targetrngSpoons() {
        const targetrngSpoons = jsPsych.randomization.randomInt(1, 12);
        return targetrngSpoons;
    }

    function targetrngTigers() {
        const targetrngTigers = jsPsych.randomization.randomInt(1, 12);
        return targetrngTigers;
    }

    function targetrngBunnies() {
        const targetrngBunnies = jsPsych.randomization.randomInt(1, 12);
        return targetrngBunnies;
    }

    function innerforscopeRNG() {
        randomDirection();
        distractortrng();
    }

    // call them all/state them once (if outside switch scope)
    const randomDir = randomDirection();
    const targetRngBird = targetrngBird();
    const targetRngGun = targetrngGun();
    const targetRngPhone = targetrngPhone();
    const targetRngSpider = targetrngSpider();
    const targetRngTigers = targetrngTigers();
    const targetRngKnife = targetrngKnife();
    const targetRngRulers = targetrngRulers();
    const targetRngBunnies = targetrngBunnies();

    // switch and cases
    if (isPractice == true) {
        switch (currentTrialType) {
            case 'Ontogenetic_Distractor_Threat_target':
                imageLocations.push(`/img/Practice_Normal/knife_${targetRngKnife}.jpg`);
                for (let i = 0; i < 8; i++) {
                    let spoony = targetrngSpoons();
                    imageLocations.push(`/img/Practice_Normal/Spoon_${spoony}.jpg`);
                }
                break;
            case 'Ontogenetic_Distractor_Nonthreat_target':
                imageLocations.push(`/img/Practice_Normal/Ruler_${targetRngRulers}.jpg`);
                for (let i = 0; i < 8; i++) {
                    let spoony = targetrngSpoons();
                    imageLocations.push(`/img/Practice_Normal/Spoon_${spoony}.jpg`);
                }
                break;
            case 'Phylogenetic_Distractor_Nonthreat_target':
                imageLocations.push(`/img/Practice_Normal/Bunny_${targetRngBunnies}.jpg`);
                for (let i = 0; i < 8; i++) {
                    let kitten = targetrngKitten();
                    imageLocations.push(`/img/Practice_Normal/Kitten_${kitten}.jpg`);
                }
                break;
            case 'Phylogenetic_Distractor_Threat_target':
                imageLocations.push(`/img/Practice_Normal/tiger_${targetRngTigers}.jpg`);
                for (let i = 0; i < 8; i++) {
                    let kitten = targetrngKitten();
                    imageLocations.push(`/img/Practice_Normal/Kitten_${kitten}.jpg`);
                }
                break;
            case 'Ontogenetic_Distractor_notarget':
                for (let i = 0; i < 9; i++) {
                    let spoony = targetrngSpoons();
                    imageLocations.push(`/img/Practice_Normal/Spoon_${spoony}.jpg`);
                }
                break;
            case 'Phylogenetic_Distractor_notarget':
                for (let i = 0; i < 9; i++) {
                    let kitten = targetrngKitten();
                    imageLocations.push(`/img/Practice_Normal/Kitten_${kitten}.jpg`);
                }
                break;
            default:
                console.error('Unknown trial type:', currentTrialType);
                break;
    }} else 
    { switch (currentTrialType) {
        case 'Ontogenetic_Distractor_Threat_target':
            imageLocations.push(`/img/Guns_White_${randomDir}/Gun${targetRngGun}.jpg`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();        
                innerforscopeRNG();
                imageLocations.push(`/img/Guns_White_${randomDir}/Stapler${distractorTrng}.jpg`);
            }
            break;
        case 'Ontogenetic_Distractor_Nonthreat_target':
            imageLocations.push(`/img/Guns_White_${randomDir}/Phone${targetRngPhone}.jpg`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Guns_White_${randomDir}/Stapler${distractorTrng}.jpg`);
            }
            break;
        case 'Phylogenetic_Distractor_Nonthreat_target':
            imageLocations.push(`/img/Spiders_White_${randomDir}/b${targetRngBird}.jpg`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Spiders_White_${randomDir}/bf${distractorTrng}.jpg`);
            }
            break;
        case 'Phylogenetic_Distractor_Threat_target':
            imageLocations.push(`/img/Spiders_White_${randomDir}/s${targetRngSpider}.jpg`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Spiders_White_${randomDir}/bf${distractorTrng}.jpg`);
            }
            break;
        case 'Ontogenetic_Distractor_notarget':
            for (let i = 0; i < 9; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Guns_White_${randomDir}/Stapler${distractorTrng}.jpg`);
            }
            break;
        case 'Phylogenetic_Distractor_notarget':
            for (let i = 0; i < 9; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Spiders_White_${randomDir}/bf${distractorTrng}.jpg`);
            }
            break;
        default:
            console.error('Unknown trial type:', currentTrialType);
            break;
    }
    }
    return imageLocations;
}}

function preloadImageLocations() {
    let valid_directions = ['Normal', 'Reverse'];
    let folder_prefixes = ['/img/Guns_White_', 'img/Spiders_White_', 'img/Practice_'];
    let imagestopreload = [];

    for (let i = 1; i < 100; i++) {
        let valid_distractors = ['bf'];
        for (let distractor of valid_distractors) {
            let fullpath_distractor = `${folder_prefixes[1]}${valid_directions[0]}/${distractor}${i}.jpg`;
            imagestopreload.push(fullpath_distractor);
            let fullpath_distractor_reverse = `${folder_prefixes[1]}${valid_directions[1]}/${distractor}${i}.jpg`;
            imagestopreload.push(fullpath_distractor_reverse);
        }
    }

    for (let i = 1; i < 100; i++) {
        let valid_distractors = ['Stapler'];
        for (let distractor of valid_distractors) {
            let fullpath_distractor = `${folder_prefixes[0]}${valid_directions[0]}/${distractor}${i}.jpg`;
            imagestopreload.push(fullpath_distractor);
            let fullpath_distractor_reverse = `${folder_prefixes[0]}${valid_directions[1]}/${distractor}${i}.jpg`;
            imagestopreload.push(fullpath_distractor_reverse);
        }
    }

    for (let i = 1; i < 30; i++) {
        let valid_targets = ['s', 'b'];
        for (let target of valid_targets) {
            let targetpath = `${folder_prefixes[1]}${valid_directions[0]}/${target}${i}.jpg`;
            imagestopreload.push(targetpath);
            let targetpath_reverse = `${folder_prefixes[1]}${valid_directions[1]}/${target}${i}.jpg`;
            imagestopreload.push(targetpath_reverse);
        }
    }

    for (let i = 1; i < 31; i++) {
        let valid_targets = ['Phone'];
        for (let target of valid_targets) {
            let targetpath = `${folder_prefixes[0]}${valid_directions[0]}/${target}${i}.jpg`;
            imagestopreload.push(targetpath);
            let targetpath_reverse = `${folder_prefixes[0]}${valid_directions[1]}/${target}${i}.jpg`;
            imagestopreload.push(targetpath_reverse);
        }
    }

    for (let i = 1; i < 44; i++) {
        let valid_targets = ['kitten'];
        for (let target of valid_targets) {
            let targetpath = `${folder_prefixes[2]}Normal/${target}_${i}.jpg`;
            imagestopreload.push(targetpath);
        }
    }

    for (let i = 1; i < 13; i++) {
        let valid_targets = ['knife'];
        for (let target of valid_targets) {
            let targetpath = `${folder_prefixes[2]}Normal/${target}_${i}.jpg`;
            imagestopreload.push(targetpath);
        }
    }

    for (let i = 1; i < 30; i++) {
        let valid_targets = ['Bunny'];
        for (let target of valid_targets) {
            let targetpath = `${folder_prefixes[2]}Normal/${target}_${i}.jpg`;
            imagestopreload.push(targetpath);
        }
    }
    for (let i = 1; i < 20; i++) {
        let valid_targets = ['Ruler'];
        for (let target of valid_targets) {
            let targetpath = `${folder_prefixes[2]}Normal/${target}_${i}.jpg`;
            imagestopreload.push(targetpath);
        }
    }

    for (let i = 1; i < 33; i++) {
        let valid_targets = ['Spoon'];
        for (let target of valid_targets) {
            let targetpath = `${folder_prefixes[2]}Normal/${target}_${i}.jpg`;
            imagestopreload.push(targetpath);
        }
    }

    for (let i = 1; i < 15; i++) {
        let valid_targets = ['Tiger'];
        for (let target of valid_targets) {
            let targetpath = `${folder_prefixes[2]}Normal/${target}_${i}.jpg`;
            imagestopreload.push(targetpath);
        }
    }

    imagestopreload.push('/img/Prototypes/kitten.png')
    imagestopreload.push('/img/Prototypes/knife.png')


    return imagestopreload;
}

let imagestopreload = preloadImageLocations();
console.log(`preloaded array == ${imagestopreload}`);
let target_location = 0

function randomizeTargetLocation() {
    const randomizeTargetLocation = jsPsych.randomization.randomInt(1, 9);
    return randomizeTargetLocation;
}

function judgements(currentTrialType) {
    switch(currentTrialType) {
    case 'Ontogenetic_Distractor_Threat_target':
    case 'Phylogenetic_Distractor_Threat_target':
        correctJudgement = 'q';
        return correctJudgement;
    case 'Ontogenetic_Distractor_Nonthreat_target':
    case 'Phylogenetic_Distractor_Nonthreat_target':
        correctJudgement = 'p';
        return correctJudgement;
    case 'Ontogenetic_Distractor_notarget':
    case 'Phylogenetic_Distractor_notarget':
        correctJudgement = 'space';
        return correctJudgement;
    
    }}

    function addGridItem(gridContainer, imageLocation) {
        const gridReadyEvent = new Event('gridReady');
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridContainer.appendChild(gridItem); 
    
        const image = new Image();
        image.src = imageLocation;
        // add load event listener to each image
        image.addEventListener('load', () => {
            loadedImagesCount++;
            if (loadedImagesCount === 9) {
                gridContainer.dispatchEvent(gridReadyEvent);
            }
        });
    }
    
    function setGridItemsBackgroundImages() {
        const gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach((gridItem, index) => {
            gridItem.style.backgroundImage = `url(${imageLocations[index]})`;
        });
    }
    
    function assembleGrid() {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';
        let imageLocations = generateImagePaths(currentTrialType); // Initialize imageLocations here
        let target_location = 0;
    
        // switch statement for special cases
        switch (currentTrialType) {
            case 'Ontogenetic_Distractor_Threat_target':
            case 'Ontogenetic_Distractor_Nonthreat_target':
            case 'Phylogenetic_Distractor_Threat_target':
            case 'Phylogenetic_Distractor_Nonthreat_target':
                target_location = randomizeTargetLocation();
                const targetImage = imageLocations.splice(0, 1); // remove the first element
                imageLocations.splice(target_location - 1, 0, targetImage); // inject the target object back into array @ the location number we specified earlier (-1 because of zero indexing)
                console.log(`current trial type = ${currentTrialType}`);
                break;
            case 'Ontogenetic_Distractor_notarget':
            case 'Phylogenetic_Distractor_notarget':
                break;
            default:
                console.error('Unknown trial type:', currentTrialType); // should never trigger
                break;
        }

        imageLocations.forEach((imageLocation) => {
            console.log('foreach');
            addGridItem(gridContainer, imageLocation);
        });
    
        gridContainer.addEventListener('gridReady', () => {
            setGridItemsBackgroundImages();
        });
    
        return target_location;
    }

// !! TRIAL // BLOCK PARAMETERS HERE !!
let blocktypes = {
    arrayNames: ['Ontogenetic', 'Phylogenetic'],
    arrayNums: [2, 2]
}

// set the blockorder a priori - no funny bidness
function setBlockOrder() {
    blockorder = jsPsych.randomization.repeat(blocktypes.arrayNames, blocktypes.arrayNums);
    return blockorder;
}

setBlockOrder();

let currentBlock = blockorder[0]
// console.log(blockorder); // debug only
let blockticker = 0;

function getNextBlock() {
    blockticker = (blockticker + 1) % blockorder.length;
    let nextBlock = blockorder[blockticker];
    currentBlock = nextBlock;
    return nextBlock;
}

// console.log(`@start, the current block is: ${currentBlock}`)
function getValidTrialTypes(currentBlock) {
        switch(currentBlock) {
            case 'Ontogenetic':
                currentBlockDef = ['Ontogenetic_Distractor_Threat_target', 'Ontogenetic_Distractor_Nonthreat_target', 'Ontogenetic_Distractor_notarget'];
                return currentBlockDef;
            case 'Phylogenetic':
                currentBlockDef = ['Phylogenetic_Distractor_Threat_target', 'Phylogenetic_Distractor_Nonthreat_target', 'Phylogenetic_Distractor_notarget'];
                return currentBlockDef;
        }
    }
let practiceBlockDef = ['Ontogenetic_Distractor_Threat_target', 'Ontogenetic_Distractor_Nonthreat_target', 'Ontogenetic_Distractor_notarget', 'Phylogenetic_Distractor_Threat_target', 'Phylogenetic_Distractor_Nonthreat_target', 'Phylogenetic_Distractor_notarget']

// call immediately on bootup
getValidTrialTypes(currentBlock);

// !! SET Distribution of # of threats, # nonthreats, # of notargets BELOW !!
let blocktrialArray = {
    arrayNames: currentBlockDef,
    arrayNums: [20, 20, 2]
};

let blocktrialArray_practice = {
    arrayNames: practiceBlockDef,
    arrayNums: [4, 4, 2, 4, 4, 2]
};

function updateBlocktrialArray() {
    blocktrialArray.arrayNames = currentBlockDef;
}

// call on startup to set the first trial in place
updateBlocktrialArray();

function setexperimentalTrajectory() { if (isPractice == true) {
    experimental_trajectory = jsPsych.randomization.repeat(blocktrialArray_practice.arrayNames, blocktrialArray_practice.arrayNums);
    console.log(`the experimental_trajectory is ${experimental_trajectory}`)
    return experimental_trajectory;
}
    else {
    experimental_trajectory = jsPsych.randomization.repeat(blocktrialArray.arrayNames, blocktrialArray.arrayNums);
    console.log(`the experimental_trajectory is ${experimental_trajectory}`)
    return experimental_trajectory;
}}

setexperimentalTrajectory();

let ticker = 0;
let currentTrialType;

function getNextTrialType() {
    let nextTrialType = experimental_trajectory[ticker];
    ticker = (ticker + 1) % experimental_trajectory.length;
    currentTrialType = nextTrialType;
    console.log(`experimental_trajectory length:` + experimental_trajectory.length)
    return currentTrialType;
 }


function getStimulusDuration() {
    if (isPractice == true) {
        stimulusDuration = 3000 - (100 * practicelocation);
        return stimulusDuration;
    } else {
        stimulusDuration = 700;
        return stimulusDuration;
    }
}

function youPressSomething(data) {
    return data.response !== null;
}

function backmaskLength() {
if (alreadyAnswered == true) {
    backmaskDuration = 150;
} else {backmaskDuration = 2500;
}}


// !! EXPERIMENT TIMELINE + EVENTS BELOW !!
const timeline = [];
const preloader = {
type: PreloadPlugin,
auto_preload: true,
images: imagestopreload,
};

const instructions = {
        type: htmlKeyboardResponse,
        stimulus: `
        <p>Hello! This experiment will evaluate your ability to determine the type of objects in short periods of time.</p>
        <div id="centtrial-container" style="display: flex; justify-content: center; align-items: center; margin: 20vh 0;">
          <p style="font-size: 3em;">+</p>
        </div>
        <p>First, you will fixate your gaze in the center of the screen, using the point in the center of the screen, which is indicated by the above "fixation cross," as your reference. Press any key to continue.</p>
                `,
};

const instructions1 = {
    type: htmlKeyboardResponse,
    stimulus: `
        <p>You will then be shown a 3x3 grid of objects, similar to below, where one object differs in type from the rest.
        </p>

        <p>After the grid disappears, your job is to make a determination as to the type of object that was different from the rest as quickly possible.</p>
        <p>Press any key to continue.</p>
        <div style='width: 100px;'>
        </div>
    `,
};


const instructions2 = {
    type: htmlKeyboardResponse,
    stimulus: `
    <p>If the object that is different from the rest is "threatening" in character, like the exemplar "knife" below, press the 'q' button on the keyboard.</p>
    <div style="display: flex; justify-content: center;">
      <img src="/img/Prototypes/knife.png" style="max-width: 40%; height: auto;">
    </div>
    <p>Press the 'q' key to continue.</p>
    <div style="margin-top: calc(5vh + 20px);"></div>    
    `,
    choices:["q"],
};

const instructions3 = {
    type: htmlKeyboardResponse,
    stimulus: `
    <p>If the object that differs from the rest is "nonthreatening" in character, like the exemplar "kitten" below, press the 'p' button on the keyboard.</p>
    <img src = "/img/Prototypes/kitten.png"</img>
        <p>Press the 'p' key to continue.</p>
        <div style='width: 100px;'>
        </div>
    `,
    choices:["p"],
};

const instructions4 = {
    type: htmlKeyboardResponse,
    stimulus: `
    <p>If there are no discrepant objects in the array, much like in the example grid below, press the spacebar.</p>
        <p>Press the spacebar to continue.</p>
        <div style='width: 100px;'>
        </div>
    `,
    choices:[" "],
};

const instructions5 = {
    type: htmlKeyboardResponse,
    on_load: function(){
    console.log(`state of ispractice = ${isPractice}`);
    },
    stimulus: `
    <p>We will now commence a brief practice phase of 20 trials, where you will not be evaluated for performance.</p>
    <p>The time of presentation for the grid will gradually decrease as the practice period progresses.</p>
        <p>Press any key to continue.</p>
        <div style='width: 100px;'>
        </div>
    `,
};

const preexperimentalinstructions = {
on_load: function() {
isPractice = false;
setexperimentalTrajectory();
    },
    type: htmlKeyboardResponse,
    stimulus: `
    <p>We are now ready to begin the main experiment!</p>
    <p>Note that if you do not render a response within a two and a half second window after the grid disappears, the experiment will continue to progress regardless.</p>
    <p>You will be given a break after completing a set of 40 trials in a row. </p>
    <p>You will be given three breaks in total.</p>
    <p>Once all these sets have been completed, you will respond to a brief post-experimental questionnaire!</p>
    <p>When you are ready to begin, press any key to continue!</p>
        <div style='width: 100px;'>
        </div>
    `,
    post_trial_gap: 2000
};

// Q for J ---->
// we want, in const backmask to add the logged data.rt (if it exists) from experimental grid to the backmask data.rt if a subject doesn't respond within the earlier window -- is this possible to fetch or can it not be easily returned with current class membership?
// also it seems like the properties of the objects aren't updating depending on the state of global lets - tried wrapping in functions to return values of global lets alreadyanswered
// and backmaskduration but this didn't seem to work - do we have to write helpers externally for both that reference those globals instead?? or is there some other method that lets us work around this?

const experimental_grid = {
    type: htmlKeyboardResponse,
    on_load: function() {
        assembleGrid(currentTrialType);
        isMask = true;
    }, 
    choices: ['q', 'p', ' '],
    stimulus: `
        <div id="grid-container">
        <!-- Grid items will be dynamically added here -->
    </div>    `, 
    stimulus_duration: stimulusDuration,
    trial_duration: stimulusDuration,
    response_ends_trial: true,
    on_finish: function(data) {
        console.log(`the nature of the response: ${data.response}`);
        console.log(`currenttargetlocation = ${target_location}`);
        pressedornot = youPressSomething(data);
        if (!pressedornot) {
            console.log(`no key was pressed.`);
            alreadyAnswered = false;
        } else {
            console.log(`a key was pressed.`);
            data.task = currentTrialType;
            data.respondedwhen = 'ongrid';
            data.correctresponse = correctJudgement;
            data.targetimagelocation = target_location;
            data.blocktype = currentBlock;
            if (jsPsych.pluginAPI.compareKeys(data.response, correctJudgement)) {
                data.correct = true;
                if (isPractice) {
                    data.roundtype = 'practice';
                    feedback = 'Correct!';
                } else {
                data.roundtype = 'experimental';}
            } else {
                data.correct = false;
                if (isPractice) {
                    data.roundtype = 'practice';
                    feedback = 'Incorrect!';
                } else {
                data.roundtype = 'experimental';}
            }
            practicelocation = practicelocation + 1;
            data.stimulus = 'image grid';
            jsPsych.data.get().json();
            alreadyAnswered = true;
        }
    backmaskLength();
    console.log(`upcoming mask trial length ${backmaskDuration}`);
    return backmaskDuration, alreadyAnswered;
    }
}
const backmask = {
    type: htmlKeyboardResponse,
    on_load: function() {
    console.log(`already answered = ${alreadyAnswered}`);
    console.log(`this trial is supposed to last ${backmaskDuration} ms`);
    assembleGrid();
    }, 
    choices: ['q', 'p', ' '],
    stimulus: `
    <div id="grid-container">
        <!-- Grid items will be dynamically added here -->
    </div>    `,
    response_ends_trial: function () {!alreadyAnswered; return !alreadyAnswered},
    stimulus_duration: 150,
    trial_duration: function() {backmaskDuration; return backmaskDuration;},
    on_finish: function(data) { if (alreadyAnswered == true) {isMask = false} else {data.task = currentTrialType;
        data.respondedwhen = 'onmask';
        console.log(`pre-add = ${data.rt}`);
        data.rt = data.rt + stimulusDuration;
        console.log(`post-add = ${data.rt}`);
        data.correctresponse = correctJudgement;
        console.log(`currenttargetlocation = ${target_location}`);
        data.targetimagelocation = target_location;
        data.blocktype = currentBlock;
        if(jsPsych.pluginAPI.compareKeys(data.response, correctJudgement)) {
            data.correct = true;
            if (isPractice == true) {
                data.roundtype = 'practice';
                feedback = 'Correct!';
            } else {
            data.roundtype = 'experimental';}
                } else {
                    data.correct = false;
                    if (isPractice == true) {
                        data.roundtype = 'practice';
                        feedback = 'Incorrect!';
                } else {data.roundtype = 'experimental';}
            }
            data.stimulus = 'mask grid';
            practicelocation = practicelocation + 1; // it will be updated every trial (practice or not, but since it only matters in the first practice round, no need to wrap it with a conditional)
                jsPsych.data.get().json();
                isMask = false;
    }},
        post_trial_gap: 200
    };

const fixation = {
    type: htmlKeyboardResponse,
    stimulus: `<div id="centtrial-container" style="display: flex; justify-content: center; align-items: center; margin: 20vh 0;">
    <p style="font-size: 3em;">+</p>
  </div>
`,
    stimulus_duration: 500,
    trial_duration: 500,
    response_ends_trial: false,
    on_start: function() {         
        getNextTrialType();
        getStimulusDuration();
        console.log(`stimulus duration : ${stimulusDuration} & practicelocation = ${practicelocation}`);
        },
    };

const feedback_block = {
    type: htmlKeyboardResponse,
    stimulus: function() {
        return `
            <div>${feedback}</div>
        `},
    stimulus_duration: 1000,
    trial_duration: 1000,
    
    on_finish: function() {
        },
    response_ends_trial: true,
};

const debrief_block = {
    type: htmlKeyboardResponse,
    on_start: function () {
            jsPsych.data.get().localSave('csv', `results.csv`);
    },
    stimulus: function() {
        var trials = jsPsych.data.get().filter({roundtype: 'experimental'});
        var correct_trials = trials.filter({correct: true});
        var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        var rt = Math.round(correct_trials.select('rt').mean());

        return `<p>Congrats m9 - you responded correctly with ${accuracy}% of the trials.</p>
                <p>Your average response time was ${rt}ms.</p>
                <p>Drop us the .csv you get!</p>
                <p>Press any key to complete the experiment.</p>`;
        },
    };

const test_procedure = {
    timeline: [fixation, experimental_grid, backmask],
    randomize_order: false,
    repetitions: 42,
}

const takeabreak = {
    type: htmlKeyboardResponse,
    on_start: function() {
        numofBreaks = numofBreaks + 1;
        ticker = 0;
        getNextBlock();
        getValidTrialTypes();
        updateBlocktrialArray();
        setexperimentalTrajectory();
        },
    stimulus: function() {return `
            <p>"Whoa, catch your breath man, shake out those lips!"
            "It's downhill from here, just ${4 - numofBreaks} blocks more to go!"
            "Now it gets tricky, so listen REAL good!"
            </p>
            <div style='width: 100px;'>
            </div>
        `},
    post_trial_gap: 2000
};

const practice_phase = {
        timeline: [fixation, experimental_grid, backmask, feedback_block],
        randomize_order: true,
        repetitions: 20,
};

timeline.push(instructions);
timeline.push(preloader);
timeline.push(instructions1);
timeline.push(instructions2);
timeline.push(instructions3);
timeline.push(instructions4);
timeline.push(instructions5);
timeline.push(fixation);
timeline.push(practice_phase);
timeline.push(preexperimentalinstructions);
timeline.push(test_procedure);
timeline.push(takeabreak);
timeline.push(test_procedure);
timeline.push(takeabreak);
timeline.push(test_procedure);
timeline.push(takeabreak);
timeline.push(test_procedure);

timeline.push(debrief_block);

jsPsych.run(timeline);
