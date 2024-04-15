// before the jspsych bootstrapping loads
const phase_to_prepend = document.getElementById("loggingphase");
const currentloggingphase = phase_to_prepend.innerText;
// console.log(`${currentloggingphase}`)

import { initJsPsych } from 'jspsych';
import 'jspsych/css/jspsych.css';
import './styles/grid.css';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import 'ndarray';
import 'ndarray-ops';
import fullscreen from '@jspsych/plugin-fullscreen';
import pipe from '@jspsych-contrib/plugin-pipe';
import gaussian from 'gaussian'; 
import PreloadPlugin from '@jspsych/plugin-preload';

// globals 
let imageLocations = [];
let isMask = false;
let speedcondition = [];
let correctJudgement = '';
let loadedImagesCount = 0;
let isPractice = true;
let stimulusDuration = 500;
let backmaskDuration = 150;
let numofBreaks = 1;
let currentBlockDef = [];
let feedback = '';
let target_location = 0;
let blockorder = [];
let practicelocation = 0;
let pressedornot = false;
let alreadyAnswered = false;
let experimental_trajectory = [];
const expID = '0H7uXi1usSH4';

//!! MASK DRAWING MATH !!
// shuffler
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generatenewID(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newid = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newid += charset[randomIndex];
    }
    return newid;
  }

// generate the masks as arrays with a gaussian distribution
function generateNoiseMasks(width, height) {
    var image = new Array(height).fill(null).map(() => new Array(width).fill(0));
    // new greyscale image array
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            image[y][x] = Math.floor(Math.random() * 256); // random value between 0 and 255 (since rgb values have a max of 255!)
        }
    }
    // distribution parameters
    let distribution = gaussian(0, 30); // we will play around with this 
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let noise = Math.round(distribution.ppf(Math.random())); // generates the dist
            image[y][x] = Math.max(0, Math.min(255, image[y][x] + noise));
        }
    }
    return image;
}

// function to draw the images + return URLS to canvas to populate the experimental array
function randommaskUrl(image) {
  const width = image[0].length;
  const height = image.length;
  // makes a canvas element to display the mask
  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  // now draw the image
  let imageData = context.createImageData(width, height);
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
  return canvas.toDataURL('image/png');
}

// !! MASK RENDER SETTINGS !! 
const maskImages = [];
const width = 338;
const height = 210;

// ergo, masks are truly random every time! no silly tricks.
for (let i = 0; i < 26; i++) {
    const noisyGreyscaleImage = generateNoiseMasks(width, height);
    const RenderedMasks = randommaskUrl(noisyGreyscaleImage);
    maskImages.push(RenderedMasks);
}

// !! JSPSYCH INITIALIZE (we rely on inherited methods so we do it early.) !!
const jsPsych = initJsPsych({
    on_finish: function() {
    }
});

// "yo but i got a fake id doe" ~ j-kwon in the 2000's rap song 'Tipsy':
const fakeid = generatenewID(10);
let prolificID = jsPsych.data.getURLVariable('PROLIFIC_PID');
let studyID = jsPsych.data.getURLVariable('STUDY_ID');
let sessionID = jsPsych.data.getURLVariable('SESSION_ID');

jsPsych.data.addProperties({unique_identifier: fakeid, subject_id: prolificID, study_id: studyID, session_id: sessionID});

