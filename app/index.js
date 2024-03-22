import {initJsPsych} from 'jspsych';
import 'jspsych/css/jspsych.css';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

// start up the thing and make it scream at you when done
const jsPsych = initJsPsych({
  on_finish: function() {
    jsPsych.data.displayData();
    jsPsych.data.get().localSave('csv','results.csv');
  }
});


const timeline = [];


const loader = {
type: JsPsychPreload,
auto_preload: true,
show_progress_bar: true,
error_message: 'The experiment failed to load. Please refresh the page and try again!'}

const welcome = {
  type: htmlKeyboardResponse,
  stimulus: "Welcome to the experiment. Press any key to contin(u)e?!"
};

const instructions = {
  type: htmlKeyboardResponse,
  stimulus: `
    <p>In this experiment, a circle will appear in the center 
    of the screen.</p><p>If the circle is <strong>blue</strong>, 
    press the letter F on the keyboard as fast as you can.</p>
    <p>If the circle is <strong>orange</strong>, press the letter J 
    as fast as you can. By ORANGE we mean Yellow, the song by Coldplay.</p>
    <p>homie we ain't graphic designers you want us to like ensure the placement is chill by fiddlin with tha style? nah b. the youtube thumbnail for BLUE is big and the other one is small</p>
    <p>you will figure it out even if you can't see the lil one...</p>
    <div style='width: 100px;'>
    <div style='float: left;'><img src='img/blue.jpg'></img>
    <p class='small'><strong>Press the F key</strong></p></div>
    <div style='float: right;'><img src='img/yellow.jpg'></img>
    <p class='small'><strong>JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ</strong></p></div>
    </div>
    <p>Press any key to begin.</p>
  `,
  post_trial_gap: 2000
};


// uncomment it if you want it - we only use bespoke custom images at build time here
// const preload = {
  // type: jsPsychPreload,
  // images: ['img/blue.jpg', 'img/orange.jpg']
// };

var image_list = [
  { stimulus: "img/blue.jpg"},
  { stimulus: "img/yellow.jpg"}
]

const fixation = {
  type: htmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable('stimulus'),
  choices: ['f', 'j'],
  data: {
    task: 'response',
    correct_response: jsPsych.timelineVariable('correct_response')
  },
  on_finish: function(data){
    data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
  }
};

var debrief_block = {
  type: htmlKeyboardResponse,
  stimulus: function() {

    var trials = jsPsych.data.get().filter({task: 'response'});
    var correct_trials = trials.filter({correct: true});
    var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
    var rt = Math.round(correct_trials.select('rt').mean());

    return `<p>You responded correctly on ${accuracy}% of the trials.</p>
      <p>Your average response time was ${rt}ms.</p>
      <p>Press any key to complete the experiment.</p>`;

  }
};

var test = {
  type: jsPsychImageKeyboardResponse,
  stimulus: jsPsych.timelineVariable('stimulus'),
  choices: ['f', 'j'],
  data: {
    task: 'response',
    correct_response: jsPsych.timelineVariable('correct_response')
  }
}

var test_procedure = {
  timeline: [fixation, test],
  timeline_variables: test_stimuli
}

var test_procedure = {
  timeline: [fixation, test],
  timeline_variables: test_stimuli,
  randomize_order: true,
  repetitions: 5
};


// timeline.push(preload); lel we ain't doin that part b, BETTER images are in the folder already


timeline.push(welcome);
timeline.push(instructions);
timeline.push(test_procedure);
timeline.push(debrief_block);
jsPsych.run(loader, timeline)
