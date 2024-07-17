"use strict";

////////////////////////////////? Setting Global Variables ?////////////////////////////////

let totalHTML = ``;

let chartCalled = false;

////////////////////////////////! Setting Customers Arrays For Filtering !////////////////////////////////

let customersArrayID = [];
let customersArrayAmount = [];

////////////////////////////////? Chart Logic ?////////////////////////////////

let chart = "";

////////////////////////////////! Chart Options !////////////////////////////////
const options = {
  chart: {
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
    height: "50%",
    type: "bar",
    background: "#f4f4f4",
    foreColor: "#000",
  },
  series: [
    {
      name: "Transactions",
      data: [],
    },
  ],
  xaxis: {
    categories: ["2022-01-01", "2022-01-02"],
  },
  title: {
    text: "Transactions Per Day",
    align: "center",
    margin: 20,
    offsetY: 20,
    style: {
      fontSize: "20px",
      fontFamily: 'Cambria, Cochin, Georgia, Times, "Times New Roman", serif',
    },
  },
};

////////////////////////////////! Opening Chart !////////////////////////////////
function showGraph(id) {
  customersArrayID.forEach((c) => {
    if (c.id == id) c.showGraph();
  });
}

////////////////////////////////! Closing Chart !////////////////////////////////

function hideChart() {
  chart.destroy();
  chart = "";
  $("body").css("overflow", "visible");
  options.series[0].data = [];
  $("#overlay").addClass("d-none");
}

$(document).keydown(function (e) {
  if (e.key === "Escape") hideChart();
});

$(".btn-close").click(function () {
  hideChart();
});

////////////////////////////////? Declaring The Customers Class ?////////////////////////////////

class Customer {
  constructor(id, name, transactions = [], dates = []) {
    this.id = id;
    this.name = name;
    this.transactions = transactions;
    this.dates = dates;
  }

  calcTransactions = function () {
    let temp = 0;
    for (let i = 0; i < this.transactions.length; i++) {
      temp += this.transactions[i];
    }
    return temp;
  };

  makeTransactionsHTML() {
    let temp = ``;
    this.transactions.forEach((e, i) => {
      temp += `<li><a class="dropdown-item text-white">${e}$ at ${this.dates[i]}</a></li>`;
    });
    return temp;
  }

  makeHTML = function () {
    return `
        <tr>
            <td class="w-25">#${this.id}</td>
            <td class="w-25">${this.name}</td>
            <td class="w-25">
              <div class="btn-group">
                <button type="button" class="btn btn-success">${this.calcTransactions()}</button>
                <button
                  type="button"
                  class="btn btn-success dropdown-toggle dropdown-toggle-split"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span class="visually-hidden">Toggle Dropdown</span>
                </button>
                <ul class="dropdown-menu bg-success ">
                  ${this.makeTransactionsHTML()}
                </ul>
              </div>
            </td>
            <td class="w-25">
              <button class="btn btn-warning" onclick="showGraph(${
                this.id
              })">Show graph</button>
            </td>
          </tr>
    `;
  };

  getChartData = function () {
    let arr = [0, 0];
    this.dates.forEach((d) => {
      if (d === "2022-01-01") arr[0]++;
      if (d === "2022-01-02") arr[1]++;
    });
    return arr;
  };

  showGraph = function () {
    $("body").css("overflow", "hidden");
    $("#overlay").removeClass("d-none");
    options.series[0].data = this.getChartData();
    chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
  };
}

////////////////////////////////? Getting Data From Local Server ?////////////////////////////////

let customersData, transactionsData;

fetch("http://localhost:3000/customers")
  .then((res) => res.json())
  .then((data) => (customersData = data))
  .then(() => {
    fetch("http://localhost:3000/transactions")
      .then((res) => res.json())
      .then((data) => (transactionsData = data))
      .then(() => {
        console.log(customersData, transactionsData);
        customersData.forEach((ele) => {
          let tempD = [];
          let tempT = [];
          transactionsData.forEach((transaction) => {
            if (transaction.customer_id == ele.id) {
              tempT.push(transaction.amount);
              tempD.push(transaction.date);
            }
          });
          customersArrayID.push(new Customer(ele.id, ele.name, tempT, tempD));
          customersArrayAmount.push(
            new Customer(ele.id, ele.name, tempT, tempD)
          );
        });
        customersArrayAmount.sort(
          (a, b) => a.calcTransactions() - b.calcTransactions()
        );
      })
      .then(() => {
        idFilter();
      });
  });

////////////////////////////////? Setting Up The Data ?////////////////////////////////

////////////////////////////////! Customers Array By ID !////////////////////////////////

////////////////////////////////! Customers Array By Transactions Amount !////////////////////////////////

////////////////////////////////? Setting Up Filters ?////////////////////////////////

function idFilter() {
  totalHTML = ``;
  customersArrayID.forEach((customer) => {
    totalHTML += customer.makeHTML();
  });

  $("#data-display").html(totalHTML);
}

function transactionsFilter() {
  totalHTML = ``;
  customersArrayAmount.forEach((customer) => {
    totalHTML += customer.makeHTML();
  });

  $("#data-display").html(totalHTML);
}

////////////////////////////////? Rendering Data ?////////////////////////////////