// !! MAIN EXPERIMENT HELPERS !!
// main randomizer function (that randomizes per-trial stuff)
function generateImagePaths(currentTrialType) {
    imageLocations = [];
    loadedImagesCount = 0;
    correctJudgement = judgements(currentTrialType);
    if (isMask === true) {
        for (let i = 0; i < 9; i++) {    
    // shuffle wuffle! (cute phrase, doesn't mean anything)
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

    // stimuli rng - practice phase of experiment
    if (isPractice == true) {
        const targetRngTigers = targetrngTigers();
        const targetRngKnife = targetrngKnife();
        const targetRngRulers = targetrngRulers();
        const targetRngBunnies = targetrngBunnies();
    
        switch (currentTrialType) {
            case 'Ontogenetic_Distractor_Threat_target':
                imageLocations.push(`img/Practice_Normal/knife_${targetRngKnife}.jpg`);
                for (let i = 0; i < 8; i++) {
                    let spoony = targetrngSpoons();
                    imageLocations.push(`img/Practice_Normal/Spoon_${spoony}.jpg`);
                }
                break;
            case 'Ontogenetic_Distractor_Nonthreat_target':
                imageLocations.push(`img/Practice_Normal/Ruler_${targetRngRulers}.jpg`);
                for (let i = 0; i < 8; i++) {
                    let spoony = targetrngSpoons();
                    imageLocations.push(`img/Practice_Normal/Spoon_${spoony}.jpg`);
                }
                break;
            case 'Phylogenetic_Distractor_Nonthreat_target':
                imageLocations.push(`img/Practice_Normal/Bunny_${targetRngBunnies}.jpg`);
                for (let i = 0; i < 8; i++) {
                    let kitten = targetrngKitten();
                    imageLocations.push(`img/Practice_Normal/kitten_${kitten}.jpg`);
                }
                break;
            case 'Phylogenetic_Distractor_Threat_target':
                imageLocations.push(`img/Practice_Normal/Tiger_${targetRngTigers}.jpg`);
                for (let i = 0; i < 8; i++) {
                    let kitten = targetrngKitten();
                    imageLocations.push(`img/Practice_Normal/kitten_${kitten}.jpg`);
                }
                break;
            case 'Ontogenetic_Distractor_notarget':
                for (let i = 0; i < 9; i++) {
                    let spoony = targetrngSpoons();
                    imageLocations.push(`img/Practice_Normal/Spoon_${spoony}.jpg`);
                }
                break;
            case 'Phylogenetic_Distractor_notarget':
                for (let i = 0; i < 9; i++) {
                    let kitten = targetrngKitten();
                    imageLocations.push(`img/Practice_Normal/kitten_${kitten}.jpg`);
                }
                break;
            default:
                console.error('Unknown trial type:', currentTrialType);
                break;
    }} else 
    { 
        // main experiment stimuli rng
        const randomDir = randomDirection();
        const targetRngBird = targetrngBird();
        const targetRngGun = targetrngGun();
        const targetRngPhone = targetrngPhone();
        const targetRngSpider = targetrngSpider();

        switch (currentTrialType) {
        case 'Ontogenetic_Distractor_Threat_target':
            imageLocations.push(`img/Guns_White_${randomDir}/Gun${targetRngGun}.jpg`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();        
                innerforscopeRNG();
                imageLocations.push(`img/Guns_White_${randomDir}/Stapler${distractorTrng}.jpg`);
            }
            break;
        case 'Ontogenetic_Distractor_Nonthreat_target':
            imageLocations.push(`img/Guns_White_${randomDir}/Phone${targetRngPhone}.jpg`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`img/Guns_White_${randomDir}/Stapler${distractorTrng}.jpg`);
            }
            break;
        case 'Phylogenetic_Distractor_Nonthreat_target':
            imageLocations.push(`img/Spiders_White_${randomDir}/b${targetRngBird}.jpg`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`img/Spiders_White_${randomDir}/bf${distractorTrng}.jpg`);
            }
            break;
        case 'Phylogenetic_Distractor_Threat_target':
            imageLocations.push(`img/Spiders_White_${randomDir}/s${targetRngSpider}.jpg`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`img/Spiders_White_${randomDir}/bf${distractorTrng}.jpg`);
            }
            break;
        case 'Ontogenetic_Distractor_notarget':
            for (let i = 0; i < 9; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`img/Guns_White_${randomDir}/Stapler${distractorTrng}.jpg`);
            }
            break;
        case 'Phylogenetic_Distractor_notarget':
            for (let i = 0; i < 9; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`img/Spiders_White_${randomDir}/bf${distractorTrng}.jpg`);
            }
            break;
        default:
            console.error('Unknown trial type:', currentTrialType);
            break;
    }
    }
    return imageLocations;
}}

