import { initJsPsych } from 'jspsych';
import 'jspsych/css/jspsych.css';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import JsPsychPreload from '@jspsych/plugin-preload';
import JsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response';
import 'ndarray';
import 'ndarray-ops';
import gaussian from 'gaussian'; 

const Ndarray = require('ndarray');
const ops = require('ndarray-ops');

function generateNoisyGreyscaleImage(width, height) {
    const image = new Array(height).fill(null).map(() => new Array(width).fill(0));

    // Generate greyscale image array
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            image[y][x] = Math.floor(Math.random() * 256); // Random value between 0 and 255
        }
    }

    // Add noise (Gaussian distribution)
    const distribution = gaussian(0, 30); // Adjust the standard deviation as needed
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const noise = Math.round(distribution.ppf(Math.random())); // Gaussian noise
            image[y][x] = Math.max(0, Math.min(255, image[y][x] + noise)); // Clip the values to 0-255 range
        }
    }

    return image;
}

function imageDataUrl(image) {
  const width = image[0].length;
  const height = image.length;

  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  // Draw the image onto the canvas
  const imageData = context.createImageData(width, height);
  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
          const value = image[y][x];
          // Set the color values for each pixel
          imageData.data[(y * width + x) * 4] = value; // Red channel
          imageData.data[(y * width + x) * 4 + 1] = value; // Green channel
          imageData.data[(y * width + x) * 4 + 2] = value; // Blue channel
          imageData.data[(y * width + x) * 4 + 3] = 255; // Alpha channel (fully opaque)
      }
  }
  context.putImageData(imageData, 0, 0);

  // Export the canvas content as a data URL
  return canvas.toDataURL('image/png');
}

// Example usage
const width = 400;
const height = 300;
const noisyGreyscaleImage = generateNoisyGreyscaleImage(width, height);
const imageUrl = imageDataUrl(noisyGreyscaleImage);

const jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.get().localSave('csv', 'results.csv');
    }
});

const timeline = [];

const welcome = {
    type: htmlKeyboardResponse,
    stimulus: "Welcome to the experiment. Press any key to continue!"
};

const instructions = {
    type: htmlKeyboardResponse,
    stimulus: `
        <p>In this experiment, a circle will appear in the center 
        of the screen.</p><p>If the circle is <strong>blue</strong>, 
        press the letter F on the keyboard as fast as you can.</p>
        <p>If the circle is <strong>orange</strong>, press the letter J 
        as fast as you can.</p>
        <div style='width: 100px;'>
        <div style='float: left;'><img src='${imageUrl}'></div>
        <div style='float: right;'><img src='${imageUrl}'></div>
        </div>
    `,
    post_trial_gap: 2000
};

const fixation = {
    type: JsPsychImageKeyboardResponse,
    stimulus: imageUrl,
    choices: ['f', 'j'],
    data: {
        task: 'response',
        correct_response: 'f' // Assuming this is the correct response
    },
    on_finish: function(data) {
        data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
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
    timeline: [fixation],
    randomize_order: true,
    repetitions: 1
};

timeline.push(welcome);
timeline.push(instructions);
timeline.push(test_procedure);
timeline.push(debrief_block);

jsPsych.run(timeline);
