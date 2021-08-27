var data = [];
var matrixData;

var barChart;
var pieChart;

$(document).ready(function () {
   // Hides pie chart and buttons at start.
   $("#piecontainer").hide();
   $("#piebuttons").hide();

   // Sets up switch event listener.
   $("#switch").click(function () {
      changeDisplay();
   });

   // Changing radio button also updates chart.
   $("input[type='radio']").click(function () {
      createPieChart(data);
   });

   // Adds event listener and checks at least one box is always checked.
   $(".funds").click(function () {
      let checkboxfunds = $(".funds:checkbox:checked").length;

      if (!checkboxfunds) {
         alert("At least one fund must be checked.");
         return false;
      } else {
         createPieChart(data);
         createBarChart(data);
      }
   });

   // Adds event listener and checks at least one box is always checked.
   $(".ifa").click(function () {
      let IFAchecks = $(".ifa:checkbox:checked").length;

      if (!IFAchecks) {
         alert("At least one IFA must be checked.");
         return false;
      } else {
         createBarChart(data);
      }
   });
});

// Toggles display of charts and buttons.
function changeDisplay() {
   $("#barbuttons").toggle();
   $("#barcontainer").toggle();
   $("#piebuttons").toggle();
   $("#piecontainer").toggle();

   // Updates image as svg won't load if parent hidden.
   createPieChart(data);
   createBarChart(data);
}

// Loads dev_data constant from dev_data.dat.
function getData() {
   data = dev_data;
   for (let a = 0; a < data.length; a++) {
      parsed = parseInt(data[a].sales);
      data[a].sales = parsed;
   }
   createBarChart(data);
   createPieChart(data);
}

getData();

// Filters for IFAs
function filterIFA(dataSet) {
   let IFAchecks = $(".ifa");
   let selectedIFAs = [];

   for (let i = 0; i < dataSet.length; i++) {
      for (let f = 0; f < IFAchecks.length; f++) {
         if (IFAchecks[f].checked) {
            if (dataSet[i].ifa == IFAchecks[f].value) {
               selectedIFAs.push(dataSet[i]);
            }
         }
      }
   }
   return selectedIFAs;
}

// Filters for funds and returns edited data.
function filterFunds(dataSet) {
   let fundChecks = $(".funds");
   let correctFunds = [];

   for (let i = 0; i < dataSet.length; i++) {
      for (let f = 0; f < fundChecks.length; f++) {
         if (fundChecks[f].checked) {
            if (dataSet[i].fund == fundChecks[f].value) {
               correctFunds.push(dataSet[i]);
            }
         }
      }
   }
   return correctFunds;
}

// Filters for year and returns data.
function filterYear(dataSet) {
   let radios = document.getElementsByClassName("lui-radiobutton__input");

   let selectedYears = [];

   for (let d = 0; d < radios.length; d++) {
      if (radios[d].checked) {
         for (let i = 0; i < dataSet.length; i++) {
            if (dataSet[i].year == radios[d].value) {
               selectedYears.push(dataSet[i]);
            }
         }
      }
   }

   return selectedYears;
}

// Sums sales values for each key then returns as correct format for picasso.js
function transformBarData(data) {
   let dict = {};
   for (let c = 0; c < data.length; c++) {
      if (!dict[data[c].year]) dict[data[c].year] = data[c].sales;
      else dict[data[c].year] += data[c].sales;
   }
   let transformed = [["year", "sales"]];
   for (var key in dict) {
      if (dict.hasOwnProperty(key)) {
         transformed.push([key, dict[key]]);
      }
   }

   return transformed;
}

// sums sales and returns correct format for pie chart.
function transformPieData(data) {
   let dict = {};
   for (let c = 0; c < data.length; c++) {
      if (!dict[data[c].ifa]) dict[data[c].ifa] = [data[c].year, data[c].sales];
      else dict[data[c].ifa][1] += data[c].sales;
   }

   let transformed = [["ifa", "year", "sales"]];
   for (var key in dict) {
      if (dict.hasOwnProperty(key)) {
         transformed.push([key, dict[key][0], dict[key][1]]);
      }
   }

   return transformed;
}

// Creates bar chart.
function createBarChart(chartData) {
   let filteredIFA = filterIFA(chartData);
   let filteredFunds = filterFunds(filteredIFA);
   let barData = transformBarData(filteredFunds);

   barChart = picasso.chart({
      element: document.querySelector("#barcontainer"),
      data: [
         {
            type: "matrix",
            data: barData,
         },
      ],
      settings: {
         scales: {
            y: {
               data: { field: "sales" },
               invert: true,
               include: [0],
            },
            c: {
               data: { field: "sales" },
               type: "color",
            },
            t: {
               data: { extract: { field: "year" } },
               padding: 0.3,
            },
         },
         components: [
            {
               type: "axis",
               dock: "left",
               scale: "y",
            },
            {
               type: "axis",
               dock: "bottom",
               scale: "t",
            },
            {
               key: "bars",
               type: "box",
               data: {
                  extract: {
                     field: "year",
                     props: {
                        start: 0,
                        end: { field: "sales" },
                     },
                  },
               },
               settings: {
                  major: { scale: "t" },
                  minor: { scale: "y" },
                  box: {
                     fill: { scale: "c", ref: "end" },
                  },
               },
            },
         ],
      },
   });
}

// Creates Pie chart.
function createPieChart(chartData) {
   let filteredFunds = filterFunds(chartData);
   let filteredYear = filterYear(filteredFunds);
   let pieData = transformPieData(filteredYear);

   pieChart = picasso.chart({
      element: document.querySelector("#piecontainer"),
      data: [
         {
            type: "matrix",
            data: pieData,
         },
      ],
      settings: {
         scales: {
            c: {
               data: { extract: { field: "ifa" } },
               type: "color",
            },
         },
         components: [
            {
               type: "legend-cat",
               scale: "c",
            },
            {
               key: "p",
               type: "pie",
               data: {
                  extract: {
                     field: "ifa",
                     props: {
                        num: { field: "sales" },
                     },
                  },
               },
               settings: {
                  slice: {
                     arc: { ref: "num" },
                     fill: { scale: "c" },
                     outerRadius: () => 0.9,
                     strokeWidth: 0,
                     stroke: 0,
                  },
               },
            },
         ],
      },
   });
}