// function that gives the paths for jsPsych to preload and download - you could probably abstract this further to cut down on verbosity even more.
function preloadImageLocations() {
    let valid_directions = ['Normal', 'Reverse'];
    let folder_prefixes = ['img/Guns_White_', 'img/Spiders_White_', 'img/Practice_'];
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

    imagestopreload.push('img/Prototypes/kitten2.png');
    imagestopreload.push('img/Prototypes/knife2.png');
    imagestopreload.push('img/Prototypes/KittenGrid_discrepants2.png');
    imagestopreload.push('img/Prototypes/KittenGrid_nodiscrepants2.png');

    return imagestopreload;
}

// generate the huge list in advance to call it later
const imagestopreload = preloadImageLocations();

// this is called later to randomize the location of the discrepant object in the grid
function randomizeTargetLocation() {
    const randomizeTargetLocation = jsPsych.randomization.randomInt(1, 9);
    return randomizeTargetLocation;
}

// determine which answers are right and wrong!
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
        correctJudgement = ' ';
        return correctJudgement;
    
    }}
// function that adds html divisors to the trial in the proper position  (try again git)
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

// function to quickly change all the images of the html elements when all 9 are loaded.
function setGridItemsBackgroundImages() {
    const gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach((gridItem, index) => {
            gridItem.style.backgroundImage = `url(${imageLocations[index]})`;
        });
}

// the main function responsible for the grid assembly
function assembleGrid() {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';
        let imageLocations = generateImagePaths(currentTrialType); // Initialize imageLocations here
        target_location = 0;
        target_location = randomizeTargetLocation();
    // vary grid off of trial type
        switch (currentTrialType) {
            case 'Ontogenetic_Distractor_Threat_target':
            case 'Ontogenetic_Distractor_Nonthreat_target':
            case 'Phylogenetic_Distractor_Threat_target':
            case 'Phylogenetic_Distractor_Nonthreat_target':
                const targetImage = imageLocations.splice(0, 1); // remove the first element
                imageLocations.splice(target_location - 1, 0, targetImage); // inject the target object back into array @ the location number we specified earlier (-1 because of zero indexing)
                break;
            case 'Ontogenetic_Distractor_notarget':
            case 'Phylogenetic_Distractor_notarget':
                break;
            default:
                console.error('Unknown trial type:', currentTrialType); // should never trigger
                break;
        }

        imageLocations.forEach((imageLocation) => {
            addGridItem(gridContainer, imageLocation);
        });
    
        gridContainer.addEventListener('gridReady', () => {
            setGridItemsBackgroundImages();
        });
    
        return target_location;
    }

// !! TRIAL // BLOCK PARAMETERS HERE !!
// ! block order (onto vs. phylo) helpers !
let blocktypes = {
    arrayNames: ['Ontogenetic', 'Phylogenetic'],
    arrayNums: [2, 2]
}

function setBlockOrder() {
    blockorder = jsPsych.randomization.repeat(blocktypes.arrayNames, blocktypes.arrayNums);
    return blockorder;
}

// set block order on startup
setBlockOrder();

// block-related tickers + location-keepers for experiment timeline
let currentBlock = blockorder[0]
let blockticker = 0;

function getNextBlock() {
    blockticker = (blockticker + 1) % blockorder.length;
    let nextBlock = blockorder[blockticker];
    currentBlock = nextBlock;
    return currentBlock;
}

// the valid types of trials for each block type
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

// call immediately on bootup (practice overrides so it doesn't matter but didn't want a callback since I can avoid)
getValidTrialTypes(currentBlock);

// !! WITHIN-BLOCK HELPERS !!
// ! Distribution of # of threats, # nonthreats, # of notargets per block !
let blocktrialArray = {
    arrayNames: currentBlockDef,
    arrayNums: [18, 18, 4]
};

let blocktrialArray_practice = {
    arrayNames: practiceBlockDef,
    arrayNums: [4, 4, 2, 4, 4, 2]
};


function updateBlocktrialArray() {
    currentBlockDef = blocktrialArray.arrayNames;
    return currentBlockDef;
}

// call on startup to set the first trial in place
updateBlocktrialArray();

