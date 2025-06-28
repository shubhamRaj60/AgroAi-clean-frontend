// Create Chart Utility Function
function createLineChart(ctx, label, borderColor, backgroundColor, yMax) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label,
        data: [],
        borderColor,
        backgroundColor,
        tension: 0.4,
        pointRadius: 3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: context => `${label}: ${context.parsed.y}`
          }
        },
        legend: {
          display: true,
          labels: {
            font: {
              weight: 'bold'
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Time' }
        },
        y: {
          min: 0,
          max: yMax,
          title: { display: true, text: label }
        }
      }
    }
  });
}

// Initialize Charts
const moistureChart = createLineChart(
  document.getElementById('moistureChart').getContext('2d'),
  'Soil Moisture (%)',
  'green',
  'rgba(39, 174, 96, 0.2)',
  100
);

const tempChart = createLineChart(
  document.getElementById('temperatureChart').getContext('2d'),
  'Temperature (°C)',
  'red',
  'rgba(231, 76, 60, 0.2)',
  50
);

const tdsChart = createLineChart(
  document.getElementById('tdsChart').getContext('2d'),
  'TDS (ppm)',
  'blue',
  'rgba(52, 152, 219, 0.2)',
  2000
);

// User-selected limit (dropdown)
let maxEntries = 10;
const rangeSelector = document.getElementById('dataRange');
if (rangeSelector) {
  maxEntries = parseInt(rangeSelector.value);
  rangeSelector.addEventListener('change', () => {
    maxEntries = parseInt(rangeSelector.value);
  });
}

// Utility to update chart with limit
function updateChart(chart, value) {
  const timeLabel = new Date().toLocaleTimeString();
  if (chart.data.labels.length >= maxEntries) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.data.labels.push(timeLabel);
  chart.data.datasets[0].data.push(value);
  chart.update();
}

// Firebase Initialization (already initialized in firebase-config.js)
const db = firebase.database();

// Real-time Listeners
db.ref('/AgroAI/Moisture').on('value', snapshot => {
  const val = snapshot.val();
  if (!isNaN(val)) updateChart(moistureChart, val);
});

db.ref('/AgroAI/Temperature').on('value', snapshot => {
  const val = snapshot.val();
  if (!isNaN(val)) updateChart(tempChart, val);
});

db.ref('/AgroAI/TDS').on('value', snapshot => {
  const val = snapshot.val();
  if (!isNaN(val)) updateChart(tdsChart, val);
});
