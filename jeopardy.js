

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",h
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
const API_URL = "https://jservice.io/api/"; // Decided to make this a constant so I wouldn't have to remember the url
const NUM_CATEGORIES = 6; 
const NUM_CLUES_PER_CAT = 5;
let loader = document.getElementById("spin-container");



// The await keyword in this async function pauses the execution and waits for a resolved promise before it continues 
// * Important for APIs as we need to return a response (would that be considered a promise?)
// What exactly is a promise?
async function getCategoryIds() {
  // Make a GET request with axios to the API and grab 100 categories 
  let response = await axios.get(`${API_URL}categories?count=100`);
  // Creates an array of values by running each element in collection thru iteratee. The iteratee is invoked with three arguments: (value, index|key, collection).
  let catIds = response.data.map(cat => cat.id); 
  // Return randomized IDs limited to choosing 6 
  return _.sampleSize(catIds, NUM_CATEGORIES);
}

async function getCategory(catId) {
    // Make a GET request with axios to get data back based on the ids that were selected randomly
  let response = await axios.get(`${API_URL}category?id=${catId}`);
  let catdata = response.data;
  let allClues = catdata.clues;
  // Randomize the clues from the array and only select 5 
  let randomClues = _.sampleSize(allClues, NUM_CLUES_PER_CAT);
  // Creates a new array that contains the question and answers for each clue, null means that the user cannot see it 
  let clues = randomClues.map(clue => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  // Returns the title and the clues array
  return { title: catdata.title, clues }; 
}


async function fillTable() {
  // Add row with headers for categories
  $("#jeopardy thead").empty(); // The empty() method removes all child nodes and content from the selected elements.
  let $tr = $("<tr>");
  for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
    $tr.append($("<th>").text(categories[catIdx].title));
  }
  $("#jeopardy thead").append($tr);

  // Add rows with questions for each category
  $("#jeopardy tbody").empty();
  for (let clueIdx = 0; clueIdx < NUM_CLUES_PER_CAT; clueIdx++) {
    let $tr = $("<tr>");
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
    }
    $("#jeopardy tbody").append($tr);
  }
}   
    
function handleClick(evt) {
  let id = evt.target.id;
  let [catId, clueId] = id.split("-"); // Splits string by separator
  let clue = categories[catId].clues[clueId];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    // already showing answer; ignore
    return
  }

  // Update text of cell
  $(`#${catId}-${clueId}`).html(msg);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let catIds = await getCategoryIds();

  categories = [];

  for (let catId of catIds) {
    categories.push(await getCategory(catId));
  }
  fillTable();
}

/** On click of restart button, restart game. */

$("#restart").on("click", setupAndStart);

/** On page load, setup and start & add event handler for clicking clues */

$(async function () {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick);
  }
);