// sets the trajectory of an experimental block (what the order is for each condition)
function setexperimentalTrajectory() { if (isPractice == true) {
    experimental_trajectory = jsPsych.randomization.repeat(blocktrialArray_practice.arrayNames, blocktrialArray_practice.arrayNums);
    return experimental_trajectory;
}
    else {
    experimental_trajectory = jsPsych.randomization.repeat(blocktrialArray.arrayNames, blocktrialArray.arrayNums);
    return experimental_trajectory;
}}

// call on startup to get the first group in place
setexperimentalTrajectory();

// trial-related tickers + location-keepers for experiment timeline
let ticker = 0;
let currentTrialType;

function getNextTrialType() {
    let nextTrialType = experimental_trajectory[ticker];
    ticker = (ticker + 1) % experimental_trajectory.length;
    currentTrialType = nextTrialType;
    return currentTrialType;
 }

// very silly logic check you could handle in the callback property of the jspsych method but i put it here.
function youPressSomething(data) {
    return data.response !== null;
}

// !! SPEED/TIME Manipulations !!
let speedconditionDef = ['800', '2500'];
let speedconditionArray = {
    arrayNames: speedconditionDef,
    arrayNums: [2, 2]
}
// names similar and functions to before
// i did this in an overcomplicated way so I could extend it later if need be - this function generates a random order for speed conditions and ensures each participant gets at least one of each type.
function setspeedCondition() {
    let speedcondition = jsPsych.randomization.repeat(speedconditionArray.arrayNames, speedconditionArray.arrayNums);
    let uniqueBlockTypes = [...new Set(blockorder)];
    let targetCount = Math.ceil(speedcondition.length / 2);
    let countMap = {};
    for (let blocktype of uniqueBlockTypes) {
        let blockIndices = Array.from(blockorder.keys()).filter((index) => blockorder[index] === blocktype);
        countMap[blocktype] = {};
        countMap[blocktype]['800'] = blockIndices.filter(index => speedcondition[index] === '800').length;
        countMap[blocktype]['2500'] = blockIndices.filter(index => speedcondition[index] === '2500').length;
    }

    for (let blocktype of uniqueBlockTypes) {
        let blockIndices = Array.from(blockorder.keys()).filter((index) => blockorder[index] === blocktype);
        for (let speed of ['800', '2500']) {
            let speedDifference = countMap[blocktype][speed] - targetCount;
            if (speedDifference < 0) {
                for (let i = 0; i < Math.abs(speedDifference); i++) {
                    let indexToAdd = blockIndices.find(index => speedcondition[index] !== speed);
                    if (indexToAdd !== undefined) {
                        speedcondition[indexToAdd] = speed;
                        countMap[blocktype][speed]++;
                    }
                }
            } else if (speedDifference > 0) {
                for (let i = 0; i < Math.abs(speedDifference); i++) {
                    let indexToRemove = blockIndices.find(index => speedcondition[index] === speed);
                    if (indexToRemove !== undefined) {
                        speedcondition[indexToRemove] = (speed === '800') ? '2500' : '800';
                        countMap[blocktype][speed]--;
                    }
                }
            }
        }
    }
    // debug
    // console.log(`blocktrialarray: ${blockorder}`);
    // console.log(`Final speedcondition array: ${speedcondition}`);
    return speedcondition;
}

speedcondition = setspeedCondition();

let currentSpeed = speedcondition[0]
let speedticker = 0;

function getNextSpeedCondition() {
    speedticker = (speedticker + 1) % blockorder.length;
    let nextSpeed = speedcondition[speedticker];
    currentSpeed = nextSpeed;
    return currentSpeed;
}

// grab the proper duration based off of speeed.
function getStimulusDuration() {
    if (isPractice == true) {
        // speeed up as it goooessss oooonnnnn
        stimulusDuration = 3000 - (100 * practicelocation);
        return stimulusDuration;
    } if (isPractice == false) {
        stimulusDuration = currentSpeed;
        return stimulusDuration;
        }
    }

// support subjects answering on either backmask or grid
function backmaskLength() {
if (alreadyAnswered == true) {
    backmaskDuration = 150;
} else {backmaskDuration = 5000;
}}

// !! EXPERIMENT TIMELINE + EVENTS BELOW !!
const timeline = [];
const preloader = {
type: PreloadPlugin,
auto_preload: true,
images: imagestopreload,
};

// inline css stuff for better looking prompts/
const prettystyletingz = 
    `
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond&display=swap');

    .garamond-text {
        font-family: "Cormorant Garamond", serif;
        font-size: 1.2em; 
        text-align: center;
        line-height: 1.5;
    }

    .garamond-feedback-text {
        font-family: "Cormorant Garamond", serif;
        font-size: 3em; 
        text-align: center;
        line-height: 1.5;
    }

    #centtrial-container {
        display: flex-inline;
        justify-content: center;
        align-items: center;
        padding: 1vw;
    }

    #centtrial-container p {
        font-size: 3em;
        margin: 0;
    }
</style>

`;

//timelineobjects
const instructions = {
        type: htmlKeyboardResponse,
        on_finish: function(data) {
        data.stimulus = 'instruction screen 0';} ,
        stimulus: function() { return `<!DOCTYPE html>
        <html lang="en">
        <head>
        ${prettystyletingz}
        </head>
        <body>
            <p class="garamond-text">Hello! This experiment will evaluate your ability to determine the type of objects in short periods of time.</p>
            <div id="centtrial-container">
                <p>+</p>
            </div>
            <p class="garamond-text">First, you will fixate your gaze in the center of the screen, using the point in the center of the screen, which is indicated by the above "fixation cross," as your reference. Press any key to continue.</p>
        </body>
        </html>        
                `},
        css_classes: ['garamond-text', 'centtrial-container']
};

const instructions1 = {
    type: htmlKeyboardResponse,
    on_finish: function(data) {data.stimulus = 'instruction screen 1';} ,
    stimulus: function() {return`
        <head>
        ${prettystyletingz}
        </head>
        <p class="garamond-text">You will then be shown a 3x3 grid of objects, similar to below, where one object differs in type from the rest.
        </p>
        <div id="centtrial-container">
        <img src = "img/Prototypes/KittenGrid_discrepants2.png">
        </div>
        <p class="garamond-text">After the grid disappears, your job is to make a determination as to the type of object that was different from the rest as quickly possible.</p>
        <p class="garamond-text">Press any key to continue.</p>
    `},
    css_classes: ['garamond-text', 'centtrial-container']
};


const instructions2 = {
    on_finish: function(data) {data.stimulus = 'instruction screen 2';} ,
    type: htmlKeyboardResponse,
    stimulus: function() { return`
    <head>
    ${prettystyletingz}
    </head>
    <p class="garamond-text">If the object that is different from the rest is "threatening" in character, like the example "knife" below, press the 'q' button on the keyboard.</p>
    <div id="centtrial-container">
    <img src="img/Prototypes/knife2.png">
    </div>
    <p class="garamond-text">Press the 'q' key to continue.</p>
    `},
    choices:["q"],
    css_classes: ['garamond-text', 'centtrial-container']

};

const instructions3 = {
    type: htmlKeyboardResponse,
    on_finish: function(data) {data.stimulus = 'instruction screen 3';},
    stimulus: function() {return `
    <head>
    ${prettystyletingz}
    </head>
    <p class="garamond-text">If the object that differs from the rest is "nonthreatening" in character, like the example "kitten" below, press the 'p' button on the keyboard.</p>
    <div id="centtrial-container">
    <img src = "img/Prototypes/kitten2.png">
    </div>
    <p class="garamond-text">Press the 'p' key to continue.</p>
    `},
    choices:["p"],
    css_classes: ['garamond-text', 'centtrial-container']

};

const instructions4 = {
    type: htmlKeyboardResponse,
    on_finish: function(data) {data.stimulus = 'instruction screen 4';} ,
    stimulus: function(){ return `
    <head>
    ${prettystyletingz}
    </head>
    <p class="garamond-text">If all the objects in the array are of the same type, like in the example grid below, press the spacebar.</p>
    <div id="centtrial-container">
    <img src = "img/Prototypes/KittenGrid_nodiscrepants2.png">
    </div>
    <p class="garamond-text">Press the spacebar to continue.</p>
    `},
    choices:[" "],
    css_classes: ['garamond-text', 'centtrial-container']
};

const instructions5 = {
    type: htmlKeyboardResponse,
    on_finish: function(data) {data.stimulus = 'instruction screen 5';},
    stimulus: function(){return `
    <head>
    ${prettystyletingz}
    </head>
    <p class="garamond-text">We will now commence a brief practice phase of 20 trials, where you will not be evaluated for performance.</p>
    <p class="garamond-text">Try to respond as quickly as you can!</p>
    <p class="garamond-text">Note that if you do not render a response within a five second window after the grid disappears, the experiment will continue to progress regardless.</p>
    <p class="garamond-text">The time of presentation for the grid will gradually decrease as the practice period progresses.</p>
    <p class="garamond-text">Press any key to continue.</p>
    `},
    css_classes: ['garamond-text', 'centtrial-container']
};

const preexperimentalinstructions = {
on_load: function() {
isPractice = false;
setexperimentalTrajectory();
    },
    type: htmlKeyboardResponse,
    stimulus: function(){return `
    <head>
    ${prettystyletingz}
    </head>
    <p class="garamond-text">We are now ready to begin the main experiment!</p>
    <p class="garamond-text">You will be given a break after completing a set of 40 trials in a row. </p>
    <p class="garamond-text">You will be given three breaks in total.</p>
    <p class="garamond-text">Note that the grid may be presented more quickly than in the practice trials.</p>
    <p class="garamond-text">When you are ready to begin, press any key to continue!</p>
    `},
    on_finish: function(data) {data.stimulus = 'pre-experimental_briefing';} ,
    post_trial_gap: 2000,
    css_classes: ['garamond-text', 'centtrial-container']
};

const experimental_grid = {
    type: htmlKeyboardResponse,
    on_load: function() {
        assembleGrid();
        isMask = true;
    }, 
    choices: ['q', 'p', ' '],
    stimulus: `
        <div id="grid-container">
        <!-- Grid items will be dynamically added here -->
    </div>    `, 
    stimulus_duration: function(){stimulusDuration; return stimulusDuration},
    trial_duration: function(){stimulusDuration; return stimulusDuration},
    response_ends_trial: true,
    on_finish: function(data) {
        pressedornot = youPressSomething(data);
        if (!pressedornot) {
            alreadyAnswered = false;
        } else {
            data.task = currentTrialType;
            data.time_manipulation = stimulusDuration;
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
            practicelocation = practicelocation + 1; // why didn't this work with iterable syntax? no idea.
            data.stimulus = 'image grid';
            jsPsych.data.get().json();
            alreadyAnswered = true;
        }
    backmaskLength();
    return backmaskDuration, alreadyAnswered;
    }
}
const backmask = {
    type: htmlKeyboardResponse,
    on_load: function() {
    assembleGrid();
    }, 
    choices: ['q', 'p', ' '],
    stimulus: `
    <div id="grid-container">
        <!-- Grid items will be dynamically added here -->
    </div>    `,
    response_ends_trial: function () {!alreadyAnswered; return !alreadyAnswered;},
    stimulus_duration: 150,
    trial_duration: function() {backmaskDuration; return backmaskDuration;},
    on_finish: function(data) { if (alreadyAnswered == true) {isMask = false;
} else {data.task = currentTrialType;
        data.respondedwhen = 'onmask';
        data.time_manipulation = stimulusDuration;
        data.rt = +data.rt + +stimulusDuration;
        data.correctresponse = correctJudgement;
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
                        pressedornot = youPressSomething(data);
                        if (!pressedornot) {
                        feedback = 'No input registered!';} else {                
                        feedback = 'Incorrect!';}
                } else {data.roundtype = 'experimental';}
            }
            data.stimulus = 'mask grid';
            practicelocation = practicelocation + 1; // it will be updated every trial (practice or not, but since it only matters in the first practice round, no need to wrap it with a conditional - also the iterable syntax didn't work lel)
                jsPsych.data.get().json();
                isMask = false;
    }},
        post_trial_gap: 200
    };

let enter_fullscreen = {
        type: fullscreen,
        fullscreen_mode: true,
}

const fixation = {
    type: htmlKeyboardResponse,
    stimulus: `<div>
    <p style="font-size: 3em;">+</p>
  </div>
`,
    stimulus_duration: 500,
    trial_duration: 500,
    response_ends_trial: false,
    on_start: function() {         
        getNextTrialType();
        stimulusDuration = getStimulusDuration();
        },
        on_finish: function(data) {data.stimulus = 'fixation cross';} ,
    };

const feedback_block = {
    type: htmlKeyboardResponse,
    stimulus: function() {
        return `    <head>
        ${prettystyletingz}
        </head>    
            <p class="garamond-feedback-text">${feedback}</p>
        `},
    stimulus_duration: 1000,
    trial_duration: 1000,
    on_finish: function(data) {data.stimulus = 'feedback screen';},
    response_ends_trial: true,
};

const debrief_block = {
    type: htmlKeyboardResponse,
    on_start: function () {
    // jsPsych.data.get().localSave('csv', `data__${fakeid}.csv`);
    },
    stimulus: function() {
        var trials = jsPsych.data.get().filter({roundtype: 'experimental'});
        var correct_trials = trials.filter({correct: true});
        var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        var rt = Math.round(correct_trials.select('rt').mean());

        return `
        <head>
        ${prettystyletingz}
        </head>
        <p class="garamond-text">Congratulations, you have successfully completed the experiment! You responded correctly on ${accuracy}% of the trials.</p>
                <p class="garamond-text>Your average response time, across all correct trials, was ${rt}ms.</p>
                <p class="garamond-text">Our study is designed to evaluate the temporal factor in the difference between a person’s reactions to ontogenetic threats (man-made objects such as a gun) and phylogenetic threats (found in nature, such as a spider).</p>
                <p class="garamond-text">Thank you for your participation! You may close this window, pressing any key to finish the experiment.</p>`;
        },
        css_classes: ['garamond-text', 'centtrial-container']
    };

const test_procedure = {
    timeline: [fixation, experimental_grid, backmask],
    randomize_order: false,
    repetitions: 40,
}

const takeabreak = {
    type: htmlKeyboardResponse,
    on_load: function() {
        numofBreaks = numofBreaks + 1;
        ticker = 0;
        },
    stimulus: function() {return `
    <head>
    ${prettystyletingz}
    </head>    
            <p class= "garamond-text">You have just completed block ${numofBreaks}!</p>
            <p class="garamond-text">Take a short break, and when you feel ready, press any key to continue to the next block of trials.</p>
            <div style='width: 100px;'>
            </div>
        `},
        on_finish: function(data) {data.stimulus = 'break screen';
        currentBlock = getNextBlock();
        currentSpeed = getNextSpeedCondition();
        stimulusDuration = getStimulusDuration();
        currentBlockDef = getValidTrialTypes(currentBlock);
        blocktrialArray.arrayNames = currentBlockDef;
        experimental_trajectory = setexperimentalTrajectory();},
    post_trial_gap: 2000,
    css_classes: ['garamond-text', 'centtrial-container']
};

const teleporttomoney = {
    type: htmlKeyboardResponse,
    on_load: function() {
        window.location = "https://app.prolific.co/submissions/complete?cc=C744ZSTR"
        },
    stimulus: function() {return ``},
        on_finish: function(data) {data.stimulus = 'end';},
};

const practice_phase = {
        timeline: [fixation, experimental_grid, backmask, feedback_block],
        randomize_order: true,
        repetitions: 20,
};

const save_data = {
    type: pipe,
    action: "save",
    experiment_id: expID,
    filename: `${currentloggingphase}_data_${fakeid}.csv`,
    data_string: ()=>jsPsych.data.get().csv()
  };

timeline.push(enter_fullscreen);
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
timeline.push(save_data);
timeline.push(debrief_block);
timeline.push(teleporttomoney);

jsPsych.run(timeline);
